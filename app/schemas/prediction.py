"""Pydantic schemas for request validation and response serialization."""

from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict


class HealthResponse(BaseModel):
    """Schema for root health check endpoint response."""

    status: str = Field(
        default="success",
        description="Current health status of the API service.",
        examples=["success"],
    )
    message: str = Field(
        default="Smart Waste Segregation API is running",
        description="Descriptive status message.",
        examples=["Smart Waste Segregation API is running"],
    )


class ImageDimensionsSchema(BaseModel):
    """Schema representing expected model input dimensions."""

    width: int = Field(default=224, description="Image width in pixels.", examples=[224])
    height: int = Field(default=224, description="Image height in pixels.", examples=[224])
    channels: int = Field(default=3, description="Number of color channels (RGB).", examples=[3])


class ModelInfoResponse(BaseModel):
    """Schema for model metadata and runtime specifications."""

    model_architecture: str = Field(
        ...,
        description="Deep learning neural network architecture.",
        examples=["ResNet18"],
    )
    supported_waste_categories: List[str] = Field(
        ...,
        description="Complete list of classes the model was trained to recognize.",
        examples=[[
            "Cardboard",
            "Food Organics",
            "Glass",
            "Metal",
            "Miscellaneous Trash",
            "Paper",
            "Plastic",
            "Textile Trash",
            "Vegetation",
        ]],
    )
    total_classes: int = Field(
        ...,
        description="Total number of supported output classes.",
        examples=[9],
    )
    input_image_dimensions: ImageDimensionsSchema = Field(
        ...,
        description="Input dimensions expected by the neural network.",
    )
    device: str = Field(
        ...,
        description="Computation hardware device running model inference (CPU/CUDA).",
        examples=["cpu"],
    )
    saved_validation_accuracy: float = Field(
        ...,
        description="Top-1 validation accuracy percentage recorded during model training checkpointing.",
        examples=[74.34],
    )


class PredictionItem(BaseModel):
    """Schema for an individual class prediction with confidence."""

    model_config = ConfigDict(populate_by_name=True)

    category: str = Field(
        alias="class",
        serialization_alias="class",
        description="Waste category name.",
        examples=["Plastic"],
    )
    confidence: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Softmax probability score between 0.0 and 1.0.",
        examples=[0.9638],
    )


class PredictionResponse(BaseModel):
    """Schema for waste classification inference response."""

    success: bool = Field(
        default=True,
        description="Indicates whether the inference completed successfully.",
        examples=[True],
    )
    filename: str = Field(
        ...,
        description="Original name of the uploaded image file.",
        examples=["plastic_bottle.jpg"],
    )
    predicted_class: str = Field(
        ...,
        description="Waste category with the highest confidence score.",
        examples=["Plastic"],
    )
    confidence: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Probability score for the top predicted class.",
        examples=[0.9638],
    )
    confidence_percentage: float = Field(
        ...,
        ge=0.0,
        le=100.0,
        description="Confidence percentage for the top predicted class (0-100%).",
        examples=[96.38],
    )
    top_predictions: List[PredictionItem] = Field(
        ...,
        description="Ranked list of the top predicted classes and their scores.",
    )


class ErrorResponse(BaseModel):
    """Standardized error response schema."""

    success: bool = Field(default=False, description="Failure status flag.")
    error: str = Field(..., description="High-level error classification.")
    detail: Optional[str] = Field(None, description="Detailed user-facing error explanation.")
