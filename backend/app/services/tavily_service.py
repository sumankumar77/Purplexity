from typing import Any

import httpx

from app.schemas.search import Source

TAVILY_SEARCH_URL = "https://api.tavily.com/search"
SNIPPET_MAX_LENGTH = 500


class TavilySearchService:
    def __init__(self, api_key: str | None, max_results: int = 5) -> None:
        self.api_key = api_key
        self.max_results = max_results

    async def search(self, query: str) -> list[Source]:
        if not self.api_key:
            return []

        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.post(
                TAVILY_SEARCH_URL,
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "query": query,
                    "search_depth": "basic",
                    "max_results": self.max_results,
                    "include_answer": False,
                    "include_raw_content": False,
                    "include_images": False,
                    "include_favicon": False,
                },
            )
            response.raise_for_status()

        payload = response.json()
        results = payload.get("results", [])

        return [
            self._source_from_result(index=index, result=result)
            for index, result in enumerate(results[: self.max_results], start=1)
            if result.get("title") and result.get("url")
        ]

    def _source_from_result(self, index: int, result: dict[str, Any]) -> Source:
        snippet = str(result.get("content") or "").strip()

        if len(snippet) > SNIPPET_MAX_LENGTH:
            snippet = f"{snippet[:SNIPPET_MAX_LENGTH].rstrip()}..."

        return Source(
            citation_number=index,
            title=str(result["title"]).strip(),
            url=str(result["url"]).strip(),
            snippet=snippet,
        )
