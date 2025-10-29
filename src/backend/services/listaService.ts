import prisma from '../../database/client';
import { TipoLista, ListaAuxiliar } from '@prisma/client';
import { AppError } from '../errors';
import { HTTP_STATUS } from '../../shared/constants';

class ListaService {
  /**
   * Lista todos os itens de um tipo específico
   */
  async findByTipo(tipo: TipoLista): Promise<ListaAuxiliar[]> {
    return await prisma.listaAuxiliar.findMany({
      where: { tipo, ativo: true },
      orderBy: { valor: 'asc' },
    });
  }

  /**
   * Lista todas as listas agrupadas por tipo
   */
  async findAll(): Promise<Record<TipoLista, ListaAuxiliar[]>> {
    const listas = await prisma.listaAuxiliar.findMany({
      where: { ativo: true },
      orderBy: [{ tipo: 'asc' }, { valor: 'asc' }],
    });

    const grouped = listas.reduce(
      (acc, lista) => {
        if (!acc[lista.tipo]) {
          acc[lista.tipo] = [];
        }
        acc[lista.tipo].push(lista);
        return acc;
      },
      {} as Record<TipoLista, ListaAuxiliar[]>
    );

    return grouped;
  }

  /**
   * Busca um item específico por ID
   */
  async findById(id: string): Promise<ListaAuxiliar> {
    const lista = await prisma.listaAuxiliar.findUnique({
      where: { id },
    });

    if (!lista) {
      throw new AppError('Item não encontrado', HTTP_STATUS.NOT_FOUND);
    }

    return lista;
  }

  /**
   * Cria um novo item
   */
  async create(data: {
    tipo: TipoLista;
    valor: string;
    ativo?: boolean;
  }): Promise<ListaAuxiliar> {
    // Verifica se já existe
    const existing = await prisma.listaAuxiliar.findUnique({
      where: {
        tipo_valor: {
          tipo: data.tipo,
          valor: data.valor,
        },
      },
    });

    if (existing) {
      throw new AppError(
        'Já existe um item com este valor para este tipo',
        HTTP_STATUS.CONFLICT
      );
    }

    return await prisma.listaAuxiliar.create({
      data,
    });
  }

  /**
   * Atualiza um item existente
   */
  async update(
    id: string,
    data: {
      valor?: string;
      ativo?: boolean;
    }
  ): Promise<ListaAuxiliar> {
    const existing = await this.findById(id);

    // Se está alterando o valor, verifica duplicação
    if (data.valor && data.valor !== existing.valor) {
      const duplicate = await prisma.listaAuxiliar.findUnique({
        where: {
          tipo_valor: {
            tipo: existing.tipo,
            valor: data.valor,
          },
        },
      });

      if (duplicate) {
        throw new AppError(
          'Já existe um item com este valor para este tipo',
          HTTP_STATUS.CONFLICT
        );
      }
    }

    return await prisma.listaAuxiliar.update({
      where: { id },
      data,
    });
  }

  /**
   * Desativa um item (soft delete)
   */
  async delete(id: string): Promise<void> {
    await this.findById(id);

    // TODO: Verificar se o item está em uso antes de desativar
    // Por exemplo, verificar se há usuários, pagamentos ou despesas usando este item

    await prisma.listaAuxiliar.update({
      where: { id },
      data: { ativo: false },
    });
  }
}

export default new ListaService();
