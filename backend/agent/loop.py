import asyncio
import os
import traceback
from video.ingest import VideoIngest
from agent.perception import PerceptionEngine, SystemState, TimelineEvent
from agent.memory import Memory
from agent.reasoning import ReasoningEngine
from agent.decision import DecisionEngine
from incidents.logger import IncidentLogger
from api.server import ConnectionManager
from datetime import datetime

class AgentRunner:
    def __init__(self, manager: ConnectionManager):
        self.manager = manager
        self.running = False
        self.task = None
        self.video_source = None
        self.current_video_ingest = None

    async def start(self, video_source: str):
        if self.running:
            print("Agent already running. Stopping current instance...")
            await self.stop()
        
        self.video_source = video_source
        self.running = True
        self.task = asyncio.create_task(self._loop())
        print(f"Agent started with source: {video_source}")

    async def stop(self):
        if not self.running:
            return
            
        print("Stopping Agent...")
        self.running = False
        if self.current_video_ingest:
            self.current_video_ingest.stop()
            
        if self.task:
            try:
                await self.task
            except asyncio.CancelledError:
                pass
            self.task = None
        print("Agent Stopped")

    async def _loop(self):
        print(f"Initializing Sentinel Agent with video source: {self.video_source}")
        
        # Initialize Modules
        try:
            self.current_video_ingest = VideoIngest(self.video_source, fps_limit=5)
            perception = PerceptionEngine() # Loads YOLO
            memory = Memory(retention_seconds=10)
            reasoning = ReasoningEngine()
            decision = DecisionEngine()
            logger = IncidentLogger()
        except Exception as e:
            print(f"Initialization Error: {e}")
            self.running = False
            return

        print("Agent Loop Started")
        
        frame_count = 0
        
        # Video generator is synchronous, so we iterate but must yield for asyncio
        video_gen = self.current_video_ingest.get_frames()
        
        while self.running:
            try:
                # Manually iterate generator to allow await
                try:
                    timestamp, frame = next(video_gen)
                except StopIteration:
                    print("Video ended. Restarting...")
                    self.current_video_ingest.stop()
                    # Re-init video
                    if not self.running: break
                    self.current_video_ingest = VideoIngest(self.video_source, fps_limit=5)
                    video_gen = self.current_video_ingest.get_frames()
                    continue
                except Exception as e:
                    print(f"Video Error: {e}")
                    await asyncio.sleep(1)
                    continue
                    
                # 1. Perception
                workers = perception.detect(frame)
                
                # 2. Memory
                memory.update(workers)
                
                # 3. Reasoning & Decision (Throttled)
                if frame_count % 5 == 0: # Every ~1 sec
                    for w in workers:
                        mem = memory.get_worker_memory(w.id)
                        if not mem: continue
                        
                        timeline = mem.get_timeline(seconds=5)
                        
                        # Only reason if we have enough history
                        if len(timeline) > 3: 
                            result = reasoning.analyze_worker(w.id, timeline)
                            
                            incident = decision.evaluate(result, w.id)
                            
                            if incident:
                                # Log
                                logger.log(incident, frame)
                                
                                # Add to global timeline
                                memory.add_timeline_event(TimelineEvent(
                                    id=f"evt_{int(datetime.now().timestamp())}",
                                    workerId=w.id,
                                    timestamp=datetime.now().isoformat(),
                                    type="Violation",
                                    description=f"{incident.type}: {incident.details}"
                                ))

                # 4. Broadcast State
                recent_incidents = logger.get_all()[:10]
                
                state = SystemState(
                    workers=workers,
                    incidents=recent_incidents,
                    timeline=memory.get_global_timeline(),
                    stats={
                        "fps": 5, 
                        "active_workers": len(workers),
                        "system_status": "Autonomous" if self.running else "Stopped"
                    }
                )
                
                await self.manager.broadcast(state.model_dump())
                
                frame_count += 1
                await asyncio.sleep(0.01) # Yield to event loop
                
            except Exception as e:
                print(f"Error in Agent Loop: {e}")
                traceback.print_exc()
                await asyncio.sleep(1)
        
        print("Exiting Agent Loop")
