# NEXORA — Brand Governance Platform

An evidence-driven, multimodal brand governance platform. Audits advertisements against approved organizational knowledge with six specialist AI guardian agents, human oversight, and an active Advertisement Recall Engine.

---

## Quick Start

### Prerequisites

- **Python 3.11+** (backend)
- **Node.js 20+** (frontend + server)
- **MongoDB** (or run in mock/in-memory mode for development)

### 1. Backend (FastAPI)

```bash
# From repo root
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

pip install -r requirements.txt
cp ../.env.example ../.env   # then fill in values

uvicorn app.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`.  
Interactive docs: `http://localhost:8000/docs`

### 2. Frontend (Vite + React)

```bash
cd frontend
npm install
cp .env.example .env         # fill in VITE_* values as needed
npm run dev
```

Frontend runs at `http://localhost:5173`.

### 3. Server Proxy (Express — optional in dev)

The Vite dev server proxies `/api` calls directly to FastAPI. The Express server layer is for production, secure uploads, and AI key management.

```bash
cd server
npm install
cp .env.example .env
npm run dev
```

Server proxy runs at `http://localhost:3001`.

---

## Demo Credentials

| Role | Email | Password |
|---|---|---|
| Admin | `admin@nexora.com` | `NexoraAdmin2026!` |
| Reviewer | `reviewer@nexora.com` | `NexoraReview2026!` |

Synthetic demo data for the fictional brand **AuraTech Global** is seeded automatically on startup.

---

## Architecture

| Component | Technology |
|---|---|
| Frontend | React 19 + Vite 8 + TypeScript + Tailwind CSS 3 |
| Server proxy | Node.js / Express + TypeScript |
| Backend API | Python 3.11 / FastAPI |
| Database | MongoDB (motor async); in-memory mock for tests |
| Vector store | ChromaDB (per-tenant namespaced) |
| AI inference | Google Gemini API (default) or Ollama (air-gapped) |

See [`docs/architecture.md`](docs/architecture.md) for a detailed breakdown.

### Six Guardian Agents

| Guardian | Checks |
|---|---|
| Fact Guardian | Factual claims vs. approved spec sheets |
| Voice Guardian | Tone, persona, style against brand guide |
| Terminology Guardian | Prohibited words, trademark misuse |
| Claims Guardian | Superlatives, numerical, comparative claims |
| Visual Guardian | Logo clearspace, aspect ratio, hex palette |
| Accessibility Guardian | WCAG 2.1 AA contrast, Flesch-Kincaid readability |

### Risk Manager Arbiter

Merges findings → `RED / YELLOW / GREEN` consolidated report.  
**GREEN = "no critical issues detected" — never "safe" or "compliant".**

---

## Running Tests

```bash
# Backend tests (32+ pass, in-memory mock DB)
cd backend
python -m pytest -v tests/

# Frontend build check
cd frontend
npm run build
```

---

## Folder Structure

```
NEXORA/
├── frontend/       React + Vite + TypeScript client
├── server/         Express/TypeScript proxy (secrets, uploads, AI keys)
├── backend/        FastAPI Python API + guardian agents
├── shared/         Cross-layer TypeScript types (no runtime deps)
├── docs/           Architecture + API reference
├── TODO_BUSINESS_DETAILS.md   Missing env vars checklist
└── .env.example    Backend env template
```

---

## Honest Positioning

NEXORA **supports** human reviewers. It does **not** guarantee legal compliance or perfect factual accuracy. Human decisions are always required — nothing is auto-approved.

---

## Configuration

Business/legal identity fields (contact email, address, jurisdiction, grievance officer) are populated via `VITE_`-prefixed environment variables. If a field is unset, the corresponding UI element is hidden — no placeholder text is shown. See [`TODO_BUSINESS_DETAILS.md`](TODO_BUSINESS_DETAILS.md) for the full list.

