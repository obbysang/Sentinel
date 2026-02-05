import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from api.server import app
from auth.database import Base, get_db
from auth import routes as auth_routes # Import routes to reset rate limit
import os

# Setup Test Database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

# Create tables
Base.metadata.create_all(bind=engine)

client = TestClient(app)

def test_register_and_login():
    # Clean up
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    auth_routes.key_update_attempts = {} # Reset rate limits

    # Register
    response = client.post("/register", json={"username": "testuser", "password": "testpassword"})
    assert response.status_code == 200
    assert response.json()["username"] == "testuser"

    # Login
    response = client.post("/token", data={"username": "testuser", "password": "testpassword"})
    assert response.status_code == 200
    assert "access_token" in response.json()
    return response.json()["access_token"]

def test_gemini_key_lifecycle():
    token = test_register_and_login()
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Add Key (Update)
    response = client.put(
        "/users/me/gemini-key",
        json={"gemini_api_key": "AIzaSyD-1234567890abcdef", "password": "testpassword"},
        headers=headers
    )
    assert response.status_code == 200
    assert response.json()["masked_key"] == "********************cdef"

    # 2. Get Key (Masked)
    response = client.get("/users/me/gemini-key", headers=headers)
    assert response.status_code == 200
    assert response.json()["masked_key"] == "********************cdef"

    # 3. Update Key with WRONG password
    response = client.put(
        "/users/me/gemini-key",
        json={"gemini_api_key": "AIzaSyD-NEWKEY123456", "password": "wrongpassword"},
        headers=headers
    )
    assert response.status_code == 401

    # 4. Remove Key
    # TestClient.delete might not support json directly in some versions, use request
    response = client.request("DELETE", "/users/me/gemini-key", json={"password": "testpassword"}, headers=headers)
    assert response.status_code == 200
    assert response.json()["masked_key"] is None

def test_rate_limiting():
    token = test_register_and_login() # Resets DB and Rate Limits
    headers = {"Authorization": f"Bearer {token}"}

    # Hit 5 times (allowed)
    for i in range(5):
        response = client.put(
            "/users/me/gemini-key",
            json={"gemini_api_key": "AIzaSyD-TESTKEY", "password": "testpassword"},
            headers=headers
        )
        if response.status_code == 429:
            pytest.fail(f"Rate limit triggered too early at attempt {i+1}")
    
    # 6th time (blocked)
    response = client.put(
        "/users/me/gemini-key",
        json={"gemini_api_key": "AIzaSyD-TESTKEY", "password": "testpassword"},
        headers=headers
    )
    assert response.status_code == 429

def test_sql_injection_attempt():
    # Try to login with SQL injection without registering
    # Using ' OR '1'='1 as username
    response = client.post("/token", data={"username": "admin' OR '1'='1", "password": "anything"})
    assert response.status_code == 401

def test_unauthorized_access():
    response = client.get("/users/me/gemini-key")
    assert response.status_code == 401
