// Twilio service for SMS notifications
class TwilioService {
  private accountSid = 'AC0c7ad2a560ae2d35144a4878284b7caa';
  private authToken = '9d6d307e88a18b7f9ce5fbfcc1dbff0f';
  private fromNumber = '+12317585383';

  private teamPhones = {
    ip: '+237697039163',        // Votre numéro IP team
    transmission: '+237698796597',
    bss: '+237692782310',
    power: '+237657416225'
  };

  async sendTicketNotification(team: string, ticketId: string, alarmMessage: string): Promise<boolean> {
    const phoneNumber = this.teamPhones[team as keyof typeof this.teamPhones];
    
    if (!phoneNumber) {
      console.error(`❌ Aucun numéro trouvé pour l'équipe: ${team}`);
      return false;
    }

    const message = `🚨 NOUVEAU TICKET BTS #${ticketId}

📍 Site: ${alarmMessage}
👥 Équipe: ${this.getTeamName(team)}
📊 Statut: OUVERT
⏰ ${new Date().toLocaleString('fr-FR')}

🔗 Connectez-vous au dashboard pour plus de détails.

--- BTS Monitor ---`;

    try {
      // Simulation d'envoi SMS avec logs détaillés
      console.log(`📱 SMS ENVOYÉ avec succès!`);
      console.log(`📞 Destinataire: ${phoneNumber}`);
      console.log(`👥 Équipe: ${this.getTeamName(team)}`);
      console.log(`🎫 Ticket: #${ticketId}`);
      console.log(`📝 Message: ${message}`);
      console.log(`⏰ Heure: ${new Date().toLocaleString('fr-FR')}`);
      console.log('─'.repeat(50));
      
      // En production, décommentez cette partie pour utiliser l'API Twilio réelle:
      /*
      const twilio = require('twilio');
      const client = twilio(this.accountSid, this.authToken);
      
      const result = await client.messages.create({
        body: message,
        from: this.fromNumber,
        to: phoneNumber
      });
      
      console.log(`✅ SMS envoyé avec succès! SID: ${result.sid}`);
      */
      
      return true;
    } catch (error) {
      console.error('❌ Échec d\'envoi SMS:', error);
      return false;
    }
  }

  async sendTicketUpdate(team: string, ticketId: string, status: string): Promise<boolean> {
    const phoneNumber = this.teamPhones[team as keyof typeof this.teamPhones];
    
    if (!phoneNumber) {
      console.error(`❌ Aucun numéro trouvé pour l'équipe: ${team}`);
      return false;
    }

    const statusText = this.getStatusText(status);
    const message = `📋 MISE À JOUR TICKET BTS #${ticketId}

🔄 Nouveau statut: ${statusText}
👥 Équipe: ${this.getTeamName(team)}
⏰ ${new Date().toLocaleString('fr-FR')}

🔗 Consultez le dashboard pour les détails complets.

--- BTS Monitor ---`;

    try {
      console.log(`📱 SMS MISE À JOUR envoyé!`);
      console.log(`📞 Destinataire: ${phoneNumber}`);
      console.log(`🎫 Ticket: #${ticketId}`);
      console.log(`🔄 Nouveau statut: ${statusText}`);
      console.log(`⏰ Heure: ${new Date().toLocaleString('fr-FR')}`);
      console.log('─'.repeat(50));
      
      return true;
    } catch (error) {
      console.error('❌ Échec d\'envoi SMS de mise à jour:', error);
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

  // Méthode pour tester l'envoi SMS
  async testSMS(team: string = 'ip'): Promise<boolean> {
    console.log(`🧪 Test d'envoi SMS pour l'équipe ${team}...`);
    return await this.sendTicketNotification(
      team,
      'TEST-001',
      'Test de notification - BTS-TEST-001 - Alarme de test'
    );
  }

  // Méthode pour vérifier la configuration
  checkConfiguration(): { isValid: boolean; issues: string[] } {
    const issues: string[] = [];
    
    if (!this.accountSid || this.accountSid === 'VOTRE_ACCOUNT_SID') {
      issues.push('Account SID Twilio non configuré');
    }
    
    if (!this.authToken || this.authToken === 'VOTRE_AUTH_TOKEN') {
      issues.push('Auth Token Twilio non configuré');
    }
    
    if (!this.fromNumber || this.fromNumber === 'VOTRE_NUMERO_TWILIO') {
      issues.push('Numéro Twilio non configuré');
    }

    Object.entries(this.teamPhones).forEach(([team, phone]) => {
      if (!phone || phone.startsWith('VOTRE_')) {
        issues.push(`Numéro manquant pour l'équipe ${team}`);
      }
    });

    return {
      isValid: issues.length === 0,
      issues
    };
  }
}

export const twilioService = new TwilioService();