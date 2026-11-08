# Attend-AI: AI-Powered Smart Attendance Management System

**Institution**: Gayatri Vidya Parishad College of Engineering (GVPCE), Visakhapatnam  
**Repository**: [https://github.com/tarunkumarsirivella2009-cmd/Attend-Ai](https://github.com/tarunkumarsirivella2009-cmd/Attend-Ai)  
**Architecture**: React 18 + TypeScript + Tailwind CSS (Frontend) | Python FastAPI + OpenCV + SQLAlchemy (Backend)

---

## 📌 1. Project Overview & Architecture

Attend-AI is an intelligent, privacy-first college attendance management platform featuring:
* **Student Portal**: Voluntary biometric enrollment, camera 1:1 face verification, non-biometric 6-digit session OTP fallback, and personal attendance statistics.
* **Faculty Portal**: Live lecture session scheduling, window controls, searchable student directory, audited manual status corrections, and CSV export.
* **Privacy by Design**: Explicit student consent requirement, right to withdraw consent and delete templates, zero permanent raw photograph storage, and encrypted 128-dimensional mathematical feature vectors.

```
┌─────────────────────────────────┐       REST API + JSON       ┌─────────────────────────────────┐
│     Frontend (Vercel)           │ <─────────────────────────> │      Backend (Render)           │
│   React + Vite + TypeScript     │   VITE_API_BASE_URL         │   FastAPI + OpenCV + SQLAlchemy │
│   Tailwind CSS + HTML5 Camera   │                             │   Bcrypt + JWT Authentication   │
└─────────────────────────────────┘                             └─────────────────────────────────┘
                                                                                 │
                                                                                 ▼
                                                                ┌─────────────────────────────────┐
                                                                │  Database (SQLite / PostgreSQL) │
                                                                │  9 Relational Tables            │
                                                                └─────────────────────────────────┘
```

---

## 🚀 2. Step-by-Step Deployment Guide (Free Tiers)

You can deploy the entire application for free using **Render** (Backend) and **Vercel** (Frontend).

### Part A: Deploy the Backend to Render (Free Tier)

Render hosts your Python FastAPI backend and provides an automatic public HTTPS URL.

1. **Sign in to Render**:
   * Open [https://render.com](https://render.com) and log in with your GitHub account.
2. **Create New Web Service**:
   * In the Render dashboard, click **"New +"** and choose **"Web Service"**.
   * Select your GitHub repository: `tarunkumarsirivella2009-cmd/Attend-Ai`.
3. **Configure Service Settings**:
   * **Name**: `attend-ai-backend` (or any unique name).
   * **Region**: Choose the closest region (e.g., Singapore or Frankfurt).
   * **Branch**: `main`
   * **Root Directory**: `backend` *(Important: set this to the backend folder)*.
   * **Runtime**: `Python 3`
   * **Build Command**: `pip install -r requirements.txt`
   * **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   * **Instance Type**: **Free**
4. **Configure Environment Variables**:
   Click **"Advanced"** > **"Add Environment Variable"**:
   * `FRONTEND_URL`: `https://attend-ai.vercel.app` *(or `*` during initial testing)*.
   * `ATTENDAI_SECRET_KEY`: *(enter a strong random string or click generate)*.
   * `PYTHON_VERSION`: `3.12.10`
5. **Set Health Check Path**:
   * Under Advanced, set **Health Check Path** to: `/health`.
6. **Click "Create Web Service"**:
   * Render will build dependencies and start the server.
   * When finished, copy your assigned backend URL (e.g., `https://attend-ai-backend.onrender.com`).

---

### Part B: Deploy the Frontend to Vercel (Free Tier)

Vercel hosts the React Single-Page Application (SPA) with automated global CDN distribution.

1. **Sign in to Vercel**:
   * Open [https://vercel.com](https://vercel.com) and log in with your GitHub account.
2. **Import Project**:
   * Click **"Add New..."** > **"Project"**.
   * Select the `Attend-Ai` repository and click **Import**.
3. **Configure Build Settings**:
   * **Framework Preset**: `Vite` (auto-detected).
   * **Root Directory**: Click *Edit* and select **`frontend`** *(Critical)*.
   * **Build Command**: `npm run build`
   * **Output Directory**: `dist`
4. **Set Production Environment Variable**:
   * Under **Environment Variables**, add:
     * **Key**: `VITE_API_BASE_URL`
     * **Value**: Your Render backend URL (e.g., `https://attend-ai-backend.onrender.com`).
5. **Click "Deploy"**:
   * Vercel will run TypeScript compilation and bundle assets.
   * In ~30 seconds, your application goes live on an official domain like `https://attend-ai.vercel.app`.

---

### Part C: Update CORS on Render (Final Step)

Once Vercel gives you your live frontend URL (e.g. `https://attend-ai-xxxx.vercel.app`):
1. Go back to Render Dashboard > your backend service > **Environment**.
2. Update `FRONTEND_URL` to match your exact Vercel URL.
3. Save changes. Render will automatically redeploy with strict CORS protection.

---

## ⚠️ 3. SQLite Storage Limitations on Free Cloud Hosting

### The Ephemeral Disk Reality:
* Render's free tier instances use **ephemeral (temporary) disks**.
* When a free service on Render is inactive for 15 minutes, it automatically spins down to conserve resources ("cold sleep").
* **When the service wakes up or redeploys, Render restarts the container from the clean Git repository.**
* Any data written to local `attendai.db` during that session (e.g., new student sign-ups, face enrollments, attendance marks) will be **wiped** on restart unless backed by persistent storage.

### Production Solution: Free Supabase PostgreSQL Database
Because Attend-AI is built using **SQLAlchemy**, you can switch from SQLite to a persistent cloud PostgreSQL database with **zero code changes**:
1. Create a free PostgreSQL database on [Supabase](https://supabase.com).
2. Copy the PostgreSQL connection URI:  
   `postgresql://postgres.xxx:password@aws-0-region.pooler.supabase.com:6543/postgres`
3. In your Render Dashboard, set the environment variable:
   `DATABASE_URL=your_supabase_postgres_uri`
4. Attend-AI will automatically initialize all 9 tables in PostgreSQL and retain all data permanently across container restarts!

---

## 🔑 4. Environment Variables Reference

| Variable Name | Component | Default (Local) | Production Example | Description |
| :--- | :--- | :--- | :--- | :--- |
| `VITE_API_BASE_URL` | Frontend | `http://localhost:8000` | `https://attend-ai-api.onrender.com` | Base URL used by React to communicate with the backend. |
| `PORT` | Backend | `8000` | Render assigns dynamically | Internal HTTP port for Uvicorn. |
| `FRONTEND_URL` | Backend | `*` | `https://attend-ai.vercel.app` | Allowed CORS origins for browser security. |
| `DATABASE_URL` | Backend | `sqlite:///./attendai.db` | `postgresql://...` (Supabase) | SQLAlchemy database connection string. |
| `ATTENDAI_SECRET_KEY` | Backend | Internal default | Random 64-char string | Secret key for signing HS256 JWT auth tokens. |

---

## 🛡️ 5. Security & Privacy Audit Verification

* ✅ **No Private Data in Git**: `.gitignore` strictly ignores SQLite database files (`*.db`), virtual environments (`venv/`), `node_modules/`, and `.env` secret files.
* ✅ **Biometric Protection**: Raw webcam frames are converted in memory to 128-dimensional spatial gradient vectors and discarded. No raw photographs are stored.
* ✅ **Bcrypt Hashing**: User passwords are never saved in plain text.
* ✅ **Audit Logging**: Manual faculty corrections demand a written reason that is permanently recorded in the `audit_logs` table.

---

## 🧪 6. Automated Testing Instructions

### Run Backend Tests (18 Unit & Integration Tests):
```powershell
cd backend
.\venv\Scripts\python.exe test_api.py
```

### Run Frontend Build Verification:
```powershell
cd frontend
npm.cmd run build
```

---

## ⚖️ 7. Prototype Capabilities & Honest Limitations

* **Face Detection**: Uses OpenCV's Haar Cascade classifier (`haarcascade_frontalface_default.xml`). Works well in standard classroom lighting and frontal webcam angles ($\pm 20^\circ$).
* **Liveness Detection**: Implements blur analysis (Laplacian variance), luminance checks, multi-face rejection, and guided user interaction. For high-security border/banking applications, specialized infrared or 3D depth sensors are required.
* **Verification Threshold**: Uses Cosine Similarity with a calibrated threshold of $72\%$.
