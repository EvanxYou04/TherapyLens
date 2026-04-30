from pydantic import BaseModel
from datetime import datetime
from typing import Any

class UserCreate(BaseModel):
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str


class TranscriptListItem(BaseModel):
    id: int
    filename: str
    status: str
    created_at: datetime


class TranscriptStatusResponse(BaseModel):
    id: int
    status: str
    processing_started_at: datetime | None
    processing_completed_at: datetime | None
    error_message: str | None


class TranscriptReportResponse(BaseModel):
    id: int
    status: str
    score_summary: dict[str, Any] | None
    score_details: dict[str, Any] | None
    coaching_summary: str | None
    model_version: str | None