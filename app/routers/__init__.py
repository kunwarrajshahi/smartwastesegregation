"""Routers Package."""

from app.routers.health import router as health_router
from app.routers.prediction import router as prediction_router

__all__ = ["health_router", "prediction_router"]
