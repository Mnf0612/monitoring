import { Alarm, Ticket, Team } from '../types';
import { emailService } from './emailService';

class TicketService {
  private tickets: Ticket[] = [];
  private teams: Team[] = [
    {
      id: '1',
      name: 'Équipe Power',
      type: 'power',
      phone: '+237657416225',
      members: ['Jean Mballa', 'Marie Nkomo']
    },
    {
      id: '2',
      name: 'Équipe IP',
      type: 'ip',
      phone: '+237697039163',
      members: ['Paul Essomba', 'Claire Fouda']
    },
    {
      id: '3',
      name: 'Équipe Transmission',
      type: 'transmission',
      phone: '+237698796597',
      members: ['David Biya', 'Lisa Mengue']
    },
    {
      id: '4',
      name: 'Équipe BSS',
      type: 'bss',
      phone: '+237692782310',
      members: ['Chris Atangana', 'Amy Ndongo']
    }
  ];

  private generateTicketId(): string {
    return `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
  }

  private determineTeamFromAlarmType(alarmType: string): 'power' | 'ip' | 'transmission' | 'bss' {
    const typeMapping: Record<string, 'power' | 'ip' | 'transmission' | 'bss'> = {
      power: 'power',
      ip: 'ip',
      transmission: 'transmission',
      bss: 'bss',
      hardware: 'transmission', // Hardware -> Transmission
      security: 'ip'            // Security -> IP
    };

    return typeMapping[alarmType.toLowerCase()] || 'bss';
  }

  private determinePriority(severity: string): 'high' | 'medium' | 'low' {
    switch (severity) {
      case 'critical':
        return 'high';
      case 'major':
        return 'high';
      case 'minor':
        return 'medium';
      case 'warning':
        return 'low';
      default:
        return 'medium';
    }
  }

  async createTicketFromAlarm(alarm: Alarm): Promise<Ticket> {
    const ticketId = this.generateTicketId();
    const team = this.determineTeamFromAlarmType(alarm.type);
    const priority = this.determinePriority(alarm.severity);

    const ticket: Ticket = {
      id: ticketId,
      alarmId: alarm.id,
      alarm,
      owner: this.getTeamName(team),
      team,
      status: 'open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      priority
    };

    this.tickets.push(ticket);

    console.log(`🎫 Nouveau ticket créé: ${ticketId} pour l'équipe ${team}`);
    console.log(`📍 Site: ${alarm.site}`);
    console.log(`⚠️ Type: ${alarm.type} | Sévérité: ${alarm.severity}`);
    console.log(`👥 Assigné à: ${this.getTeamName(team)}`);

    // Envoyer notification par email RÉEL
    try {
      const emailResult = await emailService.sendTicketNotification(
        team,
        ticketId,
        alarm.message,
        alarm.site
      );
      
      if (emailResult) {
        console.log(`✅ EMAIL RÉEL envoyé avec succès à l'équipe ${team}`);
      } else {
        console.log(`❌ Échec d'envoi EMAIL RÉEL à l'équipe ${team}`);
      }
    } catch (error) {
      console.error(`❌ Erreur lors de l'envoi EMAIL RÉEL:`, error);
    }

    return ticket;
  }

  private getTeamName(teamType: string): string {
    const team = this.teams.find(t => t.type === teamType);
    return team ? team.name : 'Équipe Inconnue';
  }

  getTickets(): Ticket[] {
    return this.tickets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getTicketsByTeam(teamType: string): Ticket[] {
    return this.tickets
      .filter(ticket => ticket.team === teamType)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getTicketById(id: string): Ticket | undefined {
    return this.tickets.find(ticket => ticket.id === id);
  }

  async updateTicket(id: string, update: string, status?: string): Promise<Ticket | null> {
    const ticket = this.tickets.find(t => t.id === id);
    
    if (!ticket) {
      console.error(`❌ Ticket ${id} non trouvé`);
      return null;
    }

    ticket.update = update;
    ticket.updatedAt = new Date().toISOString();
    
    console.log(`📝 Ticket ${id} mis à jour par ${ticket.owner}`);
    console.log(`💬 Commentaire: ${update}`);
    
    if (status && status !== ticket.status) {
      const oldStatus = ticket.status;
      ticket.status = status as any;
      
      console.log(`🔄 Statut changé: ${oldStatus} → ${status}`);
      
      // Envoyer notification email RÉELLE pour changement de statut
      try {
        const emailResult = await emailService.sendTicketUpdate(ticket.team, id, status, update);
        if (emailResult) {
          console.log(`✅ EMAIL RÉEL de mise à jour envoyé à l'équipe ${ticket.team}`);
        } else {
          console.log(`❌ Échec d'envoi EMAIL RÉEL de mise à jour`);
        }
      } catch (error) {
        console.error(`❌ Erreur lors de l'envoi EMAIL RÉEL de notification:`, error);
      }
    }

    return ticket;
  }

  getTeams(): Team[] {
    return this.teams;
  }

  getTicketStats() {
    const total = this.tickets.length;
    const open = this.tickets.filter(t => t.status === 'open').length;
    const inProgress = this.tickets.filter(t => t.status === 'in_progress').length;
    const resolved = this.tickets.filter(t => t.status === 'resolved').length;
    const closed = this.tickets.filter(t => t.status === 'closed').length;

    return {
      total,
      open,
      inProgress,
      resolved,
      closed,
      highPriority: this.tickets.filter(t => t.priority === 'high').length
    };
  }

  // Méthode pour tester la création de ticket avec email RÉEL
  async testTicketCreation(): Promise<void> {
    const testAlarm: Alarm = {
      id: 'TEST-' + Date.now(),
      site: 'BTS-TEST-001',
      type: 'ip',
      severity: 'major',
      message: 'Test de création de ticket - Connectivité IP interrompue',
      timestamp: new Date().toISOString(),
      status: 'active',
      region: 'Centre'
    };

    console.log('🧪 Test de création de ticket avec envoi d\'EMAIL RÉEL...');
    await this.createTicketFromAlarm(testAlarm);
  }
}

export const ticketService = new TicketService();