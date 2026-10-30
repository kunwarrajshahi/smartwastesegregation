"""Main FastAPI Application Entrypoint.

Configures application lifespan (loading model once at startup), CORS middleware,
custom error handlers, and includes API routers.
"""

import logging
import sys
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI, HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.routers.health import router as health_router
from app.routers.prediction import router as prediction_router
from app.services.model_loader import ModelLoader

# Configure application logging
logging.basicConfig(
    level=settings.LOG_LEVEL,
    format="%(asctime)s | %(levelname)-8s | %(name)s:%(funcName)s:%(lineno)d - %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logger = logging.getLogger("smart_waste_api")


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan context manager for startup and shutdown events.

    Loads the PyTorch ResNet18 model into memory once during application startup
    and stores it in app.state.
    """
    logger.info("Initializing Smart Waste Segregation API backend...")
    logger.info(f"Target execution device: {settings.DEVICE}")

    try:
        # Load model checkpoint once at startup
        bundle = ModelLoader.load_model(
            model_path=settings.MODEL_PATH,
            device_name=settings.DEVICE,
        )
        app.state.model_bundle = bundle
        logger.info(
            f"Model successfully loaded! Classes: {bundle.classes} | "
            f"Validation Accuracy: {bundle.val_accuracy:.2f}%"
        )
    except Exception as exc:
        logger.critical(f"Fatal error during model initialization: {exc}", exc_info=True)
        # We do not crash startup completely to allow health check to report status,
        # but mark bundle as None
        app.state.model_bundle = None

    yield

    logger.info("Shutting down Smart Waste Segregation API backend...")
    app.state.model_bundle = None


# Initialize FastAPI application with Swagger UI and ReDoc
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=settings.DESCRIPTION,
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Configure Cross-Origin Resource Sharing (CORS) with safe defaults
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=settings.CORS_ALLOW_CREDENTIALS,
    allow_methods=settings.CORS_ALLOW_METHODS,
    allow_headers=settings.CORS_ALLOW_HEADERS,
)


# Global Exception Handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    """Handles standard HTTP exceptions with structured JSON responses."""
    logger.warning(
        f"HTTP {exc.status_code} on {request.method} {request.url.path}: {exc.detail}"
    )
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    """Handles request validation errors cleanly without leaking internal traces."""
    logger.warning(f"Validation error on {request.method} {request.url.path}: {exc.errors()}")
    # Format readable error messages
    errors = []
    for err in exc.errors():
        field = " -> ".join(str(loc) for loc in err.get("loc", []))
        msg = err.get("msg", "Invalid parameter")
        errors.append(f"{field}: {msg}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": "Request validation failed.", "errors": errors},
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Catches all unhandled exceptions and prevents stack trace leakage."""
    logger.error(
        f"Unhandled internal server error on {request.method} {request.url.path}: {exc}",
        exc_info=True,
    )
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal server error occurred while processing your request."},
    )


# Register API Routers
app.include_router(health_router)
app.include_router(prediction_router)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=False,
    )
