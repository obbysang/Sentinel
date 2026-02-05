import cv2
import time
import os
from typing import Generator, Tuple, Union

class VideoIngest:
    def __init__(self, source: Union[str, int], fps_limit: int = 5):
        """
        Initialize video ingestion.
        :param source: Path to video file, RTSP URL, or camera index (int).
        :param fps_limit: Maximum frames per second to yield.
        """
        self.source = source
        self.fps_limit = fps_limit
        self.cap = None
        self.frame_interval = 1.0 / fps_limit if fps_limit > 0 else 0
        self.last_frame_time = 0

    def start(self):
        # Check if source is an integer (webcam index) passed as string
        if isinstance(self.source, str) and self.source.isdigit():
             self.source = int(self.source)

        if isinstance(self.source, str):
             if not os.path.exists(self.source) and not self.source.startswith(('rtsp://', 'http://', 'https://')):
                 # If file doesn't exist and not a URL, try treating as int (though likely caught above)
                 pass
        
        self.cap = cv2.VideoCapture(self.source)
        
        if not self.cap.isOpened():
            raise RuntimeError(f"Failed to open video source: {self.source}")

    def get_frames(self) -> Generator[Tuple[float, any], None, None]:
        if not self.cap:
            self.start()
            
        while self.cap.isOpened():
            now = time.time()
            
            # Simple FPS limiting
            if self.fps_limit > 0 and (now - self.last_frame_time) < self.frame_interval:
                # Sleep a tiny bit to prevent CPU spinning, but not too much to drift
                time.sleep(0.01)
                continue
                
            ret, frame = self.cap.read()
            if not ret:
                # If file, maybe loop? For now, just stop.
                # To loop: self.cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                # But typically we want to stop.
                break
                
            self.last_frame_time = now
            yield now, frame
            
    def stop(self):
        if self.cap:
            self.cap.release()
