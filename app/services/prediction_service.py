"""Prediction Service Module.

Encapsulates deep learning inference logic, top-k probability ranking,
and translation of PyTorch tensor outputs to Pydantic prediction response schemas.
"""

import logging
from typing import Optional

import torch
from fastapi import HTTPException, status

from app.schemas.prediction import PredictionItem, PredictionResponse
from app.services.model_loader import ModelBundle
from app.utils.image_processing import process_image_bytes

logger = logging.getLogger("smart_waste_api.prediction_service")


class PredictionService:
    """Handles end-to-end inference workflows for waste classification."""

    @staticmethod
    def classify_image(
        image_bytes: bytes,
        filename: str,
        bundle: ModelBundle,
        top_k: int = 3,
    ) -> PredictionResponse:
        """Runs image classification inference using the loaded ModelBundle.

        Args:
            image_bytes: Binary contents of the uploaded image.
            filename: Original filename of the upload.
            bundle: Loaded ModelBundle containing ResNet18 and metadata.
            top_k: Number of highest ranking classes to include in the response.

        Returns:
            PredictionResponse containing predicted class, confidence, and top-k predictions.

        Raises:
            HTTPException: If image preprocessing fails or inference fails.
        """
        # Step 1: Preprocess image bytes to tensor
        tensor = process_image_bytes(image_bytes, target_size=bundle.input_size)
        tensor = tensor.to(bundle.device)

        # Step 2: Perform model inference with torch.inference_mode()
        try:
            with torch.inference_mode():
                outputs = bundle.model(tensor)
                probabilities = torch.softmax(outputs, dim=1)[0]

            # Step 3: Extract highest probability class
            confidence, predicted_idx = probabilities.max(dim=0)
            predicted_class = bundle.classes[predicted_idx.item()]
            conf_float = round(float(confidence.item()), 4)
            conf_percentage = round(conf_float * 100.0, 2)

            # Step 4: Extract top-k predictions
            k = min(top_k, len(bundle.classes))
            top_probs, top_indices = torch.topk(probabilities, k)

            top_predictions = [
                PredictionItem(
                    category=bundle.classes[idx.item()],  # serialized as 'class' in JSON
                    confidence=round(float(prob.item()), 4),
                )
                for prob, idx in zip(top_probs, top_indices)
            ]

            logger.info(
                f"Prediction successful for '{filename}': {predicted_class} "
                f"({conf_percentage}%)"
            )

            return PredictionResponse(
                success=True,
                filename=filename,
                predicted_class=predicted_class,
                confidence=conf_float,
                confidence_percentage=conf_percentage,
                top_predictions=top_predictions,
            )

        except HTTPException:
            raise
        except Exception as exc:
            logger.error(f"Inference execution failed for '{filename}': {exc}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="An internal error occurred while processing the image for classification.",
            )
