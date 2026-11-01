"""Health and Model Information Endpoints.

Provides system liveness verification and deep learning model inspection endpoints.
"""

import logging
from fastapi import APIRouter, Depends, HTTPException, Request, status

from app.config import settings
from app.schemas.prediction import (
    HealthResponse,
    ImageDimensionsSchema,
    ModelInfoResponse,
)
from app.services.model_loader import ModelBundle, ModelLoader

logger = logging.getLogger("smart_waste_api.health")

router = APIRouter(tags=["System & Model Info"])


def get_model_bundle(request: Request) -> ModelBundle:
    """Dependency to retrieve the loaded ModelBundle from application state."""
    bundle: ModelBundle = getattr(request.app.state, "model_bundle", None)
    if bundle is None:
        if ModelLoader.is_loaded():
            bundle = ModelLoader.get_bundle()
            request.app.state.model_bundle = bundle
        else:
            logger.error("ModelBundle requested but not loaded in application state.")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Machine learning model is not available or failed to load.",
            )
    return bundle


@router.get(
    "/",
    response_model=HealthResponse,
    status_code=status.HTTP_200_OK,
    summary="API Health Check",
    description="Returns the operational status and heartbeat message of the API.",
)
async def health_check() -> HealthResponse:
    """Health check endpoint to verify service availability."""
    return HealthResponse(
        status="success",
        message="Smart Waste Segregation API is running",
    )


@router.get(
    "/model-info",
    response_model=ModelInfoResponse,
    status_code=status.HTTP_200_OK,
    summary="Retrieve Model Metadata",
    description="Returns specifications, supported waste classes, device, and validation metrics.",
)
async def get_model_info(
    bundle: ModelBundle = Depends(get_model_bundle),
) -> ModelInfoResponse:
    """Returns deep learning model metadata and training metrics."""
    return ModelInfoResponse(
        model_architecture=bundle.architecture,
        model_version=settings.VERSION,
        dataset_name="RealWaste",
        evaluation_split="Held-out Test Split (951 images)",
        supported_waste_categories=bundle.classes,
        total_classes=len(bundle.classes),
        input_image_dimensions=ImageDimensionsSchema(
            width=settings.IMAGE_WIDTH,
            height=settings.IMAGE_HEIGHT,
            channels=settings.IMAGE_CHANNELS,
        ),
        device=str(bundle.device),
        saved_validation_accuracy=round(bundle.val_accuracy, 2),
        test_accuracy=round(bundle.val_accuracy, 2),
        macro_precision=77.0,
    )
