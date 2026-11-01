"""Recycling Rule Database Model."""

from datetime import datetime
from sqlalchemy import Boolean, Column, DateTime, Float, String, Text

from app.database import Base


class RecyclingRule(Base):
    """Configurable waste stream destination, guidance, and environmental emission factors."""

    __tablename__ = "recycling_rules"

    category_key = Column(String(50), primary_key=True)  # 'cardboard', 'plastic', etc.
    display_name = Column(String(100), nullable=False)
    recyclability_type = Column(String(30), nullable=False)  # 'recyclable', 'compostable', 'non_recyclable', 'special'
    bin_name = Column(String(100), nullable=False)
    bin_color = Column(String(20), nullable=False)
    preparation_guide = Column(Text, nullable=False)
    co2_emission_factor = Column(Float, nullable=False, default=1.0)  # kg CO2e saved per kg diverted
    landfill_diversion_factor = Column(Float, nullable=False, default=1.0)  # fraction diverted (0.0 to 1.0)
    is_active = Column(Boolean, nullable=False, default=True)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
