import React, { useState, useEffect } from 'react';
import { Camera, Plus, Upload, Play, Monitor, Video, Smartphone } from 'lucide-react';
import { api, Camera as CameraType } from '../api';

interface CameraPanelProps {
    activeCameraId: string | null;
    onCameraSelect: (camera: CameraType) => void;
}

const CameraPanel: React.FC<CameraPanelProps> = ({ activeCameraId, onCameraSelect }) => {
    const [cameras, setCameras] = useState<CameraType[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [newCamera, setNewCamera] = useState<Partial<CameraType>>({ name: '', source: '', type: 'usb' });
    const [uploading, setUploading] = useState(false);

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
            setIsAdding(false);
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

    const getIcon = (type: string) => {
        switch (type) {
            case 'rtsp': return <Monitor size={14} />;
            case 'http': return <Smartphone size={14} />;
            case 'file': return <Play size={14} />;
            default: return <Video size={14} />;
        }
    };

    return (
        <div className="bg-sentinel-panel p-4 rounded border border-sentinel-border mb-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Camera className="w-4 h-4 text-amber-500" /> Camera Feeds
                </h3>
                <div className="flex gap-2">
                    <label className={`cursor-pointer p-1.5 rounded bg-slate-800 border border-slate-600 hover:bg-slate-700 text-slate-300 transition-colors ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                        <Upload size={14} />
                        <input type="file" accept="video/*" className="hidden" onChange={handleFileUpload} />
                    </label>
                    <button 
                        onClick={() => setIsAdding(!isAdding)}
                        className="p-1.5 rounded bg-slate-800 border border-slate-600 hover:bg-slate-700 text-slate-300 transition-colors"
                    >
                        <Plus size={14} />
                    </button>
                </div>
            </div>

            {isAdding && (
                <div className="mb-4 p-3 bg-slate-900/50 rounded border border-slate-700 flex flex-col gap-2 animate-in fade-in slide-in-from-top-2">
                    <input 
                        placeholder="Camera Name" 
                        className="bg-slate-800 border border-slate-600 rounded px-2 py-1 text-xs text-white placeholder-slate-500"
                        value={newCamera.name}
                        onChange={e => setNewCamera({...newCamera, name: e.target.value})}
                    />
                    <div className="flex gap-2">
                        <select 
                            className="bg-slate-800 border border-slate-600 rounded px-2 py-1 text-xs text-white"
                            value={newCamera.type}
                            onChange={e => setNewCamera({...newCamera, type: e.target.value as any})}
                        >
                            <option value="usb">USB Webcam</option>
                            <option value="rtsp">RTSP Stream</option>
                            <option value="http">HTTP Stream</option>
                        </select>
                        <input 
                            placeholder="Source (URL or ID)" 
                            className="flex-1 bg-slate-800 border border-slate-600 rounded px-2 py-1 text-xs text-white placeholder-slate-500"
                            value={newCamera.source}
                            onChange={e => setNewCamera({...newCamera, source: e.target.value})}
                        />
                    </div>
                    <button 
                        onClick={handleAddCamera}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs py-1 rounded transition-colors"
                    >
                        Add Camera
                    </button>
                </div>
            )}

            <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-1">
                {cameras.map(cam => (
                    <div 
                        key={cam.id} 
                        onClick={() => handleSelect(cam)}
                        className={`flex items-center gap-3 p-2 rounded cursor-pointer border transition-all ${
                            activeCameraId === cam.id 
                            ? 'bg-amber-500/10 border-amber-500/50 text-white' 
                            : 'bg-slate-800/50 border-transparent hover:bg-slate-800 text-slate-400'
                        }`}
                    >
                        <div className={`w-2 h-2 rounded-full ${activeCameraId === cam.id ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'bg-slate-600'}`}></div>
                        <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium truncate">{cam.name}</div>
                            <div className="text-[10px] opacity-60 flex items-center gap-1">
                                {getIcon(cam.type)} {cam.type.toUpperCase()}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CameraPanel;
