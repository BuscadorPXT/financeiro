import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

async function limparBanco() {
  try {
    console.log('🗑️  Iniciando limpeza do banco de dados...\n');

    // Deletar na ordem correta respeitando as foreign keys
    console.log('   Deletando comissões...');
    const comissoes = await prisma.comissao.deleteMany({});
    console.log(`   ✅ ${comissoes.count} comissões deletadas`);

    console.log('   Deletando pagamentos...');
    const pagamentos = await prisma.pagamento.deleteMany({});
    console.log(`   ✅ ${pagamentos.count} pagamentos deletados`);

    console.log('   Deletando agenda...');
    const agenda = await prisma.agenda.deleteMany({});
    console.log(`   ✅ ${agenda.count} registros de agenda deletados`);

    console.log('   Deletando churns...');
    const churns = await prisma.churn.deleteMany({});
    console.log(`   ✅ ${churns.count} churns deletados`);

    console.log('   Deletando prospecções...');
    const prospeccoes = await prisma.prospeccao.deleteMany({});
    console.log(`   ✅ ${prospeccoes.count} prospecções deletadas`);

    console.log('   Deletando usuários...');
    const usuarios = await prisma.usuario.deleteMany({});
    console.log(`   ✅ ${usuarios.count} usuários deletados`);

    console.log('   Deletando despesas...');
    const despesas = await prisma.despesa.deleteMany({});
    console.log(`   ✅ ${despesas.count} despesas deletadas`);

    console.log('   Deletando auditoria...');
    const auditoria = await prisma.auditoria.deleteMany({});
    console.log(`   ✅ ${auditoria.count} registros de auditoria deletados`);

    console.log('\n✨ Banco de dados limpo com sucesso!\n');

  } catch (error) {
    console.error('❌ Erro ao limpar banco de dados:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar limpeza
limparBanco()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
