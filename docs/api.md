# NEXORA — API Endpoint Reference

Base URL (dev): `http://localhost:8000/api/v1`

All protected endpoints require `Authorization: Bearer <token>`.

---

## Authentication

| Method | Path | Description |
|---|---|---|
| POST | `/auth/register` | Register a new user and organisation |
| POST | `/auth/login` | Login; returns `access_token` + `refresh_token` |
| POST | `/auth/refresh` | Rotate access token using refresh token |
| POST | `/auth/logout` | Revoke refresh token |
| GET | `/auth/me` | Get current authenticated user profile |
| POST | `/auth/forgot-password` | Send password reset link |
| POST | `/auth/reset-password` | Confirm password reset |
| GET | `/auth/verify-email` | Verify email via token from link |

---

## Organisation

| Method | Path | Description |
|---|---|---|
| GET | `/organizations/me` | Get current org details |
| PUT | `/organizations/me` | Update org settings |
| GET | `/organizations/{org_id}/members` | List org members |
| POST | `/organizations/{org_id}/invitations` | Invite a user by email |
| DELETE | `/organizations/{org_id}/members/{user_id}` | Remove member |

---

## Brand Knowledge Hub

| Method | Path | Description |
|---|---|---|
| GET | `/knowledge/documents` | List knowledge documents (paginated) |
| POST | `/knowledge/upload` | Upload a new document (multipart) |
| GET | `/knowledge/documents/{doc_id}` | Get document details + versions |
| POST | `/knowledge/documents/{doc_id}/approve` | Admin approves a document version |
| POST | `/knowledge/documents/{doc_id}/reject` | Admin rejects a document version |
| DELETE | `/knowledge/documents/{doc_id}` | Archive a document |

---

## Advertisements

| Method | Path | Description |
|---|---|---|
| GET | `/advertisements` | List org advertisements (paginated, filterable) |
| POST | `/advertisements/upload` | Upload creative (multipart) |
| GET | `/advertisements/{ad_id}` | Get advertisement + latest report |
| POST | `/advertisements/{ad_id}/process` | Trigger six-guardian audit |
| GET | `/advertisements/{ad_id}/report` | Get consolidated audit report |
| DELETE | `/advertisements/{ad_id}` | Remove advertisement |

---

## Human Review

| Method | Path | Description |
|---|---|---|
| GET | `/reviews/ad/{ad_id}` | Get review details for an advertisement |
| POST | `/reviews/ad/{ad_id}` | Submit human review decision |
| GET | `/reviews` | List all reviews (admin only) |

---

## Advertisement Registry

| Method | Path | Description |
|---|---|---|
| GET | `/registry` | List all registered advertisements |
| POST | `/registry` | Register an audited advertisement |
| GET | `/registry/{entry_id}` | Get registry entry details |
| PATCH | `/registry/{entry_id}/status` | Update registration status |

---

## Advertisement Recall Engine

| Method | Path | Description |
|---|---|---|
| GET | `/recall/alerts` | List all open recall alerts |
| POST | `/recall/evaluate` | Trigger a full recall sweep |
| GET | `/recall/alerts/{alert_id}` | Get alert details |
| POST | `/recall/alerts/{alert_id}/resolve` | Resolve / dismiss an alert |

---

## Brand Memory

| Method | Path | Description |
|---|---|---|
| GET | `/memory` | List review precedents (filterable by category) |
| GET | `/memory/{entry_id}` | Get precedent details |

---

## Analytics

| Method | Path | Description |
|---|---|---|
| GET | `/analytics/overview` | Governance KPIs, severity distribution, top violations |

---

## Audit Logs

| Method | Path | Description |
|---|---|---|
| GET | `/audit/logs` | Immutable audit trail (admin only, paginated) |

---

## Health

| Method | Path | Description |
|---|---|---|
| GET | `/health` | FastAPI health check |
| GET | `http://localhost:3001/health` | Express server health check |

