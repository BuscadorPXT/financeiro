import { Request, Response } from 'express';
import usuarioService from '../services/usuarioService';
import { catchAsync } from '../middleware/errorHandler';
import { HTTP_STATUS } from '../../shared/constants';

class UsuarioController {
  /**
   * GET /api/usuarios
   * Lista todos os usuários com paginação e filtros
   */
  getAll = catchAsync(async (req: Request, res: Response) => {
    const { page, limit, sortBy, sortOrder, ...filters } = req.query;

    const result = await usuarioService.findAll(
      {
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc',
      },
      filters
    );

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: result.data,
      pagination: result.pagination,
    });
  });

  /**
   * GET /api/usuarios/:id
   * Busca um usuário por ID
   */
  getById = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const usuario = await usuarioService.findById(id);

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: usuario,
    });
  });

  /**
   * GET /api/usuarios/stats
   * Obtém estatísticas de usuários
   */
  getStats = catchAsync(async (_req: Request, res: Response) => {
    const stats = await usuarioService.getStats();

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: stats,
    });
  });

  /**
   * POST /api/usuarios
   * Cria um novo usuário
   */
  create = catchAsync(async (req: Request, res: Response) => {
    const { emailLogin, nomeCompleto, telefone, indicador, obs } = req.body;

    if (!emailLogin || !nomeCompleto) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        status: 'error',
        message: 'Email e nome completo são obrigatórios',
      });
    }

    const usuario = await usuarioService.create({
      emailLogin,
      nomeCompleto,
      telefone,
      indicador,
      obs,
    });

    return res.status(HTTP_STATUS.CREATED).json({
      status: 'success',
      data: usuario,
      message: 'Usuário criado com sucesso',
    });
  });

  /**
   * PUT /api/usuarios/:id
   * Atualiza um usuário
   *
   * NOTA: statusFinal não pode ser atualizado manualmente pois é calculado automaticamente.
   * Use PUT /api/usuarios/:id/atualizar-flags para recalcular o status baseado nas regras.
   */
  update = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { nomeCompleto, telefone, indicador, obs } = req.body;

    const usuario = await usuarioService.update(id, {
      nomeCompleto,
      telefone,
      indicador,
      obs,
    });

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: usuario,
      message: 'Usuário atualizado com sucesso',
    });
  });

  /**
   * PUT /api/usuarios/:id/atualizar-flags
   * Atualiza flags de vencimento e status automaticamente
   *
   * Este é o ÚNICO endpoint que atualiza o statusFinal.
   * O status é calculado baseado nas regras:
   * - emAtraso (dataVenc passada) → EM_ATRASO
   * - diasParaVencer >= 1 → ATIVO
   * - Sem dataVenc → mantém status atual
   */
  atualizarFlags = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const usuario = await usuarioService.atualizarFlags(id);

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: usuario,
      message: 'Flags atualizadas com sucesso',
    });
  });

  /**
   * DELETE /api/usuarios/:id
   * Deleta um usuário permanentemente do banco de dados
   * ATENÇÃO: Remove também todos os dados relacionados (pagamentos, agenda, churn)
   * Antes de excluir, salva no histórico de exclusões
   */
  delete = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { motivo } = req.body;
    const excluidoPor = req.user?.id; // ID do admin que está excluindo

    await usuarioService.delete(id, motivo, excluidoPor);

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      message: 'Usuário excluído com sucesso e registrado no histórico',
    });
  });

  /**
   * POST /api/usuarios/import
   * Importa usuários em lote a partir de CSV/XLSX
   */
  importBulk = catchAsync(async (req: Request, res: Response) => {
    const usuarios = req.body.usuarios;

    if (!Array.isArray(usuarios) || usuarios.length === 0) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        status: 'error',
        message: 'Nenhum usuário fornecido para importação',
      });
    }

    const result = await usuarioService.importBulk(usuarios);

    return res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: result,
      message: `Importação concluída: ${result.success} sucesso, ${result.skipped} ignorados, ${result.errors} erros`,
    });
  });
}

export default new UsuarioController();
