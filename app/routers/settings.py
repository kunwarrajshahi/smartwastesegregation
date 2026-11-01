"""System Settings Router.

Provides endpoints to retrieve and update edge AI configuration,
pneumatic actuator delays, and safety interlocks.
"""

import logging
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.system_setting import SystemSetting

logger = logging.getLogger("smart_waste_api.settings")

router = APIRouter(prefix="/api/settings", tags=["System Settings"])


class SystemSettingsResponse(BaseModel):
    model_type: str
    confidence_threshold: int
    actuator_delay_ms: int
    enable_pneumatic_diversion: bool
    hazard_alert_sound: bool
    auto_save_telemetry: bool

    class Config:
        from_attributes = True


class SystemSettingsUpdateRequest(BaseModel):
    model_type: Optional[str] = None
    confidence_threshold: Optional[int] = Field(None, ge=50, le=99)
    actuator_delay_ms: Optional[int] = Field(None, ge=50, le=500)
    enable_pneumatic_diversion: Optional[bool] = None
    hazard_alert_sound: Optional[bool] = None
    auto_save_telemetry: Optional[bool] = None


@router.get("", response_model=SystemSettingsResponse, summary="Get System Settings")
def get_settings(db: Session = Depends(get_db)):
    """Retrieves current edge AI and hardware actuator configuration."""
    setting = db.query(SystemSetting).filter(SystemSetting.id == "default").first()
    if not setting:
        setting = SystemSetting(
            id="default",
            model_type="yolov11n-seg",
            confidence_threshold=85,
            actuator_delay_ms=140,
            enable_pneumatic_diversion=True,
            hazard_alert_sound=True,
            auto_save_telemetry=True,
        )
        db.add(setting)
        db.commit()
        db.refresh(setting)
    return SystemSettingsResponse.from_orm(setting)


@router.put("", response_model=SystemSettingsResponse, summary="Update System Settings")
def update_settings(req: SystemSettingsUpdateRequest, db: Session = Depends(get_db)):
    """Updates edge AI and hardware actuator configuration in the database."""
    setting = db.query(SystemSetting).filter(SystemSetting.id == "default").first()
    if not setting:
        setting = SystemSetting(id="default")
        db.add(setting)

    if req.model_type is not None:
        setting.model_type = req.model_type
    if req.confidence_threshold is not None:
        setting.confidence_threshold = req.confidence_threshold
    if req.actuator_delay_ms is not None:
        setting.actuator_delay_ms = req.actuator_delay_ms
    if req.enable_pneumatic_diversion is not None:
        setting.enable_pneumatic_diversion = req.enable_pneumatic_diversion
    if req.hazard_alert_sound is not None:
        setting.hazard_alert_sound = req.hazard_alert_sound
    if req.auto_save_telemetry is not None:
        setting.auto_save_telemetry = req.auto_save_telemetry

    db.commit()
    db.refresh(setting)
    logger.info(f"System settings updated: threshold={setting.confidence_threshold}%, delay={setting.actuator_delay_ms}ms")
    return SystemSettingsResponse.from_orm(setting)


@router.post("/reset", response_model=SystemSettingsResponse, summary="Reset Settings to Defaults")
def reset_settings(db: Session = Depends(get_db)):
    """Resets all settings parameters to factory defaults."""
    setting = db.query(SystemSetting).filter(SystemSetting.id == "default").first()
    if not setting:
        setting = SystemSetting(id="default")
        db.add(setting)

    setting.model_type = "yolov11n-seg"
    setting.confidence_threshold = 85
    setting.actuator_delay_ms = 140
    setting.enable_pneumatic_diversion = True
    setting.hazard_alert_sound = True
    setting.auto_save_telemetry = True

    db.commit()
    db.refresh(setting)
    return SystemSettingsResponse.from_orm(setting)
