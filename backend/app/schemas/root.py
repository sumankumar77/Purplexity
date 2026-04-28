from pydantic import BaseModel


class RootResponse(BaseModel):
    service: str
    status: str
    docs: str
