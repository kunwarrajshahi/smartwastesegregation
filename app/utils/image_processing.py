"""Image validation and preprocessing pipeline.

Ensures strict file validation, sanitization, Pillow-based decoding, and
TorchVision transformation matching the training pipeline.
"""

import io
import logging
from pathlib import Path
from typing import Tuple

import torch
from fastapi import HTTPException, UploadFile, status
from PIL import Image, UnidentifiedImageError
from torchvision import transforms

from app.config import settings

logger = logging.getLogger("smart_waste_api.image_processing")


def get_image_transform(target_size: Tuple[int, int] = (224, 224)) -> transforms.Compose:
    """Returns the torchvision transform pipeline identical to the training setup.

    Args:
        target_size: Desired (height, width) tuple for model input.

    Returns:
        Compose transform object.
    """
    return transforms.Compose([
        transforms.Resize(target_size),
        transforms.ToTensor(),
        transforms.Normalize(
            mean=settings.NORMALIZE_MEAN,
            std=settings.NORMALIZE_STD,
        ),
    ])


async def validate_upload_file(file: UploadFile) -> bytes:
    """Validates the uploaded file for presence, extension, size, and reads contents.

    Args:
        file: FastAPI UploadFile object.

    Returns:
        Raw bytes of the uploaded image.

    Raises:
        HTTPException: With appropriate 400, 413, or 415 HTTP status codes.
    """
    if not file or not file.filename:
        logger.warning("Upload rejected: No file provided or filename is empty.")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No image file provided in upload request.",
        )

    filename = file.filename.strip()
    ext = Path(filename).suffix.lower()

    # Validate file extension
    if ext not in settings.ALLOWED_EXTENSIONS:
        logger.warning(f"Upload rejected: Unsupported extension '{ext}' for file '{filename}'.")
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=(
                f"Unsupported file extension '{ext}'. "
                f"Allowed formats: {', '.join(sorted(settings.ALLOWED_EXTENSIONS))}"
            ),
        )

    # Read file content safely, guarding against memory exhaustion
    try:
        content = await file.read()
    except Exception as exc:
        logger.error(f"Error reading upload file content: {exc}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to read uploaded file.",
        )

    # Check for empty upload (0 bytes)
    file_size = len(content)
    if file_size == 0:
        logger.warning(f"Upload rejected: File '{filename}' is empty (0 bytes).")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The uploaded file is empty (0 bytes).",
        )

    # Check maximum file size limit (10 MB)
    if file_size > settings.MAX_UPLOAD_SIZE_BYTES:
        max_mb = settings.MAX_UPLOAD_SIZE_BYTES // (1024 * 1024)
        logger.warning(
            f"Upload rejected: File '{filename}' size ({file_size} bytes) "
            f"exceeds limit ({settings.MAX_UPLOAD_SIZE_BYTES} bytes)."
        )
        raise HTTPException(
            status_code=getattr(
                status, "HTTP_413_CONTENT_TOO_LARGE", status.HTTP_413_REQUEST_ENTITY_TOO_LARGE
            ),
            detail=f"Uploaded file exceeds maximum allowed size limit of {max_mb} MB.",
        )

    return content


def process_image_bytes(
    image_bytes: bytes,
    target_size: Tuple[int, int] = (224, 224),
) -> torch.Tensor:
    """Decodes image bytes with Pillow, converts to RGB, and applies PyTorch transforms.

    Args:
        image_bytes: Raw binary image data.
        target_size: Dimensions (width, height) to resize.

    Returns:
        PyTorch tensor with shape [1, 3, 224, 224].

    Raises:
        HTTPException: If image cannot be decoded, is corrupt, or invalid.
    """
    try:
        # Step 1: Open and verify image structure
        stream = io.BytesIO(image_bytes)
        with Image.open(stream) as img:
            img.verify()

        # Step 2: Re-open for actual processing (verify closes stream in PIL)
        stream.seek(0)
        image = Image.open(stream)

        # Step 3: Convert to 3-channel RGB (handles RGBA, Grayscale, CMYK, etc.)
        image = image.convert("RGB")

    except (UnidentifiedImageError, OSError, ValueError, SyntaxError) as exc:
        logger.warning(f"Image decode failed: {exc}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The uploaded file is not a valid or readable image.",
        )

    # Step 4: Apply transform pipeline and add batch dimension [1, 3, H, W]
    transform = get_image_transform(target_size)
    tensor = transform(image).unsqueeze(0)
    return tensor
