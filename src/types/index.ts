export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'operator' | 'technician';
  team?: 'power' | 'ip' | 'transmission' | 'bss';
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
  emailVerified: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface Alarm {
  id: string;
  site: string;
  type: 'power' | 'ip' | 'transmission' | 'bss' | 'hardware' | 'security';
  severity: 'critical' | 'major' | 'minor' | 'warning';
  message: string;
  timestamp: string;
  status: 'active' | 'acknowledged' | 'resolved';
  region: string;
}

export interface Ticket {
  id: string;
  alarmId: string;
  alarm: Alarm;
  owner: string;
  team: 'power' | 'ip' | 'transmission' | 'bss';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  createdAt: string;
  updatedAt: string;
  update?: string;
  resolution?: string;
  priority: 'high' | 'medium' | 'low';
}

export interface Team {
  id: string;
  name: string;
  type: 'power' | 'ip' | 'transmission' | 'bss';
  phone: string;
  members: string[];
}

export interface Site {
  id: string;
  name: string;
  region: string;
  status: 'online' | 'offline' | 'maintenance';
  coordinates: [number, number];
  lastUpdate: string;
}

export interface DashboardStats {
  totalSites: number;
  activeSites: number;
  totalAlarms: number;
  criticalAlarms: number;
  openTickets: number;
  resolvedTickets: number;
}

export interface Outage {
  id: string;
  type: 'power' | 'transmission' | 'network' | 'hardware';
  severity: 'critical' | 'major' | 'minor';
  title: string;
  description: string;
  affectedSites: {
    id: string;
    name: string;
    region: string;
  }[];
  parentSite: string;
  status: 'active' | 'investigating' | 'resolved';
  startTime: string;
  endTime?: string;
  estimatedResolutionTime?: string;
  resolution?: string;
  ticketId?: string;
}