import emailjs from '@emailjs/browser';

class EmailService {
  // Configuration EmailJS - VOS VRAIES CLÉS
  private serviceId = 'Alarm_alerte';
  private templateId = 'template_bts_ticket';
  private publicKey = 'enCPeU5Qt9qR3j9jl';

  private teamEmails = {
    ip: 'manuelmayi581@gmail.com',
    transmission: 'transmission@company.com',
    bss: 'manuelmayi237@gmail.com',
    power: 'power@company.com'
  };

  constructor() {
    // Initialiser EmailJS avec votre vraie clé publique
    emailjs.init(this.publicKey);
    console.log('✅ EmailJS initialisé avec la configuration réelle');
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
      console.log(`📧 Envoi d'email RÉEL en cours...`);
      console.log(`📞 Destinataire: ${email}`);
      console.log(`👥 Équipe: ${this.getTeamName(team)}`);
      console.log(`🎫 Ticket: #${ticketId}`);
      console.log(`🏢 Site: ${site}`);
      
      const result = await emailjs.send(
        this.serviceId,
        this.templateId,
        templateParams
      );
      
      console.log(`✅ EMAIL RÉEL ENVOYÉ AVEC SUCCÈS!`);
      console.log(`📧 Status: ${result.status}`);
      console.log(`📧 Text: ${result.text}`);
      console.log(`⏰ Heure: ${new Date().toLocaleString('fr-FR')}`);
      console.log('─'.repeat(50));
      
      return true;
    } catch (error) {
      console.error('❌ Échec d\'envoi email RÉEL:', error);
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
      console.log(`📧 Envoi d'email de mise à jour RÉEL...`);
      console.log(`📞 Destinataire: ${email}`);
      console.log(`🎫 Ticket: #${ticketId}`);
      console.log(`🔄 Nouveau statut: ${this.getStatusText(status)}`);
      
      const result = await emailjs.send(
        this.serviceId,
        this.templateId,
        templateParams
      );
      
      console.log(`✅ EMAIL DE MISE À JOUR RÉEL ENVOYÉ!`);
      console.log(`📧 Status: ${result.status}`);
      console.log(`⏰ Heure: ${new Date().toLocaleString('fr-FR')}`);
      console.log('─'.repeat(50));
      
      return true;
    } catch (error) {
      console.error('❌ Échec d\'envoi email de mise à jour RÉEL:', error);
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

  // Méthode pour tester l'envoi d'email RÉEL
  async testEmail(team: string = 'ip'): Promise<boolean> {
    console.log(`🧪 Test d'envoi d'email RÉEL pour l'équipe ${team}...`);
    return await this.sendTicketNotification(
      team,
      'TEST-001',
      'Test de notification - Alarme de test critique',
      'BTS-TEST-001'
    );
  }

  // Méthode pour vérifier la configuration
  checkConfiguration(): { isValid: boolean; issues: string[] } {
    const issues: string[] = [];
    
    if (!this.serviceId) {
      issues.push('Service ID EmailJS manquant');
    }
    
    if (!this.templateId) {
      issues.push('Template ID EmailJS manquant');
    }
    
    if (!this.publicKey) {
      issues.push('Clé publique EmailJS manquante');
    }

    return {
      isValid: issues.length === 0,
      issues
    };
  }

  // Méthode pour mettre à jour la configuration
  updateConfiguration(serviceId: string, templateId: string, publicKey: string) {
    this.serviceId = serviceId;
    this.templateId = templateId;
    this.publicKey = publicKey;
    emailjs.init(this.publicKey);
    console.log('✅ Configuration EmailJS mise à jour');
  }

  // Méthode pour ajouter/modifier un email d'équipe
  updateTeamEmail(team: string, email: string) {
    this.teamEmails[team as keyof typeof this.teamEmails] = email;
    console.log(`✅ Email mis à jour pour l'équipe ${team}: ${email}`);
  }
}

export const emailService = new EmailService();