"""Application Configuration Module.

Centralizes all environment settings, model parameters, image preprocessing
constants, and security configurations.
"""

import os
from pathlib import Path
from typing import List, Set


class Settings:
    """Application settings with environment variable fallbacks."""

    # Project metadata
    PROJECT_NAME: str = "Smart Waste Segregation API"
    VERSION: str = "1.0.0"
    DESCRIPTION: str = (
        "Production-ready FastAPI backend for automated waste classification "
        "using a deep learning ResNet18 model trained on the RealWaste dataset."
    )

    # Base paths
    BASE_DIR: Path = Path(__file__).resolve().parent.parent
    MODEL_PATH: Path = BASE_DIR / "models" / "best_model.pth"

    # Model and inference specifications
    MODEL_ARCHITECTURE: str = "ResNet18"
    DEVICE: str = os.getenv("DEVICE", "cpu")
    IMAGE_WIDTH: int = 224
    IMAGE_HEIGHT: int = 224
    IMAGE_CHANNELS: int = 3
    IMAGE_SIZE: tuple[int, int] = (IMAGE_WIDTH, IMAGE_HEIGHT)

    # Normalization parameters (matching training)
    NORMALIZE_MEAN: List[float] = [0.485, 0.456, 0.406]
    NORMALIZE_STD: List[float] = [0.229, 0.224, 0.225]

    # File upload restrictions
    MAX_UPLOAD_SIZE_BYTES: int = 10 * 1024 * 1024  # 10 MB
    ALLOWED_EXTENSIONS: Set[str] = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}
    ALLOWED_MIME_TYPES: Set[str] = {
        "image/jpeg",
        "image/png",
        "image/bmp",
        "image/webp",
    }

    # CORS configuration
    CORS_ORIGINS: List[str] = ["*"]
    CORS_ALLOW_CREDENTIALS: bool = True
    CORS_ALLOW_METHODS: List[str] = ["*"]
    CORS_ALLOW_HEADERS: List[str] = ["*"]

    # Server settings
    HOST: str = os.getenv("HOST", "127.0.0.1")
    PORT: int = int(os.getenv("PORT", "8000"))
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")

    # Database configuration (SQLite by default, compatible with PostgreSQL)
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        f"sqlite:///{BASE_DIR / 'smart_waste.db'}"
    )

    # Security & JWT authentication
    SECRET_KEY: str = os.getenv(
        "SECRET_KEY",
        "ecosort-ai-smart-waste-secret-key-production-32-chars-min"
    )
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # Storage paths
    UPLOADS_DIR: Path = BASE_DIR / "uploads" / "scans"


settings = Settings()
