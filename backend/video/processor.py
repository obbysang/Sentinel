import cv2
import json
import os
from datetime import datetime
from typing import List, Dict, Any
from agent.perception import PerceptionEngine, Worker
from video.ingest import VideoIngest

class VideoProcessor:
    def __init__(self, model_path: str = 'yolov8n.pt'):
        self.perception = PerceptionEngine(model_path)

    def process_video(self, file_path: str, progress_callback=None) -> Dict[str, Any]:
        """
        Process a video file and return detection metadata.
        """
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Video file not found: {file_path}")

        # Use VideoIngest with fps_limit=0 for maximum speed
        ingest = VideoIngest(file_path, fps_limit=0)
        
        # Get video properties for duration calculation
        cap = cv2.VideoCapture(file_path)
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        fps = cap.get(cv2.CAP_PROP_FPS)
        duration = total_frames / fps if fps > 0 else 0
        cap.release()

        frames_data = []
        frame_count = 0
        
        ingest.start()
        video_gen = ingest.get_frames()

        try:
            for timestamp, frame in video_gen:
                # Detect workers
                workers = self.perception.detect(frame)
                
                # Convert workers to dicts
                workers_data = [w.model_dump() for w in workers]
                
                # Calculate current time in video
                # timestamp from ingest is strictly system time based which isn't right for batch processing
                # We should calculate based on frame count
                current_time = frame_count / fps if fps > 0 else 0
                
                frames_data.append({
                    "frame": frame_count,
                    "timestamp": current_time,
                    "workers": workers_data
                })
                
                frame_count += 1
                
                if progress_callback:
                    progress = (frame_count / total_frames) * 100
                    progress_callback(progress)
                    
        finally:
            ingest.stop()

        return {
            "metadata": {
                "duration": duration,
                "total_frames": total_frames,
                "fps": fps,
                "processed_at": datetime.now().isoformat()
            },
            "frames": frames_data
        }
