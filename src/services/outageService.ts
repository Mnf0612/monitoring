import { Outage, Site } from '../types';
import { alarmService } from './alarmService';
import { ticketService } from './ticketService';

class OutageService {
  private outages: Outage[] = [];
  private outageDetectionInterval: NodeJS.Timeout | null = null;
  private readonly OUTAGE_THRESHOLD = 5; // Minimum 5 sites down to be considered an outage
  private readonly PARENT_SITE_PATTERN = /^BTS-([A-Z]{3})-(\d{1})(\d{2})$/; // Pattern: BTS-REG-XYZ where X is parent

  constructor() {
    this.startOutageDetection();
    this.generateInitialOutages();
  }

  private startOutageDetection() {
    // Vérifier les pannes toutes les 2 minutes
    this.outageDetectionInterval = setInterval(() => {
      this.detectOutages();
    }, 120000);
  }

  private generateInitialOutages() {
    // Créer quelques pannes initiales pour la démonstration
    const initialOutages = [
      {
        type: 'power' as const,
        severity: 'critical' as const,
        title: 'Panne électrique généralisée',
        description: 'Coupure d\'alimentation affectant plusieurs sites dans la région Centre',
        affectedRegions: ['Centre'],
        parentSite: 'BTS-CEN-101'
      },
      {
        type: 'transmission' as const,
        severity: 'major' as const,
        title: 'Défaillance liaison micro-ondes',
        description: 'Interruption de la liaison principale affectant les sites du Nord',
        affectedRegions: ['Nord'],
        parentSite: 'BTS-NOR-201'
      }
    ];

    initialOutages.forEach((outageData, index) => {
      const sites = alarmService.getSites();
      const affectedSites = sites
        .filter(site => 
          outageData.affectedRegions.includes(site.region) &&
          this.getParentSite(site.name) === outageData.parentSite
        )
        .slice(0, Math.floor(Math.random() * 8) + 5); // 5-12 sites

      if (affectedSites.length >= this.OUTAGE_THRESHOLD) {
        const outage = this.createOutage(
          outageData.type,
          outageData.severity,
          outageData.title,
          outageData.description,
          affectedSites,
          outageData.parentSite
        );
        this.outages.push(outage);
      }
    });
  }

  private detectOutages() {
    const sites = alarmService.getSites();
    const offlineSites = sites.filter(site => site.status === 'offline');
    
    // Grouper les sites hors ligne par site parent
    const sitesByParent = new Map<string, Site[]>();
    
    offlineSites.forEach(site => {
      const parentSite = this.getParentSite(site.name);
      if (parentSite) {
        if (!sitesByParent.has(parentSite)) {
          sitesByParent.set(parentSite, []);
        }
        sitesByParent.get(parentSite)!.push(site);
      }
    });

    // Détecter les nouvelles pannes
    sitesByParent.forEach((sites, parentSite) => {
      if (sites.length >= this.OUTAGE_THRESHOLD) {
        // Vérifier si une panne existe déjà pour ce site parent
        const existingOutage = this.outages.find(outage => 
          outage.parentSite === parentSite && outage.status === 'active'
        );

        if (!existingOutage) {
          // Créer une nouvelle panne
          const outageType = this.determineOutageType();
          const severity = this.determineSeverity(sites.length);
          
          const outage = this.createOutage(
            outageType,
            severity,
            `Panne ${outageType} - Site parent ${parentSite}`,
            `Défaillance affectant ${sites.length} sites dépendants du site parent ${parentSite}`,
            sites,
            parentSite
          );

          this.outages.push(outage);
          console.log(`🚨 NOUVELLE PANNE DÉTECTÉE: ${outage.title} (${sites.length} sites)`);
        }
      }
    });

    // Résoudre automatiquement certaines pannes
    this.autoResolveOutages();
  }

  private getParentSite(siteName: string): string | null {
    const match = siteName.match(this.PARENT_SITE_PATTERN);
    if (match) {
      const [, region, parentId] = match;
      return `BTS-${region}-${parentId}01`; // Le site parent est toujours X01
    }
    return null;
  }

  private determineOutageType(): 'power' | 'transmission' | 'network' | 'hardware' {
    const types = ['power', 'transmission', 'network', 'hardware'] as const;
    return types[Math.floor(Math.random() * types.length)];
  }

  private determineSeverity(affectedSitesCount: number): 'critical' | 'major' | 'minor' {
    if (affectedSitesCount >= 15) return 'critical';
    if (affectedSitesCount >= 10) return 'major';
    return 'minor';
  }

  private async createOutage(
    type: string,
    severity: string,
    title: string,
    description: string,
    affectedSites: Site[],
    parentSite: string
  ): Promise<Outage> {
    const outage: Outage = {
      id: `OUT-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
      type: type as any,
      severity: severity as any,
      title,
      description,
      affectedSites: affectedSites.map(site => ({
        id: site.id,
        name: site.name,
        region: site.region
      })),
      parentSite,
      status: 'active',
      startTime: new Date().toISOString(),
      estimatedResolutionTime: new Date(Date.now() + Math.random() * 4 * 60 * 60 * 1000).toISOString() // 1-4h
    };

    // Créer un ticket unique pour cette panne
    try {
      const fakeAlarm = {
        id: outage.id,
        site: parentSite,
        type: type as any,
        severity: severity as any,
        message: `${title} - ${affectedSites.length} sites impactés`,
        timestamp: outage.startTime,
        status: 'active' as const,
        region: affectedSites[0]?.region || 'Centre'
      };

      const ticket = await ticketService.createTicketFromAlarm(fakeAlarm);
      outage.ticketId = ticket.id;
      
      console.log(`🎫 Ticket créé pour la panne: ${ticket.id}`);
    } catch (error) {
      console.error('❌ Erreur lors de la création du ticket pour la panne:', error);
    }

    return outage;
  }

  private autoResolveOutages() {
    const activeOutages = this.outages.filter(o => o.status === 'active');
    
    // Résoudre aléatoirement 1-2 pannes anciennes
    activeOutages.forEach(outage => {
      const ageMinutes = (Date.now() - new Date(outage.startTime).getTime()) / 60000;
      
      // 10% de chance de résolution après 30 minutes, augmente avec le temps
      const resolutionChance = Math.min(0.8, (ageMinutes - 30) * 0.01);
      
      if (ageMinutes > 30 && Math.random() < resolutionChance) {
        outage.status = 'resolved';
        outage.endTime = new Date().toISOString();
        
        // Remettre les sites en ligne
        outage.affectedSites.forEach(affectedSite => {
          const site = alarmService.getSites().find(s => s.id === affectedSite.id);
          if (site) {
            site.status = 'online';
            site.lastUpdate = new Date().toISOString();
          }
        });
        
        console.log(`✅ Panne auto-résolue: ${outage.title}`);
      }
    });
  }

  getOutages(): Outage[] {
    return this.outages.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  }

  getActiveOutages(): Outage[] {
    return this.outages.filter(outage => outage.status === 'active');
  }

  getOutageById(id: string): Outage | undefined {
    return this.outages.find(outage => outage.id === id);
  }

  getOutagesByRegion(region: string): Outage[] {
    return this.outages.filter(outage => 
      outage.affectedSites.some(site => site.region === region)
    );
  }

  getOutageStats() {
    const activeOutages = this.getActiveOutages();
    const resolvedToday = this.outages.filter(outage => {
      if (!outage.endTime) return false;
      const endDate = new Date(outage.endTime);
      const today = new Date();
      return endDate.toDateString() === today.toDateString();
    });

    const totalAffectedSites = activeOutages.reduce((sum, outage) => 
      sum + outage.affectedSites.length, 0
    );

    // Calculer le temps moyen de résolution
    const resolvedOutages = this.outages.filter(o => o.endTime);
    const averageResolutionTime = resolvedOutages.length > 0 
      ? resolvedOutages.reduce((sum, outage) => {
          const duration = new Date(outage.endTime!).getTime() - new Date(outage.startTime).getTime();
          return sum + (duration / (1000 * 60 * 60)); // en heures
        }, 0) / resolvedOutages.length
      : 0;

    return {
      activeOutages: activeOutages.length,
      affectedSites: totalAffectedSites,
      averageResolutionTime: Math.round(averageResolutionTime * 10) / 10,
      resolvedToday: resolvedToday.length
    };
  }

  getRegions(): string[] {
    return [...new Set(
      this.outages.flatMap(outage => 
        outage.affectedSites.map(site => site.region)
      )
    )].sort();
  }

  // Méthode pour créer manuellement une panne (pour les tests)
  async createManualOutage(
    type: string,
    severity: string,
    title: string,
    description: string,
    siteIds: string[]
  ): Promise<Outage> {
    const sites = alarmService.getSites();
    const affectedSites = sites.filter(site => siteIds.includes(site.id));
    
    if (affectedSites.length === 0) {
      throw new Error('Aucun site valide fourni');
    }

    const parentSite = this.getParentSite(affectedSites[0].name) || affectedSites[0].name;
    
    const outage = await this.createOutage(
      type,
      severity,
      title,
      description,
      affectedSites,
      parentSite
    );

    this.outages.push(outage);
    return outage;
  }

  // Résoudre manuellement une panne
  resolveOutage(outageId: string, resolution?: string): boolean {
    const outage = this.outages.find(o => o.id === outageId);
    if (!outage || outage.status !== 'active') return false;

    outage.status = 'resolved';
    outage.endTime = new Date().toISOString();
    if (resolution) {
      outage.resolution = resolution;
    }

    // Remettre les sites en ligne
    outage.affectedSites.forEach(affectedSite => {
      const site = alarmService.getSites().find(s => s.id === affectedSite.id);
      if (site) {
        site.status = 'online';
        site.lastUpdate = new Date().toISOString();
      }
    });

    console.log(`✅ Panne résolue manuellement: ${outage.title}`);
    return true;
  }

  destroy() {
    if (this.outageDetectionInterval) {
      clearInterval(this.outageDetectionInterval);
    }
  }
}

export const outageService = new OutageService();