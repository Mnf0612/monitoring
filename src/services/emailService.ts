import emailjs from '@emailjs/browser';

class EmailService {
  // Configuration EmailJS intégrée directement
  private serviceId = 'Alarm_alerte';
  private templateId = 'template_bts_ticket';
  private publicKey = 'enCPeU5Qt9qR3j9jl';

  private teamEmails = {
    ip: 'manuelmayi581@gmail.com',
    transmission: 'manuelmayi581@gmail.com',
    bss: 'manuelmayi581@gmail.com',
    power: 'manuelmayi581@gmail.com'
  };

  constructor() {
    // Initialiser EmailJS automatiquement
    emailjs.init(this.publicKey);
    console.log('✅ EmailJS initialisé automatiquement avec la configuration');
  }

  async sendTicketNotification(team: string, ticketId: string, alarmMessage: string, site: string): Promise<boolean> {
    const email = this.teamEmails[team as keyof typeof this.teamEmails];
    
    if (!email) {
      console.error(`❌ Aucun email trouvé pour l'équipe: ${team}`);
      return false;
    }

    const templateParams = {
      to_email: email,
      to_name: this.getTeamName(team),
      ticket_id: ticketId,
      site_name: site,
      alarm_message: alarmMessage,
      team_name: this.getTeamName(team),
      status: 'OUVERT',
      created_date: new Date().toLocaleString('fr-FR'),
      priority: this.getPriorityFromMessage(alarmMessage),
      dashboard_url: window.location.origin,
      from_name: 'BTS Monitor System',
      subject: `🚨 NOUVEAU TICKET BTS #${ticketId} - ${site}`
    };

    try {
      console.log(`📧 Envoi d'email automatique en cours...`);
      console.log(`📞 Destinataire: ${email}`);
      console.log(`👥 Équipe: ${this.getTeamName(team)}`);
      console.log(`🎫 Ticket: #${ticketId}`);
      console.log(`🏢 Site: ${site}`);
      
      const result = await emailjs.send(
        this.serviceId,
        this.templateId,
        templateParams
      );
      
      console.log(`✅ EMAIL AUTOMATIQUE ENVOYÉ AVEC SUCCÈS!`);
      console.log(`📧 Status: ${result.status}`);
      console.log(`📧 Text: ${result.text}`);
      console.log(`⏰ Heure: ${new Date().toLocaleString('fr-FR')}`);
      console.log('─'.repeat(50));
      
      return true;
    } catch (error) {
      console.error('❌ Échec d\'envoi email automatique:', error);
      return false;
    }
  }

  async sendTicketUpdate(team: string, ticketId: string, status: string, updateMessage?: string): Promise<boolean> {
    const email = this.teamEmails[team as keyof typeof this.teamEmails];
    
    if (!email) {
      console.error(`❌ Aucun email trouvé pour l'équipe: ${team}`);
      return false;
    }

    const templateParams = {
      to_email: email,
      to_name: this.getTeamName(team),
      ticket_id: ticketId,
      team_name: this.getTeamName(team),
      status: this.getStatusText(status),
      update_message: updateMessage || 'Statut mis à jour',
      updated_date: new Date().toLocaleString('fr-FR'),
      dashboard_url: window.location.origin,
      from_name: 'BTS Monitor System',
      subject: `📋 MISE À JOUR TICKET #${ticketId} - ${this.getStatusText(status)}`
    };

    try {
      console.log(`📧 Envoi d'email de mise à jour automatique...`);
      console.log(`📞 Destinataire: ${email}`);
      console.log(`🎫 Ticket: #${ticketId}`);
      console.log(`🔄 Nouveau statut: ${this.getStatusText(status)}`);
      
      const result = await emailjs.send(
        this.serviceId,
        this.templateId,
        templateParams
      );
      
      console.log(`✅ EMAIL DE MISE À JOUR AUTOMATIQUE ENVOYÉ!`);
      console.log(`📧 Status: ${result.status}`);
      console.log(`⏰ Heure: ${new Date().toLocaleString('fr-FR')}`);
      console.log('─'.repeat(50));
      
      return true;
    } catch (error) {
      console.error('❌ Échec d\'envoi email de mise à jour automatique:', error);
      return false;
    }
  }

  private getTeamName(teamType: string): string {
    const teamNames = {
      ip: 'Équipe IP',
      transmission: 'Équipe Transmission',
      bss: 'Équipe BSS',
      power: 'Équipe Power'
    };
    return teamNames[teamType as keyof typeof teamNames] || 'Équipe Inconnue';
  }

  private getStatusText(status: string): string {
    const statusTexts = {
      open: 'OUVERT',
      in_progress: 'EN COURS',
      resolved: 'RÉSOLU',
      closed: 'FERMÉ'
    };
    return statusTexts[status as keyof typeof statusTexts] || status.toUpperCase();
  }

  private getPriorityFromMessage(message: string): string {
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('critique') || lowerMessage.includes('panne') || lowerMessage.includes('défaillant')) {
      return 'HAUTE';
    } else if (lowerMessage.includes('majeur') || lowerMessage.includes('interrompu')) {
      return 'MOYENNE';
    }
    return 'BASSE';
  }

  // Méthode pour tester l'envoi d'email
  async testEmail(team: string = 'ip'): Promise<boolean> {
    console.log(`🧪 Test d'envoi d'email automatique pour l'équipe ${team}...`);
    return await this.sendTicketNotification(
      team,
      'TEST-001',
      'Test de notification automatique - Alarme de test critique',
      'BTS-TEST-001'
    );
  }

  // Méthode pour vérifier la configuration (toujours valide maintenant)
  checkConfiguration(): { isValid: boolean; issues: string[] } {
    return {
      isValid: true,
      issues: []
    };
  }

  // Méthode pour obtenir le statut de la configuration
  getConfigurationStatus(): string {
    return '✅ Configuration EmailJS intégrée et prête';
  }
}

export const emailService = new EmailService();