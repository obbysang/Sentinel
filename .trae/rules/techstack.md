# Technology Stack — Sentinel

## Overview

Sentinel is designed as a **production-ready, autonomous construction safety agent**, combining modern frontend and backend frameworks, deterministic perception models, and advanced reasoning with Gemini 3.  

All technology choices are **intentional**, focused on:

- **Autonomy**: allowing the agent to act without human intervention  
- **Scalability**: enabling multiple video streams and sites  
- **Reliability**: producing auditable, deterministic outputs  
- **Extensibility**: easy to add new rules, sensors, or agent modules

---

## 1. Frontend — TypeScript + React

**Folder:** `frontend/`  

### Why TypeScript + React

- **Type Safety**: Reduces runtime bugs and ensures correct handling of API responses (critical for safety-critical applications).  
- **Component Architecture**: Facilitates modular and maintainable UI (Live Feed, Incident Timeline, Incident Detail).  
- **Developer Ecosystem**: Fast development with mature libraries for charts, overlays, and video rendering.  
- **Future Extensibility**: Can scale to multiple dashboards or integrate AR/VR overlays.

### Key Features in Sentinel

- **Live video display**: Shows bounding boxes, zones, and annotations from perception module.  
- **Incident dashboard**: Lists logged incidents with severity, confidence, and snapshots.  
- **Observation-only design**: Frontend does not trigger decisions, preserving agent autonomy.

---

## 2. Backend — Python

**Folder:** `backend/`  

### Why Python

- **Mature AI/ML Ecosystem**: Libraries like OpenCV, PyTorch, TensorFlow, and HuggingFace for perception and processing.  
- **Rapid Prototyping**: Enables fast integration of AI models and reasoning modules.  
- **Async & Modular Design**: Python’s async frameworks (FastAPI, asyncio) allow real-time video processing and API responses.  
- **Cross-Platform**: Can run on local machines, servers, or edge devices with minimal setup.

### Key Responsibilities

- Video ingestion & frame sampling (`video/`)  
- Perception & event generation (`agent/perception.py`)  
- Memory & temporal aggregation (`agent/memory.py`)  
- Gemini 3 reasoning wrapper (`agent/reasoning.py`)  
- Decision engine & logging (`agent/decision.py`, `incidents/logger.py`)  
- Optional API server for frontend (`api/server.py`)  

---

## 3. Video Processing & Perception

**Technologies:** OpenCV, YOLOv8, MediaPipe (optional)  

### Role

- Detect humans and PPE (hard hats, safety vests) in video frames  
- Identify restricted zones and track person location  
- Generate **structured events** for reasoning (no free-text AI here)

### Why Deterministic Perception First

- Reduces **hallucinations** in reasoning  
- Provides a reproducible audit trail  
- Keeps Gemini 3 focused on **judgment**, not detection

---

## 4. Reasoning & Agent Intelligence — Gemini 3

**Folder:** `agent/reasoning.py`  

### Role

- Acts as the **context-aware safety officer**  
- Evaluates temporal event timelines  
- Outputs **strict JSON decisions**: incident, severity, confidence, reason, recommended action  

### Why Gemini 3

- **Superior inference**: Handles temporal reasoning over multiple events  
- **Massive context window**: Can consider multiple frames and repeated violations  
- **Multimodality-ready**: Can integrate video, audio, and logs in future extensions  
- **Ultra-low latency**: Enables near-real-time decision making  

---

## 5. Storage & Incident Logging

**Technologies:** JSON, SQLite (lightweight), optional cloud storage  

### Role

- Persist incidents for auditing  
- Store snapshots of frames along with reasoning output  
- Provide backend API for dashboard access

### Design Principles

- **Auditability**: Each logged incident includes timestamp, Gemini reasoning output, confidence, and snapshot  
- **Simplicity**: Local storage sufficient for demo, extensible to cloud for enterprise  

---

## 6. API Layer

**Folder:** `api/server.py`  
**Technologies:** FastAPI or Flask (Python)  

### Role

- Serve structured incidents to frontend dashboard  
- Optionally provide WebSocket stream for live updates  

**Design Note:** Frontend is **read-only**, preserving full agent autonomy.  

---

## 7. Development & Deployment Tools

- **Git + GitHub**: Version control and public repository for hackathon submission  
- **Docker (optional)**: Containerized deployment for consistent environment across machines  
- **Python Virtual Environment**: Isolated dependencies, reproducibility  
- **TypeScript tooling**: Linting, type-checking, and fast frontend iteration  

---

## 8. Security & Privacy Considerations

- No facial recognition or PII stored  
- Local video processing preferred for sensitive sites  
- Access-controlled frontend API  
- Audit trail ensures accountability and transparency  

---

## 9. Rationale Summary

| Layer / Module | Chosen Technology | Why |
|----------------|-----------------|-----|
| Frontend | TypeScript + React | Type-safe, modular, scalable UI for live monitoring |
| Backend | Python | Rich AI ecosystem, rapid prototyping, async support |
| Vision | OpenCV + YOLO | Deterministic, structured perception for safety compliance |
| Reasoning | Gemini 3 | Temporal reasoning, multimodality, low-latency, agentic judgment |
| Storage | JSON / SQLite | Lightweight, auditable, portable |
| API | FastAPI | Lightweight backend for dashboard and extensibility |

Every technology is chosen to **maximize autonomy, transparency, and scalability**, aligning Sentinel with AGENTIC 3.0’s vision of a true autonomous agent.

---
