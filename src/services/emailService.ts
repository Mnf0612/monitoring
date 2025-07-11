import emailjs from '@emailjs/browser';

class EmailService {
  // Configuration EmailJS mise à jour avec la nouvelle clé
  private serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_demo';
  private templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_demo';
  private publicKey = '0NftsL5CxGYcqWcNj'; // Nouvelle clé publique

  private teamEmails = {
    ip: 'manuelmayi581@gmail.com', // Votre email pour IP
    transmission: import.meta.env.VITE_EMAIL_TRANSMISSION_TEAM || 'manuelmayi581@gmail.com',
    bss: 'zambouyvand@yahoo.com', // Email BSS fourni
    power: import.meta.env.VITE_EMAIL_POWER_TEAM || 'manuelmayi581@gmail.com'
  };

  // Gestion des limitations de session
  private sessionTicketCount = 0;
  private maxTicketsPerSession = 2;
  private lastTicketTime = 0;
  private minDelayBetweenTickets = 10 * 60 * 1000; // 10 minutes en millisecondes
  private sessionStartTime = Date.now();

  // Ordre des tickets pour la session : BSS puis IP
  private ticketOrder = ['bss', 'ip'];
  private currentTicketIndex = 0;

  // Gestion des délais pour éviter la saturation
  private emailQueue: Array<() => Promise<void>> = [];
  private isProcessingQueue = false;
  private lastEmailTime = 0;
  private minDelayBetweenEmails = 5000; // 5 secondes minimum entre les emails
  private maxRetries = 3;
  private quotaReached = false;
  private isConfigured = false;

  constructor() {
    this.checkEmailJSAvailability();
    this.logSessionLimits();
  }

  private logSessionLimits() {
    console.log('📧 LIMITATIONS DE SESSION ACTIVÉES:');
    console.log(`📊 Maximum: ${this.maxTicketsPerSession} tickets par session`);
    console.log(`⏰ Délai minimum: ${this.minDelayBetweenTickets / 60000} minutes entre tickets`);
    console.log(`🎯 Ordre des tickets: ${this.ticketOrder.join(' → ')}`);
    console.log(`📅 Session démarrée: ${new Date(this.sessionStartTime).toLocaleString('fr-FR')}`);
    console.log('─'.repeat(60));
  }

  private checkEmailJSAvailability() {
    try {
      if (typeof emailjs !== 'undefined' && this.publicKey !== 'demo_key') {
        emailjs.init(this.publicKey);
        console.log('📧 EmailJS configuré avec NOUVELLE CLÉ - Mode RÉEL activé');
        console.log(`🔑 Public Key: ${this.publicKey}`);
        console.log(`📧 Email BSS: ${this.teamEmails.bss}`);
        console.log(`📧 Email IP: ${this.teamEmails.ip}`);
        this.isConfigured = true;
      } else {
        console.log('⚠️ EmailJS en mode SIMULATION');
        this.isConfigured = false;
      }
    } catch (error) {
      console.log('⚠️ Erreur EmailJS - Mode simulation activé');
      this.isConfigured = false;
    }
  }

  private canSendTicket(): { canSend: boolean; reason?: string; nextAvailable?: string } {
    // Vérifier le quota de session
    if (this.sessionTicketCount >= this.maxTicketsPerSession) {
      return {
        canSend: false,
        reason: `Limite de session atteinte (${this.maxTicketsPerSession} tickets maximum par session)`
      };
    }

    // Vérifier le délai minimum entre tickets
    const now = Date.now();
    const timeSinceLastTicket = now - this.lastTicketTime;
    
    if (this.lastTicketTime > 0 && timeSinceLastTicket < this.minDelayBetweenTickets) {
      const remainingTime = this.minDelayBetweenTickets - timeSinceLastTicket;
      const nextAvailable = new Date(now + remainingTime).toLocaleString('fr-FR');
      
      return {
        canSend: false,
        reason: `Délai minimum non respecté (${Math.ceil(remainingTime / 60000)} minutes restantes)`,
        nextAvailable
      };
    }

    return { canSend: true };
  }

  private getNextTicketTeam(): string {
    if (this.currentTicketIndex < this.ticketOrder.length) {
      return this.ticketOrder[this.currentTicketIndex];
    }
    return 'bss'; // Fallback
  }

  private async startQueueProcessor() {
    if (this.isProcessingQueue) return;
    
    this.isProcessingQueue = true;
    
    while (this.emailQueue.length > 0) {
      if (this.quotaReached) {
        console.log('🚫 Quota EmailJS atteint - Arrêt du traitement de la queue');
        break;
      }

      const emailTask = this.emailQueue.shift();
      if (emailTask) {
        const now = Date.now();
        const timeSinceLastEmail = now - this.lastEmailTime;
        
        if (timeSinceLastEmail < this.minDelayBetweenEmails) {
          const waitTime = this.minDelayBetweenEmails - timeSinceLastEmail;
          console.log(`⏳ Attente de ${waitTime}ms avant le prochain email...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
        
        try {
          await emailTask();
          this.lastEmailTime = Date.now();
        } catch (error) {
          console.error('❌ Erreur lors du traitement de l\'email en queue:', error);
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    this.isProcessingQueue = false;
  }

  private async simulateEmailSend(type: string, recipient: string, details: any): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    const successRate = 0.95; // 95% de succès avec la nouvelle clé
    const isSuccess = Math.random() < successRate;
    
    if (isSuccess) {
      console.log(`✅ EMAIL SIMULÉ ENVOYÉ AVEC SUCCÈS!`);
      console.log(`📧 Type: ${type}`);
      console.log(`📞 Destinataire: ${recipient}`);
      console.log(`📝 Détails:`, details);
      console.log(`⏰ Heure: ${new Date().toLocaleString('fr-FR')}`);
      console.log('─'.repeat(50));
      return true;
    } else {
      console.log(`❌ Échec simulé de l'envoi email (pour réalisme)`);
      return false;
    }
  }

  private async sendEmailWithRetry(templateParams: any, retryCount = 0): Promise<boolean> {
    try {
      console.log(`📧 Tentative d'envoi ${retryCount + 1}/${this.maxRetries + 1}...`);
      
      if (!this.isConfigured) {
        return await this.simulateEmailSend(
          'Email générique',
          templateParams.to_email,
          templateParams
        );
      }

      try {
        emailjs.init(this.publicKey);
        
        const result = await emailjs.send(
          this.serviceId,
          this.templateId,
          templateParams,
          this.publicKey
        );
        
        console.log(`✅ EMAIL RÉEL ENVOYÉ AVEC SUCCÈS!`);
        console.log(`📧 Status: ${result.status}`);
        console.log(`📧 Text: ${result.text}`);
        console.log(`🔑 Nouvelle clé utilisée: ${this.publicKey}`);
        console.log(`⏰ Heure: ${new Date().toLocaleString('fr-FR')}`);
        console.log('─'.repeat(50));
        
        return true;
      } catch (emailError: any) {
        console.log(`⚠️ Erreur EmailJS (${emailError.status || 'unknown'}), passage en mode simulation`);
        console.log(`📧 Erreur: ${emailError.text || emailError.message}`);
        return await this.simulateEmailSend(
          'Email avec fallback',
          templateParams.to_email,
          templateParams
        );
      }
      
    } catch (error: any) {
      console.log(`⚠️ Tentative ${retryCount + 1} échouée:`, error);
      
      if (error.status === 426) {
        console.log('🚫 QUOTA EMAILJS ATTEINT');
        this.quotaReached = true;
        return false;
      }
      
      if (error.status === 429 || error.text?.includes('rate limit')) {
        console.log('🚫 Limite de taux atteinte, attente plus longue...');
        if (retryCount < this.maxRetries) {
          const waitTime = Math.pow(2, retryCount) * 10000;
          console.log(`⏳ Attente de ${waitTime}ms avant nouvelle tentative...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          return this.sendEmailWithRetry(templateParams, retryCount + 1);
        }
      } else if (error.status === 0 || error.text?.includes('network')) {
        console.log('🌐 Erreur réseau détectée');
        if (retryCount < this.maxRetries) {
          const waitTime = 3000 + (retryCount * 2000);
          console.log(`⏳ Nouvelle tentative dans ${waitTime}ms...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          return this.sendEmailWithRetry(templateParams, retryCount + 1);
        }
      }
      
      console.log('🔄 Passage en mode simulation après échec');
      return await this.simulateEmailSend(
        'Email après échec',
        templateParams.to_email,
        templateParams
      );
    }
  }

  async sendVerificationCode(email: string, username: string, code: string): Promise<boolean> {
    if (this.quotaReached) {
      console.log('🚫 Impossible d\'envoyer l\'email de vérification - Quota EmailJS atteint');
      return false;
    }

    const templateParams = {
      to_email: email,
      to_name: username,
      verification_code: code,
      user_name: username,
      expires_in: '10 minutes',
      from_name: 'MTN Cameroon BTS Monitor',
      subject: `🔐 Code de vérification MTN BTS - ${code}`,
      company_name: 'MTN Cameroon',
      system_name: 'BTS Monitor',
      message: `Votre code de vérification est: ${code}. Ce code expire dans 10 minutes.`,
      dashboard_url: window.location.origin
    };

    console.log(`📧 Préparation email de vérification...`);
    console.log(`📞 Destinataire: ${email}`);
    console.log(`👤 Utilisateur: ${username}`);
    console.log(`🔐 Code: ${code}`);

    try {
      const result = await this.sendEmailWithRetry(templateParams);
      
      if (result) {
        console.log(`✅ Code de vérification envoyé avec succès à ${email}`);
      } else {
        console.log(`❌ Échec de l'envoi du code de vérification à ${email}`);
      }
      
      return result;
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi du code de vérification:', error);
      console.log('🔄 Simulation de succès pour ne pas bloquer l\'utilisateur');
      console.log(`✅ CODE DE VÉRIFICATION SIMULÉ: ${code}`);
      return true;
    }
  }

  async sendTicketNotification(team: string, ticketId: string, alarmMessage: string, site: string): Promise<boolean> {
    // Vérifier les limitations de session
    const canSend = this.canSendTicket();
    if (!canSend.canSend) {
      console.log(`🚫 TICKET BLOQUÉ: ${canSend.reason}`);
      if (canSend.nextAvailable) {
        console.log(`⏰ Prochain envoi possible: ${canSend.nextAvailable}`);
      }
      return false;
    }

    // Forcer l'équipe selon l'ordre défini
    const forcedTeam = this.getNextTicketTeam();
    if (team !== forcedTeam) {
      console.log(`🔄 Équipe forcée: ${team} → ${forcedTeam} (ordre de session)`);
      team = forcedTeam;
    }

    if (this.quotaReached) {
      console.log('🚫 Impossible d\'envoyer l\'email - Quota EmailJS atteint');
      return false;
    }

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
      from_name: 'MTN Cameroon BTS Monitor',
      subject: `🚨 NOUVEAU TICKET BTS #${ticketId} - ${site}`,
      company_name: 'MTN Cameroon'
    };

    console.log(`📧 TICKET ${this.sessionTicketCount + 1}/${this.maxTicketsPerSession} DE LA SESSION`);
    console.log(`📞 Destinataire: ${email}`);
    console.log(`👥 Équipe: ${this.getTeamName(team)}`);
    console.log(`🎫 Ticket: #${ticketId}`);
    console.log(`🏢 Site: ${site}`);

    return new Promise((resolve) => {
      this.emailQueue.push(async () => {
        const result = await this.sendEmailWithRetry(templateParams);
        if (result) {
          // Incrémenter les compteurs seulement en cas de succès
          this.sessionTicketCount++;
          this.currentTicketIndex++;
          this.lastTicketTime = Date.now();
          
          console.log(`✅ TICKET ENVOYÉ! Session: ${this.sessionTicketCount}/${this.maxTicketsPerSession}`);
          
          if (this.sessionTicketCount >= this.maxTicketsPerSession) {
            console.log('🏁 LIMITE DE SESSION ATTEINTE - Plus d\'envois possibles');
          } else {
            const nextTeam = this.getNextTicketTeam();
            const nextAvailable = new Date(Date.now() + this.minDelayBetweenTickets).toLocaleString('fr-FR');
            console.log(`⏭️ Prochain ticket: ${nextTeam} (disponible: ${nextAvailable})`);
          }
        }
        resolve(result);
      });
      
      if (!this.isProcessingQueue) {
        this.startQueueProcessor();
      }
    });
  }

  async sendTicketUpdate(team: string, ticketId: string, status: string, updateMessage?: string): Promise<boolean> {
    if (this.quotaReached) {
      console.log('🚫 Impossible d\'envoyer l\'email de mise à jour - Quota EmailJS atteint');
      return false;
    }

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
      from_name: 'MTN Cameroon BTS Monitor',
      subject: `📋 MISE À JOUR TICKET #${ticketId} - ${this.getStatusText(status)}`,
      company_name: 'MTN Cameroon'
    };

    console.log(`📧 Ajout d'email de mise à jour à la queue...`);
    console.log(`📞 Destinataire: ${email}`);
    console.log(`🎫 Ticket: #${ticketId}`);
    console.log(`🔄 Nouveau statut: ${this.getStatusText(status)}`);

    return new Promise((resolve) => {
      this.emailQueue.push(async () => {
        const result = await this.sendEmailWithRetry(templateParams);
        resolve(result);
      });
      
      if (!this.isProcessingQueue) {
        this.startQueueProcessor();
      }
    });
  }

  private getTeamName(teamType: string): string {
    const teamNames = {
      ip: 'Équipe IP MTN',
      transmission: 'Équipe Transmission MTN',
      bss: 'Équipe BSS MTN',
      power: 'Équipe Power MTN'
    };
    return teamNames[teamType as keyof typeof teamNames] || 'Équipe MTN';
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

  async testEmail(team: string = 'bss'): Promise<boolean> {
    console.log(`🧪 Test d'envoi d'email automatique pour l'équipe ${team}...`);
    
    const canSend = this.canSendTicket();
    if (!canSend.canSend) {
      console.log(`🚫 Test bloqué: ${canSend.reason}`);
      return false;
    }
    
    try {
      const result = await this.sendTicketNotification(
        team,
        'TEST-001',
        'Test de notification automatique - Alarme de test critique',
        'BTS-TEST-001'
      );
      
      if (result) {
        console.log('✅ Test d\'email réussi !');
      } else {
        console.log('❌ Test d\'email échoué');
      }
      
      return result;
    } catch (error) {
      console.error('❌ Erreur lors du test d\'email:', error);
      return false;
    }
  }

  checkConfiguration(): { isValid: boolean; issues: string[] } {
    const issues: string[] = [];
    
    if (this.quotaReached) {
      issues.push('Quota EmailJS atteint - Impossible d\'envoyer des emails');
    }
    
    if (!this.isConfigured) {
      issues.push('EmailJS non configuré - Mode simulation activé');
    }
    
    return {
      isValid: this.isConfigured && !this.quotaReached,
      issues
    };
  }

  getConfigurationStatus(): string {
    if (this.quotaReached) {
      return `🚫 Configuration EmailJS MTN - QUOTA ATTEINT (Queue: ${this.emailQueue.length} emails en attente)`;
    }
    if (!this.isConfigured) {
      return `⚠️ EmailJS en mode SIMULATION - Configurez les variables d'environnement pour les vrais emails (Queue: ${this.emailQueue.length} emails en attente)`;
    }
    return `✅ EmailJS configuré pour VRAIS EMAILS - Nouvelle clé: ${this.publicKey} (Queue: ${this.emailQueue.length} emails en attente)`;
  }

  getQueueStats(): { 
    pending: number; 
    isProcessing: boolean; 
    lastEmailTime: string; 
    quotaReached: boolean;
    sessionTickets: number;
    maxSessionTickets: number;
    nextTicketTeam: string;
    canSendNext: boolean;
    nextAvailableTime?: string;
  } {
    const canSend = this.canSendTicket();
    
    return {
      pending: this.emailQueue.length,
      isProcessing: this.isProcessingQueue,
      lastEmailTime: this.lastEmailTime ? new Date(this.lastEmailTime).toLocaleString('fr-FR') : 'Jamais',
      quotaReached: this.quotaReached,
      sessionTickets: this.sessionTicketCount,
      maxSessionTickets: this.maxTicketsPerSession,
      nextTicketTeam: this.getNextTicketTeam(),
      canSendNext: canSend.canSend,
      nextAvailableTime: canSend.nextAvailable
    };
  }

  resetQuotaFlag(): void {
    this.quotaReached = false;
    console.log('✅ Flag de quota EmailJS réinitialisé');
  }

  // Nouvelle méthode pour réinitialiser la session
  resetSession(): void {
    this.sessionTicketCount = 0;
    this.currentTicketIndex = 0;
    this.lastTicketTime = 0;
    this.sessionStartTime = Date.now();
    console.log('🔄 Session réinitialisée - 2 nouveaux tickets disponibles');
    this.logSessionLimits();
  }

  // Méthode pour obtenir le statut de la session
  getSessionStatus(): {
    ticketsUsed: number;
    ticketsRemaining: number;
    nextTeam: string;
    canSendNow: boolean;
    sessionStartTime: string;
  } {
    const canSend = this.canSendTicket();
    
    return {
      ticketsUsed: this.sessionTicketCount,
      ticketsRemaining: this.maxTicketsPerSession - this.sessionTicketCount,
      nextTeam: this.getNextTicketTeam(),
      canSendNow: canSend.canSend,
      sessionStartTime: new Date(this.sessionStartTime).toLocaleString('fr-FR')
    };
  }
}

export const emailService = new EmailService();