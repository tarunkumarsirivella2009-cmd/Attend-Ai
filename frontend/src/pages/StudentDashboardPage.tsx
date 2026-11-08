import React from 'react';
import { 
  User, 
  GraduationCap, 
  Layers, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  BookOpen, 
  Camera, 
  Fingerprint, 
  ShieldCheck, 
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { getCurrentUser, getAttendance, getSessions, getStudents } from '../services/storage';
import { INITIAL_SUBJECTS } from '../services/mockData';

interface StudentDashboardPageProps {
  onNavigate: (tab: string) => void;
}

export const StudentDashboardPage: React.FC<StudentDashboardPageProps> = ({ onNavigate }) => {
  const currentUser = getCurrentUser();
  const student = currentUser?.data;

  if (!student) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500 text-sm">Please log in to view your student dashboard.</p>
        <button
          onClick={() => onNavigate('student-login')}
          className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
        >
          Sign In
        </button>
      </div>
    );
  }

  const allAttendance = getAttendance();
  const studentRecords = allAttendance.filter(r => r.student_id === student.id);
  const attendedCount = studentRecords.filter(r => r.status === 'PRESENT' || r.status === 'MANUAL_OVERRIDE').length;
  
  // Total classes conducted across subjects
  const totalClasses = INITIAL_SUBJECTS.reduce((acc, sub) => acc + sub.total_classes, 0);
  const overallPercentage = totalClasses > 0 ? ((attendedCount / totalClasses) * 100).toFixed(1) : '0.0';

  // Check today's active session status
  const sessions = getSessions();
  const todaySession = sessions.find(s => s.is_active && s.section === student.section);
  const markedToday = todaySession 
    ? studentRecords.find(r => r.session_id === todaySession.id)
    : undefined;

  return (
    <div className="space-y-8 py-6">
      
      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center space-x-5">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-lg shadow-blue-600/20">
            {student.full_name.slice(0, 2).toUpperCase()}
          </div>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <h2 className="text-2xl font-bold text-slate-900">{student.full_name}</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-mono font-bold border border-blue-200">
                {student.roll_number}
              </span>
            </div>
            <div className="text-xs text-slate-500 flex flex-wrap items-center gap-x-3 gap-y-1">
              <span>{student.department}</span>
              <span>•</span>
              <span>{student.academic_year}</span>
              <span>•</span>
              <span>Section {student.section}</span>
            </div>
          </div>
        </div>

        {/* Biometric Status & Quick Action */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {student.is_enrolled ? (
            <div className="px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Facial Biometrics Active</span>
            </div>
          ) : (
            <button
              onClick={() => onNavigate('student-enroll')}
              className="px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100 text-xs font-semibold flex items-center space-x-2 transition"
            >
              <Fingerprint className="h-4 w-4 text-amber-600" />
              <span>Enroll Face Biometrics</span>
            </button>
          )}

          <button
            onClick={() => onNavigate('student-attendance')}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition flex items-center justify-center space-x-2"
          >
            <Camera className="h-4 w-4" />
            <span>Mark Today's Attendance</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Today's Status */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Today's Status</span>
            <Calendar className="h-4 w-4 text-slate-400" />
          </div>
          <div>
            <div className={`text-xl font-extrabold ${markedToday ? 'text-emerald-600' : 'text-amber-600'}`}>
              {markedToday ? 'PRESENT' : todaySession ? 'AWAITING SIGN-IN' : 'NO SESSIONS'}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {markedToday 
                ? `${markedToday.subject_code} verified` 
                : todaySession 
                ? `${todaySession.subject_code} window open` 
                : 'All classes completed for today'}
            </div>
          </div>
        </div>

        {/* Classes Attended */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Classes Attended</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">{attendedCount}</div>
            <div className="text-xs text-slate-500 mt-1">Verified sessions recorded</div>
          </div>
        </div>

        {/* Total Conducted */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Total Conducted</span>
            <BookOpen className="h-4 w-4 text-blue-500" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">{totalClasses}</div>
            <div className="text-xs text-slate-500 mt-1">Scheduled lecture hours</div>
          </div>
        </div>

        {/* Attendance Percentage */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Overall Attendance</span>
            <Layers className="h-4 w-4 text-indigo-500" />
          </div>
          <div>
            <div className="flex items-baseline space-x-2">
              <span className={`text-2xl font-extrabold ${parseFloat(overallPercentage) >= 75 ? 'text-emerald-600' : 'text-red-600'}`}>
                {overallPercentage}%
              </span>
              <span className="text-[11px] font-semibold text-slate-400">
                (Min req: 75%)
              </span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
              <div 
                className={`h-full rounded-full ${parseFloat(overallPercentage) >= 75 ? 'bg-emerald-500' : 'bg-red-500'}`}
                style={{ width: `${Math.min(100, Math.max(5, parseFloat(overallPercentage)))}%` }}
              />
            </div>
          </div>
        </div>

      </div>

      {/* Subject-Wise Attendance Breakdown */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Subject-Wise Attendance Breakdown</h3>
            <p className="text-xs text-slate-500 mt-0.5">Track your attendance across all registered courses.</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
            4 Registered Subjects
          </span>
        </div>

        <div className="space-y-4">
          {INITIAL_SUBJECTS.map((sub, idx) => {
            // Calculate mock subject attendance
            const subRecords = studentRecords.filter(r => r.subject_code === sub.subject_code);
            const attended = subRecords.length > 0 ? subRecords.length : Math.max(20, sub.total_classes - 4 - idx * 2);
            const pct = ((attended / sub.total_classes) * 100).toFixed(1);
            const isEligible = parseFloat(pct) >= 75;

            return (
              <div key={sub.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-xs text-blue-700 bg-blue-100/60 px-2 py-0.5 rounded">
                        {sub.subject_code}
                      </span>
                      <span className="font-bold text-xs text-slate-900">{sub.subject_name}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 text-xs">
                    <span className="text-slate-500 font-mono">
                      {attended} / {sub.total_classes} classes
                    </span>
                    <span className={`font-mono font-bold px-2 py-0.5 rounded ${
                      isEligible ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {pct}%
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-200/80 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${isEligible ? 'bg-emerald-500' : 'bg-red-500'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Attendance History Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Attendance History</h3>
            <p className="text-xs text-slate-500 mt-0.5">Chronological record of verified class sign-ins.</p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-500">
            {studentRecords.length} records found
          </span>
        </div>

        {studentRecords.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            No attendance records logged yet. Use "Mark Today's Attendance" to sign in!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Confidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {studentRecords.map(rec => (
                  <tr key={rec.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800">{rec.subject_name}</div>
                      <div className="text-[10px] font-mono text-slate-400">{rec.subject_code} • Sec {rec.section}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {new Date(rec.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                        {rec.verification_method === 'FACIAL_BIOMETRIC' ? 'Facial Biometric' : 'Session OTP'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                        <span>PRESENT</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-700">
                      {rec.confidence_score ? `${(rec.confidence_score * 100).toFixed(1)}%` : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
