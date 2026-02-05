import React, { useState, useEffect } from 'react';
import VideoUpload from '../components/VideoUpload';
import VideoPlayer from '../components/VideoPlayer';
import { api, Camera } from '../api';
import { Loader2, Download, CheckCircle } from 'lucide-react';

const VideoAnalysis = () => {
    const [camera, setCamera] = useState<Camera | null>(null);
    const [taskId, setTaskId] = useState<string | null>(null);
    const [status, setStatus] = useState<string>('idle'); // idle, processing, completed, failed
    const [progress, setProgress] = useState(0);
    const [result, setResult] = useState<any>(null);

    const handleUploadComplete = async (cam: Camera) => {
        setCamera(cam);
        try {
            const res = await api.processVideo(cam.id);
            setTaskId(res.task_id);
            setStatus('processing');
        } catch (e) {
            console.error(e);
            setStatus('failed');
        }
    };

    useEffect(() => {
        if (status === 'processing' && taskId) {
            const interval = setInterval(async () => {
                try {
                    const res = await api.getAnalysisStatus(taskId);
                    if (res.status === 'completed') {
                        setResult(res.result);
                        setStatus('completed');
                        clearInterval(interval);
                    } else if (res.status === 'failed') {
                        setStatus('failed');
                        clearInterval(interval);
                    } else {
                        setProgress(res.progress);
                    }
                } catch (e) {
                    console.error(e);
                }
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [status, taskId]);

    const handleExport = () => {
        if (!result) return;
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(result, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `analysis_${camera?.id}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    const videoUrl = camera ? `http://localhost:8000/videos/${camera.source.split('\\').pop()?.split('/').pop()}` : undefined;

    return (
        <div className="p-6 h-full flex flex-col gap-6 overflow-y-auto">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-2">Video Analysis Workflow</h1>
                    <p className="text-slate-400">Upload video for automated worker safety detection</p>
                </div>
            </header>

            {!camera && (
                <div className="max-w-2xl mx-auto w-full mt-10">
                    <VideoUpload onUploadComplete={handleUploadComplete} />
                </div>
            )}

            {camera && status === 'processing' && (
                <div className="max-w-2xl mx-auto w-full mt-10 text-center">
                    <Loader2 className="animate-spin text-emerald-500 mx-auto mb-4" size={48} />
                    <h2 className="text-xl font-bold text-white mb-2">Processing Video...</h2>
                    <div className="w-full bg-slate-800 rounded-full h-4 overflow-hidden">
                        <div className="bg-emerald-500 h-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                    </div>
                    <p className="text-slate-400 mt-2">{progress}% Complete</p>
                </div>
            )}

            {status === 'completed' && result && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
                    <div className="lg:col-span-2 flex flex-col gap-4">
                        <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden aspect-video">
                            <VideoPlayer 
                                videoUrl={videoUrl}
                                metadata={result}
                            />
                        </div>
                        <div className="flex justify-between items-center bg-slate-900/50 p-4 rounded-lg border border-slate-800">
                             <div className="flex gap-4">
                                <div className="text-sm">
                                    <span className="text-slate-400">Total Frames:</span>
                                    <span className="ml-2 text-white font-mono">{result.metadata.total_frames}</span>
                                </div>
                                <div className="text-sm">
                                    <span className="text-slate-400">Duration:</span>
                                    <span className="ml-2 text-white font-mono">{result.metadata.duration.toFixed(1)}s</span>
                                </div>
                             </div>
                             <button 
                                onClick={handleExport}
                                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors"
                             >
                                <Download size={16} />
                                Export Report
                             </button>
                        </div>
                    </div>
                    
                    <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 h-fit">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <CheckCircle size={20} className="text-emerald-500" />
                            Analysis Complete
                        </h3>
                        <div className="space-y-4">
                             <div className="p-3 bg-slate-800/50 rounded border border-slate-700">
                                <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Detection Model</div>
                                <div className="text-white font-medium">YOLOv8n-Worker-Safety</div>
                             </div>
                             <div className="p-3 bg-slate-800/50 rounded border border-slate-700">
                                <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Classes Detected</div>
                                <div className="flex gap-2 flex-wrap">
                                    <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-xs rounded border border-emerald-500/20">Person</span>
                                    <span className="px-2 py-1 bg-amber-500/10 text-amber-400 text-xs rounded border border-amber-500/20">PPE (Simulated)</span>
                                </div>
                             </div>
                             
                             <div className="mt-8">
                                <button 
                                    onClick={() => { setCamera(null); setStatus('idle'); setResult(null); }}
                                    className="w-full py-2 border border-slate-600 text-slate-300 hover:text-white hover:border-slate-500 rounded transition-colors"
                                >
                                    Process Another Video
                                </button>
                             </div>
                        </div>
                    </div>
                </div>
            )}
            
             {status === 'failed' && (
                <div className="text-center mt-10 text-red-500">
                    <p>Analysis failed. Please try again.</p>
                    <button 
                        onClick={() => { setCamera(null); setStatus('idle'); }}
                        className="mt-4 px-4 py-2 bg-slate-800 text-white rounded hover:bg-slate-700"
                    >
                        Try Again
                    </button>
                </div>
            )}
        </div>
    );
};

export default VideoAnalysis;
