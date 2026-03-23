from fastapi import APIRouter, Depends, File, UploadFile, HTTPException
from sqlalchemy.orm import Session
from app.models import SessionLocal, Transcript, User
from app.auth import get_current_user
from pypdf import PdfReader
import re
import json
import boto3
from botocore.client import Config
import os
import io

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def extract_text_from_pdf(content):
    reader = PdfReader(io.BytesIO(content))
    text = ""
    for page in reader.pages:
        text += page.extract_text()
    return text

def parse_speaker_turns(text):
    # Simple regex heuristic: assume "Therapist:" or "Client:" prefixes
    turns = []
    lines = text.split('\n')
    current_speaker = None
    current_text = ""
    for line in lines:
        match = re.match(r'^(Therapist|Client):\s*(.*)', line, re.IGNORECASE)
        if match:
            if current_speaker:
                turns.append({"speaker": current_speaker, "text": current_text.strip()})
            current_speaker = match.group(1)
            current_text = match.group(2)
        else:
            current_text += " " + line
    if current_speaker:
        turns.append({"speaker": current_speaker, "text": current_text.strip()})
    return turns

@router.post("/upload")
def upload_transcript(file: UploadFile = File(...), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if file.content_type not in ["text/plain", "application/pdf"]:
        raise HTTPException(status_code=400, detail="Only .txt and .pdf files allowed")
    
    content = file.file.read()
    if file.content_type == "application/pdf":
        text = extract_text_from_pdf(content)
    else:
        text = content.decode("utf-8")
    
    speaker_turns = parse_speaker_turns(text)
    
    # Save to S3 (using MinIO for local dev)
    s3 = boto3.client('s3',
                      endpoint_url=os.getenv("MINIO_ENDPOINT", 'http://localhost:9000'),
                      aws_access_key_id=os.getenv("MINIO_ACCESS_KEY", 'minioadmin'),
                      aws_secret_access_key=os.getenv("MINIO_SECRET_KEY", 'minioadmin'),
                      config=Config(signature_version='s3v4'))
    s3.put_object(Bucket='therapylens', Key=file.filename, Body=content)
    
    transcript = Transcript(user_id=current_user.id, filename=file.filename, content=speaker_turns)
    db.add(transcript)
    db.commit()
    db.refresh(transcript)
    
    return {"message": "Transcript uploaded successfully", "id": transcript.id}

@router.get("/")
def get_transcripts(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    transcripts = db.query(Transcript).filter(Transcript.user_id == current_user.id).all()
    return [{"id": t.id, "filename": t.filename, "status": t.status, "created_at": t.created_at} for t in transcripts]