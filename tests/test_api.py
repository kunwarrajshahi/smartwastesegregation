"""Automated API Tests.

Comprehensive pytest test suite using FastAPI TestClient to test:
- Liveness health check endpoint (GET /)
- Model metadata endpoint (GET /model-info)
- Real image prediction (POST /predict)
- Synthetic image prediction (POST /predict)
- Corrupted / invalid image file handling (HTTP 400)
- Unsupported file extension handling (HTTP 415)
- Empty image file upload handling (HTTP 400)
- Exceeded file size limit handling (HTTP 413)
- Missing file field handling (HTTP 422)
"""

import io
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from PIL import Image

from app.config import settings
from app.main import app


@pytest.fixture(scope="module")
def client():
    """Module-scoped TestClient to trigger lifespan startup and load model once."""
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
def sample_image_bytes():
    """Generates an in-memory valid RGB JPEG image."""
    img = Image.new("RGB", (224, 224), color=(73, 109, 137))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    return buf.getvalue()


class TestHealthEndpoints:
    """Tests for health and system metadata endpoints."""

    def test_health_check_endpoint(self, client: TestClient):
        """Tests GET / returns status 200 and expected health message."""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert data["message"] == "Smart Waste Segregation API is running"

    def test_model_info_endpoint(self, client: TestClient):
        """Tests GET /model-info returns complete architecture, classes, and accuracy."""
        response = client.get("/model-info")
        assert response.status_code == 200
        data = response.json()

        assert data["model_architecture"] == "ResNet18"
        assert data["total_classes"] == 9
        assert isinstance(data["supported_waste_categories"], list)
        assert len(data["supported_waste_categories"]) == 9
        assert "Plastic" in data["supported_waste_categories"]
        assert "Metal" in data["supported_waste_categories"]
        assert data["input_image_dimensions"] == {
            "width": 224,
            "height": 224,
            "channels": 3,
        }
        assert data["device"] in ["cpu", "cuda"]
        assert data["saved_validation_accuracy"] > 0.0


class TestPredictionEndpoints:
    """Tests for waste classification inference and error handling."""

    def test_predict_with_real_image(self, client: TestClient):
        """Tests POST /predict using a real image from the dataset if available."""
        real_image_path = Path(r"F:\smart-waste-segregation\RealWaste\Metal\Metal_13.jpg")
        if not real_image_path.exists():
            pytest.skip("Sample dataset image not found on disk.")

        with open(real_image_path, "rb") as f:
            file_bytes = f.read()

        response = client.post(
            "/predict",
            files={"file": ("Metal_13.jpg", file_bytes, "image/jpeg")},
        )
        assert response.status_code == 200
        data = response.json()

        assert data["success"] is True
        assert data["filename"] == "Metal_13.jpg"
        assert data["predicted_class"] == "Metal"
        assert 0.0 <= data["confidence"] <= 1.0
        assert 0.0 <= data["confidence_percentage"] <= 100.0
        assert len(data["top_predictions"]) == 3

        # Validate top predictions schema and ranking
        assert data["top_predictions"][0]["class"] == data["predicted_class"]
        for item in data["top_predictions"]:
            assert "class" in item
            assert "confidence" in item
            assert 0.0 <= item["confidence"] <= 1.0

    def test_predict_with_synthetic_valid_image(self, client: TestClient, sample_image_bytes):
        """Tests POST /predict using an in-memory dynamically generated JPEG image."""
        response = client.post(
            "/predict",
            files={"file": ("test_sample.jpg", sample_image_bytes, "image/jpeg")},
        )
        assert response.status_code == 200
        data = response.json()

        assert data["success"] is True
        assert data["filename"] == "test_sample.jpg"
        assert isinstance(data["predicted_class"], str)
        assert len(data["predicted_class"]) > 0
        assert 0.0 <= data["confidence"] <= 1.0
        assert len(data["top_predictions"]) == 3

    def test_predict_with_corrupted_image(self, client: TestClient):
        """Tests POST /predict with invalid binary bytes masquerading as a JPEG."""
        corrupted_bytes = b"This is not a real image header or jpeg content."
        response = client.post(
            "/predict",
            files={"file": ("corrupt.jpg", corrupted_bytes, "image/jpeg")},
        )
        assert response.status_code == 400
        data = response.json()
        assert "detail" in data
        assert "valid or readable image" in data["detail"].lower()

    def test_predict_with_unsupported_file_extension(self, client: TestClient):
        """Tests POST /predict with unsupported file formats (.txt, .pdf)."""
        response = client.post(
            "/predict",
            files={"file": ("document.txt", b"plain text content", "text/plain")},
        )
        assert response.status_code == 415
        data = response.json()
        assert "detail" in data
        assert "Unsupported file extension" in data["detail"]

    def test_predict_with_empty_file(self, client: TestClient):
        """Tests POST /predict with an empty upload (0 bytes)."""
        response = client.post(
            "/predict",
            files={"file": ("empty.png", b"", "image/png")},
        )
        assert response.status_code == 400
        data = response.json()
        assert "detail" in data
        assert "empty" in data["detail"].lower()

    def test_predict_exceeding_max_file_size(self, client: TestClient):
        """Tests POST /predict with payload exceeding 10 MB limit."""
        # 10 MB + 1024 bytes
        oversized_bytes = b"0" * (settings.MAX_UPLOAD_SIZE_BYTES + 1024)
        response = client.post(
            "/predict",
            files={"file": ("oversized.jpg", oversized_bytes, "image/jpeg")},
        )
        assert response.status_code == 413
        data = response.json()
        assert "detail" in data
        assert "exceeds maximum allowed size" in data["detail"].lower()

    def test_predict_missing_file_payload(self, client: TestClient):
        """Tests POST /predict when no multipart file field is sent."""
        response = client.post("/predict")
        assert response.status_code == 422
