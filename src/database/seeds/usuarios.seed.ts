import {
  PrismaClient,
  StatusFinal,
  MetodoPagamento,
} from '../../generated/prisma';

const prisma = new PrismaClient();

export async function seedUsuarios() {
  console.log('🌱 Seeding Usuários de Teste...');

  const usuariosTest = [
    {
      emailLogin: 'joao.silva@example.com',
      nomeCompleto: 'João Silva',
      telefone: '(11) 98765-4321',
      indicador: 'Direto',
      statusFinal: StatusFinal.ATIVO,
      metodo: MetodoPagamento.PIX,
      conta: 'PXT',
      obs: 'Cliente desde o início',
    },
    {
      emailLogin: 'maria.santos@example.com',
      nomeCompleto: 'Maria Santos',
      telefone: '(11) 98765-4322',
      indicador: 'João Silva',
      statusFinal: StatusFinal.ATIVO,
      metodo: MetodoPagamento.CREDITO,
      conta: 'EAGLE',
      obs: 'Indicação de João Silva',
    },
    {
      emailLogin: 'pedro.costa@example.com',
      nomeCompleto: 'Pedro Costa',
      telefone: '(11) 98765-4323',
      indicador: 'Orgânico',
      statusFinal: StatusFinal.INATIVO,
      obs: 'Cliente inativo - cancelou assinatura',
    },
    {
      emailLogin: 'ana.oliveira@example.com',
      nomeCompleto: 'Ana Oliveira',
      telefone: '(11) 98765-4324',
      indicador: 'Maria Santos',
      statusFinal: StatusFinal.ATIVO,
      metodo: MetodoPagamento.PIX,
      conta: 'PXT',
    },
    {
      emailLogin: 'carlos.souza@example.com',
      nomeCompleto: 'Carlos Souza',
      telefone: '(11) 98765-4325',
      indicador: 'Direto',
      statusFinal: StatusFinal.EM_ATRASO,
      metodo: MetodoPagamento.DINHEIRO,
      conta: 'PXT',
      obs: 'Pagamento em atraso',
    },
  ];

  for (const usuario of usuariosTest) {
    await prisma.usuario.upsert({
      where: { emailLogin: usuario.emailLogin },
      update: {},
      create: usuario,
    });
  }

  console.log('  ✅ Usuários de teste criados:', usuariosTest.length, 'usuários');
  console.log('✅ Usuários seeded successfully!\n');
}
