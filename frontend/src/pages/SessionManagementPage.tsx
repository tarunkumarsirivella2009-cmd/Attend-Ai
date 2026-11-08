import React, { useState } from 'react';
import { 
  CalendarCheck2, 
  Plus, 
  Clock, 
  BookOpen, 
  CheckCircle2, 
  XCircle, 
  KeyRound, 
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { getSessions, createSession, toggleSession, getCurrentUser } from '../services/storage';
import { INITIAL_SUBJECTS } from '../services/mockData';
import { ClassSession } from '../types';

interface SessionManagementPageProps {
  onNavigate: (tab: string) => void;
}

export const SessionManagementPage: React.FC<SessionManagementPageProps> = ({ onNavigate }) => {
  const currentUser = getCurrentUser();
  const faculty = currentUser?.data;

  const [sessions, setSessions] = useState<ClassSession[]>(getSessions());
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);

  // Form State
  const [selectedSubjectId, setSelectedSubjectId] = useState<number>(INITIAL_SUBJECTS[0].id);
  const [section, setSection] = useState<string>('A');
  const [startTime, setStartTime] = useState<string>('10:00 AM');
  const [endTime, setEndTime] = useState<string>('11:00 AM');

  const handleToggle = (id: number) => {
    toggleSession(id);
    setSessions(getSessions());
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const sub = INITIAL_SUBJECTS.find(s => s.id === Number(selectedSubjectId)) || INITIAL_SUBJECTS[0];

    createSession({
      subject_id: sub.id,
      subject_code: sub.subject_code,
      subject_name: sub.subject_name,
      faculty_id: faculty?.id || 1,
      faculty_name: faculty?.full_name || 'Dr. K. V. Raman',
      section,
      session_date: new Date().toISOString().split('T')[0],
      start_time: startTime,
      end_time: endTime
    });

    setSessions(getSessions());
    setShowCreateModal(false);
  };

  return (
    <div className="space-y-8 py-6">
      
      {/* Header */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <CalendarCheck2 className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Class Attendance Sessions</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Open and close time-bounded attendance windows for specific subjects & sections.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow transition flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Create New Session</span>
        </button>
      </div>

      {/* Session Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sessions.map(sess => (
          <div key={sess.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="font-mono font-bold text-xs px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                    {sess.subject_code}
                  </span>
                  <span className="text-xs font-bold text-slate-600">Section {sess.section}</span>
                </div>

                {sess.is_active ? (
                  <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold animate-pulse">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span>Window Open</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold">
                    <XCircle className="h-3.5 w-3.5" />
                    <span>Window Closed</span>
                  </span>
                )}
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900">{sess.subject_name}</h3>
                <p className="text-xs text-slate-500 mt-0.5">Faculty: {sess.faculty_name}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <div className="text-slate-400 text-[10px]">Session Date</div>
                  <div className="font-mono font-bold text-slate-800 mt-0.5">{sess.session_date}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-[10px]">Time Window</div>
                  <div className="font-mono font-bold text-slate-800 mt-0.5">{sess.start_time} - {sess.end_time}</div>
                </div>
              </div>

              {/* Fallback OTP Widget for exempted students */}
              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs text-amber-900">
                  <KeyRound className="h-4 w-4 text-amber-600" />
                  <span className="font-semibold">Fallback 6-Digit OTP:</span>
                </div>
                <div className="font-mono font-bold text-sm text-amber-800 tracking-wider bg-white px-3 py-1 rounded-lg border border-amber-300">
                  {sess.fallback_otp}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => handleToggle(sess.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                  sess.is_active
                    ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                    : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-sm'
                }`}
              >
                {sess.is_active ? (
                  <>
                    <XCircle className="h-3.5 w-3.5" />
                    <span>Close Window</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Re-Open Window</span>
                  </>
                )}
              </button>

              <button
                onClick={() => onNavigate('faculty-records')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-500"
              >
                View Records
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Session Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 space-y-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Schedule Class Attendance Window</h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Course / Subject</label>
                <select
                  value={selectedSubjectId}
                  onChange={e => setSelectedSubjectId(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {INITIAL_SUBJECTS.map(s => (
                    <option key={s.id} value={s.id}>{s.subject_code} – {s.subject_name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Section</label>
                  <select
                    value={section}
                    onChange={e => setSection(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                    <option value="C">Section C</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Window Duration</label>
                  <input
                    type="text"
                    value="15 Minutes (Active)"
                    disabled
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-100 text-slate-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Start Time</label>
                  <input
                    type="text"
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">End Time</label>
                  <input
                    type="text"
                    value={endTime}
                    onChange={e => setEndTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow"
                >
                  Open Attendance Window
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
