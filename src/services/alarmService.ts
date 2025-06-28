import { Alarm, Site, DashboardStats } from '../types';
import { ticketService } from './ticketService';

class AlarmService {
  private alarms: Alarm[] = [];
  private sites: Site[] = [];
  private alarmGenerationInterval: NodeJS.Timeout | null = null;
  private alarmResolutionInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeSites();
    this.initializeAlarms();
    this.startAlarmGeneration();
    this.startAlarmResolution();
  }

  private initializeSites() {
    const cameroonRegions = [
      'Adamaoua', 'Centre', 'Est', 'Extrême-Nord', 'Littoral',
      'Nord', 'Nord-Ouest', 'Ouest', 'Sud', 'Sud-Ouest'
    ];

    // Créer 5 sites par région (50 sites au total)
    cameroonRegions.forEach((region, regionIndex) => {
      for (let i = 1; i <= 5; i++) {
        const siteId = `${regionIndex + 1}${i.toString().padStart(2, '0')}`;
        const site: Site = {
          id: siteId,
          name: `BTS-${region.substring(0, 3).toUpperCase()}-${siteId}`,
          region,
          status: Math.random() > 0.8 ? 'offline' : Math.random() > 0.9 ? 'maintenance' : 'online',
          coordinates: [
            3 + Math.random() * 8, // Longitude approximative du Cameroun
            9 + Math.random() * 4   // Latitude approximative du Cameroun
          ],
          lastUpdate: new Date().toISOString()
        };
        this.sites.push(site);
      }
    });
  }

  private initializeAlarms() {
    // Créer quelques alarmes initiales
    const initialAlarms = [
      {
        site: 'BTS-CEN-101',
        type: 'power' as const,
        severity: 'critical' as const,
        message: 'Panne d\'alimentation principale - Générateur en panne',
        region: 'Centre'
      },
      {
        site: 'BTS-LIT-201',
        type: 'ip' as const,
        severity: 'major' as const,
        message: 'Connectivité IP interrompue - Routeur principal défaillant',
        region: 'Littoral'
      },
      {
        site: 'BTS-ADA-301',
        type: 'transmission' as const,
        severity: 'minor' as const,
        message: 'Signal de transmission faible - Antenne mal orientée',
        region: 'Adamaoua'
      },
      {
        site: 'BTS-SUD-401',
        type: 'bss' as const,
        severity: 'warning' as const,
        message: 'Charge CPU élevée sur BSC - Optimisation requise',
        region: 'Sud'
      },
      {
        site: 'BTS-NOR-501',
        type: 'hardware' as const,
        severity: 'major' as const,
        message: 'Ventilateur défaillant - Risque de surchauffe',
        region: 'Nord'
      }
    ];

    initialAlarms.forEach((alarmData, index) => {
      const alarm: Alarm = {
        id: (index + 1).toString(),
        ...alarmData,
        timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
        status: 'active'
      };
      this.alarms.push(alarm);
    });

    // Auto-créer les tickets pour les alarmes initiales
    this.initializeTickets();
  }

  private async initializeTickets() {
    for (const alarm of this.alarms.filter(a => a.status === 'active')) {
      await ticketService.createTicketFromAlarm(alarm);
    }
  }

  private startAlarmGeneration() {
    // Générer une nouvelle alarme toutes les 2-5 minutes
    this.alarmGenerationInterval = setInterval(() => {
      this.generateRandomAlarm();
    }, Math.random() * 180000 + 120000); // 2-5 minutes
  }

  private startAlarmResolution() {
    // Résoudre automatiquement certaines alarmes toutes les 3-8 minutes
    this.alarmResolutionInterval = setInterval(() => {
      this.autoResolveAlarms();
    }, Math.random() * 300000 + 180000); // 3-8 minutes
  }

  private async generateRandomAlarm() {
    const alarmTypes = ['power', 'ip', 'transmission', 'bss', 'hardware', 'security'] as const;
    const severities = ['critical', 'major', 'minor', 'warning'] as const;
    
    const alarmMessages = {
      power: [
        'Panne d\'alimentation principale',
        'Batterie de secours faible',
        'Générateur en panne',
        'Surtension détectée',
        'Coupure électrique prolongée',
        'Onduleur défaillant',
        'Court-circuit détecté'
      ],
      ip: [
        'Connectivité IP interrompue',
        'Latence réseau élevée',
        'Perte de paquets importante',
        'Routeur principal défaillant',
        'Interface réseau down',
        'DNS non résolu',
        'Timeout de connexion'
      ],
      transmission: [
        'Signal de transmission faible',
        'Interférence radio détectée',
        'Antenne mal orientée',
        'Câble coaxial endommagé',
        'Amplificateur défaillant',
        'Fréquence perturbée',
        'Qualité signal dégradée'
      ],
      bss: [
        'Charge CPU élevée sur BSC',
        'Mémoire BSC saturée',
        'Erreur de synchronisation',
        'Base de données corrompue',
        'Processus BSC bloqué',
        'Overflow de trafic',
        'Configuration BSC invalide'
      ],
      hardware: [
        'Ventilateur défaillant',
        'Température élevée',
        'Disque dur plein',
        'RAM défectueuse',
        'Carte réseau HS',
        'Processeur surchauffé',
        'Alimentation instable'
      ],
      security: [
        'Tentative d\'intrusion détectée',
        'Accès non autorisé',
        'Certificat SSL expiré',
        'Authentification échouée',
        'Firewall compromis',
        'Malware détecté',
        'Violation de politique'
      ]
    };

    const randomSite = this.sites[Math.floor(Math.random() * this.sites.length)];
    const randomType = alarmTypes[Math.floor(Math.random() * alarmTypes.length)];
    const randomSeverity = severities[Math.floor(Math.random() * severities.length)];
    const randomMessage = alarmMessages[randomType][Math.floor(Math.random() * alarmMessages[randomType].length)];

    const alarm: Alarm = {
      id: Date.now().toString(),
      site: randomSite.name,
      type: randomType,
      severity: randomSeverity,
      message: randomMessage,
      timestamp: new Date().toISOString(),
      status: 'active',
      region: randomSite.region
    };

    this.alarms.push(alarm);
    console.log(`🚨 Nouvelle alarme générée: ${alarm.site} - ${alarm.message}`);

    // Créer automatiquement un ticket avec envoi d'email automatique
    await ticketService.createTicketFromAlarm(alarm);
  }

  private autoResolveAlarms() {
    const activeAlarms = this.alarms.filter(a => a.status === 'active');
    
    if (activeAlarms.length === 0) return;

    // Résoudre 1-2 alarmes aléatoirement
    const alarmsToResolve = Math.min(2, Math.floor(Math.random() * activeAlarms.length) + 1);
    
    for (let i = 0; i < alarmsToResolve; i++) {
      const randomAlarm = activeAlarms[Math.floor(Math.random() * activeAlarms.length)];
      if (randomAlarm && randomAlarm.status === 'active') {
        randomAlarm.status = 'resolved';
        console.log(`✅ Alarme auto-résolue: ${randomAlarm.site} - ${randomAlarm.message}`);
        
        // Mettre à jour le site correspondant
        const site = this.sites.find(s => s.name === randomAlarm.site);
        if (site && site.status === 'offline') {
          site.status = 'online';
          site.lastUpdate = new Date().toISOString();
        }
      }
    }
  }

  getAlarms(): Alarm[] {
    return this.alarms.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  getAlarmsByRegion(region: string): Alarm[] {
    return this.alarms
      .filter(alarm => alarm.region === region)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
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

    // Auto-créer ticket pour nouvelle alarme avec envoi d'email automatique
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
      criticalAlarms: this.alarms.filter(a => a.severity === 'critical' && a.status === 'active').length,
      openTickets: ticketStats.open,
      resolvedTickets: ticketStats.resolved
    };
  }

  getRegions(): string[] {
    return [...new Set(this.sites.map(site => site.region))].sort();
  }

  // Méthode pour obtenir le top 10 des sites les plus impactés
  getTopImpactedSites(): { site: string; alarmCount: number; region: string }[] {
    const siteAlarmCounts = new Map<string, { count: number; region: string }>();
    
    this.alarms.forEach(alarm => {
      const current = siteAlarmCounts.get(alarm.site) || { count: 0, region: alarm.region };
      siteAlarmCounts.set(alarm.site, { count: current.count + 1, region: alarm.region });
    });

    return Array.from(siteAlarmCounts.entries())
      .map(([site, data]) => ({ site, alarmCount: data.count, region: data.region }))
      .sort((a, b) => b.alarmCount - a.alarmCount)
      .slice(0, 10);
  }

  // Nettoyer les intervalles lors de la destruction
  destroy() {
    if (this.alarmGenerationInterval) {
      clearInterval(this.alarmGenerationInterval);
    }
    if (this.alarmResolutionInterval) {
      clearInterval(this.alarmResolutionInterval);
    }
  }
}

export const alarmService = new AlarmService();