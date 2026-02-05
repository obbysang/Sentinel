import json
import os
import cv2
import numpy as np
from typing import List
from datetime import datetime
from agent.perception import Incident

# Paths relative to backend execution (usually root of backend or project)
# Assuming backend is run from Sentinel/backend or Sentinel/
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_FILE = os.path.join(BASE_DIR, "data.json")
IMAGE_DIR = os.path.join(BASE_DIR, "images")

class IncidentLogger:
    def __init__(self):
        os.makedirs(IMAGE_DIR, exist_ok=True)
        if not os.path.exists(DATA_FILE):
            with open(DATA_FILE, 'w') as f:
                json.dump([], f)

    def log(self, incident: Incident, frame: np.array):
        # Save Image
        image_path = os.path.join(IMAGE_DIR, f"{incident.id}.jpg")
        if frame is not None:
            cv2.imwrite(image_path, frame)
        
        # Save Metadata
        incidents = self.get_all()
        # Insert at beginning
        incidents.insert(0, incident.model_dump())
        # Limit history
        incidents = incidents[:1000]
        
        with open(DATA_FILE, 'w') as f:
            json.dump(incidents, f, indent=2)
            
        print(f"Logged Incident: {incident.id} - {incident.type}")

    def get_all(self) -> List[dict]:
        if not os.path.exists(DATA_FILE):
            return []
        try:
            with open(DATA_FILE, 'r') as f:
                return json.load(f)
        except json.JSONDecodeError:
            return []

    def delete(self, incident_id: str):
        incidents = self.get_all()
        incidents = [i for i in incidents if i['id'] != incident_id]
        with open(DATA_FILE, 'w') as f:
            json.dump(incidents, f, indent=2)

    def resolve(self, incident_id: str):
        incidents = self.get_all()
        for i in incidents:
            if i['id'] == incident_id:
                i['acknowledged'] = True
                break
        with open(DATA_FILE, 'w') as f:
            json.dump(incidents, f, indent=2)

    def add_note(self, incident_id: str, note: str):
        incidents = self.get_all()
        for i in incidents:
            if i['id'] == incident_id:
                if 'notes' not in i:
                    i['notes'] = []
                i['notes'].append({
                    "timestamp": datetime.now().isoformat(),
                    "content": note
                })
                break
        with open(DATA_FILE, 'w') as f:
            json.dump(incidents, f, indent=2)
