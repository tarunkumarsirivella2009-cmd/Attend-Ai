import React, { useState } from 'react';
import { Building2, Lock, AlertCircle, ArrowRight, ShieldCheck, Sparkles, User } from 'lucide-react';
import { getStudents, setCurrentUser } from '../services/storage';
import { INITIAL_FACULTY } from '../services/mockData';

interface FacultyLoginPageProps {
  onNavigate: (tab: string) => void;
  onLoginSuccess: () => void;
}

export const FacultyLoginPage: React.FC<FacultyLoginPageProps> = ({ onNavigate, onLoginSuccess }) => {
  const [facultyId, setFacultyId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const match = INITIAL_FACULTY.find(
      f => f.faculty_id.toLowerCase() === facultyId.trim().toLowerCase() ||
           f.email.toLowerCase() === facultyId.trim().toLowerCase()
    );

    if (!match) {
      setError(`No faculty account found with ID "${facultyId}". Use demo login below.`);
      return;
    }

    setCurrentUser({ role: 'faculty', data: match });
    onLoginSuccess();
    onNavigate('faculty-dashboard');
  };

  const handleQuickDemo = (id: string) => {
    const match = INITIAL_FACULTY.find(f => f.faculty_id === id);
    if (match) {
      setCurrentUser({ role: 'faculty', data: match });
      onLoginSuccess();
      onNavigate('faculty-dashboard');
    }
  };

  return (
    <div className="max-w-md mx-auto py-12">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-indigo-50 text-indigo-600 mb-1">
            <Building2 className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Faculty & Admin Portal</h2>
          <p className="text-xs text-slate-500">
            Sign in to conduct class sessions, adjust attendance, and review audit logs.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
              <User className="h-3.5 w-3.5 text-slate-400" />
              <span>Faculty ID or Email</span>
            </label>
            <input
              type="text"
              placeholder="e.g. FAC-CSE-01"
              value={facultyId}
              onChange={e => setFacultyId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
              <Lock className="h-3.5 w-3.5 text-slate-400" />
              <span>Password</span>
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition flex items-center justify-center space-x-2 pt-2"
          >
            <span>Sign In to Faculty Console</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {/* 1-Click Quick Demo */}
        <div className="pt-2 border-t border-slate-100 space-y-2">
          <div className="flex items-center space-x-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
            <span>Instant Demo Faculty</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('FAC-CSE-01')}
              className="p-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-left transition group"
            >
              <div className="text-xs font-bold text-slate-800 group-hover:text-indigo-600">Dr. K. V. Raman</div>
              <div className="text-[10px] text-slate-400 font-mono">FAC-CSE-01 (Data Structures)</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo('FAC-CSE-02')}
              className="p-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-left transition group"
            >
              <div className="text-xs font-bold text-slate-800 group-hover:text-indigo-600">Prof. Ananya Sen</div>
              <div className="text-[10px] text-slate-400 font-mono">FAC-CSE-02 (Comp Arch)</div>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
