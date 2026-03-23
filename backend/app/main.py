from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.auth_routes import router as auth_router
from app.transcript_routes import router as transcript_router
from app.models import Base, engine

app = FastAPI()

# Create database tables
Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/auth", tags=["auth"])
app.include_router(transcript_router, prefix="/transcripts", tags=["transcripts"])

@app.get("/")
def read_root():
    return {"message": "TherapyLens API"}