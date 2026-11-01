"""Scan Management and History Router.

Provides paginated search, category filtering, individual scan inspection,
verification overrides, and deletion endpoints.
"""

import logging
import math
import os
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import desc, or_
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.scan import Scan
from app.models.user import User
from app.routers.auth import get_optional_current_user, get_current_user
from app.schemas.scan import ScanItemResponse, ScanListResponse, ScanVerifyRequest

logger = logging.getLogger("smart_waste_api.scans")

router = APIRouter(prefix="/api/scans", tags=["Scan History"])


@router.get(
    "",
    response_model=ScanListResponse,
    summary="Get Paginated Scan History",
)
def get_scans(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=100, description="Items per page"),
    limit: Optional[int] = Query(None, ge=1, le=100, description="Alias for page_size"),
    category: Optional[str] = Query(None, description="Filter by predicted category"),
    search: Optional[str] = Query(None, description="Search by filename or scan ID"),
    user_only: bool = Query(False, description="Filter to current user's scans only"),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    """Retrieves paginated scan history with dynamic searching and category filtering."""
    query = db.query(Scan)

    effective_size = limit if limit is not None else page_size

    # Optional user isolation
    if user_only and current_user:
        query = query.filter(Scan.user_id == current_user.id)

    # Category filter
    if category and category.lower() != "all":
        clean_cat = category.replace("_", " ").lower()
        query = query.filter(Scan.predicted_class.ilike(f"%{clean_cat}%"))

    # Search filter
    if search:
        search_term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Scan.filename.ilike(search_term),
                Scan.id.ilike(search_term),
                Scan.predicted_class.ilike(search_term),
                Scan.destination_bin.ilike(search_term),
            )
        )

    total = query.count()
    pages = math.ceil(total / effective_size) if total > 0 else 1

    # Order newest first
    items = (
        query.order_by(desc(Scan.created_at))
        .offset((page - 1) * effective_size)
        .limit(effective_size)
        .all()
    )

    return ScanListResponse(
        items=[ScanItemResponse.from_orm(item) for item in items],
        total=total,
        page=page,
        page_size=effective_size,
        pages=pages,
    )


@router.get(
    "/{scan_id}",
    response_model=ScanItemResponse,
    summary="Get Single Scan Detail",
)
def get_scan(scan_id: str, db: Session = Depends(get_db)):
    """Retrieves detailed information and telemetry for a specific scan."""
    scan = db.query(Scan).filter(Scan.id == scan_id).first()
    if not scan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Scan record with ID '{scan_id}' was not found.",
        )
    return ScanItemResponse.from_orm(scan)


@router.patch(
    "/{scan_id}/verify",
    response_model=ScanItemResponse,
    summary="Verify or Reclassify Scan",
)
def verify_scan(
    scan_id: str,
    req: ScanVerifyRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    """Allows an operator or auditor to verify a classification or override category."""
    scan = db.query(Scan).filter(Scan.id == scan_id).first()
    if not scan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Scan record with ID '{scan_id}' was not found.",
        )

    scan.is_verified = True
    scan.verified_by = current_user.full_name if current_user else "Auditor"
    if req.verified_class:
        scan.predicted_class = req.verified_class
    if req.notes:
        scan.notes = req.notes

    db.commit()
    db.refresh(scan)
    logger.info(f"Scan {scan_id} marked as verified by {scan.verified_by}")
    return ScanItemResponse.from_orm(scan)


@router.delete(
    "/{scan_id}",
    status_code=status.HTTP_200_OK,
    summary="Delete Scan Record",
)
def delete_scan(
    scan_id: str,
    db: Session = Depends(get_db),
):
    """Deletes a scan record and removes any stored image on disk."""
    scan = db.query(Scan).filter(Scan.id == scan_id).first()
    if not scan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Scan record with ID '{scan_id}' was not found.",
        )

    # Remove image file if stored
    if scan.stored_image_path and os.path.exists(scan.stored_image_path):
        try:
            os.remove(scan.stored_image_path)
        except OSError as e:
            logger.warning(f"Could not remove image file {scan.stored_image_path}: {e}")

    db.delete(scan)
    db.commit()
    logger.info(f"Scan record {scan_id} deleted successfully.")
    return {"success": True, "message": f"Scan '{scan_id}' deleted."}
