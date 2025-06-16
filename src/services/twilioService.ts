// Twilio service for SMS notifications
class TwilioService {
  private accountSid = 'AC0c7ad2a560ae2d35144a4878284b7caa';
  private authToken = '9d6d307e88a18b7f9ce5fbfcc1dbff0f';
  private fromNumber = '+12317585383';

  private teamPhones = {
    ip: '697039163',
    transmission: '698796597',
    bss: '692782310',
    power: '657416225'
  };

  async sendTicketNotification(team: string, ticketId: string, alarmMessage: string): Promise<boolean> {
    const phoneNumber = this.teamPhones[team as keyof typeof this.teamPhones];
    
    if (!phoneNumber) {
      console.error(`No phone number found for team: ${team}`);
      return false;
    }

    const message = `🚨 NOUVEAU TICKET #${ticketId}
Site: ${alarmMessage}
Équipe: ${team.toUpperCase()}
Statut: OUVERT
Connectez-vous au dashboard pour plus de détails.`;

    try {
      // Simulate SMS sending (in real implementation, use Twilio SDK)
      console.log(`SMS sent to ${phoneNumber}: ${message}`);
      
      // In production, replace with actual Twilio API call:
      /*
      const client = require('twilio')(this.accountSid, this.authToken);
      await client.messages.create({
        body: message,
        from: this.fromNumber,
        to: `+237${phoneNumber}`
      });
      */
      
      return true;
    } catch (error) {
      console.error('Failed to send SMS:', error);
      return false;
    }
  }

  async sendTicketUpdate(team: string, ticketId: string, status: string): Promise<boolean> {
    const phoneNumber = this.teamPhones[team as keyof typeof this.teamPhones];
    
    if (!phoneNumber) return false;

    const message = `📋 MISE À JOUR TICKET #${ticketId}
Nouveau statut: ${status.toUpperCase()}
Consultez le dashboard pour les détails.`;

    try {
      console.log(`SMS update sent to ${phoneNumber}: ${message}`);
      return true;
    } catch (error) {
      console.error('Failed to send SMS update:', error);
      return false;
    }
  }
}

export const twilioService = new TwilioService();