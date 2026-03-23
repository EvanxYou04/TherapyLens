from celery import Celery
import os

celery_app = Celery('app.worker',
                     broker=os.getenv('REDIS_URL', 'redis://localhost:6379/0'),
                     backend=os.getenv('REDIS_URL', 'redis://localhost:6379/0'))

@celery_app.task
def process_transcript(transcript_id):
    # ML processing logic here
    pass