# NEXORA — Architecture Overview

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite 8 + TypeScript + Tailwind CSS 3 |
| Server proxy | Node.js / Express + TypeScript (`/server`) |
| Backend API | Python 3.11 / FastAPI (`/backend`) |
| Database | MongoDB (motor async driver); in-memory mock for tests |
| Vector store | ChromaDB (per-tenant namespaced collections) |
| AI inference | Google Gemini API (default) or Ollama (air-gapped) |

## Folder Structure

```
NEXORA/
├── frontend/           React + Vite client
│   ├── src/
│   │   ├── config/     Business config (env-driven, no placeholders)
│   │   ├── pages/      Public pages + /app/* protected pages
│   │   ├── components/ Layout, UI primitives, auth guards
│   │   ├── context/    AuthContext (JWT + user state)
│   │   └── services/   API client classes
│   ├── .env.example    Frontend env template (VITE_* only — no secrets)
│   └── tailwind.config.js
│
├── server/             Express/TypeScript proxy layer
│   ├── src/
│   │   ├── index.ts    Entry: Helmet, CORS, rate-limit, routes
│   │   └── routes/
│   │       ├── health.ts       GET /health
│   │       ├── authProxy.ts    POST /api/v1/auth/* → FastAPI
│   │       ├── upload.ts       POST /api/v1/upload/* (multer + forwarding)
│   │       └── aiProxy.ts      POST /api/v1/ai/* (zero-retention headers)
│   └── .env.example    Server env template (secrets stay here)
│
├── backend/            FastAPI Python application
│   └── app/
│       ├── api/v1/     REST endpoints
│       ├── services/   Guardian agents, RAG, Recall Engine
│       ├── models/     Pydantic + MongoDB schemas
│       └── db/         Mongo adapter, ChromaDB, seed data
│
├── shared/             Cross-layer TypeScript types (no runtime deps)
│   └── types/
│       ├── advertisement.ts
│       ├── knowledge.ts
│       ├── review.ts
│       └── recall.ts
│
└── docs/               Architecture and API documentation
```

## Six Guardian Agents

All six run **in parallel** per advertisement audit. No guardian blocks another.

| Guardian | Checks | Severity outputs |
|---|---|---|
| **Fact Guardian** | Factual claims vs. approved spec sheets | RED / YELLOW |
| **Voice Guardian** | Tone, persona, style against brand guide | YELLOW |
| **Terminology Guardian** | Prohibited words, trademark misuse, canonical terms | RED / YELLOW |
| **Claims Guardian** | Superlatives, numerical, comparative claims | RED / YELLOW |
| **Visual Guardian** | Logo clearspace, aspect ratio, hex palette delta | YELLOW |
| **Accessibility Guardian** | WCAG 2.1 AA contrast, Flesch-Kincaid readability | YELLOW |

## Risk Manager (Arbiter)

Merges guardian findings into one `ConsolidatedReport`:

- **RED** — any single RED finding from any guardian
- **YELLOW** — ≥1 YELLOW, no RED
- **GREEN** — zero RED or YELLOW findings detected by automated checks

> GREEN = "no critical issues detected by the automated checks performed" — **never** "safe" or "compliant".

## Human Review Workflow

1. Audit completes → report stored in `consolidated_reports` + `advertisement_reports`
2. Authorised `approver` or `admin` views the report and findings
3. Human selects: **Approved / Rejected / Approved with Conditions** + rationale
4. Decision written to `reviews` collection; `advertisement.status` updated
5. If approved, decision context stored as a **Brand Memory** precedent (non-binding)

> Nothing is auto-approved. Human decisions are always required.

## Advertisement Recall Engine

Triggered when:
- An admin **approves a new version** of a knowledge document
- An admin manually triggers a **sweep**

Process:
1. Identify all registered advertisements that referenced the changed document
2. Re-run the full six-guardian audit against updated knowledge
3. Generate new `RecallAlert` records for each affected advertisement
4. Marketing team reviews and resolves alerts

## Data Isolation

- MongoDB: every document carries `organization_id`; every query filters by it
- ChromaDB: collection names are namespaced `org_{org_id}_{category}`
- Server proxy: JWT verified before forwarding; no cross-tenant token reuse

## API Summary

See `docs/api.md` for the full endpoint reference.

