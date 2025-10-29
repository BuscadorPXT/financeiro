import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../../database/client';
import { AppError } from '../middleware/errorHandler';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

class AuthService {
  /**
   * Autentica usuário e retorna token
   */
  async login(login: string, senha: string) {
    // Buscar admin
    const admin = await prisma.admin.findUnique({
      where: { login },
    });

    if (!admin) {
      throw new AppError('Login ou senha inválidos', 401);
    }

    if (!admin.ativo) {
      throw new AppError('Usuário desativado', 401);
    }

    // Verificar senha
    const senhaValida = await bcrypt.compare(senha, admin.senha);

    if (!senhaValida) {
      throw new AppError('Login ou senha inválidos', 401);
    }

    // Gerar token JWT
    const token = jwt.sign(
      {
        id: admin.id,
        login: admin.login,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN } as any
    );

    return {
      token,
      user: {
        id: admin.id,
        login: admin.login,
        nome: admin.nome,
      },
    };
  }

  /**
   * Retorna dados do usuário autenticado
   */
  async getMe(userId: string) {
    const admin = await prisma.admin.findUnique({
      where: { id: userId },
      select: {
        id: true,
        login: true,
        nome: true,
        ativo: true,
        createdAt: true,
      },
    });

    if (!admin) {
      throw new AppError('Usuário não encontrado', 404);
    }

    return admin;
  }

  /**
   * Altera senha do usuário
   */
  async changePassword(userId: string, senhaAtual: string, senhaNova: string) {
    const admin = await prisma.admin.findUnique({
      where: { id: userId },
    });

    if (!admin) {
      throw new AppError('Usuário não encontrado', 404);
    }

    // Verificar senha atual
    const senhaValida = await bcrypt.compare(senhaAtual, admin.senha);

    if (!senhaValida) {
      throw new AppError('Senha atual incorreta', 401);
    }

    // Hash da nova senha (8 rounds para melhor performance)
    const senhaHash = await bcrypt.hash(senhaNova, 8);

    // Atualizar senha
    await prisma.admin.update({
      where: { id: userId },
      data: { senha: senhaHash },
    });

    return true;
  }

  /**
   * Cria primeiro admin (seed)
   */
  async createAdmin(login: string, senha: string, nome: string) {
    // Hash da senha (8 rounds para melhor performance)
    const senhaHash = await bcrypt.hash(senha, 8);

    const admin = await prisma.admin.create({
      data: {
        login,
        senha: senhaHash,
        nome,
      },
    });

    return {
      id: admin.id,
      login: admin.login,
      nome: admin.nome,
    };
  }
}

export default new AuthService();
