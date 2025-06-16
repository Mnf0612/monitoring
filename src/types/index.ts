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