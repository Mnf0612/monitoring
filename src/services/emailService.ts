import emailjs from '@emailjs/browser';

class EmailService {
  // Updated EmailJS Configuration based on your dashboard
  private serviceId = 'service_lhzqhxr';
  private templateId = 'template_bts_notification';
  private publicKey = '0NftsL5CxGYcqWcNj';

  // Real team emails for notifications
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
      console.log('🔧 INITIALISATION EMAILJS - NOUVELLE CONFIGURATION');
      console.log(`Service ID: ${this.serviceId}`);
      console.log(`Template ID: ${this.templateId}`);
      console.log(`Public Key: ${this.publicKey}`);
      
      // Initialize EmailJS with the public key
      emailjs.init(this.publicKey);
      this.isConfigured = true;
      
      console.log('✅ EmailJS initialisé avec succès');
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation EmailJS:', error);
      this.isConfigured = false;
    }
  }

  private startQueueProcessor() {
    setInterval(() => {
      this.processEmailQueue();
    }, 3000);
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

    // Add to queue for processing
    this.emailQueue.push({
      type: 'verification',
      params: { email, username, code },
      retries: 0
    });

    // Try to send immediately
    return await this.sendVerificationCodeDirect({ email, username, code });
  }

  private async sendVerificationCodeDirect(params: { email: string; username: string; code: string }): Promise<boolean> {
    if (!this.isConfigured) {
      console.log('❌ EmailJS non configuré');
      return false;
    }

    const { email, username, code } = params;

    // Simplified template parameters that match your EmailJS template
    const templateParams = {
      to_email: email,
      to_name: username,
      from_name: 'MTN Cameroon BTS Monitor',
      subject: `🔐 Code de vérification MTN: ${code}`,
      message: `Bonjour ${username},

Votre code de vérification pour accéder au système BTS Monitor MTN Cameroun est :

🔐 CODE: ${code}

Ce code est valide pendant 10 minutes.

Si vous n'avez pas demandé ce code, ignorez ce message.

Cordialement,
L'équipe MTN Cameroun`,
      verification_code: code,
      user_name: username,
      company_name: 'MTN Cameroun',
      dashboard_url: window.location.origin
    };

    try {
      console.log('🚀 Envoi code de vérification...');
      
      const result = await emailjs.send(
        this.serviceId,
        this.templateId,
        templateParams
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

    // Add to queue
    this.emailQueue.push({
      type: 'ticket',
      params: { team, ticketId, alarmMessage, site },
      retries: 0
    });

    // Try to send immediately
    return await this.sendTicketNotificationDirect({ team, ticketId, alarmMessage, site });
  }

  private async sendTicketNotificationDirect(params: { team: string; ticketId: string; alarmMessage: string; site: string }): Promise<boolean> {
    if (!this.isConfigured) {
      console.log('❌ EmailJS non configuré');
      return false;
    }

    const { team, ticketId, alarmMessage, site } = params;
    const email = this.teamEmails[team as keyof typeof this.teamEmails];
    
    if (!email) {
      console.error(`❌ Aucun email trouvé pour l'équipe: ${team}`);
      return false;
    }

    // Simplified template parameters
    const templateParams = {
      to_email: email,
      to_name: this.getTeamName(team),
      from_name: 'MTN Cameroun BTS Monitor',
      subject: `🚨 NOUVEAU TICKET BTS #${ticketId} - ${site}`,
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
      ticket_id: ticketId,
      site_name: site,
      alarm_message: alarmMessage,
      team_name: this.getTeamName(team),
      status: 'NOUVEAU',
      created_date: new Date().toLocaleString('fr-FR'),
      priority: 'HAUTE',
      company_name: 'MTN Cameroun',
      dashboard_url: window.location.origin
    };

    try {
      console.log('🚀 Envoi notification ticket...');
      console.log('📋 Paramètres:', templateParams);
      
      const result = await emailjs.send(
        this.serviceId,
        this.templateId,
        templateParams
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
    
    // Add to queue
    this.emailQueue.push({
      type: 'update',
      params: { team, ticketId, status, updateMessage },
      retries: 0
    });

    // Try to send immediately
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
      from_name: 'MTN Cameroun BTS Monitor',
      subject: `📋 MISE À JOUR TICKET #${ticketId} - ${this.getStatusText(status)}`,
      message: `📋 MISE À JOUR TICKET BTS

🎫 Ticket: #${ticketId}
🔄 Nouveau statut: ${this.getStatusText(status)}
👥 Équipe: ${this.getTeamName(team)}
💬 Commentaire: ${updateMessage || 'Statut mis à jour'}
⏰ Mis à jour le: ${new Date().toLocaleString('fr-FR')}

🔗 Consultez le dashboard: ${window.location.origin}

Cordialement,
MTN Cameroun - BTS Monitor`,
      ticket_id: ticketId,
      team_name: this.getTeamName(team),
      status: this.getStatusText(status),
      update_message: updateMessage || 'Statut mis à jour',
      updated_date: new Date().toLocaleString('fr-FR'),
      company_name: 'MTN Cameroun',
      dashboard_url: window.location.origin
    };

    try {
      const result = await emailjs.send(
        this.serviceId,
        this.templateId,
        templateParams
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
    } else if (error.status === 400) {
      console.log('❌ DIAGNOSTIC: Paramètres du template incorrects');
      console.log('🔧 Vérifiez que votre template EmailJS contient les bonnes variables');
    } else if (error.status === 401 || error.status === 403) {
      console.log('❌ DIAGNOSTIC: Problème d\'authentification');
      console.log(`🔧 Vérifiez votre clé publique: ${this.publicKey}`);
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

  // Test method with correct configuration
  async testEmail(team: string = 'ip'): Promise<boolean> {
    console.log(`🧪 TEST EMAIL - NOUVELLE CONFIGURATION`);
    console.log(`👥 Équipe: ${team}`);
    
    const email = this.teamEmails[team as keyof typeof this.teamEmails];
    console.log(`📞 Email de test: ${email}`);
    
    if (!email) {
      console.error(`❌ Aucun email pour l'équipe: ${team}`);
      return false;
    }

    const templateParams = {
      to_email: email,
      to_name: this.getTeamName(team),
      from_name: 'MTN Cameroun BTS Monitor - Test',
      subject: '🧪 Test EmailJS MTN - Nouvelle Configuration',
      message: `🧪 Test de la nouvelle configuration EmailJS

Ceci est un test pour vérifier que les emails fonctionnent correctement avec la nouvelle configuration.

Configuration utilisée:
- Service ID: ${this.serviceId}
- Template ID: ${this.templateId}

Si vous recevez cet email, la configuration fonctionne parfaitement !

Cordialement,
MTN Cameroun BTS Monitor`,
      company_name: 'MTN Cameroun',
      dashboard_url: window.location.origin
    };

    try {
      console.log('🚀 Envoi du test avec la nouvelle configuration...');
      
      const result = await emailjs.send(
        this.serviceId,
        this.templateId,
        templateParams
      );
      
      console.log('✅ TEST EMAIL RÉUSSI AVEC LA NOUVELLE CONFIGURATION!');
      console.log('📊 Résultat:', result);
      return true;
      
    } catch (error: any) {
      console.log('❌ TEST EMAIL ÉCHOUÉ');
      this.logDetailedError(error);
      return false;
    }
  }

  async testVerificationCode(email: string = 'manuelmayi581@gmail.com'): Promise<boolean> {
    console.log('🧪 TEST CODE DE VÉRIFICATION - NOUVELLE CONFIG');
    const testCode = Math.random().toString(36).substr(2, 6).toUpperCase();
    return await this.sendVerificationCode(email, 'TestUser', testCode);
  }

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
      ticketsRemaining: 200,
      nextTeam: 'ip',
      canSendNow: true,
      sessionStartTime: new Date().toLocaleString('fr-FR')
    };
  }

  resetQuotaFlag(): void {
    console.log('✅ Queue réinitialisée');
    this.emailQueue.length = 0;
  }

  getConfigurationStatus(): string {
    return `✅ EmailJS configuré - Service: ${this.serviceId} | Template: ${this.templateId} | Nouvelle Configuration Active`;
  }

  async verifyEmailJSConfiguration(): Promise<{ success: boolean; message: string }> {
    console.log('🔍 VÉRIFICATION DE LA NOUVELLE CONFIGURATION EMAILJS');
    
    try {
      const testParams = {
        to_email: 'manuelmayi581@gmail.com',
        to_name: 'Test User',
        from_name: 'BTS Monitor Test',
        subject: 'Test de configuration',
        message: 'Test de la nouvelle configuration EmailJS'
      };
      
      const result = await emailjs.send(
        this.serviceId,
        this.templateId,
        testParams
      );
      
      return {
        success: true,
        message: `✅ Nouvelle configuration EmailJS valide! Status: ${result.status}`
      };
      
    } catch (error: any) {
      let message = '❌ Configuration EmailJS invalide: ';
      
      if (error.status === 400) {
        message += 'Vérifiez les paramètres du template sur dashboard.emailjs.com';
      } else if (error.status === 404) {
        message += 'Service ou Template non trouvé';
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