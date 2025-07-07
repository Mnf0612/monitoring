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

    // Distribution variable des sites par région (total: 1000 sites)
    const regionSiteDistribution = {
      'Centre': 150,        // Région capitale - plus de sites
      'Littoral': 120,      // Région économique - beaucoup de sites
      'Ouest': 110,         // Région densément peuplée
      'Nord': 100,          // Grande région
      'Extrême-Nord': 95,   // Grande région
      'Sud': 90,            // Région forestière
      'Est': 85,            // Grande région peu peuplée
      'Adamaoua': 80,       // Région de transition
      'Nord-Ouest': 85,     // Région montagneuse
      'Sud-Ouest': 85       // Région côtière
    };

    // Créer les sites avec distribution variable
    cameroonRegions.forEach((region, regionIndex) => {
      const siteCount = regionSiteDistribution[region as keyof typeof regionSiteDistribution];
      
      for (let i = 1; i <= siteCount; i++) {
        const siteId = `${regionIndex + 1}${i.toString().padStart(3, '0')}`;
        const site: Site = {
          id: siteId,
          name: `BTS-${region.substring(0, 3).toUpperCase()}-${siteId}`,
          region,
          status: Math.random() > 0.85 ? 'offline' : Math.random() > 0.95 ? 'maintenance' : 'online',
          coordinates: [
            3 + Math.random() * 8, // Longitude approximative du Cameroun
            9 + Math.random() * 4   // Latitude approximative du Cameroun
          ],
          lastUpdate: new Date().toISOString()
        };
        this.sites.push(site);
      }
    });

    console.log(`🏗️ ${this.sites.length} sites BTS initialisés dans ${cameroonRegions.length} régions`);
    
    // Afficher la distribution par région
    cameroonRegions.forEach(region => {
      const count = this.sites.filter(s => s.region === region).length;
      console.log(`📍 ${region}: ${count} sites`);
    });
  }

  private initializeAlarms() {
    // Créer plus d'alarmes initiales pour avoir un Top 10 complet
    const initialAlarms = [
      {
        site: 'BTS-CEN-1001',
        type: 'power' as const,
        severity: 'critical' as const,
        message: 'Panne d\'alimentation principale - Générateur en panne',
        region: 'Centre'
      },
      {
        site: 'BTS-LIT-1001',
        type: 'ip' as const,
        severity: 'major' as const,
        message: 'Connectivité IP interrompue - Routeur principal défaillant',
        region: 'Littoral'
      },
      {
        site: 'BTS-ADA-1001',
        type: 'transmission' as const,
        severity: 'minor' as const,
        message: 'Signal de transmission faible - Antenne mal orientée',
        region: 'Adamaoua'
      },
      {
        site: 'BTS-SUD-1001',
        type: 'bss' as const,
        severity: 'warning' as const,
        message: 'Charge CPU élevée sur BSC - Optimisation requise',
        region: 'Sud'
      },
      {
        site: 'BTS-NOR-1001',
        type: 'hardware' as const,
        severity: 'major' as const,
        message: 'Ventilateur défaillant - Risque de surchauffe',
        region: 'Nord'
      },
      // Ajouter plus d'alarmes pour différents sites
      {
        site: 'BTS-CEN-1002',
        type: 'power' as const,
        severity: 'critical' as const,
        message: 'Batterie de secours défaillante',
        region: 'Centre'
      },
      {
        site: 'BTS-CEN-1003',
        type: 'ip' as const,
        severity: 'major' as const,
        message: 'Latence réseau élevée détectée',
        region: 'Centre'
      },
      {
        site: 'BTS-LIT-1002',
        type: 'transmission' as const,
        severity: 'major' as const,
        message: 'Interférence radio détectée',
        region: 'Littoral'
      },
      {
        site: 'BTS-LIT-1003',
        type: 'hardware' as const,
        severity: 'critical' as const,
        message: 'Processeur surchauffé',
        region: 'Littoral'
      },
      {
        site: 'BTS-OUE-1001',
        type: 'power' as const,
        severity: 'major' as const,
        message: 'Onduleur défaillant',
        region: 'Ouest'
      },
      {
        site: 'BTS-OUE-1002',
        type: 'bss' as const,
        severity: 'minor' as const,
        message: 'Mémoire BSC saturée',
        region: 'Ouest'
      },
      {
        site: 'BTS-EST-1001',
        type: 'security' as const,
        severity: 'warning' as const,
        message: 'Certificat SSL expiré',
        region: 'Est'
      },
      {
        site: 'BTS-ENO-1001',
        type: 'transmission' as const,
        severity: 'major' as const,
        message: 'Câble coaxial endommagé',
        region: 'Extrême-Nord'
      },
      {
        site: 'BTS-NOO-1001',
        type: 'ip' as const,
        severity: 'critical' as const,
        message: 'Interface réseau down',
        region: 'Nord-Ouest'
      },
      {
        site: 'BTS-SUO-1001',
        type: 'hardware' as const,
        severity: 'major' as const,
        message: 'Disque dur plein',
        region: 'Sud-Ouest'
      },
      // Ajouter encore plus d'alarmes pour avoir un Top 10 complet
      {
        site: 'BTS-CEN-1004',
        type: 'power' as const,
        severity: 'minor' as const,
        message: 'Surtension détectée',
        region: 'Centre'
      },
      {
        site: 'BTS-CEN-1005',
        type: 'transmission' as const,
        severity: 'warning' as const,
        message: 'Qualité signal dégradée',
        region: 'Centre'
      },
      {
        site: 'BTS-LIT-1004',
        type: 'bss' as const,
        severity: 'major' as const,
        message: 'Processus BSC bloqué',
        region: 'Littoral'
      },
      {
        site: 'BTS-OUE-1003',
        type: 'ip' as const,
        severity: 'minor' as const,
        message: 'Perte de paquets importante',
        region: 'Ouest'
      },
      {
        site: 'BTS-NOR-1002',
        type: 'security' as const,
        severity: 'critical' as const,
        message: 'Tentative d\'intrusion détectée',
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
    // Générer une nouvelle alarme plus fréquemment (toutes les 1-3 minutes)
    this.alarmGenerationInterval = setInterval(() => {
      this.generateRandomAlarm();
    }, Math.random() * 120000 + 60000); // 1-3 minutes
  }

  private startAlarmResolution() {
    // Résoudre automatiquement certaines alarmes toutes les 5-10 minutes
    this.alarmResolutionInterval = setInterval(() => {
      this.autoResolveAlarms();
    }, Math.random() * 300000 + 300000); // 5-10 minutes
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

    // Résoudre moins d'alarmes pour maintenir un niveau élevé
    const alarmsToResolve = Math.min(1, Math.floor(Math.random() * activeAlarms.length) + 1);
    
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

  // Méthode améliorée pour obtenir le top des sites les plus impactés
  getTopImpactedSites(): { site: string; alarmCount: number; region: string }[] {
    const siteAlarmCounts = new Map<string, { count: number; region: string }>();
    
    // Compter toutes les alarmes (actives et résolues) pour avoir plus de données
    this.alarms.forEach(alarm => {
      const current = siteAlarmCounts.get(alarm.site) || { count: 0, region: alarm.region };
      siteAlarmCounts.set(alarm.site, { count: current.count + 1, region: alarm.region });
    });

    return Array.from(siteAlarmCounts.entries())
      .map(([site, data]) => ({ site, alarmCount: data.count, region: data.region }))
      .sort((a, b) => b.alarmCount - a.alarmCount)
      .slice(0, 15); // Augmenter à 15 pour avoir plus de sites dans le top
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