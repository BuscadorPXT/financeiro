import prisma from '../client';
import authService from '../../backend/services/authService';

async function createFirstAdmin() {
  console.log('🌱 Criando primeiro admin...');

  try {
    // Verificar se já existe algum admin
    const existingAdmin = await prisma.admin.findFirst();

    if (existingAdmin) {
      console.log('⚠️  Já existe um admin cadastrado. Pulando seed.');
      return;
    }

    // Criar admin padrão
    await authService.createAdmin(
      'admin',      // login
      'admin123',   // senha (MUDAR EM PRODUÇÃO!)
      'Administrador'  // nome
    );

    console.log('✅ Admin criado com sucesso:');
    console.log(`   Login: admin`);
    console.log(`   Senha: admin123`);
    console.log(`   IMPORTANTE: Altere a senha após o primeiro login!`);

  } catch (error) {
    console.error('❌ Erro ao criar admin:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  createFirstAdmin()
    .then(() => {
      console.log('✅ Seed concluído');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erro no seed:', error);
      process.exit(1);
    });
}

export default createFirstAdmin;
