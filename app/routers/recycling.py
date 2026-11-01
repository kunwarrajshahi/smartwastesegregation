"""Recycling Rules and Classification Guidelines Router."""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.recycling_rule import RecyclingRule
from app.routers.auth import get_optional_current_user
from app.models.user import User

router = APIRouter(prefix="/api/recycling", tags=["Recycling Rules & Guidelines"])


class RecyclingRuleResponse(BaseModel):
    category_key: str
    display_name: str
    recyclability_type: str
    bin_name: str
    bin_color: str
    preparation_guide: str
    co2_emission_factor: float
    landfill_diversion_factor: float
    is_active: bool

    class Config:
        from_attributes = True


class RecyclingRuleUpdateRequest(BaseModel):
    bin_name: Optional[str] = None
    bin_color: Optional[str] = None
    preparation_guide: Optional[str] = None
    co2_emission_factor: Optional[float] = Field(None, ge=0.0)
    landfill_diversion_factor: Optional[float] = Field(None, ge=0.0, le=1.0)
    is_active: Optional[bool] = None


@router.get(
    "/rules",
    response_model=List[RecyclingRuleResponse],
    summary="Get All Category Recycling Rules",
)
def get_rules(db: Session = Depends(get_db)):
    """Retrieves all 9 RealWaste categorization rules and environmental emission factors."""
    rules = db.query(RecyclingRule).all()
    return [RecyclingRuleResponse.from_orm(r) for r in rules]


@router.put(
    "/rules/{category_key}",
    response_model=RecyclingRuleResponse,
    summary="Update Category Recycling Rule",
)
def update_rule(
    category_key: str,
    req: RecyclingRuleUpdateRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    """Allows administrators and operators to customize bin destinations, emission factors, or guides."""
    if current_user and isinstance(current_user, User) and current_user.role not in ["admin", "operator"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Must be an administrator or operator.",
        )
    rule = db.query(RecyclingRule).filter(RecyclingRule.category_key == category_key.lower()).first()
    if not rule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Recycling rule for category '{category_key}' was not found.",
        )

    if req.bin_name is not None:
        rule.bin_name = req.bin_name
    if req.bin_color is not None:
        rule.bin_color = req.bin_color
    if req.preparation_guide is not None:
        rule.preparation_guide = req.preparation_guide
    if req.co2_emission_factor is not None:
        rule.co2_emission_factor = req.co2_emission_factor
    if req.landfill_diversion_factor is not None:
        rule.landfill_diversion_factor = req.landfill_diversion_factor
    if req.is_active is not None:
        rule.is_active = req.is_active

    db.commit()
    db.refresh(rule)
    return RecyclingRuleResponse.from_orm(rule)
