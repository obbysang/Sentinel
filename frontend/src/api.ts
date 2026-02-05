
export interface Worker {
  id: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  hasHelmet: boolean;
  hasVest: boolean;
  zone: 'Safe' | 'Loading Dock' | 'Excavation Pit';
  status: 'Moving' | 'Stationary' | 'Working';
  lastSeen: string;
}

export interface Incident {
  id: string;
  timestamp: string;
  workerId: string;
  type: 'PPE Violation' | 'Zone Intrusion' | 'Unsafe Posture';
  severity: 'Low' | 'Medium' | 'High';
  confidence: number;
  details: string;
  acknowledged: boolean;
  notes?: { timestamp: string, content: string }[];
}

export interface TimelineEvent {
  id: string;
  workerId: string;
  timestamp: string;
  type: 'Zone Change' | 'Status Change' | 'Violation';
  description: string;
}

export interface SystemState {
    workers: Worker[];
    incidents: Incident[];
    timeline: TimelineEvent[];
    stats: {
        cpu: number;
        latency: number;
        active_workers: number;
        system_status: string;
    };
}

export interface Camera {
    id: string;
    name: string;
    source: string;
    type: 'rtsp' | 'http' | 'usb' | 'file';
}

export const ZONES = [
  { name: 'Safe', color: 'rgba(16, 185, 129, 0.1)', border: '#10b981', x: 0, y: 0, w: 100, h: 100 },
  { name: 'Loading Dock', color: 'rgba(245, 158, 11, 0.15)', border: '#f59e0b', x: 60, y: 10, w: 35, h: 40 },
  { name: 'Excavation Pit', color: 'rgba(239, 68, 68, 0.15)', border: '#ef4444', x: 5, y: 50, w: 40, h: 40 },
];

const API_URL = 'http://localhost:8000';

export const api = {
    getCameras: async (): Promise<Camera[]> => {
        const res = await fetch(`${API_URL}/cameras`);
        return res.json();
    },
    addCamera: async (camera: Camera): Promise<Camera> => {
        const res = await fetch(`${API_URL}/cameras`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(camera)
        });
        return res.json();
    },
    selectCamera: async (cameraId: string) => {
        const res = await fetch(`${API_URL}/cameras/${cameraId}/select`, { method: 'POST' });
        return res.json();
    },
    uploadVideo: async (file: File): Promise<Camera> => {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch(`${API_URL}/upload-video`, {
            method: 'POST',
            body: formData
        });
        return res.json();
    },
    startAnalysis: async () => {
        const res = await fetch(`${API_URL}/analysis/start`, { method: 'POST' });
        return res.json();
    },
    stopAnalysis: async () => {
        const res = await fetch(`${API_URL}/analysis/stop`, { method: 'POST' });
        return res.json();
    },
    getIncidents: async (): Promise<Incident[]> => {
        const res = await fetch(`${API_URL}/incidents`);
        return res.json();
    },
    deleteIncident: async (id: string) => {
        const res = await fetch(`${API_URL}/incidents/${id}`, { method: 'DELETE' });
        return res.json();
    },
    resolveIncident: async (id: string) => {
        const res = await fetch(`${API_URL}/incidents/${id}/resolve`, { method: 'POST' });
        return res.json();
    },
    addNote: async (id: string, note: string) => {
        const res = await fetch(`${API_URL}/incidents/${id}/notes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ note })
        });
        return res.json();
    }
};
