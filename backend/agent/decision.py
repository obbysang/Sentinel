from typing import List
import numpy as np
from agent.perception import Incident
from incidents.logger import IncidentLogger

class DecisionEngine:
    def __init__(self):
        self.logger = IncidentLogger()

    def act(self, decisions: List[Incident], frame: np.ndarray):
        """
        Executes actions based on decisions/incidents.
        Currently filters by confidence and logs them.
        """
        for incident in decisions:
            # Filter Gemini's output (e.g., if confidence > 0.85: log_incident())
            if incident.confidence > 0.85:
                self.logger.log_incident(incident, frame)
