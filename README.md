# NEXORA – Enterprise Multimodal Brand Governance Platform

> **Intelligent Evidence-Based AI Governance & Active Advertisement Recall Engine**

---

## 1. Overview

**NEXORA** is a multi-agent brand compliance and advertising recall system. It reviews marketing creatives (PDF, DOCX, PPTX, PNG, JPG, or verified public URLs) against approved enterprise brand knowledge documents before publication, preventing brand drift, factual hallucinations, and regulatory fines.

### Core Architecture
- **Brand Knowledge Hub:** Upload official brand guidelines, technical specification sheets, and legal disclaimers. Ingested documents remain quarantined until an **Admin** formally approves them, which indexes facts into ChromaDB vector collections.
- **Six Specialized AI Guardians & Risk Manager:**
  1. **Fact Guardian:** Verifies quantitative product specs against approved knowledge (`Supported`, `Contradicted`, `Outdated`, `Unverifiable`).
  2. **Claims Guardian:** Scans for comparative and superlative claims requiring legal substantiation.
  3. **Terminology Guardian:** Flags unapproved synonyms and prohibited trademarks.
  4. **Voice Guardian:** Analyzes tone, reading level, and brand sentiment.
  5. **Visual Guardian:** Extracts dominant colors via Delta E (CIE76) algorithms and audits logo placement.
  6. **Accessibility Guardian:** Calculates WCAG 2.2 AA contrast ratios and audits structural hierarchy.
  - **Risk Manager Arbiter:** Deduplicates findings, resolves cross-agent conflicts, and assigns deterministic severity levels (`RED`, `AMBER`, `GREEN`).
- **Active Advertisement Recall Engine:** When a brand document is updated (e.g. battery life corrected from 8 days to 5 days), the Recall Engine immediately diffs the knowledge base, locates all past advertisements linked to that claim, and automatically triggers high-priority recall alerts.
- **Brand Memory Precedents:** Human reviewer decisions create institutional precedent that surfaces in future audits without modifying official brand guidelines until promoted by an Admin.

---

## 2. Technology Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS (Custom Neo-Brutalist design system: solid flat fills, 3px borders, hard offset shadows, zero gradients), `@fontsource/outfit`.
- **Backend:** Python 3.14 / FastAPI, Pydantic v2, Uvicorn, ChromaDB (Vector store), PyMongo (MongoDB engine with mock-memory fallback).
- **Security:** Argon2id + Bcrypt dual hashing, JWT Bearer tokens, HttpOnly SameSite cookies, CSRF protection, Content Security Policy, zero client-side token storage.

---

## 3. Environment Variables

### Backend Configuration (`backend/.env`)
Copy `backend/.env.example` to `backend/.env`:
```ini
ENVIRONMENT=development
APP_NAME="NEXORA Brand Governance"
API_V1_PREFIX=/api/v1
SECRET_KEY=nexora_production_jwt_secret_key_entropy_min_32_chars_long!
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=7
ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

# Database & Vectors
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB_NAME=nexora_governance
CHROMA_PERSIST_DIR=./data/chroma

# AI Providers
GEMINI_API_KEY=your_google_ai_studio_api_key_here
DEFAULT_AI_PROVIDER=gemini
```

### Frontend Configuration (`frontend/.env`)
Copy `frontend/.env.example` to `frontend/.env`:
```ini
VITE_API_BASE_URL=http://127.0.0.1:8000
VITE_BUSINESS_TRADING_NAME=NEXORA
# Optional Business Details (See TODO_BUSINESS_DETAILS.md)
VITE_BUSINESS_LEGAL_NAME=NEXORA Technologies Private Limited
VITE_BUSINESS_CONTACT_EMAIL=support@nexora.ai
```

---

## 4. Setup & Running Locally

### Prerequisites
- Node.js (v18+) and npm
- Python (v3.11+) and pip

### 1. Run the Backend
```bash
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\Activate.ps1
# On macOS/Linux:
# source venv/bin/activate

pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
API docs available at: `http://127.0.0.1:8000/docs`

### 2. Run the Frontend
```bash
cd frontend
npm install
npm run dev -- --host 127.0.0.1 --port 5173
```
Frontend UI available at: `http://127.0.0.1:5173`

---

## 5. Running Tests

### Backend Unit, RBAC, Security & Seeded Benchmark Tests
```bash
cd backend
$env:TESTING="1"; $env:DEMO_ADMIN_PASSWORD="NexoraAdmin2026!"; python -m pytest -v tests/
```
*Current test suite: 33 / 33 passing.*

### Frontend Production Type-Check & Build
```bash
cd frontend
npm run lint
npm run build
```

---

## 6. Pre-Flight Deployment Checklist

- [ ] Provide production `GEMINI_API_KEY` in `backend/.env`.
- [ ] Complete legal entity details in `frontend/.env` as detailed in [`TODO_BUSINESS_DETAILS.md`](file:///c:/Users/siddh/OneDrive/Desktop/NEXORA/TODO_BUSINESS_DETAILS.md).
- [ ] Retain qualified legal counsel to review disclaimers in [`docs/RISK_FLAGS.md`](file:///c:/Users/siddh/OneDrive/Desktop/NEXORA/docs/RISK_FLAGS.md).
- [ ] Connect production MongoDB Atlas cluster string in `backend/.env`.
- [ ] Set `ENVIRONMENT=production` to lock down Swagger endpoints and activate strict SSL cookie flags.
