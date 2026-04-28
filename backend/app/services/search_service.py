from app.schemas.search import SearchResponse, Source

PLACEHOLDER_ANSWER = (
    "This is a placeholder response from the Phase 2 FastAPI backend. "
    "Gemini answers, Tavily web search, citations, and follow-up generation "
    "will be added in later phases."
)


class SearchService:
    def create_placeholder_response(self, query: str) -> SearchResponse:
        normalized_query = query.strip()

        return SearchResponse(
            query=normalized_query,
            answer=PLACEHOLDER_ANSWER,
            sources=[
                Source(
                    title="Purplexity Phase 2",
                    url="https://github.com/sumankumar77/Purplexity",
                    snippet="Basic backend API is running with placeholder search output.",
                )
            ],
            follow_up_questions=[
                f"What should I explore next about {normalized_query}?",
                "Which sources should be prioritized?",
                "Do you want a concise or detailed answer?",
            ],
        )


search_service = SearchService()
