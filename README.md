# 🏥 MedAppointment Backend API

Backend API complet pour la gestion des rendez-vous médicaux. Construit avec Node.js, Express, TypeScript, Prisma et PostgreSQL.

## 📋 Table des matières

- [Fonctionnalités](#fonctionnalités)
- [Technologies](#technologies)
- [Installation](#installation)
- [Configuration](#configuration)
- [Utilisation](#utilisation)
- [API Endpoints](#api-endpoints)
- [Architecture](#architecture)

## ✨ Fonctionnalités

- ✅ **Authentification JWT** avec inscription et connexion
- 👥 **Gestion des utilisateurs** (Admin, Médecin, Patient)
- 🩺 **Profils médecins** avec spécialités et disponibilités
- 🏥 **Profils patients** avec historique médical
- 📅 **Gestion des rendez-vous** (CRUD complet)
- 🔐 **RBAC (Role-Based Access Control)**
- 🛡️ **Sécurité** (Helmet, CORS, Rate Limiting)
- ✅ **Validation** des données avec Zod
- 📊 **Base de données relationnelle** PostgreSQL

## 🛠️ Technologies

- **Node.js** v20.x
- **TypeScript** v5.4.x
- **Express** v5.x
- **Prisma** v6.x (ORM)
- **PostgreSQL** v16 (Base de données)
- **JWT** (Authentification)
- **Bcrypt** (Hachage des mots de passe)
- **Zod** (Validation)
- **Docker** (Conteneurisation)

## 🚀 Installation

### Prérequis

- Node.js v20 ou supérieur
- Docker et Docker Compose
- npm ou yarn

### Étapes

1. **Cloner le projet**
```bash
git clone <repository-url>
cd medappointment-backend
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configurer les variables d'environnement**
```bash
cp .env.example .env
# Modifier .env avec vos valeurs
```

4. **Démarrer PostgreSQL avec Docker**
```bash
docker-compose up -d
```

5. **Générer le client Prisma**
```bash
npm run prisma:generate
```

6. **Exécuter les migrations**
```bash
npm run prisma:migrate
```

7. **Démarrer le serveur**
```bash
npm run dev
```

Le serveur démarrera sur `http://localhost:4000`

## ⚙️ Configuration

### Variables d'environnement

Créez un fichier `.env` à la racine du projet :

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/medappointment?schema=public"

# JWT
JWT_SECRET="your_secret_key_here"
ACCESS_TOKEN_EXPIRES="24h"

# Server
PORT=4000
NODE_ENV="development"
```

### Accès pgAdmin

- URL : `http://localhost:5050`
- Email : `admin@medappointment.com`
- Password : `admin123`

## 📖 Utilisation

### Scripts disponibles

```bash
npm run dev           # Démarrer en mode développement
npm run build         # Compiler TypeScript
npm start             # Démarrer en production
npm run prisma:migrate    # Exécuter les migrations
npm run prisma:generate   # Générer le client Prisma
npm run prisma:studio     # Ouvrir Prisma Studio
```

### Prisma Studio

Pour visualiser et gérer la base de données :
```bash
npm run prisma:studio
```
Ouvre sur `http://localhost:5555`

## 🔌 API Endpoints

### 🔐 Authentification (`/api/auth`)

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| POST | `/register` | Inscription d'un nouvel utilisateur | ❌ |
| POST | `/login` | Connexion | ❌ |
| GET | `/me` | Profil de l'utilisateur connecté | ✅ |

**Exemple - Inscription**
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "doctor@example.com",
    "password": "password123",
    "firstName": "Jean",
    "lastName": "Dupont",
    "phone": "+33612345678",
    "role": "DOCTOR"
  }'
```

**Exemple - Connexion**
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "doctor@example.com",
    "password": "password123"
  }'
```

### 👥 Utilisateurs (`/api/users`)

| Méthode | Endpoint | Description | Rôle requis |
|---------|----------|-------------|-------------|
| GET | `/` | Liste tous les utilisateurs | ADMIN |
| GET | `/doctors` | Liste tous les médecins | Tous |
| GET | `/patients` | Liste tous les patients | ADMIN, DOCTOR |
| GET | `/:id` | Détails d'un utilisateur | Tous |
| PUT | `/:id` | Mettre à jour un utilisateur | ADMIN |
| DELETE | `/:id` | Supprimer un utilisateur | ADMIN |

### 🩺 Médecins (`/api/doctors`)

| Méthode | Endpoint | Description | Rôle requis |
|---------|----------|-------------|-------------|
| POST | `/profile` | Créer un profil médecin | DOCTOR |
| PUT | `/profile` | Mettre à jour son profil | DOCTOR |
| GET | `/profile/me` | Obtenir son profil | DOCTOR |
| GET | `/` | Liste tous les médecins | Tous |
| GET | `/:userId` | Profil d'un médecin | Tous |

**Exemple - Créer un profil médecin**
```bash
curl -X POST http://localhost:4000/api/doctors/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "licenseNumber": "MD12345",
    "specialty": "CARDIOLOGY",
    "yearsExperience": 10,
    "bio": "Cardiologue expérimenté",
    "consultationFee": 80,
    "availableFrom": "09:00",
    "availableTo": "17:00"
  }'
```

### 🏥 Patients (`/api/patients`)

| Méthode | Endpoint | Description | Rôle requis |
|---------|----------|-------------|-------------|
| POST | `/profile` | Créer un profil patient | PATIENT |
| PUT | `/profile` | Mettre à jour son profil | PATIENT |
| GET | `/profile/me` | Obtenir son profil | PATIENT |
| GET | `/` | Liste tous les patients | ADMIN, DOCTOR |
| GET | `/:userId` | Profil d'un patient | ADMIN, DOCTOR |

### 📅 Rendez-vous (`/api/appointments`)

| Méthode | Endpoint | Description | Rôle requis |
|---------|----------|-------------|-------------|
| POST | `/` | Créer un rendez-vous | Tous |
| GET | `/my-appointments` | Mes rendez-vous | Tous |
| GET | `/:id` | Détails d'un rendez-vous | Tous |
| PUT | `/:id` | Mettre à jour un rendez-vous | Tous |
| PATCH | `/:id/cancel` | Annuler un rendez-vous | Tous |
| GET | `/doctor/:doctorId` | RDV d'un médecin | Tous |
| GET | `/patient/:patientId` | RDV d'un patient | ADMIN, DOCTOR |
| GET | `/` | Tous les rendez-vous | ADMIN |
| DELETE | `/:id` | Supprimer un rendez-vous | ADMIN |

**Exemple - Créer un rendez-vous**
```bash
curl -X POST http://localhost:4000/api/appointments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "doctorId": "uuid-du-medecin",
    "patientId": "uuid-du-patient",
    "appointmentDate": "2025-01-15T10:00:00Z",
    "duration": 30,
    "reason": "Consultation de routine"
  }'
```

## 🏗️ Architecture

```
medappointment-backend/
│
├── src/
│   ├── controllers/        # Contrôleurs (logique de gestion des requêtes)
│   ├── services/          # Services (logique métier)
│   ├── middlewares/       # Middlewares (auth, validation, erreurs)
│   ├── routes/            # Définition des routes
│   ├── utils/             # Utilitaires (prisma, jwt, validation)
│   ├── types/             # Types TypeScript
│   ├── app.ts             # Configuration Express
│   └── server.ts          # Point d'entrée
│
├── prisma/
│   └── schema.prisma      # Schéma de la base de données
│
├── docker-compose.yml     # Configuration Docker
├── .env                   # Variables d'environnement
├── package.json
└── tsconfig.json
```

### Modèle de données

```
User (Utilisateur)
├── id (UUID)
├── email (unique)
├── password (hashé)
├── firstName
├── lastName
├── phone
├── role (ADMIN, DOCTOR, PATIENT)
└── Relations : DoctorProfile, PatientProfile, Appointments

DoctorProfile
├── id
├── userId (FK)
├── licenseNumber (unique)
├── specialty
├── yearsExperience
├── bio
├── consultationFee
└── availableFrom/To

PatientProfile
├── id
├── userId (FK)
├── dateOfBirth
├── bloodGroup
├── allergies
├── medicalHistory
└── emergencyContact

Appointment (Rendez-vous)
├── id
├── doctorId (FK)
├── patientId (FK)
├── appointmentDate
├── duration
├── reason
├── notes
└── status (PENDING, CONFIRMED, CANCELLED, COMPLETED)
```

## 🔒 Sécurité

- **JWT** pour l'authentification
- **Bcrypt** pour le hachage des mots de passe
- **Helmet** pour sécuriser les headers HTTP
- **CORS** configuré
- **Rate Limiting** pour prévenir les abus
- **Validation** des entrées avec Zod
- **RBAC** pour le contrôle d'accès basé sur les rôles

## 📝 Rôles et permissions

### ADMIN
- Accès complet à toutes les ressources
- Gestion des utilisateurs
- Suppression des rendez-vous

### DOCTOR
- Gestion de son profil médecin
- Consultation des profils patients
- Gestion de ses rendez-vous
- Consultation de la liste des médecins

### PATIENT
- Gestion de son profil patient
- Création de rendez-vous
- Consultation de ses rendez-vous
- Consultation de la liste des médecins

## 🐛 Dépannage

### Erreur de connexion à PostgreSQL

```bash
# Vérifier que Docker est en cours d'exécution
docker ps

# Redémarrer les conteneurs
docker-compose down
docker-compose up -d
```

### Réinitialiser la base de données

```bash
# Supprimer la base de données
docker-compose down -v

# Recréer tout
docker-compose up -d
npm run prisma:migrate
```

## 📄 Licence

MIT

## 👨‍💻 Auteur

Développé pour le projet MedAppointment
