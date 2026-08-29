from pydantic import BaseModel, EmailStr
from typing import Optional

class AuthRequest(BaseModel):
    email: EmailStr
    password: str

class AuthResponse(BaseModel):
    access_token: Optional[str] = None
    user_id: Optional[str] = None
    message: str

class OAuthResponse(BaseModel):
    url: str
    provider: str
