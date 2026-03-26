from pydantic import BaseModel

class JoinByCodeRequest(BaseModel):
    invite_code: str