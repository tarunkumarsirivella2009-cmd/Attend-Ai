from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Boolean, DateTime, Float, ForeignKey, Text, UniqueConstraint
)
from sqlalchemy.orm import relationship
from .database import Base

class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    roll_number = Column(String(50), unique=True, index=True, nullable=False)
    full_name = Column(String(100), nullable=False)
    email = Column(String(120), unique=True, index=True, nullable=False)
    department = Column(String(100), nullable=False)
    academic_year = Column(String(50), nullable=False)
    section = Column(String(10), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    biometric_consent = relationship("BiometricConsent", back_populates="student", uselist=False, cascade="all, delete-orphan")
    facial_template = relationship("FacialTemplate", back_populates="student", uselist=False, cascade="all, delete-orphan")
    attendance_records = relationship("AttendanceRecord", back_populates="student", cascade="all, delete-orphan")


class Faculty(Base):
    __tablename__ = "faculty"

    id = Column(Integer, primary_key=True, index=True)
    faculty_id = Column(String(50), unique=True, index=True, nullable=False)
    full_name = Column(String(100), nullable=False)
    email = Column(String(120), unique=True, index=True, nullable=False)
    department = Column(String(100), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    sessions = relationship("ClassSession", back_populates="faculty")


class Admin(Base):
    __tablename__ = "admins"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(120), unique=True, index=True, nullable=False)
    role = Column(String(50), default="admin", nullable=False)
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class BiometricConsent(Base):
    __tablename__ = "biometric_consents"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), unique=True, nullable=False)
    consent_given = Column(Boolean, default=False, nullable=False)
    consent_text = Column(Text, nullable=False)
    consent_timestamp = Column(DateTime, default=datetime.utcnow)
    revoked_at = Column(DateTime, nullable=True)

    # Relationship
    student = relationship("Student", back_populates="biometric_consent")


class FacialTemplate(Base):
    __tablename__ = "facial_templates"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), unique=True, nullable=False)
    # Storing serialized 128-d float array (e.g. JSON string "[0.12, -0.45, ...]")
    embedding_vector = Column(Text, nullable=False)
    model_version = Column(String(50), default="facenet-128d-v1", nullable=False)
    quality_score = Column(Float, default=0.90, nullable=False)
    enrolled_at = Column(DateTime, default=datetime.utcnow)

    # Relationship
    student = relationship("Student", back_populates="facial_template")


class Subject(Base):
    __tablename__ = "subjects"

    id = Column(Integer, primary_key=True, index=True)
    subject_code = Column(String(20), unique=True, index=True, nullable=False)
    subject_name = Column(String(120), nullable=False)
    department = Column(String(100), nullable=False)
    total_classes = Column(Integer, default=36, nullable=False)

    # Relationship
    sessions = relationship("ClassSession", back_populates="subject")


class ClassSession(Base):
    __tablename__ = "class_sessions"

    id = Column(Integer, primary_key=True, index=True)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)
    faculty_id = Column(Integer, ForeignKey("faculty.id"), nullable=False)
    section = Column(String(10), nullable=False)
    session_date = Column(String(20), nullable=False) # YYYY-MM-DD
    start_time = Column(String(20), nullable=False)
    end_time = Column(String(20), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    fallback_otp = Column(String(10), nullable=False)

    # Relationships
    subject = relationship("Subject", back_populates="sessions")
    faculty = relationship("Faculty", back_populates="sessions")
    attendance_records = relationship("AttendanceRecord", back_populates="session", cascade="all, delete-orphan")


class AttendanceRecord(Base):
    __tablename__ = "attendance_records"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("class_sessions.id", ondelete="CASCADE"), nullable=False)
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    status = Column(String(30), default="PRESENT", nullable=False) # PRESENT, ABSENT, EXCUSED, MANUAL_OVERRIDE
    verification_method = Column(String(30), nullable=False) # FACIAL_BIOMETRIC, OTP_FALLBACK, FACULTY_OVERRIDE
    confidence_score = Column(Float, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

    # Enforce unique attendance submission per student per session!
    __table_args__ = (
        UniqueConstraint("session_id", "student_id", name="uq_session_student_attendance"),
    )

    # Relationships
    session = relationship("ClassSession", back_populates="attendance_records")
    student = relationship("Student", back_populates="attendance_records")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    action = Column(String(100), nullable=False)
    performed_by = Column(String(100), nullable=False)
    target_entity = Column(String(100), nullable=False)
    reason = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
