"""Prediction Router.

Provides multipart/form-data image upload endpoint for waste classification
and persists inference telemetry to the database.
"""

import logging
import uuid
from pathlib import Path
from typing import Optional
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models.scan import Scan
from app.models.user import User
from app.models.recycling_rule import RecyclingRule
from app.routers.auth import get_optional_current_user
from app.routers.health import get_model_bundle
from app.schemas.prediction import ErrorResponse, PredictionResponse
from app.services.model_loader import ModelBundle
from app.services.prediction_service import PredictionService
from app.utils.image_processing import validate_upload_file

logger = logging.getLogger("smart_waste_api.prediction_router")

router = APIRouter(tags=["Waste Classification"])


@router.post(
    "/predict",
    response_model=PredictionResponse,
    response_model_by_alias=True,
    status_code=status.HTTP_200_OK,
    summary="Classify Waste Image and Save Telemetry",
    description=(
        "Upload an image of a waste item (JPEG, PNG, WEBP, BMP) up to 10 MB. "
        "The image will be processed by ResNet18 and classified into one of the "
        "9 supported waste categories, returning confidence scores, top 3 predictions, "
        "and saving the scan to the database."
    ),
)
async def predict_waste(
    file: UploadFile = File(
        ...,
        description="Waste image file to classify (JPEG, PNG, BMP, WEBP; max 10MB)",
    ),
    weight_kg: Optional[float] = Form(
        0.05,
        description="Weight of the waste item in kg (optional hardware scale input)",
    ),
    bundle: ModelBundle = Depends(get_model_bundle),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
) -> PredictionResponse:
    """Classifies an uploaded waste image using the loaded ResNet18 PyTorch model and persists scan history."""
    logger.info(f"Received prediction request for file: '{file.filename}'")

    # Step 1: Validate file headers, extension, size, and extract content bytes
    image_bytes = await validate_upload_file(file)

    # Step 2: Execute classification through prediction service
    response = PredictionService.classify_image(
        image_bytes=image_bytes,
        filename=file.filename or "uploaded_image.jpg",
        bundle=bundle,
        top_k=3,
    )

    # Step 3: Persist image to disk and save record to database
    scan_id = str(uuid.uuid4())
    ext = Path(file.filename or "image.jpg").suffix.lower()
    if not ext or ext not in settings.ALLOWED_EXTENSIONS:
        ext = ".jpg"

    stored_filename = f"{scan_id}{ext}"
    stored_path = settings.UPLOADS_DIR / stored_filename
    image_url = f"/uploads/scans/{stored_filename}"

    try:
        # Write image bytes to uploads directory
        with open(stored_path, "wb") as f:
            f.write(image_bytes)

        # Lookup destination bin from recycling rules
        cat_key = response.predicted_class.lower().replace(" ", "_")
        rule = db.query(RecyclingRule).filter(RecyclingRule.category_key == cat_key).first()
        destination_bin = rule.bin_name if rule else "General Waste Bin"

        # Format top_predictions for JSON storage
        top_preds_json = [
            {"class": item.category, "confidence": item.confidence}
            for item in response.top_predictions
        ]

        # Create scan record
        scan_record = Scan(
            id=scan_id,
            user_id=current_user.id if current_user else None,
            filename=file.filename or "uploaded_image.jpg",
            stored_image_path=str(stored_path),
            image_url=image_url,
            predicted_class=response.predicted_class,
            confidence=response.confidence,
            confidence_percentage=response.confidence_percentage,
            top_predictions=top_preds_json,
            weight_kg=max(weight_kg or 0.05, 0.001),
            destination_bin=destination_bin,
            is_verified=False,
        )
        db.add(scan_record)
        db.commit()

        # Enrich response with persistent scan metadata
        response.scan_id = scan_id
        response.image_url = image_url
        response.destination_bin = destination_bin
        response.recycling_category = rule.recyclability_type if rule else "unknown"

        logger.info(
            f"Scan record saved successfully: ID={scan_id} "
            f"User={'anonymous' if not current_user else current_user.email}"
        )
    except Exception as exc:
        logger.error(f"Failed to persist scan record to database: {exc}", exc_info=True)
        # We do not fail the ML prediction response if saving fails
        db.rollback()

    return response
