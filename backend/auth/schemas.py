from pydantic import BaseModel, Field
from typing import Optional

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class UserBase(BaseModel):
    username: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    is_active: bool
    
    class Config:
        from_attributes = True

class GeminiKeyUpdate(BaseModel):
    gemini_api_key: str = Field(..., min_length=10, pattern=r"^[A-Za-z0-9_\-]+$")
    password: str # Required for re-authentication

class GeminiKeyRemove(BaseModel):
    password: str # Required for re-authentication

class GeminiKeyResponse(BaseModel):
    masked_key: Optional[str] = None
    
class UserLogin(BaseModel):
    username: str
    password: str
