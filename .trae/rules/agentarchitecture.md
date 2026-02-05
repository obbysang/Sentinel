
# Agent Architecture — Sentinel

## Overview

Sentinel is an **autonomous construction safety agent** designed to monitor video feeds, reason about safety violations, and autonomously log incidents.  

Unlike traditional monitoring tools, Sentinel is structured as a **true agent**, capable of observing its environment, reasoning over time, acting independently, and reflecting on outcomes. This document details the architecture, module responsibilities, data flows, and integration of AI components (Gemini 3) in a production-ready system.

---

## High-Level Architecture

Sentinel follows a **modular, agentic architecture**:

```

```
       Video Feed (File or RTSP)
                  │
                  ▼
            Frame Sampler
                  │
                  ▼
         Perception Module (Vision)
                  │
                  ▼
         Event Memory / Timeline
                  │
                  ▼
      Gemini 3 Reasoning Core
                  │
                  ▼
         Decision Engine
                  │
                  ▼
        Incident Logger / Storage
                  │
                  ▼
        Frontend Dashboard (Observer)
```

````

**Key Principles:**
- **Separation of concerns**: perception, reasoning, decision, logging are separate.
- **Agent loop**: Observe → Reason → Act → Reflect.
- **Autonomy**: decisions are made without human intervention.
- **Auditability**: all actions are logged with reasoning and evidence.

---

## Module Descriptions

### 1. Video Ingestion & Frame Sampling (`video/ingest.py`, `video/sampler.py`)
**Responsibilities:**
- Accept pre-recorded video files or live IP camera streams.
- Sample frames at a configurable FPS to balance accuracy and computational cost.
- Convert frames into structured timestamps for downstream modules.

**Rationale:**
- Decouples raw video from perception.
- Allows flexible deployment (file-based demos or live site monitoring).

---

### 2. Perception Module (`agent/perception.py`)
**Responsibilities:**
- Detect persons, PPE (hard hats, safety vests), and zones in each frame.
- Output **structured, deterministic events**, e.g.:

```json
{
  "timestamp": "2026-02-05T12:03:14Z",
  "frame_id": 183,
  "person_id": "p_3",
  "zone": "restricted",
  "ppe": {"hard_hat": false, "safety_vest": true},
  "motion": "moving",
  "confidence": 0.92
}
````

**Key Points:**

* **No reasoning** occurs here—perception is purely factual.
* Perception feeds the **memory module** for temporal aggregation.
* Can be implemented using YOLOv8, OpenCV, or equivalent vision models.

---

### 3. Memory Module (`agent/memory.py`)

**Responsibilities:**

* Maintain **short-term temporal memory** of all observations per person.
* Aggregate events over a configurable time window (e.g., last 8–10 seconds).
* Provide structured input for reasoning:

```json
{
  "person_id": "p_3",
  "zone": "restricted",
  "timeline": [
    {"t": -8, "hard_hat": false, "vest": true},
    {"t": -4, "hard_hat": false, "vest": true}
  ]
}
```

**Rationale:**

* Enables **temporal reasoning** (e.g., ignore brief violations <5 seconds).
* Prevents noisy single-frame false positives.
* Supports repeat-violation escalation logic.

---

### 4. Gemini 3 Reasoning Core (`agent/reasoning.py`)

**Responsibilities:**

* Receive structured event timelines from memory.
* Apply **explicit safety rules** in context:

  * Hard hat required in restricted zones
  * Safety vest required
  * Repeated violations escalate severity
* Output validated JSON decisions:

```json
{
  "incident": true,
  "severity": "medium",
  "reason": "Person in restricted zone without hard hat for over 5 seconds",
  "confidence": 0.87,
  "recommended_action": "log_incident"
}
```

**Key Design Principles:**

* **Strict separation from perception**: Gemini never sees raw pixels.
* **JSON contract** ensures deterministic, auditable outputs.
* **Large context window** allows multi-frame reasoning, correlation of repeated violations, and adaptive judgment.

---

### 5. Decision Engine (`agent/decision.py`)

**Responsibilities:**

* Apply thresholds to Gemini decisions (confidence, severity) to determine action.
* Trigger autonomous logging of incidents when thresholds are met.
* Optionally escalate critical incidents based on policy.

**Autonomy Guarantee:**

* No human input is required for logging.
* Actions are fully autonomous and consistent with agent design principles.

---

### 6. Incident Logger & Storage (`incidents/logger.py`, `incidents/storage.py`)

**Responsibilities:**

* Persist all incident data for auditing:

  * Timestamp, person ID, severity, confidence
  * Snapshot frames from video
  * Gemini reasoning output
* Optionally store in a file-based JSON store or SQLite database.

**Rationale:**

* Provides **audit trail** for safety managers.
* Demonstrates transparency and accountability, key for AGENTIC judges.

---

### 7. Frontend Dashboard (`frontend/`)

**Responsibilities:**

* Observe incidents in real-time.
* Display video feeds with bounding boxes and zones.
* Show incident timeline and reasoning details.

**Design Note:**

* The frontend is **observer-only**; it does not trigger decisions or actions.
* Confirms agent autonomy.

---

## Agent Loop & Autonomy

Sentinel’s agent loop can be expressed as:

```python
while True:
    events = perception.observe()
    memory.add_events(events)
    
    if memory.should_reason():
        decision = reasoning.evaluate(memory.get_recent_events())
        if decision.incident and decision.confidence > threshold:
            decision_engine.act(decision)
    
    reflection.update(decision)
```

**Highlights:**

* Continuous operation
* Temporal aggregation for robust reasoning
* Fully autonomous logging
* Reflection enables **self-tuning sensitivity**

---

## Data Flow Summary

| Source                   | Module             | Output                          |
| ------------------------ | ------------------ | ------------------------------- |
| Video File / RTSP Stream | Frame Sampler      | Frames w/ timestamps            |
| Frames                   | Perception         | Structured events per person    |
| Events                   | Memory             | Aggregated timelines per person |
| Timelines                | Gemini 3 Reasoning | JSON safety decision            |
| Decision                 | Decision Engine    | Trigger incident logging        |
| Incident                 | Logger & Storage   | Persisted incident record       |
| Incident Record          | Frontend           | Observational dashboard         |

This separation of **observation, reasoning, action, and reflection** ensures Sentinel qualifies as a **true autonomous agent**.

---

## Reflection Module (`agent/reflection.py`)

**Responsibilities:**

* Track false positives and repeated incidents
* Adjust internal thresholds or confidence cutoffs
* Improve future decisions without manual tuning

**Importance:**

* Makes Sentinel *adaptive*, not static
* Demonstrates **meta-level agentic reasoning**

---

## Extensibility

The architecture allows:

* Addition of new safety rules (chemical PPE, proximity hazards)
* Integration of multiple camera streams across sites
* Predictive analytics for high-risk zones
* Autonomous coordination with other agents (future multi-agent setups)

---

## Summary

Sentinel’s architecture embodies **the principles of agentic systems**:

* **Observation** via structured perception
* **Reasoning** with Gemini 3 for contextual understanding
* **Action** through autonomous logging
* **Reflection** for self-improvement

This clear separation of responsibilities, modularity, and agent loop ensures **judges recognize this system as an agent**, not a simple monitoring pipeline.

It is production-grade, auditable, and ready for real-world testing and hackathon demonstration.

---

```

---

If you want, next I can write **`03_tech_stack.md`**, fully justified for judges — covering **why TypeScript frontend, Python backend, YOLO/OpenCV, Gemini 3**, and even security/latency choices — in production-grade detail.  

Do you want me to do that next?
```
