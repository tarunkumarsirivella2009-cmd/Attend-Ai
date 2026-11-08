import React, { useState } from 'react';
import { User, Lock, AlertCircle, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { getStudents, setCurrentUser } from '../services/storage';

interface StudentLoginPageProps {
  onNavigate: (tab: string) => void;
  onLoginSuccess: () => void;
}

export const StudentLoginPage: React.FC<StudentLoginPageProps> = ({ onNavigate, onLoginSuccess }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!identifier.trim()) {
      setError('Please enter your roll number or college email.');
      return;
    }

    const students = getStudents();
    const student = students.find(
      s => s.roll_number.toLowerCase() === identifier.trim().toLowerCase() ||
           s.email.toLowerCase() === identifier.trim().toLowerCase()
    );

    if (!student) {
      setError(`No student account found with "${identifier}". Please register first.`);
      return;
    }

    // In demo environment, simple password match
    setCurrentUser({ role: 'student', data: student });
    onLoginSuccess();
    onNavigate('student-dashboard');
  };

  const handleQuickDemo = (roll: string) => {
    const students = getStudents();
    const student = students.find(s => s.roll_number === roll);
    if (student) {
      setCurrentUser({ role: 'student', data: student });
      onLoginSuccess();
      onNavigate('student-dashboard');
    }
  };

  return (
    <div className="max-w-md mx-auto py-12">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-blue-50 text-blue-600 mb-1">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Student Portal Login</h2>
          <p className="text-xs text-slate-500">
            Sign in to mark attendance, manage facial biometrics, and view records.
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
              <span>Roll Number or College Email</span>
            </label>
            <input
              type="text"
              placeholder="e.g. 24B91A0501"
              value={identifier}
              onChange={e => setIdentifier(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
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
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition flex items-center justify-center space-x-2 pt-2"
          >
            <span>Sign In to Student Account</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {/* 1-Click Quick Demo Switcher */}
        <div className="pt-2 border-t border-slate-100 space-y-2">
          <div className="flex items-center space-x-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5 text-blue-500" />
            <span>Instant Demo Accounts</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('24B91A0501')}
              className="p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 text-left transition group"
            >
              <div className="text-xs font-bold text-slate-800 group-hover:text-blue-600">Tarun Varma</div>
              <div className="text-[10px] text-slate-400 font-mono">24B91A0501 (Sec A)</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo('24B91A0502')}
              className="p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 text-left transition group"
            >
              <div className="text-xs font-bold text-slate-800 group-hover:text-blue-600">Sneha Reddy</div>
              <div className="text-[10px] text-slate-400 font-mono">24B91A0502 (Sec A)</div>
            </button>
          </div>
        </div>

        {/* Register CTA */}
        <div className="text-center text-xs text-slate-500 pt-1">
          Don't have an account yet?{' '}
          <button
            onClick={() => onNavigate('student-register')}
            className="text-blue-600 hover:text-blue-500 font-bold underline"
          >
            Register Student Profile
          </button>
        </div>

      </div>
    </div>
  );
};
