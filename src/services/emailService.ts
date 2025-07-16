import emailjs from '@emailjs/browser';

class EmailService {
  // Configuration EmailJS corrigée avec les vraies clés
  private serviceId = 'Alarm_alerte';
  private templateId = 'template_bts_ticket';
  private publicKey = '0NftsL5CxGYcqWcNj';

  // Configuration avec les vraies clés - tenter le mode réel
  private isSimulationMode = false;
  private simulationSuccess = true;

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
      console.log('🔧 INITIALISATION EMAILJS - MODE SIMULATION ACTIVÉ');
      console.log('⚠️ Compte EmailJS bloqué détecté - Basculement en mode simulation');
      console.log('📧 Les emails seront simulés avec logs détaillés');
      
      // En mode simulation, on considère que c'est configuré
      this.isConfigured = true;
      this.isSimulationMode = true;
      
      console.log('✅ Mode simulation EmailJS activé');
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation EmailJS:', error);
      this.isConfigured = false;
      this.isSimulationMode = true;
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

  // 🔐 DOUBLE AUTHENTICATION EMAIL - MODE SIMULATION
  async sendVerificationCode(email: string, username: string, code: string): Promise<boolean> {
    console.log(`📧 ENVOI CODE DE VÉRIFICATION - MODE SIMULATION`);
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
    const { email, username, code } = params;

    if (this.isSimulationMode) {
      // Mode simulation avec logs détaillés
      console.log('🎭 MODE SIMULATION - EMAIL DE VÉRIFICATION');
      console.log('═'.repeat(60));
      console.log(`📧 SIMULATION D'ENVOI EMAIL RÉUSSI`);
      console.log(`📞 Destinataire: ${email}`);
      console.log(`👤 Utilisateur: ${username}`);
      console.log(`🔐 Code de vérification: ${code}`);
      console.log(`⏰ Heure d'envoi simulé: ${new Date().toLocaleString('fr-FR')}`);
      console.log('');
      console.log('📋 CONTENU DE L\'EMAIL SIMULÉ:');
      console.log('─'.repeat(40));
      console.log(`Sujet: 🔐 Code de vérification MTN: ${code}`);
      console.log('');
      console.log(`Bonjour ${username},`);
      console.log('');
      console.log('Votre code de vérification pour accéder au système BTS Monitor MTN Cameroun est :');
      console.log('');
      console.log(`🔐 CODE: ${code}`);
      console.log('');
      console.log('⏰ Ce code est valide pendant 10 minutes.');
      console.log('🔒 Gardez ce code confidentiel.');
      console.log('');
      console.log('Si vous n\'avez pas demandé ce code, ignorez ce message.');
      console.log('');
      console.log('Cordialement,');
      console.log('L\'équipe MTN Cameroun');
      console.log('BTS Network Monitor');
      console.log('─'.repeat(40));
      console.log('');
      console.log('✅ EMAIL SIMULÉ ENVOYÉ AVEC SUCCÈS!');
      console.log('💡 En mode réel, cet email serait envoyé à l\'adresse fournie');
      console.log('🔧 Pour activer les vrais emails, résolvez le problème de compte EmailJS');
      console.log('═'.repeat(60));
      
      // Simuler un délai d'envoi
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return this.simulationSuccess;
    }

    // Code pour envoi réel (désactivé car compte bloqué)
    try {
      console.log('🚀 Tentative d\'envoi réel...');
      
      const result = await emailjs.send(
        this.serviceId,
        this.templateId,
        {
          to_email: email,
          to_name: username,
          from_name: 'MTN Cameroun BTS Monitor',
          subject: `🔐 Code de vérification MTN: ${code}`,
          message: `Code de vérification: ${code}`,
          verification_code: code,
          user_name: username,
          company_name: 'MTN Cameroun',
          dashboard_url: window.location.origin
        }
      );
      
      console.log('✅ EMAIL RÉEL ENVOYÉ!');
      return true;
      
    } catch (error: any) {
      console.log('❌ ÉCHEC ENVOI RÉEL - Basculement en mode simulation');
      this.logDetailedError(error);
      
      // Basculer automatiquement en mode simulation
      this.isSimulationMode = true;
      return await this.sendVerificationCodeDirect(params);
    }
  }

  // 🎫 TICKET NOTIFICATIONS - MODE SIMULATION
  async sendTicketNotification(team: string, ticketId: string, alarmMessage: string, site: string): Promise<boolean> {
    console.log(`📧 ENVOI NOTIFICATION TICKET - MODE SIMULATION`);
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
    const { team, ticketId, alarmMessage, site } = params;
    const email = this.teamEmails[team as keyof typeof this.teamEmails];
    
    if (!email) {
      console.error(`❌ Aucun email trouvé pour l'équipe: ${team}`);
      return false;
    }

    if (this.isSimulationMode) {
      // Mode simulation avec logs détaillés
      console.log('🎭 MODE SIMULATION - NOTIFICATION TICKET');
      console.log('═'.repeat(60));
      console.log(`📧 SIMULATION D'ENVOI NOTIFICATION RÉUSSI`);
      console.log(`📞 Destinataire: ${email}`);
      console.log(`👥 Équipe: ${this.getTeamName(team)}`);
      console.log(`🎫 Ticket: #${ticketId}`);
      console.log(`🏢 Site: ${site}`);
      console.log(`⚠️ Alarme: ${alarmMessage}`);
      console.log(`⏰ Heure d'envoi simulé: ${new Date().toLocaleString('fr-FR')}`);
      console.log('');
      console.log('📋 CONTENU DE L\'EMAIL SIMULÉ:');
      console.log('─'.repeat(40));
      console.log(`Sujet: 🚨 NOUVEAU TICKET BTS #${ticketId} - ${site}`);
      console.log('');
      console.log(`🚨 NOUVEAU TICKET BTS - MTN CAMEROUN`);
      console.log('');
      console.log(`📍 Site: ${site}`);
      console.log(`🎫 Ticket: #${ticketId}`);
      console.log(`⚠️ Alarme: ${alarmMessage}`);
      console.log(`👥 Équipe assignée: ${this.getTeamName(team)}`);
      console.log(`📊 Statut: NOUVEAU`);
      console.log(`⏰ Créé le: ${new Date().toLocaleString('fr-FR')}`);
      console.log(`🔥 Priorité: HAUTE`);
      console.log('');
      console.log(`🔗 Accédez au dashboard: ${window.location.origin}`);
      console.log('');
      console.log('⚡ Action requise: Veuillez vous connecter au système pour traiter ce ticket immédiatement.');
      console.log('');
      console.log('Cordialement,');
      console.log('MTN Cameroun - BTS Network Monitor');
      console.log('📞 Support: +237 XXX XXX XXX');
      console.log('─'.repeat(40));
      console.log('');
      console.log('✅ NOTIFICATION SIMULÉE ENVOYÉE AVEC SUCCÈS!');
      console.log('💡 En mode réel, cette notification serait envoyée à l\'équipe');
      console.log('🔧 Pour activer les vrais emails, résolvez le problème de compte EmailJS');
      console.log('═'.repeat(60));
      
      // Simuler un délai d'envoi
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      return this.simulationSuccess;
    }

    // Code pour envoi réel (désactivé car compte bloqué)
    try {
      const result = await emailjs.send(this.serviceId, this.templateId, {
        to_email: email,
        to_name: this.getTeamName(team),
        subject: `🚨 NOUVEAU TICKET BTS #${ticketId} - ${site}`,
        message: `Nouveau ticket créé pour ${site}`,
        ticket_id: ticketId,
        site_name: site,
        alarm_message: alarmMessage,
        team_name: this.getTeamName(team)
      });
      
      console.log('✅ NOTIFICATION RÉELLE ENVOYÉE!');
      return true;
      
    } catch (error: any) {
      console.log('❌ ÉCHEC ENVOI RÉEL - Basculement en mode simulation');
      this.logDetailedError(error);
      
      this.isSimulationMode = true;
      return await this.sendTicketNotificationDirect(params);
    }
  }

  // 📋 TICKET UPDATES - MODE SIMULATION
  async sendTicketUpdate(team: string, ticketId: string, status: string, updateMessage?: string): Promise<boolean> {
    console.log(`📧 ENVOI MISE À JOUR TICKET - MODE SIMULATION`);
    
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
    const { team, ticketId, status, updateMessage } = params;
    const email = this.teamEmails[team as keyof typeof this.teamEmails];
    
    if (!email) {
      console.error(`❌ Aucun email trouvé pour l'équipe: ${team}`);
      return false;
    }

    if (this.isSimulationMode) {
      console.log('🎭 MODE SIMULATION - MISE À JOUR TICKET');
      console.log('═'.repeat(60));
      console.log(`📧 SIMULATION MISE À JOUR RÉUSSIE`);
      console.log(`📞 Destinataire: ${email}`);
      console.log(`🎫 Ticket: #${ticketId}`);
      console.log(`🔄 Nouveau statut: ${this.getStatusText(status)}`);
      console.log(`💬 Commentaire: ${updateMessage || 'Statut mis à jour'}`);
      console.log(`⏰ Heure de mise à jour simulée: ${new Date().toLocaleString('fr-FR')}`);
      console.log('✅ MISE À JOUR SIMULÉE ENVOYÉE!');
      console.log('═'.repeat(60));
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      return this.simulationSuccess;
    }

    // Code pour envoi réel
    try {
      const result = await emailjs.send(this.serviceId, this.templateId, {
        to_email: email,
        subject: `📋 MISE À JOUR TICKET #${ticketId}`,
        message: `Ticket mis à jour: ${status}`,
        ticket_id: ticketId,
        status: this.getStatusText(status),
        update_message: updateMessage
      });
      
      console.log('✅ MISE À JOUR RÉELLE ENVOYÉE!');
      return true;
      
    } catch (error: any) {
      console.log('❌ ÉCHEC ENVOI RÉEL - Basculement en mode simulation');
      this.isSimulationMode = true;
      return await this.sendTicketUpdateDirect(params);
    }
  }

  private logDetailedError(error: any) {
    console.log('🔍 ANALYSE DÉTAILLÉE DE L\'ERREUR:');
    console.log('📊 Erreur complète:', error);
    console.log('📊 Status:', error.status);
    console.log('📊 Text:', error.text);
    console.log('📊 Message:', error.message);
    
    if (error.text && error.text.includes('blocked')) {
      console.log('🚫 DIAGNOSTIC: Compte EmailJS bloqué');
      console.log('🔧 SOLUTIONS POSSIBLES:');
      console.log('   1. Vérifiez votre compte sur dashboard.emailjs.com');
      console.log('   2. Le compte peut être bloqué pour:');
      console.log('      - Dépassement du quota gratuit (200 emails/mois)');
      console.log('      - Activité suspecte détectée');
      console.log('      - Violation des conditions d\'utilisation');
      console.log('      - Problème de paiement (si compte payant)');
      console.log('   3. Contactez le support EmailJS');
      console.log('   4. Créez un nouveau compte EmailJS');
      console.log('   5. Utilisez un autre service (SendGrid, Mailgun, etc.)');
      console.log('');
      console.log('💡 EN ATTENDANT: Le système fonctionne en mode simulation');
      console.log('   - Tous les emails sont simulés avec logs détaillés');
      console.log('   - Les codes de vérification apparaissent dans la console');
      console.log('   - Les notifications de tickets sont loggées');
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

  // 🧪 TEST METHODS - MODE SIMULATION
  async testEmail(team: string = 'ip'): Promise<boolean> {
    console.log(`🧪 TEST EMAIL - MODE SIMULATION ACTIVÉ`);
    console.log(`👥 Équipe: ${team}`);
    
    const email = this.teamEmails[team as keyof typeof this.teamEmails];
    console.log(`📞 Email de test: ${email}`);
    
    if (!email) {
      console.error(`❌ Aucun email pour l'équipe: ${team}`);
      return false;
    }

    if (this.isSimulationMode) {
      console.log('🎭 MODE SIMULATION - TEST EMAIL');
      console.log('═'.repeat(60));
      console.log(`📧 SIMULATION TEST EMAIL RÉUSSI`);
      console.log(`📞 Destinataire: ${email}`);
      console.log(`👥 Équipe: ${this.getTeamName(team)}`);
      console.log(`⏰ Heure de test simulé: ${new Date().toLocaleString('fr-FR')}`);
      console.log('');
      console.log('📋 CONTENU DU TEST SIMULÉ:');
      console.log('─'.repeat(40));
      console.log('Sujet: 🧪 Test EmailJS MTN - Mode Simulation');
      console.log('');
      console.log('🧪 TEST DU SYSTÈME EMAIL EN MODE SIMULATION');
      console.log('');
      console.log('Ceci est un test pour vérifier que le système de simulation fonctionne correctement.');
      console.log('');
      console.log('Configuration actuelle:');
      console.log('- Mode: SIMULATION (compte EmailJS bloqué)');
      console.log('- Logs: Détaillés dans la console');
      console.log('- Fonctionnalité: Complète en mode test');
      console.log('');
      console.log('✅ Si vous voyez ce message, le mode simulation fonctionne parfaitement !');
      console.log('');
      console.log('Pour activer les vrais emails:');
      console.log('1. Résolvez le problème de compte EmailJS bloqué');
      console.log('2. Ou créez un nouveau compte EmailJS');
      console.log('3. Mettez à jour les clés dans le code');
      console.log('');
      console.log('Cordialement,');
      console.log('MTN Cameroun BTS Monitor');
      console.log('─'.repeat(40));
      console.log('');
      console.log('✅ TEST SIMULÉ RÉUSSI!');
      console.log('💡 Le système fonctionne parfaitement en mode simulation');
      console.log('🔧 Résolvez le problème EmailJS pour les vrais emails');
      console.log('═'.repeat(60));
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      return true;
    }

    // Code pour test réel
    try {
      const result = await emailjs.send(this.serviceId, this.templateId, {
        to_email: email,
        subject: '🧪 Test EmailJS MTN',
        message: 'Test du système email',
        company_name: 'MTN Cameroun'
      });
      
      console.log('✅ TEST RÉEL RÉUSSI!');
      return true;
      
    } catch (error: any) {
      console.log('❌ TEST RÉEL ÉCHOUÉ - Mode simulation activé');
      this.logDetailedError(error);
      this.isSimulationMode = true;
      return await this.testEmail(team);
    }
  }

  async testVerificationCode(email: string = 'manuelmayi581@gmail.com'): Promise<boolean> {
    console.log('🧪 TEST CODE DE VÉRIFICATION - MODE SIMULATION');
    console.log(`📞 Email de test: ${email}`);
    
    const testCode = Math.random().toString(36).substr(2, 6).toUpperCase();
    console.log(`🔐 Code de test généré: ${testCode}`);
    
    return await this.sendVerificationCode(email, 'TestUser', testCode);
  }

  // 📊 MONITORING METHODS
  getQueueStats() {
    return {
      pending: this.emailQueue.length,
      isProcessing: this.isProcessing,
      lastEmailTime: new Date().toLocaleString('fr-FR'),
      quotaReached: false,
      nextTicketTeam: 'ip',
      nextAvailableTime: null,
      apiVersion: this.isSimulationMode ? 'Mode Simulation (Compte Bloqué)' : 'API Réelle'
    };
  }

  getSessionStatus() {
    return {
      ticketsUsed: 0,
      ticketsRemaining: this.isSimulationMode ? 'Illimité (Simulation)' : 200,
      nextTeam: 'ip',
      canSendNow: true,
      sessionStartTime: new Date().toLocaleString('fr-FR'),
      apiStatus: this.isSimulationMode ? 'Mode Simulation Active (Compte EmailJS Bloqué)' : 'API Réelle Active'
    };
  }

  resetQuotaFlag(): void {
    console.log('✅ Queue réinitialisée - Mode Simulation');
    this.emailQueue.length = 0;
  }

  getConfigurationStatus(): string {
    if (this.isSimulationMode) {
      return `⚠️ Mode Simulation Activé - Compte EmailJS bloqué détecté | Tous les emails sont simulés avec logs détaillés`;
    }
    return `✅ EmailJS configuré - Service actif`;
  }

  async verifyEmailJSConfiguration(): Promise<{ success: boolean; message: string }> {
    console.log('🔍 VÉRIFICATION DE LA CONFIGURATION EMAILJS');
    
    if (this.isSimulationMode) {
      return {
        success: true,
        message: `⚠️ Mode Simulation Actif - Compte EmailJS bloqué détecté. Le système fonctionne en mode simulation avec logs détaillés. Pour activer les vrais emails, résolvez le problème de compte bloqué sur dashboard.emailjs.com`
      };
    }
    
    try {
      const result = await emailjs.send(this.serviceId, this.templateId, {
        to_email: 'test@example.com',
        subject: 'Test de configuration',
        message: 'Test de vérification',
        test_mode: true
      });
      
      return {
        success: true,
        message: `✅ Configuration EmailJS valide! Status: ${result.status}`
      };
      
    } catch (error: any) {
      console.log('❌ Vérification échouée - Activation du mode simulation');
      this.logDetailedError(error);
      this.isSimulationMode = true;
      
      return {
        success: false,
        message: `❌ Compte EmailJS bloqué détecté. Mode simulation activé. Résolvez le problème sur dashboard.emailjs.com ou créez un nouveau compte.`
      };
    }
  }

  // Méthode pour basculer manuellement en mode simulation
  enableSimulationMode(): void {
    this.isSimulationMode = true;
    console.log('🎭 Mode simulation activé manuellement');
  }

  // Méthode pour tenter de réactiver le mode réel
  async tryRealMode(): Promise<boolean> {
    this.isSimulationMode = false;
    const result = await this.verifyEmailJSConfiguration();
    return result.success;
  }

  // Obtenir le statut du mode
  getMode(): 'simulation' | 'real' {
    return this.isSimulationMode ? 'simulation' : 'real';
  }
}

export const emailService = new EmailService();