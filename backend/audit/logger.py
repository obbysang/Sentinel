import os
import json
from datetime import datetime

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AUDIT_FILE = os.path.join(BASE_DIR, "audit_log.json")

class AuditLogger:
    def __init__(self):
        if not os.path.exists(AUDIT_FILE):
            with open(AUDIT_FILE, 'w') as f:
                json.dump([], f)

    def log_event(self, user_id: int, action: str, status: str, details: str = None, ip_address: str = None):
        entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "user_id": user_id,
            "action": action,
            "status": status,
            "details": details,
            "ip_address": ip_address
        }
        
        try:
            with open(AUDIT_FILE, 'r') as f:
                logs = json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            logs = []
            
        logs.append(entry)
        
        with open(AUDIT_FILE, 'w') as f:
            json.dump(logs, f, indent=2)

audit_logger = AuditLogger()
