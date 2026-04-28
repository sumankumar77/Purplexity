import json

from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from app.core.config import get_settings
from app.schemas.search import (
    ConversationDetail,
    ConversationSummary,
    SearchRequest,
    SearchResponse,
)
from app.services.conversation_store import ConversationStore
from app.services.search_service import search_service

router = APIRouter(tags=["search"])


def get_conversation_store() -> ConversationStore:
    return ConversationStore(get_settings().database_path)


@router.post("/search", response_model=SearchResponse)
async def search(request: SearchRequest) -> SearchResponse:
    return await search_service.search(request.query, request.conversation_id)


@router.post("/search/stream")
async def stream_search(request: SearchRequest) -> StreamingResponse:
    async def event_stream():
        async for event in search_service.stream_search(
            request.query,
            request.conversation_id,
        ):
            yield f"{json.dumps(event)}\n"

    return StreamingResponse(
        event_stream(),
        media_type="application/x-ndjson",
    )


@router.get("/conversations", response_model=list[ConversationSummary])
async def list_conversations() -> list[ConversationSummary]:
    return get_conversation_store().list_conversations()


@router.get("/conversations/{conversation_id}", response_model=ConversationDetail)
async def get_conversation(conversation_id: str) -> ConversationDetail:
    return ConversationDetail(
        conversation_id=conversation_id,
        messages=get_conversation_store().get_conversation_messages(conversation_id),
    )
