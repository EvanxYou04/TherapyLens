from fastapi import APIRouter, Depends, File, UploadFile, HTTPException
from sqlalchemy.orm import Session
from app.models import SessionLocal, Transcript, User
from app.auth import get_current_user
from app.schemas import TranscriptListItem, TranscriptReportResponse, TranscriptStatusResponse
from app.worker import process_transcript
from pypdf import PdfReader
import re
import boto3
from botocore.client import Config
from botocore.exceptions import ClientError
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
    if not turns and text.strip():
        turns.append({"speaker": "Unknown", "text": text.strip()})
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
    bucket_name = os.getenv("TRANSCRIPT_BUCKET", "therapylens")
    storage_key = f"user-{current_user.id}/{file.filename}"
    try:
        s3.head_bucket(Bucket=bucket_name)
    except ClientError:
        s3.create_bucket(Bucket=bucket_name)
    s3.put_object(Bucket=bucket_name, Key=storage_key, Body=content)
    
    transcript = Transcript(
        user_id=current_user.id,
        filename=file.filename,
        content=speaker_turns,
        storage_key=storage_key,
        status="queued",
    )
    db.add(transcript)
    db.commit()
    db.refresh(transcript)

    task = process_transcript.delay(transcript.id)
    transcript.processing_task_id = task.id
    db.commit()
    
    return {
        "message": "Transcript uploaded and queued successfully",
        "id": transcript.id,
        "task_id": task.id,
        "status": transcript.status,
    }

@router.get("/", response_model=list[TranscriptListItem])
def get_transcripts(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    transcripts = db.query(Transcript).filter(Transcript.user_id == current_user.id).all()
    return [{"id": t.id, "filename": t.filename, "status": t.status, "created_at": t.created_at} for t in transcripts]


@router.get("/{transcript_id}/status", response_model=TranscriptStatusResponse)
def get_transcript_status(
    transcript_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    transcript = (
        db.query(Transcript)
        .filter(Transcript.id == transcript_id, Transcript.user_id == current_user.id)
        .first()
    )
    if not transcript:
        raise HTTPException(status_code=404, detail="Transcript not found")

    return {
        "id": transcript.id,
        "status": transcript.status,
        "processing_started_at": transcript.processing_started_at,
        "processing_completed_at": transcript.processing_completed_at,
        "error_message": transcript.error_message,
    }


@router.get("/{transcript_id}/report", response_model=TranscriptReportResponse)
def get_transcript_report(
    transcript_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    transcript = (
        db.query(Transcript)
        .filter(Transcript.id == transcript_id, Transcript.user_id == current_user.id)
        .first()
    )
    if not transcript:
        raise HTTPException(status_code=404, detail="Transcript not found")

    return {
        "id": transcript.id,
        "status": transcript.status,
        "score_summary": transcript.score_summary,
        "score_details": transcript.score_details,
        "coaching_summary": transcript.coaching_summary,
        "model_version": transcript.model_version,
    }