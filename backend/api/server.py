from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from pydantic import BaseModel
import json
import shutil
import os
import uuid

app = FastAPI(title="Sentinel API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        json_str = json.dumps(message)
        for connection in self.active_connections:
            try:
                await connection.send_text(json_str)
            except Exception:
                pass

manager = ConnectionManager()

# --- Dependency Injection for Agent Runner (Initialized in main.py) ---
agent_runner = None 

def set_agent_runner(runner):
    global agent_runner
    agent_runner = runner

# --- Models ---

class Camera(BaseModel):
    id: str
    name: str
    source: str # URL or Index
    type: str # 'rtsp', 'http', 'usb', 'file'

class NoteRequest(BaseModel):
    note: str

# --- In-Memory Storage ---
CAMERAS: List[Camera] = [
    Camera(id="cam_1", name="Site Camera 1", source="0", type="usb")
]
ACTIVE_CAMERA_ID = "cam_1"

# --- Endpoints ---

@app.get("/health")
async def health_check():
    return {"status": "ok", "system": "Sentinel Autonomous Agent"}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# Camera Management
@app.get("/cameras", response_model=List[Camera])
async def get_cameras():
    return CAMERAS

@app.post("/cameras", response_model=Camera)
async def add_camera(camera: Camera):
    CAMERAS.append(camera)
    return camera

@app.post("/cameras/{camera_id}/select")
async def select_camera(camera_id: str):
    global ACTIVE_CAMERA_ID
    camera = next((c for c in CAMERAS if c.id == camera_id), None)
    if not camera:
        raise HTTPException(status_code=404, detail="Camera not found")
    
    ACTIVE_CAMERA_ID = camera_id
    if agent_runner:
        await agent_runner.start(camera.source)
    
    return {"status": "success", "active_camera": camera}

# Video Upload
@app.post("/upload-video")
async def upload_video(file: UploadFile = File(...)):
    # Save file
    video_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "videos", "uploads")
    os.makedirs(video_dir, exist_ok=True)
    
    file_path = os.path.join(video_dir, f"{uuid.uuid4()}_{file.filename}")
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Create a 'camera' entry for this video
    camera_id = f"vid_{uuid.uuid4().hex[:8]}"
    camera = Camera(id=camera_id, name=f"Upload: {file.filename}", source=file_path, type="file")
    CAMERAS.append(camera)
    
    return camera

# Analysis Control
@app.post("/analysis/start")
async def start_analysis():
    if agent_runner:
        # Find active camera source
        camera = next((c for c in CAMERAS if c.id == ACTIVE_CAMERA_ID), None)
        if camera:
            await agent_runner.start(camera.source)
            return {"status": "started"}
    raise HTTPException(status_code=500, detail="Agent runner not initialized")

@app.post("/analysis/stop")
async def stop_analysis():
    if agent_runner:
        await agent_runner.stop()
        return {"status": "stopped"}
    raise HTTPException(status_code=500, detail="Agent runner not initialized")

# Incident Management
# Note: We need to import IncidentLogger to access data. 
# Ideally, IncidentLogger should be a singleton or passed around.
# For now, we instantiate it here as it uses file storage.
from incidents.logger import IncidentLogger
logger = IncidentLogger()

@app.get("/incidents")
async def get_incidents():
    return logger.get_all()

@app.delete("/incidents/{incident_id}")
async def delete_incident(incident_id: str):
    logger.delete(incident_id)
    return {"status": "deleted"}

@app.post("/incidents/{incident_id}/resolve")
async def resolve_incident(incident_id: str):
    logger.resolve(incident_id)
    return {"status": "resolved"}

@app.post("/incidents/{incident_id}/notes")
async def add_incident_note(incident_id: str, req: NoteRequest):
    logger.add_note(incident_id, req.note)
    return {"status": "note added"}
