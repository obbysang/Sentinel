from pydantic import BaseModel
from typing import Literal, List, Optional, Dict
from datetime import datetime
from ultralytics import YOLO
import cv2
import numpy as np

# --- Data Models ---

class Worker(BaseModel):
    id: str
    x: float  # Normalized 0-100
    y: float  # Normalized 0-100
    hasHelmet: bool
    hasVest: bool
    zone: Literal['Safe', 'Loading Dock', 'Excavation Pit']
    status: Literal['Moving', 'Stationary', 'Working']
    lastSeen: str
    confidence: float

class Incident(BaseModel):
    id: str
    timestamp: str
    workerId: str
    type: Literal['PPE Violation', 'Zone Intrusion', 'Unsafe Posture']
    severity: Literal['Low', 'Medium', 'High']
    confidence: float
    details: str
    acknowledged: bool

class TimelineEvent(BaseModel):
    id: str
    workerId: str
    timestamp: str
    type: Literal['Zone Change', 'Status Change', 'Violation']
    description: str

class SystemState(BaseModel):
    workers: List[Worker]
    incidents: List[Incident]
    timeline: List[TimelineEvent]
    stats: dict

# --- Perception Engine ---

class PerceptionEngine:
    def __init__(self, model_path: str = 'yolov8n.pt'):
        self.model = YOLO(model_path)
        # Class mapping for COCO: 0 is person
        self.target_classes = [0] 

    def detect(self, frame) -> List[Worker]:
        # Run tracking (persist=True enables ID tracking across frames)
        results = self.model.track(frame, persist=True, classes=self.target_classes, verbose=False)
        
        workers = []
        height, width, _ = frame.shape
        timestamp = datetime.now().isoformat()
        
        if not results:
            return []
            
        r = results[0]
        if not r.boxes:
            return []
            
        for box in r.boxes:
            # Get ID (if tracking is working, id is present)
            track_id = int(box.id.item()) if box.id is not None else -1
            if track_id == -1:
                continue # Skip untracked
                
            # Get coordinates
            x1, y1, x2, y2 = box.xyxy[0].tolist()
            w, h = x2 - x1, y2 - y1
            cx = x1 + w / 2
            cy = y2 # Use feet position for zone detection
            
            # Normalize to 0-100 for frontend
            norm_x = (cx / width) * 100
            norm_y = (cy / height) * 100
            
            # Determine Zone
            zone = self._determine_zone(norm_x, norm_y)
            
            # PPE Detection (Mocked for Phase 1/2 - to be replaced with 2nd stage classifier)
            # For demo: randomly assign or assume compliant unless in specific debug mode
            # We'll default to compliant for now.
            has_helmet = True
            has_vest = True
            
            # Create Worker Object
            worker = Worker(
                id=f"p_{track_id}",
                x=norm_x,
                y=norm_y,
                hasHelmet=has_helmet,
                hasVest=has_vest,
                zone=zone,
                status="Moving", # Simple placeholder
                lastSeen=timestamp,
                confidence=float(box.conf[0].item())
            )
            workers.append(worker)
            
        return workers

    def _determine_zone(self, x: float, y: float) -> str:
        # Simple hardcoded zones based on 0-100 grid
        # Safe: Default
        # Loading Dock: Right side
        # Excavation Pit: Bottom Left
        if x > 60 and y < 50:
            return 'Loading Dock'
        if x < 45 and y > 50:
            return 'Excavation Pit'
        return 'Safe'
