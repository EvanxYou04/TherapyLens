from celery import Celery
import os
from datetime import datetime

from app.models import SessionLocal, Transcript
from app.ml_pipeline import run_pipeline

celery_app = Celery('app.worker',
                     broker=os.getenv('REDIS_URL', 'redis://localhost:6379/0'),
                     backend=os.getenv('REDIS_URL', 'redis://localhost:6379/0'))

@celery_app.task(bind=True)
def process_transcript(self, transcript_id):
    db = SessionLocal()
    try:
        transcript = db.query(Transcript).filter(Transcript.id == transcript_id).first()
        if transcript is None:
            return

        transcript.status = "processing"
        transcript.processing_started_at = datetime.utcnow()
        transcript.error_message = None
        db.commit()

        result = run_pipeline(transcript.content or [])

        transcript.status = "completed"
        transcript.processing_completed_at = datetime.utcnow()
        transcript.score_summary = result.get("score_summary")
        transcript.score_details = result.get("score_details")
        transcript.coaching_summary = result.get("coaching_summary")
        transcript.model_version = result.get("model_version", "phase2-baseline-v1")
        db.commit()
    except Exception as exc:
        transcript = db.query(Transcript).filter(Transcript.id == transcript_id).first()
        if transcript is not None:
            transcript.status = "failed"
            transcript.processing_completed_at = datetime.utcnow()
            transcript.error_message = str(exc)
            db.commit()
        raise
    finally:
        db.close()