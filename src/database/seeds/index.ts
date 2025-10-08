import { PrismaClient } from '../../generated/prisma';
import { seedListasAuxiliares } from './listasAuxiliares.seed';
import { seedUsuarios } from './usuarios.seed';

const prisma = new PrismaClient();

async function main() {
  console.log('\n🚀 Starting database seeding...\n');

  try {
    // Seed Listas Auxiliares (obrigatório)
    await seedListasAuxiliares();

    // Seed Usuários de Teste (opcional)
    await seedUsuarios();

    console.log('🎉 Database seeding completed successfully!\n');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
