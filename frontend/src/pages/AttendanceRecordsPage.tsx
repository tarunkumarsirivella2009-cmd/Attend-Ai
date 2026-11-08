import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  Search, 
  Filter, 
  Edit3, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck,
  X
} from 'lucide-react';
import { 
  getAttendance, 
  getSessions, 
  correctAttendance, 
  getCurrentUser, 
  exportAttendanceToCSV 
} from '../services/storage';
import { AttendanceRecord } from '../types';

interface AttendanceRecordsPageProps {
  onNavigate: (tab: string) => void;
}

export const AttendanceRecordsPage: React.FC<AttendanceRecordsPageProps> = () => {
  const currentUser = getCurrentUser();
  const facultyName = currentUser?.data?.full_name || 'Faculty Admin';

  const [records, setRecords] = useState<AttendanceRecord[]>(getAttendance());
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSessionFilter, setSelectedSessionFilter] = useState<string>('all');
  
  // Correction Modal State
  const [correctionTarget, setCorrectionTarget] = useState<AttendanceRecord | null>(null);
  const [newStatus, setNewStatus] = useState<'PRESENT' | 'ABSENT' | 'EXCUSED' | 'MANUAL_OVERRIDE'>('PRESENT');
  const [reason, setReason] = useState<string>('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const sessions = getSessions();

  const filteredRecords = records.filter(r => {
    const matchesSearch = r.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.roll_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.subject_code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSession = selectedSessionFilter === 'all' || r.session_id === Number(selectedSessionFilter);
    return matchesSearch && matchesSession;
  });

  const handleOpenCorrection = (record: AttendanceRecord) => {
    setCorrectionTarget(record);
    setNewStatus(record.status);
    setReason('');
    setFeedback(null);
  };

  const handleSaveCorrection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!correctionTarget) return;

    if (!reason.trim()) {
      setFeedback('A valid reason is strictly required to log an attendance correction audit.');
      return;
    }

    const res = correctAttendance(correctionTarget.id, newStatus, reason.trim(), facultyName);
    if (res.success) {
      setRecords(getAttendance());
      setCorrectionTarget(null);
    }
  };

  return (
    <div className="space-y-8 py-6">
      
      {/* Header */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <FileSpreadsheet className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Attendance Records & Manual Corrections</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Review all student sign-ins, make audited corrections, and export official CSV reports.
            </p>
          </div>
        </div>

        <button
          onClick={() => exportAttendanceToCSV()}
          className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow transition flex items-center space-x-2"
        >
          <Download className="h-4 w-4" />
          <span>Export All Records (CSV)</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by student, roll number, or subject..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Session Filter */}
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            value={selectedSessionFilter}
            onChange={e => setSelectedSessionFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none"
          >
            <option value="all">All Lecture Sessions</option>
            {sessions.map(s => (
              <option key={s.id} value={s.id}>
                {s.subject_code} (Sec {s.section}) – {s.start_time}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-6">Roll Number</th>
                <th className="py-3.5 px-6">Student Name</th>
                <th className="py-3.5 px-6">Course</th>
                <th className="py-3.5 px-6">Timestamp</th>
                <th className="py-3.5 px-6">Verification Method</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6 text-right">Faculty Correction</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400">
                    No attendance records found matching filters.
                  </td>
                </tr>
              ) : (
                filteredRecords.map(record => (
                  <tr key={record.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-4 px-6 font-mono font-bold text-slate-800">
                      {record.roll_number}
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-900">
                      {record.student_name}
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-800">{record.subject_code}</div>
                      <div className="text-[10px] text-slate-400">Sec {record.section}</div>
                    </td>
                    <td className="py-4 px-6 font-mono text-slate-600">
                      {new Date(record.timestamp).toLocaleString()}
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                        {record.verification_method}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        record.status === 'PRESENT'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : record.status === 'MANUAL_OVERRIDE'
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        <CheckCircle2 className="h-3 w-3" />
                        <span>{record.status}</span>
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleOpenCorrection(record)}
                        className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-semibold text-xs transition inline-flex items-center space-x-1.5"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        <span>Adjust</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Attendance Correction Modal (Required by Prompt) */}
      {correctionTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 space-y-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="space-y-0.5">
                <h3 className="font-bold text-slate-900 text-base">Audited Attendance Correction</h3>
                <p className="text-xs text-slate-500">
                  Modifying record for {correctionTarget.student_name} ({correctionTarget.roll_number})
                </p>
              </div>

              <button 
                onClick={() => setCorrectionTarget(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {feedback && (
              <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs font-medium">
                {feedback}
              </div>
            )}

            <form onSubmit={handleSaveCorrection} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Corrected Status</label>
                <select
                  value={newStatus}
                  onChange={e => setNewStatus(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="PRESENT">PRESENT</option>
                  <option value="ABSENT">ABSENT</option>
                  <option value="EXCUSED">EXCUSED (Official On-Duty / Medical)</option>
                  <option value="MANUAL_OVERRIDE">MANUAL_OVERRIDE (Faculty Confirmed)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Mandatory Reason for Correction (Logged to Audit Trail)
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g., Student submitted approved medical certificate from college dispensary..."
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-[11px] text-slate-500 flex items-center space-x-2">
                <ShieldCheck className="h-4 w-4 text-indigo-500 shrink-0" />
                <span>
                  This action creates an immutable log containing your Faculty ID and timestamp.
                </span>
              </div>

              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setCorrectionTarget(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow"
                >
                  Save & Log to Audit Trail
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
