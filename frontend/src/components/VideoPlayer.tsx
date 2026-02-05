import React, { useState, useRef, useEffect } from 'react';
import { AlertTriangle, Shield, User, ZoomIn, ZoomOut } from 'lucide-react';
import { Worker, ZONES } from '../api';

interface VideoPlayerProps {
    workers?: Worker[];
    simplified?: boolean;
    videoUrl?: string;
    metadata?: any;
}

const VideoPlayer = ({ workers: propWorkers = [], simplified = false, videoUrl, metadata }: VideoPlayerProps) => {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [localWorkers, setLocalWorkers] = useState<Worker[]>([]);

  // If we have videoUrl and metadata, we sync workers to video time
  const workers = videoUrl && metadata ? localWorkers : propWorkers;

  useEffect(() => {
    if (!videoUrl || !metadata) return;
    
    let animationFrameId: number;
    
    const update = () => {
        if (videoRef.current) {
            const currentTime = videoRef.current.currentTime;
            // Find closest frame in metadata
            const frameData = metadata.frames.find((f: any, i: number) => {
                const next = metadata.frames[i+1];
                return f.timestamp <= currentTime && (!next || next.timestamp > currentTime);
            });
            
            if (frameData) {
                setLocalWorkers(frameData.workers);
            }
        }
        animationFrameId = requestAnimationFrame(update);
    };
    
    animationFrameId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animationFrameId);
  }, [videoUrl, metadata]);

  const handleWheel = (e: React.WheelEvent) => {
    if (simplified) return;
    const newZoom = Math.max(1, Math.min(4, zoom + (e.deltaY > 0 ? -0.1 : 0.1)));
    setZoom(newZoom);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
     if (simplified || zoom === 1) return;
     setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
     if (!isDragging) return;
     setPan({
        x: pan.x + e.movementX,
        y: pan.y + e.movementY
     });
  };

  const handleMouseUp = () => setIsDragging(false);

  return (
    <div 
        className={`relative w-full h-full bg-black rounded-lg overflow-hidden border border-sentinel-border group ${!simplified && 'shadow-2xl'}`}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
    >
      <div 
        className="w-full h-full transition-transform duration-100 ease-out origin-center"
        style={{ transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)` }}
      >
      
      {/* Video Layer */}
      {videoUrl ? (
          <video 
            ref={videoRef}
            src={videoUrl}
            className="absolute inset-0 w-full h-full object-contain"
            controls={!simplified}
            loop
            crossOrigin="anonymous"
          />
      ) : (
          /* Simulated Video Background */
          <div className="absolute inset-0 bg-slate-900 opacity-80 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black">
            {/* Grid lines for perspective feel */}
            <div className="absolute inset-0 opacity-20" style={{ 
              backgroundImage: 'linear-gradient(rgba(100, 116, 139, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(100, 116, 139, 0.3) 1px, transparent 1px)',
              backgroundSize: '100px 100px',
              transform: 'perspective(1000px) rotateX(10deg) scale(1.1)'
            }}></div>
          </div>
      )}
      
      {/* Zones Overlay */}
      {ZONES.filter(z => z.name !== 'Safe').map((zone, i) => (
        <div 
          key={i}
          className="absolute border-2 border-dashed flex items-start justify-end p-2 transition-opacity duration-300 pointer-events-none"
          style={{
            left: `${zone.x}%`,
            top: `${zone.y}%`,
            width: `${zone.w}%`,
            height: `${zone.h}%`,
            borderColor: zone.border,
            backgroundColor: zone.color,
          }}
        >
          <div className="flex items-center gap-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded border border-white/10" style={{ color: zone.border }}>
            <AlertTriangle size={12} />
            <span className="text-[10px] font-bold tracking-widest">
              {zone.name.toUpperCase()}
            </span>
          </div>
        </div>
      ))}

      {/* Workers / Bounding Boxes */}
      {workers.map(worker => {
        const isViolating = !worker.hasHelmet || !worker.hasVest || (worker.zone === 'Excavation Pit' && worker.status === 'Moving');
        const color = isViolating ? '#ef4444' : '#10b981'; // Red or Green

        return (
          <div
            key={worker.id}
            className="absolute transition-all duration-100 ease-linear z-10 pointer-events-none"
            style={{
              left: `${worker.x}%`,
              top: `${worker.y}%`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            {/* Bounding Box */}
            <div 
              className={`border-2 relative flex flex-col items-center justify-between group-hover:scale-105 transition-transform ${simplified ? 'w-10 h-16' : 'w-20 h-32'}`}
              style={{ 
                borderColor: color,
                boxShadow: isViolating ? `0 0 20px ${color}60` : 'none',
                backgroundColor: isViolating ? `${color}10` : 'transparent'
              }}
            >
              {!simplified && (
                <>
                {/* Header Label */}
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900 text-white text-[10px] px-2 py-1 rounded-sm border border-slate-600 flex items-center gap-2 shadow-lg z-20">
                    <span className="font-bold font-mono text-xs">{worker.id}</span>
                    <div className={`w-1.5 h-1.5 rounded-full ${isViolating ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></div>
                </div>

                {/* Status Indicators Side Panel */}
                <div className="absolute -right-8 top-0 flex flex-col gap-1">
                    <div className={`p-1 rounded bg-slate-900/90 border backdrop-blur-sm ${worker.hasHelmet ? 'border-emerald-500/30 text-emerald-500' : 'border-rose-500/50 text-rose-500 shadow-lg shadow-rose-900/20'}`} title="Helmet Status">
                        <Shield size={12} />
                    </div>
                    <div className={`p-1 rounded bg-slate-900/90 border backdrop-blur-sm ${worker.hasVest ? 'border-emerald-500/30 text-emerald-500' : 'border-rose-500/50 text-rose-500 shadow-lg shadow-rose-900/20'}`} title="Vest Status">
                        <User size={12} />
                    </div>
                </div>
                </>
              )}
              
              {/* Corner brackets for visual flair */}
              <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2" style={{ borderColor: color }}></div>
              <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2" style={{ borderColor: color }}></div>
              <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2" style={{ borderColor: color }}></div>
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2" style={{ borderColor: color }}></div>

              {/* Center Dot (Person Representation) */}
              <div className="w-3 h-3 rounded-full opacity-90 mt-auto mb-4" style={{ backgroundColor: color }}></div>
            </div>
            
            {/* Zone Label if not safe */}
            {worker.zone !== 'Safe' && !simplified && (
               <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 text-[9px] font-bold text-black bg-amber-400 px-1.5 py-0.5 rounded-sm whitespace-nowrap">
                  {worker.zone.toUpperCase()}
               </div>
            )}
          </div>
        );
      })}
      </div>

      {/* Camera UI Overlay */}
      <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none z-50">
        <div className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-sm animate-pulse flex items-center gap-2 w-fit">
          <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
          {videoUrl ? 'PLAYBACK' : 'LIVE REC'}
        </div>
        {!simplified && (
            <div className="text-slate-400 text-xs font-mono bg-black/40 px-2 py-1 rounded backdrop-blur-sm w-fit border border-white/5">
                {videoUrl ? 'UPLOADED_FOOTAGE' : 'CAM_04_NORTH_SECTOR'}
            </div>
        )}
      </div>

      {!simplified && (
          <>
            {/* Zoom Controls */}
            <div className="absolute bottom-12 left-4 flex flex-col gap-1 z-50">
                <button 
                    onClick={(e) => { e.stopPropagation(); setZoom(Math.min(4, zoom + 0.5)); }}
                    className="p-1.5 bg-slate-900/80 border border-slate-700 rounded text-slate-300 hover:text-white transition-colors"
                >
                    <ZoomIn size={14} />
                </button>
                <button 
                    onClick={(e) => { e.stopPropagation(); setZoom(Math.max(1, zoom - 0.5)); }}
                    className="p-1.5 bg-slate-900/80 border border-slate-700 rounded text-slate-300 hover:text-white transition-colors"
                >
                    <ZoomOut size={14} />
                </button>
                <div className="bg-slate-900/80 border border-slate-700 rounded px-1.5 py-0.5 text-[10px] text-center text-slate-400 font-mono">
                    {zoom.toFixed(1)}x
                </div>
            </div>
          </>
      )}
    </div>
  );
};

export default VideoPlayer;
