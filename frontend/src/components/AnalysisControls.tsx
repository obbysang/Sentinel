import React, { useState } from 'react';
import { Play, Square, Activity, Cpu } from 'lucide-react';
import { api } from '../api';

interface AnalysisControlsProps {
    isAnalyzing: boolean;
    onStatusChange: (status: boolean) => void;
}

const AnalysisControls: React.FC<AnalysisControlsProps> = ({ isAnalyzing, onStatusChange }) => {
    const [loading, setLoading] = useState(false);

    const toggleAnalysis = async () => {
        setLoading(true);
        try {
            if (isAnalyzing) {
                await api.stopAnalysis();
                onStatusChange(false);
            } else {
                await api.startAnalysis();
                onStatusChange(true);
            }
        } catch (e) {
            console.error("Failed to toggle analysis", e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-sentinel-panel p-4 rounded border border-sentinel-border mb-4">
             <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-500" /> Agent Controls
                </h3>
            </div>
            
            <div className="flex flex-col gap-3">
                <button 
                    onClick={toggleAnalysis}
                    disabled={loading}
                    className={`flex items-center justify-center gap-2 py-3 rounded font-bold text-sm tracking-wide transition-all ${
                        isAnalyzing 
                        ? 'bg-rose-500/10 border border-rose-500 text-rose-500 hover:bg-rose-500/20' 
                        : 'bg-emerald-500 hover:bg-emerald-400 text-slate-900 border border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                    }`}
                >
                    {loading ? (
                        <span className="animate-pulse">PROCESSING...</span>
                    ) : isAnalyzing ? (
                        <>
                            <Square size={16} fill="currentColor" /> STOP ANALYSIS
                        </>
                    ) : (
                        <>
                            <Play size={16} fill="currentColor" /> START AGENT
                        </>
                    )}
                </button>

                <div className="grid grid-cols-2 gap-2">
                    <div className="bg-slate-900/50 p-2 rounded border border-slate-700 flex flex-col items-center">
                        <span className="text-[9px] text-slate-500 uppercase font-mono">Confidence</span>
                        <span className="text-emerald-400 font-mono font-bold">HIGH</span>
                    </div>
                    <div className="bg-slate-900/50 p-2 rounded border border-slate-700 flex flex-col items-center">
                        <span className="text-[9px] text-slate-500 uppercase font-mono">Latency</span>
                        <span className="text-amber-400 font-mono font-bold">~24ms</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalysisControls;
