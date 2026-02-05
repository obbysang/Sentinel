from sqlalchemy import Column, Integer, String, Boolean
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    # Encrypted Gemini API Key
    encrypted_gemini_api_key = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
