import { Student, Faculty, Subject, ClassSession, AttendanceRecord, AuditLog, BiometricConsent } from '../types';

export const INITIAL_STUDENTS: Student[] = [
  {
    id: 1,
    roll_number: "24B91A0501",
    full_name: "Tarun Varma",
    email: "tarun.24b91a0501@gvpce.ac.in",
    department: "Computer Science & Engineering",
    academic_year: "1st Year",
    section: "A",
    has_biometric_consent: true,
    is_enrolled: true,
    created_at: "2026-08-10T09:00:00Z"
  },
  {
    id: 2,
    roll_number: "24B91A0502",
    full_name: "Sneha Reddy",
    email: "sneha.24b91a0502@gvpce.ac.in",
    department: "Computer Science & Engineering",
    academic_year: "1st Year",
    section: "A",
    has_biometric_consent: true,
    is_enrolled: true,
    created_at: "2026-08-10T09:15:00Z"
  },
  {
    id: 3,
    roll_number: "24B91A0503",
    full_name: "Aditya Kumar",
    email: "aditya.24b91a0503@gvpce.ac.in",
    department: "Computer Science & Engineering",
    academic_year: "1st Year",
    section: "A",
    has_biometric_consent: false,
    is_enrolled: false,
    created_at: "2026-08-11T10:00:00Z"
  },
  {
    id: 4,
    roll_number: "24B91A0504",
    full_name: "Pooja Sharma",
    email: "pooja.24b91a0504@gvpce.ac.in",
    department: "Computer Science & Engineering",
    academic_year: "1st Year",
    section: "B",
    has_biometric_consent: true,
    is_enrolled: true,
    created_at: "2026-08-11T10:30:00Z"
  },
  {
    id: 5,
    roll_number: "24B91A0505",
    full_name: "Kiran Prasad",
    email: "kiran.24b91a0505@gvpce.ac.in",
    department: "Computer Science & Engineering",
    academic_year: "1st Year",
    section: "A",
    has_biometric_consent: true,
    is_enrolled: true,
    created_at: "2026-08-12T11:00:00Z"
  }
];

export const INITIAL_FACULTY: Faculty[] = [
  {
    id: 1,
    faculty_id: "FAC-CSE-01",
    full_name: "Dr. K. V. Raman",
    email: "kvraman@gvpce.ac.in",
    department: "Computer Science & Engineering",
    created_at: "2020-06-01T08:00:00Z"
  },
  {
    id: 2,
    faculty_id: "FAC-CSE-02",
    full_name: "Prof. Ananya Sen",
    email: "ananya.sen@gvpce.ac.in",
    department: "Computer Science & Engineering",
    created_at: "2021-07-15T08:00:00Z"
  }
];

export const INITIAL_SUBJECTS: Subject[] = [
  {
    id: 1,
    subject_code: "CS101",
    subject_name: "Data Structures & Algorithms",
    department: "Computer Science & Engineering",
    total_classes: 36
  },
  {
    id: 2,
    subject_code: "CS102",
    subject_name: "Computer Organization & Architecture",
    department: "Computer Science & Engineering",
    total_classes: 32
  },
  {
    id: 3,
    subject_code: "MA101",
    subject_name: "Engineering Mathematics & Calculus",
    department: "Computer Science & Engineering",
    total_classes: 40
  },
  {
    id: 4,
    subject_code: "CS103",
    subject_name: "Object-Oriented Programming (C++/Java)",
    department: "Computer Science & Engineering",
    total_classes: 28
  }
];

export const INITIAL_SESSIONS: ClassSession[] = [
  {
    id: 101,
    subject_id: 1,
    subject_code: "CS101",
    subject_name: "Data Structures & Algorithms",
    faculty_id: 1,
    faculty_name: "Dr. K. V. Raman",
    section: "A",
    session_date: new Date().toISOString().split('T')[0],
    start_time: "10:00 AM",
    end_time: "11:00 AM",
    is_active: true,
    fallback_otp: "749281"
  },
  {
    id: 102,
    subject_id: 2,
    subject_code: "CS102",
    subject_name: "Computer Organization & Architecture",
    faculty_id: 2,
    faculty_name: "Prof. Ananya Sen",
    section: "A",
    session_date: new Date().toISOString().split('T')[0],
    start_time: "11:15 AM",
    end_time: "12:15 PM",
    is_active: false,
    fallback_otp: "381902"
  }
];

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  {
    id: 1,
    session_id: 101,
    student_id: 2,
    student_name: "Sneha Reddy",
    roll_number: "24B91A0502",
    subject_name: "Data Structures & Algorithms",
    subject_code: "CS101",
    section: "A",
    status: "PRESENT",
    verification_method: "FACIAL_BIOMETRIC",
    confidence_score: 0.94,
    timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString()
  },
  {
    id: 2,
    session_id: 101,
    student_id: 5,
    student_name: "Kiran Prasad",
    roll_number: "24B91A0505",
    subject_name: "Data Structures & Algorithms",
    subject_code: "CS101",
    section: "A",
    status: "PRESENT",
    verification_method: "FACIAL_BIOMETRIC",
    confidence_score: 0.91,
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString()
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 1,
    action: "SESSION_CREATED",
    performed_by: "FAC-CSE-01 (Dr. K. V. Raman)",
    target_entity: "Session CS101 (Section A)",
    reason: "Scheduled morning lecture session opened",
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString()
  },
  {
    id: 2,
    action: "BIOMETRIC_CONSENT_GRANTED",
    performed_by: "Student: 24B91A0501",
    target_entity: "BiometricConsent",
    reason: "Student voluntarily agreed to biometric facial template processing",
    timestamp: "2026-08-10T09:05:00Z"
  }
];

export const CONSENT_POLICY_TEXT = `
BIOMETRIC INFORMATION PRIVACY & USAGE POLICY

1. Purpose: AttendAI collects and processes your facial biometric information solely for verifying identity during college classroom attendance sessions.
2. What is Collected: A mathematical feature vector (128-dimensional embedding) calculated from your camera image. Your raw facial photograph is NOT permanently stored; it is converted to encrypted numerical values and discarded.
3. Retention Period: Facial templates are stored securely in the college database only for the duration of your academic program or until you withdraw your consent.
4. Security & Privacy: Biometric templates are never sold, leased, or disclosed to third parties. They are never exposed via unauthenticated endpoints.
5. Voluntary Consent & Non-Biometric Alternative: Enrollment is strictly voluntary. You may withdraw consent at any time from your student portal, which immediately purges your stored facial template. Students who opt out are provided non-biometric attendance alternatives (such as faculty-generated 6-digit session OTPs).
`;
