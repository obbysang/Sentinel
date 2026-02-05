import uvicorn
import asyncio
from api.server import app, manager
from simulation import run_simulation

@app.on_event("startup")
async def startup_event():
    # Start the simulation loop in the background
    asyncio.create_task(run_simulation(manager))

if __name__ == "__main__":
    uvicorn.run("api.server:app", host="0.0.0.0", port=8000, reload=True)
