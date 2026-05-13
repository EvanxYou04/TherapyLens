# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

TherapyLens is an AI-powered therapy session analysis platform. Therapists upload session transcripts (text or PDF), which are processed asynchronously through an NLP/ML pipeline to generate empathy and partnership scores plus coaching summaries.

## Commands

### Full Stack (Docker)
```bash
docker-compose up --build          # Start all services
docker-compose down                # Stop all services
```

### Frontend (React)
```bash
cd frontend
npm start                          # Dev server on port 3000
npm run build                      # Production build
npm test                           # Run Jest tests
npm test -- --testPathPattern=<file>  # Run a single test file
```

### Backend (FastAPI)
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload      # Dev server on port 8000
celery -A app.worker worker --loglevel=info  # Celery worker
```

### Backend Tests/Lint
```bash
cd backend
pytest                             # Run tests
black app/                         # Format code
flake8 app/                        # Lint
```

## Architecture

The system has three modules that communicate at runtime:

```
frontend (React) → backend (FastAPI) → PostgreSQL
                                     → MinIO (file storage)
                                     → Redis → Celery worker → ml/pipeline.py
```

**Processing flow:** User uploads transcript → backend saves to MinIO + creates DB record → enqueues Celery task → worker runs `ml/pipeline.py` → updates transcript with scores and coaching → frontend polls for results.

### Backend (`backend/app/`)
- `main.py` — FastAPI app, CORS config, router registration
- `models.py` — SQLAlchemy ORM: `User` (email/password) and `Transcript` (stores both raw content and analysis results as JSON columns)
- `schemas.py` — Pydantic request/response models
- `auth.py` — JWT creation/verification + bcrypt password hashing; 30-min token expiry
- `worker.py` — Celery task `process_transcript(transcript_id)`: fetches transcript, calls ML pipeline, writes results back to DB

### ML Pipeline (`ml/pipeline.py`)
Currently heuristic-based (Phase 2 baseline — RoBERTa/GPT-4o integration is the next planned phase):
- Parses speaker turns labeled "Therapist:" and "Client:"
- Scores **Empathy** [1–5] from reflection count ("it sounds like", "you feel", etc.)
- Scores **Partnership** [1–5] from open question count ("what", "how", "tell me")
- Generates a text `coaching_summary`
- Returns `score_summary`, `score_details`, and `coaching_summary` dicts

### Frontend (`frontend/src/`)
- `App.tsx` — React Router routes: `/upload`, `/sessions`, `/sessions/:id`
- `pages/` — `UploadPage` (drag-drop or text paste), `SessionListPage` (status polling)
- `components/Layout.tsx` — Nav shell
- State: React Query for server state, Zustand available but not yet used, JWT stored in `localStorage`

## Environment Variables

Backend requires a `.env` file (see `GETTING_STARTED.md` for Docker values):
```
DATABASE_URL=postgresql://user:password@db/therapylens
REDIS_URL=redis://redis:6379/0
SECRET_KEY=<random-string>
OPENAI_API_KEY=<key>
MINIO_ENDPOINT=http://minio:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
TRANSCRIPT_BUCKET=therapylens
```

Frontend proxies API calls to `http://localhost:8000` (configured in `package.json`).

## Key API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/register` | Register, returns JWT |
| POST | `/auth/login` | Login, returns JWT |
| POST | `/transcripts/upload` | Upload `.txt`/`.pdf` or raw text |
| GET | `/transcripts/` | List user's transcripts |
| GET | `/transcripts/{id}/status` | Poll processing status |
| GET | `/transcripts/{id}/report` | Fetch scores + coaching |

## Data Model

`Transcript` rows hold both the raw content (`content` JSON — speaker turns array) and results (`score_summary`, `score_details`, `coaching_summary`) in JSON/Text columns. Status lifecycle: `queued → processing → completed | failed`.

## Git & Development Workflow

### Branching

- **Never commit directly to `main`.** Always branch first:
  ```bash
  git checkout -b <type>/<short-description>
  ```
- Branch type prefixes: `feat/`, `fix/`, `chore/`, `refactor/`, `test/`
- Examples: `feat/results-dashboard`, `fix/bcrypt-compat`, `test/upload-e2e`

### Commits

- Keep commits atomic — one logical change per commit
- Title format: `Type: Short description` (e.g. `Fix: Drop trailing-slash redirect in sessions fetch`)
- Types: `Feat`, `Fix`, `Refactor`, `Test`, `Chore`, `Docs`

### Pre-PR Checklist

Before opening a PR, all of the following must pass:

1. E2E tests green: `cd frontend && npx playwright test`
2. No outstanding lint errors: `cd backend && flake8 app/`
3. Branch is up to date with `main`

### Pull Requests

- All PRs target `main`
- Title format: `[Type] Short description` (e.g. `[Fix] Resolve bcrypt passlib incompatibility`)
- PR body must include:
  - **Summary** — what changed and why
  - **Testing** — how it was verified (E2E tests run, manual steps, etc.)
  - **Breaking changes** — if any
- Create with: `gh pr create --title "..." --body "..."`

### Code Review (required before merge)

- Run `/review` on every PR — **this is a hard gate, do not merge without it**
- The review must confirm **no security vulnerabilities** before the PR can be merged
- Security checks to prioritize: auth/JWT handling, SQL injection, XSS, secrets in code, insecure dependencies, CORS misconfiguration, unvalidated user input
- Merge with squash only: `gh pr merge --squash`

## Planned Next Steps (from README)

- Replace heuristic ML with RoBERTa embeddings + GPT-4o coaching
- Results visualization dashboard
- Refresh token mechanism + proper auth UI
- Test coverage and CI/CD
