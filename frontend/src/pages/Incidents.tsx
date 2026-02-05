import React from 'react';
import { ShieldAlert, CheckCircle } from 'lucide-react';
import IncidentCard from '../components/IncidentCard';
import { Incident } from '../api';

const IncidentsPage = () => {
  // This would ideally fetch incidents from an API or Context
  const incidents: Incident[] = []; 

  return (
    <div className="flex flex-col h-full bg-sentinel-panel border-l border-sentinel-border min-w-[350px]">
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
    </div>
  );
};

export default IncidentsPage;