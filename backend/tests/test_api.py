from fastapi.testclient import TestClient

from app.core.config import get_settings
from app.main import create_app


get_settings.cache_clear()
client = TestClient(create_app())


def test_root_returns_service_metadata() -> None:
    response = client.get("/")

    assert response.status_code == 200
    assert response.json() == {
        "service": "purplexity-api",
        "status": "ok",
        "docs": "/docs",
    }


def test_health_check_returns_ok() -> None:
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {
        "status": "ok",
        "service": "purplexity-api",
    }


def test_search_returns_placeholder_response() -> None:
    response = client.post("/api/search", json={"query": "best AI search app"})

    assert response.status_code == 200
    body = response.json()
    assert body["query"] == "best AI search app"
    assert "placeholder response" in body["answer"]
    assert len(body["sources"]) == 1
    assert len(body["follow_up_questions"]) == 3


def test_search_rejects_empty_query() -> None:
    response = client.post("/api/search", json={"query": ""})

    assert response.status_code == 422
