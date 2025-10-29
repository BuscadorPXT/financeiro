import prisma from '../client';
import bcrypt from 'bcryptjs';

async function updateAdminCredentials() {
  console.log('🔐 Atualizando credenciais do admin...');

  try {
    const newLogin = 'buscadorpxt';
    const newSenha = 'buscador2025';
    const newNome = 'Buscador Admin';

    // Verificar se já existe algum admin
    const existingAdmin = await prisma.admin.findFirst();

    if (existingAdmin) {
      console.log('✏️  Admin encontrado. Atualizando credenciais...');

      // Hash da nova senha (8 rounds para melhor performance)
      const senhaHash = await bcrypt.hash(newSenha, 8);

      // Atualizar admin existente
      await prisma.admin.update({
        where: { id: existingAdmin.id },
        data: {
          login: newLogin,
          senha: senhaHash,
          nome: newNome,
          ativo: true,
        },
      });

      console.log('✅ Credenciais atualizadas com sucesso!');
    } else {
      console.log('➕ Nenhum admin encontrado. Criando novo admin...');

      // Hash da senha (8 rounds para melhor performance)
      const senhaHash = await bcrypt.hash(newSenha, 8);

      // Criar novo admin
      await prisma.admin.create({
        data: {
          login: newLogin,
          senha: senhaHash,
          nome: newNome,
          ativo: true,
        },
      });

      console.log('✅ Admin criado com sucesso!');
    }

    console.log('');
    console.log('📋 Novas credenciais:');
    console.log(`   Login: ${newLogin}`);
    console.log(`   Senha: ${newSenha}`);
    console.log(`   Nome: ${newNome}`);
    console.log('');

  } catch (error) {
    console.error('❌ Erro ao atualizar credenciais:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  updateAdminCredentials()
    .then(() => {
      console.log('✅ Atualização concluída');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erro na atualização:', error);
      process.exit(1);
    });
}

export default updateAdminCredentials;
