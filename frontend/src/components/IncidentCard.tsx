import React, { useState } from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  Clock, 
  Terminal,
  CheckCircle,
  Trash2,
  MessageSquare,
  Send
} from 'lucide-react';
import { Incident, api } from '../api';

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

const IncidentCard: React.FC<{ incident: Incident, onDelete?: (id: string) => void, onResolve?: (id: string) => void }> = ({ incident, onDelete, onResolve }) => {
  const [expanded, setExpanded] = useState(false);
  const [note, setNote] = useState('');
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);
  
  const severityStyles = {
    High: 'border-l-rose-500 from-rose-500/10',
    Medium: 'border-l-amber-500 from-amber-500/10',
    Low: 'border-l-blue-500 from-blue-500/10',
  };

  const Icon = incident.type === 'PPE Violation' ? ShieldAlert : AlertTriangle;
  const date = new Date(incident.timestamp);

  const handleResolve = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
        await api.resolveIncident(incident.id);
        onResolve?.(incident.id);
    } catch (e) {
        console.error(e);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
        await api.deleteIncident(incident.id);
        onDelete?.(incident.id);
    } catch (e) {
        console.error(e);
    }
  };

  const handleSubmitNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim()) return;
    setIsSubmittingNote(true);
    try {
        await api.addNote(incident.id, note);
        setNote('');
        // We could refresh incidents here, but for now we just clear
    } catch (e) {
        console.error(e);
    } finally {
        setIsSubmittingNote(false);
    }
  };

  return (
    <div 
      onClick={() => setExpanded(!expanded)}
      className={`relative p-4 rounded-r-md border-l-[3px] border-y border-r border-sentinel-border mb-3 cursor-pointer transition-all duration-200 bg-gradient-to-r to-transparent hover:bg-slate-800 ${severityStyles[incident.severity]} ${incident.acknowledged ? 'opacity-60 grayscale-[0.5]' : ''}`}
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
        <div className="flex flex-col items-end gap-1">
            <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
            <Clock size={10} />
            {date.toLocaleTimeString([], { hour12: false })}
            </span>
            {incident.acknowledged && (
                <span className="text-[9px] text-emerald-500 font-bold uppercase flex items-center gap-1">
                    <CheckCircle size={8} /> RESOLVED
                </span>
            )}
        </div>
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
        <div className="mt-4 pt-3 border-t border-slate-700/50 animate-in slide-in-from-top-2 duration-200" onClick={e => e.stopPropagation()}>
           <div className="flex items-center gap-2 mb-2">
              <Terminal size={12} className="text-slate-500" />
              <span className="text-[10px] font-bold text-slate-500 uppercase">Reasoning Log</span>
           </div>
           <div className="bg-black/50 p-2 rounded text-[10px] font-mono text-slate-400 border border-slate-800 shadow-inner mb-3">
            <span className="text-purple-400">def</span> <span className="text-blue-400">analyze_frame</span>(obj):<br/>
            &nbsp;&nbsp;violations = []<br/>
            &nbsp;&nbsp;<span className="text-purple-400">if</span> obj.has_helmet == <span className="text-rose-400">False</span>:<br/>
            &nbsp;&nbsp;&nbsp;&nbsp;violations.append(<span className="text-green-400">"NO_HELMET"</span>)<br/>
            &nbsp;&nbsp;<span className="text-slate-500"># Confidence: {(incident.confidence).toFixed(4)}</span>
           </div>

           {incident.notes && incident.notes.length > 0 && (
                <div className="mb-3">
                    <div className="flex items-center gap-2 mb-1">
                        <MessageSquare size={12} className="text-slate-500" />
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Operator Notes</span>
                    </div>
                    <div className="space-y-2">
                        {incident.notes.map((n, i) => (
                            <div key={i} className="bg-slate-800/50 p-2 rounded text-[10px] border border-slate-700">
                                <div className="text-slate-500 mb-1">{new Date(n.timestamp).toLocaleString()}</div>
                                <div className="text-slate-300">{n.content}</div>
                            </div>
                        ))}
                    </div>
                </div>
           )}

           <form onSubmit={handleSubmitNote} className="flex gap-2 mb-3">
                <input 
                    placeholder="Add operator instruction..."
                    className="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-white placeholder-slate-600 focus:border-amber-500/50 outline-none transition-colors"
                    value={note}
                    onChange={e => setNote(e.target.value)}
                />
                <button 
                    type="submit"
                    disabled={isSubmittingNote}
                    className="p-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded transition-colors disabled:opacity-50"
                >
                    <Send size={14} />
                </button>
           </form>

           <div className="flex gap-2">
              <button 
                onClick={handleResolve}
                className={`flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-xs py-2 rounded text-slate-300 transition-colors ${incident.acknowledged ? 'pointer-events-none opacity-50' : ''}`}
              >
                <CheckCircle size={14} className="text-emerald-500" /> Resolve
              </button>
              <button 
                onClick={handleDelete}
                className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-rose-900/30 text-xs py-2 rounded text-slate-300 hover:text-rose-400 transition-colors"
              >
                <Trash2 size={14} /> Delete
              </button>
           </div>
        </div>
      )}
    </div>
  );
};

export default IncidentCard;
