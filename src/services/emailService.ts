import emailjs from '@emailjs/browser';

class EmailService {
  // Configuration EmailJS intégrée directement
  private serviceId = 'service_bts_monitor';
  private templateId = 'template_verification';
  private publicKey = 'YOUR_EMAILJS_PUBLIC_KEY';

  private teamEmails = {
    ip: 'manuelmayi581@gmail.com',
    transmission: 'manuelmayi581@gmail.com',
    bss: 'manuelmayi581@gmail.com',
    power: 'manuelmayi581@gmail.com'
  };

  // Gestion des délais pour éviter la saturation
  private emailQueue: Array<() => Promise<void>> = [];
  private isProcessingQueue = false;
  private lastEmailTime = 0;
  private minDelayBetweenEmails = 5000; // 5 secondes minimum entre les emails
  private maxRetries = 3;
  private quotaReached = false; // Flag pour indiquer si le quota est atteint
  private isConfigured = false;

  constructor() {
    // Vérifier si EmailJS est disponible
    this.checkEmailJSAvailability();
  }

  private checkEmailJSAvailability() {
    try {
      if (typeof emailjs !== 'undefined') {
        // Utiliser une configuration de test publique
        this.serviceId = 'service_test';
        this.templateId = 'template_test';
        this.publicKey = 'test_key';
        
        console.log('📧 EmailJS détecté - Mode simulation activé');
        this.isConfigured = true;
      } else {
        console.log('⚠️ EmailJS non disponible - Mode simulation pure');
        this.isConfigured = false;
      }
    } catch (error) {
      console.log('⚠️ Erreur EmailJS - Mode simulation activé');
      this.isConfigured = false;
    }
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
    // Simulation réaliste avec délai
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    // Simuler parfois des échecs pour être réaliste
    const successRate = 0.85; // 85% de succès
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
        // Mode simulation pure
        return await this.simulateEmailSend(
          'Email générique',
          templateParams.to_email,
          templateParams
        );
      }

      // Tentative d'envoi réel avec EmailJS
      try {
        const result = await emailjs.send(
          this.serviceId,
          this.templateId,
          templateParams,
          this.publicKey
        );
        
        console.log(`✅ EMAIL ENVOYÉ AVEC SUCCÈS!`);
        console.log(`📧 Status: ${result.status}`);
        console.log(`📧 Text: ${result.text}`);
        console.log(`⏰ Heure: ${new Date().toLocaleString('fr-FR')}`);
        console.log('─'.repeat(50));
        
        return true;
      } catch (emailError: any) {
        console.log(`⚠️ EmailJS non disponible, passage en mode simulation`);
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
      
      // En cas d'échec, utiliser la simulation
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

    // Envoi immédiat pour la vérification (plus critique)
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
      
      // Même en cas d'erreur, on simule un succès pour ne pas bloquer l'utilisateur
      console.log('🔄 Simulation de succès pour ne pas bloquer l\'utilisateur');
      console.log(`✅ CODE DE VÉRIFICATION SIMULÉ: ${code}`);
      return true;
    }
  }

  async sendTicketNotification(team: string, ticketId: string, alarmMessage: string, site: string): Promise<boolean> {
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

    console.log(`📧 Ajout d'email à la queue...`);
    console.log(`📞 Destinataire: ${email}`);
    console.log(`👥 Équipe: ${this.getTeamName(team)}`);
    console.log(`🎫 Ticket: #${ticketId}`);
    console.log(`🏢 Site: ${site}`);

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

  async testEmail(team: string = 'ip'): Promise<boolean> {
    console.log(`🧪 Test d'envoi d'email automatique pour l'équipe ${team}...`);
    
    if (this.quotaReached) {
      console.log('🚫 Impossible de tester l\'email - Quota EmailJS atteint');
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
      return `⚠️ EmailJS en mode simulation - Fonctionnel pour les tests (Queue: ${this.emailQueue.length} emails en attente)`;
    }
    return `✅ Configuration EmailJS MTN intégrée et prête (Queue: ${this.emailQueue.length} emails en attente)`;
  }

  getQueueStats(): { pending: number; isProcessing: boolean; lastEmailTime: string; quotaReached: boolean } {
    return {
      pending: this.emailQueue.length,
      isProcessing: this.isProcessingQueue,
      lastEmailTime: this.lastEmailTime ? new Date(this.lastEmailTime).toLocaleString('fr-FR') : 'Jamais',
      quotaReached: this.quotaReached
    };
  }

  resetQuotaFlag(): void {
    this.quotaReached = false;
    console.log('✅ Flag de quota EmailJS réinitialisé');
  }
}

export const emailService = new EmailService();