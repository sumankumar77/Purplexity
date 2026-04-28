import json
from collections.abc import AsyncIterator

import anyio

from app.core.config import Settings, get_settings
from app.schemas.search import ChatHistoryMessage, SearchResponse, Source
from app.services.conversation_store import ConversationStore
from app.services.tavily_service import TavilySearchService

PLACEHOLDER_ANSWER = (
    "Search is not fully configured yet. Add GEMINI_API_KEY and TAVILY_API_KEY "
    "to enable sourced answers from the backend."
)

GEMINI_PROMPT_TEMPLATE = """
You are Purplexity, a concise AI search assistant.

Use the conversation history to understand the user's intent, especially when
the latest question is a follow-up. Use the search sources for factual claims.

Rules:
- Write a direct answer in 2 to 4 short paragraphs.
- Include citation markers like [1] after claims supported by sources.
- Use only citation numbers that appear in the provided sources.
- If the sources are insufficient, say what is missing.
- Generate exactly 3 follow-up questions.
- Return only JSON with this shape:
  {{"answer":"...","follow_up_questions":["...","...","..."]}}

Conversation history:
{history}

User query:
{query}

Sources:
{sources}
""".strip()

GEMINI_STREAM_PROMPT_TEMPLATE = """
You are Purplexity, a concise AI search assistant.

Use the conversation history to understand the user's intent, especially when
the latest question is a follow-up. Use the search sources for factual claims.

Rules:
- Write a direct answer in 2 to 4 short paragraphs.
- Include citation markers like [1] after claims supported by sources.
- Use only citation numbers that appear in the provided sources.
- If the sources are insufficient, say what is missing.
- Do not include follow-up questions in this streamed answer.

Conversation history:
{history}

User query:
{query}

Sources:
{sources}
""".strip()

FOLLOW_UP_PROMPT_TEMPLATE = """
Generate exactly 3 concise follow-up questions for this conversation.
Return only JSON with this shape:
{{"follow_up_questions":["...","...","..."]}}

Conversation history:
{history}

Latest assistant answer:
{answer}
""".strip()

FALLBACK_FOLLOW_UPS = [
    "Which sources should be prioritized next?",
    "Do you want a concise or detailed answer?",
]


class SearchService:
    def __init__(self, settings: Settings | None = None) -> None:
        self.settings = settings or get_settings()
        self.conversation_store = ConversationStore(self.settings.database_path)

    async def search(
        self,
        query: str,
        conversation_id: str | None = None,
    ) -> SearchResponse:
        normalized_query = query.strip()
        active_conversation_id = conversation_id or self.conversation_store.create_conversation_id()
        history = self.conversation_store.get_history(active_conversation_id)

        if not self.settings.gemini_api_key or not self.settings.tavily_api_key:
            return self.create_placeholder_response(normalized_query, active_conversation_id)

        sources = await TavilySearchService(
            api_key=self.settings.tavily_api_key,
            max_results=self.settings.tavily_max_results,
        ).search(normalized_query)
        answer = await anyio.to_thread.run_sync(
            self._generate_gemini_answer,
            normalized_query,
            sources,
            history,
        )
        self._save_turn(
            conversation_id=active_conversation_id,
            query=normalized_query,
            answer=str(answer["answer"]),
            sources=sources,
            follow_up_questions=list(answer["follow_up_questions"]),
        )

        return SearchResponse(
            conversation_id=active_conversation_id,
            query=normalized_query,
            answer=answer["answer"],
            sources=sources,
            follow_up_questions=answer["follow_up_questions"],
        )

    async def stream_search(
        self,
        query: str,
        conversation_id: str | None = None,
    ) -> AsyncIterator[dict[str, object]]:
        normalized_query = query.strip()
        active_conversation_id = conversation_id or self.conversation_store.create_conversation_id()
        history = self.conversation_store.get_history(active_conversation_id)

        if not self.settings.gemini_api_key or not self.settings.tavily_api_key:
            response = self.create_placeholder_response(
                normalized_query,
                active_conversation_id,
            )
            yield {"type": "metadata", "conversation_id": active_conversation_id}
            yield {"type": "sources", "sources": []}
            yield {"type": "chunk", "content": response.answer}
            yield {
                "type": "done",
                "follow_up_questions": response.follow_up_questions,
            }
            return

        sources = await TavilySearchService(
            api_key=self.settings.tavily_api_key,
            max_results=self.settings.tavily_max_results,
        ).search(normalized_query)
        yield {"type": "metadata", "conversation_id": active_conversation_id}
        yield {"type": "sources", "sources": [source.model_dump() for source in sources]}

        answer_parts: list[str] = []

        async for chunk in self._stream_gemini_answer(
            query=normalized_query,
            sources=sources,
            history=history,
        ):
            answer_parts.append(chunk)
            yield {"type": "chunk", "content": chunk}

        answer = "".join(answer_parts).strip()
        follow_up_questions = await anyio.to_thread.run_sync(
            self._generate_follow_up_questions,
            normalized_query,
            answer,
            [*history, ChatHistoryMessage(role="user", content=normalized_query)],
        )
        self._save_turn(
            conversation_id=active_conversation_id,
            query=normalized_query,
            answer=answer,
            sources=sources,
            follow_up_questions=follow_up_questions,
        )

        yield {"type": "done", "follow_up_questions": follow_up_questions}

    def create_placeholder_response(
        self,
        query: str,
        conversation_id: str,
    ) -> SearchResponse:
        normalized_query = query.strip()
        follow_up_questions = self._build_follow_up_questions(normalized_query)
        self._save_turn(
            conversation_id=conversation_id,
            query=normalized_query,
            answer=PLACEHOLDER_ANSWER,
            sources=[],
            follow_up_questions=follow_up_questions,
        )

        return SearchResponse(
            conversation_id=conversation_id,
            query=normalized_query,
            answer=PLACEHOLDER_ANSWER,
            sources=[],
            follow_up_questions=follow_up_questions,
        )

    def _generate_gemini_answer(
        self,
        query: str,
        sources: list[Source],
        history: list[ChatHistoryMessage],
    ) -> dict[str, object]:
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=self.settings.gemini_api_key)
        response = client.models.generate_content(
            model=self.settings.gemini_model,
            contents=GEMINI_PROMPT_TEMPLATE.format(
                query=query,
                history=self._format_history_for_prompt(history),
                sources=self._format_sources_for_prompt(sources),
            ),
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0.2,
            ),
        )

        response_text = (response.text or "").strip()

        if not response_text:
            raise RuntimeError("Gemini returned an empty response.")

        payload = json.loads(response_text)
        answer = str(payload.get("answer") or "").strip()
        follow_up_questions = [
            str(question).strip()
            for question in payload.get("follow_up_questions", [])
            if str(question).strip()
        ][:3]

        if not answer:
            raise RuntimeError("Gemini returned an empty answer.")

        return {
            "answer": answer,
            "follow_up_questions": self._normalize_follow_ups(query, follow_up_questions),
        }

    async def _stream_gemini_answer(
        self,
        query: str,
        sources: list[Source],
        history: list[ChatHistoryMessage],
    ) -> AsyncIterator[str]:
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=self.settings.gemini_api_key)
        response_stream = client.models.generate_content_stream(
            model=self.settings.gemini_model,
            contents=GEMINI_STREAM_PROMPT_TEMPLATE.format(
                query=query,
                history=self._format_history_for_prompt(history),
                sources=self._format_sources_for_prompt(sources),
            ),
            config=types.GenerateContentConfig(temperature=0.2),
        )

        for chunk in response_stream:
            if getattr(chunk, "text", None):
                yield chunk.text

    def _generate_follow_up_questions(
        self,
        query: str,
        answer: str,
        history: list[ChatHistoryMessage],
    ) -> list[str]:
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=self.settings.gemini_api_key)
        response = client.models.generate_content(
            model=self.settings.gemini_model,
            contents=FOLLOW_UP_PROMPT_TEMPLATE.format(
                history=self._format_history_for_prompt(history),
                answer=answer,
            ),
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0.4,
            ),
        )
        response_text = (response.text or "").strip()

        if not response_text:
            return self._build_follow_up_questions(query)

        payload = json.loads(response_text)
        follow_up_questions = [
            str(question).strip()
            for question in payload.get("follow_up_questions", [])
            if str(question).strip()
        ]

        return self._normalize_follow_ups(query, follow_up_questions)

    def _format_history_for_prompt(self, history: list[ChatHistoryMessage]) -> str:
        if not history:
            return "No prior conversation."

        return "\n".join(
            f"{message.role}: {message.content}" for message in history[-12:]
        )

    def _format_sources_for_prompt(self, sources: list[Source]) -> str:
        if not sources:
            return "No search sources were returned."

        return "\n\n".join(
            [
                (
                    f"[{source.citation_number}] {source.title}\n"
                    f"URL: {source.url}\n"
                    f"Snippet: {source.snippet}"
                )
                for source in sources
            ]
        )

    def _build_follow_up_questions(self, query: str) -> list[str]:
        return [
            f"What are the most important details about {query}?",
            *FALLBACK_FOLLOW_UPS,
        ]

    def _normalize_follow_ups(self, query: str, questions: list[str]) -> list[str]:
        fallback_questions = self._build_follow_up_questions(query)
        merged_questions = [*questions, *fallback_questions]

        return merged_questions[:3]

    def _save_turn(
        self,
        conversation_id: str,
        query: str,
        answer: str,
        sources: list[Source],
        follow_up_questions: list[str],
    ) -> None:
        self.conversation_store.add_message(conversation_id, "user", query)
        self.conversation_store.add_message(
            conversation_id,
            "assistant",
            answer,
            sources=sources,
            follow_up_questions=follow_up_questions,
        )


class SafeSearchService:
    async def search(
        self,
        query: str,
        conversation_id: str | None = None,
    ) -> SearchResponse:
        try:
            return await SearchService().search(query, conversation_id)
        except Exception:
            normalized_query = query.strip()
            search_service = SearchService()
            active_conversation_id = (
                conversation_id
                or search_service.conversation_store.create_conversation_id()
            )

            return SearchResponse(
                conversation_id=active_conversation_id,
                query=normalized_query,
                answer=(
                    "Gemini could not generate an answer right now. Check the "
                    "backend API key, model name, and network access."
                ),
                sources=[],
                follow_up_questions=SearchService()._build_follow_up_questions(
                    normalized_query
                ),
            )

    async def stream_search(
        self,
        query: str,
        conversation_id: str | None = None,
    ) -> AsyncIterator[dict[str, object]]:
        try:
            async for event in SearchService().stream_search(query, conversation_id):
                yield event
        except Exception:
            normalized_query = query.strip()
            search_service = SearchService()
            active_conversation_id = (
                conversation_id
                or search_service.conversation_store.create_conversation_id()
            )
            follow_up_questions = search_service._build_follow_up_questions(
                normalized_query
            )

            yield {"type": "metadata", "conversation_id": active_conversation_id}
            yield {"type": "sources", "sources": []}
            yield {
                "type": "chunk",
                "content": (
                    "Gemini could not generate an answer right now. Check the "
                    "backend API key, model name, and network access."
                ),
            }
            yield {"type": "done", "follow_up_questions": follow_up_questions}


search_service = SafeSearchService()
