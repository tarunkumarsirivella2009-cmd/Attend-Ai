import React, { useState } from 'react';
import { 
  Camera, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  BookOpen, 
  ShieldCheck, 
  KeyRound, 
  Layers, 
  Calendar,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { CameraView } from '../components/CameraView';
import { 
  getCurrentUser, 
  getSessions, 
  getAttendance, 
  markAttendance 
} from '../services/storage';
import { AttendanceRecord, ClassSession } from '../types';

interface AttendanceVerificationPageProps {
  onNavigate: (tab: string) => void;
  onAttendanceSuccess?: () => void;
}

export const AttendanceVerificationPage: React.FC<AttendanceVerificationPageProps> = ({ 
  onNavigate, 
  onAttendanceSuccess 
}) => {
  const currentUser = getCurrentUser();
  const student = currentUser?.data;

  const sessions = getSessions();
  // Find currently active session matching student's section or default to first active
  const activeSession: ClassSession | undefined = sessions.find(s => s.is_active && s.section === (student?.section || 'A')) 
    || sessions.find(s => s.is_active) 
    || sessions[0];

  const attendanceRecords = getAttendance();
  const alreadyMarkedRecord = student && activeSession
    ? attendanceRecords.find(a => a.session_id === activeSession.id && a.student_id === student.id)
    : undefined;

  const [activeTab, setActiveTab] = useState<'camera' | 'otp'>('camera');
  const [showCamera, setShowCamera] = useState<boolean>(false);
  const [enteredOtp, setEnteredOtp] = useState<string>('');
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    record?: AttendanceRecord;
    confidence?: number;
  } | null>(null);

  if (!student) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500 text-sm">Please log in to verify and mark attendance.</p>
        <button
          onClick={() => onNavigate('student-login')}
          className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
        >
          Sign In
        </button>
      </div>
    );
  }

  // Handle successful camera capture & 1:1 facial verification
  const handleCameraCapture = (dataUrl: string, confidence: number) => {
    setShowCamera(false);

    if (!activeSession) {
      setResult({
        success: false,
        message: 'No active lecture session is currently open for attendance.'
      });
      return;
    }

    if (!student.is_enrolled) {
      setResult({
        success: false,
        message: 'You have not enrolled your facial biometric template. Please enroll first or use the session OTP alternative.'
      });
      return;
    }

    // Call attendance logic engine
    const markRes = markAttendance(activeSession.id, student.id, 'FACIAL_BIOMETRIC', confidence);
    setResult({
      success: markRes.success,
      message: markRes.message,
      record: markRes.record,
      confidence
    });

    if (markRes.success && onAttendanceSuccess) {
      onAttendanceSuccess();
    }
  };

  // Handle fallback OTP verification
  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSession) return;

    if (enteredOtp.trim() !== activeSession.fallback_otp) {
      setResult({
        success: false,
        message: 'Invalid session OTP code. Please check with your faculty in class.'
      });
      return;
    }

    const markRes = markAttendance(activeSession.id, student.id, 'OTP_FALLBACK');
    setResult({
      success: markRes.success,
      message: markRes.message,
      record: markRes.record
    });

    if (markRes.success && onAttendanceSuccess) {
      onAttendanceSuccess();
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-6">
      
      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Camera className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Live Attendance Verification</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Roll No: <span className="font-mono font-bold text-slate-700">{student.roll_number}</span> • {student.full_name}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {activeSession?.is_active ? (
              <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold animate-pulse">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span>Attendance Window OPEN</span>
              </div>
            ) : (
              <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold">
                <Clock className="h-3.5 w-3.5" />
                <span>Window Closed</span>
              </div>
            )}
          </div>
        </div>

        {/* Active Class Session Card */}
        {activeSession && (
          <div className="p-4 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-blue-400 text-xs font-bold font-mono">
                <BookOpen className="h-3.5 w-3.5" />
                <span>{activeSession.subject_code}</span>
                <span>• Section {activeSession.section}</span>
              </div>
              <h4 className="text-base font-bold text-white">{activeSession.subject_name}</h4>
              <p className="text-xs text-slate-400">Faculty: {activeSession.faculty_name}</p>
            </div>

            <div className="text-right sm:border-l sm:border-slate-800 sm:pl-6 text-xs">
              <div className="text-slate-400 text-[11px]">Today's Lecture Window</div>
              <div className="font-mono font-bold text-blue-300 mt-0.5">
                {activeSession.start_time} - {activeSession.end_time}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Date: {activeSession.session_date}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Already Recorded Notice */}
      {alreadyMarkedRecord && (
        <div className="p-5 rounded-3xl bg-emerald-50 border border-emerald-200 shadow-sm flex items-start space-x-4">
          <div className="p-2 rounded-2xl bg-emerald-100 text-emerald-700 mt-0.5">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div className="space-y-1 flex-1">
            <h4 className="font-bold text-emerald-900 text-sm">Attendance Already Recorded!</h4>
            <p className="text-xs text-emerald-800 leading-relaxed">
              Your presence for <strong>{alreadyMarkedRecord.subject_name}</strong> was confirmed at{' '}
              <span className="font-mono font-bold">{new Date(alreadyMarkedRecord.timestamp).toLocaleTimeString()}</span>{' '}
              via {alreadyMarkedRecord.verification_method}. Duplicate submissions are automatically blocked.
            </p>
          </div>
        </div>
      )}

      {/* Verification Result Display Card (Required by Prompt) */}
      {result && (
        <div className={`p-6 rounded-3xl border shadow-sm space-y-4 ${
          result.success ? 'bg-white border-emerald-300' : 'bg-red-50/60 border-red-200'
        }`}>
          <div className="flex items-center space-x-3">
            {result.success ? (
              <div className="p-2.5 rounded-2xl bg-emerald-500 text-white shadow-md shadow-emerald-500/20">
                <CheckCircle2 className="h-6 w-6" />
              </div>
            ) : (
              <div className="p-2.5 rounded-2xl bg-red-500 text-white shadow-md shadow-red-500/20">
                <AlertCircle className="h-6 w-6" />
              </div>
            )}
            <div>
              <div className={`text-base font-extrabold ${result.success ? 'text-emerald-700' : 'text-red-700'}`}>
                {result.success ? 'ATTENDANCE MARKED SUCCESSFULLY – PRESENT' : 'VERIFICATION FAILED'}
              </div>
              <p className="text-xs text-slate-600 mt-0.5">{result.message}</p>
            </div>
          </div>

          {result.success && result.record && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 text-xs">
              <div className="p-3 rounded-xl bg-slate-50">
                <div className="text-slate-400 text-[10px]">Student Name</div>
                <div className="font-bold text-slate-800 mt-0.5">{result.record.student_name}</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50">
                <div className="text-slate-400 text-[10px]">Roll Number</div>
                <div className="font-mono font-bold text-slate-800 mt-0.5">{result.record.roll_number}</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50">
                <div className="text-slate-400 text-[10px]">Subject</div>
                <div className="font-bold text-slate-800 mt-0.5">{result.record.subject_code}</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50">
                <div className="text-slate-400 text-[10px]">Recorded Time</div>
                <div className="font-mono font-bold text-slate-800 mt-0.5">
                  {new Date(result.record.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          )}

          {result.confidence && (
            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
              <span>Face Embedding Match Confidence</span>
              <span className="font-mono font-bold text-emerald-600">
                {(result.confidence * 100).toFixed(1)}% (Threshold: 70.0%)
              </span>
            </div>
          )}
        </div>
      )}

      {/* Verification Tabs & Controller */}
      {!alreadyMarkedRecord && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          
          {/* Method Selector Tabs */}
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-4">
            <button
              onClick={() => {
                setActiveTab('camera');
                setResult(null);
              }}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'camera'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              }`}
            >
              <Camera className="h-3.5 w-3.5" />
              <span>Camera Facial Verification (Recommended)</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('otp');
                setResult(null);
                setShowCamera(false);
              }}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'otp'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              }`}
            >
              <KeyRound className="h-3.5 w-3.5" />
              <span>Non-Biometric Session OTP Fallback</span>
            </button>
          </div>

          {/* Camera Flow */}
          {activeTab === 'camera' && (
            <div className="space-y-6">
              {!student.is_enrolled ? (
                <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-3">
                  <div className="flex items-center space-x-2 font-bold text-sm">
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                    <span>Facial Enrollment Required First</span>
                  </div>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    You have not yet enrolled your facial biometric template. Facial verification requires an enrolled mathematical template to perform 1:1 matching.
                  </p>
                  <button
                    onClick={() => onNavigate('student-enroll')}
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow transition"
                  >
                    Go to Voluntary Facial Enrollment
                  </button>
                </div>
              ) : showCamera ? (
                <CameraView
                  mode="verification"
                  onCapture={handleCameraCapture}
                  onCancel={() => setShowCamera(false)}
                  onFallbackOTP={() => setActiveTab('otp')}
                />
              ) : (
                <div className="text-center py-8 space-y-4">
                  <div className="h-16 w-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-inner">
                    <ShieldCheck className="h-8 w-8" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-slate-900 text-base">Ready for Face Verification</h3>
                    <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                      Click the button below to turn on the camera, verify liveness, and mark attendance for <strong>{activeSession?.subject_name}</strong>.
                    </p>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => setShowCamera(true)}
                      className="px-8 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition transform hover:-translate-y-0.5"
                    >
                      Start Attendance Verification
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* OTP Fallback Flow */}
          {activeTab === 'otp' && (
            <div className="space-y-4 max-w-md mx-auto py-4">
              <div className="text-center space-y-1">
                <h4 className="font-bold text-slate-900 text-sm">Enter 6-Digit Class Session OTP</h4>
                <p className="text-xs text-slate-500">
                  Provided by your lecture faculty on the classroom board for students without camera access.
                </p>
              </div>

              <form onSubmit={handleOtpSubmit} className="space-y-4">
                <div>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="e.g. 749281"
                    value={enteredOtp}
                    onChange={e => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                    className="w-full text-center tracking-[0.5em] text-xl font-mono font-bold py-3 px-4 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={enteredOtp.length !== 6}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition ${
                    enteredOtp.length === 6
                      ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-md'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  Verify Session OTP & Mark Present
                </button>
              </form>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
