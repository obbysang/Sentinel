from datetime import datetime, timedelta
from typing import Optional
import os
import base64
from jose import jwt, JWTError
from passlib.context import CryptContext
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import padding
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-should-be-changed")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
# AES-256 Key (must be 32 bytes)
ENCRYPTION_KEY_HEX = os.getenv("ENCRYPTION_KEY", "")

# Ensure we have a valid key or fallback (for development only, strict in prod)
if not ENCRYPTION_KEY_HEX:
    # Generate a random 32-byte key hex string for dev if not present
    # In production, this must be set in env
    import secrets
    ENCRYPTION_KEY_HEX = secrets.token_hex(32)

try:
    ENCRYPTION_KEY = bytes.fromhex(ENCRYPTION_KEY_HEX)
except ValueError:
    # Fallback if format is wrong
    import secrets
    ENCRYPTION_KEY = secrets.token_bytes(32)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def encrypt_api_key(api_key: str) -> str:
    """
    Encrypts the API key using AES-256 (GCM mode).
    Returns format: nonce_hex|ciphertext_hex|tag_hex
    """
    if not api_key:
        return None
    
    # Generate a random 12-byte nonce
    nonce = os.urandom(12)
    
    # Construct an AES-GCM Cipher
    cipher = Cipher(algorithms.AES(ENCRYPTION_KEY), modes.GCM(nonce), backend=default_backend())
    encryptor = cipher.encryptor()
    
    # Encrypt
    ciphertext = encryptor.update(api_key.encode()) + encryptor.finalize()
    
    # Return combined string
    return f"{nonce.hex()}|{ciphertext.hex()}|{encryptor.tag.hex()}"

def decrypt_api_key(encrypted_data: str) -> str:
    """
    Decrypts the API key.
    """
    if not encrypted_data:
        return None
    
    try:
        nonce_hex, ciphertext_hex, tag_hex = encrypted_data.split("|")
        nonce = bytes.fromhex(nonce_hex)
        ciphertext = bytes.fromhex(ciphertext_hex)
        tag = bytes.fromhex(tag_hex)
        
        cipher = Cipher(algorithms.AES(ENCRYPTION_KEY), modes.GCM(nonce, tag), backend=default_backend())
        decryptor = cipher.decryptor()
        
        decrypted = decryptor.update(ciphertext) + decryptor.finalize()
        return decrypted.decode()
    except Exception as e:
        print(f"Decryption error: {e}")
        return None

def mask_api_key(api_key: str) -> str:
    if not api_key:
        return None
    if len(api_key) <= 4:
        return "****"
    return "*" * (len(api_key) - 4) + api_key[-4:]
