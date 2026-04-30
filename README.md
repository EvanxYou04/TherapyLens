# TherapyLens

An AI-powered therapy session analysis platform that processes transcripts to provide real-time scoring, coaching feedback, and clinical insights.

## 🎯 Vision

TherapyLens empowers therapists and supervisors by automating the analysis of therapy sessions, providing data-driven feedback on therapeutic techniques, emotional empathy, and intervention effectiveness. The platform processes audio/text transcripts through advanced NLP models to extract meaningful patterns and generate actionable coaching recommendations.

## ✨ Core Features

- **Transcript Upload**: Upload audio (converted to text) or text transcripts
- **Real-time Analysis**: Process transcripts with ML models (RoBERTa, GPT-4o)
- **Therapeutic Scoring**: Evaluate core therapeutic skills and techniques
- **Coaching Insights**: Generate personalized feedback and recommendations
- **Session History**: Store and track progress across multiple sessions
- **Secure Access**: JWT authentication and row-level security

## 🏗️ Tech Stack

### Frontend
- React 18 with TypeScript
- Tailwind CSS for responsive UI
- React Query for data synchronization
- Zustand for state management
- React Router for navigation

### Backend
- Python 3.11 with FastAPI (async-first)
- PostgreSQL 15 for data persistence
- SQLAlchemy 2.0 ORM with alembic migrations
- JWT authentication with secure token refresh

### ML/NLP Pipeline
- PyTorch for tensor computations
- HuggingFace Transformers (RoBERTa-base for embeddings)
- OpenAI GPT-4o for advanced analysis
- Celery + Redis for async background processing

### Infrastructure
- Docker & Docker Compose for containerization
- MinIO for local S3-compatible storage (development)
- AWS S3 for production storage
- PostgreSQL for relational data

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose (recommended)
- Node.js 18+ and npm
- Python 3.11+ (for local development)

### Using Docker Compose (Recommended)

```bash
cd TherapyLens
docker-compose up --build

# Access the application:
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs (Swagger): http://localhost:8000/docs
# MinIO Console: http://localhost:9001
```

### Local Development

See [GETTING_STARTED.md](./GETTING_STARTED.md) for detailed setup instructions.

## 📁 Project Structure

```
TherapyLens/
├── frontend/                 # React TypeScript application
│   ├── public/              # Static assets
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── App.tsx          # Main app component
│   │   └── index.css        # Tailwind CSS imports
│   ├── tailwind.config.js   # Tailwind configuration
│   └── package.json
│
├── backend/                  # FastAPI application
│   ├── app/
│   │   ├── main.py          # FastAPI app initialization
│   │   ├── models.py        # SQLAlchemy ORM models
│   │   ├── auth.py          # Authentication logic
│   │   ├── auth_routes.py   # Auth endpoints
│   │   ├── transcript_routes.py  # Transcript endpoints
│   │   ├── ml_pipeline.py   # ML processing logic
│   │   ├── worker.py        # Celery worker config
│   │   └── schemas.py       # Pydantic request/response schemas
│   ├── requirements.txt
│   └── Dockerfile
│
├── ml/                       # ML utilities
│   └── pipeline.py          # Processing pipeline
│
├── docker-compose.yml       # Container orchestration
├── GETTING_STARTED.md       # Detailed setup guide
└── README.md               # This file
```

## 🔌 API Overview

### Authentication Endpoints
- `POST /auth/register` - Create new account
- `POST /auth/login` - Login and receive JWT token
- `POST /auth/refresh` - Refresh access token

### Transcript Endpoints
- `POST /transcripts/upload` - Upload transcript (multipart/form-data)
- `GET /transcripts/` - List user's transcripts
- `GET /transcripts/{id}` - Get transcript details with analysis results
- `DELETE /transcripts/{id}` - Delete a transcript

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication with refresh token rotation
- **Password Hashing**: bcrypt-based password hashing
- **CORS Protection**: Restricted cross-origin requests
- **Row-Level Security**: Users only access their own data
- **Environment Variables**: Sensitive keys stored in .env

## 📊 Database Schema

### Users Table
- id (PK)
- email (unique)
- password_hash
- created_at

### Transcripts Table
- id (PK)
- user_id (FK)
- filename
- content (JSON - speaker turns)
- storage_key (S3/MinIO path)
- status (queued, processing, completed, failed)
- processing_task_id (Celery task ID)
- score_summary (JSON)
- score_details (JSON)
- coaching_summary (text)
- model_version
- created_at, processing_started_at, processing_completed_at

## 🔄 Processing Workflow

1. User uploads transcript (file or text)
2. Backend validates and stores in MinIO/S3
3. Celery worker picks up task asynchronously
4. ML pipeline processes transcript:
   - Tokenize and prepare text
   - Generate embeddings (RoBERTa)
   - Run therapeutic scoring models
   - Call GPT-4o for coaching insights
5. Results stored in database
6. Frontend polls for completion and displays results

## 🛠️ Development Workflow

### Frontend
```bash
cd frontend
npm install
npm start          # Start dev server with hot reload
npm test          # Run tests
npm run build     # Build for production
```

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload  # Start dev server
```

### Running Tests
```bash
# Frontend
cd frontend && npm test

# Backend
cd backend && pytest
```

## 📝 Environment Variables

Create `.env` files in backend and frontend directories:

### Backend `.env`
```
DATABASE_URL=postgresql://user:password@localhost/therapylens
REDIS_URL=redis://localhost:6379/0
SECRET_KEY=your-super-secret-key
OPENAI_API_KEY=your-openai-key
MINIO_ENDPOINT=http://localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
```

## 🐛 Troubleshooting

### CSS Not Displaying
- Clear browser cache (Cmd+Shift+R on Mac)
- Verify `tailwind.config.js` includes correct paths
- Check `index.css` has Tailwind directives
- Restart dev server

### API Connection Issues
- Verify backend is running on port 8000
- Check CORS settings in `app/main.py`
- Ensure environment variables are set
- Review browser console for errors

### Docker Issues
```bash
docker-compose logs -f           # View logs
docker-compose restart           # Restart services
docker-compose down -v          # Clean up (removes volumes)
```

## 📚 Next Steps

- [ ] Implement frontend authentication UI
- [ ] Complete ML pipeline integration
- [ ] Add results visualization dashboard
- [ ] Implement admin panel for model management
- [ ] Add comprehensive test coverage
- [ ] Set up CI/CD pipeline
- [ ] Deploy to production environment

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -m 'Add feature'`
3. Push to branch: `git push origin feature/your-feature`
4. Open a pull request

## 📄 License

[Your License Here]

## 📧 Support

For questions or issues, please create an issue in this repository.

---

**Last Updated**: 2024 | **Version**: 0.1.0
