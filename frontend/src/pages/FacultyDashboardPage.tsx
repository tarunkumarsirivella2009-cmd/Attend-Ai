import React from 'react';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Percent, 
  CalendarCheck2, 
  FileSpreadsheet, 
  Download, 
  Plus, 
  ArrowUpRight,
  TrendingUp,
  Building2,
  BookOpen
} from 'lucide-react';
import { 
  getStudents, 
  getAttendance, 
  getSessions, 
  getCurrentUser, 
  exportAttendanceToCSV 
} from '../services/storage';
import { INITIAL_SUBJECTS } from '../services/mockData';

interface FacultyDashboardPageProps {
  onNavigate: (tab: string) => void;
}

export const FacultyDashboardPage: React.FC<FacultyDashboardPageProps> = ({ onNavigate }) => {
  const currentUser = getCurrentUser();
  const faculty = currentUser?.data;

  const students = getStudents();
  const attendance = getAttendance();
  const sessions = getSessions();

  // Metrics
  const totalStudents = students.length;
  // Consider today's unique present students
  const todayDateStr = new Date().toISOString().split('T')[0];
  const todayRecords = attendance.filter(r => r.timestamp.startsWith(todayDateStr));
  const uniquePresentIds = new Set(todayRecords.filter(r => r.status === 'PRESENT' || r.status === 'MANUAL_OVERRIDE').map(r => r.student_id));
  const totalPresentToday = uniquePresentIds.size;
  const totalAbsentToday = Math.max(0, totalStudents - totalPresentToday);
  const attendancePercentage = totalStudents > 0 
    ? ((totalPresentToday / totalStudents) * 100).toFixed(1) 
    : '0.0';

  // Active Sessions
  const activeSessions = sessions.filter(s => s.is_active);

  return (
    <div className="space-y-8 py-6">
      
      {/* Faculty Welcome Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center space-x-5">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-slate-900 to-indigo-900 text-white font-extrabold text-2xl flex items-center justify-center shadow-lg">
            <Building2 className="h-8 w-8 text-indigo-400" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <h2 className="text-2xl font-bold text-slate-900">
                {faculty ? faculty.full_name : 'Faculty Administrator'}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-mono font-bold border border-indigo-200">
                {faculty?.faculty_id || 'ADMIN'}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Department of {faculty?.department || 'Computer Science & Engineering'} • GVPCE
            </p>
          </div>
        </div>

        {/* Quick Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => onNavigate('faculty-sessions')}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow transition flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Open Attendance Window</span>
          </button>

          <button
            onClick={() => exportAttendanceToCSV()}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold shadow-sm transition flex items-center space-x-2"
          >
            <Download className="h-4 w-4 text-slate-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* High-Level Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Total Students */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Total Registered Students</span>
            <Users className="h-4 w-4 text-blue-500" />
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-900">{totalStudents}</div>
            <div className="text-xs text-slate-500 mt-1 flex items-center space-x-1">
              <span className="text-emerald-600 font-bold">{students.filter(s => s.is_enrolled).length} Enrolled</span>
              <span>for facial AI</span>
            </div>
          </div>
        </div>

        {/* Present Today */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Present Today</span>
            <UserCheck className="h-4 w-4 text-emerald-500" />
          </div>
          <div>
            <div className="text-3xl font-extrabold text-emerald-600">{totalPresentToday}</div>
            <div className="text-xs text-slate-500 mt-1">Verified via 1:1 camera or OTP</div>
          </div>
        </div>

        {/* Absent Today */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Absent Today</span>
            <UserX className="h-4 w-4 text-rose-500" />
          </div>
          <div>
            <div className="text-3xl font-extrabold text-rose-600">{totalAbsentToday}</div>
            <div className="text-xs text-slate-500 mt-1">Pending attendance verification</div>
          </div>
        </div>

        {/* Overall Percentage */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Attendance Percentage</span>
            <Percent className="h-4 w-4 text-indigo-500" />
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-900">{attendancePercentage}%</div>
            <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
              <div 
                className="bg-indigo-600 h-full rounded-full"
                style={{ width: `${attendancePercentage}%` }}
              />
            </div>
          </div>
        </div>

      </div>

      {/* Analytics Charts & Distributions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Subject-Wise Attendance Distribution */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Subject-Wise Attendance</h3>
              <p className="text-xs text-slate-500 mt-0.5">Average attendance across department courses.</p>
            </div>
            <span className="p-2 rounded-xl bg-slate-100 text-slate-600">
              <BookOpen className="h-4 w-4" />
            </span>
          </div>

          <div className="space-y-4 pt-2">
            {INITIAL_SUBJECTS.map((sub, idx) => {
              const rates = [88.5, 92.1, 79.4, 84.0];
              const rate = rates[idx % rates.length];
              return (
                <div key={sub.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">{sub.subject_name}</span>
                    <span className="font-mono font-bold text-slate-600">{rate}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${rate >= 85 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                      style={{ width: `${rate}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Department-Wise Distribution */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Department-Wise Attendance</h3>
              <p className="text-xs text-slate-500 mt-0.5">Campus-wide college compliance overview.</p>
            </div>
            <span className="p-2 rounded-xl bg-slate-100 text-slate-600">
              <Building2 className="h-4 w-4" />
            </span>
          </div>

          <div className="space-y-4 pt-2">
            {[
              { dept: 'Computer Science & Engineering', rate: 91.4, count: 240 },
              { dept: 'Electronics & Communication', rate: 86.2, count: 180 },
              { dept: 'Information Technology', rate: 88.0, count: 120 },
              { dept: 'Mechanical Engineering', rate: 76.5, count: 120 },
            ].map(d => (
              <div key={d.dept} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">{d.dept}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-400 font-mono text-[11px]">{d.count} students</span>
                    <span className="font-mono font-bold text-indigo-700">{d.rate}%</span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-indigo-600"
                    style={{ width: `${d.rate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Active Sessions Live Monitor */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Live Class Sessions</h3>
            <p className="text-xs text-slate-500 mt-0.5">Sessions open for student attendance verification.</p>
          </div>
          <button
            onClick={() => onNavigate('faculty-sessions')}
            className="text-xs font-bold text-blue-600 hover:text-blue-500 flex items-center space-x-1"
          >
            <span>Manage All Sessions</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {activeSessions.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            No class sessions currently active. Click "Open Attendance Window" above.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeSessions.map(sess => (
              <div key={sess.id} className="p-5 rounded-2xl bg-slate-900 text-white space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/30">
                    WINDOW ACTIVE
                  </span>
                  <span className="text-xs text-slate-400 font-mono">Sec {sess.section}</span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white">{sess.subject_name}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">{sess.subject_code} • {sess.faculty_name}</p>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                  <div className="text-slate-400">
                    Fallback OTP: <span className="font-mono font-bold text-amber-400">{sess.fallback_otp}</span>
                  </div>
                  <button
                    onClick={() => onNavigate('faculty-records')}
                    className="text-blue-400 hover:text-blue-300 font-semibold"
                  >
                    View Live Sign-ins
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
