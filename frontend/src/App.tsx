import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { LandingPage } from './pages/LandingPage';
import { StudentRegisterPage } from './pages/StudentRegisterPage';
import { StudentLoginPage } from './pages/StudentLoginPage';
import { StudentDashboardPage } from './pages/StudentDashboardPage';
import { FacialEnrollmentPage } from './pages/FacialEnrollmentPage';
import { AttendanceVerificationPage } from './pages/AttendanceVerificationPage';
import { FacultyLoginPage } from './pages/FacultyLoginPage';
import { FacultyDashboardPage } from './pages/FacultyDashboardPage';
import { SessionManagementPage } from './pages/SessionManagementPage';
import { StudentManagementPage } from './pages/StudentManagementPage';
import { AttendanceRecordsPage } from './pages/AttendanceRecordsPage';
import { AuditTrailPage } from './pages/AuditTrailPage';
import { getCurrentUser, initializeStorage } from './services/storage';

export function App() {
  const [currentTab, setCurrentTab] = useState<string>('landing');
  const [currentUser, setCurrentUserState] = useState(getCurrentUser());

  useEffect(() => {
    initializeStorage();
    setCurrentUserState(getCurrentUser());
  }, []);

  const refreshUser = () => {
    setCurrentUserState(getCurrentUser());
  };

  const isStudentWorkspace = currentTab.startsWith('student') && currentTab !== 'student-login' && currentTab !== 'student-register';
  const isFacultyWorkspace = currentTab.startsWith('faculty') && currentTab !== 'faculty-login';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      
      {/* Top Navbar */}
      <Navbar 
        currentTab={currentTab} 
        onNavigate={setCurrentTab} 
        onUserChange={refreshUser} 
      />

      {/* Main Body */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        
        {/* Conditional Sidebar */}
        {isStudentWorkspace && (
          <Sidebar 
            role="student" 
            currentTab={currentTab} 
            onNavigate={setCurrentTab} 
            studentEnrolled={currentUser?.data?.is_enrolled}
          />
        )}

        {isFacultyWorkspace && (
          <Sidebar 
            role="faculty" 
            currentTab={currentTab} 
            onNavigate={setCurrentTab} 
          />
        )}

        {/* Dynamic Page Router */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 overflow-y-auto">
          {currentTab === 'landing' && (
            <LandingPage onNavigate={setCurrentTab} />
          )}

          {/* Student Routes */}
          {currentTab === 'student-register' && (
            <StudentRegisterPage 
              onNavigate={setCurrentTab} 
              onRegistered={refreshUser} 
            />
          )}

          {currentTab === 'student-login' && (
            <StudentLoginPage 
              onNavigate={setCurrentTab} 
              onLoginSuccess={refreshUser} 
            />
          )}

          {currentTab === 'student-dashboard' && (
            <StudentDashboardPage onNavigate={setCurrentTab} />
          )}

          {currentTab === 'student-enroll' && (
            <FacialEnrollmentPage 
              onNavigate={setCurrentTab} 
              onUpdate={refreshUser} 
            />
          )}

          {currentTab === 'student-attendance' && (
            <AttendanceVerificationPage 
              onNavigate={setCurrentTab} 
              onAttendanceSuccess={refreshUser} 
            />
          )}

          {/* Faculty Routes */}
          {currentTab === 'faculty-login' && (
            <FacultyLoginPage 
              onNavigate={setCurrentTab} 
              onLoginSuccess={refreshUser} 
            />
          )}

          {currentTab === 'faculty-dashboard' && (
            <FacultyDashboardPage onNavigate={setCurrentTab} />
          )}

          {currentTab === 'faculty-sessions' && (
            <SessionManagementPage onNavigate={setCurrentTab} />
          )}

          {currentTab === 'faculty-records' && (
            <AttendanceRecordsPage onNavigate={setCurrentTab} />
          )}

          {currentTab === 'faculty-students' && (
            <StudentManagementPage onNavigate={setCurrentTab} />
          )}

          {currentTab === 'faculty-audit' && (
            <AuditTrailPage onNavigate={setCurrentTab} />
          )}
        </main>

      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 AttendAI • Gayatri Vidya Parishad College of Engineering (GVPCE), Visakhapatnam.</p>
          <div className="flex items-center space-x-4 text-[11px] text-slate-400 font-mono">
            <span>Privacy-First Biometrics</span>
            <span>•</span>
            <span>Active Session Windows</span>
            <span>•</span>
            <span>Full Audit Compliance</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default App;
