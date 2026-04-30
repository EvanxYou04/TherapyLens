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