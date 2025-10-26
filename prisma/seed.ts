import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Début du seeding de la base de données...');

  // Créer un compte administrateur par défaut
  const adminEmail = 'admin@medappointment.com';
  const adminPassword = 'Admin123!'; // À CHANGER EN PRODUCTION!

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        firstName: 'Super',
        lastName: 'Admin',
        role: UserRole.ADMIN,
        isActive: true,
      },
    });

    console.log('✅ Compte administrateur créé:');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
    console.log('   ⚠️  IMPORTANT: Changez ce mot de passe en production!');
  } else {
    console.log('ℹ️  Compte administrateur existe déjà');
  }

  console.log('✅ Seeding terminé!');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });