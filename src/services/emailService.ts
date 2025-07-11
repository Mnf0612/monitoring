import emailjs from '@emailjs/browser';

class EmailService {
  // Configuration EmailJS CORRIGÉE avec service et template réels
  private serviceId = 'service_lhzqhxr'; // Service ID réel configuré
  private templateId = 'template_bts_notification'; // Template ID réel
  private publicKey = '0NftsL5CxGYcqWcNj'; // Clé publique confirmée

  private teamEmails = {
    ip: 'manuelmayi581@gmail.com', // Email IP confirmé
    transmission: 'manuelmayi581@gmail.com',
    bss: 'zambouyvand@yahoo.com', // Email BSS confirmé
    power: 'manuelmayi581@gmail.com'
  };

  // Gestion des limitations de session - DÉSACTIVÉES pour test
  private sessionTicketCount = 0;
  private maxTicketsPerSession = 10; // Augmenté pour les tests
  private lastTicketTime = 0;
  private minDelayBetweenTickets = 5000; // Réduit à 5 secondes pour test
  private sessionStartTime = Date.now();

  // Ordre des tickets pour la session
  private ticketOrder = ['bss', 'ip', 'transmission', 'power'];
  private currentTicketIndex = 0;

  // Gestion des délais
  private emailQueue: Array<() => Promise<void>> = [];
  private isProcessingQueue = false;
  private lastEmailTime = 0;
  private minDelayBetweenEmails = 2000; // Réduit à 2 secondes
  private maxRetries = 3;
  private quotaReached = false;
  private isConfigured = false;

  constructor() {
    this.initializeEmailJS();
    this.logSessionLimits();
  }

  private initializeEmailJS() {
    try {
      // Initialiser EmailJS avec la clé publique
      emailjs.init(this.publicKey);
      this.isConfigured = true;
      
      console.log('✅ EmailJS initialisé avec succès');
      console.log(`🔑 Service ID: ${this.serviceId}`);
      console.log(`📧 Template ID: ${this.templateId}`);
      console.log(`🔐 Public Key: ${this.publicKey}`);
      console.log(`📧 Email BSS: ${this.teamEmails.bss}`);
      console.log(`📧 Email IP: ${this.teamEmails.ip}`);
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation EmailJS:', error);
      this.isConfigured = false;
    }
  }

  private logSessionLimits() {
    console.log('📧 CONFIGURATION EMAIL CORRIGÉE:');
    console.log(`📊 Maximum: ${this.maxTicketsPerSession} tickets par session`);
    console.log(`⏰ Délai minimum: ${this.minDelayBetweenTickets / 1000} secondes entre tickets`);
    console.log(`🎯 Ordre des tickets: ${this.ticketOrder.join(' → ')}`);
    console.log(`📅 Session démarrée: ${new Date(this.sessionStartTime).toLocaleString('fr-FR')}`);
    console.log('─'.repeat(60));
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
        reason: `Délai minimum non respecté (${Math.ceil(remainingTime / 1000)} secondes restantes)`,
        nextAvailable
      };
    }

    return { canSend: true };
  }

  private getNextTicketTeam(): string {
    if (this.currentTicketIndex < this.ticketOrder.length) {
      return this.ticketOrder[this.currentTicketIndex];
    }
    // Revenir au début si on a dépassé
    this.currentTicketIndex = 0;
    return this.ticketOrder[0];
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

  private async sendEmailWithRetry(templateParams: any, retryCount = 0): Promise<boolean> {
    try {
      console.log(`📧 Tentative d'envoi ${retryCount + 1}/${this.maxRetries + 1}...`);
      console.log(`📧 Paramètres:`, templateParams);
      
      if (!this.isConfigured) {
        console.log('⚠️ EmailJS non configuré, tentative d\'initialisation...');
        this.initializeEmailJS();
        if (!this.isConfigured) {
          throw new Error('EmailJS non configuré');
        }
      }

      // Envoyer l'email avec EmailJS
      const result = await emailjs.send(
        this.serviceId,
        this.templateId,
        templateParams,
        this.publicKey
      );
      
      console.log(`✅ EMAIL ENVOYÉ AVEC SUCCÈS!`);
      console.log(`📧 Status: ${result.status}`);
      console.log(`📧 Text: ${result.text}`);
      console.log(`📞 Destinataire: ${templateParams.to_email}`);
      console.log(`🔑 Service utilisé: ${this.serviceId}`);
      console.log(`⏰ Heure: ${new Date().toLocaleString('fr-FR')}`);
      console.log('─'.repeat(50));
      
      return true;
      
    } catch (error: any) {
      console.log(`⚠️ Tentative ${retryCount + 1} échouée:`, error);
      console.log(`📧 Erreur détaillée:`, {
        status: error.status,
        text: error.text,
        message: error.message
      });
      
      if (error.status === 426) {
        console.log('🚫 QUOTA EMAILJS ATTEINT');
        this.quotaReached = true;
        return false;
      }
      
      if (error.status === 429 || error.text?.includes('rate limit')) {
        console.log('🚫 Limite de taux atteinte, attente plus longue...');
        if (retryCount < this.maxRetries) {
          const waitTime = Math.pow(2, retryCount) * 5000; // Progression exponentielle
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
      
      console.log('❌ Échec définitif de l\'envoi email après toutes les tentatives');
      return false;
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
      return false;
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
      // Pour les tests, on continue quand même
      console.log(`🧪 MODE TEST: Envoi forcé malgré les limitations`);
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

    // Template parameters optimisés pour EmailJS
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
      company_name: 'MTN Cameroon',
      // Champs supplémentaires pour le template
      message: `Nouveau ticket créé pour le site ${site}. Alarme: ${alarmMessage}`,
      ticket_url: `${window.location.origin}/tickets/${ticketId}`,
      urgency: this.getPriorityFromMessage(alarmMessage) === 'HAUTE' ? 'URGENT' : 'NORMAL'
    };

    console.log(`📧 PRÉPARATION TICKET ${this.sessionTicketCount + 1}/${this.maxTicketsPerSession}`);
    console.log(`📞 Destinataire: ${email}`);
    console.log(`👥 Équipe: ${this.getTeamName(team)}`);
    console.log(`🎫 Ticket: #${ticketId}`);
    console.log(`🏢 Site: ${site}`);
    console.log(`📧 Service: ${this.serviceId}`);
    console.log(`📧 Template: ${this.templateId}`);

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
        } else {
          console.log(`❌ ÉCHEC D'ENVOI DU TICKET à ${email}`);
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
      company_name: 'MTN Cameroon',
      message: `Le ticket #${ticketId} a été mis à jour. Nouveau statut: ${this.getStatusText(status)}`,
      ticket_url: `${window.location.origin}/tickets/${ticketId}`
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
    console.log(`🧪 Test d'envoi d'email FORCÉ pour l'équipe ${team}...`);
    
    try {
      const result = await this.sendTicketNotification(
        team,
        'TEST-' + Date.now(),
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
      issues.push('EmailJS non configuré correctement');
    }
    
    if (!this.serviceId || this.serviceId === 'service_demo') {
      issues.push('Service ID EmailJS non configuré');
    }
    
    if (!this.templateId || this.templateId === 'template_demo') {
      issues.push('Template ID EmailJS non configuré');
    }
    
    return {
      isValid: this.isConfigured && !this.quotaReached && this.serviceId !== 'service_demo',
      issues
    };
  }

  getConfigurationStatus(): string {
    if (this.quotaReached) {
      return `🚫 Configuration EmailJS MTN - QUOTA ATTEINT (Queue: ${this.emailQueue.length} emails en attente)`;
    }
    if (!this.isConfigured) {
      return `⚠️ EmailJS NON CONFIGURÉ - Vérifiez les paramètres (Queue: ${this.emailQueue.length} emails en attente)`;
    }
    return `✅ EmailJS configuré pour VRAIS EMAILS - Service: ${this.serviceId} (Queue: ${this.emailQueue.length} emails en attente)`;
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

  resetSession(): void {
    this.sessionTicketCount = 0;
    this.currentTicketIndex = 0;
    this.lastTicketTime = 0;
    this.sessionStartTime = Date.now();
    this.quotaReached = false;
    console.log('🔄 Session réinitialisée - Nouveaux tickets disponibles');
    this.logSessionLimits();
  }

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

  // Méthode pour forcer l'envoi immédiat (pour debug)
  async forceTestEmail(team: string, email?: string): Promise<boolean> {
    const targetEmail = email || this.teamEmails[team as keyof typeof this.teamEmails];
    
    if (!targetEmail) {
      console.error(`❌ Aucun email pour l'équipe: ${team}`);
      return false;
    }

    console.log(`🚀 ENVOI FORCÉ IMMÉDIAT à ${targetEmail}`);
    
    const templateParams = {
      to_email: targetEmail,
      to_name: this.getTeamName(team),
      ticket_id: 'FORCE-TEST-' + Date.now(),
      site_name: 'BTS-TEST-FORCE',
      alarm_message: 'Test forcé de notification - Vérification configuration EmailJS',
      team_name: this.getTeamName(team),
      status: 'TEST',
      created_date: new Date().toLocaleString('fr-FR'),
      priority: 'HAUTE',
      dashboard_url: window.location.origin,
      from_name: 'MTN Cameroon BTS Monitor',
      subject: `🧪 TEST FORCÉ EmailJS - ${team.toUpperCase()}`,
      company_name: 'MTN Cameroon',
      message: 'Ceci est un test forcé pour vérifier la configuration EmailJS',
      ticket_url: window.location.origin
    };

    return await this.sendEmailWithRetry(templateParams);
  }
}

export const emailService = new EmailService();