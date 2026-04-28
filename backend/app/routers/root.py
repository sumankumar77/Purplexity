from fastapi import APIRouter

from app.constants import SERVICE_NAME
from app.schemas.root import RootResponse

router = APIRouter(tags=["root"])


@router.get("/", response_model=RootResponse)
async def root() -> RootResponse:
    return RootResponse(
        service=SERVICE_NAME,
        status="ok",
        docs="/docs",
    )
