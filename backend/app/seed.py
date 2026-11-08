import json
from datetime import datetime, timedelta
from .database import engine, Base, SessionLocal
from .models import (
    Student, Faculty, Admin, BiometricConsent, FacialTemplate,
    Subject, ClassSession, AttendanceRecord, AuditLog
)
from .security import get_password_hash

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Check if already seeded
    if db.query(Student).first():
        print("[AttendAI] Database is already populated.")
        db.close()
        return

    print("[AttendAI] Seeding database with Gayatri Vidya Parishad College of Engineering (GVPCE) records...")

    # 1. Subjects
    sub1 = Subject(subject_code="CS101", subject_name="Data Structures & Algorithms", department="Computer Science & Engineering", total_classes=36)
    sub2 = Subject(subject_code="CS102", subject_name="Computer Organization & Architecture", department="Computer Science & Engineering", total_classes=32)
    sub3 = Subject(subject_code="MA101", subject_name="Engineering Mathematics & Calculus", department="Computer Science & Engineering", total_classes=40)
    sub4 = Subject(subject_code="CS103", subject_name="Object-Oriented Programming (C++/Java)", department="Computer Science & Engineering", total_classes=28)
    db.add_all([sub1, sub2, sub3, sub4])
    db.commit()

    # 2. Faculty
    fac1 = Faculty(
        faculty_id="FAC-CSE-01",
        full_name="Dr. K. V. Raman",
        email="kvraman@gvpce.ac.in",
        department="Computer Science & Engineering",
        hashed_password=get_password_hash("faculty123")
    )
    fac2 = Faculty(
        faculty_id="FAC-CSE-02",
        full_name="Prof. Ananya Sen",
        email="ananya.sen@gvpce.ac.in",
        department="Computer Science & Engineering",
        hashed_password=get_password_hash("faculty123")
    )
    db.add_all([fac1, fac2])
    db.commit()

    # 3. Admins
    admin1 = Admin(
        username="admin",
        email="admin@gvpce.ac.in",
        role="superadmin",
        hashed_password=get_password_hash("admin123")
    )
    db.add(admin1)
    db.commit()

    # 4. Students
    stu1 = Student(
        roll_number="24B91A0501",
        full_name="Tarun Varma",
        email="tarun.24b91a0501@gvpce.ac.in",
        department="Computer Science & Engineering",
        academic_year="1st Year",
        section="A",
        hashed_password=get_password_hash("tarun123")
    )
    stu2 = Student(
        roll_number="24B91A0502",
        full_name="Sneha Reddy",
        email="sneha.24b91a0502@gvpce.ac.in",
        department="Computer Science & Engineering",
        academic_year="1st Year",
        section="A",
        hashed_password=get_password_hash("sneha123")
    )
    stu3 = Student(
        roll_number="24B91A0503",
        full_name="Aditya Kumar",
        email="aditya.24b91a0503@gvpce.ac.in",
        department="Computer Science & Engineering",
        academic_year="1st Year",
        section="A",
        hashed_password=get_password_hash("aditya123")
    )
    db.add_all([stu1, stu2, stu3])
    db.commit()

    # 5. Biometric Consent & Template for Tarun & Sneha
    consent1 = BiometricConsent(
        student_id=stu1.id,
        consent_given=True,
        consent_text="Student voluntarily consented to 128-d facial embedding processing for attendance.",
        consent_timestamp=datetime.utcnow() - timedelta(days=20)
    )
    consent2 = BiometricConsent(
        student_id=stu2.id,
        consent_given=True,
        consent_text="Student voluntarily consented to 128-d facial embedding processing for attendance.",
        consent_timestamp=datetime.utcnow() - timedelta(days=20)
    )
    db.add_all([consent1, consent2])
    db.commit()

    # 128-d mock embedding vectors
    dummy_vec1 = [round(0.08 * (i % 5) - 0.04 * (i % 3), 4) for i in range(128)]
    dummy_vec2 = [round(0.06 * (i % 4) - 0.03 * (i % 2), 4) for i in range(128)]
    tpl1 = FacialTemplate(student_id=stu1.id, embedding_vector=json.dumps(dummy_vec1), quality_score=0.95)
    tpl2 = FacialTemplate(student_id=stu2.id, embedding_vector=json.dumps(dummy_vec2), quality_score=0.92)
    db.add_all([tpl1, tpl2])
    db.commit()

    # 6. Class Sessions
    today_str = datetime.utcnow().strftime("%Y-%m-%d")
    sess1 = ClassSession(
        subject_id=sub1.id,
        faculty_id=fac1.id,
        section="A",
        session_date=today_str,
        start_time="10:00 AM",
        end_time="11:00 AM",
        is_active=True,
        fallback_otp="749281"
    )
    sess2 = ClassSession(
        subject_id=sub2.id,
        faculty_id=fac2.id,
        section="A",
        session_date=today_str,
        start_time="11:15 AM",
        end_time="12:15 PM",
        is_active=False,
        fallback_otp="381902"
    )
    db.add_all([sess1, sess2])
    db.commit()

    # 7. Attendance Records
    rec1 = AttendanceRecord(
        session_id=sess1.id,
        student_id=stu2.id,
        status="PRESENT",
        verification_method="FACIAL_BIOMETRIC",
        confidence_score=0.94,
        timestamp=datetime.utcnow() - timedelta(minutes=22)
    )
    db.add(rec1)
    db.commit()

    # 8. Audit Logs
    audit1 = AuditLog(
        action="SESSION_CREATED",
        performed_by="FAC-CSE-01 (Dr. K. V. Raman)",
        target_entity=f"Session:{sess1.id} (CS101)",
        reason="Scheduled morning lecture session opened",
        timestamp=datetime.utcnow() - timedelta(minutes=45)
    )
    audit2 = AuditLog(
        action="BIOMETRIC_CONSENT_GRANTED",
        performed_by="Student 24B91A0501",
        target_entity=f"BiometricConsent:{stu1.id}",
        reason="Student voluntarily enrolled for facial attendance",
        timestamp=datetime.utcnow() - timedelta(days=20)
    )
    db.add_all([audit1, audit2])
    db.commit()

    print("[AttendAI] Database successfully seeded with 9 tables, initial students, faculty, sessions, and audit logs!")
    db.close()

if __name__ == "__main__":
    seed_database()
