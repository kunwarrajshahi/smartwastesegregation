"""Scan Record Database Model."""

import uuid
from datetime import datetime
from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, JSON, String, Text
from sqlalchemy.orm import relationship

from app.database import Base


class Scan(Base):
    """Persistent waste classification scan telemetry."""

    __tablename__ = "scans"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    filename = Column(String(255), nullable=False)
    stored_image_path = Column(String(512), nullable=True)
    image_url = Column(String(512), nullable=True)
    predicted_class = Column(String(50), nullable=False, index=True)
    confidence = Column(Float, nullable=False)
    confidence_percentage = Column(Float, nullable=False)
    top_predictions = Column(JSON, nullable=False)
    weight_kg = Column(Float, nullable=False, default=0.05)
    destination_bin = Column(String(100), nullable=False)
    is_verified = Column(Boolean, nullable=False, default=False)
    verified_by = Column(String(100), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow, index=True)

    # Relationships
    user = relationship("User", back_populates="scans")
