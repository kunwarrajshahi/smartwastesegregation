"""Extended Automated Integration Tests for all Endpoints.
Covers Auth, Scans, Analytics, Recycling Rules, and System Settings.
"""

import io
import uuid
import pytest
from fastapi.testclient import TestClient
from PIL import Image

from app.main import app
from app.config import settings

@pytest.fixture(scope="module")
def client():
    with TestClient(app) as test_client:
        yield test_client

@pytest.fixture
def test_user_token(client: TestClient):
    """Registers and authenticates a fresh test user, returning the JWT token."""
    unique_email = f"pytest_{uuid.uuid4().hex[:8]}@ecosort.ai"
    reg_resp = client.post(
        "/api/auth/register",
        json={
            "email": unique_email,
            "password": "testpassword123",
            "full_name": "Pytest Operator",
            "role": "operator",
        },
    )
    assert reg_resp.status_code == 201
    return reg_resp.json()["access_token"], unique_email

class TestAuthEndpoints:
    def test_register_and_login_success(self, client: TestClient):
        email = f"user_{uuid.uuid4().hex[:8]}@ecosort.ai"
        # Register
        r_resp = client.post(
            "/api/auth/register",
            json={
                "email": email,
                "password": "password123",
                "full_name": "New User",
                "role": "operator",
            },
        )
        assert r_resp.status_code == 201
        data = r_resp.json()
        assert "access_token" in data
        assert data["user"]["email"] == email

        # Login
        l_resp = client.post(
            "/api/auth/login",
            json={"email": email, "password": "password123"},
        )
        assert l_resp.status_code == 200
        assert "access_token" in l_resp.json()

    def test_login_invalid_credentials(self, client: TestClient):
        resp = client.post(
            "/api/auth/login",
            json={"email": "nonexistent@ecosort.ai", "password": "wrong"},
        )
        assert resp.status_code == 401

    def test_register_duplicate_email(self, client: TestClient, test_user_token):
        _, email = test_user_token
        resp = client.post(
            "/api/auth/register",
            json={
                "email": email,
                "password": "anotherpassword",
                "full_name": "Duplicate User",
            },
        )
        assert resp.status_code == 400
        assert "already exists" in resp.json()["detail"].lower()

    def test_get_me_and_update_profile(self, client: TestClient, test_user_token):
        token, email = test_user_token
        headers = {"Authorization": f"Bearer {token}"}

        # GET /api/auth/me
        me_resp = client.get("/api/auth/me", headers=headers)
        assert me_resp.status_code == 200
        assert me_resp.json()["email"] == email

        # PUT /api/auth/profile
        upd_resp = client.put(
            "/api/auth/profile",
            headers=headers,
            json={"full_name": "Renamed Operator"},
        )
        assert upd_resp.status_code == 200
        assert upd_resp.json()["full_name"] == "Renamed Operator"

class TestScansEndpoints:
    def test_get_scans_list(self, client: TestClient):
        resp = client.get("/api/scans?page=1&limit=5")
        assert resp.status_code == 200
        data = resp.json()
        assert "items" in data
        assert "total" in data
        assert isinstance(data["items"], list)

    def test_scans_search_and_filter(self, client: TestClient):
        resp = client.get("/api/scans?category=metal")
        assert resp.status_code == 200
        data = resp.json()
        for item in data["items"]:
            assert "metal" in item["predicted_class"].lower()

    def test_verify_scan(self, client: TestClient):
        # List scans to get an ID
        scans_resp = client.get("/api/scans?page=1&limit=1")
        assert scans_resp.status_code == 200
        items = scans_resp.json()["items"]
        if items:
            scan_id = items[0]["id"]
            verify_resp = client.patch(
                f"/api/scans/{scan_id}/verify",
                json={"verified_class": "Metal", "notes": "Automated verification test"},
            )
            assert verify_resp.status_code == 200
            assert verify_resp.json()["is_verified"] is True
            assert verify_resp.json()["notes"] == "Automated verification test"

    def test_get_nonexistent_scan_404(self, client: TestClient):
        resp = client.get("/api/scans/00000000-0000-0000-0000-000000000000")
        assert resp.status_code == 404

class TestAnalyticsEndpoints:
    def test_get_overview(self, client: TestClient):
        resp = client.get("/api/analytics/overview")
        assert resp.status_code == 200
        data = resp.json()
        assert "total_scans" in data
        assert "total_weight_kg" in data
        assert "landfill_diversion_rate" in data

    def test_get_categories(self, client: TestClient):
        resp = client.get("/api/analytics/categories")
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, list)
        assert len(data) > 0

    def test_get_environmental_impact(self, client: TestClient):
        resp = client.get("/api/analytics/environmental")
        assert resp.status_code == 200
        data = resp.json()
        assert "co2_avoided_kg" in data
        assert "equivalents" in data
        assert "trees_seedlings_grown_10_yrs" in data["equivalents"]

    def test_get_trends(self, client: TestClient):
        resp = client.get("/api/analytics/trends?timeframe=weekly")
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, list)
        assert len(data) == 7

    def test_export_csv(self, client: TestClient):
        resp = client.get("/api/analytics/export")
        assert resp.status_code == 200
        assert resp.headers["content-type"].startswith("text/csv")
        assert "Scan ID,Timestamp,Filename" in resp.text

class TestRecyclingAndSettingsEndpoints:
    def test_get_recycling_rules(self, client: TestClient):
        resp = client.get("/api/recycling/rules")
        assert resp.status_code == 200
        rules = resp.json()
        assert len(rules) == 9
        keys = [r["category_key"] for r in rules]
        assert "plastic" in keys
        assert "metal" in keys

    def test_update_recycling_rule(self, client: TestClient):
        resp = client.put(
            "/api/recycling/rules/cardboard",
            json={"bin_name": "Updated Blue Recycling Bin"},
        )
        assert resp.status_code == 200
        assert resp.json()["bin_name"] == "Updated Blue Recycling Bin"

        # Restore
        client.put(
            "/api/recycling/rules/cardboard",
            json={"bin_name": "Blue Recycling Bin"},
        )

    def test_get_and_update_settings(self, client: TestClient):
        # GET
        g_resp = client.get("/api/settings")
        assert g_resp.status_code == 200
        data = g_resp.json()
        assert "confidence_threshold" in data

        # PUT
        u_resp = client.put(
            "/api/settings",
            json={"confidence_threshold": 90, "actuator_delay_ms": 160},
        )
        assert u_resp.status_code == 200
        assert u_resp.json()["confidence_threshold"] == 90
        assert u_resp.json()["actuator_delay_ms"] == 160

        # POST /reset
        r_resp = client.post("/api/settings/reset")
        assert r_resp.status_code == 200
        assert r_resp.json()["confidence_threshold"] == 85
