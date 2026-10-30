"""Prediction Router.

Provides multipart/form-data image upload endpoint for waste classification.
"""

import logging
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status

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
    summary="Classify Waste Image",
    description=(
        "Upload an image of a waste item (JPEG, PNG, WEBP, BMP) up to 10 MB. "
        "The image will be processed by ResNet18 and classified into one of the "
        "9 supported waste categories, returning confidence scores and top 3 predictions."
    ),
    responses={
        200: {
            "model": PredictionResponse,
            "description": "Successful waste category classification.",
        },
        400: {
            "model": ErrorResponse,
            "description": "Invalid image data, corrupted file, or empty upload.",
        },
        413: {
            "model": ErrorResponse,
            "description": "Uploaded image exceeds the 10 MB limit.",
        },
        415: {
            "model": ErrorResponse,
            "description": "Unsupported image format or extension.",
        },
        500: {
            "model": ErrorResponse,
            "description": "Internal model inference failure.",
        },
        503: {
            "model": ErrorResponse,
            "description": "Model not loaded or service unavailable.",
        },
    },
)
async def predict_waste(
    file: UploadFile = File(
        ...,
        description="Waste image file to classify (JPEG, PNG, BMP, WEBP; max 10MB)",
    ),
    bundle: ModelBundle = Depends(get_model_bundle),
) -> PredictionResponse:
    """Classifies an uploaded waste image using the loaded ResNet18 PyTorch model."""
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

    return response
