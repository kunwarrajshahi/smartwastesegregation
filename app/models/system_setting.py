"""System Setting Database Model."""

import uuid
from datetime import datetime
from sqlalchemy import Boolean, Column, DateTime, Integer, String

from app.database import Base


class SystemSetting(Base):
    """Stores system-wide operating parameters and AI inference configurations."""

    __tablename__ = "system_settings"

    id = Column(String(36), primary_key=True, default="default")
    model_type = Column(String(50), nullable=False, default="yolov11n-seg")
    confidence_threshold = Column(Integer, nullable=False, default=85)
    actuator_delay_ms = Column(Integer, nullable=False, default=140)
    enable_pneumatic_diversion = Column(Boolean, nullable=False, default=True)
    hazard_alert_sound = Column(Boolean, nullable=False, default=True)
    auto_save_telemetry = Column(Boolean, nullable=False, default=True)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
