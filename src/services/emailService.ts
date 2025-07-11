import emailjs from '@emailjs/browser';

class EmailService {
  // Configuration EmailJS - CORRECTION DES CLÉS
  private serviceId = 'service_lhzqhxr';        // Vérifiez sur dashboard.emailjs.com
  private templateId = 'template_bts_notification'; // Vérifiez que ce template existe
  private publicKey = '0NftsL5CxGYcqWcNj';     // Votre clé publique

  // Template par défaut pour tous les emails
  private defaultTemplateId = 'template_bts_notification';

  private teamEmails = {
    ip: 'manuelmayi581@gmail.com',
    transmission: 'manuelmayi581@gmail.com',
    bss: 'zambouyvand@yahoo.com',
    power: 'manuelmayi581@gmail.com'
  };

  private isConfigured = false;
  private emailQueue: Array<{
    type: 'verification' | 'ticket' | 'update';
    params: any;
    retries: number;
  }> = [];
  private isProcessing = false;

  constructor() {
    this.initializeEmailJS();
    this.startQueueProcessor();
  }

  private initializeEmailJS() {
    try {
      console.log('🔧 INITIALISATION EMAILJS - VÉRIFICATION DES CLÉS');
      console.log(`Service ID: ${this.serviceId}`);
      console.log(`Template ID: ${this.templateId}`);
      console.log(`Public Key: ${this.publicKey}`);
      console.log('🔗 Vérifiez ces valeurs sur: https://dashboard.emailjs.com/admin');
      
      // Initialiser EmailJS avec votre clé publique
      emailjs.init(this.publicKey);
      this.isConfigured = true;
      
      console.log('✅ EmailJS initialisé avec succès');
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation EmailJS:', error);
      this.isConfigured = false;
    }
  }

  private startQueueProcessor() {
    // Traiter la queue d'emails toutes les 5 secondes
    setInterval(() => {
      this.processEmailQueue();
    }, 5000);
  }

  private async processEmailQueue() {
    if (this.isProcessing || this.emailQueue.length === 0) return;

    this.isProcessing = true;
    const emailToSend = this.emailQueue.shift();

    if (emailToSend) {
      try {
        let success = false;

        switch (emailToSend.type) {
          case 'verification':
            success = await this.sendVerificationCodeDirect(emailToSend.params);
            break;
          case 'ticket':
            success = await this.sendTicketNotificationDirect(emailToSend.params);
            break;
          case 'update':
            success = await this.sendTicketUpdateDirect(emailToSend.params);
            break;
        }

        if (!success && emailToSend.retries < 3) {
          // Remettre en queue avec retry
          emailToSend.retries++;
          this.emailQueue.push(emailToSend);
          console.log(`🔄 Email remis en queue (tentative ${emailToSend.retries}/3)`);
        }

      } catch (error) {
        console.error('❌ Erreur lors du traitement de la queue email:', error);
      }
    }

    this.isProcessing = false;
  }

  async sendVerificationCode(email: string, username: string, code: string): Promise<boolean> {
    console.log(`📧 ENVOI CODE DE VÉRIFICATION`);
    console.log(`📞 Email: ${email}`);
    console.log(`👤 Utilisateur: ${username}`);
    console.log(`🔐 Code: ${code}`);

    // Ajouter à la queue pour traitement
    this.emailQueue.push({
      type: 'verification',
      params: { email, username, code },
      retries: 0
    });

    // Essayer d'envoyer immédiatement aussi
    return await this.sendVerificationCodeDirect({ email, username, code });
  }

  private async sendVerificationCodeDirect(params: { email: string; username: string; code: string }): Promise<boolean> {
    if (!this.isConfigured) {
      console.log('❌ EmailJS non configuré - Vérifiez vos clés');
      return false;
    }

    const { email, username, code } = params;

    // Template pour code de vérification
    const templateParams = {
      to_email: email,
      to_name: username,
      verification_code: code,
      user_name: username,
      from_name: 'MTN Cameroon BTS Monitor',
      subject: `🔐 Code de vérification MTN: ${code}`,
      message: `Bonjour ${username},

Votre code de vérification pour accéder au système BTS Monitor MTN Cameroun est :

🔐 CODE: ${code}

Ce code est valide pendant 10 minutes.

Si vous n'avez pas demandé ce code, ignorez ce message.

Cordialement,
L'équipe MTN Cameroun`,
      company_name: 'MTN Cameroun',
      dashboard_url: window.location.origin
    };

    try {
      console.log('🚀 Envoi code de vérification...');
      console.log('📋 Paramètres du template:', templateParams);
      
      const result = await emailjs.send(
        this.serviceId,
        this.templateId,
        templateParams,
        this.publicKey
      );
      
      console.log('✅ CODE DE VÉRIFICATION ENVOYÉ!');
      console.log('📊 Résultat EmailJS:', result);
      return true;
      
    } catch (error: any) {
      console.log('❌ ÉCHEC ENVOI CODE DE VÉRIFICATION');
      this.logDetailedError(error);
      return false;
    }
  }

  async sendTicketNotification(team: string, ticketId: string, alarmMessage: string, site: string): Promise<boolean> {
    console.log(`📧 ENVOI NOTIFICATION TICKET`);
    console.log(`👥 Équipe: ${team}`);
    console.log(`🎫 Ticket: ${ticketId}`);
    console.log(`🏢 Site: ${site}`);

    // Ajouter à la queue
    this.emailQueue.push({
      type: 'ticket',
      params: { team, ticketId, alarmMessage, site },
      retries: 0
    });

    // Essayer d'envoyer immédiatement
    return await this.sendTicketNotificationDirect({ team, ticketId, alarmMessage, site });
  }

  private async sendTicketNotificationDirect(params: { team: string; ticketId: string; alarmMessage: string; site: string }): Promise<boolean> {
    if (!this.isConfigured) {
      console.log('❌ EmailJS non configuré - Vérifiez vos clés sur dashboard.emailjs.com');
      return false;
    }

    const { team, ticketId, alarmMessage, site } = params;
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
      status: 'NOUVEAU',
      created_date: new Date().toLocaleString('fr-FR'),
      priority: 'HAUTE',
      from_name: 'MTN Cameroun BTS Monitor',
      subject: `🚨 NOUVEAU TICKET BTS #${ticketId} - ${site}`,
      company_name: 'MTN Cameroun',
      message: `🚨 NOUVEAU TICKET BTS

📍 Site: ${site}
🎫 Ticket: #${ticketId}
⚠️ Alarme: ${alarmMessage}
👥 Équipe assignée: ${this.getTeamName(team)}
📊 Statut: NOUVEAU
⏰ Créé le: ${new Date().toLocaleString('fr-FR')}
🔥 Priorité: HAUTE

🔗 Accédez au dashboard: ${window.location.origin}

Action requise: Veuillez vous connecter au système pour traiter ce ticket.

Cordialement,
MTN Cameroun - BTS Monitor`,
      dashboard_url: window.location.origin
    };

    try {
      console.log('🚀 Envoi notification ticket...');
      console.log('🔧 Service ID utilisé:', this.serviceId);
      console.log('🔧 Template ID utilisé:', this.templateId);
      console.log('📋 Paramètres du template:', templateParams);
      
      const result = await emailjs.send(
        this.serviceId,
        this.templateId,
        templateParams,
        this.publicKey
      );
      
      console.log('✅ NOTIFICATION TICKET ENVOYÉE!');
      console.log(`📞 Destinataire: ${email}`);
      console.log('📊 Résultat:', result);
      return true;
      
    } catch (error: any) {
      console.log('❌ ÉCHEC ENVOI NOTIFICATION TICKET');
      this.logDetailedError(error);
      return false;
    }
  }

  async sendTicketUpdate(team: string, ticketId: string, status: string, updateMessage?: string): Promise<boolean> {
    console.log(`📧 ENVOI MISE À JOUR TICKET`);
    
    // Ajouter à la queue
    this.emailQueue.push({
      type: 'update',
      params: { team, ticketId, status, updateMessage },
      retries: 0
    });

    // Essayer d'envoyer immédiatement
    return await this.sendTicketUpdateDirect({ team, ticketId, status, updateMessage });
  }

  private async sendTicketUpdateDirect(params: { team: string; ticketId: string; status: string; updateMessage?: string }): Promise<boolean> {
    if (!this.isConfigured) {
      console.log('❌ EmailJS non configuré');
      return false;
    }

    const { team, ticketId, status, updateMessage } = params;
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
      from_name: 'MTN Cameroun BTS Monitor',
      subject: `📋 MISE À JOUR TICKET #${ticketId} - ${this.getStatusText(status)}`,
      company_name: 'MTN Cameroun',
      message: `📋 MISE À JOUR TICKET BTS

🎫 Ticket: #${ticketId}
🔄 Nouveau statut: ${this.getStatusText(status)}
👥 Équipe: ${this.getTeamName(team)}
💬 Commentaire: ${updateMessage || 'Statut mis à jour'}
⏰ Mis à jour le: ${new Date().toLocaleString('fr-FR')}

🔗 Consultez le dashboard: ${window.location.origin}

Cordialement,
MTN Cameroun - BTS Monitor`,
      dashboard_url: window.location.origin
    };

    try {
      const result = await emailjs.send(
        this.serviceId,
        this.templateId,
        templateParams,
        this.publicKey
      );
      
      console.log('✅ MISE À JOUR TICKET ENVOYÉE!');
      console.log('📊 Résultat:', result);
      return true;
      
    } catch (error: any) {
      console.log('❌ ÉCHEC ENVOI MISE À JOUR TICKET');
      this.logDetailedError(error);
      return false;
    }
  }

  private logDetailedError(error: any) {
    console.log('🔍 ANALYSE DÉTAILLÉE DE L\'ERREUR:');
    console.log('📊 Erreur complète:', error);
    console.log('📊 Status:', error.status);
    console.log('📊 Text:', error.text);
    console.log('📊 Message:', error.message);
    
    if (error.status === 404) {
      console.log('❌ DIAGNOSTIC: Service ID ou Template ID incorrect');
      console.log('🔧 VÉRIFIEZ:');
      console.log(`   - Service ID: ${this.serviceId}`);
      console.log(`   - Template ID: ${this.templateId}`);
      console.log('   - Que le template existe dans votre dashboard EmailJS');
    } else if (error.status === 400) {
      console.log('❌ DIAGNOSTIC: Service ID non trouvé ou invalide');
      console.log('🔧 ACTIONS À FAIRE:');
      console.log('   1. Allez sur https://dashboard.emailjs.com/admin');
      console.log('   2. Vérifiez votre Service ID dans la section "Email Services"');
      console.log('   3. Vérifiez que le service est actif');
      console.log(`   4. Service ID actuel: ${this.serviceId}`);
    } else if (error.status === 401 || error.status === 403) {
      console.log('❌ DIAGNOSTIC: Problème d\'authentification');
      console.log(`🔧 Vérifiez votre clé publique: ${this.publicKey}`);
    } else if (error.status === 426) {
      console.log('❌ DIAGNOSTIC: Quota EmailJS atteint');
      console.log('🔧 Attendez le renouvellement ou upgradez votre plan');
    } else if (error.status === 429) {
      console.log('❌ DIAGNOSTIC: Limite de taux atteinte');
      console.log('🔧 Attendez quelques minutes avant de réessayer');
    } else if (error.status === 0) {
      console.log('❌ DIAGNOSTIC: Problème de réseau ou CORS');
    }
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

  // Test avec vos vraies clés
  async testEmail(team: string = 'ip'): Promise<boolean> {
    console.log(`🧪 TEST EMAIL - DIAGNOSTIC COMPLET`);
    console.log(`👥 Équipe: ${team}`);
    console.log(`🔧 Service ID: ${this.serviceId}`);
    console.log(`🔧 Template ID: ${this.templateId}`);
    console.log(`🔧 Public Key: ${this.publicKey}`);
    
    const email = this.teamEmails[team as keyof typeof this.teamEmails];
    console.log(`📞 Email de test: ${email}`);
    
    if (!email) {
      console.error(`❌ Aucun email pour l'équipe: ${team}`);
      return false;
    }

    const templateParams = {
      to_email: email,
      to_name: this.getTeamName(team),
      message: '🧪 Test de configuration EmailJS avec vos clés',
      from_name: 'MTN Cameroun BTS Monitor - Test',
      subject: '🧪 Test EmailJS MTN',
      company_name: 'MTN Cameroun',
      ticket_id: 'TEST-001',
      site_name: 'BTS-TEST-001',
      alarm_message: 'Test de configuration',
      team_name: this.getTeamName(team),
      status: 'TEST',
      created_date: new Date().toLocaleString('fr-FR'),
      priority: 'TEST',
      dashboard_url: window.location.origin
    };

    try {
      console.log('🚀 Envoi du test avec vos clés...');
      console.log('📋 Template params:', templateParams);
      
      const result = await emailjs.send(
        this.serviceId,
        this.templateId,
        templateParams,
        this.publicKey
      );
      
      console.log('✅ TEST EMAIL RÉUSSI AVEC VOS CLÉS!');
      console.log('📊 Résultat:', result);
      return true;
      
    } catch (error: any) {
      console.log('❌ TEST EMAIL ÉCHOUÉ');
      console.log('🔧 Vérifiez vos clés sur: https://dashboard.emailjs.com/admin');
      this.logDetailedError(error);
      return false;
    }
  }

  // Test spécifique pour code de vérification
  async testVerificationCode(email: string = 'manuelmayi581@gmail.com'): Promise<boolean> {
    console.log('🧪 TEST CODE DE VÉRIFICATION');
    const testCode = Math.random().toString(36).substr(2, 6).toUpperCase();
    return await this.sendVerificationCode(email, 'TestUser', testCode);
  }

  // Statistiques de la queue
  getQueueStats() {
    return {
      pending: this.emailQueue.length,
      isProcessing: this.isProcessing,
      lastEmailTime: new Date().toLocaleString('fr-FR'),
      quotaReached: false,
      nextTicketTeam: 'ip',
      nextAvailableTime: null
    };
  }

  getSessionStatus() {
    return {
      ticketsUsed: 0,
      ticketsRemaining: 100,
      nextTeam: 'ip',
      canSendNow: true,
      sessionStartTime: new Date().toLocaleString('fr-FR')
    };
  }

  resetQuotaFlag(): void {
    console.log('✅ Queue réinitialisée');
    this.emailQueue.length = 0;
  }

  resetSession(): void {
    console.log('🔄 Session email réinitialisée');
    this.emailQueue.length = 0;
  }

  // Vérification de la configuration
  checkConfiguration(): { isValid: boolean; issues: string[] } {
    const issues: string[] = [];
    
    if (!this.isConfigured) {
      issues.push('EmailJS non initialisé');
    }
    
    if (!this.serviceId) {
      issues.push('Service ID manquant');
    }
    
    if (!this.templateId) {
      issues.push('Template ID manquant');
    }
    
    if (!this.publicKey) {
      issues.push('Clé publique manquante');
    }
    
    return {
      isValid: issues.length === 0,
      issues
    };
  }

  getConfigurationStatus(): string {
    const config = this.checkConfiguration();
    
    if (config.isValid) {
      return `✅ EmailJS configuré - Service: ${this.serviceId} | Template: ${this.templateId}`;
    } else {
      return `❌ Problèmes: ${config.issues.join(', ')}`;
    }
  }

  // Nouvelle méthode pour vérifier la configuration EmailJS
  async verifyEmailJSConfiguration(): Promise<{ success: boolean; message: string }> {
    console.log('🔍 VÉRIFICATION DE LA CONFIGURATION EMAILJS');
    console.log('🔗 Dashboard: https://dashboard.emailjs.com/admin');
    console.log(`🔧 Service ID: ${this.serviceId}`);
    console.log(`🔧 Template ID: ${this.templateId}`);
    console.log(`🔧 Public Key: ${this.publicKey}`);
    
    try {
      // Test simple avec paramètres minimaux
      const testParams = {
        to_email: 'manuelmayi581@gmail.com',
        to_name: 'Test User',
        message: 'Test de configuration EmailJS',
        from_name: 'BTS Monitor Test'
      };
      
      const result = await emailjs.send(
        this.serviceId,
        this.templateId,
        testParams,
        this.publicKey
      );
      
      return {
        success: true,
        message: `✅ Configuration EmailJS valide! Status: ${result.status}`
      };
      
    } catch (error: any) {
      let message = '❌ Configuration EmailJS invalide: ';
      
      if (error.status === 400) {
        message += 'Service ID non trouvé. Vérifiez sur dashboard.emailjs.com';
      } else if (error.status === 404) {
        message += 'Template ID non trouvé. Créez le template sur dashboard.emailjs.com';
      } else if (error.status === 401 || error.status === 403) {
        message += 'Clé publique invalide. Vérifiez votre Public Key';
      } else {
        message += error.text || error.message || 'Erreur inconnue';
      }
      
      return {
        success: false,
        message
      };
    }
  }
}

export const emailService = new EmailService();