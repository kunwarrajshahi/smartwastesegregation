"""Scan Telemetry and History Schemas."""

from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class ScanItemResponse(BaseModel):
    """Schema representing an individual persisted scan record."""

    id: str
    user_id: Optional[str] = None
    filename: str
    image_url: Optional[str] = None
    predicted_class: str
    confidence: float
    confidence_percentage: float
    top_predictions: List[Dict[str, Any]]
    weight_kg: float
    destination_bin: str
    is_verified: bool
    verified_by: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class ScanListResponse(BaseModel):
    """Paginated list of scan records."""

    items: List[ScanItemResponse]
    total: int
    page: int
    page_size: int
    pages: int


class ScanVerifyRequest(BaseModel):
    """Payload to verify or override a scan's classification."""

    verified_class: Optional[str] = Field(None, description="Corrected or verified category.")
    notes: Optional[str] = Field(None, description="Operator or auditor observation notes.")
