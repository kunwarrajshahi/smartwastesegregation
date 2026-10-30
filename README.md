# Smart Waste Segregation API

A modular, production-ready REST API built with **FastAPI** and **PyTorch** for automated municipal waste classification. This API serves a fine-tuned **ResNet18** deep learning model trained on the **RealWaste** dataset, categorizing waste items into 9 distinct recyclability and disposal categories to optimize waste segregation.

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Supported Waste Categories](#supported-waste-categories)
- [Technology Stack](#technology-stack)
- [Project Architecture](#project-architecture)
- [Installation (Windows PowerShell)](#installation-windows-powershell)
- [Running the API](#running-the-api)
- [Interactive API Documentation](#interactive-api-documentation)
- [API Endpoints & Specifications](#api-endpoints--specifications)
  - [1. Health Check (`GET /`)](#1-health-check-get-)
  - [2. Model Information (`GET /model-info`)](#2-model-information-get-model-info)
  - [3. Waste Classification (`POST /predict`)](#3-waste-classification-post-predict)
- [Sample Usage (cURL & PowerShell)](#sample-usage-curl--powershell)
- [Validation & Error Handling](#validation--error-handling)
- [Automated Testing](#automated-testing)
- [License](#license)

---

## Overview

Efficient waste segregation is critical for sustainable recycling pipelines and circular economy initiatives. This project deploys a high-performance computer vision inference service capable of categorizing solid waste from uploaded photographs in real time using a convolutional neural network (ResNet18).

The backend is engineered following production-grade best practices:
- **Zero redundant reloading:** The deep learning model is loaded into memory exactly once during application startup using FastAPI's asynchronous lifespan manager.
- **Optimized CPU inference:** Computations run using `torch.inference_mode()` with the model set to evaluation mode (`model.eval()`).
- **Separation of concerns:** Modular layers cleanly isolate network definitions, data validation, image transformation, and HTTP routing.

---

## Key Features

- **Trained Deep Learning Model:** Integrates existing `models/best_model.pth` trained on 4,752 RealWaste images across 9 classes.
- **Fast Multiclass Inference:** Computes softmax probabilities, extracts the top predicted class with confidence percentages, and ranks the top 3 candidate categories.
- **Robust Image Processing Pipeline:** Validates file signatures, handles multiple formats (JPEG, PNG, WEBP, BMP), converts color spaces to RGB, resizes to $224 \times 224$, and applies standard ImageNet normalization matching the training distribution.
- **Comprehensive Error Handling:** Enforces a 10 MB payload ceiling, intercepts corrupt/unidentified files, blocks empty uploads, and protects against path/traceback leakage.
- **Auto-Generated Documentation:** Interactive Swagger UI and ReDoc OpenAPI interfaces.
- **Automated Test Coverage:** Pre-configured `pytest` suite testing all endpoints, edge cases, and inference flows.

---

## Supported Waste Categories

The classification model recognizes 9 categories:

1. **Cardboard**
2. **Food Organics**
3. **Glass**
4. **Metal**
5. **Miscellaneous Trash**
6. **Paper**
7. **Plastic**
8. **Textile Trash**
9. **Vegetation**

---

## Technology Stack

| Layer | Component | Version / Note |
|---|---|---|
| **Language** | Python | 3.10+ / 3.14 compatible |
| **API Framework** | FastAPI | High-performance asynchronous REST API |
| **ASGI Web Server**| Uvicorn | Lightning-fast ASGI production server |
| **Deep Learning** | PyTorch & Torchvision | ResNet18 architecture for tensor operations |
| **Image Processing** | Pillow (PIL) | Safe decoding, verification, and color conversion |
| **Validation** | Pydantic v2 | Strict schema typing and serialization |
| **Multipart Form** | Python-Multipart | Streaming file upload parser |
| **Testing** | Pytest & HTTPX | Automated endpoint integration testing |

---

## Project Architecture

```
smart-waste-segregation/
│
├── app/
│   ├── __init__.py                # App package initialization
│   ├── main.py                    # FastAPI application, lifespan, CORS & handlers
│   ├── config.py                  # Settings, normalization params, and file limits
│   ├── schemas/
│   │   ├── __init__.py            # Schema exports
│   │   └── prediction.py          # Pydantic schemas (Health, ModelInfo, Prediction)
│   ├── services/
│   │   ├── __init__.py            # Service exports
│   │   ├── model_loader.py        # Checkpoint loader & ResNet18 reconstructor
│   │   └── prediction_service.py  # Inference execution, softmax & top-k ranking
│   ├── routers/
│   │   ├── __init__.py            # Router exports
│   │   ├── health.py              # GET / and GET /model-info routes
│   │   └── prediction.py          # POST /predict multipart upload route
│   └── utils/
│       ├── __init__.py            # Utility exports
│       └── image_processing.py    # File validation, PIL decoding, and transforms
│
├── models/
│   └── best_model.pth             # Trained PyTorch ResNet18 checkpoint
│
├── tests/
│   ├── __init__.py                # Test package initialization
│   └── test_api.py                # Automated pytest integration test suite
│
├── RealWaste/                     # Training dataset (intact)
├── captured_images/               # Captured camera samples (intact)
├── train_model.py                 # Training script (intact)
├── predict.py                     # Prediction script (intact)
├── requirements.txt               # API dependencies
├── .gitignore                     # Git ignore rules
└── README.md                      # Documentation
```

---

## Installation (Windows PowerShell)

Open **PowerShell** and navigate to your project root:

```powershell
# Navigate to the project directory
cd F:\smart-waste-segregation

# Activate the existing virtual environment
.\venv\Scripts\Activate.ps1
```

> **Note:** If PowerShell execution policy restricts running scripts, allow it for the current session:
> ```powershell
> Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process
> ```

Install or verify required packages:

```powershell
pip install -r requirements.txt
```

---

## Running the API

Start the FastAPI application using Uvicorn:

```powershell
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

Or execute directly through Python:

```powershell
python -m app.main
```

When successfully launched, you will see output similar to:

```
2026-10-30 16:47:35 | INFO     | smart_waste_api:lifespan:35 - Initializing Smart Waste Segregation API backend...
2026-10-30 16:47:35 | INFO     | smart_waste_api.model_loader:load_model:70 - Checking model checkpoint at: F:\smart-waste-segregation\models\best_model.pth
2026-10-30 16:47:36 | INFO     | smart_waste_api.model_loader:load_model:88 - Checkpoint loaded successfully with 9 classes and validation accuracy: 74.34%
2026-10-30 16:47:36 | INFO     | smart_waste_api.model_loader:load_model:104 - ResNet18 model initialized and placed in eval mode.
2026-10-30 16:47:36 | INFO     | uvicorn.server:serve:86 - Application startup complete.
2026-10-30 16:47:36 | INFO     | uvicorn.server:serve:208 - Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
```

---

## Interactive API Documentation

Once the server is running, explore the interactive documentation directly in your browser:

- **Swagger UI:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)  
  *Allows direct testing of file uploads, parameter exploration, and live response inspection.*
- **ReDoc:** [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)  
  *Clean, structured technical specification of all schemas and response contracts.*

---

## API Endpoints & Specifications

### 1. Health Check (`GET /`)

Verifies that the API service is alive and healthy.

- **URL:** `/`
- **Method:** `GET`
- **Response Code:** `200 OK`
- **Response Format:**
  ```json
  {
    "status": "success",
    "message": "Smart Waste Segregation API is running"
  }
  ```

---

### 2. Model Information (`GET /model-info`)

Provides runtime metadata regarding the loaded deep learning model.

- **URL:** `/model-info`
- **Method:** `GET`
- **Response Code:** `200 OK`
- **Response Format:**
  ```json
  {
    "model_architecture": "ResNet18",
    "supported_waste_categories": [
      "Cardboard",
      "Food Organics",
      "Glass",
      "Metal",
      "Miscellaneous Trash",
      "Paper",
      "Plastic",
      "Textile Trash",
      "Vegetation"
    ],
    "total_classes": 9,
    "input_image_dimensions": {
      "width": 224,
      "height": 224,
      "channels": 3
    },
    "device": "cpu",
    "saved_validation_accuracy": 74.34
  }
  ```

---

### 3. Waste Classification (`POST /predict`)

Accepts a waste image via multipart form upload, validates it, passes it through the ResNet18 model, and returns the top predicted category with confidence and top 3 predictions.

- **URL:** `/predict`
- **Method:** `POST`
- **Content-Type:** `multipart/form-data`
- **Request Form Field:** `file` (Binary image file: JPEG, PNG, BMP, WEBP; $\le 10\text{ MB}$)
- **Response Code:** `200 OK`
- **Response Format:**
  ```json
  {
    "success": true,
    "filename": "plastic_bottle.jpg",
    "predicted_class": "Plastic",
    "confidence": 0.9638,
    "confidence_percentage": 96.38,
    "top_predictions": [
      {
        "class": "Plastic",
        "confidence": 0.9638
      },
      {
        "class": "Paper",
        "confidence": 0.0210
      },
      {
        "class": "Metal",
        "confidence": 0.0080
      }
    ]
  }
  ```

---

## Sample Usage (cURL & PowerShell)

### Using Windows PowerShell

```powershell
# 1. Health check
Invoke-RestMethod -Uri "http://127.0.0.1:8000/" -Method Get

# 2. Get model metadata
Invoke-RestMethod -Uri "http://127.0.0.1:8000/model-info" -Method Get

# 3. Classify a waste image
$Form = @{
    file = Get-Item -Path "F:\smart-waste-segregation\RealWaste\Metal\Metal_13.jpg"
}
Invoke-RestMethod -Uri "http://127.0.0.1:8000/predict" -Method Post -Form $Form | ConvertTo-Json -Depth 5
```

### Using cURL (Command Line or Bash)

```bash
# 1. Health check
curl -X GET "http://127.0.0.1:8000/"

# 2. Model info
curl -X GET "http://127.0.0.1:8000/model-info"

# 3. Waste prediction
curl -X POST "http://127.0.0.1:8000/predict" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@F:\smart-waste-segregation\RealWaste\Metal\Metal_13.jpg"
```

---

## Validation & Error Handling

The API strictly validates inputs and returns informative, standardized JSON error messages:

| HTTP Status | Condition | Example Response |
|---|---|---|
| **400 Bad Request** | Empty file upload ($0$ bytes) | `{"detail": "The uploaded file is empty (0 bytes)."}` |
| **400 Bad Request** | Corrupted / non-image bytes | `{"detail": "The uploaded file is not a valid or readable image."}` |
| **413 Content Too Large** | File size exceeds 10 MB | `{"detail": "Uploaded file exceeds maximum allowed size limit of 10 MB."}` |
| **415 Unsupported Media Type** | Disallowed extension (`.pdf`, `.txt`, `.exe`) | `{"detail": "Unsupported file extension '.pdf'. Allowed formats: .bmp, .jpeg, .jpg, .png, .webp"}` |
| **422 Unprocessable Content** | Missing `file` field in multipart form | `{"detail": "Request validation failed.", "errors": ["body -> file: Field required"]}` |
| **503 Service Unavailable** | Model checkpoint failed to load at startup | `{"detail": "Machine learning model is not available or failed to load."}` |

Internal stack traces and host filesystem paths are securely suppressed from API responses.

---

## Automated Testing

An automated test suite powered by `pytest` and `fastapi.testclient.TestClient` verifies all endpoints and failure scenarios:

```powershell
# Run the test suite with verbose output
.\venv\Scripts\python.exe -m pytest tests/test_api.py -v
```

Expected test result:

```
tests/test_api.py::TestHealthEndpoints::test_health_check_endpoint PASSED       [ 11%]
tests/test_api.py::TestHealthEndpoints::test_model_info_endpoint PASSED        [ 22%]
tests/test_api.py::TestPredictionEndpoints::test_predict_with_real_image PASSED [ 33%]
tests/test_api.py::TestPredictionEndpoints::test_predict_with_synthetic_valid_image PASSED [ 44%]
tests/test_api.py::TestPredictionEndpoints::test_predict_with_corrupted_image PASSED [ 55%]
tests/test_api.py::TestPredictionEndpoints::test_predict_with_unsupported_file_extension PASSED [ 66%]
tests/test_api.py::TestPredictionEndpoints::test_predict_with_empty_file PASSED [ 77%]
tests/test_api.py::TestPredictionEndpoints::test_predict_exceeding_max_file_size PASSED [ 88%]
tests/test_api.py::TestPredictionEndpoints::test_predict_missing_file_payload PASSED [100%]

======================== 9 passed in 7.13s ========================
```

---

## License

This project is developed for educational and research purposes as part of the Smart Waste Segregation Using Computer Vision and Deep Learning Final Year Project.
