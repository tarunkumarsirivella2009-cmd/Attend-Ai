import React from 'react';
import { ShieldCheck, User, LogOut, GraduationCap, Building2 } from 'lucide-react';
import { getCurrentUser, setCurrentUser } from '../services/storage';

interface NavbarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  onUserChange?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onNavigate, onUserChange }) => {
  const currentUser = getCurrentUser();

  const handleLogout = () => {
    setCurrentUser(null);
    if (onUserChange) onUserChange();
    onNavigate('landing');
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand / Logo */}
        <div 
          onClick={() => onNavigate('landing')}
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-lg tracking-tight text-white">Attend<span className="text-blue-400">AI</span></span>
              <span className="text-[10px] bg-blue-500/20 text-blue-300 font-semibold px-2 py-0.5 rounded-full border border-blue-500/30">
                GVPCE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Smart Facial Verification System</p>
          </div>
        </div>

        {/* Portal Switching & Navigation */}
        <div className="hidden md:flex items-center space-x-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 text-xs">
          <button
            onClick={() => onNavigate('landing')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              currentTab === 'landing' ? 'bg-blue-600 text-white shadow' : 'text-slate-300 hover:text-white'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => onNavigate(currentUser?.role === 'student' ? 'student-dashboard' : 'student-login')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
              currentTab.startsWith('student') ? 'bg-blue-600 text-white shadow' : 'text-slate-300 hover:text-white'
            }`}
          >
            <GraduationCap className="h-3.5 w-3.5" />
            <span>Student Portal</span>
          </button>
          <button
            onClick={() => onNavigate(currentUser?.role === 'faculty' ? 'faculty-dashboard' : 'faculty-login')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
              currentTab.startsWith('faculty') ? 'bg-blue-600 text-white shadow' : 'text-slate-300 hover:text-white'
            }`}
          >
            <Building2 className="h-3.5 w-3.5" />
            <span>Faculty Portal</span>
          </button>
        </div>

        {/* User Account / Session Profile */}
        <div className="flex items-center space-x-3">
          {currentUser ? (
            <div className="flex items-center space-x-3">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-slate-200">
                  {currentUser.role === 'student' 
                    ? currentUser.data.full_name 
                    : currentUser.data.full_name}
                </div>
                <div className="text-[10px] text-blue-400 font-mono">
                  {currentUser.role === 'student' 
                    ? `${currentUser.data.roll_number} • Sec ${currentUser.data.section}` 
                    : `${currentUser.data.faculty_id} • ${currentUser.data.department}`}
                </div>
              </div>

              <div className="h-9 w-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-blue-400 font-bold text-xs">
                {currentUser.data.full_name.slice(0, 2).toUpperCase()}
              </div>

              <button
                onClick={handleLogout}
                title="Log Out"
                className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-red-400 hover:bg-slate-750 transition-colors border border-slate-700/60"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onNavigate('student-login')}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition"
              >
                Sign In
              </button>
              <button
                onClick={() => onNavigate('student-register')}
                className="text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              >
                Register
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};
