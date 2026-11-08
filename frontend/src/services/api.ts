/**
 * AttendAI Centralized API Service
 * 
 * Uses VITE_API_BASE_URL environment variable for production (e.g. deployed on Render),
 * and defaults to http://localhost:8000 for local development.
 */

const RAW_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
export const API_BASE_URL = RAW_BASE_URL.replace(/\/+$/, '');

// Generic fetch wrapper with JSON parsing and error handling
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<{ data?: T; error?: string }> {
  try {
    const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };

    const res = await fetch(url, { ...options, headers });
    const json = await res.json().catch(() => null);

    if (!res.ok) {
      const errorMsg = json?.detail || json?.message || `Request failed with status ${res.status}`;
      return { error: errorMsg };
    }

    return { data: json };
  } catch (err: any) {
    return { error: err.message || 'Network error connecting to AttendAI backend server.' };
  }
}

// Health check
export async function checkBackendHealth() {
  return request<{ status: string; service: string }>('/health');
}

// Authentication
export async function apiRegisterStudent(payload: {
  full_name: string;
  roll_number: string;
  email: string;
  department: string;
  academic_year: string;
  section: string;
  password: string;
}) {
  return request<any>('/api/auth/student/register', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function apiLoginStudent(rollOrEmail: string, password: string) {
  return request<{ access_token: string; role: string; user_id: number; name: string }>('/api/auth/student/login', {
    method: 'POST',
    body: JSON.stringify({ roll_number_or_email: rollOrEmail, password })
  });
}

export async function apiLoginFaculty(facultyIdOrEmail: string, password: string) {
  return request<{ access_token: string; role: string; user_id: number; name: string }>('/api/auth/faculty/login', {
    method: 'POST',
    body: JSON.stringify({ faculty_id_or_email: facultyIdOrEmail, password })
  });
}

// Biometrics & Consent
export async function apiGetBiometricConsent(studentId: number) {
  return request<any>(`/api/biometrics/consent/${studentId}`);
}

export async function apiUpdateBiometricConsent(studentId: number, consentGiven: boolean, consentText: string) {
  return request<any>(`/api/biometrics/consent/${studentId}`, {
    method: 'POST',
    body: JSON.stringify({ consent_given: consentGiven, consent_text: consentText })
  });
}

export async function apiRevokeBiometricConsent(studentId: number) {
  return request<any>(`/api/biometrics/consent/${studentId}`, {
    method: 'DELETE'
  });
}

export async function apiEnrollFacialTemplate(studentId: number, imageBase64: string) {
  return request<any>(`/api/biometrics/enroll/${studentId}`, {
    method: 'POST',
    body: JSON.stringify({ image_base64: imageBase64 })
  });
}

// Attendance
export async function apiVerifyAttendance(studentId: number, sessionId: number, imageBase64: string) {
  return request<any>(`/api/attendance/verify/${studentId}`, {
    method: 'POST',
    body: JSON.stringify({ session_id: sessionId, image_base64: imageBase64 })
  });
}

export async function apiVerifyAttendanceOTP(studentId: number, sessionId: number, otp: string) {
  return request<any>(`/api/attendance/otp/${studentId}`, {
    method: 'POST',
    body: JSON.stringify({ session_id: sessionId, otp })
  });
}

export async function apiFetchAttendanceRecords(sessionId?: number, studentId?: number) {
  const params = new URLSearchParams();
  if (sessionId) params.append('session_id', sessionId.toString());
  if (studentId) params.append('student_id', studentId.toString());
  const query = params.toString() ? `?${params.toString()}` : '';
  return request<any[]>(`/api/attendance/records${query}`);
}

export async function apiCorrectAttendance(recordId: number, newStatus: string, reason: string) {
  return request<any>('/api/attendance/correct', {
    method: 'POST',
    body: JSON.stringify({ record_id: recordId, new_status: newStatus, reason })
  });
}

// Sessions & Directory
export async function apiFetchSessions() {
  return request<any[]>('/api/sessions');
}

export async function apiCreateSession(payload: {
  subject_id: number;
  section: string;
  session_date: string;
  start_time: string;
  end_time: string;
}) {
  return request<any>('/api/sessions', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function apiToggleSession(sessionId: number) {
  return request<any>(`/api/sessions/${sessionId}/toggle`, {
    method: 'PUT'
  });
}

export async function apiFetchStudents() {
  return request<any[]>('/api/students');
}

export async function apiFetchAuditLogs() {
  return request<any[]>('/api/audit-logs');
}
