import React from 'react';
import { 
  ShieldCheck, 
  GraduationCap, 
  Building2, 
  Camera, 
  CheckCircle, 
  FileSpreadsheet, 
  Lock, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (tab: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-16 py-8">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-navy-900 text-white p-8 sm:p-12 lg:p-16 border border-slate-800 shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(59,130,246,0.15),transparent_50%)] pointer-events-none" />
        
        <div className="relative max-w-3xl space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Next-Generation College Attendance • GVPCE</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Smart Facial Verification <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-400">
              Attendance System
            </span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
            AttendAI replaces manual rolls and proxy sign-ins with an intelligent, privacy-first facial verification platform. Features explicit student consent, real-time liveness detection, active class window enforcement, and a comprehensive faculty administration portal.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-4 pt-4">
            <button
              onClick={() => onNavigate('student-dashboard')}
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition flex items-center space-x-2 group"
            >
              <GraduationCap className="h-4 w-4" />
              <span>Enter Student Portal</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => onNavigate('faculty-dashboard')}
              className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-sm shadow-sm transition flex items-center space-x-2"
            >
              <Building2 className="h-4 w-4 text-slate-400" />
              <span>Enter Faculty Portal</span>
            </button>
          </div>
        </div>

        {/* Quick Spec Highlights */}
        <div className="mt-12 pt-8 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-6 text-xs">
          <div>
            <div className="font-mono text-xl font-bold text-white">1:1 Match</div>
            <div className="text-slate-400 mt-0.5">Identity Verification</div>
          </div>
          <div>
            <div className="font-mono text-xl font-bold text-emerald-400">100% Voluntary</div>
            <div className="text-slate-400 mt-0.5">Consent & Deletion Rights</div>
          </div>
          <div>
            <div className="font-mono text-xl font-bold text-blue-400">Anti-Spoofing</div>
            <div className="text-slate-400 mt-0.5">Active Liveness Checks</div>
          </div>
          <div>
            <div className="font-mono text-xl font-bold text-purple-400">Audit-Logged</div>
            <div className="text-slate-400 mt-0.5">Faculty Corrections</div>
          </div>
        </div>
      </section>

      {/* Two Portal Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Student Portal Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm hover:shadow-md transition space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Student Portal</h3>
              <p className="text-xs text-slate-500 mt-1">
                Register, manage biometric consent, and verify identity during active lectures.
              </p>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-600">
              <li className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Voluntary biometric enrollment with instant consent revocation</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Camera activates only when you click "Start Verification"</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Personal attendance analytics & subject-wise progress bars</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Non-biometric 6-digit session OTP alternative</span>
              </li>
            </ul>
          </div>

          <div className="flex items-center space-x-3 pt-4 border-t border-slate-100">
            <button
              onClick={() => onNavigate('student-attendance')}
              className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow transition text-center"
            >
              Mark Attendance Now
            </button>
            <button
              onClick={() => onNavigate('student-register')}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition"
            >
              New Student Registration
            </button>
          </div>
        </div>

        {/* Faculty Portal Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm hover:shadow-md transition space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Faculty & Admin Portal</h3>
              <p className="text-xs text-slate-500 mt-1">
                Conduct sessions, monitor live verification logs, adjust records, and export reports.
              </p>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-600">
              <li className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-indigo-500 shrink-0" />
                <span>Create time-bounded class sessions and lock windows</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-indigo-500 shrink-0" />
                <span>Search student directory by Roll Number or Name</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-indigo-500 shrink-0" />
                <span>Manual attendance corrections backed by required audit reasons</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-indigo-500 shrink-0" />
                <span>One-click export of attendance records to standard CSV files</span>
              </li>
            </ul>
          </div>

          <div className="flex items-center space-x-3 pt-4 border-t border-slate-100">
            <button
              onClick={() => onNavigate('faculty-dashboard')}
              className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow transition text-center"
            >
              Open Faculty Dashboard
            </button>
            <button
              onClick={() => onNavigate('faculty-sessions')}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition"
            >
              Session Controller
            </button>
          </div>
        </div>

      </section>

      {/* Privacy & Ethical Standards Banner */}
      <section className="bg-slate-50 rounded-2xl border border-slate-200/80 p-6 sm:p-8 space-y-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm">Strict Biometric Ethics & Privacy Architecture</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Built in compliance with international biometric data protection principles.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs text-slate-600">
          <div className="bg-white p-4 rounded-xl border border-slate-200/60">
            <div className="font-bold text-slate-800 mb-1">1. Mathematical Embeddings Only</div>
            <p className="text-slate-500 leading-relaxed">
              Raw facial photos are converted into a 128-d vector and instantly erased. No gallery of face photos is retained.
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200/60">
            <div className="font-bold text-slate-800 mb-1">2. 1:1 Identity Verification</div>
            <p className="text-slate-500 leading-relaxed">
              We never perform 1:N mass surveillance. When student logs in, camera verifies only that student against their own registered template.
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200/60">
            <div className="font-bold text-slate-800 mb-1">3. Right to Delete & Non-Biometric Path</div>
            <p className="text-slate-500 leading-relaxed">
              Students can revoke consent anytime, instantly purging their biometric data. Non-biometric session OTPs are fully supported.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
};
