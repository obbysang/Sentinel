
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
    };
}

export const ZONES = [
  { name: 'Safe', color: 'rgba(16, 185, 129, 0.1)', border: '#10b981', x: 0, y: 0, w: 100, h: 100 },
  { name: 'Loading Dock', color: 'rgba(245, 158, 11, 0.15)', border: '#f59e0b', x: 60, y: 10, w: 35, h: 40 },
  { name: 'Excavation Pit', color: 'rgba(239, 68, 68, 0.15)', border: '#ef4444', x: 5, y: 50, w: 40, h: 40 },
];
