import { Request, Response } from 'express';
import authService from '../services/authService';
import { catchAsync } from '../middleware/errorHandler';
import { HTTP_STATUS } from '../../shared/constants';

class AdminController {
  /**
   * GET /api/admin/usuarios
   * Lista todos os usuários (apenas admin)
   */
  listUsuarios = catchAsync(async (req: Request, res: Response) => {
    const { aprovado, ativo } = req.query;

    const filtro: any = {};
    if (aprovado !== undefined) {
      filtro.aprovado = aprovado === 'true';
    }
    if (ativo !== undefined) {
      filtro.ativo = ativo === 'true';
    }

    const usuarios = await authService.listUsuarios(filtro);

    return res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: usuarios,
    });
  });

  /**
   * POST /api/admin/usuarios/:id/aprovar
   * Aprova um usuário pendente (apenas admin)
   */
  aprovarUsuario = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const usuario = await authService.aprovarUsuario(id);

    return res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: usuario,
      message: 'Usuário aprovado com sucesso',
    });
  });

  /**
   * DELETE /api/admin/usuarios/:id/rejeitar
   * Rejeita/remove um usuário pendente (apenas admin)
   */
  rejeitarUsuario = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    await authService.rejeitarUsuario(id);

    return res.status(HTTP_STATUS.OK).json({
      status: 'success',
      message: 'Usuário rejeitado com sucesso',
    });
  });

  /**
   * PUT /api/admin/usuarios/:id/role
   * Altera role do usuário (apenas admin)
   */
  alterarRole = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || !['ADMIN', 'USER'].includes(role)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        status: 'error',
        message: 'Role inválida. Use ADMIN ou USER',
      });
    }

    const usuario = await authService.alterarRole(id, role);

    return res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: usuario,
      message: 'Role alterada com sucesso',
    });
  });

  /**
   * PUT /api/admin/usuarios/:id/toggle-ativo
   * Ativa/desativa usuário (apenas admin)
   */
  toggleAtivo = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const usuario = await authService.toggleAtivo(id);

    return res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: usuario,
      message: `Usuário ${usuario.ativo ? 'ativado' : 'desativado'} com sucesso`,
    });
  });
}

export default new AdminController();
