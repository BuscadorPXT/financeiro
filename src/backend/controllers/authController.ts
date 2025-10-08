import { Request, Response } from 'express';
import authService from '../services/authService';
import { catchAsync } from '../middleware/errorHandler';
import { HTTP_STATUS } from '../../shared/constants';

class AuthController {
  /**
   * POST /api/auth/login
   * Autentica usuário e retorna token JWT
   */
  login = catchAsync(async (req: Request, res: Response) => {
    const { login, senha } = req.body;

    if (!login || !senha) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        status: 'error',
        message: 'Login e senha são obrigatórios',
      });
    }

    const result = await authService.login(login, senha);

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: result,
      message: 'Login realizado com sucesso',
    });
  });

  /**
   * POST /api/auth/logout
   * Invalida o token (opcional - pode ser feito apenas no frontend)
   */
  logout = catchAsync(async (req: Request, res: Response) => {
    // Implementar se necessário blacklist de tokens
    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      message: 'Logout realizado com sucesso',
    });
  });

  /**
   * GET /api/auth/me
   * Retorna dados do usuário autenticado
   */
  me = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id; // Vem do middleware de autenticação

    if (!userId) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        status: 'error',
        message: 'Usuário não autenticado',
      });
    }

    const user = await authService.getMe(userId);

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: user,
    });
  });

  /**
   * POST /api/auth/change-password
   * Altera senha do usuário autenticado
   */
  changePassword = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const { senhaAtual, senhaNova } = req.body;

    if (!userId) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        status: 'error',
        message: 'Usuário não autenticado',
      });
    }

    if (!senhaAtual || !senhaNova) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        status: 'error',
        message: 'Senha atual e nova senha são obrigatórias',
      });
    }

    await authService.changePassword(userId, senhaAtual, senhaNova);

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      message: 'Senha alterada com sucesso',
    });
  });
}

export default new AuthController();
