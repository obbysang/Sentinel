import uvicorn
import asyncio
import os
from api.server import app, manager, set_agent_runner
from agent.loop import AgentRunner

# Default video path
VIDEO_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "videos", "construction_violation.mp4")

@app.on_event("startup")
async def startup_event():
    video_source = VIDEO_PATH
    # Check if video exists, else warn
    if not os.path.exists(VIDEO_PATH):
        print(f"WARNING: Video file not found at {VIDEO_PATH}. Defaulting to Webcam (0).")
        video_source = "0"
    
    # Initialize AgentRunner
    agent_runner = AgentRunner(manager)
    set_agent_runner(agent_runner)
    
    # Start the real agent loop in the background with default source
    await agent_runner.start(video_source)

if __name__ == "__main__":
    uvicorn.run("api.server:app", host="0.0.0.0", port=8000, reload=True)
