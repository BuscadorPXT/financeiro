import prisma from '../../database/client';
import { StatusFinal, RegraTipo, StatusDespesa } from '../../generated/prisma';

class RelatorioService {
  /**
   * Mapeia número do mês para abreviação em português (formato do banco)
   */
  private getMesAbreviacao(mes: string): string {
    const meses: { [key: string]: string } = {
      '01': 'JAN',
      '02': 'FEV',
      '03': 'MAR',
      '04': 'ABR',
      '05': 'MAI',
      '06': 'JUN',
      '07': 'JUL',
      '08': 'AGO',
      '09': 'SET',
      '10': 'OUT',
      '11': 'NOV',
      '12': 'DEZ',
    };
    return meses[mes] || mes;
  }

  /**
   * Dashboard principal com KPIs gerais
   */
  async getDashboard(filters?: { mes?: string; ano?: number }): Promise<{
    usuarios: {
      total: number;
      ativos: number;
      inativos: number;
      emAtraso: number;
      churn: number;
      taxaChurn: number;
    };
    financeiro: {
      receitaTotal: number;
      despesaTotal: number;
      saldo: number;
      receitaMensal: number;
      despesaMensal: number;
      saldoMensal: number;
    };
    pagamentos: {
      total: number;
      primeiros: number;
      recorrentes: number;
      valorMedio: number;
    };
    comissoes: {
      total: number;
      valorTotal: number;
      indicadores: number;
    };
    prospeccao: {
      total: number;
      convertidas: number;
      taxaConversao: number;
    };
  }> {
    const wherePagamento: any = {};
    const whereDespesa: any = {};

    // Filtros de período
    if (filters?.mes && filters?.ano) {
      // Se tem mês E ano: busca formato "OUT/2025" OU apenas "OUT" do ano especificado
      const mesAbrev = this.getMesAbreviacao(filters.mes);
      const mesComAno = `${mesAbrev}/${filters.ano}`;

      wherePagamento.OR = [
        { mesPagto: mesComAno },
        {
          AND: [
            { mesPagto: mesAbrev },
            {
              dataPagto: {
                gte: new Date(`${filters.ano}-${filters.mes}-01`),
                lt: new Date(`${filters.ano}-${String(parseInt(filters.mes) + 1).padStart(2, '0')}-01`)
              }
            }
          ]
        }
      ];

      whereDespesa.competenciaMes = parseInt(filters.mes);
      whereDespesa.competenciaAno = filters.ano;
    } else if (filters?.mes) {
      // Apenas mês: aceita qualquer ano
      const mesAbrev = this.getMesAbreviacao(filters.mes);
      wherePagamento.OR = [
        { mesPagto: { startsWith: mesAbrev } },
        { mesPagto: mesAbrev }
      ];
      whereDespesa.competenciaMes = parseInt(filters.mes);
    } else if (filters?.ano) {
      // Apenas ano: filtra por data ou por sufixo no mesPagto
      wherePagamento.OR = [
        { mesPagto: { endsWith: `/${filters.ano}` } },
        {
          dataPagto: {
            gte: new Date(`${filters.ano}-01-01`),
            lte: new Date(`${filters.ano}-12-31T23:59:59`),
          }
        }
      ];
      whereDespesa.competenciaAno = filters.ano;
    }

    // Busca dados de usuários
    const [
      totalUsuarios,
      usuariosAtivos,
      usuariosInativos,
      usuariosEmAtraso,
      usuariosChurn,
    ] = await Promise.all([
      prisma.usuario.count(),
      prisma.usuario.count({ where: { statusFinal: StatusFinal.ATIVO } }),
      prisma.usuario.count({ where: { statusFinal: StatusFinal.INATIVO } }),
      prisma.usuario.count({ where: { statusFinal: StatusFinal.EM_ATRASO } }),
      prisma.usuario.count({ where: { churn: true } }),
    ]);

    // Busca dados financeiros
    // Se houver filtro, usa os filtros. Se não, busca tudo
    const temFiltro = filters?.mes || filters?.ano;

    const [pagamentos, despesas, pagamentosMes, despesasMes] = await Promise.all([
      prisma.pagamento.aggregate({
        where: temFiltro ? wherePagamento : {},
        _sum: { valor: true },
        _count: true,
      }),
      prisma.despesa.aggregate({
        where: temFiltro ? { ...whereDespesa, status: StatusDespesa.PAGO } : { status: StatusDespesa.PAGO },
        _sum: { valor: true },
      }),
      prisma.pagamento.aggregate({
        where: wherePagamento,
        _sum: { valor: true },
      }),
      prisma.despesa.aggregate({
        where: {
          ...whereDespesa,
          status: StatusDespesa.PAGO,
        },
        _sum: { valor: true },
      }),
    ]);

    // Busca dados de pagamentos
    const wherePagamentoPrimeiro = temFiltro
      ? { ...wherePagamento, regraTipo: RegraTipo.PRIMEIRO }
      : { regraTipo: RegraTipo.PRIMEIRO };

    const wherePagamentoRecorrente = temFiltro
      ? { ...wherePagamento, regraTipo: RegraTipo.RECORRENTE }
      : { regraTipo: RegraTipo.RECORRENTE };

    const [pagamentosPrimeiros, pagamentosRecorrentes, valorMedio] = await Promise.all([
      prisma.pagamento.count({ where: wherePagamentoPrimeiro }),
      prisma.pagamento.count({ where: wherePagamentoRecorrente }),
      prisma.pagamento.aggregate({
        where: temFiltro ? wherePagamento : {},
        _avg: { valor: true }
      }),
    ]);

    // Busca dados de comissões
    const whereComissao: any = {};
    if (temFiltro) {
      if (filters?.mes && filters?.ano) {
        // Formato: DD/MM/YYYY, então filtramos por "/MM/YYYY"
        const mesFormatado = filters.mes.padStart(2, '0');
        whereComissao.mesRef = {
          endsWith: `/${mesFormatado}/${filters.ano}`
        };
      } else if (filters?.ano) {
        // Apenas ano: filtra por "/YYYY"
        whereComissao.mesRef = {
          endsWith: `/${filters.ano}`
        };
      }
    }

    const [comissoes, indicadoresComissao] = await Promise.all([
      prisma.comissao.aggregate({
        where: whereComissao,
        _sum: { valor: true },
        _count: true,
      }),
      prisma.comissao.groupBy({
        by: ['indicador'],
        where: whereComissao,
      }),
    ]);

    // Busca dados de prospecção
    const [prospeccaoTotal, prospeccaoConvertida] = await Promise.all([
      prisma.prospeccao.count(),
      prisma.prospeccao.count({ where: { convertido: true } }),
    ]);

    const receitaTotal = Number(pagamentos._sum.valor || 0);
    const despesaTotal = Number(despesas._sum.valor || 0);
    const receitaMensal = Number(pagamentosMes._sum.valor || 0);
    const despesaMensal = Number(despesasMes._sum.valor || 0);

    return {
      usuarios: {
        total: totalUsuarios,
        ativos: usuariosAtivos,
        inativos: usuariosInativos,
        emAtraso: usuariosEmAtraso,
        churn: usuariosChurn,
        taxaChurn:
          totalUsuarios > 0
            ? Number(((usuariosChurn / totalUsuarios) * 100).toFixed(2))
            : 0,
      },
      financeiro: {
        receitaTotal,
        despesaTotal,
        saldo: receitaTotal - despesaTotal,
        receitaMensal,
        despesaMensal,
        saldoMensal: receitaMensal - despesaMensal,
      },
      pagamentos: {
        total: pagamentos._count,
        primeiros: pagamentosPrimeiros,
        recorrentes: pagamentosRecorrentes,
        valorMedio: Number(valorMedio._avg.valor || 0),
      },
      comissoes: {
        total: comissoes._count,
        valorTotal: Number(comissoes._sum.valor || 0),
        indicadores: indicadoresComissao.length,
      },
      prospeccao: {
        total: prospeccaoTotal,
        convertidas: prospeccaoConvertida,
        taxaConversao:
          prospeccaoTotal > 0
            ? Number(((prospeccaoConvertida / prospeccaoTotal) * 100).toFixed(2))
            : 0,
      },
    };
  }

  /**
   * Relatório financeiro detalhado
   */
  async getRelatorioFinanceiro(_filters?: {
    mesInicio?: string;
    mesFim?: string;
    anoInicio?: number;
    anoFim?: number;
  }): Promise<{
    resumo: {
      receitaTotal: number;
      despesaTotal: number;
      despesaPaga: number;
      despesaPendente: number;
      saldo: number;
      comissoesTotal: number;
    };
    porMes: Array<{
      mes: string;
      receita: number;
      despesa: number;
      saldo: number;
      comissoes: number;
    }>;
    porConta: Array<{
      conta: string;
      receita: number;
      pagamentos: number;
    }>;
    porMetodo: Array<{
      metodo: string;
      receita: number;
      pagamentos: number;
    }>;
  }> {
    // Busca todos os pagamentos
    const pagamentos = await prisma.pagamento.findMany({
      select: {
        valor: true,
        mesPagto: true,
        metodo: true,
        conta: true,
      },
    });

    // Busca todas as despesas
    const despesas = await prisma.despesa.findMany({
      select: {
        valor: true,
        status: true,
        competenciaMes: true,
        competenciaAno: true,
      },
    });

    // Busca comissões
    const comissoes = await prisma.comissao.aggregate({
      _sum: { valor: true },
    });

    // Calcula totais
    const receitaTotal = pagamentos.reduce((sum, p) => sum + Number(p.valor), 0);
    const despesaTotal = despesas.reduce((sum, d) => sum + Number(d.valor), 0);
    const despesaPaga = despesas
      .filter((d) => d.status === StatusDespesa.PAGO)
      .reduce((sum, d) => sum + Number(d.valor), 0);
    const despesaPendente = despesas
      .filter((d) => d.status === StatusDespesa.PENDENTE)
      .reduce((sum, d) => sum + Number(d.valor), 0);

    // Agrupa por mês
    const porMesMap = new Map<string, { receita: number; despesa: number; comissoes: number }>();

    pagamentos.forEach((p) => {
      const mes = p.mesPagto;
      const current = porMesMap.get(mes) || { receita: 0, despesa: 0, comissoes: 0 };
      current.receita += Number(p.valor);
      porMesMap.set(mes, current);
    });

    despesas.forEach((d) => {
      if (d.status === StatusDespesa.PAGO) {
        const mes = `${String(d.competenciaMes).padStart(2, '0')}/${d.competenciaAno}`;
        const current = porMesMap.get(mes) || { receita: 0, despesa: 0, comissoes: 0 };
        current.despesa += Number(d.valor);
        porMesMap.set(mes, current);
      }
    });

    const porMes = Array.from(porMesMap.entries())
      .map(([mes, data]) => ({
        mes,
        receita: data.receita,
        despesa: data.despesa,
        saldo: data.receita - data.despesa,
        comissoes: data.comissoes,
      }))
      .sort((a, b) => b.mes.localeCompare(a.mes));

    // Agrupa por conta
    const porContaMap = new Map<string, { receita: number; pagamentos: number }>();
    pagamentos.forEach((p) => {
      const conta = p.conta;
      const current = porContaMap.get(conta) || { receita: 0, pagamentos: 0 };
      current.receita += Number(p.valor);
      current.pagamentos += 1;
      porContaMap.set(conta, current);
    });

    const porConta = Array.from(porContaMap.entries()).map(([conta, data]) => ({
      conta,
      receita: data.receita,
      pagamentos: data.pagamentos,
    }));

    // Agrupa por método
    const porMetodoMap = new Map<string, { receita: number; pagamentos: number }>();
    pagamentos.forEach((p) => {
      const metodo = p.metodo;
      const current = porMetodoMap.get(metodo) || { receita: 0, pagamentos: 0 };
      current.receita += Number(p.valor);
      current.pagamentos += 1;
      porMetodoMap.set(metodo, current);
    });

    const porMetodo = Array.from(porMetodoMap.entries()).map(([metodo, data]) => ({
      metodo,
      receita: data.receita,
      pagamentos: data.pagamentos,
    }));

    return {
      resumo: {
        receitaTotal,
        despesaTotal,
        despesaPaga,
        despesaPendente,
        saldo: receitaTotal - despesaPaga,
        comissoesTotal: Number(comissoes._sum.valor || 0),
      },
      porMes,
      porConta,
      porMetodo,
    };
  }

  /**
   * Relatório de usuários
   */
  async getRelatorioUsuarios(): Promise<{
    resumo: {
      total: number;
      ativos: number;
      inativos: number;
      emAtraso: number;
      historico: number;
      churn: number;
      taxaChurn: number;
      taxaAtivos: number;
    };
    porStatus: Array<{
      status: string;
      quantidade: number;
      percentual: number;
    }>;
    porIndicador: Array<{
      indicador: string;
      total: number;
      ativos: number;
      churn: number;
    }>;
    ciclos: {
      media: number;
      maximo: number;
      distribuicao: Array<{
        ciclo: number;
        quantidade: number;
      }>;
    };
  }> {
    const [usuarios, porStatus, porIndicador, ciclos] = await Promise.all([
      prisma.usuario.findMany({
        select: {
          statusFinal: true,
          churn: true,
          indicador: true,
          ciclo: true,
        },
      }),
      prisma.usuario.groupBy({
        by: ['statusFinal'],
        _count: true,
      }),
      prisma.usuario.groupBy({
        by: ['indicador'],
        _count: true,
      }),
      prisma.usuario.aggregate({
        _avg: { ciclo: true },
        _max: { ciclo: true },
      }),
    ]);

    const total = usuarios.length;
    const ativos = usuarios.filter((u) => u.statusFinal === StatusFinal.ATIVO).length;
    const inativos = usuarios.filter((u) => u.statusFinal === StatusFinal.INATIVO).length;
    const emAtraso = usuarios.filter((u) => u.statusFinal === StatusFinal.EM_ATRASO).length;
    const historico = usuarios.filter((u) => u.statusFinal === StatusFinal.HISTORICO).length;
    const churn = usuarios.filter((u) => u.churn).length;

    // Distribui por status com percentual
    const statusComPercentual = porStatus.map((s) => ({
      status: s.statusFinal,
      quantidade: s._count,
      percentual: total > 0 ? Number(((s._count / total) * 100).toFixed(2)) : 0,
    }));

    // Distribui por indicador
    const indicadorDetalhado = await Promise.all(
      porIndicador.map(async (item) => {
        const [totalInd, ativosInd, churnInd] = await Promise.all([
          prisma.usuario.count({ where: { indicador: item.indicador } }),
          prisma.usuario.count({
            where: { indicador: item.indicador, statusFinal: StatusFinal.ATIVO },
          }),
          prisma.usuario.count({ where: { indicador: item.indicador, churn: true } }),
        ]);

        return {
          indicador: item.indicador || 'Sem indicador',
          total: totalInd,
          ativos: ativosInd,
          churn: churnInd,
        };
      })
    );

    // Distribuição de ciclos
    const ciclosGroup = await prisma.usuario.groupBy({
      by: ['ciclo'],
      _count: true,
      orderBy: { ciclo: 'asc' },
    });

    return {
      resumo: {
        total,
        ativos,
        inativos,
        emAtraso,
        historico,
        churn,
        taxaChurn: total > 0 ? Number(((churn / total) * 100).toFixed(2)) : 0,
        taxaAtivos: total > 0 ? Number(((ativos / total) * 100).toFixed(2)) : 0,
      },
      porStatus: statusComPercentual,
      porIndicador: indicadorDetalhado,
      ciclos: {
        media: Number(ciclos._avg.ciclo || 0),
        maximo: ciclos._max.ciclo || 0,
        distribuicao: ciclosGroup.map((c) => ({
          ciclo: c.ciclo,
          quantidade: c._count,
        })),
      },
    };
  }

  /**
   * Relatório de desempenho mensal
   */
  async getDesempenhoMensal(ano?: number): Promise<
    Array<{
      mes: string;
      novosUsuarios: number;
      usuariosAtivos: number;
      pagamentos: number;
      receita: number;
      ticketMedio: number;
      churn: number;
      taxaChurn: number;
    }>
  > {
    const anoFiltro = ano || new Date().getFullYear();

    // Busca todos os usuários criados no ano
    const usuarios = await prisma.usuario.findMany({
      where: {
        createdAt: {
          gte: new Date(`${anoFiltro}-01-01`),
          lte: new Date(`${anoFiltro}-12-31`),
        },
      },
      select: {
        createdAt: true,
        statusFinal: true,
      },
    });

    // Busca todos os pagamentos do ano
    const pagamentos = await prisma.pagamento.findMany({
      where: {
        mesPagto: {
          contains: `/${anoFiltro}`,
        },
      },
      select: {
        mesPagto: true,
        valor: true,
      },
    });

    // Busca churns do ano
    const churns = await prisma.churn.findMany({
      where: {
        dataChurn: {
          gte: new Date(`${anoFiltro}-01-01`),
          lte: new Date(`${anoFiltro}-12-31`),
        },
      },
      select: {
        dataChurn: true,
      },
    });

    // Agrupa por mês
    const meses = [
      '01',
      '02',
      '03',
      '04',
      '05',
      '06',
      '07',
      '08',
      '09',
      '10',
      '11',
      '12',
    ];

    const desempenho = meses.map((mes) => {
      const mesStr = `${mes}/${anoFiltro}`;

      // Novos usuários no mês
      const novos = usuarios.filter((u) => {
        const mesUsuario = new Date(u.createdAt).getMonth() + 1;
        return String(mesUsuario).padStart(2, '0') === mes;
      }).length;

      // Usuários ativos no mês
      const ativos = usuarios.filter((u) => {
        const mesUsuario = new Date(u.createdAt).getMonth() + 1;
        return (
          String(mesUsuario).padStart(2, '0') <= mes && u.statusFinal === StatusFinal.ATIVO
        );
      }).length;

      // Pagamentos do mês
      const pagamentosMes = pagamentos.filter((p) => p.mesPagto === mesStr);
      const qtdPagamentos = pagamentosMes.length;
      const receita = pagamentosMes.reduce((sum, p) => sum + Number(p.valor), 0);

      // Churns do mês
      const churnsMes = churns.filter((c) => {
        const mesChurn = new Date(c.dataChurn).getMonth() + 1;
        return String(mesChurn).padStart(2, '0') === mes;
      }).length;

      return {
        mes: mesStr,
        novosUsuarios: novos,
        usuariosAtivos: ativos,
        pagamentos: qtdPagamentos,
        receita,
        ticketMedio: qtdPagamentos > 0 ? Number((receita / qtdPagamentos).toFixed(2)) : 0,
        churn: churnsMes,
        taxaChurn: ativos > 0 ? Number(((churnsMes / ativos) * 100).toFixed(2)) : 0,
      };
    });

    return desempenho;
  }

  /**
   * Relatório de agenda e renovações
   */
  async getRelatorioAgenda(): Promise<{
    resumo: {
      totalAgendados: number;
      renovados: number;
      cancelados: number;
      pendentes: number;
      taxaRenovacao: number;
    };
    vencimentos: {
      vencidosHoje: number;
      proximos7Dias: number;
      proximos30Dias: number;
    };
  }> {
    const hoje = new Date();
    const seteDias = new Date();
    seteDias.setDate(hoje.getDate() + 7);
    const trintaDias = new Date();
    trintaDias.setDate(hoje.getDate() + 30);

    const [total, renovados, cancelados, vencidosHoje, proximos7, proximos30] =
      await Promise.all([
        prisma.agenda.count(),
        prisma.agenda.count({ where: { renovou: true } }),
        prisma.agenda.count({ where: { cancelou: true } }),
        prisma.agenda.count({
          where: {
            dataVenc: {
              lte: hoje,
            },
            renovou: false,
            cancelou: false,
          },
        }),
        prisma.agenda.count({
          where: {
            dataVenc: {
              gte: hoje,
              lte: seteDias,
            },
            renovou: false,
            cancelou: false,
          },
        }),
        prisma.agenda.count({
          where: {
            dataVenc: {
              gte: hoje,
              lte: trintaDias,
            },
            renovou: false,
            cancelou: false,
          },
        }),
      ]);

    const pendentes = total - renovados - cancelados;

    return {
      resumo: {
        totalAgendados: total,
        renovados,
        cancelados,
        pendentes,
        taxaRenovacao: total > 0 ? Number(((renovados / total) * 100).toFixed(2)) : 0,
      },
      vencimentos: {
        vencidosHoje,
        proximos7Dias: proximos7,
        proximos30Dias: proximos30,
      },
    };
  }
}

export default new RelatorioService();
