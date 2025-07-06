import emailjs from '@emailjs/browser';

class EmailService {
  // Configuration EmailJS intégrée directement
  private serviceId = 'Alarm_alerte';
  private templateId = 'template_bts_ticket';
  private publicKey = 'enCPeU5Qt9qR3j9jl';

  private teamEmails = {
    ip: 'operator.ip@mtn.cm',
    transmission: 'tech.transmission@mtn.cm',
    bss: 'tech.bss@mtn.cm',
    power: 'tech.power@mtn.cm'
  };

  // Gestion des délais pour éviter la saturation
  private emailQueue: Array<() => Promise<void>> = [];
  private isProcessingQueue = false;
  private lastEmailTime = 0;
  private minDelayBetweenEmails = 5000; // 5 secondes minimum entre les emails
  private maxRetries = 3;
  private quotaReached = false; // Flag pour indiquer si le quota est atteint

  constructor() {
    // Initialiser EmailJS automatiquement
    emailjs.init(this.publicKey);
    console.log('✅ EmailJS initialisé automatiquement avec la configuration MTN');
    
    // Démarrer le processeur de queue
    this.startQueueProcessor();
  }

  private async startQueueProcessor() {
    if (this.isProcessingQueue) return;
    
    this.isProcessingQueue = true;
    
    while (this.emailQueue.length > 0) {
      // Vérifier si le quota est atteint
      if (this.quotaReached) {
        console.log('🚫 Quota EmailJS atteint - Arrêt du traitement de la queue');
        break;
      }

      const emailTask = this.emailQueue.shift();
      if (emailTask) {
        // Vérifier le délai minimum
        const now = Date.now();
        const timeSinceLastEmail = now - this.lastEmailTime;
        
        if (timeSinceLastEmail < this.minDelayBetweenEmails) {
          const waitTime = this.minDelayBetweenEmails - timeSinceLastEmail;
          console.log(`⏳ Attente de ${waitTime}ms avant le prochain email pour éviter la saturation...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
        
        try {
          await emailTask();
          this.lastEmailTime = Date.now();
        } catch (error) {
          console.error('❌ Erreur lors du traitement de l\'email en queue:', error);
        }
        
        // Petite pause entre chaque email
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    this.isProcessingQueue = false;
  }

  private async sendEmailWithRetry(templateParams: any, retryCount = 0): Promise<boolean> {
    try {
      console.log(`📧 Tentative d'envoi ${retryCount + 1}/${this.maxRetries + 1}...`);
      
      const result = await emailjs.send(
        this.serviceId,
        this.templateId,
        templateParams
      );
      
      console.log(`✅ EMAIL ENVOYÉ AVEC SUCCÈS!`);
      console.log(`📧 Status: ${result.status}`);
      console.log(`📧 Text: ${result.text}`);
      console.log(`⏰ Heure: ${new Date().toLocaleString('fr-FR')}`);
      console.log('─'.repeat(50));
      
      return true;
    } catch (error: any) {
      console.log(`⚠️ Tentative ${retryCount + 1} échouée:`, error);
      
      // Vérifier si le quota EmailJS est atteint (status 426)
      if (error.status === 426) {
        console.log('🚫 QUOTA EMAILJS ATTEINT - Impossible d\'envoyer plus d\'emails');
        console.log('💡 Veuillez attendre la réinitialisation du quota ou upgrader votre plan EmailJS');
        this.quotaReached = true;
        return false;
      }
      
      // Vérifier le type d'erreur pour les autres cas
      if (error.status === 429 || error.text?.includes('rate limit')) {
        console.log('🚫 Limite de taux atteinte, attente plus longue...');
        if (retryCount < this.maxRetries) {
          const waitTime = Math.pow(2, retryCount) * 10000; // Backoff exponentiel
          console.log(`⏳ Attente de ${waitTime}ms avant nouvelle tentative...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          return this.sendEmailWithRetry(templateParams, retryCount + 1);
        }
      } else if (error.status === 0 || error.text?.includes('network')) {
        console.log('🌐 Erreur réseau détectée');
        if (retryCount < this.maxRetries) {
          const waitTime = 3000 + (retryCount * 2000); // 3s, 5s, 7s
          console.log(`⏳ Nouvelle tentative dans ${waitTime}ms...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          return this.sendEmailWithRetry(templateParams, retryCount + 1);
        }
      }
      
      return false;
    }
  }

  async sendVerificationCode(email: string, username: string, code: string): Promise<boolean> {
    // Vérifier si le quota est atteint avant d'ajouter à la queue
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
      system_name: 'BTS Monitor'
    };

    console.log(`📧 Ajout d'email de vérification à la queue...`);
    console.log(`📞 Destinataire: ${email}`);
    console.log(`👤 Utilisateur: ${username}`);
    console.log(`🔐 Code: ${code}`);

    // Ajouter à la queue au lieu d'envoyer immédiatement
    return new Promise((resolve) => {
      this.emailQueue.push(async () => {
        const result = await this.sendEmailWithRetry(templateParams);
        resolve(result);
      });
      
      // Démarrer le processeur si nécessaire
      if (!this.isProcessingQueue) {
        this.startQueueProcessor();
      }
    });
  }

  async sendTicketNotification(team: string, ticketId: string, alarmMessage: string, site: string): Promise<boolean> {
    // Vérifier si le quota est atteint avant d'ajouter à la queue
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

    // Ajouter à la queue au lieu d'envoyer immédiatement
    return new Promise((resolve) => {
      this.emailQueue.push(async () => {
        const result = await this.sendEmailWithRetry(templateParams);
        resolve(result);
      });
      
      // Démarrer le processeur si nécessaire
      if (!this.isProcessingQueue) {
        this.startQueueProcessor();
      }
    });
  }

  async sendTicketUpdate(team: string, ticketId: string, status: string, updateMessage?: string): Promise<boolean> {
    // Vérifier si le quota est atteint avant d'ajouter à la queue
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

    // Ajouter à la queue
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

  // Méthode pour tester l'envoi d'email avec gestion d'erreur améliorée
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
        console.log('❌ Test d\'email échoué - Vérifiez votre connexion internet ou le quota EmailJS');
      }
      
      return result;
    } catch (error) {
      console.error('❌ Erreur lors du test d\'email:', error);
      return false;
    }
  }

  // Méthode pour vérifier la configuration (toujours valide maintenant)
  checkConfiguration(): { isValid: boolean; issues: string[] } {
    const issues: string[] = [];
    
    if (this.quotaReached) {
      issues.push('Quota EmailJS atteint - Impossible d\'envoyer des emails');
    }
    
    return {
      isValid: !this.quotaReached,
      issues
    };
  }

  // Méthode pour obtenir le statut de la configuration
  getConfigurationStatus(): string {
    if (this.quotaReached) {
      return `🚫 Configuration EmailJS MTN - QUOTA ATTEINT (Queue: ${this.emailQueue.length} emails en attente)`;
    }
    return `✅ Configuration EmailJS MTN intégrée et prête (Queue: ${this.emailQueue.length} emails en attente)`;
  }

  // Méthode pour obtenir les statistiques de la queue
  getQueueStats(): { pending: number; isProcessing: boolean; lastEmailTime: string; quotaReached: boolean } {
    return {
      pending: this.emailQueue.length,
      isProcessing: this.isProcessingQueue,
      lastEmailTime: this.lastEmailTime ? new Date(this.lastEmailTime).toLocaleString('fr-FR') : 'Jamais',
      quotaReached: this.quotaReached
    };
  }

  // Méthode pour réinitialiser le flag de quota (utile pour les tests ou après upgrade du plan)
  resetQuotaFlag(): void {
    this.quotaReached = false;
    console.log('✅ Flag de quota EmailJS réinitialisé');
  }
}

export const emailService = new EmailService();