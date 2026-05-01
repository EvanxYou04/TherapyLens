# TherapyLens - Getting Started Guide

## Project Overview

TherapyLens is an AI-powered therapy session analysis platform that processes transcripts to provide real-time scoring, coaching feedback, and insights.

### Tech Stack

**Frontend:**
- React 18 with TypeScript
- Tailwind CSS for styling
- React Query for data management
- Zustand for state management
- React Router for navigation

**Backend:**
- Python 3.11 with FastAPI
- PostgreSQL 15 for data persistence
- Redis for caching and task queuing
- Celery for background ML processing
- SQLAlchemy 2.0 ORM

**ML/NLP:**
- PyTorch for deep learning
- HuggingFace Transformers (RoBERTa-base)
- OpenAI GPT-4o integration

**Storage:**
- MinIO (local S3-compatible storage) for development
- AWS S3 for production

---

## Quick Start (Local Development)

### Prerequisites

- Docker and Docker Compose (recommended)
- Node.js 18+ and npm
- Python 3.11+ (for local backend development)

### Option 1: Using Docker Compose (Recommended)

```bash
# Navigate to project root
cd /path/to/TherapyLens

# Build and start all services
docker-compose up --build

# The application will be available at:
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
# MinIO Console: http://localhost:9001
```

### Option 2: Local Development Setup

#### Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
export DATABASE_URL=postgresql://user:password@localhost/therapylens
export REDIS_URL=redis://localhost:6379/0
export SECRET_KEY=your-secret-key
export OPENAI_API_KEY=your-openai-api-key

# Start PostgreSQL and Redis (using Docker)
docker run -d -e POSTGRES_PASSWORD=password -e POSTGRES_DB=therapylens -p 5432:5432 postgres:15
docker run -d -p 6379:6379 redis:alpine

# Run migrations (if applicable)
# alembic upgrade head

# Start the API server
uvicorn app.main:app --reload --port 8000

# In a separate terminal, start the Celery worker
celery -A app.worker worker --loglevel=info
```

#### Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm start

# The app will open at http://localhost:3000
```

---

## Environment Variables

### Backend

Create a `.env` file in the backend directory:

```
DATABASE_URL=postgresql://user:password@localhost/therapylens
REDIS_URL=redis://localhost:6379/0
SECRET_KEY=your-super-secret-key-change-in-production
OPENAI_API_KEY=your-openai-api-key
MINIO_ENDPOINT=http://localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
```

### Frontend

The frontend uses the proxy setting in `package.json`:
```json
"proxy": "http://localhost:8000"
```

This means API calls to `/transcripts`, `/auth`, etc. are automatically proxied to the backend.

---

## Project Structure

```
TherapyLens/
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   └── Layout.tsx
│   │   ├── pages/
│   │   │   ├── UploadPage.tsx
│   │   │   └── SessionListPage.tsx
│   │   ├── App.tsx
│   │   ├── index.tsx
│   │   └── index.css
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
│
├── backend/
│   ├── app/
│   │   ├── main.py (FastAPI app)
│   │   ├── models.py (SQLAlchemy models)
│   │   ├── auth.py (Authentication logic)
│   │   ├── auth_routes.py
│   │   ├── transcript_routes.py
│   │   ├── ml_pipeline.py
│   │   ├── worker.py (Celery configuration)
│   │   └── schemas.py (Pydantic schemas)
│   ├── requirements.txt
│   └── Dockerfile
│
├── ml/
│   └── pipeline.py (ML processing pipeline)
│
└── docker-compose.yml
```

---

## API Endpoints

### Authentication

- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login user
- `POST /auth/refresh` - Refresh access token

### Transcripts

- `POST /transcripts/upload` - Upload a transcript (file or text)
- `GET /transcripts/` - List user's transcripts
- `GET /transcripts/{id}` - Get transcript details
- `DELETE /transcripts/{id}` - Delete a transcript

---

## Development Workflow

### Frontend Development

```bash
cd frontend

# Start dev server with hot reload
npm start

# Run tests
npm test

# Build for production
npm run build
```

### Backend Development

```bash
cd backend
source venv/bin/activate

# Run with auto-reload
uvicorn app.main:app --reload

# Run tests (if configured)
pytest

# Format code
black app/

# Lint
flake8 app/
```

---

## Troubleshooting

### CSS Not Showing Up

If Tailwind CSS isn't working:
1. Ensure `index.css` imports the Tailwind directives:
   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```
2. Verify `tailwind.config.js` includes the correct content paths
3. Clear browser cache: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows/Linux)
4. Restart the dev server: `npm start`

### Backend Connection Issues

```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Check if Redis is running
docker ps | grep redis

# Test database connection
psql postgresql://user:password@localhost/therapylens
```

### Docker Compose Issues

```bash
# View logs
docker-compose logs -f

# Rebuild images
docker-compose build --no-cache

# Clean up everything
docker-compose down -v
```

---

## Next Steps

1. **Authentication**: Implement login/registration in the frontend
2. **Transcript Processing**: Set up the ML pipeline for analysis
3. **Results Display**: Create a dashboard to display analysis results
4. **Testing**: Add comprehensive test suites
5. **Deployment**: Set up CI/CD and deploy to production

---

## Contributing

- Follow the existing code style
- Write tests for new features
- Update documentation when making changes
- Create feature branches for development

---

## Support

For issues or questions, check the project README or create an issue in the repository.
