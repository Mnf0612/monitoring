# Configuration EmailJS pour Vrais Emails

## 🚀 Étapes pour Activer les Vrais Emails

### 1. Créer un Compte EmailJS
1. Allez sur [EmailJS.com](https://www.emailjs.com/)
2. Créez un compte gratuit (200 emails/mois)
3. Vérifiez votre email

### 2. Configurer le Service Email
1. Dans le dashboard EmailJS, cliquez sur "Add New Service"
2. Choisissez votre fournisseur (Gmail, Outlook, etc.)
3. Suivez les instructions de connexion
4. Notez votre **Service ID**

### 3. Créer un Template
1. Allez dans "Email Templates"
2. Cliquez "Create New Template"
3. Utilisez ce template pour les notifications :

```html
Sujet: 🚨 NOUVEAU TICKET BTS #{{ticket_id}} - {{site_name}}

Bonjour {{to_name}},

Un nouveau ticket a été créé et vous a été assigné :

🎫 Ticket: #{{ticket_id}}
🏢 Site: {{site_name}}
⚠️ Alarme: {{alarm_message}}
👥 Équipe: {{team_name}}
📊 Statut: {{status}}
⏰ Créé le: {{created_date}}
🔥 Priorité: {{priority}}

🔗 Accédez au dashboard: {{dashboard_url}}

Cordialement,
{{company_name}} - BTS Monitor
```

4. Notez votre **Template ID**

### 4. Obtenir la Clé Publique
1. Allez dans "Account" > "General"
2. Copiez votre **Public Key**

### 5. Mettre à Jour la Configuration

Remplacez dans `src/services/emailService.ts` :

```javascript
// Configuration EmailJS RÉELLE
private serviceId = 'VOTRE_SERVICE_ID';        // Ex: service_abc123
private templateId = 'VOTRE_TEMPLATE_ID';      // Ex: template_xyz789
private publicKey = 'VOTRE_PUBLIC_KEY';        // Ex: user_def456

// Emails réels des équipes
private teamEmails = {
  ip: 'equipe.ip@votre-entreprise.com',
  transmission: 'equipe.transmission@votre-entreprise.com',
  bss: 'equipe.bss@votre-entreprise.com',
  power: 'equipe.power@votre-entreprise.com'
};
```

### 6. Tester la Configuration

```javascript
// Dans la console du navigateur
emailService.testEmail('ip');
```

## 🔒 Sécurité en Production

### Variables d'Environnement
```javascript
// Pour la production, utilisez des variables d'environnement
private serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
private templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
private publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
```

### Fichier .env
```env
VITE_EMAILJS_SERVICE_ID=service_abc123
VITE_EMAILJS_TEMPLATE_ID=template_xyz789
VITE_EMAILJS_PUBLIC_KEY=user_def456
```

## 📊 Quotas EmailJS

### Plan Gratuit
- 200 emails/mois
- Parfait pour les tests et petites équipes

### Plans Payants
- Personal: 1000 emails/mois ($15/mois)
- Team: 10000 emails/mois ($50/mois)
- Business: 100000 emails/mois ($150/mois)

## 🚨 Alternatives Professionnelles

### 1. SendGrid
- Plus robuste pour la production
- Meilleure délivrabilité
- Analytics avancées

### 2. Mailgun
- API puissante
- Gestion des bounces
- Validation d'emails

### 3. Amazon SES
- Très économique
- Intégration AWS
- Haute disponibilité

## ✅ Avantages du Système Actuel

### Mode Simulation
- ✅ Aucune configuration requise
- ✅ Tests illimités
- ✅ Logs détaillés
- ✅ Pas de coûts
- ✅ Pas de spam

### Transition Facile
- ✅ Code prêt pour la production
- ✅ Gestion d'erreurs complète
- ✅ Queue et retry automatiques
- ✅ Fallback vers simulation

## 🎯 Recommandation

Pour une **démonstration** : Gardez le mode simulation actuel
Pour la **production** : Configurez EmailJS avec de vraies clés

Le système est conçu pour basculer automatiquement entre simulation et envoi réel selon la configuration !