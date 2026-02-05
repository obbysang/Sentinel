import React, { useState, useEffect } from 'react';
import { 
  Eye, 
  Activity, 
  User, 
  Cpu, 
  Video, 
  Maximize2, 
  ShieldAlert, 
  CheckCircle, 
  Clock, 
  Shield, 
  AlertTriangle 
} from 'lucide-react';
import VideoPlayer from '../components/VideoPlayer';
import IncidentCard from '../components/IncidentCard';
import Logo from '../components/Logo';
import CameraPanel from '../components/CameraPanel';
import AnalysisControls from '../components/AnalysisControls';
import { Worker, Incident, TimelineEvent, SystemState, Camera } from '../api';

const Header = ({ onBack, stats }: { onBack: () => void, stats: { cpu: number, latency: number } }) => (
  <header className="h-16 bg-sentinel-panel border-b border-sentinel-border flex items-center justify-between px-6 shrink-0 relative z-20">
    <div className="flex items-center gap-3 cursor-pointer" onClick={onBack} title="Back to Home">
      <div className="w-9 h-9 rounded flex items-center justify-center hover:scale-105 transition-transform">
        <Logo className="w-full h-full" fallbackType="eye" />
      </div>
      <div>
        <h1 className="text-lg font-bold text-white tracking-widest font-mono">SENTINEL</h1>
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[10px] text-emerald-400 font-mono tracking-wide">AUTONOMOUS MONITORING ACTIVE</span>
        </div>
      </div>
    </div>
    
    <div className="flex items-center gap-4">
      <div className="hidden md:flex items-center gap-4 px-4 py-2 bg-slate-900/50 rounded border border-sentinel-border">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-slate-400" />
          <div className="flex flex-col leading-none">
            <span className="text-[9px] text-slate-500 font-mono">CPU LOAD</span>
            <span className="text-xs text-slate-300 font-mono">{stats.cpu}%</span>
          </div>
        </div>
        <div className="w-px h-6 bg-sentinel-border"></div>
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-slate-400" />
          <div className="flex flex-col leading-none">
            <span className="text-[9px] text-slate-500 font-mono">LATENCY</span>
            <span className="text-xs text-emerald-400 font-mono">{stats.latency}ms</span>
          </div>
        </div>
      </div>
      <div className="h-9 w-9 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center hover:bg-slate-800 cursor-pointer transition-colors">
        <User className="w-4 h-4 text-slate-300" />
      </div>
    </div>
  </header>
);

const Timeline = ({ events }: { events: TimelineEvent[] }) => {
  return (
    <div className="flex h-full gap-0 overflow-x-auto items-center custom-scrollbar pb-2">
      {events.map((event, i) => {
        // Convert string timestamp to Date for display
        const date = new Date(event.timestamp);
        return (
        <div key={event.id} className="shrink-0 flex flex-col items-center group min-w-[140px] relative">
           
           {/* Connecting Line */}
           <div className="absolute top-[27px] left-1/2 w-full h-[2px] bg-slate-800 -z-10 group-last:hidden"></div>
           {i > 0 && <div className="absolute top-[27px] right-1/2 w-full h-[2px] bg-slate-800 -z-10"></div>}

           {/* Time Label */}
           <div className="text-[9px] font-mono text-slate-500 mb-2 opacity-60 group-hover:opacity-100 transition-opacity">
              {date.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' })}
           </div>
           
           {/* Node */}
           <div className={`w-4 h-4 rounded-full border-[3px] z-10 transition-transform group-hover:scale-125 ${
              event.type === 'Violation' ? 'bg-sentinel-bg border-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]' : 
              event.type === 'Status Change' ? 'bg-sentinel-bg border-amber-500' : 'bg-sentinel-bg border-slate-600'
            }`}></div>
           
           {/* Card Info */}
           <div className="mt-3 bg-slate-800/50 p-2 rounded border border-slate-700 w-[120px] backdrop-blur-sm group-hover:bg-slate-800 transition-colors">
              <div className="flex justify-between items-center mb-1">
                 <span className="text-[9px] font-bold text-slate-300">{event.workerId}</span>
                 {event.type === 'Violation' && <AlertTriangle size={8} className="text-rose-500" />}
              </div>
              <div className="text-[9px] text-slate-400 leading-tight truncate" title={event.description}>
                {event.description}
              </div>
           </div>
        </div>
      )})}
      <div className="w-12 shrink-0"></div> {/* Spacer */}
    </div>
  );
};

const LiveFeedPage = ({ onBack }: { onBack: () => void }) => {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [stats, setStats] = useState({ cpu: 14, latency: 24 });
  const [isConnected, setIsConnected] = useState(false);
  const [activeCamera, setActiveCamera] = useState<Camera | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(true);

  // WebSocket Connection
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8000/ws');
    
    ws.onopen = () => {
        setIsConnected(true);
        console.log('Connected to Sentinel Backend');
    };

    ws.onmessage = (event) => {
        try {
            const data: SystemState = JSON.parse(event.data);
            setWorkers(data.workers);
            setIncidents(data.incidents);
            setTimelineEvents(data.timeline);
            setStats(data.stats as any);
            // Sync analysis state from backend stats if possible, or just assume local control wins for now
            if (data.stats.system_status === 'Stopped') {
                setIsAnalyzing(false);
            } else {
                setIsAnalyzing(true);
            }
        } catch (e) {
            console.error("Error parsing websocket message", e);
        }
    };

    ws.onclose = () => {
        setIsConnected(false);
        console.log('Disconnected from Sentinel Backend');
    };

    return () => {
        ws.close();
    };
  }, []);

  const violationCount = incidents.filter(i => i.type !== 'Unsafe Posture').length;

  return (
    <div className="flex flex-col h-screen bg-sentinel-bg text-slate-200 selection:bg-amber-500/30">
      <Header onBack={onBack} stats={stats} />

      <main className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Controls */}
        <section className="w-64 flex flex-col p-4 border-r border-sentinel-border overflow-y-auto custom-scrollbar">
            <CameraPanel activeCameraId={activeCamera?.id || null} onCameraSelect={setActiveCamera} />
            <AnalysisControls isAnalyzing={isAnalyzing} onStatusChange={setIsAnalyzing} />
        </section>

        {/* Center Panel: Video Feed */}
        <section className="flex-[3] p-6 flex flex-col min-w-0 border-r border-sentinel-border relative">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Video className="w-4 h-4 text-amber-500" /> {activeCamera ? activeCamera.name : 'Live Feed'}
            </h2>
            <div className="flex gap-2">
                <div className={`flex items-center gap-2 px-3 py-1 bg-sentinel-panel rounded text-[10px] border border-sentinel-border ${isConnected ? 'text-emerald-400' : 'text-rose-400'}`}>
                  <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                  {isConnected ? 'LIVE' : 'OFFLINE'}
                </div>
                <button className="p-1.5 hover:bg-slate-800 rounded text-slate-400 transition-colors"><Maximize2 className="w-4 h-4" /></button>
            </div>
          </div>
          
          <div className="flex-1 min-h-0 relative">
             <VideoPlayer workers={workers} />
          </div>

          <div className="mt-6 grid grid-cols-4 gap-4">
             <div className="bg-sentinel-panel p-4 rounded border border-sentinel-border relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                  <User size={40} />
                </div>
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Active Workers</div>
                <div className="text-2xl font-mono font-bold text-white mt-1">{workers.length}</div>
             </div>
             <div className="bg-sentinel-panel p-4 rounded border border-sentinel-border relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                  <AlertTriangle size={40} />
                </div>
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Active Alerts</div>
                <div className={`text-2xl font-mono font-bold mt-1 ${violationCount > 0 ? 'text-rose-500' : 'text-slate-300'}`}>
                  {violationCount}
                </div>
             </div>
             <div className="bg-sentinel-panel p-4 rounded border border-sentinel-border relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Shield size={40} />
                </div>
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">PPE Compliance</div>
                <div className="text-2xl font-mono font-bold text-amber-500 mt-1">
                   {workers.length > 0 ? ((workers.filter(w => w.hasHelmet && w.hasVest).length / workers.length) * 100).toFixed(0) : 0}%
                </div>
             </div>
             <div className="bg-sentinel-panel p-4 rounded border border-sentinel-border relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Activity size={40} />
                </div>
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">System Status</div>
                <div className={`text-2xl font-mono font-bold mt-1 ${isConnected ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {isConnected ? (isAnalyzing ? 'RUNNING' : 'PAUSED') : 'CONNECTING'}
                </div>
             </div>
          </div>
        </section>

        {/* Right Panel: Incident Log */}
        <section className="flex-[1.2] flex flex-col bg-sentinel-panel border-l border-sentinel-border min-w-[350px] max-w-[450px]">
          <div className="p-4 border-b border-sentinel-border bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
            <div className="flex justify-between items-center">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-500" /> Incident Log
              </h2>
              <span className="bg-slate-800 text-slate-400 text-[10px] px-2 py-0.5 rounded-full font-mono">{incidents.length} TOTAL</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            {incidents.length === 0 ? (
               <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-4">
                  <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 opacity-40 text-emerald-500" />
                  </div>
                  <span className="text-sm font-medium">All zones secure</span>
               </div>
            ) : (
               incidents.map(incident => (
                 <IncidentCard key={incident.id} incident={incident} />
               ))
            )}
          </div>
        </section>
      </main>

      {/* Bottom Panel: Timeline */}
      <footer className="h-44 bg-sentinel-panel border-t border-sentinel-border flex flex-col shrink-0">
        <div className="px-6 py-2 border-b border-sentinel-border flex justify-between items-center bg-slate-900/30">
           <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Clock className="w-3 h-3 text-blue-400" /> Temporal Analysis
           </h3>
           <div className="flex gap-4 text-[10px] text-slate-500 font-medium">
              <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_5px_rgba(244,63,94,0.5)]"></span> Critical</span>
              <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Warning</span>
              <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span> Info</span>
           </div>
        </div>
        <div className="flex-1 min-h-0 bg-sentinel-bg/50 px-6 py-2">
           <Timeline events={timelineEvents} />
        </div>
      </footer>
    </div>
  );
};

export default LiveFeedPage;
