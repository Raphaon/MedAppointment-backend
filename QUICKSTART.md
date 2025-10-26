# 🚀 GUIDE DE DÉMARRAGE RAPIDE - MedAppointment Backend

## ✅ Ce qui a été créé

Votre backend est maintenant **100% fonctionnel** avec :

### 📦 Modules implémentés
- ✅ Authentification (inscription, connexion, profil)
- ✅ Gestion des utilisateurs (CRUD complet)
- ✅ Profils médecins (avec spécialités)
- ✅ Profils patients (avec historique médical)
- ✅ Rendez-vous médicaux (CRUD complet)
- ✅ RBAC (contrôle d'accès par rôles)
- ✅ Validation des données (Zod)
- ✅ Gestion des erreurs
- ✅ Sécurité (JWT, Bcrypt, Helmet, CORS, Rate Limiting)

### 🗂️ Structure créée
```
medappointment-backend/
├── src/
│   ├── controllers/       (5 fichiers) ✅
│   ├── services/         (5 fichiers) ✅
│   ├── middlewares/      (3 fichiers) ✅
│   ├── routes/           (5 fichiers) ✅
│   ├── utils/            (4 fichiers) ✅
│   ├── types/            (1 fichier) ✅
│   ├── app.ts            ✅
│   └── server.ts         ✅
├── prisma/
│   └── schema.prisma     ✅
├── docker-compose.yml    ✅
├── .env                  ✅
├── package.json          ✅
├── tsconfig.json         ✅
└── README.md             ✅
```

---

## 🎯 DÉMARRAGE EN 5 ÉTAPES

### 1️⃣ Installer les dépendances
```bash
cd medappointment-backend
npm install
```

### 2️⃣ Démarrer PostgreSQL avec Docker
```bash
docker-compose up -d
```

**Vérifier que ça fonctionne :**
```bash
docker ps
# Vous devriez voir : medappointment-postgres et medappointment-pgadmin
```

### 3️⃣ Configurer Prisma
```bash
# Générer le client Prisma
npm run prisma:generate

# Créer les tables dans la base de données
npm run prisma:migrate
```

**Si on vous demande un nom de migration, tapez :** `init`

### 4️⃣ Démarrer le serveur
```bash
npm run dev
```

**Vous devriez voir :**
```
✅ Connecté à la base de données PostgreSQL
🚀 Serveur démarré sur http://localhost:4000
```

### 5️⃣ Tester l'API
Ouvrez votre navigateur ou utilisez curl :
```bash
curl http://localhost:4000
```

---

## 🧪 TESTS RAPIDES

### Test 1 : Créer un compte admin
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@medapp.com",
    "password": "admin123",
    "firstName": "Admin",
    "lastName": "System",
    "role": "ADMIN"
  }'
```

**Copiez le TOKEN retourné !** (vous en aurez besoin)

### Test 2 : Se connecter
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@medapp.com",
    "password": "admin123"
  }'
```

### Test 3 : Obtenir son profil
```bash
curl http://localhost:4000/api/auth/me \
  -H "Authorization: Bearer VOTRE_TOKEN_ICI"
```

### Test 4 : Créer un médecin
```bash
# D'abord, créer le compte utilisateur
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "dr.smith@hospital.com",
    "password": "doctor123",
    "firstName": "John",
    "lastName": "Smith",
    "phone": "+1234567890",
    "role": "DOCTOR"
  }'
```

**Copiez le token du médecin, puis créez son profil :**
```bash
curl -X POST http://localhost:4000/api/doctors/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN_DU_MEDECIN" \
  -d '{
    "licenseNumber": "MD12345",
    "specialty": "CARDIOLOGY",
    "yearsExperience": 15,
    "bio": "Cardiologue spécialisé",
    "consultationFee": 100,
    "availableFrom": "09:00",
    "availableTo": "17:00"
  }'
```

### Test 5 : Créer un patient
```bash
# Créer le compte
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "patient@email.com",
    "password": "patient123",
    "firstName": "Marie",
    "lastName": "Dubois",
    "phone": "+1234567891",
    "role": "PATIENT"
  }'
```

### Test 6 : Créer un rendez-vous
```bash
curl -X POST http://localhost:4000/api/appointments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN_DU_PATIENT_OU_ADMIN" \
  -d '{
    "doctorId": "UUID_DU_MEDECIN",
    "patientId": "UUID_DU_PATIENT",
    "appointmentDate": "2025-01-20T10:00:00Z",
    "duration": 30,
    "reason": "Consultation cardiaque de routine"
  }'
```

---

## 🔧 OUTILS UTILES

### Prisma Studio (Interface graphique pour la BDD)
```bash
npm run prisma:studio
```
Ouvre sur `http://localhost:5555`

### pgAdmin (Interface PostgreSQL)
Ouvrez `http://localhost:5050`
- Email : `admin@medappointment.com`
- Password : `admin123`

**Pour se connecter à la BDD dans pgAdmin :**
1. Clic droit sur "Servers" > "Register" > "Server"
2. General > Name: `MedAppointment`
3. Connection:
   - Host: `postgres` (ou `localhost` si ça ne marche pas)
   - Port: `5432`
   - Database: `medappointment`
   - Username: `postgres`
   - Password: `postgres`

---

## 📊 ÉNUMÉRATIONS DISPONIBLES

### Rôles (UserRole)
- `ADMIN` - Accès complet
- `DOCTOR` - Médecin
- `PATIENT` - Patient

### Spécialités médicales (MedicalSpecialty)
- `GENERAL_PRACTICE` - Médecine générale
- `CARDIOLOGY` - Cardiologie
- `DERMATOLOGY` - Dermatologie
- `PEDIATRICS` - Pédiatrie
- `GYNECOLOGY` - Gynécologie
- `ORTHOPEDICS` - Orthopédie
- `PSYCHIATRY` - Psychiatrie
- `OPHTHALMOLOGY` - Ophtalmologie
- `ENT` - ORL
- `NEUROLOGY` - Neurologie
- `OTHER` - Autre

### Statuts de rendez-vous (AppointmentStatus)
- `PENDING` - En attente
- `CONFIRMED` - Confirmé
- `CANCELLED` - Annulé
- `COMPLETED` - Terminé
- `NO_SHOW` - Absence

---

## 🐛 PROBLÈMES COURANTS

### Erreur : "Cannot connect to database"
```bash
# Vérifier que Docker est lancé
docker ps

# Redémarrer les conteneurs
docker-compose down
docker-compose up -d
```

### Erreur : "Port 5432 already in use"
Vous avez déjà PostgreSQL installé localement.
**Solution 1 :** Arrêter le PostgreSQL local
**Solution 2 :** Changer le port dans docker-compose.yml (ex: "5433:5432")

### Erreur : "Prisma schema not found"
```bash
# Générer à nouveau
npm run prisma:generate
```

### Réinitialiser complètement la base de données
```bash
docker-compose down -v
docker-compose up -d
npm run prisma:migrate
```

---

## 📝 PROCHAINES ÉTAPES

Votre backend est prêt ! Vous pouvez maintenant :

1. ✅ **Tester toutes les routes** avec Postman ou curl
2. ✅ **Créer le frontend** (Angular, React, Vue...)
3. ✅ **Créer l'app mobile** (Ionic, React Native...)
4. ✅ **Ajouter des notifications** (email, SMS)
5. ✅ **Déployer** (Heroku, AWS, DigitalOcean...)

---

## 📞 BESOIN D'AIDE ?

Consultez le README.md complet pour plus d'informations !

**Bon développement ! 🚀**
