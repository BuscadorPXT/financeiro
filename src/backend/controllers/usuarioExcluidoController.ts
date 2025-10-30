import { Request, Response } from 'express';
import usuarioExcluidoService from '../services/usuarioExcluidoService';
import { catchAsync } from '../middleware/errorHandler';
import { HTTP_STATUS } from '../../shared/constants';

class UsuarioExcluidoController {
  /**
   * GET /api/usuarios-excluidos
   * Lista histórico de usuários excluídos com paginação
   */
  getAll = catchAsync(async (req: Request, res: Response) => {
    const { page, limit } = req.query;

    const result = await usuarioExcluidoService.findAll({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: result.data,
      pagination: result.pagination,
    });
  });

  /**
   * GET /api/usuarios-excluidos/:id
   * Busca um usuário excluído por ID
   */
  getById = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const usuario = await usuarioExcluidoService.findById(id);

    if (!usuario) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        status: 'error',
        message: 'Registro não encontrado',
      });
    }

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: usuario,
    });
  });

  /**
   * GET /api/usuarios-excluidos/buscar/:email
   * Busca usuários excluídos por email
   */
  findByEmail = catchAsync(async (req: Request, res: Response) => {
    const { email } = req.params;

    const usuarios = await usuarioExcluidoService.findByEmail(email);

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: usuarios,
    });
  });

  /**
   * GET /api/usuarios-excluidos/stats
   * Obtém estatísticas de exclusões
   */
  getStats = catchAsync(async (_req: Request, res: Response) => {
    const stats = await usuarioExcluidoService.getStats();

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: stats,
    });
  });
}

export default new UsuarioExcluidoController();
