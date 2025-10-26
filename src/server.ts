import dotenv from 'dotenv';
import app from './app';
import prisma from './utils/prisma';

// Charger les variables d'environnement
dotenv.config();

const PORT = process.env.PORT || 4000;

// Démarrer le serveur
const startServer = async () => {
  try {
    // Tester la connexion à la base de données
    await prisma.$connect();
    console.log('✅ Connecté à la base de données PostgreSQL');

    // Démarrer le serveur Express
    app.listen(PORT, () => {
      console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
      console.log(`📚 Documentation API disponible sur http://localhost:${PORT}`);
      console.log(`🏥 Environnement: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  }
};

// Gestion de l'arrêt gracieux
const gracefulShutdown = async () => {
  console.log('\n🛑 Arrêt du serveur...');
  await prisma.$disconnect();
  console.log('✅ Connexion à la base de données fermée');
  process.exit(0);
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

// Démarrer le serveur
startServer();
