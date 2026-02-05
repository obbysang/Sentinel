# Sentinel Implementation Guide

## Status
The backend autonomous agent has been implemented with the following components:

1.  **Video Ingestion** (`backend/video/ingest.py`): Handles loading video files or webcam/RTSP streams.
2.  **Perception Engine** (`backend/agent/perception.py`): Uses YOLOv8 (via `ultralytics`) to detect workers and PPE (mocked logic for PPE classification in v1).
3.  **Memory Module** (`backend/agent/memory.py`): Maintains a temporal sliding window of worker states.
4.  **Reasoning Core** (`backend/agent/reasoning.py`): Integrates Google Gemini 3 (via `google-generativeai`) to analyze worker timelines for safety violations.
5.  **Decision Engine** (`backend/agent/decision.py`): deterministic logic to validate incidents.
6.  **Incident Logger** (`backend/incidents/logger.py`): Persists incidents to `data.json` and saves snapshot images.
7.  **Agent Loop** (`backend/agent/loop.py`): Orchestrates the Observe-Reason-Act loop in an async task.

## How to Run

1.  **Install Dependencies**:
    ```bash
    pip install -r backend/requirements.txt
    ```

2.  **Setup Environment**:
    Create `backend/.env` with your Gemini API key:
    ```
    GEMINI_API_KEY=your_api_key_here
    ```

3.  **Run Backend**:
    ```bash
    python backend/main.py
    ```
    - The system defaults to looking for `videos/construction_violation.mp4`.
    - If not found, it defaults to Webcam (Index 0).

4.  **Frontend**:
    The frontend expects a WebSocket connection at `ws://localhost:8000/ws`.
    Run the frontend:
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

## Logic Flow
1.  **Observe**: Every frame (~5 FPS), YOLO detects workers.
2.  **Reason**: Every 1 second, the timeline of each worker is sent to Gemini.
3.  **Act**: If Gemini detects a violation (Confidence > 0.75) that persists > 3 seconds, it is logged.
4.  **Reflect**: (Future) System stats are broadcast to the dashboard.

## Notes
- **Python 3.14 Compatibility**: Ensure PyTorch/Ultralytics supports your Python version. Python 3.10-3.12 is recommended.
- **Performance**: YOLOv8n (Nano) is used for real-time CPU performance.
