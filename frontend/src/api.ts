
import axios from 'axios';

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

// Axios instance with interceptor for token
export const axiosInstance = axios.create({
    baseURL: API_URL,
});

axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export const api = {
    getCameras: async (): Promise<Camera[]> => {
        const res = await axiosInstance.get('/cameras');
        return res.data;
    },
    addCamera: async (camera: Camera): Promise<Camera> => {
        const res = await axiosInstance.post('/cameras', camera);
        return res.data;
    },
    deleteCamera: async (cameraId: string) => {
        const res = await axiosInstance.delete(`/cameras/${cameraId}`);
        return res.data;
    },
    selectCamera: async (cameraId: string) => {
        const res = await axiosInstance.post(`/cameras/${cameraId}/select`);
        return res.data;
    },
    uploadVideo: async (file: File): Promise<Camera> => {
        const formData = new FormData();
        formData.append('file', file);
        const res = await axiosInstance.post('/upload-video', formData);
        return res.data;
    },
    processVideo: async (cameraId: string) => {
        const res = await axiosInstance.post(`/analysis/process/${cameraId}`);
        return res.data;
    },
    getAnalysisStatus: async (taskId: string) => {
        const res = await axiosInstance.get(`/analysis/status/${taskId}`);
        return res.data;
    },
    startAnalysis: async () => {
        const res = await axiosInstance.post('/analysis/start');
        return res.data;
    },
    stopAnalysis: async () => {
        const res = await axiosInstance.post('/analysis/stop');
        return res.data;
    },
    getIncidents: async (): Promise<Incident[]> => {
        const res = await axiosInstance.get('/incidents');
        return res.data;
    },
    deleteIncident: async (id: string) => {
        const res = await axiosInstance.delete(`/incidents/${id}`);
        return res.data;
    },
    resolveIncident: async (id: string) => {
        const res = await axiosInstance.post(`/incidents/${id}/resolve`);
        return res.data;
    },
    addNote: async (id: string, note: string) => {
        const res = await axiosInstance.post(`/incidents/${id}/notes`, { note });
        return res.data;
    },
    // Auth & Profile API
    login: async (username: string, password: string) => {
        const formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);
        const res = await axiosInstance.post('/token', formData);
        return res.data;
    },
    register: async (username: string, password: string) => {
        const res = await axiosInstance.post('/register', { username, password });
        return res.data;
    },
    getProfile: async () => {
        const res = await axiosInstance.get('/users/me');
        return res.data;
    },
    getGeminiKey: async () => {
        const res = await axiosInstance.get('/users/me/gemini-key');
        return res.data;
    },
    updateGeminiKey: async (key: string, password: string) => {
        const res = await axiosInstance.put('/users/me/gemini-key', { gemini_api_key: key, password });
        return res.data;
    },
    removeGeminiKey: async (password: string) => {
        const res = await axiosInstance.delete('/users/me/gemini-key', { data: { password } });
        return res.data;
    }
};

