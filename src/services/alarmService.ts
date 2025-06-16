import { Alarm, Site, DashboardStats } from '../types';
import { ticketService } from './ticketService';

class AlarmService {
  private alarms: Alarm[] = [
    {
      id: '1',
      site: 'BTS-YDE-001',
      type: 'power',
      severity: 'critical',
      message: 'Panne d\'alimentation principale',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      status: 'active',
      region: 'Centre'
    },
    {
      id: '2',
      site: 'BTS-DLA-002',
      type: 'ip',
      severity: 'major',
      message: 'Connectivité IP interrompue',
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      status: 'active',
      region: 'Littoral'
    },
    {
      id: '3',
      site: 'BTS-BMD-003',
      type: 'transmission',
      severity: 'minor',
      message: 'Signal de transmission faible',
      timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      status: 'acknowledged',
      region: 'Adamaoua'
    },
    {
      id: '4',
      site: 'BTS-NGD-004',
      type: 'bss',
      severity: 'warning',
      message: 'Charge CPU élevée sur BSC',
      timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
      status: 'active',
      region: 'Sud'
    }
  ];

  private sites: Site[] = [
    {
      id: '1',
      name: 'BTS-YDE-001',
      region: 'Centre',
      status: 'offline',
      coordinates: [3.848, 11.502],
      lastUpdate: new Date().toISOString()
    },
    {
      id: '2',
      name: 'BTS-DLA-002',
      region: 'Littoral',
      status: 'offline',
      coordinates: [4.061, 9.767],
      lastUpdate: new Date().toISOString()
    },
    {
      id: '3',
      name: 'BTS-BMD-003',
      region: 'Adamaoua',
      status: 'maintenance',
      coordinates: [6.5, 12.5],
      lastUpdate: new Date().toISOString()
    },
    {
      id: '4',
      name: 'BTS-NGD-004',
      region: 'Sud',
      status: 'online',
      coordinates: [2.9, 10.7],
      lastUpdate: new Date().toISOString()
    }
  ];

  constructor() {
    // Auto-create tickets for existing alarms
    this.initializeTickets();
  }

  private async initializeTickets() {
    for (const alarm of this.alarms.filter(a => a.status === 'active')) {
      await ticketService.createTicketFromAlarm(alarm);
    }
  }

  getAlarms(): Alarm[] {
    return this.alarms;
  }

  getAlarmsByRegion(region: string): Alarm[] {
    return this.alarms.filter(alarm => alarm.region === region);
  }

  getAlarmsBySeverity(severity: string): Alarm[] {
    return this.alarms.filter(alarm => alarm.severity === severity);
  }

  getSites(): Site[] {
    return this.sites;
  }

  getSitesByRegion(region: string): Site[] {
    return this.sites.filter(site => site.region === region);
  }

  async createAlarm(alarmData: Omit<Alarm, 'id' | 'timestamp'>): Promise<Alarm> {
    const alarm: Alarm = {
      ...alarmData,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    };

    this.alarms.push(alarm);

    // Auto-create ticket for new alarm
    if (alarm.status === 'active') {
      await ticketService.createTicketFromAlarm(alarm);
    }

    return alarm;
  }

  updateAlarmStatus(id: string, status: Alarm['status']): Alarm | null {
    const alarm = this.alarms.find(a => a.id === id);
    if (alarm) {
      alarm.status = status;
    }
    return alarm || null;
  }

  getDashboardStats(): DashboardStats {
    const ticketStats = ticketService.getTicketStats();
    
    return {
      totalSites: this.sites.length,
      activeSites: this.sites.filter(s => s.status === 'online').length,
      totalAlarms: this.alarms.length,
      criticalAlarms: this.alarms.filter(a => a.severity === 'critical').length,
      openTickets: ticketStats.open,
      resolvedTickets: ticketStats.resolved
    };
  }

  getRegions(): string[] {
    return [...new Set(this.sites.map(site => site.region))];
  }
}

export const alarmService = new AlarmService();