import React, { useState } from 'react';
import { 
  Fingerprint, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Trash2, 
  Eye, 
  HelpCircle, 
  FileText,
  Lock,
  ArrowRight
} from 'lucide-react';
import { CameraView } from '../components/CameraView';
import { 
  getCurrentUser, 
  grantBiometricConsent, 
  revokeBiometricConsent 
} from '../services/storage';
import { CONSENT_POLICY_TEXT } from '../services/mockData';

interface FacialEnrollmentPageProps {
  onNavigate: (tab: string) => void;
  onUpdate?: () => void;
}

export const FacialEnrollmentPage: React.FC<FacialEnrollmentPageProps> = ({ onNavigate, onUpdate }) => {
  const currentUser = getCurrentUser();
  const student = currentUser?.data;

  const [hasAgreed, setHasAgreed] = useState<boolean>(student?.has_biometric_consent || false);
  const [showCamera, setShowCamera] = useState<boolean>(false);
  const [capturedPreview, setCapturedPreview] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showRevokeModal, setShowRevokeModal] = useState<boolean>(false);

  if (!student) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500 text-sm">Please log in to manage facial enrollment.</p>
        <button
          onClick={() => onNavigate('student-login')}
          className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
        >
          Sign In
        </button>
      </div>
    );
  }

  // Handle capture from CameraView
  const handleCapture = (dataUrl: string, confidence: number) => {
    setCapturedPreview(dataUrl);
    setShowCamera(false);

    // Generate 128-dimensional simulated normalized embedding vector
    const simulatedVector = Array.from({ length: 128 }, () => parseFloat((Math.random() * 2 - 1).toFixed(4)));

    const res = grantBiometricConsent(student.id, simulatedVector);
    if (res.success) {
      setFeedback({ type: 'success', message: res.message });
      if (onUpdate) onUpdate();
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  // Handle Revocation & Immediate Template Deletion
  const handleRevokeConsent = () => {
    const res = revokeBiometricConsent(student.id);
    setShowRevokeModal(false);
    setCapturedPreview(null);
    setHasAgreed(false);
    if (res.success) {
      setFeedback({ type: 'success', message: res.message });
      if (onUpdate) onUpdate();
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-6">
      
      {/* Page Title & Status Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Fingerprint className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Voluntary Facial Biometric Enrollment</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Roll No: <span className="font-mono font-bold text-slate-700">{student.roll_number}</span> • {student.full_name}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {student.is_enrolled ? (
            <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>Biometric Template Active</span>
            </div>
          ) : (
            <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <span>Not Enrolled (Optional)</span>
            </div>
          )}
        </div>
      </div>

      {/* Status Feedback Banner */}
      {feedback && (
        <div className={`p-4 rounded-2xl text-xs font-semibold flex items-center space-x-2.5 ${
          feedback.type === 'success'
            ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {feedback.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Main Flow Controller */}
      {!student.is_enrolled && !showCamera ? (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 space-y-6">
          
          <div className="space-y-2">
            <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <span>Step 1: Informed Biometric Consent</span>
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Before activating any camera sensor, college policies require explicit student consent. Please review how your biometric data is protected:
            </p>
          </div>

          {/* Privacy Policy Scroll Box */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 font-mono whitespace-pre-line leading-relaxed max-h-48 overflow-y-auto">
            {CONSENT_POLICY_TEXT.trim()}
          </div>

          {/* Consent Checkbox */}
          <label className="flex items-start space-x-3 p-4 rounded-2xl bg-blue-50/50 border border-blue-100 cursor-pointer">
            <input
              type="checkbox"
              checked={hasAgreed}
              onChange={e => setHasAgreed(e.target.checked)}
              className="mt-0.5 h-4 w-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
            />
            <div className="text-xs">
              <span className="font-bold text-slate-900">
                I voluntarily consent to the generation and storage of a 128-dimensional facial embedding vector for attendance verification.
              </span>
              <p className="text-slate-500 mt-1">
                I understand this is voluntary. I can withdraw consent at any time to delete my template and use non-biometric alternatives (session OTPs).
              </p>
            </div>
          </label>

          {/* Action Button */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => onNavigate('student-dashboard')}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              Skip (Use Non-Biometric Attendance)
            </button>

            <button
              disabled={!hasAgreed}
              onClick={() => setShowCamera(true)}
              className={`px-6 py-2.5 rounded-xl font-bold text-xs shadow-md transition flex items-center space-x-2 ${
                hasAgreed
                  ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <span>Proceed to Camera Capture</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

        </div>
      ) : showCamera ? (
        <CameraView
          mode="enrollment"
          onCapture={handleCapture}
          onCancel={() => setShowCamera(false)}
          onFallbackOTP={() => onNavigate('student-attendance')}
        />
      ) : (
        /* Enrolled State Details Card */
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Enrolled Biometric Template Details</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Your mathematical template is active and ready for fast 1:1 attendance verification.
              </p>
            </div>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <ShieldCheck className="h-6 w-6" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="text-slate-400 text-[11px]">Template Model</div>
              <div className="font-mono font-bold text-slate-800 mt-1">MobileFaceNet-128d-v1</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="text-slate-400 text-[11px]">Vector Dimensions</div>
              <div className="font-mono font-bold text-slate-800 mt-1">128 Normalized Floats</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="text-slate-400 text-[11px]">Calculated Quality</div>
              <div className="font-mono font-bold text-emerald-600 mt-1">94.8% (High Fidelity)</div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100">
            <button
              onClick={() => onNavigate('student-attendance')}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition flex items-center space-x-2"
            >
              <span>Test Live Attendance Verification</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <button
              onClick={() => setShowRevokeModal(true)}
              className="px-4 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-semibold text-xs transition flex items-center space-x-2"
            >
              <Trash2 className="h-4 w-4 text-red-500" />
              <span>Withdraw Consent & Delete Template</span>
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Revoking Biometrics */}
      {showRevokeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-slate-200">
            <div className="h-12 w-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6" />
            </div>

            <div className="space-y-1">
              <h3 className="font-bold text-slate-900 text-base">Withdraw Biometric Consent?</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                This will immediately and permanently delete your 128-dimensional facial embedding template from the college database. You will use non-biometric OTP codes for attendance.
              </p>
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <button
                onClick={() => setShowRevokeModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition"
              >
                Keep Enrolled
              </button>
              <button
                onClick={handleRevokeConsent}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md shadow-red-600/20 transition"
              >
                Confirm Deletion
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
