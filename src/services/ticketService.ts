import { Alarm, Ticket, Team } from '../types';
import { twilioService } from './twilioService';

class TicketService {
  private tickets: Ticket[] = [];
  private teams: Team[] = [
    {
      id: '1',
      name: 'Équipe Power',
      type: 'power',
      phone: '657416225',
      members: ['John Doe', 'Jane Smith']
    },
    {
      id: '2',
      name: 'Équipe IP',
      type: 'ip',
      phone: '697039163',
      members: ['Mike Johnson', 'Sarah Wilson']
    },
    {
      id: '3',
      name: 'Équipe Transmission',
      type: 'transmission',
      phone: '698796597',
      members: ['David Brown', 'Lisa Davis']
    },
    {
      id: '4',
      name: 'Équipe BSS',
      type: 'bss',
      phone: '692782310',
      members: ['Chris Taylor', 'Amy White']
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
      hardware: 'transmission',
      security: 'ip'
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

    // Send SMS notification
    await twilioService.sendTicketNotification(
      team,
      ticketId,
      `${alarm.site} - ${alarm.message}`
    );

    return ticket;
  }

  private getTeamName(teamType: string): string {
    const team = this.teams.find(t => t.type === teamType);
    return team ? team.name : 'Équipe Inconnue';
  }

  getTickets(): Ticket[] {
    return this.tickets;
  }

  getTicketsByTeam(teamType: string): Ticket[] {
    return this.tickets.filter(ticket => ticket.team === teamType);
  }

  getTicketById(id: string): Ticket | undefined {
    return this.tickets.find(ticket => ticket.id === id);
  }

  async updateTicket(id: string, update: string, status?: string): Promise<Ticket | null> {
    const ticket = this.tickets.find(t => t.id === id);
    
    if (!ticket) return null;

    ticket.update = update;
    ticket.updatedAt = new Date().toISOString();
    
    if (status) {
      ticket.status = status as any;
      
      // Send SMS notification for status change
      await twilioService.sendTicketUpdate(ticket.team, id, status);
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
}

export const ticketService = new TicketService();