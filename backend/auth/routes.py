from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Dict, List

from . import database, models, schemas, security, dependencies
from audit.logger import audit_logger

router = APIRouter(tags=["Authentication"])

# In-memory rate limiting: user_id -> list of timestamps
key_update_attempts: Dict[int, List[datetime]] = {}

def check_rate_limit(user_id: int):
    now = datetime.utcnow()
    # Clean up old attempts
    if user_id in key_update_attempts:
        key_update_attempts[user_id] = [t for t in key_update_attempts[user_id] if t > now - timedelta(hours=1)]
    
    attempts = key_update_attempts.get(user_id, [])
    if len(attempts) >= 5:
        audit_logger.log_event(user_id, "RATE_LIMIT_EXCEEDED", "FAILURE", "Max key update attempts reached")
        raise HTTPException(status_code=429, detail="Too many attempts. Please try again later.")
    
    attempts.append(now)
    key_update_attempts[user_id] = attempts

@router.post("/register", response_model=schemas.User)
def register(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    hashed_password = security.get_password_hash(user.password)
    new_user = models.User(username=user.username, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    audit_logger.log_event(new_user.id, "USER_REGISTER", "SUCCESS")
    return new_user

@router.post("/token", response_model=schemas.Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.username == form_data.username).first()
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        # Log failed login attempt? Maybe too noisy, but good for security.
        # audit_logger.log_event(0, "LOGIN_FAILED", "FAILURE", f"Username: {form_data.username}") 
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=security.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    audit_logger.log_event(user.id, "USER_LOGIN", "SUCCESS")
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/users/me", response_model=schemas.User)
def read_users_me(current_user: models.User = Depends(dependencies.get_current_active_user)):
    return current_user

@router.get("/users/me/gemini-key", response_model=schemas.GeminiKeyResponse)
def get_gemini_key(current_user: models.User = Depends(dependencies.get_current_active_user)):
    # Only return masked key
    if current_user.encrypted_gemini_api_key:
        try:
            decrypted = security.decrypt_api_key(current_user.encrypted_gemini_api_key)
            masked = security.mask_api_key(decrypted)
            return {"masked_key": masked}
        except Exception:
             return {"masked_key": "Error decrypting key"}
    return {"masked_key": None}

@router.put("/users/me/gemini-key", response_model=schemas.GeminiKeyResponse)
def update_gemini_key(
    key_update: schemas.GeminiKeyUpdate,
    request: Request,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(dependencies.get_current_active_user)
):
    # Rate Limiting
    check_rate_limit(current_user.id)
    
    # Re-authentication
    if not security.verify_password(key_update.password, current_user.hashed_password):
        audit_logger.log_event(current_user.id, "KEY_UPDATE_FAILED", "FAILURE", "Incorrect password", request.client.host)
        raise HTTPException(status_code=401, detail="Incorrect password")
        
    # Encrypt and Save
    encrypted = security.encrypt_api_key(key_update.gemini_api_key)
    current_user.encrypted_gemini_api_key = encrypted
    db.commit()
    
    audit_logger.log_event(current_user.id, "KEY_UPDATE", "SUCCESS", "Gemini API Key updated", request.client.host)
    
    masked = security.mask_api_key(key_update.gemini_api_key)
    return {"masked_key": masked}

@router.delete("/users/me/gemini-key", response_model=schemas.GeminiKeyResponse)
def remove_gemini_key(
    key_remove: schemas.GeminiKeyRemove,
    request: Request,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(dependencies.get_current_active_user)
):
    check_rate_limit(current_user.id)
    
    if not security.verify_password(key_remove.password, current_user.hashed_password):
        audit_logger.log_event(current_user.id, "KEY_REMOVE_FAILED", "FAILURE", "Incorrect password", request.client.host)
        raise HTTPException(status_code=401, detail="Incorrect password")
        
    current_user.encrypted_gemini_api_key = None
    db.commit()
    
    audit_logger.log_event(current_user.id, "KEY_REMOVE", "SUCCESS", "Gemini API Key removed", request.client.host)
    
    return {"masked_key": None}
