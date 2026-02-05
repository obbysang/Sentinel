from pydantic import BaseModel
from typing import Literal, List, Optional
from datetime import datetime

class Worker(BaseModel):
    id: str
    x: float
    y: float
    hasHelmet: bool
    hasVest: bool
    zone: Literal['Safe', 'Loading Dock', 'Excavation Pit']
    status: Literal['Moving', 'Stationary', 'Working']
    lastSeen: str  # ISO string for easier JSON serialization

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
