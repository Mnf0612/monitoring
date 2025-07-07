import { Outage, Site } from '../types';
import { alarmService } from './alarmService';
import { ticketService } from './ticketService';

class OutageService {
  private outages: Outage[] = [];
  private outageDetectionInterval: NodeJS.Timeout | null = null;
  private outageGenerationInterval: NodeJS.Timeout | null = null;
  private readonly OUTAGE_THRESHOLD = 3; // Minimum 3 sites down to be considered an outage
  private readonly PARENT_SITE_PATTERN = /^BTS-([A-Z]{3})-(\d{1})(\d{2})$/; // Pattern: BTS-REG-XYZ where X is parent

  constructor() {
    this.startOutageDetection();
    this.startOutageGeneration();
    this.generateInitialOutages();
  }

  private startOutageDetection() {
    // Vérifier les pannes toutes les 1 minute pour une détection plus rapide
    this.outageDetectionInterval = setInterval(() => {
      this.detectOutages();
    }, 60000);
  }

  private startOutageGeneration() {
    // Générer des pannes simulées toutes les 3-8 minutes pour la démonstration
    this.outageGenerationInterval = setInterval(() => {
      this.generateSimulatedOutage();
    }, Math.random() * 300000 + 180000); // 3-8 minutes
  }

  private generateInitialOutages() {
    // Créer plusieurs pannes initiales pour la démonstration
    const initialOutages = [
      {
        type: 'power' as const,
        severity: 'critical' as const,
        title: 'Panne électrique généralisée - Centre',
        description: 'Coupure d\'alimentation principale affectant le hub de Yaoundé',
        affectedRegions: ['Centre'],
        parentSite: 'BTS-CEN-101',
        siteCount: 8
      },
      {
        type: 'transmission' as const,
        severity: 'major' as const,
        title: 'Défaillance liaison micro-ondes - Nord',
        description: 'Interruption de la liaison principale Garoua-Maroua',
        affectedRegions: ['Nord'],
        parentSite: 'BTS-NOR-201',
        siteCount: 6
      },
      {
        type: 'network' as const,
        severity: 'major' as const,
        title: 'Panne routeur principal - Littoral',
        description: 'Défaillance du routeur principal de Douala',
        affectedRegions: ['Littoral'],
        parentSite: 'BTS-LIT-101',
        siteCount: 10
      }
    ];

    initialOutages.forEach((outageData, index) => {
      const sites = alarmService.getSites();
      const regionSites = sites.filter(site => outageData.affectedRegions.includes(site.region));
      const affectedSites = regionSites.slice(0, outageData.siteCount);

      if (affectedSites.length >= this.OUTAGE_THRESHOLD) {
        // Mettre les sites hors ligne pour simuler la panne
        affectedSites.forEach(site => {
          site.status = 'offline';
          site.lastUpdate = new Date().toISOString();
        });

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

    console.log(`🚨 ${this.outages.length} pannes initiales créées pour la démonstration`);
  }

  private async generateSimulatedOutage() {
    const sites = alarmService.getSites();
    const onlineSites = sites.filter(site => site.status === 'online');
    
    if (onlineSites.length < 10) return; // Pas assez de sites en ligne

    // Choisir une région aléatoire
    const regions = [...new Set(onlineSites.map(s => s.region))];
    const randomRegion = regions[Math.floor(Math.random() * regions.length)];
    const regionSites = onlineSites.filter(s => s.region === randomRegion);

    if (regionSites.length < this.OUTAGE_THRESHOLD) return;

    // Générer une panne aléatoire
    const outageTypes = ['power', 'transmission', 'network', 'hardware'] as const;
    const severities = ['critical', 'major', 'minor'] as const;
    const randomType = outageTypes[Math.floor(Math.random() * outageTypes.length)];
    const randomSeverity = severities[Math.floor(Math.random() * severities.length)];

    const outageScenarios = {
      power: [
        'Panne électrique généralisée',
        'Défaillance du générateur principal',
        'Coupure d\'alimentation secteur',
        'Surtension destructrice'
      ],
      transmission: [
        'Défaillance liaison micro-ondes',
        'Antenne principale endommagée',
        'Câble de transmission coupé',
        'Interférence radio majeure'
      ],
      network: [
        'Panne routeur principal',
        'Défaillance switch central',
        'Coupure fibre optique',
        'Saturation réseau critique'
      ],
      hardware: [
        'Défaillance serveur central',
        'Panne climatisation datacenter',
        'Disque dur central corrompu',
        'Mémoire serveur défaillante'
      ]
    };

    const scenarios = outageScenarios[randomType];
    const randomScenario = scenarios[Math.floor(Math.random() * scenarios.length)];

    // Déterminer le nombre de sites affectés selon la sévérité
    const siteCount = randomSeverity === 'critical' ? 
      Math.floor(Math.random() * 8) + 7 : // 7-14 sites
      randomSeverity === 'major' ? 
      Math.floor(Math.random() * 5) + 4 : // 4-8 sites
      Math.floor(Math.random() * 3) + 3;  // 3-5 sites

    const affectedSites = regionSites.slice(0, Math.min(siteCount, regionSites.length));

    // Mettre les sites hors ligne
    affectedSites.forEach(site => {
      site.status = 'offline';
      site.lastUpdate = new Date().toISOString();
    });

    const parentSite = this.getParentSite(affectedSites[0].name) || affectedSites[0].name;

    const outage = await this.createOutage(
      randomType,
      randomSeverity,
      `${randomScenario} - ${randomRegion}`,
      `Panne ${randomType} affectant ${affectedSites.length} sites dans la région ${randomRegion}`,
      affectedSites,
      parentSite
    );

    this.outages.push(outage);
    
    console.log(`🚨 NOUVELLE PANNE SIMULÉE GÉNÉRÉE:`);
    console.log(`📍 Région: ${randomRegion}`);
    console.log(`⚡ Type: ${randomType} | Sévérité: ${randomSeverity}`);
    console.log(`🏢 Sites affectés: ${affectedSites.length}`);
    console.log(`🎯 Titre: ${outage.title}`);
  }

  private detectOutages() {
    const sites = alarmService.getSites();
    const offlineSites = sites.filter(site => site.status === 'offline');
    
    // Grouper les sites hors ligne par région
    const sitesByRegion = new Map<string, Site[]>();
    
    offlineSites.forEach(site => {
      if (!sitesByRegion.has(site.region)) {
        sitesByRegion.set(site.region, []);
      }
      sitesByRegion.get(site.region)!.push(site);
    });

    // Détecter les nouvelles pannes par région
    sitesByRegion.forEach((sites, region) => {
      if (sites.length >= this.OUTAGE_THRESHOLD) {
        // Vérifier si une panne existe déjà pour cette région
        const existingOutage = this.outages.find(outage => 
          outage.affectedSites && Array.isArray(outage.affectedSites) && 
          outage.affectedSites.some(site => site.region === region) && 
          outage.status === 'active'
        );

        if (!existingOutage) {
          // Créer une nouvelle panne détectée automatiquement
          const outageType = this.determineOutageType();
          const severity = this.determineSeverity(sites.length);
          const parentSite = this.getParentSite(sites[0].name) || sites[0].name;
          
          const outage = this.createOutage(
            outageType,
            severity,
            `Panne détectée automatiquement - ${region}`,
            `Détection automatique: ${sites.length} sites hors ligne dans la région ${region}`,
            sites,
            parentSite
          );

          this.outages.push(outage);
          console.log(`🤖 PANNE DÉTECTÉE AUTOMATIQUEMENT: ${outage.title} (${sites.length} sites)`);
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
    if (affectedSitesCount >= 10) return 'critical';
    if (affectedSitesCount >= 6) return 'major';
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
    // Ensure affectedSites is always an array
    const safeSites = Array.isArray(affectedSites) ? affectedSites : [];
    
    const outage: Outage = {
      id: `OUT-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
      type: type as any,
      severity: severity as any,
      title,
      description,
      affectedSites: safeSites.map(site => ({
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
        message: `${title} - ${safeSites.length} sites impactés`,
        timestamp: outage.startTime,
        status: 'active' as const,
        region: safeSites[0]?.region || 'Centre'
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
    
    // Résoudre aléatoirement les pannes anciennes
    activeOutages.forEach(outage => {
      const ageMinutes = (Date.now() - new Date(outage.startTime).getTime()) / 60000;
      
      // 5% de chance de résolution après 10 minutes, augmente avec le temps
      const resolutionChance = Math.min(0.6, (ageMinutes - 10) * 0.02);
      
      if (ageMinutes > 10 && Math.random() < resolutionChance) {
        outage.status = 'resolved';
        outage.endTime = new Date().toISOString();
        outage.resolution = `Résolution automatique après ${Math.floor(ageMinutes)} minutes`;
        
        // Remettre les sites en ligne - add defensive check
        if (outage.affectedSites && Array.isArray(outage.affectedSites)) {
          outage.affectedSites.forEach(affectedSite => {
            const site = alarmService.getSites().find(s => s.id === affectedSite.id);
            if (site) {
              site.status = 'online';
              site.lastUpdate = new Date().toISOString();
            }
          });
        }
        
        console.log(`✅ Panne auto-résolue: ${outage.title} (durée: ${Math.floor(ageMinutes)}min)`);
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
      outage.affectedSites && Array.isArray(outage.affectedSites) &&
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
      sum + (outage.affectedSites && Array.isArray(outage.affectedSites) ? outage.affectedSites.length : 0), 0
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
      this.outages
        .filter(outage => outage.affectedSites && Array.isArray(outage.affectedSites))
        .flatMap(outage => 
          outage.affectedSites!.map(site => site.region)
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

    // Mettre les sites hors ligne
    affectedSites.forEach(site => {
      site.status = 'offline';
      site.lastUpdate = new Date().toISOString();
    });

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

    // Remettre les sites en ligne - add defensive check
    if (outage.affectedSites && Array.isArray(outage.affectedSites)) {
      outage.affectedSites.forEach(affectedSite => {
        const site = alarmService.getSites().find(s => s.id === affectedSite.id);
        if (site) {
          site.status = 'online';
          site.lastUpdate = new Date().toISOString();
        }
      });
    }

    console.log(`✅ Panne résolue manuellement: ${outage.title}`);
    return true;
  }

  // Méthode pour forcer la génération d'une panne (pour démonstration)
  async forceGenerateOutage(): Promise<Outage | null> {
    console.log('🎯 Génération forcée d\'une panne pour démonstration...');
    await this.generateSimulatedOutage();
    return this.outages[this.outages.length - 1] || null;
  }

  destroy() {
    if (this.outageDetectionInterval) {
      clearInterval(this.outageDetectionInterval);
    }
    if (this.outageGenerationInterval) {
      clearInterval(this.outageGenerationInterval);
    }
  }
}

export const outageService = new OutageService();