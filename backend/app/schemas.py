from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    user_id: int
    name: str

class TokenData(BaseModel):
    identifier: Optional[str] = None
    role: Optional[str] = None

# Student Schemas
class StudentRegister(BaseModel):
    full_name: str
    roll_number: str
    email: str
    department: str
    academic_year: str
    section: str
    password: str

class StudentLogin(BaseModel):
    roll_number_or_email: str
    password: str

class StudentResponse(BaseModel):
    id: int
    roll_number: str
    full_name: str
    email: str
    department: str
    academic_year: str
    section: str
    has_biometric_consent: bool = False
    is_enrolled: bool = False
    created_at: datetime

    class Config:
        from_attributes = True

# Faculty Schemas
class FacultyLogin(BaseModel):
    faculty_id_or_email: str
    password: str

class FacultyResponse(BaseModel):
    id: int
    faculty_id: str
    full_name: str
    email: str
    department: str
    created_at: datetime

    class Config:
        from_attributes = True

# Biometric Consent Schemas
class ConsentRequest(BaseModel):
    consent_given: bool
    consent_text: str

class ConsentResponse(BaseModel):
    student_id: int
    consent_given: bool
    consent_timestamp: datetime
    revoked_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Facial Template & Verification Schemas
class FacialEnrollmentRequest(BaseModel):
    image_base64: str

class FacialEnrollmentResponse(BaseModel):
    model_config = {"protected_namespaces": ()}
    success: bool
    message: str
    model_version: str
    quality_score: float

class FacialVerificationRequest(BaseModel):
    session_id: int
    image_base64: str

class OTPVerificationRequest(BaseModel):
    session_id: int
    otp: str

# Class Session Schemas
class SessionCreate(BaseModel):
    subject_id: int
    section: str
    session_date: str
    start_time: str
    end_time: str

class SessionResponse(BaseModel):
    id: int
    subject_id: int
    subject_code: str
    subject_name: str
    faculty_id: int
    faculty_name: str
    section: str
    session_date: str
    start_time: str
    end_time: str
    is_active: bool
    fallback_otp: str

    class Config:
        from_attributes = True

# Attendance Schemas
class AttendanceResponse(BaseModel):
    id: int
    session_id: int
    student_id: int
    student_name: str
    roll_number: str
    subject_name: str
    subject_code: str
    section: str
    status: str
    verification_method: str
    confidence_score: Optional[float] = None
    timestamp: datetime

    class Config:
        from_attributes = True

class AttendanceCorrectionRequest(BaseModel):
    record_id: int
    new_status: str # PRESENT, ABSENT, EXCUSED, MANUAL_OVERRIDE
    reason: str

# Audit Log Schemas
class AuditLogResponse(BaseModel):
    id: int
    action: str
    performed_by: str
    target_entity: str
    reason: str
    timestamp: datetime

    class Config:
        from_attributes = True
