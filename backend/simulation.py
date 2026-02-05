import asyncio
import random
import datetime
from typing import List
from agent.perception import Worker, Incident, TimelineEvent, SystemState
from api.server import ConnectionManager

# Initial State
WORKERS = [
    Worker(id='WK-01', x=20, y=20, hasHelmet=True, hasVest=True, zone='Safe', status='Working', lastSeen=datetime.datetime.now().isoformat()),
    Worker(id='WK-02', x=70, y=30, hasHelmet=True, hasVest=False, zone='Loading Dock', status='Moving', lastSeen=datetime.datetime.now().isoformat()),
    Worker(id='WK-03', x=15, y=70, hasHelmet=False, hasVest=True, zone='Excavation Pit', status='Stationary', lastSeen=datetime.datetime.now().isoformat()),
]

INCIDENTS: List[Incident] = []
TIMELINE: List[TimelineEvent] = []

async def run_simulation(manager: ConnectionManager):
    print("Starting Sentinel Simulation Loop...")
    while True:
        # Update Workers
        current_time = datetime.datetime.now()
        
        for w in WORKERS:
            # Random movement
            w.x += (random.random() - 0.5) * 3
            w.y += (random.random() - 0.5) * 3
            
            # Boundaries
            w.x = max(5, min(95, w.x))
            w.y = max(5, min(95, w.y))
            
            # Zone Detection
            new_zone = 'Safe'
            if w.x > 60 and w.y < 50:
                new_zone = 'Loading Dock'
            if w.x < 45 and w.y > 50:
                new_zone = 'Excavation Pit'
            w.zone = new_zone
            
            w.lastSeen = current_time.isoformat()
            
            # Random Events
            rand = random.random()
            
            # PPE Violation Simulation
            if rand > 0.995 and w.hasHelmet:
                w.hasHelmet = False
                # Create Incident
                incident_id = f"INC-{random.randint(1000, 9999)}"
                new_incident = Incident(
                    id=incident_id,
                    timestamp=current_time.isoformat(),
                    workerId=w.id,
                    type='PPE Violation',
                    severity='High',
                    confidence=0.88 + random.random() * 0.11,
                    details='Worker removed helmet in active zone',
                    acknowledged=False
                )
                INCIDENTS.insert(0, new_incident)
                if len(INCIDENTS) > 50: INCIDENTS.pop()
                
                # Add Timeline Event
                TIMELINE.insert(0, TimelineEvent(
                    id=f"evt-{random.randint(10000,99999)}",
                    workerId=w.id,
                    timestamp=current_time.isoformat(),
                    type='Violation',
                    description='PPE Violation detected'
                ))

            elif rand < 0.005 and not w.hasHelmet:
                w.hasHelmet = True
                TIMELINE.insert(0, TimelineEvent(
                    id=f"evt-{random.randint(10000,99999)}",
                    workerId=w.id,
                    timestamp=current_time.isoformat(),
                    type='Status Change',
                    description='Worker compliant'
                ))

        # Prepare State Payload
        state = SystemState(
            workers=WORKERS,
            incidents=INCIDENTS,
            timeline=TIMELINE[:20],
            stats={"cpu": 15, "latency": 24}
        )
        
        # Broadcast
        await manager.broadcast(state.model_dump())
        
        # Sleep (approx 600ms to match frontend loop)
        await asyncio.sleep(0.6)
