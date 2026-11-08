import {
  Student, Faculty, Subject, ClassSession, AttendanceRecord, AuditLog
} from '../types';
import {
  INITIAL_STUDENTS, INITIAL_FACULTY, INITIAL_SUBJECTS, INITIAL_SESSIONS,
  INITIAL_ATTENDANCE, INITIAL_AUDIT_LOGS, CONSENT_POLICY_TEXT
} from './mockData';

const KEYS = {
  STUDENTS: 'attendai_students',
  FACULTY: 'attendai_faculty',
  SUBJECTS: 'attendai_subjects',
  SESSIONS: 'attendai_sessions',
  ATTENDANCE: 'attendai_attendance',
  AUDIT_LOGS: 'attendai_audit_logs',
  CURRENT_USER: 'attendai_current_user',
  TEMPLATES: 'attendai_facial_templates',
};

// Initialize localStorage with default data if empty
export function initializeStorage(): void {
  if (!localStorage.getItem(KEYS.STUDENTS)) {
    localStorage.setItem(KEYS.STUDENTS, JSON.stringify(INITIAL_STUDENTS));
  }
  if (!localStorage.getItem(KEYS.FACULTY)) {
    localStorage.setItem(KEYS.FACULTY, JSON.stringify(INITIAL_FACULTY));
  }
  if (!localStorage.getItem(KEYS.SUBJECTS)) {
    localStorage.setItem(KEYS.SUBJECTS, JSON.stringify(INITIAL_SUBJECTS));
  }
  if (!localStorage.getItem(KEYS.SESSIONS)) {
    localStorage.setItem(KEYS.SESSIONS, JSON.stringify(INITIAL_SESSIONS));
  }
  if (!localStorage.getItem(KEYS.ATTENDANCE)) {
    localStorage.setItem(KEYS.ATTENDANCE, JSON.stringify(INITIAL_ATTENDANCE));
  }
  if (!localStorage.getItem(KEYS.AUDIT_LOGS)) {
    localStorage.setItem(KEYS.AUDIT_LOGS, JSON.stringify(INITIAL_AUDIT_LOGS));
  }
  if (!localStorage.getItem(KEYS.CURRENT_USER)) {
    // Default to student 1 (Tarun) for instant demo
    localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify({
      role: 'student',
      data: INITIAL_STUDENTS[0]
    }));
  }
}

// Student Methods
export function getStudents(): Student[] {
  initializeStorage();
  return JSON.parse(localStorage.getItem(KEYS.STUDENTS) || '[]');
}

export function registerStudent(studentData: Omit<Student, 'id' | 'created_at' | 'has_biometric_consent' | 'is_enrolled'>): { success: boolean; message: string; student?: Student } {
  const students = getStudents();
  
  // Prevent duplicate roll numbers
  const existingRoll = students.find(
    s => s.roll_number.trim().toLowerCase() === studentData.roll_number.trim().toLowerCase()
  );
  if (existingRoll) {
    return { success: false, message: `Roll number ${studentData.roll_number} is already registered.` };
  }

  // Prevent duplicate emails
  const existingEmail = students.find(
    s => s.email.trim().toLowerCase() === studentData.email.trim().toLowerCase()
  );
  if (existingEmail) {
    return { success: false, message: `Email ${studentData.email} is already in use.` };
  }

  const newStudent: Student = {
    ...studentData,
    id: students.length > 0 ? Math.max(...students.map(s => s.id)) + 1 : 1,
    has_biometric_consent: false,
    is_enrolled: false,
    created_at: new Date().toISOString()
  };

  students.push(newStudent);
  localStorage.setItem(KEYS.STUDENTS, JSON.stringify(students));
  
  // Add audit log
  addAuditLog({
    action: 'STUDENT_REGISTERED',
    performed_by: `Self (${newStudent.roll_number})`,
    target_entity: `Student:${newStudent.id}`,
    reason: 'New student registration completed via portal'
  });

  return { success: true, message: 'Registration successful! You may now log in.', student: newStudent };
}

export function updateStudent(updated: Student): void {
  const students = getStudents();
  const index = students.findIndex(s => s.id === updated.id);
  if (index !== -1) {
    students[index] = updated;
    localStorage.setItem(KEYS.STUDENTS, JSON.stringify(students));
  }
}

// Facial Biometric Consent & Template Methods
export function grantBiometricConsent(studentId: number, simulatedEmbedding: number[]): { success: boolean; message: string } {
  const students = getStudents();
  const student = students.find(s => s.id === studentId);
  if (!student) return { success: false, message: 'Student not found.' };

  student.has_biometric_consent = true;
  student.is_enrolled = true;
  updateStudent(student);

  // Store protected template
  const templates = JSON.parse(localStorage.getItem(KEYS.TEMPLATES) || '{}');
  templates[studentId] = {
    embedding: simulatedEmbedding,
    modelVersion: 'MobileFaceNet-128d-v1',
    qualityScore: 0.94,
    enrolledAt: new Date().toISOString()
  };
  localStorage.setItem(KEYS.TEMPLATES, JSON.stringify(templates));

  addAuditLog({
    action: 'BIOMETRIC_CONSENT_GRANTED',
    performed_by: `Student ${student.roll_number}`,
    target_entity: `BiometricConsent:${studentId}`,
    reason: 'Student opted in for facial biometric attendance verification'
  });

  // Update current user session if it's the active student
  const currentUser = getCurrentUser();
  if (currentUser?.data?.id === studentId) {
    setCurrentUser({ role: 'student', data: student });
  }

  return { success: true, message: 'Facial biometric template enrolled successfully!' };
}

export function revokeBiometricConsent(studentId: number): { success: boolean; message: string } {
  const students = getStudents();
  const student = students.find(s => s.id === studentId);
  if (!student) return { success: false, message: 'Student not found.' };

  student.has_biometric_consent = false;
  student.is_enrolled = false;
  updateStudent(student);

  // Purge template
  const templates = JSON.parse(localStorage.getItem(KEYS.TEMPLATES) || '{}');
  delete templates[studentId];
  localStorage.setItem(KEYS.TEMPLATES, JSON.stringify(templates));

  addAuditLog({
    action: 'BIOMETRIC_CONSENT_REVOKED',
    performed_by: `Student ${student.roll_number}`,
    target_entity: `BiometricConsent:${studentId}`,
    reason: 'Student withdrew biometric consent. All facial templates permanently purged.'
  });

  const currentUser = getCurrentUser();
  if (currentUser?.data?.id === studentId) {
    setCurrentUser({ role: 'student', data: student });
  }

  return { success: true, message: 'Consent revoked. Your facial biometric templates have been completely deleted.' };
}

// Session Methods
export function getSessions(): ClassSession[] {
  initializeStorage();
  return JSON.parse(localStorage.getItem(KEYS.SESSIONS) || '[]');
}

export function createSession(sessionData: Omit<ClassSession, 'id' | 'is_active' | 'fallback_otp'>): ClassSession {
  const sessions = getSessions();
  // Generate random 6 digit OTP for fallback
  const fallback_otp = Math.floor(100000 + Math.random() * 900000).toString();

  const newSession: ClassSession = {
    ...sessionData,
    id: sessions.length > 0 ? Math.max(...sessions.map(s => s.id)) + 1 : 101,
    is_active: true,
    fallback_otp
  };

  sessions.unshift(newSession);
  localStorage.setItem(KEYS.SESSIONS, JSON.stringify(sessions));

  addAuditLog({
    action: 'SESSION_OPENED',
    performed_by: sessionData.faculty_name,
    target_entity: `Session:${newSession.id} (${newSession.subject_code})`,
    reason: `Attendance window opened for Section ${newSession.section}`
  });

  return newSession;
}

export function toggleSession(sessionId: number): ClassSession | null {
  const sessions = getSessions();
  const session = sessions.find(s => s.id === sessionId);
  if (!session) return null;

  session.is_active = !session.is_active;
  localStorage.setItem(KEYS.SESSIONS, JSON.stringify(sessions));

  addAuditLog({
    action: session.is_active ? 'SESSION_REOPENED' : 'SESSION_CLOSED',
    performed_by: session.faculty_name,
    target_entity: `Session:${session.id}`,
    reason: session.is_active ? 'Attendance window extended' : 'Attendance window closed by faculty'
  });

  return session;
}

// Attendance Methods
export function getAttendance(): AttendanceRecord[] {
  initializeStorage();
  return JSON.parse(localStorage.getItem(KEYS.ATTENDANCE) || '[]');
}

export function markAttendance(
  sessionId: number,
  studentId: number,
  method: 'FACIAL_BIOMETRIC' | 'OTP_FALLBACK',
  confidenceScore = 0.94
): { success: boolean; message: string; record?: AttendanceRecord } {
  const sessions = getSessions();
  const session = sessions.find(s => s.id === sessionId);
  if (!session) return { success: false, message: 'Class session not found.' };

  if (!session.is_active) {
    return { success: false, message: 'This attendance window is closed. Please ask your faculty.' };
  }

  const students = getStudents();
  const student = students.find(s => s.id === studentId);
  if (!student) return { success: false, message: 'Student record not found.' };

  const attendanceList = getAttendance();

  // Prevent duplicate attendance for the same student and session
  const alreadyMarked = attendanceList.find(
    a => a.session_id === sessionId && a.student_id === studentId
  );
  if (alreadyMarked) {
    return {
      success: false,
      message: `Attendance is already recorded for this session at ${new Date(alreadyMarked.timestamp).toLocaleTimeString()}. Duplicate submissions are blocked.`
    };
  }

  const newRecord: AttendanceRecord = {
    id: attendanceList.length > 0 ? Math.max(...attendanceList.map(a => a.id)) + 1 : 1,
    session_id: sessionId,
    student_id: studentId,
    student_name: student.full_name,
    roll_number: student.roll_number,
    subject_name: session.subject_name,
    subject_code: session.subject_code,
    section: session.section,
    status: 'PRESENT',
    verification_method: method,
    confidence_score: method === 'FACIAL_BIOMETRIC' ? confidenceScore : undefined,
    timestamp: new Date().toISOString()
  };

  attendanceList.unshift(newRecord);
  localStorage.setItem(KEYS.ATTENDANCE, JSON.stringify(attendanceList));

  addAuditLog({
    action: 'ATTENDANCE_MARKED',
    performed_by: `${student.roll_number} (${method})`,
    target_entity: `Attendance:${newRecord.id}`,
    reason: `Verification passed with confidence ${(confidenceScore * 100).toFixed(1)}%`
  });

  return { success: true, message: 'ATTENDANCE MARKED SUCCESSFULLY – PRESENT', record: newRecord };
}

export function correctAttendance(
  recordId: number,
  newStatus: 'PRESENT' | 'ABSENT' | 'EXCUSED' | 'MANUAL_OVERRIDE',
  reason: string,
  facultyName: string
): { success: boolean; message: string } {
  const attendanceList = getAttendance();
  const record = attendanceList.find(r => r.id === recordId);
  if (!record) return { success: false, message: 'Attendance record not found.' };

  const previousStatus = record.status;
  record.status = newStatus;
  record.verification_method = 'FACULTY_OVERRIDE';
  localStorage.setItem(KEYS.ATTENDANCE, JSON.stringify(attendanceList));

  addAuditLog({
    action: 'ATTENDANCE_CORRECTED',
    performed_by: facultyName,
    target_entity: `Record:${record.id} (${record.roll_number})`,
    reason: `Status modified from ${previousStatus} to ${newStatus}. Reason: ${reason}`
  });

  return { success: true, message: `Status updated to ${newStatus}. Audit record created.` };
}

// Audit Logs
export function getAuditLogs(): AuditLog[] {
  initializeStorage();
  return JSON.parse(localStorage.getItem(KEYS.AUDIT_LOGS) || '[]');
}

export function addAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>): void {
  const logs = getAuditLogs();
  const newLog: AuditLog = {
    ...log,
    id: logs.length > 0 ? Math.max(...logs.map(l => l.id)) + 1 : 1,
    timestamp: new Date().toISOString()
  };
  logs.unshift(newLog);
  localStorage.setItem(KEYS.AUDIT_LOGS, JSON.stringify(logs));
}

// Active User Session Management
export function getCurrentUser(): { role: 'student' | 'faculty'; data: any } | null {
  initializeStorage();
  const user = localStorage.getItem(KEYS.CURRENT_USER);
  return user ? JSON.parse(user) : null;
}

export function setCurrentUser(user: { role: 'student' | 'faculty'; data: any } | null): void {
  if (user) {
    localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(KEYS.CURRENT_USER);
  }
}

// CSV Export Generator
export function exportAttendanceToCSV(sessionId?: number): void {
  const records = getAttendance();
  const filtered = sessionId ? records.filter(r => r.session_id === sessionId) : records;

  if (filtered.length === 0) {
    alert('No attendance records found to export.');
    return;
  }

  const headers = [
    'Record ID',
    'Roll Number',
    'Student Name',
    'Subject Code',
    'Subject Name',
    'Section',
    'Status',
    'Verification Method',
    'Confidence Score',
    'Timestamp'
  ];

  const rows = filtered.map(r => [
    r.id,
    `"${r.roll_number}"`,
    `"${r.student_name}"`,
    `"${r.subject_code}"`,
    `"${r.subject_name}"`,
    `"${r.section}"`,
    `"${r.status}"`,
    `"${r.verification_method}"`,
    r.confidence_score ? `${(r.confidence_score * 100).toFixed(1)}%` : 'N/A',
    `"${new Date(r.timestamp).toLocaleString()}"`
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `attendai_attendance_export_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
