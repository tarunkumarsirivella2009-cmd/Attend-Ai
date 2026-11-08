// AttendAI Core Type Definitions

export type UserRole = 'student' | 'faculty' | 'admin';

export interface Student {
  id: number;
  roll_number: string;
  full_name: string;
  email: string;
  department: string;
  academic_year: string;
  section: string;
  has_biometric_consent: boolean;
  is_enrolled: boolean;
  avatar_url?: string;
  created_at: string;
}

export interface Faculty {
  id: number;
  faculty_id: string;
  full_name: string;
  email: string;
  department: string;
  created_at: string;
}

export interface BiometricConsent {
  id: number;
  student_id: number;
  consent_given: boolean;
  consent_text: string;
  consent_timestamp: string;
  revoked_at?: string | null;
}

export interface FacialTemplate {
  id: number;
  student_id: number;
  embedding_vector: number[]; // 128-dimensional mathematical representation
  model_version: string;
  quality_score: number;
  enrolled_at: string;
}

export interface Subject {
  id: number;
  subject_code: string;
  subject_name: string;
  department: string;
  total_classes: number;
}

export interface ClassSession {
  id: number;
  subject_id: number;
  subject_code: string;
  subject_name: string;
  faculty_id: number;
  faculty_name: string;
  section: string;
  session_date: string; // YYYY-MM-DD
  start_time: string;
  end_time: string;
  is_active: boolean;
  fallback_otp: string; // 6-digit code for non-biometric fallback
}

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'EXCUSED' | 'MANUAL_OVERRIDE';
export type VerificationMethod = 'FACIAL_BIOMETRIC' | 'OTP_FALLBACK' | 'FACULTY_OVERRIDE';

export interface AttendanceRecord {
  id: number;
  session_id: number;
  student_id: number;
  student_name: string;
  roll_number: string;
  subject_name: string;
  subject_code: string;
  section: string;
  status: AttendanceStatus;
  verification_method: VerificationMethod;
  confidence_score?: number; // e.g. 0.94 (94%)
  timestamp: string;
}

export interface AuditLog {
  id: number;
  action: string;
  performed_by: string;
  target_entity: string;
  reason: string;
  timestamp: string;
}

export interface LivenessChallenge {
  id: string;
  instruction: string;
  duration_seconds: number;
  completed: boolean;
}
