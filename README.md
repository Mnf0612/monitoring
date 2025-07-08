# BTS Network Monitoring Dashboard

Un système complet de surveillance des sites BTS (Base Transceiver Station) avec authentification, gestion des utilisateurs, alarmes automatiques et système de tickets.

## 🏗️ Architecture

### Frontend (React + TypeScript)
- **Framework**: React 18 avec TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts pour les graphiques
- **Icons**: Lucide React
- **Build**: Vite

### Backend (Django REST API)
- **Framework**: Django 4.2 avec Django REST Framework
- **Base de données**: PostgreSQL
- **Cache/Queue**: Redis + Celery
- **WebSockets**: Django Channels
- **Authentification**: Token-based authentication

## 🚀 Fonctionnalités

### 🔐 Système d'Authentification
- **Connexion sécurisée** avec tokens
- **Gestion des rôles** : Admin, Opérateur, Technicien
- **Permissions granulaires** par rôle
- **Gestion des sessions** persistantes

### 👥 Gestion des Utilisateurs (Admin)
- **CRUD complet** des utilisateurs
- **Attribution des rôles** et équipes
- **Activation/désactivation** des comptes
- **Historique des connexions**

### 📊 Dashboard de Monitoring
- **Surveillance temps réel** des 50 sites BTS
- **Cartes interactives** par région
- **Statistiques détaillées** et graphiques
- **Filtrage avancé** par région/statut

### 🚨 Système d'Alarmes
- **Génération automatique** d'alarmes
- **Types d'alarmes** : Power, IP, Transmission, BSS, Hardware, Security
- **Niveaux de sévérité** : Critical, Major, Minor, Warning
- **Historique complet** des alarmes

### 🎫 Gestion des Tickets
- **Création automatique** de tickets pour chaque alarme
- **Attribution intelligente** aux équipes spécialisées
- **Suivi complet** du cycle de vie
- **Commentaires et pièces jointes**

### 📧 Notifications
- **Emails automatiques** via EmailJS
- **SMS** via Twilio (configurable)
- **Notifications temps réel** via WebSockets

### 🔧 Configuration des Emails

Le système fonctionne en **deux modes** :

#### 📱 Mode Simulation (Actuel - Recommandé pour tests)
- ✅ **Aucune configuration requise**
- ✅ **Tests illimités** sans coûts
- ✅ **Logs détaillés** dans la console
- ✅ **Simulation réaliste** avec 85% de taux de succès
- ✅ **Parfait pour démonstrations** et développement

#### 🚀 Mode Production (Emails Réels)
Pour envoyer de vrais emails, suivez ces étapes :

1. **Créer un compte EmailJS** sur [EmailJS.com](https://www.emailjs.com/)
2. **Configurer un service email** (Gmail, Outlook, etc.)
3. **Créer un template** avec les variables du système
4. **Obtenir vos clés** : Service ID, Template ID, Public Key
5. **Mettre à jour la configuration** dans `src/services/emailService.ts`

```javascript
// Remplacer les valeurs de démonstration par vos vraies clés
private serviceId = 'VOTRE_SERVICE_ID';
private templateId = 'VOTRE_TEMPLATE_ID'; 
private publicKey = 'VOTRE_PUBLIC_KEY';
```

#### 🔐 Codes de Vérification (Mode Test)
En mode simulation, les codes de vérification sont affichés dans la **console du navigateur** :
- Ouvrez les **Outils de développement** (F12)
- Allez dans l'onglet **Console**
- Le code apparaîtra avec le format : `🔐 Code: XXXXXX`

#### 📊 Quotas EmailJS
- **Gratuit** : 200 emails/mois
- **Personal** : 1000 emails/mois ($15/mois)
- **Team** : 10000 emails/mois ($50/mois)

#### 🎯 Transition Automatique
Le système détecte automatiquement :
- **Clés de démo** → Mode simulation
- **Vraies clés** → Envoi réel
- **Erreur EmailJS** → Fallback vers simulation

## 📋 Prérequis

### Système
- **Python 3.9+**
- **Node.js 18+**
- **PostgreSQL 13+**
- **Redis 6+**

### Comptes de service (optionnels)
- **EmailJS** pour les notifications email
- **Twilio** pour les SMS

## 🛠️ Installation

### 1. Cloner le Projet

```bash
git clone <url-du-repository>
cd bts-monitoring-system
```

### 2. Configuration Backend (Django)

```bash
# Créer l'environnement virtuel
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate     # Windows

# Installer les dépendances
pip install -r requirements.txt

# Configuration de la base de données
cp .env.example .env
# Éditer .env avec vos paramètres

# Migrations
python manage.py makemigrations
python manage.py migrate

# Créer un superutilisateur
python manage.py createsuperuser

# Charger les données de test
python manage.py loaddata fixtures/initial_data.json

# Lancer le serveur
python manage.py runserver
```

### 3. Configuration Frontend (React)

```bash
# Installer les dépendances
cd frontend  # ou racine si frontend dans src/
npm install

# Lancer le serveur de développement
npm run dev
```

### 4. Services Additionnels

```bash
# Redis (pour Celery et WebSockets)
redis-server

# Celery Worker (dans un terminal séparé)
cd backend
celery -A bts_monitoring worker -l info

# Celery Beat (pour les tâches périodiques)
celery -A bts_monitoring beat -l info
```

## 🔧 Configuration

### Variables d'Environnement (.env)

```env
# Django
DEBUG=True
SECRET_KEY=your-secret-key-here
DATABASE_URL=postgresql://user:password@localhost:5432/bts_monitoring

# Redis
REDIS_URL=redis://localhost:6379/0

# Email (EmailJS)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

# Twilio (SMS)
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=your-twilio-number

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

### Configuration EmailJS (Frontend)

1. Créer un compte sur [EmailJS.com](https://www.emailjs.com/)
2. Configurer un service email (Gmail, Outlook, etc.)
3. Créer un template avec les variables nécessaires
4. Mettre à jour les clés dans `src/services/emailService.ts`

## 👤 Comptes de Démonstration

| Utilisateur | Mot de passe | Rôle | Permissions |
|-------------|--------------|------|-------------|
| `admin` | `admin123` | Administrateur | Accès complet |
| `operator1` | `operator123` | Opérateur | Dashboard + Tickets |
| `tech1` | `tech123` | Technicien | Tickets assignés |

### 🔐 Authentification Double Facteur

#### Pour les Administrateurs
- **Connexion directe** sans vérification email
- Accès immédiat au système

#### Pour Opérateurs et Techniciens
- **Vérification par email** requise après connexion
- Entrez votre email pour recevoir un code de vérification
- **En mode test** : Le code apparaît dans la console (F12)
- **En mode production** : Le code est envoyé par email réel

#### 💡 Astuce pour les Tests
1. Connectez-vous avec `operator1` / `operator123`
2. Entrez n'importe quel email valide
3. Ouvrez la console du navigateur (F12)
4. Copiez le code affiché : `🔐 Code: XXXXXX`
5. Collez-le dans le champ de vérification

## 📱 API Endpoints

### Authentification
```
POST /api/auth/login/          # Connexion
POST /api/auth/logout/         # Déconnexion
GET  /api/auth/profile/        # Profil utilisateur
GET  /api/auth/users/          # Liste des utilisateurs (admin)
POST /api/auth/users/          # Créer un utilisateur (admin)
```

### Monitoring
```
GET  /api/monitoring/sites/           # Liste des sites
GET  /api/monitoring/alarms/          # Liste des alarmes
POST /api/monitoring/alarms/          # Créer une alarme
GET  /api/monitoring/dashboard/stats/ # Statistiques dashboard
```

### Tickets
```
GET  /api/tickets/              # Liste des tickets
POST /api/tickets/              # Créer un ticket
PUT  /api/tickets/{id}/         # Mettre à jour un ticket
POST /api/tickets/{id}/comment/ # Ajouter un commentaire
```

## 🔄 Workflow des Alarmes

1. **Génération automatique** d'alarmes (Celery task)
2. **Création de ticket** automatique
3. **Attribution à l'équipe** selon le type d'alarme
4. **Notification email/SMS** à l'équipe
5. **Prise en charge** par un technicien
6. **Résolution** avec commentaires
7. **Fermeture** du ticket

## 📊 Structure de la Base de Données

### Tables Principales
- **Users** : Utilisateurs avec rôles et équipes
- **Regions** : Régions du Cameroun
- **Sites** : Sites BTS avec coordonnées
- **Alarms** : Alarmes avec historique
- **Teams** : Équipes techniques
- **Tickets** : Tickets avec suivi complet

## 🚀 Déploiement en Production

### Option 1: Docker (Recommandé)

```bash
# Construire les images
docker-compose build

# Lancer les services
docker-compose up -d

# Migrations
docker-compose exec backend python manage.py migrate

# Créer un superutilisateur
docker-compose exec backend python manage.py createsuperuser
```

### Option 2: Serveur Traditionnel

```bash
# Backend
pip install gunicorn
gunicorn bts_monitoring.wsgi:application

# Frontend
npm run build
# Servir les fichiers statiques avec nginx

# Services
systemctl start redis
systemctl start postgresql
systemctl start celery-worker
systemctl start celery-beat
```

## 🔧 Maintenance

### Commandes Utiles

```bash
# Nettoyer les anciennes alarmes
python manage.py shell
>>> from monitoring.models import Alarm
>>> Alarm.objects.filter(created_at__lt='2024-01-01').delete()

# Backup de la base de données
pg_dump bts_monitoring > backup.sql

# Logs
tail -f bts_monitoring.log
```

### Monitoring de Production

- **Logs** : Centralisés avec niveau INFO
- **Métriques** : CPU, mémoire, base de données
- **Alertes** : Email en cas d'erreur critique
- **Backup** : Automatique quotidien

## 🐛 Dépannage

### Problèmes Courants

1. **Erreur de connexion DB** : Vérifier PostgreSQL et les credentials
2. **Redis non accessible** : Vérifier le service Redis
3. **Emails non envoyés** : Vérifier la configuration EmailJS
4. **WebSockets non fonctionnels** : Vérifier Redis et Channels

### Debug Mode

```bash
# Backend
DEBUG=True python manage.py runserver

# Frontend
npm run dev

# Logs détaillés
tail -f bts_monitoring.log
```

## 📞 Support

### Logs de Debug
- **Backend** : `bts_monitoring.log`
- **Frontend** : Console du navigateur
- **Celery** : Logs des workers

### Monitoring
- **Health Check** : `/api/health/`
- **Admin Panel** : `/admin/`
- **API Documentation** : `/api/docs/`

## 🤝 Contribution

1. **Fork** le projet
2. **Créer une branche** pour votre fonctionnalité
3. **Commiter** vos changements
4. **Pousser** vers la branche
5. **Ouvrir une Pull Request**

## 📝 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🔄 Roadmap

### Version 2.0
- [ ] Application mobile (React Native)
- [ ] Intégration IoT pour monitoring temps réel
- [ ] Machine Learning pour prédiction de pannes
- [ ] API GraphQL
- [ ] Multi-tenancy

### Version 1.5
- [ ] Rapports automatiques PDF
- [ ] Intégration Slack/Teams
- [ ] Géolocalisation avancée
- [ ] Tableau de bord personnalisable

---

**Développé pour la surveillance et maintenance proactive des réseaux BTS** 📡

**Stack Technique** : React + TypeScript + Django + PostgreSQL + Redis + Celery