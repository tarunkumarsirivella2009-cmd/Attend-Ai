import os
import json
import csv
import io
import random
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, status, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from .database import engine, Base, get_db
from .models import (
    Student, Faculty, Admin, BiometricConsent, FacialTemplate,
    Subject, ClassSession, AttendanceRecord, AuditLog
)
from .schemas import (
    StudentRegister, StudentLogin, StudentResponse,
    FacultyLogin, FacultyResponse, Token,
    ConsentRequest, ConsentResponse,
    FacialEnrollmentRequest, FacialEnrollmentResponse,
    FacialVerificationRequest, OTPVerificationRequest,
    SessionCreate, SessionResponse,
    AttendanceResponse, AttendanceCorrectionRequest,
    AuditLogResponse
)
from .security import (
    get_password_hash, verify_password, create_access_token
)
from .face_engine import face_engine

# Initialize database schema tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AttendAI API – Smart Facial Verification Attendance",
    description="Backend services for college facial verification attendance, consent protection, and faculty management.",
    version="1.0.0"
)

# Configure CORS using environment variable for deployed frontend
frontend_url_env = os.getenv("FRONTEND_URL", "*").strip()
if frontend_url_env == "*" or not frontend_url_env:
    allowed_origins = ["*"]
else:
    allowed_origins = [o.strip() for o in frontend_url_env.split(",") if o.strip()]
    for local in ["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5173", "http://127.0.0.1:5173"]:
        if local not in allowed_origins:
            allowed_origins.append(local)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------- SYSTEM & HEALTH -----------------

@app.get("/")
def root():
    return {
        "system": "AttendAI",
        "institution": "Gayatri Vidya Parishad College of Engineering (GVPCE)",
        "status": "Online",
        "version": "1.0.0",
        "biometrics_engine": "OpenCV Facial Cascade + 128d Normalized Gradient Embeddings"
    }

@app.get("/health")
@app.get("/api/health")
def health_check():
    """Health check endpoint for Render/uptime monitoring."""
    return {
        "status": "healthy",
        "service": "AttendAI Backend API",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "database": "sqlite" if "sqlite" in str(engine.url) else "postgresql"
    }

# ----------------- AUTHENTICATION -----------------

@app.post("/api/auth/student/register", response_model=StudentResponse)
def register_student(payload: StudentRegister, db: Session = Depends(get_db)):
    # Check duplicate roll number
    existing_roll = db.query(Student).filter(Student.roll_number == payload.roll_number.upper()).first()
    if existing_roll:
        raise HTTPException(status_code=400, detail=f"Roll number {payload.roll_number} is already registered.")

    # Check duplicate email
    existing_email = db.query(Student).filter(Student.email == payload.email.lower()).first()
    if existing_email:
        raise HTTPException(status_code=400, detail=f"Email {payload.email} is already registered.")

    hashed_pw = get_password_hash(payload.password)
    student = Student(
        full_name=payload.full_name,
        roll_number=payload.roll_number.upper(),
        email=payload.email.lower(),
        department=payload.department,
        academic_year=payload.academic_year,
        section=payload.section,
        hashed_password=hashed_pw
    )
    db.add(student)
    db.commit()
    db.refresh(student)

    # Log action to audit trail
    audit = AuditLog(
        action="STUDENT_REGISTERED",
        performed_by=f"Self ({student.roll_number})",
        target_entity=f"Student:{student.id}",
        reason="New student profile created via registration portal"
    )
    db.add(audit)
    db.commit()

    return student

@app.post("/api/auth/student/login", response_model=Token)
def login_student(payload: StudentLogin, db: Session = Depends(get_db)):
    identifier = payload.roll_number_or_email.strip()
    student = db.query(Student).filter(
        (Student.roll_number == identifier.upper()) | (Student.email == identifier.lower())
    ).first()

    if not student or not verify_password(payload.password, student.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid roll number/email or password.")

    token = create_access_token(data={"sub": student.roll_number, "role": "student", "id": student.id})
    return Token(
        access_token=token,
        role="student",
        user_id=student.id,
        name=student.full_name
    )

@app.post("/api/auth/faculty/login", response_model=Token)
def login_faculty(payload: FacultyLogin, db: Session = Depends(get_db)):
    identifier = payload.faculty_id_or_email.strip()
    faculty = db.query(Faculty).filter(
        (Faculty.faculty_id == identifier.upper()) | (Faculty.email == identifier.lower())
    ).first()

    if not faculty or not verify_password(payload.password, faculty.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid faculty ID or password.")

    token = create_access_token(data={"sub": faculty.faculty_id, "role": "faculty", "id": faculty.id})
    return Token(
        access_token=token,
        role="faculty",
        user_id=faculty.id,
        name=faculty.full_name
    )

# ----------------- BIOMETRICS & CONSENT -----------------

@app.get("/api/biometrics/consent/{student_id}")
def get_biometric_consent(student_id: int, db: Session = Depends(get_db)):
    consent = db.query(BiometricConsent).filter(BiometricConsent.student_id == student_id).first()
    has_template = db.query(FacialTemplate).filter(FacialTemplate.student_id == student_id).first() is not None
    return {
        "student_id": student_id,
        "consent_given": consent.consent_given if consent else False,
        "is_enrolled": has_template,
        "consent_timestamp": consent.consent_timestamp if consent else None,
        "revoked_at": consent.revoked_at if consent else None
    }

@app.post("/api/biometrics/consent/{student_id}")
def update_biometric_consent(student_id: int, payload: ConsentRequest, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found.")

    consent = db.query(BiometricConsent).filter(BiometricConsent.student_id == student_id).first()
    if not consent:
        consent = BiometricConsent(
            student_id=student_id,
            consent_given=payload.consent_given,
            consent_text=payload.consent_text
        )
        db.add(consent)
    else:
        consent.consent_given = payload.consent_given
        consent.consent_text = payload.consent_text
        if not payload.consent_given:
            consent.revoked_at = datetime.utcnow()

    db.commit()
    return {"success": True, "message": "Consent record updated."}

@app.delete("/api/biometrics/consent/{student_id}")
def revoke_biometric_consent(student_id: int, db: Session = Depends(get_db)):
    """Revokes consent and permanently purges the stored biometric template."""
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found.")

    # 1. Update consent table
    consent = db.query(BiometricConsent).filter(BiometricConsent.student_id == student_id).first()
    if consent:
        consent.consent_given = False
        consent.revoked_at = datetime.utcnow()

    # 2. Permanently delete facial template from database
    template = db.query(FacialTemplate).filter(FacialTemplate.student_id == student_id).first()
    if template:
        db.delete(template)

    # 3. Add to immutable audit trail
    audit = AuditLog(
        action="BIOMETRIC_CONSENT_REVOKED",
        performed_by=f"Student {student.roll_number}",
        target_entity=f"BiometricConsent:{student_id}",
        reason="Student exercised right to delete. Facial templates permanently purged."
    )
    db.add(audit)
    db.commit()

    return {"success": True, "message": "Biometric consent revoked. Template permanently deleted."}

@app.post("/api/biometrics/enroll/{student_id}", response_model=FacialEnrollmentResponse)
def enroll_facial_template(student_id: int, payload: FacialEnrollmentRequest, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found.")

    # Check consent
    consent = db.query(BiometricConsent).filter(BiometricConsent.student_id == student_id).first()
    if not consent or not consent.consent_given:
        raise HTTPException(status_code=400, detail="Explicit student biometric consent must be given before template enrollment.")

    # Decode image
    img = face_engine.decode_image(payload.image_base64)
    if img is None:
        raise HTTPException(status_code=400, detail="Failed to decode camera capture frame.")

    # Assess quality & liveness
    quality_ok, quality_msg, quality_score = face_engine.assess_liveness_and_quality(img)
    if not quality_ok:
        raise HTTPException(status_code=400, detail=quality_msg)

    # Detect face
    bbox, detect_msg = face_engine.detect_face(img)
    if bbox is None:
        raise HTTPException(status_code=400, detail=detect_msg)

    # Extract 128-d feature vector
    embedding = face_engine.extract_embedding(img, bbox)

    # Store in database
    existing_template = db.query(FacialTemplate).filter(FacialTemplate.student_id == student_id).first()
    if existing_template:
        existing_template.embedding_vector = json.dumps(embedding)
        existing_template.quality_score = quality_score
        existing_template.enrolled_at = datetime.utcnow()
    else:
        new_template = FacialTemplate(
            student_id=student_id,
            embedding_vector=json.dumps(embedding),
            model_version="OpenCV-HOG-128d-v1",
            quality_score=quality_score
        )
        db.add(new_template)

    # Log to audit trail
    audit = AuditLog(
        action="FACIAL_TEMPLATE_ENROLLED",
        performed_by=f"Student {student.roll_number}",
        target_entity=f"FacialTemplate:{student_id}",
        reason=f"128-d embedding saved with quality score {quality_score:.2f}"
    )
    db.add(audit)
    db.commit()

    return FacialEnrollmentResponse(
        success=True,
        message="Facial biometric template generated and enrolled successfully.",
        model_version="OpenCV-HOG-128d-v1",
        quality_score=quality_score
    )

# ----------------- ATTENDANCE ENGINE -----------------

@app.post("/api/attendance/verify/{student_id}")
def verify_attendance(student_id: int, payload: FacialVerificationRequest, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found.")

    # Check active session
    session = db.query(ClassSession).filter(ClassSession.id == payload.session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Class session not found.")
    if not session.is_active:
        raise HTTPException(status_code=400, detail="This class attendance window is closed.")

    # Check if duplicate attendance exists for this student and session
    existing_attendance = db.query(AttendanceRecord).filter(
        AttendanceRecord.session_id == payload.session_id,
        AttendanceRecord.student_id == student_id
    ).first()
    if existing_attendance:
        raise HTTPException(
            status_code=400,
            detail=f"Attendance already recorded at {existing_attendance.timestamp.strftime('%H:%M:%S')}. Duplicate submissions blocked."
        )

    # Check if student is enrolled
    template = db.query(FacialTemplate).filter(FacialTemplate.student_id == student_id).first()
    if not template:
        raise HTTPException(status_code=400, detail="No enrolled biometric template found for this student. Use session OTP fallback.")

    enrolled_vector = json.loads(template.embedding_vector)

    # Decode live image
    img = face_engine.decode_image(payload.image_base64)
    if img is None:
        raise HTTPException(status_code=400, detail="Invalid image payload.")

    # Detect face in live capture
    bbox, detect_msg = face_engine.detect_face(img)
    if bbox is None:
        raise HTTPException(status_code=400, detail=detect_msg)

    # Extract live vector
    live_vector = face_engine.extract_embedding(img, bbox)

    # 1:1 Cosine Similarity Match
    is_match, similarity = face_engine.verify_1to1(live_vector, enrolled_vector)

    if not is_match:
        raise HTTPException(
            status_code=400,
            detail=f"Facial identity match failed (Confidence: {similarity*100:.1f}%). Does not match registered student template."
        )

    # Record attendance
    record = AttendanceRecord(
        session_id=session.id,
        student_id=student.id,
        status="PRESENT",
        verification_method="FACIAL_BIOMETRIC",
        confidence_score=similarity
    )
    db.add(record)

    audit = AuditLog(
        action="ATTENDANCE_MARKED",
        performed_by=f"{student.roll_number} (FACIAL_BIOMETRIC)",
        target_entity=f"AttendanceRecord:Session-{session.id}",
        reason=f"Verification successful with match confidence {similarity*100:.1f}%"
    )
    db.add(audit)
    db.commit()
    db.refresh(record)

    return {
        "success": True,
        "message": "ATTENDANCE MARKED SUCCESSFULLY – PRESENT",
        "student_name": student.full_name,
        "roll_number": student.roll_number,
        "subject": session.subject.subject_name,
        "date": session.session_date,
        "time": record.timestamp.strftime("%H:%M:%S"),
        "confidence_score": similarity,
        "record_id": record.id
    }

@app.post("/api/attendance/otp/{student_id}")
def verify_attendance_otp(student_id: int, payload: OTPVerificationRequest, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found.")

    session = db.query(ClassSession).filter(ClassSession.id == payload.session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Class session not found.")
    if not session.is_active:
        raise HTTPException(status_code=400, detail="This class attendance window is closed.")

    # Duplicate check
    existing = db.query(AttendanceRecord).filter(
        AttendanceRecord.session_id == payload.session_id,
        AttendanceRecord.student_id == student_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Attendance already recorded for this session.")

    if payload.otp.strip() != session.fallback_otp:
        raise HTTPException(status_code=400, detail="Invalid session OTP. Check with your classroom faculty.")

    record = AttendanceRecord(
        session_id=session.id,
        student_id=student.id,
        status="PRESENT",
        verification_method="OTP_FALLBACK"
    )
    db.add(record)

    audit = AuditLog(
        action="ATTENDANCE_MARKED",
        performed_by=f"{student.roll_number} (OTP_FALLBACK)",
        target_entity=f"AttendanceRecord:Session-{session.id}",
        reason="Verified via faculty classroom 6-digit OTP code"
    )
    db.add(audit)
    db.commit()

    return {
        "success": True,
        "message": "ATTENDANCE MARKED SUCCESSFULLY – PRESENT",
        "verification_method": "OTP_FALLBACK"
    }

@app.get("/api/attendance/records")
def list_attendance_records(
    session_id: Optional[int] = Query(None),
    student_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(AttendanceRecord)
    if session_id:
        query = query.filter(AttendanceRecord.session_id == session_id)
    if student_id:
        query = query.filter(AttendanceRecord.student_id == student_id)
    
    records = query.order_by(AttendanceRecord.timestamp.desc()).all()
    results = []
    for r in records:
        results.append({
            "id": r.id,
            "session_id": r.session_id,
            "student_id": r.student_id,
            "student_name": r.student.full_name,
            "roll_number": r.student.roll_number,
            "subject_name": r.session.subject.subject_name,
            "subject_code": r.session.subject.subject_code,
            "section": r.session.section,
            "status": r.status,
            "verification_method": r.verification_method,
            "confidence_score": r.confidence_score,
            "timestamp": r.timestamp.isoformat()
        })
    return results

@app.post("/api/attendance/correct")
def correct_attendance_record(payload: AttendanceCorrectionRequest, db: Session = Depends(get_db)):
    record = db.query(AttendanceRecord).filter(AttendanceRecord.id == payload.record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Attendance record not found.")

    if not payload.reason.strip():
        raise HTTPException(status_code=400, detail="Mandatory reason required for manual attendance correction.")

    old_status = record.status
    record.status = payload.new_status
    record.verification_method = "FACULTY_OVERRIDE"

    audit = AuditLog(
        action="ATTENDANCE_CORRECTED",
        performed_by="FACULTY_ADMIN",
        target_entity=f"AttendanceRecord:{record.id} ({record.student.roll_number})",
        reason=f"Status modified from {old_status} to {payload.new_status}. Reason: {payload.reason}"
    )
    db.add(audit)
    db.commit()

    return {"success": True, "message": f"Attendance updated to {payload.new_status}. Audit record created."}

@app.get("/api/attendance/export-csv")
def export_csv(session_id: Optional[int] = Query(None), db: Session = Depends(get_db)):
    query = db.query(AttendanceRecord)
    if session_id:
        query = query.filter(AttendanceRecord.session_id == session_id)
    records = query.all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Record ID", "Roll Number", "Student Name", "Subject Code", 
        "Subject Name", "Section", "Status", "Verification Method", 
        "Confidence Score", "Timestamp"
    ])

    for r in records:
        writer.writerow([
            r.id,
            r.student.roll_number,
            r.student.full_name,
            r.session.subject.subject_code,
            r.session.subject.subject_name,
            r.session.section,
            r.status,
            r.verification_method,
            f"{r.confidence_score*100:.1f}%" if r.confidence_score else "N/A",
            r.timestamp.strftime("%Y-%m-%d %H:%M:%S")
        ])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=attendai_export_{datetime.utcnow().strftime('%Y%m%d')}.csv"}
    )

# ----------------- SESSIONS & DIRECTORY -----------------

@app.get("/api/sessions")
def list_sessions(db: Session = Depends(get_db)):
    sessions = db.query(ClassSession).order_by(ClassSession.id.desc()).all()
    results = []
    for s in sessions:
        results.append({
            "id": s.id,
            "subject_id": s.subject_id,
            "subject_code": s.subject.subject_code,
            "subject_name": s.subject.subject_name,
            "faculty_id": s.faculty_id,
            "faculty_name": s.faculty.full_name,
            "section": s.section,
            "session_date": s.session_date,
            "start_time": s.start_time,
            "end_time": s.end_time,
            "is_active": s.is_active,
            "fallback_otp": s.fallback_otp
        })
    return results

@app.post("/api/sessions")
def create_class_session(payload: SessionCreate, db: Session = Depends(get_db)):
    subject = db.query(Subject).filter(Subject.id == payload.subject_id).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found.")

    faculty = db.query(Faculty).first() # Default to primary faculty
    fallback_otp = str(random.randint(100000, 999999))

    session = ClassSession(
        subject_id=subject.id,
        faculty_id=faculty.id if faculty else 1,
        section=payload.section,
        session_date=payload.session_date,
        start_time=payload.start_time,
        end_time=payload.end_time,
        is_active=True,
        fallback_otp=fallback_otp
    )
    db.add(session)

    audit = AuditLog(
        action="SESSION_OPENED",
        performed_by=faculty.full_name if faculty else "Faculty",
        target_entity=f"Session:{subject.subject_code} (Sec {payload.section})",
        reason=f"Attendance window opened from {payload.start_time} to {payload.end_time}"
    )
    db.add(audit)
    db.commit()
    db.refresh(session)
    return session

@app.put("/api/sessions/{session_id}/toggle")
def toggle_session_window(session_id: int, db: Session = Depends(get_db)):
    session = db.query(ClassSession).filter(ClassSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found.")

    session.is_active = not session.is_active
    audit = AuditLog(
        action="SESSION_REOPENED" if session.is_active else "SESSION_CLOSED",
        performed_by="Faculty Admin",
        target_entity=f"Session:{session.id}",
        reason="Attendance window status modified by faculty"
    )
    db.add(audit)
    db.commit()
    return {"id": session.id, "is_active": session.is_active}

@app.get("/api/students")
def list_students(db: Session = Depends(get_db)):
    students = db.query(Student).all()
    results = []
    for s in students:
        consent = db.query(BiometricConsent).filter(BiometricConsent.student_id == s.id).first()
        template = db.query(FacialTemplate).filter(FacialTemplate.student_id == s.id).first()
        results.append({
            "id": s.id,
            "roll_number": s.roll_number,
            "full_name": s.full_name,
            "email": s.email,
            "department": s.department,
            "academic_year": s.academic_year,
            "section": s.section,
            "has_biometric_consent": consent.consent_given if consent else False,
            "is_enrolled": template is not None,
            "created_at": s.created_at.isoformat()
        })
    return results

@app.get("/api/audit-logs", response_model=List[AuditLogResponse])
def get_audit_trail(db: Session = Depends(get_db)):
    logs = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).all()
    return logs

if __name__ == "__main__":
    import uvicorn
    # Render assigns PORT dynamically; default to 8000 for local dev
    port = int(os.environ.get("PORT", 8000))
    # Must bind to 0.0.0.0 for external cloud access
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=False)

