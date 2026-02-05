import React, { useState, useEffect } from 'react';
import { Camera, Plus, Upload, Play, Monitor, Video, Smartphone, Trash2, X, AlertTriangle, FileVideo, Radio } from 'lucide-react';
import { api, Camera as CameraType } from '../api';

interface CameraPanelProps {
    activeCameraId: string | null;
    onCameraSelect: (camera: CameraType | null) => void;
}

const CameraPanel: React.FC<CameraPanelProps> = ({ activeCameraId, onCameraSelect }) => {
    const [cameras, setCameras] = useState<CameraType[]>([]);
    const [addMode, setAddMode] = useState<'none' | 'stream' | 'upload'>('none');
    const [newCamera, setNewCamera] = useState<Partial<CameraType>>({ name: '', source: '', type: 'usb' });
    const [uploading, setUploading] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<CameraType | null>(null);

    useEffect(() => {
        loadCameras();
    }, []);

    const loadCameras = async () => {
        try {
            const data = await api.getCameras();
            setCameras(data);
        } catch (e) {
            console.error("Failed to load cameras", e);
        }
    };

    const handleAddCamera = async () => {
        if (!newCamera.name || !newCamera.source) return;
        try {
            const added = await api.addCamera({
                id: `cam_${Date.now()}`,
                name: newCamera.name,
                source: newCamera.source,
                type: newCamera.type as any
            });
            setCameras([...cameras, added]);
            setAddMode('none');
            setNewCamera({ name: '', source: '', type: 'usb' });
        } catch (e) {
            console.error("Failed to add camera", e);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;
        setUploading(true);
        try {
            const camera = await api.uploadVideo(e.target.files[0]);
            setCameras([...cameras, camera]);
            setAddMode('none');
        } catch (e) {
            console.error("Failed to upload video", e);
        } finally {
            setUploading(false);
        }
    };

    const handleSelect = async (camera: CameraType) => {
        try {
            await api.selectCamera(camera.id);
            onCameraSelect(camera);
        } catch (e) {
            console.error("Failed to select camera", e);
        }
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        try {
            await api.deleteCamera(deleteTarget.id);
            setCameras(cameras.filter(c => c.id !== deleteTarget.id));
            if (activeCameraId === deleteTarget.id) {
                onCameraSelect(null);
            }
            setDeleteTarget(null);
        } catch (e) {
            console.error("Failed to delete camera", e);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'rtsp': return <Monitor size={14} />;
            case 'http': return <Smartphone size={14} />;
            case 'file': return <Play size={14} />;
            default: return <Video size={14} />;
        }
    };

    return (
        <div className="bg-sentinel-panel p-4 rounded border border-sentinel-border mb-4 relative">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Camera className="w-4 h-4 text-amber-500" /> Camera Feeds
                </h3>
                {addMode === 'none' && (
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setAddMode('upload')}
                            className="p-1.5 rounded bg-slate-800 border border-slate-600 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1 text-[10px]"
                            title="Upload Video"
                        >
                            <Upload size={14} />
                        </button>
                        <button 
                            onClick={() => setAddMode('stream')}
                            className="p-1.5 rounded bg-slate-800 border border-slate-600 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1 text-[10px]"
                            title="Add Camera Stream"
                        >
                            <Plus size={14} />
                        </button>
                    </div>
                )}
            </div>

            {/* Add Stream Interface */}
            {addMode === 'stream' && (
                <div className="mb-4 p-3 bg-slate-900/50 rounded border border-slate-700 flex flex-col gap-2 animate-in fade-in slide-in-from-top-2">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                            <Radio size={12} /> Add Live Stream
                        </span>
                        <button onClick={() => setAddMode('none')} className="text-slate-500 hover:text-white">
                            <X size={14} />
                        </button>
                    </div>
                    <input 
                        placeholder="Camera Name (e.g., Front Gate)" 
                        className="bg-slate-800 border border-slate-600 rounded px-2 py-1 text-xs text-white placeholder-slate-500 focus:border-emerald-500 outline-none"
                        value={newCamera.name}
                        onChange={e => setNewCamera({...newCamera, name: e.target.value})}
                    />
                    <div className="flex gap-2">
                        <select 
                            className="bg-slate-800 border border-slate-600 rounded px-2 py-1 text-xs text-white focus:border-emerald-500 outline-none"
                            value={newCamera.type}
                            onChange={e => setNewCamera({...newCamera, type: e.target.value as any})}
                        >
                            <option value="usb">USB Webcam</option>
                            <option value="rtsp">RTSP Stream</option>
                            <option value="http">HTTP Stream</option>
                        </select>
                        <input 
                            placeholder="Source (URL or Device ID)" 
                            className="flex-1 bg-slate-800 border border-slate-600 rounded px-2 py-1 text-xs text-white placeholder-slate-500 focus:border-emerald-500 outline-none"
                            value={newCamera.source}
                            onChange={e => setNewCamera({...newCamera, source: e.target.value})}
                        />
                    </div>
                    <button 
                        onClick={handleAddCamera}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs py-1.5 rounded transition-colors font-medium mt-1"
                    >
                        Connect Camera
                    </button>
                </div>
            )}

            {/* Upload Interface */}
            {addMode === 'upload' && (
                <div className="mb-4 p-3 bg-slate-900/50 rounded border border-slate-700 flex flex-col gap-2 animate-in fade-in slide-in-from-top-2">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-semibold text-blue-400 flex items-center gap-1">
                            <FileVideo size={12} /> Upload Video File
                        </span>
                        <button onClick={() => setAddMode('none')} className="text-slate-500 hover:text-white">
                            <X size={14} />
                        </button>
                    </div>
                    <div className="border-2 border-dashed border-slate-700 rounded-lg p-4 text-center hover:bg-slate-800/50 transition-colors relative">
                        <input 
                            type="file" 
                            accept="video/*" 
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" 
                            onChange={handleFileUpload}
                            disabled={uploading}
                        />
                        <div className="flex flex-col items-center gap-1 pointer-events-none">
                            <Upload className={`w-6 h-6 ${uploading ? 'text-slate-500 animate-bounce' : 'text-blue-500'}`} />
                            <span className="text-xs text-slate-400">
                                {uploading ? 'Uploading...' : 'Click or Drag Video Here'}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-1">
                {cameras.map(cam => (
                    <div 
                        key={cam.id} 
                        className={`group flex items-center gap-3 p-2 rounded border transition-all relative ${
                            activeCameraId === cam.id 
                            ? 'bg-amber-500/10 border-amber-500/50 text-white' 
                            : 'bg-slate-800/50 border-transparent hover:bg-slate-800 text-slate-400'
                        }`}
                    >
                        <div 
                            className="flex-1 flex items-center gap-3 cursor-pointer min-w-0"
                            onClick={() => handleSelect(cam)}
                        >
                            <div className={`w-2 h-2 rounded-full ${activeCameraId === cam.id ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'bg-slate-600'}`}></div>
                            <div className="flex-1 min-w-0">
                                <div className="text-xs font-medium truncate">{cam.name}</div>
                                <div className="text-[10px] opacity-60 flex items-center gap-1">
                                    {getIcon(cam.type)} {cam.type.toUpperCase()}
                                </div>
                            </div>
                        </div>
                        
                        <button 
                            onClick={(e) => { e.stopPropagation(); setDeleteTarget(cam); }}
                            className="p-1.5 rounded hover:bg-red-500/20 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                            title="Remove Camera"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                ))}
                
                {cameras.length === 0 && (
                    <div className="text-center py-8 text-slate-600 text-xs italic">
                        No cameras connected
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 w-full max-w-sm shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
                        <div className="flex items-start gap-4 mb-4">
                            <div className="p-3 bg-red-500/10 rounded-full">
                                <AlertTriangle className="w-6 h-6 text-red-500" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white mb-1">Remove Camera?</h3>
                                <p className="text-sm text-slate-400">
                                    Are you sure you want to remove <span className="text-white font-medium">"{deleteTarget.name}"</span>?
                                    {deleteTarget.type === 'file' && " This will permanently delete the uploaded video file."}
                                </p>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3">
                            <button 
                                onClick={() => setDeleteTarget(null)}
                                className="px-4 py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={confirmDelete}
                                className="px-4 py-2 rounded bg-red-600 hover:bg-red-500 text-white text-xs font-medium transition-colors shadow-lg shadow-red-900/20"
                            >
                                Yes, Remove
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CameraPanel;