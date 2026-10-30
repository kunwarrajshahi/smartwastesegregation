"""Model Loader Service.

Responsible for safely loading the trained PyTorch ResNet18 model checkpoint,
rebuilding the exact neural network architecture used during training, and
providing a thread-safe model bundle for API inference.
"""

import logging
from dataclasses import dataclass
from pathlib import Path
from typing import List, Optional, Tuple

import torch
import torch.nn as nn
from torchvision import models

from app.config import settings

logger = logging.getLogger("smart_waste_api.model_loader")


@dataclass
class ModelBundle:
    """Encapsulates the PyTorch neural network and associated training metadata."""

    model: nn.Module
    classes: List[str]
    val_accuracy: float
    device: torch.device
    architecture: str = "ResNet18"
    input_size: Tuple[int, int] = (224, 224)


class ModelLoader:
    """Singleton service to load and cache the machine learning model."""

    _instance: Optional["ModelLoader"] = None
    _bundle: Optional[ModelBundle] = None

    def __new__(cls) -> "ModelLoader":
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    @classmethod
    def load_model(
        cls,
        model_path: Optional[Path] = None,
        device_name: Optional[str] = None,
    ) -> ModelBundle:
        """Loads checkpoint and initializes the ResNet18 model in evaluation mode.

        Args:
            model_path: Path to the .pth checkpoint file.
            device_name: Device identifier string ('cpu' or 'cuda').

        Returns:
            ModelBundle containing the loaded model, categories, and accuracy.

        Raises:
            FileNotFoundError: If the model checkpoint file does not exist.
            RuntimeError: If checkpoint structure is invalid or loading fails.
        """
        path = model_path or settings.MODEL_PATH
        target_device = torch.device(device_name or settings.DEVICE)

        logger.info(f"Checking model checkpoint at: {path}")
        if not path.exists():
            error_msg = f"Model checkpoint file not found at expected path: {path}"
            logger.error(error_msg)
            raise FileNotFoundError(error_msg)

        logger.info(f"Loading checkpoint using device: {target_device}")
        try:
            # Try weights_only=True first for security
            try:
                checkpoint = torch.load(path, map_location=target_device, weights_only=True)
            except Exception as e:
                logger.warning(
                    f"weights_only=True load failed ({e}), retrying with weights_only=False"
                )
                checkpoint = torch.load(path, map_location=target_device, weights_only=False)

            if "classes" not in checkpoint or "model_state_dict" not in checkpoint:
                raise KeyError(
                    "Checkpoint missing required keys ('classes' or 'model_state_dict')"
                )

            classes: List[str] = checkpoint["classes"]
            val_accuracy: float = float(checkpoint.get("val_accuracy", 0.0))

            logger.info(
                f"Checkpoint loaded successfully with {len(classes)} classes "
                f"and validation accuracy: {val_accuracy:.2f}%"
            )

            # Rebuild exact ResNet18 architecture used during training
            model = models.resnet18(weights=None)
            in_features = model.fc.in_features
            model.fc = nn.Linear(in_features, len(classes))

            # Load model state dict
            model.load_state_dict(checkpoint["model_state_dict"])
            model.to(target_device)
            model.eval()

            # Cache the loaded bundle
            cls._bundle = ModelBundle(
                model=model,
                classes=classes,
                val_accuracy=val_accuracy,
                device=target_device,
                architecture=settings.MODEL_ARCHITECTURE,
                input_size=settings.IMAGE_SIZE,
            )

            logger.info("ResNet18 model initialized and placed in eval mode.")
            return cls._bundle

        except Exception as exc:
            logger.critical(f"Failed to initialize model from checkpoint: {exc}", exc_info=True)
            raise RuntimeError(f"Error loading trained model checkpoint: {exc}") from exc

    @classmethod
    def get_bundle(cls) -> ModelBundle:
        """Retrieves the cached model bundle.

        Returns:
            The loaded ModelBundle instance.

        Raises:
            RuntimeError: If the model has not been loaded yet.
        """
        if cls._bundle is None:
            raise RuntimeError("Model has not been initialized. Ensure lifespan startup completed.")
        return cls._bundle

    @classmethod
    def is_loaded(cls) -> bool:
        """Checks if the model bundle has been successfully loaded into memory."""
        return cls._bundle is not None
