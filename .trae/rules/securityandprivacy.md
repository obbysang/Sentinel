# Security and Privacy — Sentinel

## Overview

Sentinel is designed to operate **autonomously** in construction environments while **ensuring security, privacy, and auditability**.  
While its core function is to detect safety violations, Sentinel strictly limits sensitive data usage, protects privacy, and maintains a clear audit trail for every action.

This document outlines the security design, privacy measures, and best practices integrated into the system.

---

## 1. Privacy Principles

1. **No personally identifiable information (PII) is collected**  
   - Sentinel does not store faces, names, phone numbers, or IDs.  
   - All person identifiers are **anonymous internal IDs** (`p_1`, `p_2`, etc.).  

2. **Video processing is local by default**  
   - Raw video frames are processed **in memory** and only **snapshots of incidents** are stored.  
   - No video is sent to external servers unless explicitly configured for cloud-based auditing.  

3. **Minimal retention of sensitive data**  
   - Incident snapshots include only what is required to verify a violation (person + PPE + zone).  
   - Retention policies are configurable; default is **30 days** for temporary storage.

---

## 2. Security Architecture

### Data Flow Security

| Component | Data Type | Security Measures |
|-----------|-----------|-----------------|
| Video ingestion | Frames from file/IP stream | Encrypted RTSP/HTTPS recommended for live streams |
| Perception module | Structured events | No raw images stored beyond transient processing |
| Memory module | Event timelines | In-memory only; ephemeral unless incident logged |
| Reasoning module (Gemini 3) | JSON context | Strict API input validation; no raw pixel data sent |
| Incident logger/storage | Incident records | Stored as JSON + snapshots; filesystem or encrypted DB |
| Frontend dashboard | Incident display | HTTPS; read-only, observer-only access |

### API Security

- All endpoints use **HTTPS**  
- Access control enforced via API tokens or session-based authentication  
- Frontend is **observer-only**: cannot trigger decisions, modify thresholds, or access raw video

---

## 3. Threat Mitigation

| Threat | Mitigation |
|--------|------------|
| Unauthorized access to live video | Password-protected RTSP/HTTP streams, firewall restrictions |
| Accidental exposure of PII | No facial recognition, only anonymous IDs |
| Malicious data injection | Input validation in memory and reasoning modules; schema enforcement |
| Data corruption / loss | Redundant incident storage; snapshot + JSON logs |
| Reasoning errors or hallucinations | Gemini outputs strict JSON; confidence thresholds prevent false logging |

---

## 4. Auditability

Sentinel maintains **full transparency** of its autonomous decisions:

- Every incident includes:
  - Timestamp  
  - Anonymous person ID  
  - Zone and PPE status  
  - Gemini reasoning output (reason, confidence, severity)  
  - Snapshot frame (optional)

- Incident logs are **immutable** once written (append-only JSON or SQLite).  
- Reflection and threshold adjustments are **versioned and logged** for review.  

This allows **post-factum analysis** of agent decisions, satisfying enterprise compliance and regulatory expectations.

---

## 5. Deployment Best Practices

- **Local processing first**: Run Sentinel on-site or on edge devices to minimize sensitive data transfer.  
- **Secure connections**: Use HTTPS or VPN for frontend dashboards or cloud-based storage.  
- **Access control**: Only authorized personnel can view dashboards; no write permissions on incidents.  
- **Backup policies**: Regularly backup incident logs and snapshots to secure storage.  
- **Update management**: Keep all AI models and dependencies up to date to prevent vulnerabilities.

---

## 6. Privacy by Design in AI

- **Perception is deterministic**: No model-generated content (hallucinations) is stored.  
- **Reasoning is structured**: Gemini 3 receives **only structured JSON**, not raw video.  
- **Decision transparency**: Every autonomous action is accompanied by **reasoning output**, confidence score, and severity.  
- **Optional anonymization layer**: Additional obfuscation can remove faces or identifying marks in stored snapshots.

---

## 7. Summary

Sentinel demonstrates **enterprise-grade security and privacy practices** while maintaining full autonomy:

- Anonymous identifiers ensure **privacy**  
- Local and encrypted processing ensures **data security**  
- Immutable incident logging ensures **auditability**  
- Structured AI reasoning ensures **predictable and auditable decisions**  

By integrating security and privacy into its architecture, Sentinel meets real-world deployment standards and aligns with **AGENTIC 3.0 principles of responsible agentic design**.

---
