import React from 'react';
import {
  LayoutDashboard,
  Camera,
  Fingerprint,
  CalendarCheck2,
  Users,
  FileSpreadsheet,
  History,
  ShieldCheck,
  Building2,
  GraduationCap
} from 'lucide-react';

interface SidebarProps {
  role: 'student' | 'faculty';
  currentTab: string;
  onNavigate: (tab: string) => void;
  studentEnrolled?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ role, currentTab, onNavigate, studentEnrolled }) => {
  const studentNavItems = [
    {
      id: 'student-dashboard',
      label: 'My Dashboard',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'student-attendance',
      label: 'AI Mark Attendance',
      icon: Camera,
      badge: 'Live Session'
    },
    {
      id: 'student-enroll',
      label: 'Facial Enrollment',
      icon: Fingerprint,
      badge: studentEnrolled ? 'Enrolled' : 'Action Required'
    }
  ];

  const facultyNavItems = [
    {
      id: 'faculty-dashboard',
      label: 'Overview & Analytics',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'faculty-sessions',
      label: 'Class Sessions',
      icon: CalendarCheck2,
      badge: 'Active: 1'
    },
    {
      id: 'faculty-records',
      label: 'Attendance & Corrections',
      icon: FileSpreadsheet,
      badge: null
    },
    {
      id: 'faculty-students',
      label: 'Student Directory',
      icon: Users,
      badge: null
    },
    {
      id: 'faculty-audit',
      label: 'Audit Trail',
      icon: History,
      badge: 'Compliance'
    }
  ];

  const items = role === 'student' ? studentNavItems : facultyNavItems;

  return (
    <aside className="w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between hidden md:flex">
      <div className="space-y-6">
        
        {/* Role Tag Banner */}
        <div className="px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center space-x-2.5">
          <div className="p-2 rounded-lg bg-blue-50 text-blue-700">
            {role === 'student' ? <GraduationCap className="h-5 w-5" /> : <Building2 className="h-5 w-5" />}
          </div>
          <div>
            <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              {role === 'student' ? 'Student Workspace' : 'Faculty Admin'}
            </div>
            <div className="text-[11px] text-slate-500">
              {role === 'student' ? 'Attendance & Biometrics' : 'Sessions & Records'}
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {items.map(item => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : item.badge === 'Action Required'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Security & Compliance Footer Widget */}
      <div className="p-3.5 rounded-xl bg-slate-900 text-white space-y-2">
        <div className="flex items-center space-x-2 text-xs font-bold text-blue-400">
          <ShieldCheck className="h-4 w-4" />
          <span>Biometric Protection</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Zero raw face images saved. 128-d encrypted vector templates with instant revocation rights.
        </p>
      </div>
    </aside>
  );
};
