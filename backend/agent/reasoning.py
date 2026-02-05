import os
import json
import google.generativeai as genai
from typing import List, Dict, Any, Union
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure Gemini
GENAI_API_KEY = os.getenv("GENAI_API_KEY")
if GENAI_API_KEY:
    genai.configure(api_key=GENAI_API_KEY)

class ReasoningEngine:
    def __init__(self, model_name: str = "gemini-1.5-flash"):
        self.model_name = model_name
        try:
            self.model = genai.GenerativeModel(self.model_name)
        except Exception as e:
            print(f"Warning: Failed to initialize Gemini model: {e}")
            self.model = None

    def create_prompt(self, timeline_json: str) -> str:
        return f"""
You are a construction safety officer AI. Analyze the following worker timeline for safety incidents.

Timeline Data:
{timeline_json}

Safety Rules:
1. PPE Compliance: Workers must have 'hasHelmet': true and 'hasVest': true at all times.
2. Hazardous Zones: 'Loading Dock' and 'Excavation Pit' are high-risk.
3. Loitering: Status 'Stationary' in a hazardous zone for more than 5 seconds is a warning.

Task:
Determine if there is a safety incident based on the timeline.
Return ONLY a valid JSON object with no markdown formatting, matching this schema:
{{
  "incident": boolean,
  "reason": "concise explanation of the violation or 'Safe'",
  "confidence": float between 0.0 and 1.0
}}
"""

    def analyze_safety(self, timeline: List[Any]) -> Dict[str, Any]:
        if not self.model:
             # Fallback logic if model is not available (e.g. for testing without key)
             # Basic heuristic check
             for item in timeline:
                 if isinstance(item, dict):
                     zone = item.get('zone')
                     status = item.get('status')
                 else:
                     zone = getattr(item, 'zone', 'Safe')
                     status = getattr(item, 'status', 'Moving')
                 
                 if zone == 'Excavation Pit':
                      return {"incident": True, "reason": "Zone Intrusion: Excavation Pit", "confidence": 0.8}
             
             return {"incident": False, "reason": "AI model not initialized", "confidence": 0.0}

        # Convert timeline to JSON
        timeline_data = []
        for item in timeline:
            if hasattr(item, 'model_dump'):
                timeline_data.append(item.model_dump())
            elif hasattr(item, 'dict'):
                timeline_data.append(item.dict())
            else:
                timeline_data.append(item)
                
        timeline_json = json.dumps(timeline_data, default=str)
        prompt = self.create_prompt(timeline_json)
        
        try:
            # Request JSON response
            response = self.model.generate_content(
                prompt, 
                generation_config={"response_mime_type": "application/json"}
            )
            
            result_text = response.text.strip()
            # Clean up potential markdown formatting just in case
            if result_text.startswith("```"):
                lines = result_text.splitlines()
                if lines[0].startswith("```"):
                    lines = lines[1:]
                if lines[-1].startswith("```"):
                    lines = lines[:-1]
                result_text = "\n".join(lines)
            
            return json.loads(result_text)
        except Exception as e:
            print(f"Error in analyze_safety: {e}")
            return {
                "incident": False, 
                "reason": f"Analysis error: {str(e)}", 
                "confidence": 0.0
            }

    def analyze_worker(self, worker_id: str, timeline: List[Any]) -> Dict[str, Any]:
        """Wrapper for analyze_safety to match existing loop usage."""
        return self.analyze_safety(timeline)
