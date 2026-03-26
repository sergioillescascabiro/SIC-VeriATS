# SIC-VeriATS — Blind Recruitment Platform

> **Portfolio Note:** This project represents a V1 learning milestone. The code has been sanitized and refactored for public portfolio presentation. See the [Post-Mortem](#post-mortem) section for an honest technical retrospective.

## Overview

SIC-VeriATS is a blind recruitment platform built for university job fairs. It anonymizes candidate profiles during the initial screening phase — recruiters see a `SIC-XXX` code, a skills match score, and years of experience, but no name, photo, or contact information until the admin selects a candidate. The system is multi-role (super admin, company recruiter, candidate) and models the full application lifecycle from job posting through skill validation and final hiring decision.

## Features

- **Blind candidate view** — company recruiters access candidates exclusively through anonymized `SIC-XXX` codes; PII is stored in a separate `SensitiveData` table and never exposed to the `/company` router
- **Skill validation workflow** — each job posting defines required skills with proficiency levels; candidates justify each skill in their application and the admin approves or rejects each claim individually
- **Application state machine** — applications progress through `PENDING → VERIFIED → HIRED` (or `REJECTED`), with the admin as the sole decision authority
- **Role-based access control** — four roles enforced at the FastAPI dependency layer (`require_admin`, `require_company`, `require_candidate`); route guards on the frontend redirect on mismatch
- **CV upload and serving** — candidates upload PDF/DOCX resumes; files are stored with UUID-renamed paths and served at `/static/cvs/`; the company download endpoint returns the file under the anonymized filename `{blind_code}_resume.pdf`
- **Admin evaluation dashboard** — split-screen UI (CV viewer + requirement checklist) with per-candidate navigation and a final select/reject decision locked behind full mandatory-requirement validation
- **Job fair portal for candidates** — candidates browse active companies and vacancies, submit applications, and track their status through a dedicated portal
- **Mobile-first UI** — 48px minimum touch targets, WCAG AA compliance, and a flat design system built around five brand-specific Tailwind color tokens

## Architecture

```
Browser (React SPA)
        |
        | HTTP / JWT Bearer
        v
   FastAPI (Python 3.11)
   ├── /auth          — login, /me, logout
   ├── /api/admin     — stats, company CRUD
   ├── /company       — anonymized candidate & job views
   ├── /candidates    — candidate profile & CV upload
   └── /companies, /vacancies, /applications  — job fair public endpoints
        |
        | SQLAlchemy 2.0
        v
   PostgreSQL 15 (Supabase)
        |
   Static file storage (local /uploads — MinIO S3-compatible planned)
```

### Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Frontend | React + TypeScript + Vite | 18 / — / — |
| Routing | TanStack Router | 1.x |
| State | TanStack Query (React Query) | 5.x |
| HTTP client | Axios with JWT interceptors | — |
| Styling | Tailwind CSS | 3.4 |
| UI primitives | Headless UI + custom components | — |
| Backend | FastAPI | 0.109 |
| ORM | SQLAlchemy + Alembic | 2.0 / 1.13 |
| Database | PostgreSQL via Supabase | 15 |
| Auth | Custom FastAPI JWT (HS256) | — |
| Storage | Local filesystem / MinIO (S3-compatible) | — |
| Runtime | Python 3.11 / Node 20 | — |

## Getting Started

### Prerequisites

- Node >= 20
- Python 3.11
- Docker & Docker Compose
- Supabase CLI (optional, for hosted database)

### Frontend

```bash
cd SIC-VeriATS-front
cp .env.example .env    # set VITE_API_URL=http://localhost:8000
npm install
npm run dev             # http://localhost:5173
```

### Backend

```bash
cd SIC-VeriATS-back
cp .env.example .env    # fill in SECRET_KEY, DATABASE_URL, UPLOAD_DIR
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload
```

API docs are available at `http://localhost:8000/docs` once the server is running.

### Database

```bash
npx supabase start      # starts local Supabase on port 54321/54322
psql -h localhost -p 54322 -U postgres -f SIC-VeriATS-database/schema.sql
```

## Data Model

The schema is structured to 3NF across approximately 16 tables. The core domain entities are `users`, `jobs`, `applications`, and `skills`. Many-to-many relationships are resolved through explicit junction tables: `job_skills` (job requirements with a `required_level` attribute) and `application_skills` (candidate skill claims with a `justification` text and an `admin_state` approval flag). Candidate PII is isolated in a `SensitiveData` satellite table, keeping the `PublicProfile` — which holds the `blind_code` and `years_of_experience` — safe to expose to company-role endpoints. Academic data (bachelor mark, UPM master mark, US GPA) is intentionally denormalized into the candidate row because the domain enforces exactly those three fixed fields for all candidates. Audit logs and notifications reference `user_id` and are fully decoupled from the recruitment domain tables.

## API Overview

| Router | Prefix | Description |
|---|---|---|
| `auth` | `/auth` | Login with email/password, returns HS256 JWT + user role; `/me` for session validation; stateless logout |
| `admin` | `/api/admin` | System-wide statistics, full company CRUD (create, publish/unpublish), job listing; `require_admin` dependency on every route |
| `company` | `/company` | Read-only access to own jobs and anonymized candidate lists; CV download returns file under the candidate's blind code, not their real name |
| `candidates` | `/candidates` | Candidate profile read/write (name, phone, experience) and CV upload (PDF/DOCX); splits writes between `SensitiveData` and `PublicProfile` models |
| `fair` | `/` (no prefix) | Public job fair endpoints: browse companies, list vacancies, submit applications, fetch personal application history |

---

## Post-Mortem

> *"The best projects are the ones you learn from. This is an honest account of what went wrong and what I would do differently."*

### Original Intent

SIC-VeriATS was designed as a blind recruitment platform for university job fairs. The goal was to reduce unconscious bias in early-stage candidate screening by anonymizing applicant profiles during the initial evaluation phase. The system supported four user roles: super admin, company recruiter, candidate, and skill screener.

### What Was Built

- A React + FastAPI fullstack application with role-based access control
- A 16-table PostgreSQL schema modeling jobs, applications, skills, and interviews
- A document upload system backed by local filesystem storage with a MinIO migration path planned
- An application state machine managing candidate progression from pending to hired or rejected
- A split-screen admin evaluation UI with per-requirement validation before a final hiring decision is unlocked

### Why It Stopped Working

#### 1. Dual Authentication System

The project was originally scoped around Supabase Auth on the frontend while the backend ran a fully independent FastAPI JWT system. The `auth.py` router issues its own HS256 tokens; the frontend's Axios interceptors inject them as Bearer headers. Neither the Supabase session nor the FastAPI token were ever made authoritative over the other. The `refresh_token` endpoint was stubbed out and never implemented (`raise HTTPException(status_code=501, ...)`). This produced a class of session-state bugs that were patched individually rather than resolved at the architectural level.

#### 2. Schema Governance Failure

Two schema sources coexisted: a `schema.sql` file (the operational source of truth) and Alembic migrations (the intended upgrade path). Only a small number of Alembic migrations were ever written. The SQL file could not be applied incrementally, which made it impossible to confidently recreate or migrate a live database. Bug fixes and schema changes accumulated as standalone markdown files (`FIXES_APPLIED.md`, `SOLUTION.md`, `DEBUGGING.md`) in the repository root — a reliable sign that the migration workflow had broken down.

#### 3. Lack of a Development Feedback Loop

No automated tests were written. Every regression was diagnosed by reading ad-hoc markdown files rather than running a test suite. `main.py` still contains a debug block that prints all registered routes to stdout on every startup — a useful scaffold that was never removed. The admin router has several `TODO` comments acknowledging unfinished CRUD paths. The frontend admin views were completed with mock data and marked "ready for backend integration" but that integration was never closed.

### Key Lessons Learned

**Lesson 1 — Commit to a single auth boundary.** In a Supabase-adjacent project, the correct pattern is to issue all JWTs from Supabase and verify them in FastAPI using the public JWKS endpoint. Building a second token issuer doubles the attack surface and the cognitive overhead. A stub `refresh_token` that returns 501 is not a token strategy.

**Lesson 2 — One migration tool, one source of truth.** Schema files are useful for documentation. Migration tools are for deployment. Never let them diverge. If you use Alembic, every schema change must go through a migration — no exceptions. A `schema.sql` that can only be applied to a fresh database is a snapshot, not a migration history.

**Lesson 3 — Tests are documentation that runs.** Every bug that received a markdown file should have received a test instead. A `DEBUGGING.md` explains what broke once; a failing test prevents it from breaking again.

### What I Would Do Differently

- Use Supabase Auth exclusively with Row-Level Security policies, eliminating the custom JWT system and the dual-session problem entirely
- Adopt a database-first migration workflow: every schema change through Alembic, reviewed in a pull request, with `schema.sql` generated from Alembic history rather than maintained by hand
- Add integration tests from day one using `pytest` + FastAPI's `TestClient` against a dedicated test database, covering at minimum the anonymization boundary and the application state transitions
- Close the admin frontend integration before adding new views — the split-screen evaluation UI exists in the frontend with mock data while the backend evaluation endpoints were never wired up
- Use GitHub Issues instead of markdown files for tracking bugs and TODOs; a closed issue with a linked commit is infinitely more useful than a growing `FIXES_APPLIED.md`

---

## Project Status

**Status:** Archived / Portfolio Reference

This codebase is preserved as a learning artifact. It is not actively maintained and should not be deployed to production without a significant security and architecture review.

## License

MIT
