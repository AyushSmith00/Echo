from pydantic import BaseModel

class UserInfo(BaseModel):
    id: int
    username: str
    email: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserInfo

class RefreshRequest(BaseModel):
    refresh_token: str


