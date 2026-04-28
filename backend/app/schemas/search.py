from typing import Literal

from pydantic import BaseModel, Field, field_validator


class SearchRequest(BaseModel):
    conversation_id: str | None = None
    query: str = Field(..., min_length=1, max_length=500)

    @field_validator("query")
    @classmethod
    def normalize_query(cls, value: str) -> str:
        normalized_query = value.strip()

        if not normalized_query:
            raise ValueError("Query must not be empty.")

        return normalized_query


class Source(BaseModel):
    citation_number: int
    title: str
    url: str
    snippet: str


class SearchResponse(BaseModel):
    conversation_id: str
    query: str
    answer: str
    sources: list[Source]
    follow_up_questions: list[str]


class ChatHistoryMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ConversationMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str
    sources: list[Source] = []
    follow_up_questions: list[str] = []


class ConversationSummary(BaseModel):
    conversation_id: str
    title: str


class ConversationDetail(BaseModel):
    conversation_id: str
    messages: list[ConversationMessage]
