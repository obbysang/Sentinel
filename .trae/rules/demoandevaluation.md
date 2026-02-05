# Demo and Evaluation — Sentinel

## Overview

This document provides a **step-by-step guide** for demonstrating Sentinel, the autonomous construction safety agent.  

The demo is designed to **showcase true agentic behavior**:

- Continuous observation of video feeds  
- Temporal reasoning and decision-making  
- Autonomous logging of safety incidents  
- Reflection and adaptive behavior  

The demo uses **pre-recorded construction site video** and optionally **live phone camera streams** to prove real-world deployment.

---

## 1. Demo Setup

### Hardware & Software Requirements

- **Computer or laptop** with Python 3.10+ and required libraries installed (`requirements.txt`)  
- **Frontend**: Node.js + React for dashboard  
- **Video Source**:
  - Pre-recorded video: `videos/construction_violation.mp4`  
  - Optional live stream: phone camera using RTSP/HTTP  
- **Internet**: Only for Gemini 3 API calls; video processing is local  

### Directory Structure

```text
sentinel/
├── backend/
├── frontend/
├── videos/
│   └── construction_violation.mp4
├── README.md
└── docs/
2. Demo Script — Pre-Recorded Video
Start the backend agent loop:

python backend/main.py --video ./videos/construction_violation.mp4
The agent begins sampling frames (2–5 FPS), generating structured perception events.

Observe memory aggregation:

Memory collects events per person over the last 8–10 seconds.

Judges can optionally inspect memory logs to confirm temporal reasoning.

Gemini 3 evaluates events:

The reasoning module receives the timeline of observations.

Outputs JSON decisions with:

incident (true/false)

severity (low/medium/high)

confidence (0–1)

reason (explanation)

Decision engine acts autonomously:

Logs incidents if incident: true and confidence > 0.8.

Writes incident record + snapshot to storage.

Frontend dashboard updates automatically:

Live feed shows bounding boxes and zones.

Incident timeline displays newly logged events with reasoning.

Demo highlight:

Worker enters restricted zone without hard hat → agent waits 5 seconds → incident logged automatically.

Severity escalates for repeated violations in the same session.

Dashboard confirms agent acted without human input.

3. Demo Script — Live Phone Camera (Optional)
Configure phone camera as RTSP/HTTP stream (e.g., rtsp://192.168.x.x:554/stream).

Start backend with live stream:

python backend/main.py --video rtsp://192.168.x.x:554/stream
Agent processes live frames in the same way as pre-recorded video.

Judges can simulate violations using props (hard hat, vest) to confirm autonomous detection and logging.

4. Key Evaluation Metrics
To demonstrate Sentinel’s agentic behavior, highlight the following:

Metric	How to Show
Autonomy	Agent logs incidents without prompts or clicks
Temporal reasoning	Violation detected only after ≥5 seconds, not on a single frame
Decision confidence	Display confidence in frontend or logs
Severity escalation	Show repeated violations increasing severity automatically
Auditability	Open incident JSON logs showing timestamp, reasoning, and snapshot
Reflection (optional)	Show adjusted thresholds after repeated false positives
5. Suggested 3-Minute Demo Flow
0:00 – 0:30: Introduce project and dashboard

0:30 – 1:30: Play pre-recorded video; agent observes workers

1:30 – 2:00: Highlight a violation → incident is logged autonomously

2:00 – 2:30: Show dashboard updates and JSON reasoning output

2:30 – 3:00: Optional live camera demo or repeated violation escalation

Tip: Do not manually trigger any incidents; let the agent act independently. Judges look for hands-off autonomy.

6. Evaluation Notes
Ensure video feed has clear visibility of PPE compliance.

Memory timelines can be logged for transparency; optional for the demo.

Confirm incident logging and snapshots are accurate and timestamped.

Avoid overcomplicating the demo; focus on autonomy, reasoning, and reflection.

7. Summary
The demo demonstrates that Sentinel:

Observes construction site activity continuously

Reasoning module (Gemini 3) interprets temporal context and rules

Logs incidents without human intervention

Adapts behavior over time for reliability and reduced false positives

Provides an auditable, transparent trail of all decisions

This structured demonstration proves that Sentinel meets the agentic standards required by AGENTIC 3.0, showcasing a true autonomous system in action.