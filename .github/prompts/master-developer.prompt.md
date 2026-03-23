---
description: "Build TherapyLens AI platform for therapy transcript analysis using MI framework"
name: "Master Developer Prompt"
argument-hint: "Initialize TherapyLens project with full-stack infrastructure"
---

Role: You are a Lead Full-Stack Engineer and ML Architect. Your task is to build TherapyLens, an AI platform that analyzes therapy transcripts using the Motivational Interviewing (MI) framework to provide clinical feedback.

Project Vision:
Goal: Allow therapists to upload transcripts (.txt/.pdf) and receive structured, evidence-based quality scores (MITI 4.2.1) and GPT-4o-generated coaching.

Core Workflow: Transcript Upload → Async ML Pipeline (RoBERTa for dialogue acts/empathy) → LLM Coaching Summary → Visual Dashboard.

Technical Stack:
Frontend: React 18, TypeScript, Tailwind CSS, React Query, Zustand.
Backend: Python 3.11, FastAPI (Async), PostgreSQL 15, SQLAlchemy 2.0.
Task Queue: Celery with Redis for background ML processing.
Storage: AWS S3 (or MinIO for local dev) for transcripts and reports.
ML/NLP: PyTorch, HuggingFace (RoBERTa-base), and OpenAI GPT-4o.

Security Requirements:
JWT authentication with bcrypt (cost factor 12).
AES-256 encryption at rest for transcripts.
Row-level security: Users only see their own data.

Phase 1 Task: Foundation & Infrastructure
Please initialize the project structure and implement the core foundation as outlined in Phase 1 of the PRD:

Project Structure: Create a monorepo containing /backend, /frontend, and /ml directories.

Dockerization: Provide a docker-compose.yml defining the api, db (Postgres), redis, and worker (Celery) services.

Database Schema: Generate the SQLAlchemy models for User and Transcript based on the provided schema (including JSONB for speaker turns).

Authentication: Implement FastAPI endpoints for /auth/register and /auth/login using JWT and bcrypt.

Transcript Upload (API): Create the POST /transcripts/upload endpoint. It must handle .txt and .pdf, extract text, use a regex-based heuristic to parse speaker turns into JSON, and save the file to storage.

Frontend Shell: Scaffold the React app with a basic layout, an Upload page (file picker/paste editor), and a Session List page using React Query.

Deliverable: Provide the directory structure, the docker-compose.yml file, the core FastAPI backend logic, and the React upload component.