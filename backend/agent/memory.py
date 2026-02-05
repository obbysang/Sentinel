from collections import deque
from datetime import datetime, timedelta
from typing import List, Dict, Optional
from agent.perception import Worker, TimelineEvent

class WorkerMemory:
    def __init__(self, max_len: int = 100):
        self.history: deque[Worker] = deque(maxlen=max_len)

    def update(self, worker_state: Worker):
        """Add new observations to a deque/list."""
        self.history.append(worker_state)

    def get_timeline(self, seconds: int = 10) -> List[Worker]:
        """Retrieve the recent history of a worker to allow reasoning about duration."""
        if not self.history:
            return []

        # Assuming the latest state is the reference point for 'now'
        last_state = self.history[-1]
        try:
            now = datetime.fromisoformat(last_state.lastSeen)
        except ValueError:
            return list(self.history)

        cutoff = now - timedelta(seconds=seconds)
        
        timeline = []
        # Iterate backwards to find states within the window
        for state in reversed(self.history):
            try:
                state_time = datetime.fromisoformat(state.lastSeen)
                if state_time < cutoff:
                    break
                timeline.insert(0, state)
            except ValueError:
                continue
            
        return timeline

class Memory:
    def __init__(self, retention_seconds: int = 10):
        self.workers: Dict[str, WorkerMemory] = {}
        self.global_timeline: List[TimelineEvent] = []
        self.retention_seconds = retention_seconds

    def update(self, workers: List[Worker]):
        for w in workers:
            if w.id not in self.workers:
                self.workers[w.id] = WorkerMemory()
            self.workers[w.id].update(w)

    def get_worker_memory(self, worker_id: str) -> Optional[WorkerMemory]:
        return self.workers.get(worker_id)
        
    def add_timeline_event(self, event: TimelineEvent):
        self.global_timeline.append(event)
        # Keep global timeline manageable
        if len(self.global_timeline) > 100:
             self.global_timeline.pop(0)
        
    def get_global_timeline(self) -> List[TimelineEvent]:
        return self.global_timeline
