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
    model_version: str = Field(
        default="1.0.0",
        description="Active deep learning model release version.",
        examples=["1.0.0"],
    )
    dataset_name: str = Field(
        default="RealWaste",
        description="Dataset used for training and benchmarking.",
        examples=["RealWaste"],
    )
    evaluation_split: str = Field(
        default="Held-out Test Split (951 images)",
        description="Dataset split identifying reported metrics.",
        examples=["Held-out Test Split (951 images)"],
    )
    test_accuracy: float = Field(
        default=74.34,
        description="Recorded top-1 test accuracy percentage.",
        examples=[74.34],
    )
    macro_precision: float = Field(
        default=77.0,
        description="Macro-averaged precision percentage.",
        examples=[77.0],
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
    scan_id: Optional[str] = Field(
        default=None,
        description="Persistent database ID for the recorded scan.",
        examples=["b9e6c46a-723a-4efb-86d4-83952fef1132"],
    )
    image_url: Optional[str] = Field(
        default=None,
        description="Static URL path to view the uploaded scan image.",
        examples=["/uploads/scans/b9e6c46a-723a-4efb-86d4-83952fef1132.jpg"],
    )
    destination_bin: Optional[str] = Field(
        default=None,
        description="Designated sorting bin destination.",
        examples=["Blue Plastics Bin"],
    )
    recycling_category: Optional[str] = Field(
        default=None,
        description="Stream recyclability classification (recyclable, compostable, non_recyclable, special).",
        examples=["recyclable"],
    )


class ErrorResponse(BaseModel):
    """Standardized error response schema."""

    success: bool = Field(default=False, description="Failure status flag.")
    error: str = Field(..., description="High-level error classification.")
    detail: Optional[str] = Field(None, description="Detailed user-facing error explanation.")
