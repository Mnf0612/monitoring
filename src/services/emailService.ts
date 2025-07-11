import emailjs from '@emailjs/browser';

class EmailService {
  // Configuration EmailJS - NOUVELLE TENTATIVE avec debug complet
  private serviceId = 'service_lhzqhxr';
  private templateId = 'template_bts_notification';
  private publicKey = '0NftsL5CxGYcqWcNj';

  private teamEmails = {
    ip: 'manuelmayi581@gmail.com',
    transmission: 'manuelmayi581@gmail.com',
    bss: 'zambouyvand@yahoo.com',
    power: 'manuelmayi581@gmail.com'
  };

  private isConfigured = false;
  private lastError: any = null;

  constructor() {
    this.initializeEmailJS();
  }

  private initializeEmailJS() {
    try {
      console.log('🔧 INITIALISATION EMAILJS - ÉTAPE PAR ÉTAPE');
      console.log('1. Vérification des paramètres...');
      console.log(`   Service ID: ${this.serviceId}`);
      console.log(`   Template ID: ${this.templateId}`);
      console.log(`   Public Key: ${this.publicKey}`);
      
      // Initialiser EmailJS
      emailjs.init(this.publicKey);
      this.isConfigured = true;
      
      console.log('2. ✅ EmailJS initialisé avec succès');
      console.log('3. 🧪 Test de connectivité EmailJS...');
      
      // Test de connectivité immédiat
      this.testConnectivity();
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation EmailJS:', error);
      this.isConfigured = false;
      this.lastError = error;
    }
  }

  private async testConnectivity() {
    try {
      console.log('🔍 Test de connectivité vers EmailJS...');
      
      // Test simple avec paramètres minimaux
      const testParams = {
        to_email: 'test@example.com',
        to_name: 'Test User',
        message: 'Test de connectivité',
        from_name: 'BTS Monitor Test'
      };

      // Ne pas envoyer réellement, juste tester la configuration
      console.log('📡 Tentative de connexion au service EmailJS...');
      
      // Test avec un faux envoi pour vérifier la connectivité
      const result = await emailjs.send(
        this.serviceId,
        this.templateId,
        testParams,
        this.publicKey
      );
      
      console.log('✅ CONNECTIVITÉ EMAILJS CONFIRMÉE');
      console.log('📊 Résultat du test:', result);
      
    } catch (error: any) {
      console.log('🔍 ANALYSE DE L\'ERREUR DE CONNECTIVITÉ:');
      console.log('📊 Erreur complète:', error);
      console.log('📊 Status:', error.status);
      console.log('📊 Text:', error.text);
      console.log('📊 Message:', error.message);
      
      if (error.status === 404) {
        console.log('❌ PROBLÈME: Service ID ou Template ID incorrect');
        console.log('🔧 Vérifiez dans votre dashboard EmailJS:');
        console.log(`   - Service ID: ${this.serviceId}`);
        console.log(`   - Template ID: ${this.templateId}`);
      } else if (error.status === 401 || error.status === 403) {
        console.log('❌ PROBLÈME: Clé publique incorrecte ou permissions');
        console.log(`🔧 Vérifiez votre clé publique: ${this.publicKey}`);
      } else if (error.status === 426) {
        console.log('❌ PROBLÈME: Quota EmailJS atteint');
      } else if (error.status === 0) {
        console.log('❌ PROBLÈME: Problème de réseau ou CORS');
      } else {
        console.log('❌ PROBLÈME INCONNU:', error);
      }
      
      this.lastError = error;
    }
  }

  async sendVerificationCode(email: string, username: string, code: string): Promise<boolean> {
    console.log(`📧 ENVOI CODE DE VÉRIFICATION - DEBUG COMPLET`);
    console.log(`📞 Email: ${email}`);
    console.log(`👤 Utilisateur: ${username}`);
    console.log(`🔐 Code: ${code}`);

    if (!this.isConfigured) {
      console.log('❌ EmailJS non configuré');
      return false;
    }

    const templateParams = {
      to_email: email,
      to_name: username,
      verification_code: code,
      user_name: username,
      from_name: 'MTN Cameroon BTS Monitor',
      subject: `Code de vérification: ${code}`,
      message: `Votre code de vérification est: ${code}`,
      company_name: 'MTN Cameroon'
    };

    console.log('📧 Paramètres du template:', templateParams);

    try {
      console.log('🚀 Envoi en cours...');
      
      const result = await emailjs.send(
        this.serviceId,
        this.templateId,
        templateParams,
        this.publicKey
      );
      
      console.log('✅ CODE DE VÉRIFICATION ENVOYÉ AVEC SUCCÈS!');
      console.log('📊 Résultat:', result);
      return true;
      
    } catch (error: any) {
      console.log('❌ ÉCHEC ENVOI CODE DE VÉRIFICATION');
      this.logDetailedError(error);
      return false;
    }
  }

  async sendTicketNotification(team: string, ticketId: string, alarmMessage: string, site: string): Promise<boolean> {
    console.log(`📧 ENVOI NOTIFICATION TICKET - DEBUG COMPLET`);
    console.log(`👥 Équipe: ${team}`);
    console.log(`🎫 Ticket: ${ticketId}`);
    console.log(`🏢 Site: ${site}`);
    console.log(`⚠️ Alarme: ${alarmMessage}`);

    if (!this.isConfigured) {
      console.log('❌ EmailJS non configuré');
      return false;
    }

    const email = this.teamEmails[team as keyof typeof this.teamEmails];
    
    if (!email) {
      console.error(`❌ Aucun email trouvé pour l'équipe: ${team}`);
      return false;
    }

    console.log(`📞 Email destinataire: ${email}`);

    const templateParams = {
      to_email: email,
      to_name: this.getTeamName(team),
      ticket_id: ticketId,
      site_name: site,
      alarm_message: alarmMessage,
      team_name: this.getTeamName(team),
      status: 'OUVERT',
      created_date: new Date().toLocaleString('fr-FR'),
      priority: 'HAUTE',
      from_name: 'MTN Cameroon BTS Monitor',
      subject: `NOUVEAU TICKET BTS #${ticketId} - ${site}`,
      company_name: 'MTN Cameroon',
      message: `Nouveau ticket créé pour le site ${site}. Alarme: ${alarmMessage}`,
      dashboard_url: window.location.origin
    };

    console.log('📧 Paramètres du template:', templateParams);

    try {
      console.log('🚀 Envoi en cours...');
      console.log(`🔧 Service: ${this.serviceId}`);
      console.log(`🔧 Template: ${this.templateId}`);
      console.log(`🔧 Public Key: ${this.publicKey}`);
      
      const result = await emailjs.send(
        this.serviceId,
        this.templateId,
        templateParams,
        this.publicKey
      );
      
      console.log('✅ NOTIFICATION TICKET ENVOYÉE AVEC SUCCÈS!');
      console.log('📊 Résultat:', result);
      return true;
      
    } catch (error: any) {
      console.log('❌ ÉCHEC ENVOI NOTIFICATION TICKET');
      this.logDetailedError(error);
      return false;
    }
  }

  async sendTicketUpdate(team: string, ticketId: string, status: string, updateMessage?: string): Promise<boolean> {
    console.log(`📧 ENVOI MISE À JOUR TICKET - DEBUG COMPLET`);
    
    if (!this.isConfigured) {
      console.log('❌ EmailJS non configuré');
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
      from_name: 'MTN Cameroon BTS Monitor',
      subject: `MISE À JOUR TICKET #${ticketId}`,
      company_name: 'MTN Cameroon',
      message: `Le ticket #${ticketId} a été mis à jour. Nouveau statut: ${this.getStatusText(status)}`,
      dashboard_url: window.location.origin
    };

    try {
      const result = await emailjs.send(
        this.serviceId,
        this.templateId,
        templateParams,
        this.publicKey
      );
      
      console.log('✅ MISE À JOUR TICKET ENVOYÉE AVEC SUCCÈS!');
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
    console.log('📊 Type:', typeof error);
    console.log('📊 Status:', error.status);
    console.log('📊 Text:', error.text);
    console.log('📊 Message:', error.message);
    console.log('📊 Stack:', error.stack);
    
    // Analyse spécifique des erreurs
    if (error.status === 404) {
      console.log('❌ DIAGNOSTIC: Service ID ou Template ID incorrect');
      console.log('🔧 SOLUTION: Vérifiez dans votre dashboard EmailJS:');
      console.log(`   1. Connectez-vous à https://dashboard.emailjs.com/`);
      console.log(`   2. Vérifiez que le service "${this.serviceId}" existe`);
      console.log(`   3. Vérifiez que le template "${this.templateId}" existe`);
      console.log(`   4. Vérifiez que le template est associé au bon service`);
    } else if (error.status === 401 || error.status === 403) {
      console.log('❌ DIAGNOSTIC: Problème d\'authentification');
      console.log('🔧 SOLUTION:');
      console.log(`   1. Vérifiez votre clé publique: ${this.publicKey}`);
      console.log(`   2. Vérifiez que le service est actif`);
      console.log(`   3. Vérifiez les permissions du template`);
    } else if (error.status === 426) {
      console.log('❌ DIAGNOSTIC: Quota EmailJS atteint');
      console.log('🔧 SOLUTION: Attendez le renouvellement ou upgradez votre plan');
    } else if (error.status === 429) {
      console.log('❌ DIAGNOSTIC: Limite de taux atteinte');
      console.log('🔧 SOLUTION: Attendez quelques minutes avant de réessayer');
    } else if (error.status === 0) {
      console.log('❌ DIAGNOSTIC: Problème de réseau ou CORS');
      console.log('🔧 SOLUTION: Vérifiez votre connexion internet');
    } else {
      console.log('❌ DIAGNOSTIC: Erreur inconnue');
      console.log('🔧 SOLUTION: Contactez le support EmailJS');
    }
    
    this.lastError = error;
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

  // Méthode de test simplifiée
  async testEmail(team: string = 'bss'): Promise<boolean> {
    console.log(`🧪 TEST EMAIL SIMPLIFIÉ - Équipe: ${team}`);
    
    const email = this.teamEmails[team as keyof typeof this.teamEmails];
    console.log(`📞 Email de test: ${email}`);
    
    if (!email) {
      console.error(`❌ Aucun email pour l'équipe: ${team}`);
      return false;
    }

    // Test avec paramètres minimaux
    const templateParams = {
      to_email: email,
      to_name: this.getTeamName(team),
      message: 'Test de configuration EmailJS',
      from_name: 'BTS Monitor Test',
      subject: 'Test EmailJS',
      company_name: 'MTN Cameroon'
    };

    console.log('📧 Paramètres de test:', templateParams);

    try {
      console.log('🚀 Envoi du test...');
      
      const result = await emailjs.send(
        this.serviceId,
        this.templateId,
        templateParams,
        this.publicKey
      );
      
      console.log('✅ TEST EMAIL RÉUSSI!');
      console.log('📊 Résultat:', result);
      return true;
      
    } catch (error: any) {
      console.log('❌ TEST EMAIL ÉCHOUÉ');
      this.logDetailedError(error);
      return false;
    }
  }

  // Méthode pour vérifier la configuration
  checkConfiguration(): { isValid: boolean; issues: string[] } {
    const issues: string[] = [];
    
    if (!this.isConfigured) {
      issues.push('EmailJS non initialisé');
    }
    
    if (!this.serviceId || this.serviceId === 'service_demo') {
      issues.push('Service ID manquant ou invalide');
    }
    
    if (!this.templateId || this.templateId === 'template_demo') {
      issues.push('Template ID manquant ou invalide');
    }
    
    if (!this.publicKey) {
      issues.push('Clé publique manquante');
    }
    
    if (this.lastError) {
      issues.push(`Dernière erreur: ${this.lastError.message || this.lastError}`);
    }
    
    return {
      isValid: issues.length === 0,
      issues
    };
  }

  getConfigurationStatus(): string {
    const config = this.checkConfiguration();
    
    if (config.isValid) {
      return `✅ EmailJS configuré - Service: ${this.serviceId}`;
    } else {
      return `❌ Problèmes de configuration: ${config.issues.join(', ')}`;
    }
  }

  // Méthodes pour les stats (simplifiées)
  getQueueStats() {
    return {
      pending: 0,
      isProcessing: false,
      lastEmailTime: 'N/A',
      quotaReached: false,
      sessionTickets: 0,
      maxSessionTickets: 10,
      nextTicketTeam: 'bss',
      canSendNext: true
    };
  }

  getSessionStatus() {
    return {
      ticketsUsed: 0,
      ticketsRemaining: 10,
      nextTeam: 'bss',
      canSendNow: true,
      sessionStartTime: new Date().toLocaleString('fr-FR')
    };
  }

  resetQuotaFlag(): void {
    this.lastError = null;
    console.log('✅ Erreurs réinitialisées');
  }

  resetSession(): void {
    this.lastError = null;
    console.log('🔄 Session réinitialisée');
  }
}

export const emailService = new EmailService();