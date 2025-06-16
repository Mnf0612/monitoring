# BTS Network Monitoring Dashboard

Un tableau de bord complet pour la surveillance des sites BTS (Base Transceiver Station) avec gestion automatique des tickets d'alarmes et notifications SMS.

## 🚀 Fonctionnalités

### Dashboard Principal
- **Surveillance en temps réel** des sites BTS par région
- **Visualisation des alarmes** avec graphiques interactifs
- **Cartes régionales** avec statut des sites
- **Statistiques en temps réel** (sites actifs, alarmes critiques, etc.)

### Gestion des Tickets
- **Création automatique de tickets** pour chaque alarme
- **Attribution intelligente** aux équipes selon le type d'alarme
- **Notifications SMS automatiques** via Twilio
- **Suivi et mise à jour** des tickets par les équipes
- **Filtrage avancé** par équipe, statut et priorité

### Types d'Alarmes Supportées
- **Power** : Pannes d'alimentation
- **IP** : Problèmes de connectivité réseau
- **Transmission** : Problèmes de signal
- **BSS** : Problèmes de contrôleur de station de base
- **Hardware** : Défaillances matérielles
- **Security** : Alertes de sécurité

## 🛠️ Technologies Utilisées

- **Frontend** : React 18 + TypeScript
- **Styling** : Tailwind CSS
- **Charts** : Recharts
- **Icons** : Lucide React
- **Build Tool** : Vite
- **Notifications** : Twilio SMS API
- **Date Handling** : date-fns

## 📋 Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- **Node.js** (version 18 ou supérieure)
- **npm** ou **yarn**
- **Git**

## 🚀 Installation et Déploiement Local

### 1. Cloner le Projet

```bash
git clone <url-du-repository>
cd network-monitoring-dashboard
```

### 2. Installer les Dépendances

```bash
npm install
```

### 3. Configuration Twilio (Optionnel)

Pour activer les notifications SMS, configurez vos identifiants Twilio dans `src/services/twilioService.ts` :

```typescript
private accountSid = 'VOTRE_ACCOUNT_SID';
private authToken = 'VOTRE_AUTH_TOKEN';
private fromNumber = 'VOTRE_NUMERO_TWILIO';
```

### 4. Lancer l'Application en Mode Développement

```bash
npm run dev
```

L'application sera accessible à l'adresse : `http://localhost:5173`

### 5. Build pour la Production

```bash
npm run build
```

Les fichiers de production seront générés dans le dossier `dist/`.

### 6. Prévisualiser la Version de Production

```bash
npm run preview
```

## 📱 Configuration des Équipes et Numéros SMS

Les équipes et leurs numéros de téléphone sont configurés dans `src/services/ticketService.ts` :

```typescript
private teams: Team[] = [
  {
    id: '1',
    name: 'Équipe Power',
    type: 'power',
    phone: '657416225',
    members: ['John Doe', 'Jane Smith']
  },
  // ... autres équipes
];
```

## 🎯 Utilisation

### Dashboard Principal

1. **Vue d'ensemble** : Consultez les statistiques globales
2. **Carte des régions** : Cliquez sur une région pour filtrer les données
3. **Analyse des alarmes** : Visualisez la répartition par sévérité et type
4. **Liste des alarmes** : Consultez toutes les alarmes actives

### Gestion des Tickets

1. **Navigation** : Cliquez sur "Gestion des Tickets" dans le menu
2. **Filtrage** : Utilisez les filtres pour voir vos tickets
3. **Mise à jour** : Cliquez sur un ticket pour l'ouvrir et le mettre à jour
4. **Résolution** : Changez le statut et ajoutez vos commentaires

## 🔧 Structure du Projet

```
src/
├── components/           # Composants React
│   ├── Dashboard.tsx     # Dashboard principal
│   ├── TicketDashboard.tsx # Dashboard des tickets
│   ├── AlarmPanel.tsx    # Panneau des alarmes
│   ├── TicketList.tsx    # Liste des tickets
│   └── ...
├── services/            # Services métier
│   ├── alarmService.ts  # Gestion des alarmes
│   ├── ticketService.ts # Gestion des tickets
│   └── twilioService.ts # Notifications SMS
├── types/               # Types TypeScript
│   └── index.ts
└── App.tsx             # Composant principal
```

## 📊 Données de Test

L'application inclut des données de test pour :
- 4 sites BTS dans différentes régions du Cameroun
- Alarmes de différents types et sévérités
- Tickets automatiquement générés

## 🚨 Workflow des Alarmes et Tickets

1. **Détection d'alarme** → Création automatique dans le système
2. **Génération de ticket** → Attribution à l'équipe appropriée
3. **Notification SMS** → Envoi automatique à l'équipe
4. **Prise en charge** → L'équipe accède au dashboard
5. **Résolution** → Mise à jour du ticket avec la solution
6. **Notification de suivi** → SMS de confirmation du changement de statut

## 🔐 Sécurité

- Validation des données côté client
- Gestion des erreurs robuste
- Logs des actions importantes
- Authentification des équipes (à implémenter selon vos besoins)

## 🌐 Déploiement en Production

### Option 1 : Netlify (Recommandé)
```bash
npm run build
# Déployez le contenu du dossier dist/ sur Netlify
```

### Option 2 : Serveur Web Traditionnel
```bash
npm run build
# Copiez le contenu de dist/ vers votre serveur web
```

### Option 3 : Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

## 🐛 Dépannage

### Problèmes Courants

1. **Port déjà utilisé** : Changez le port dans `vite.config.ts`
2. **Erreurs de build** : Vérifiez les versions de Node.js et npm
3. **SMS non envoyés** : Vérifiez la configuration Twilio

### Logs de Debug

Les logs sont disponibles dans la console du navigateur pour :
- Création de tickets
- Envoi de SMS
- Erreurs de l'application

## 📞 Support

Pour toute question ou problème :
1. Vérifiez les logs de la console
2. Consultez la documentation Twilio pour les SMS
3. Vérifiez la configuration des équipes

## 🔄 Mises à Jour

Pour mettre à jour l'application :

```bash
git pull origin main
npm install
npm run build
```

## 📝 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🤝 Contribution

Les contributions sont les bienvenues ! Veuillez :
1. Fork le projet
2. Créer une branche pour votre fonctionnalité
3. Commiter vos changements
4. Pousser vers la branche
5. Ouvrir une Pull Request

---

**Développé pour la surveillance et maintenance proactive des réseaux BTS** 📡