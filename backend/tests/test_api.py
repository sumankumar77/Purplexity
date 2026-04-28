import anyio
from fastapi.testclient import TestClient

from app.core.config import get_settings
from app.main import create_app
from app.schemas.search import ChatHistoryMessage, Source
from app.services.search_service import SearchService
from app.services.tavily_service import TavilySearchService


def create_test_client(monkeypatch, tmp_path) -> TestClient:
    monkeypatch.setenv("GEMINI_API_KEY", "")
    monkeypatch.setenv("TAVILY_API_KEY", "")
    monkeypatch.setenv("DATABASE_PATH", str(tmp_path / "test.sqlite3"))
    get_settings.cache_clear()

    return TestClient(create_app())


def test_root_returns_service_metadata(monkeypatch, tmp_path) -> None:
    client = create_test_client(monkeypatch, tmp_path)
    response = client.get("/")

    assert response.status_code == 200
    assert response.json() == {
        "service": "purplexity-api",
        "status": "ok",
        "docs": "/docs",
    }


def test_health_check_returns_ok(monkeypatch, tmp_path) -> None:
    client = create_test_client(monkeypatch, tmp_path)
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {
        "status": "ok",
        "service": "purplexity-api",
    }


def test_search_returns_placeholder_response_without_configured_keys(
    monkeypatch,
    tmp_path,
) -> None:
    client = create_test_client(monkeypatch, tmp_path)
    response = client.post("/api/search", json={"query": "best AI search app"})

    assert response.status_code == 200
    body = response.json()
    assert body["conversation_id"]
    assert body["query"] == "best AI search app"
    assert "Search is not fully configured" in body["answer"]
    assert len(body["sources"]) == 0
    assert len(body["follow_up_questions"]) == 3


def test_search_rejects_empty_query(monkeypatch, tmp_path) -> None:
    client = create_test_client(monkeypatch, tmp_path)
    response = client.post("/api/search", json={"query": ""})

    assert response.status_code == 422


def test_search_rejects_whitespace_query(monkeypatch, tmp_path) -> None:
    client = create_test_client(monkeypatch, tmp_path)
    response = client.post("/api/search", json={"query": "   "})

    assert response.status_code == 422


def test_stream_search_returns_ndjson_events(monkeypatch, tmp_path) -> None:
    client = create_test_client(monkeypatch, tmp_path)
    response = client.post(
        "/api/search/stream",
        json={"query": "best AI search app"},
    )

    assert response.status_code == 200
    lines = [line for line in response.text.splitlines() if line]
    assert '"type": "metadata"' in lines[0]
    assert '"type": "sources"' in lines[1]
    assert '"type": "chunk"' in lines[2]
    assert '"type": "done"' in lines[3]


def test_search_service_uses_gemini_when_api_key_is_configured(
    monkeypatch,
    tmp_path,
) -> None:
    class FakeSettings:
        database_path = str(tmp_path / "test.sqlite3")
        gemini_api_key = "test-key"
        tavily_api_key = "tvly-test-key"
        gemini_model = "gemini-test-model"
        tavily_max_results = 5

    async def fake_tavily_search(self, query: str) -> list[Source]:
        assert query == "best AI search app"
        return [
            Source(
                citation_number=1,
                title="Search Result",
                url="https://example.com/search-result",
                snippet="A useful search result snippet.",
            )
        ]

    def fake_generate_gemini_answer(
        self,
        query: str,
        sources: list[Source],
        history: list[ChatHistoryMessage],
    ) -> dict[str, object]:
        assert query == "best AI search app"
        assert sources[0].citation_number == 1
        assert history == []
        return {
            "answer": "Generated Gemini answer with a citation [1].",
            "follow_up_questions": [
                "What changed recently?",
                "Which tools should I compare?",
                "What should I read next?",
            ],
        }

    monkeypatch.setattr(TavilySearchService, "search", fake_tavily_search)
    monkeypatch.setattr(
        SearchService,
        "_generate_gemini_answer",
        fake_generate_gemini_answer,
    )

    service = SearchService(settings=FakeSettings())

    response = anyio.run(service.search, " best AI search app ")

    assert response.query == "best AI search app"
    assert response.conversation_id
    assert response.answer == "Generated Gemini answer with a citation [1]."
    assert response.sources[0].citation_number == 1
    assert response.sources[0].title == "Search Result"
    assert len(response.follow_up_questions) == 3


def test_tavily_service_extracts_top_search_results() -> None:
    class FakeResponse:
        def raise_for_status(self) -> None:
            return None

        def json(self) -> dict[str, object]:
            return {
                "results": [
                    {
                        "title": "First result",
                        "url": "https://example.com/first",
                        "content": "First snippet",
                    },
                    {
                        "title": "Second result",
                        "url": "https://example.com/second",
                        "content": "Second snippet",
                    },
                ]
            }

    class FakeClient:
        def __init__(self, *args, **kwargs) -> None:
            return None

        async def __aenter__(self):
            return self

        async def __aexit__(self, *args) -> None:
            return None

        async def post(self, *args, **kwargs) -> FakeResponse:
            assert kwargs["json"]["max_results"] == 5
            return FakeResponse()

    import httpx

    original_async_client = httpx.AsyncClient
    httpx.AsyncClient = FakeClient

    try:
        sources = anyio.run(
            TavilySearchService(api_key="tvly-test-key", max_results=5).search,
            "latest Gemini news",
        )
    finally:
        httpx.AsyncClient = original_async_client

    assert len(sources) == 2
    assert sources[0].citation_number == 1
    assert sources[0].title == "First result"
    assert sources[0].url == "https://example.com/first"
    assert sources[0].snippet == "First snippet"
