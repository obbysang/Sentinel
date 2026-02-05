# Project Overview — Sentinel

## Project Name
**Sentinel**  
*An Autonomous Construction Safety Monitoring Agent*

---

## Problem Statement

Construction sites are among the most dangerous work environments in the world. Despite strict safety regulations, incidents continue to occur due to human error, inconsistent enforcement, and limited real-time oversight.

Today’s safety monitoring approaches suffer from critical limitations:

- **Manual supervision does not scale**: Safety officers cannot continuously monitor every camera feed across large or distributed sites.
- **Reactive, not proactive**: Incidents are often discovered after the fact—through reports, audits, or injuries.
- **High cognitive load**: Reviewing hours of video footage to find violations is expensive, slow, and error-prone.
- **Tooling without judgment**: Existing systems rely on static rules or alerts that trigger on single frames, producing false positives and alert fatigue.

What’s missing is not more cameras or dashboards—but **autonomous judgment**.

---

## Proposed Solution

**Sentinel** is an **autonomous security agent** designed to monitor construction site video feeds, reason about safety conditions over time, and independently log safety violations—without waiting for human prompts or intervention.

Rather than acting as a passive monitoring tool, Sentinel behaves like a **junior safety officer**:

- It *observes* live or recorded video feeds
- It *reasons* about safety compliance using explicit rules and temporal context
- It *decides* when an incident is significant enough to log
- It *acts* by generating a structured incident record with evidence
- It *reflects* by adapting its sensitivity to reduce false positives over time

The system is designed to run continuously and autonomously, demonstrating the core principles of **agentic systems** rather than traditional AI pipelines.

---

## Scope and Initial Focus

To ensure clarity, reliability, and demonstrable autonomy, Sentinel intentionally focuses on a **narrow but high-impact safety domain**:

### Construction Site Safety — PPE Compliance

**Initial ruleset (v1):**
- Hard hats are required in restricted zones
- Safety vests are required in restricted zones
- Violations lasting less than 5 seconds are ignored
- Repeated violations increase severity

This constrained scope allows Sentinel to demonstrate **robust perception, reasoning, and decision-making** without overfitting to a single scenario or overextending system complexity.

---

## What Makes Sentinel an Agent (Not a Pipeline)

Sentinel is explicitly designed around an **agent loop**, not a one-shot inference flow.

### Agent Loop
1. **Observe**  
   Sample frames from video streams and extract structured observations (e.g., presence of people, PPE status, zone context).

2. **Reason**  
   Aggregate observations over time and evaluate them against safety rules using a large reasoning model (Gemini 3).

3. **Act**  
   Autonomously log incidents when confidence and severity thresholds are met—without human approval.

4. **Reflect**  
   Track outcomes and adjust internal thresholds to reduce noise and improve future decisions.

This loop enables **temporal reasoning, self-directed action, and resilience to uncertainty**, which are core characteristics of autonomous agents.

---

## Role of AI in the System

Sentinel uses AI **only where it provides real leverage**, avoiding unnecessary or unsafe applications.

### Vision Models (Perception)
- Detect people, PPE (hard hats, safety vests), and zones
- Produce **structured, deterministic observations**
- No reasoning or decision-making occurs at this stage

### Gemini 3 (Reasoning Core)
- Acts as a *context-aware safety officer*
- Evaluates structured event timelines rather than raw pixels
- Determines:
  - Whether a safety incident occurred
  - Severity level
  - Confidence score
  - Rationale for the decision

This separation ensures:
- Reduced hallucination risk
- Auditable decisions
- Clear boundaries between perception and judgment

---

## Autonomy by Design

Sentinel is built to operate **without human-in-the-loop confirmation** for its core responsibilities.

- No manual triggering of analysis
- No approval required to log incidents
- No UI-driven decision-making
- Clear thresholds for action vs inaction

Human users interact with Sentinel as **observers and auditors**, not operators.

---

## Intended Users

- Construction site operators
- Safety managers
- Compliance officers
- Organizations managing multiple sites or camera feeds

Sentinel is designed to **augment human oversight**, not replace it—by handling continuous monitoring and surfacing only meaningful, well-reasoned incidents.

---

## Why This Matters

Sentinel demonstrates what the next generation of software systems will look like:

- Systems that **watch**, **understand**, and **decide**
- Systems that act continuously, not episodically
- Systems that reduce human burden rather than increasing it

This project aligns directly with the goals of **AGENTIC 3.0**: building the *invisible architecture* of autonomous systems that operate in the real world.

---

## Current Limitations (Explicit by Design)

- Focused on PPE compliance only (v1)
- Relies on visual cues; no identity or facial recognition
- Designed for demonstration-scale deployments

These constraints are intentional and allow Sentinel to prioritize **correctness, autonomy, and clarity** over breadth.

---

## Vision

Sentinel is a foundation, not a finished product.

The same architecture can be extended to:
- Additional safety rules
- Multiple camera feeds
- Cross-site analytics
- Predictive risk assessment

Most importantly, it serves as a **reference implementation of an autonomous, agentic system**—not a chatbot, not a dashboard, but a system that *decides*.

---
