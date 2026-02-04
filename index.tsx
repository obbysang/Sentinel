import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  AlertTriangle, 
  Shield, 
  ShieldAlert, 
  Activity, 
  Clock, 
  Maximize2, 
  Video, 
  User, 
  MapPin, 
  CheckCircle,
  XCircle,
  Menu,
  Terminal,
  Cpu,
  Eye,
  ArrowRight,
  Zap,
  Brain,
  Gavel,
  FileText,
  Lock,
  Server,
  Github,
  Play,
  ScanEye,
  ChevronDown,
  Plus,
  Minus,
  Database
} from 'lucide-react';

// --- Types ---

interface Worker {
  id: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  hasHelmet: boolean;
  hasVest: boolean;
  zone: 'Safe' | 'Loading Dock' | 'Excavation Pit';
  status: 'Moving' | 'Stationary' | 'Working';
  lastSeen: Date;
}

interface Incident {
  id: string;
  timestamp: Date;
  workerId: string;
  type: 'PPE Violation' | 'Zone Intrusion' | 'Unsafe Posture';
  severity: 'Low' | 'Medium' | 'High';
  confidence: number;
  details: string;
  acknowledged: boolean;
}

interface TimelineEvent {
  id: string;
  workerId: string;
  timestamp: Date;
  type: 'Zone Change' | 'Status Change' | 'Violation';
  description: string;
}

// --- Constants & Mock Data ---

const ZONES = [
  { name: 'Safe', color: 'rgba(16, 185, 129, 0.1)', border: '#10b981', x: 0, y: 0, w: 100, h: 100 },
  { name: 'Loading Dock', color: 'rgba(245, 158, 11, 0.15)', border: '#f59e0b', x: 60, y: 10, w: 35, h: 40 },
  { name: 'Excavation Pit', color: 'rgba(239, 68, 68, 0.15)', border: '#ef4444', x: 5, y: 50, w: 40, h: 40 },
];

const INITIAL_WORKERS: Worker[] = [
  { id: 'WK-01', x: 20, y: 20, hasHelmet: true, hasVest: true, zone: 'Safe', status: 'Working', lastSeen: new Date() },
  { id: 'WK-02', x: 70, y: 30, hasHelmet: true, hasVest: false, zone: 'Loading Dock', status: 'Moving', lastSeen: new Date() },
  { id: 'WK-03', x: 15, y: 70, hasHelmet: false, hasVest: true, zone: 'Excavation Pit', status: 'Stationary', lastSeen: new Date() },
];

// --- Components ---

const StatusBadge = ({ status, type = 'default' }: { status: string, type?: 'success'|'warning'|'danger'|'default' }) => {
  const colors = {
    success: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    warning: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    danger: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    default: 'bg-slate-700 text-slate-300 border-slate-600',
  };
  
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border tracking-wider ${colors[type]}`}>
      {status}
    </span>
  );
};

const Header = ({ onBack }: { onBack: () => void }) => (
  <header className="h-16 bg-sentinel-panel border-b border-sentinel-border flex items-center justify-between px-6 shrink-0 relative z-20">
    <div className="flex items-center gap-3 cursor-pointer" onClick={onBack} title="Back to Home">
      <div className="w-9 h-9 bg-amber-500 rounded flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:scale-105 transition-transform">
        <Eye className="w-5 h-5 text-slate-900" strokeWidth={2.5} />
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
            <span className="text-xs text-slate-300 font-mono">14%</span>
          </div>
        </div>
        <div className="w-px h-6 bg-sentinel-border"></div>
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-slate-400" />
          <div className="flex flex-col leading-none">
            <span className="text-[9px] text-slate-500 font-mono">LATENCY</span>
            <span className="text-xs text-emerald-400 font-mono">24ms</span>
          </div>
        </div>
      </div>
      <div className="h-9 w-9 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center hover:bg-slate-700 cursor-pointer transition-colors">
        <User className="w-4 h-4 text-slate-300" />
      </div>
    </div>
  </header>
);

const LiveFeed = ({ workers, simplified = false }: { workers: Worker[], simplified?: boolean }) => {
  return (
    <div className={`relative w-full h-full bg-black rounded-lg overflow-hidden border border-sentinel-border group ${!simplified && 'shadow-2xl'}`}>
      {/* Simulated Video Background */}
      <div className="absolute inset-0 bg-slate-900 opacity-80 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black">
        {/* Grid lines for perspective feel */}
        <div className="absolute inset-0 opacity-20" style={{ 
          backgroundImage: 'linear-gradient(rgba(100, 116, 139, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(100, 116, 139, 0.3) 1px, transparent 1px)',
          backgroundSize: '100px 100px',
          transform: 'perspective(1000px) rotateX(10deg) scale(1.1)'
        }}></div>
      </div>
      
      {/* Zones Overlay */}
      {ZONES.filter(z => z.name !== 'Safe').map((zone, i) => (
        <div 
          key={i}
          className="absolute border-2 border-dashed flex items-start justify-end p-2 transition-opacity duration-300"
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
            className="absolute transition-all duration-700 ease-in-out z-10"
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

      {/* Camera UI Overlay */}
      <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none">
        <div className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-sm animate-pulse flex items-center gap-2 w-fit">
          <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
          LIVE REC
        </div>
        {!simplified && (
            <div className="text-slate-400 text-xs font-mono bg-black/40 px-2 py-1 rounded backdrop-blur-sm w-fit border border-white/5">
                CAM_04_NORTH_SECTOR
            </div>
        )}
      </div>

      {!simplified && (
          <div className="absolute bottom-4 right-4 pointer-events-none">
            <div className="text-xs font-mono text-emerald-500/80">AI CONFIDENCE: 98.4%</div>
          </div>
      )}
    </div>
  );
};

const IncidentCard: React.FC<{ incident: Incident }> = ({ incident }) => {
  const [expanded, setExpanded] = useState(false);
  
  const severityStyles = {
    High: 'border-l-rose-500 from-rose-500/10',
    Medium: 'border-l-amber-500 from-amber-500/10',
    Low: 'border-l-blue-500 from-blue-500/10',
  };

  const Icon = incident.type === 'PPE Violation' ? ShieldAlert : AlertTriangle;

  return (
    <div 
      onClick={() => setExpanded(!expanded)}
      className={`relative p-4 rounded-r-md border-l-[3px] border-y border-r border-sentinel-border mb-3 cursor-pointer transition-all duration-200 bg-gradient-to-r to-transparent hover:bg-slate-800 ${severityStyles[incident.severity]}`}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2.5">
          <div className={`p-1.5 rounded-full ${incident.severity === 'High' ? 'bg-rose-500/20' : 'bg-slate-700/50'}`}>
            <Icon className={`w-4 h-4 ${incident.severity === 'High' ? 'text-rose-500' : incident.severity === 'Medium' ? 'text-amber-500' : 'text-blue-500'}`} />
          </div>
          <div>
             <span className="block font-semibold text-sm text-slate-200">{incident.type}</span>
             <span className="text-[10px] text-slate-500 font-mono">ID: {incident.id}</span>
          </div>
        </div>
        <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
          <Clock size={10} />
          {incident.timestamp.toLocaleTimeString([], { hour12: false })}
        </span>
      </div>
      
      <p className="text-xs text-slate-400 mb-3 ml-9">{incident.details}</p>
      
      <div className="flex items-center justify-between ml-9">
        <div className="flex gap-2">
          <StatusBadge status={incident.workerId} />
          <StatusBadge 
            status={incident.severity.toUpperCase()} 
            type={incident.severity === 'High' ? 'danger' : incident.severity === 'Medium' ? 'warning' : 'default'} 
          />
        </div>
        <div className="flex flex-col items-end">
           <div className="text-[9px] text-slate-500 uppercase tracking-wider">Confidence</div>
           <div className="h-1.5 w-16 bg-slate-800 rounded-full mt-1 overflow-hidden">
              <div className="h-full bg-emerald-500" style={{ width: `${incident.confidence * 100}%` }}></div>
           </div>
        </div>
      </div>
      
      {/* Details Drawer */}
      {expanded && (
        <div className="mt-4 pt-3 border-t border-slate-700/50 animate-in slide-in-from-top-2 duration-200">
           <div className="flex items-center gap-2 mb-2">
              <Terminal size={12} className="text-slate-500" />
              <span className="text-[10px] font-bold text-slate-500 uppercase">Reasoning Log</span>
           </div>
           <div className="bg-black/50 p-2 rounded text-[10px] font-mono text-slate-400 border border-slate-800 shadow-inner">
            <span className="text-purple-400">def</span> <span className="text-blue-400">analyze_frame</span>(obj):<br/>
            &nbsp;&nbsp;violations = []<br/>
            &nbsp;&nbsp;<span className="text-purple-400">if</span> obj.has_helmet == <span className="text-rose-400">False</span>:<br/>
            &nbsp;&nbsp;&nbsp;&nbsp;violations.append(<span className="text-green-400">"NO_HELMET"</span>)<br/>
            &nbsp;&nbsp;<span className="text-slate-500"># Confidence: {(incident.confidence).toFixed(4)}</span>
           </div>
           <div className="mt-2 flex gap-2">
              <button className="flex-1 bg-slate-800 hover:bg-slate-700 text-xs py-1.5 rounded text-slate-300 transition-colors">Dismiss</button>
              <button className="flex-1 bg-slate-800 hover:bg-slate-700 text-xs py-1.5 rounded text-slate-300 transition-colors">Snapshot</button>
           </div>
        </div>
      )}
    </div>
  );
};

const Timeline = ({ events }: { events: TimelineEvent[] }) => {
  return (
    <div className="flex h-full gap-0 overflow-x-auto items-center custom-scrollbar pb-2">
      {events.map((event, i) => (
        <div key={event.id} className="shrink-0 flex flex-col items-center group min-w-[140px] relative">
           
           {/* Connecting Line */}
           <div className="absolute top-[27px] left-1/2 w-full h-[2px] bg-slate-800 -z-10 group-last:hidden"></div>
           {i > 0 && <div className="absolute top-[27px] right-1/2 w-full h-[2px] bg-slate-800 -z-10"></div>}

           {/* Time Label */}
           <div className="text-[9px] font-mono text-slate-500 mb-2 opacity-60 group-hover:opacity-100 transition-opacity">
              {event.timestamp.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' })}
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
      ))}
      <div className="w-12 shrink-0"></div> {/* Spacer */}
    </div>
  );
};

// --- Landing Page Assets & Sections ---

const IsometricCube = ({ type }: { type: number }) => {
  return (
    <div className="w-48 h-48 relative opacity-80 hover:opacity-100 transition-opacity duration-500">
      <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-2xl">
        {/* Isometric Cube Base Shape */}
        <path d="M100 20 L180 60 L180 140 L100 180 L20 140 L20 60 Z" fill="none" stroke="#e5e5e5" strokeWidth="1" />
        <path d="M20 60 L100 100 L180 60" fill="none" stroke="#e5e5e5" strokeWidth="1" />
        <path d="M100 100 L100 180" fill="none" stroke="#e5e5e5" strokeWidth="1" />
        
        {/* Inner Graphic Based on Type */}
        {type === 1 && (
           <g transform="translate(100, 100)" className="animate-pulse">
             {/* Observation / Eye */}
             <circle cx="0" cy="0" r="15" fill="#f9f9f9" stroke="#333" strokeWidth="1.5" />
             <circle cx="0" cy="0" r="5" fill="#333" />
             <path d="M-25 0 Q0 -25 25 0 Q0 25 -25 0" fill="none" stroke="#333" strokeWidth="1" />
           </g>
        )}
        {type === 2 && (
           <g transform="translate(100, 100)">
              {/* Brain / Network */}
              <circle cx="-10" cy="-10" r="4" fill="#333" />
              <circle cx="10" cy="-10" r="4" fill="#333" />
              <circle cx="0" cy="10" r="4" fill="#333" />
              <line x1="-10" y1="-10" x2="10" y2="-10" stroke="#333" strokeWidth="1" />
              <line x1="-10" y1="-10" x2="0" y2="10" stroke="#333" strokeWidth="1" />
              <line x1="10" y1="-10" x2="0" y2="10" stroke="#333" strokeWidth="1" />
           </g>
        )}
        {type === 3 && (
            <g transform="translate(100, 100)">
              {/* Check / Action */}
              <path d="M-15 0 L-5 10 L15 -10" fill="none" stroke="#333" strokeWidth="3" />
              <rect x="-20" y="-20" width="40" height="40" rx="5" fill="none" stroke="#333" strokeWidth="1" />
            </g>
        )}
      </svg>
    </div>
  )
}

const LandingPage = ({ onEnter }: { onEnter: () => void }) => {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-munch-olive/30 overflow-y-auto custom-scrollbar">
      
      {/* 1. HERO SECTION (Olive Gradient) */}
      <section className="relative min-h-[90vh] mesh-gradient noise-bg text-white flex flex-col items-center">
        
        {/* Navbar (Floating) */}
        <nav className="w-full max-w-6xl mx-auto px-6 py-6 flex justify-between items-center z-50">
           <div className="flex items-center gap-2 cursor-pointer" onClick={onEnter}>
              <div className="w-6 h-6 border-2 border-white rounded-full flex items-center justify-center">
                 <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <span className="font-bold tracking-tight text-lg">Sentinel®</span>
           </div>
           <div className="hidden md:flex gap-8 text-sm font-medium text-slate-300">
              <a href="#" className="hover:text-white transition-colors">How it Works</a>
              <a href="#" className="hover:text-white transition-colors">Features</a>
              <a href="#" className="hover:text-white transition-colors">Security</a>
           </div>
           <div className="flex items-center gap-4">
              <button 
                onClick={onEnter} 
                className="px-5 py-2 bg-white text-munch-olive rounded-full text-sm font-bold hover:bg-slate-200 transition-colors"
              >
                Go to Dashboard
              </button>
           </div>
        </nav>

        {/* Hero Content */}
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4 max-w-4xl mx-auto mt-12 mb-24 z-10">
           
           {/* Agent Loop Animation Pill */}
           <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8 animate-fade-in-up">
              <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
                 <span className="text-[10px] font-mono tracking-wider text-emerald-200">OBSERVE</span>
              </div>
              <ArrowRight size={10} className="text-white/30" />
              <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse delay-75"></div>
                 <span className="text-[10px] font-mono tracking-wider text-amber-200">REASON</span>
              </div>
              <ArrowRight size={10} className="text-white/30" />
              <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse delay-150"></div>
                 <span className="text-[10px] font-mono tracking-wider text-blue-200">ACT</span>
              </div>
              <ArrowRight size={10} className="text-white/30" />
              <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse delay-300"></div>
                 <span className="text-[10px] font-mono tracking-wider text-purple-200">REFLECT</span>
              </div>
           </div>

           <h1 className="text-5xl md:text-7xl font-light tracking-tight mb-8 leading-[1.1]">
             Observe. Reason. Act.<br/>
             <span className="font-medium">Construction safety, autonomously.</span>
           </h1>
           <p className="text-lg md:text-xl text-slate-300 max-w-2xl font-light mb-12">
             Sentinel uses advanced computer vision and reasoning to monitor job sites 24/7, detecting PPE violations and hazards without human intervention.
           </p>

           {/* Console Input Box */}
           <div className="w-full max-w-2xl bg-[#111] rounded-2xl p-1 border border-white/10 shadow-2xl overflow-hidden relative group">
              <div className="bg-[#0a0a0a] rounded-xl p-6 text-left min-h-[160px] flex flex-col justify-between relative">
                 <div className="text-slate-500 font-mono text-sm mb-2 flex justify-between">
                   <span>// SYSTEM_LOG: ACTIVE</span>
                   <span className="text-emerald-500">● ONLINE</span>
                 </div>
                 <div className="text-white font-mono text-lg">
                   <span className="text-slate-500">{'>'}</span> <span className="text-emerald-500">monitoring</span> <span className="text-white">sector_04_feed</span><br/>
                   <span className="text-slate-500">{'>'}</span> <span className="text-amber-500">detecting</span> <span className="text-white">objects: [worker, helmet, vest]</span><br/>
                   <span className="text-slate-500">{'>'}</span> <span className="text-blue-500">analyzing</span> <span className="text-white">compliance_rules...</span>
                   <span className="animate-pulse">_</span>
                 </div>
                 
                 <div className="flex justify-between items-end mt-8">
                    <button className="flex items-center gap-2 text-xs font-mono text-slate-500 bg-white/5 px-3 py-1.5 rounded-md hover:bg-white/10 transition-colors">
                       View Logs <ChevronDown size={12} />
                    </button>
                    <button 
                      onClick={onEnter}
                      className="flex items-center gap-2 text-xs font-bold text-munch-olive bg-white px-4 py-2 rounded-full hover:bg-slate-200 transition-colors"
                    >
                      Go to Dashboard
                    </button>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* 2. HOW IT WORKS (White Background) */}
      <section className="py-32 px-6 max-w-6xl mx-auto">
         <div className="text-center mb-24">
            <h2 className="text-4xl md:text-5xl font-light tracking-tight text-slate-900 mb-6">
               The Agentic Loop:<br/> From Pixels to Decisions
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto">
               Sentinel operates on a continuous feedback loop, processing visual data into actionable safety intelligence without human intervention.
            </p>
            
            {/* Minimal Diagram Module */}
            <div className="mt-12 flex justify-center items-center gap-4 text-xs font-mono font-bold text-slate-400 overflow-x-auto">
               <span className="px-3 py-1 border rounded bg-slate-50">VIDEO</span>
               <ArrowRight size={12} />
               <span className="px-3 py-1 border rounded bg-slate-50">PERCEPTION</span>
               <ArrowRight size={12} />
               <span className="px-3 py-1 border rounded bg-amber-50 text-amber-600 border-amber-200">GEMINI 3</span>
               <ArrowRight size={12} />
               <span className="px-3 py-1 border rounded bg-slate-50">DECISION</span>
               <ArrowRight size={12} />
               <span className="px-3 py-1 border rounded bg-slate-50">LOG</span>
            </div>
         </div>

         <div className="relative">
            {/* Vertical Line */}
            <div className="absolute left-[50%] top-0 bottom-0 w-px bg-slate-200 hidden md:block -z-10"></div>
            
            {/* Steps */}
            <div className="space-y-32">
               
               {/* Step 1 */}
               <div className="flex flex-col md:flex-row items-center gap-12 md:gap-24">
                  <div className="flex-1 text-right md:text-left order-2 md:order-1">
                     <span className="text-xs font-mono text-slate-400 mb-2 block">01</span>
                     <h3 className="text-2xl font-bold mb-4">Video Ingestion & Perception.</h3>
                     <p className="text-slate-600 leading-relaxed max-w-sm">
                        Ingests RTSP streams in real-time. Computer vision models identify workers, equipment, and zones, converting raw pixels into structured spatial data.
                     </p>
                  </div>
                  <div className="flex-1 flex justify-center order-1 md:order-2">
                     <IsometricCube type={1} />
                  </div>
               </div>

               {/* Step 2 */}
               <div className="flex flex-col md:flex-row items-center gap-12 md:gap-24">
                   <div className="flex-1 flex justify-center order-1">
                     <IsometricCube type={2} />
                  </div>
                  <div className="flex-1 order-2">
                     <span className="text-xs font-mono text-slate-400 mb-2 block">02</span>
                     <h3 className="text-2xl font-bold mb-4">Cognitive Reasoning with Gemini 3.</h3>
                     <p className="text-slate-600 leading-relaxed max-w-sm">
                        The core reasoning engine interprets the scene context. Is that worker entering a pit? Are they securing their harness? It filters noise and understands intent.
                     </p>
                  </div>
               </div>

               {/* Step 3 */}
               <div className="flex flex-col md:flex-row items-center gap-12 md:gap-24">
                  <div className="flex-1 text-right md:text-left order-2 md:order-1">
                     <span className="text-xs font-mono text-slate-400 mb-2 block">03</span>
                     <h3 className="text-2xl font-bold mb-4">Decision, Action & Logging.</h3>
                     <p className="text-slate-600 leading-relaxed max-w-sm">
                        If a violation is confirmed, Sentinel acts instantly—logging the incident, saving a snapshot, and updating the site safety score.
                     </p>
                  </div>
                  <div className="flex-1 flex justify-center order-1 md:order-2">
                     <IsometricCube type={3} />
                  </div>
               </div>

            </div>
         </div>
      </section>

      {/* 3. FEATURE CARDS (White Bg) */}
      <section className="py-24 px-6 bg-white">
         <div className="max-w-7xl mx-auto">
            <div className="mb-16">
               <h2 className="text-3xl font-light text-slate-900 mb-4">Three Pillars of <br/> Intelligent Monitoring</h2>
               <p className="text-slate-500 max-w-lg text-sm">Everything you need to secure your site — powered by autonomous agents.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               {/* Card 1 */}
               <div className="bg-munch-card rounded-2xl p-1 overflow-hidden group shadow-xl">
                  <div className="bg-[#1e221e] rounded-xl h-full p-6 flex flex-col justify-between min-h-[320px] relative overflow-hidden">
                     <div className="z-10">
                        <div className="text-xs font-mono text-emerald-400 mb-2">Monitor</div>
                        <h4 className="text-white font-bold text-lg mb-2">Autonomous Surveillance</h4>
                        <p className="text-slate-400 text-xs leading-relaxed">
                           Zero human intervention required. Sentinel watches high-risk zones 24/7, never blinking, never sleeping.
                        </p>
                     </div>
                     <div className="mt-8 relative h-32 bg-black/40 rounded-lg border border-white/5 p-3 flex items-center justify-center">
                        <ScanEye size={48} className="text-emerald-500 opacity-80" />
                        <div className="absolute top-2 right-2 flex gap-1">
                           <div className="w-1 h-1 bg-red-500 rounded-full animate-pulse"></div>
                           <div className="w-1 h-1 bg-white rounded-full"></div>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Card 2 */}
               <div className="bg-munch-card rounded-2xl p-1 overflow-hidden group shadow-xl">
                  <div className="bg-[#1e221e] rounded-xl h-full p-6 flex flex-col justify-between min-h-[320px]">
                     <div className="z-10">
                        <div className="text-xs font-mono text-amber-400 mb-2">Reason</div>
                        <h4 className="text-white font-bold text-lg mb-2">Temporal Reasoning</h4>
                        <p className="text-slate-400 text-xs leading-relaxed">
                           Sentinel ignores brief obstructions and false positives. It understands that a worker adjusting a helmet isn't a violation.
                        </p>
                     </div>
                      <div className="mt-8 flex justify-center items-center h-32 relative">
                         <Brain size={48} className="text-amber-500 opacity-80" />
                         <div className="absolute top-0 right-1/4 w-2 h-2 bg-amber-200 rounded-full animate-ping"></div>
                      </div>
                  </div>
               </div>

               {/* Card 3 */}
               <div className="bg-munch-card rounded-2xl p-1 overflow-hidden group shadow-xl">
                  <div className="bg-[#1e221e] rounded-xl h-full p-6 flex flex-col justify-between min-h-[320px]">
                     <div className="z-10">
                        <div className="text-xs font-mono text-blue-400 mb-2">Log</div>
                        <h4 className="text-white font-bold text-lg mb-2">Auditable Incident Logs</h4>
                        <p className="text-slate-400 text-xs leading-relaxed">
                           Every decision is recorded in a JSON-structured audit trail, complete with timestamp, zone data, and confidence scores.
                        </p>
                     </div>
                     <div className="mt-8 space-y-2">
                        <div className="bg-white/5 p-2 rounded flex justify-between items-center border border-white/5">
                           <span className="text-[10px] text-slate-300 font-mono">incident_492.json</span>
                           <FileText size={12} className="text-blue-400"/>
                        </div>
                        <div className="bg-white/5 p-2 rounded flex justify-between items-center border border-white/5 opacity-60">
                           <span className="text-[10px] text-slate-300 font-mono">compliance_report.pdf</span>
                           <FileText size={12} className="text-blue-400"/>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* 4. PERFORMANCE / DEMO (Black Bg) */}
      <section className="py-24 px-6 bg-[#050505] text-white">
         <div className="max-w-6xl mx-auto text-center">
            <h2 className="text-3xl font-light mb-16">Trust, Backed by Real Performance</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-y-12 gap-x-8 text-left border-b border-white/10 pb-12 mb-12">
               <div>
                  <div className="text-3xl font-bold mb-1">99.5%</div>
                  <div className="text-sm text-slate-500">PPE Detection Accuracy</div>
               </div>
               <div>
                  <div className="text-3xl font-bold mb-1">&lt; 100ms</div>
                  <div className="text-sm text-slate-500">Inference Latency</div>
               </div>
               <div>
                  <div className="text-3xl font-bold mb-1">0</div>
                  <div className="text-sm text-slate-500">Human Intervention</div>
               </div>
               <div>
                  <div className="text-3xl font-bold mb-1">24/7</div>
                  <div className="text-sm text-slate-500">Continuous Uptime</div>
               </div>
            </div>

             {/* DEMO / SNAPSHOT */}
             <div className="mt-20 bg-[#111] rounded-2xl p-2 border border-white/10 shadow-2xl overflow-hidden max-w-4xl mx-auto">
                <div className="flex items-center gap-2 px-4 py-2 bg-[#0a0a0a] border-b border-white/5">
                   <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50"></div>
                   </div>
                   <span className="ml-4 text-[10px] font-mono text-slate-500">sentinel_dashboard_preview.exe</span>
                </div>
                {/* Embedded Live Feed as "Screenshot" */}
                <div className="h-[400px] relative pointer-events-none">
                    <LiveFeed workers={INITIAL_WORKERS} simplified={true} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    <div className="absolute bottom-6 left-6 text-left">
                       <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/20 border border-red-500/50 rounded-full text-red-200 text-xs font-bold mb-2">
                          <AlertTriangle size={12} />
                          VIOLATION DETECTED
                       </div>
                       <div className="text-white text-lg font-bold">Worker detected in Excavation Pit</div>
                       <div className="text-slate-400 text-sm">Zone Violation • Missing Vest • Confidence 98%</div>
                    </div>
                </div>
             </div>
         </div>
      </section>

      {/* 5. SECURITY & PRIVACY (White Bg) */}
      <section className="py-24 px-6 bg-white">
         <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-16">
            <div className="flex-1">
               <h2 className="text-4xl font-light text-slate-900 mb-6">Security & Privacy <br/> by Design</h2>
               <p className="text-slate-500 text-sm max-w-xs">
                  We prioritize worker privacy and data security. Sentinel is built to monitor safety, not surveillance.
               </p>
            </div>
            <div className="flex-1 space-y-6">
               <div className="border-b border-slate-200 pb-6">
                  <div className="flex justify-between items-center cursor-pointer group">
                     <h3 className="font-medium text-lg group-hover:text-emerald-700 transition-colors flex items-center gap-3">
                       <Lock size={18} className="text-emerald-600" />
                       No PII Stored
                     </h3>
                     <Minus size={16} />
                  </div>
                  <p className="text-slate-500 text-sm mt-3 leading-relaxed">
                     Sentinel processes video streams to extract vector data only. Faces are blurred or ignored. No personally identifiable information is persisted.
                  </p>
               </div>
               <div className="border-b border-slate-200 pb-6">
                  <div className="flex justify-between items-center cursor-pointer group">
                     <h3 className="font-medium text-lg group-hover:text-emerald-700 transition-colors flex items-center gap-3">
                       <Server size={18} className="text-emerald-600" />
                       Local Processing
                     </h3>
                     <Plus size={16} />
                  </div>
               </div>
               <div className="border-b border-slate-200 pb-6">
                  <div className="flex justify-between items-center cursor-pointer group">
                     <h3 className="font-medium text-lg group-hover:text-emerald-700 transition-colors flex items-center gap-3">
                       <Database size={18} className="text-emerald-600" />
                       Audit Trail
                     </h3>
                     <Plus size={16} />
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* 6. FOOTER CTA (Olive Gradient) */}
      <footer className="mesh-gradient py-32 px-6 text-white text-center relative overflow-hidden">
         <div className="absolute inset-0 noise-bg opacity-30"></div>
         <div className="relative z-10">
             <h2 className="text-4xl md:text-5xl font-light mb-4">Ready to secure your site?</h2>
             <h2 className="text-4xl md:text-5xl font-medium mb-12">Just Try It</h2>
             
             {/* Footer Console */}
             <div className="w-full max-w-xl mx-auto bg-black rounded-xl p-6 border border-white/10 text-left mb-16 shadow-2xl">
                 <div className="text-xs text-slate-500 mb-8 font-mono">// Waiting for input...</div>
                 <div className="flex justify-between items-center">
                    <span className="text-emerald-500 font-mono text-sm animate-pulse">{'>'} _</span>
                    <div className="flex gap-4">
                       <button className="text-[10px] flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full text-white hover:bg-white/20 transition-colors">
                          <Github size={12} /> View GitHub
                       </button>
                       <button onClick={onEnter} className="text-[10px] font-bold bg-white text-munch-olive px-4 py-2 rounded-full hover:bg-slate-200 transition-colors">
                          Go to Dashboard
                       </button>
                    </div>
                 </div>
             </div>

             <div className="grid grid-cols-2 md:grid-cols-4 max-w-5xl mx-auto text-left text-xs text-slate-400 border-t border-white/10 pt-12 gap-8">
                 <div>
                    <div className="text-white font-bold mb-4 flex items-center gap-2">
                       <div className="w-3 h-3 bg-white rounded-full"></div> Sentinel®
                    </div>
                    <p>San Francisco, CA</p>
                    <p className="mt-4">contact@sentinel.ai</p>
                 </div>
                 <div>
                    <h4 className="text-white font-bold mb-4">Product</h4>
                    <ul className="space-y-2">
                       <li>Autonomous Agent</li>
                       <li>Computer Vision</li>
                       <li>Integrations</li>
                    </ul>
                 </div>
                 <div>
                    <h4 className="text-white font-bold mb-4">Use Cases</h4>
                    <ul className="space-y-2">
                       <li>Construction</li>
                       <li>Manufacturing</li>
                       <li>Logistics</li>
                    </ul>
                 </div>
                 <div>
                    <h4 className="text-white font-bold mb-4">Resources</h4>
                    <ul className="space-y-2">
                       <li>Documentation</li>
                       <li>API Reference</li>
                       <li>System Status</li>
                    </ul>
                 </div>
             </div>
         </div>
      </footer>
    </div>
  )
}

// ... (SentinelDashboard component remains exactly the same as previous) ...

const SentinelDashboard = ({ onBack }: { onBack: () => void }) => {
  const [workers, setWorkers] = useState<Worker[]>(INITIAL_WORKERS);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);

  // Simulation Loop
  useEffect(() => {
    const interval = setInterval(() => {
      setWorkers(prev => prev.map(w => {
        // Random movement
        let newX = w.x + (Math.random() - 0.5) * 3;
        let newY = w.y + (Math.random() - 0.5) * 3;
        
        // Boundaries
        newX = Math.max(5, Math.min(95, newX));
        newY = Math.max(5, Math.min(95, newY));

        // Zone Detection logic
        let newZone: Worker['zone'] = 'Safe';
        if (newX > 60 && newY < 50) newZone = 'Loading Dock';
        if (newX < 45 && newY > 50) newZone = 'Excavation Pit';

        // Random Event Trigger
        const rand = Math.random();
        
        // 1. Simulate PPE removal
        if (rand > 0.992 && w.hasHelmet) {
             w.hasHelmet = false;
             addIncident(w.id, 'PPE Violation', 'Worker removed helmet in active zone', 'High');
        } 
        // 2. Simulate Fixing PPE
        else if (rand < 0.01 && !w.hasHelmet) {
             w.hasHelmet = true;
             addTimelineEvent(w.id, 'Status Change', 'Worker compliant');
        }

        // 3. Zone Violation
        if (newZone === 'Excavation Pit' && w.zone !== 'Excavation Pit' && !w.hasVest) {
             addIncident(w.id, 'Zone Intrusion', 'Entered Excavation Pit without Vest', 'High');
        }

        return { ...w, x: newX, y: newY, zone: newZone };
      }));
    }, 600);

    return () => clearInterval(interval);
  }, []);

  const addIncident = (workerId: string, type: Incident['type'], details: string, severity: Incident['severity']) => {
    const newIncident: Incident = {
      id: Math.random().toString(36).substr(2, 6).toUpperCase(),
      timestamp: new Date(),
      workerId,
      type,
      severity,
      confidence: 0.88 + Math.random() * 0.11,
      details,
      acknowledged: false
    };

    setIncidents(prev => [newIncident, ...prev].slice(0, 50));
    addTimelineEvent(workerId, 'Violation', details);
  };

  const addTimelineEvent = (workerId: string, type: TimelineEvent['type'], description: string) => {
    setTimelineEvents(prev => [{
      id: Math.random().toString(36),
      workerId,
      timestamp: new Date(),
      type,
      description
    }, ...prev].slice(0, 20));
  }

  const violationCount = incidents.filter(i => i.type !== 'Unsafe Posture').length;

  return (
    <div className="flex flex-col h-screen bg-sentinel-bg text-slate-200 selection:bg-amber-500/30">
      <Header onBack={onBack} />

      <main className="flex-1 flex overflow-hidden">
        {/* Left Panel: Video Feed */}
        <section className="flex-[3] p-6 flex flex-col min-w-0 border-r border-sentinel-border relative">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Video className="w-4 h-4 text-amber-500" /> Sector 4 Live Feed
            </h2>
            <div className="flex gap-2">
                <div className="flex items-center gap-2 px-3 py-1 bg-sentinel-panel rounded text-[10px] border border-sentinel-border">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  LIVE
                </div>
                <button className="p-1.5 hover:bg-slate-800 rounded text-slate-400 transition-colors"><Maximize2 className="w-4 h-4" /></button>
            </div>
          </div>
          
          <div className="flex-1 min-h-0 relative">
             <LiveFeed workers={workers} />
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
                   {((workers.filter(w => w.hasHelmet && w.hasVest).length / workers.length) * 100).toFixed(0)}%
                </div>
             </div>
             <div className="bg-sentinel-panel p-4 rounded border border-sentinel-border relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Activity size={40} />
                </div>
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">System Status</div>
                <div className="text-2xl font-mono font-bold text-emerald-500 mt-1">RUNNING</div>
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

// --- App Orchestrator ---

const App = () => {
  const [currentView, setCurrentView] = useState<'landing' | 'dashboard'>('landing');

  if (currentView === 'landing') {
    return <LandingPage onEnter={() => setCurrentView('dashboard')} />;
  }

  return <SentinelDashboard onBack={() => setCurrentView('landing')} />;
};

// --- Render ---

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}