import { PrismaClient, TipoLista } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedListasAuxiliares() {
  console.log('🌱 Seeding Listas Auxiliares...');

  // Seed Contas Financeiras
  const contas = ['PXT', 'EAGLE'];
  for (const conta of contas) {
    await prisma.listaAuxiliar.upsert({
      where: {
        tipo_valor: {
          tipo: TipoLista.CONTA,
          valor: conta,
        },
      },
      update: {},
      create: {
        tipo: TipoLista.CONTA,
        valor: conta,
        ativo: true,
      },
    });
  }
  console.log('  ✅ Contas financeiras criadas:', contas.join(', '));

  // Seed Métodos de Pagamento
  const metodos = ['PIX', 'CREDITO', 'DINHEIRO'];
  for (const metodo of metodos) {
    await prisma.listaAuxiliar.upsert({
      where: {
        tipo_valor: {
          tipo: TipoLista.METODO,
          valor: metodo,
        },
      },
      update: {},
      create: {
        tipo: TipoLista.METODO,
        valor: metodo,
        ativo: true,
      },
    });
  }
  console.log('  ✅ Métodos de pagamento criados:', metodos.join(', '));

  // Seed Categorias de Despesa
  const categorias = [
    'DEV v1',
    'DEV v2',
    'Comissões',
    'Taxas',
    'Aluguel',
    'Salários',
    'API',
    'Anúncios',
    'Permuta',
    'Infra',
    'Marketing',
    'Outros',
  ];
  for (const categoria of categorias) {
    await prisma.listaAuxiliar.upsert({
      where: {
        tipo_valor: {
          tipo: TipoLista.CATEGORIA,
          valor: categoria,
        },
      },
      update: {},
      create: {
        tipo: TipoLista.CATEGORIA,
        valor: categoria,
        ativo: true,
      },
    });
  }
  console.log('  ✅ Categorias de despesa criadas:', categorias.length, 'categorias');

  // Seed Indicadores (exemplo)
  const indicadores = [
    'João Silva',
    'Maria Santos',
    'Pedro Costa',
    'Ana Oliveira',
    'Direto',
    'Orgânico',
  ];
  for (const indicador of indicadores) {
    await prisma.listaAuxiliar.upsert({
      where: {
        tipo_valor: {
          tipo: TipoLista.INDICADOR,
          valor: indicador,
        },
      },
      update: {},
      create: {
        tipo: TipoLista.INDICADOR,
        valor: indicador,
        ativo: true,
      },
    });
  }
  console.log('  ✅ Indicadores criados:', indicadores.length, 'indicadores');

  console.log('✅ Listas Auxiliares seeded successfully!\n');
}
