# AttendAI – Smart Facial Verification Attendance System

**Institution**: Gayatri Vidya Parishad College of Engineering (GVPCE), Visakhapatnam  
**Platform**: Windows 11 (HP Victus)  
**Architecture**: React 18 + TypeScript + Tailwind CSS (Frontend) | Python FastAPI + OpenCV + SQLAlchemy (Backend)

---

## 📌 Project Overview
AttendAI is an enterprise-grade college attendance management application. It replaces error-prone paper registers and proxy sign-ins with an intelligent, privacy-first facial verification platform.

### Core Capabilities
* **Voluntary Biometric Consent**: Explicit, legally sound consent workflow before activating camera sensors.
* **Biometric Right to Delete**: One-click consent withdrawal that permanently purges the student's mathematical face template from the database.
* **1:1 Identity Verification**: Does not perform mass surveillance; verifies a live student solely against their own enrolled identity template.
* **Active Session Enforcement**: Students can only mark attendance during an active class window opened by faculty.
* **Duplicate Submission Guard**: Rejects subsequent attendance attempts for the same lecture session.
* **Non-Biometric Alternative**: Fallback 6-digit session OTP code generated per lecture for camera-exempted students.
* **Faculty Audit Trail**: Mandatory justification logging for every manual status adjustment.

---

## 🗄️ Database Design (9 Core Tables)

1. `students`: Unique roll number, college email, department, section, hashed password.
2. `faculty`: Unique faculty ID, department, credentials.
3. `admins`: Superadmin access and permissions.
4. `biometric_consents`: Timestamped record of student opt-in/opt-out status.
5. `facial_templates`: 128-dimensional mathematical feature vectors (never raw photos).
6. `subjects`: College subjects (e.g. CS101 - Data Structures).
7. `class_sessions`: Scheduled lecture sessions with start/end time windows and fallback OTP.
8. `attendance_records`: Immutable log of student attendance with confidence score and method.
9. `audit_logs`: Detailed audit trail capturing actor, target, timestamp, and justification reason.

---

## 🚀 How to Run Locally on Windows 11

### 1. Start the FastAPI Backend
Open PowerShell and run:
```powershell
cd C:\Users\tarun\.gemini\antigravity\scratch\attendai\backend
.\venv\Scripts\uvicorn.exe app.main:app --host 127.0.0.1 --port 8000 --reload
```
Interactive API documentation will be available at: **http://127.0.0.1:8000/docs**

### 2. Start the React Frontend
In a second PowerShell window, run:
```powershell
cd C:\Users\tarun\.gemini\antigravity\scratch\attendai\frontend
npm.cmd run dev
```
Open your browser at: **http://localhost:3000**

---

## 🧪 Automated Testing
To run the automated 17-point test suite:
```powershell
cd C:\Users\tarun\.gemini\antigravity\scratch\attendai\backend
.\venv\Scripts\python.exe test_api.py
```

---

## ⚖️ Honest Technical Capabilities & Current Limitations

### Fully Functional Features:
- Complete frontend UI for Student and Faculty portals.
- 1:1 Cosine Similarity vector comparison engine ($\ge 72\%$ threshold).
- OpenCV Haar Cascade facial bounding box detection.
- Laplacian variance blur detection and luminance analysis.
- Relational database schema with foreign keys and unique constraints.
- Bcrypt password hashing and JWT token issuance.
- Fallback OTP verification and duplicate attendance blocking.
- CSV report generator.

### Prototype Limitations:
- The bundled face detector uses OpenCV's canonical Haar Cascade + spatial gradient histograms. While robust for standard lighting and webcam angles, enterprise production deployments typically upgrade to heavy deep neural networks (e.g. InsightFace ArcFace ResNet-100 or MediaPipe FaceMesh) running on dedicated GPU servers.
- The liveness challenge includes blur analysis, multi-face rejection, and simulated blink/micro-motion guidance. Advanced infrared depth-sensing or thermal sensors are recommended for high-stakes biometric access.
