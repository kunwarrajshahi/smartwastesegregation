"""Analytics Router.

Exposes endpoints for performance dashboards, category breakdowns,
time-series trends, and environmental impact reporting.
"""

from typing import Optional
from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.routers.auth import get_optional_current_user
from app.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/api/analytics", tags=["Analytics & Reporting"])


@router.get("/overview", summary="Macro Performance Overview")
def get_overview(
    user_only: bool = Query(False, description="Filter to current user's scans only"),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    """Returns total scans, weight, diversion rate, and stream breakdowns."""
    uid = current_user.id if user_only and current_user else None
    return AnalyticsService.get_overview(db, user_id=uid)


@router.get("/categories", summary="Category-wise Distribution")
def get_categories(
    user_only: bool = Query(False, description="Filter to current user's scans only"),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    """Returns volume, weight, and percentages grouped by the 9 waste categories."""
    uid = current_user.id if user_only and current_user else None
    return AnalyticsService.get_category_distribution(db, user_id=uid)


@router.get("/environmental", summary="Environmental Impact Calculations")
def get_environmental(
    user_only: bool = Query(False, description="Filter to current user's scans only"),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    """Calculates CO2e avoided, landfill diversion, and EPA equivalents using documented factors."""
    uid = current_user.id if user_only and current_user else None
    return AnalyticsService.get_environmental_impact(db, user_id=uid)


@router.get("/trends", summary="Daily / Weekly / Monthly Activity Trends")
def get_trends(
    timeframe: str = Query("weekly", pattern="^(daily|weekly|monthly)$"),
    user_only: bool = Query(False, description="Filter to current user's scans only"),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    """Returns chronological scan activity for charting."""
    uid = current_user.id if user_only and current_user else None
    return AnalyticsService.get_trends(db, timeframe=timeframe, user_id=uid)


@router.get("/export", summary="Export Scans as CSV")
def export_csv(
    user_only: bool = Query(False, description="Filter to current user's scans only"),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    """Streams a CSV file containing all recorded scan data."""
    uid = current_user.id if user_only and current_user else None
    csv_data = AnalyticsService.export_scans_csv(db, user_id=uid)
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=waste_scans_report.csv"},
    )
