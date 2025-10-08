import { Request, Response, NextFunction } from 'express';
import auditoriaService from '../services/auditoriaService';
import { AcaoAuditoria } from '../../generated/prisma';

/**
 * Middleware para registrar ações de auditoria
 *
 * Uso:
 * import { audit } from '../middleware/auditMiddleware';
 * router.post('/', audit('usuarios', 'CREATE'), usuarioController.create);
 * router.put('/:id', audit('usuarios', 'UPDATE'), usuarioController.update);
 * router.delete('/:id', audit('usuarios', 'DELETE'), usuarioController.delete);
 */

export interface AuditOptions {
  tabela: string;
  acao: AcaoAuditoria;
  getRegistroId?: (req: Request) => string;
  getDadosAntes?: (req: Request, res: Response) => any;
  getDadosDepois?: (req: Request, res: Response) => any;
  getUsuario?: (req: Request) => string | undefined;
}

/**
 * Cria um middleware de auditoria
 */
export function audit(
  tabela: string,
  acao: AcaoAuditoria,
  options?: Partial<AuditOptions>
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Guarda a função original res.json
    const originalJson = res.json.bind(res);

    // Sobrescreve res.json para interceptar a resposta
    res.json = function (body: any): Response {
      // Só registra se a resposta foi bem-sucedida
      if (res.statusCode >= 200 && res.statusCode < 300) {
        // Executa auditoria de forma assíncrona (não bloqueia a resposta)
        setImmediate(async () => {
          try {
            // Obtém o ID do registro
            let registroId: string | undefined;
            if (options?.getRegistroId) {
              registroId = options.getRegistroId(req);
            } else if (req.params.id) {
              registroId = req.params.id;
            } else if (body?.data?.id) {
              registroId = body.data.id;
            }

            // Se não conseguir obter ID, não registra
            if (!registroId) {
              return;
            }

            // Obtém dados antes (se disponível)
            let dadosAntes: any = null;
            if (options?.getDadosAntes) {
              dadosAntes = options.getDadosAntes(req, res);
            }

            // Obtém dados depois
            let dadosDepois: any = null;
            if (options?.getDadosDepois) {
              dadosDepois = options.getDadosDepois(req, res);
            } else if (body?.data) {
              dadosDepois = body.data;
            }

            // Obtém usuário (quando houver auth implementado)
            let usuario: string | undefined;
            if (options?.getUsuario) {
              usuario = options.getUsuario(req);
            }
            // Placeholder para quando implementar auth:
            // usuario = (req as any).user?.email || (req as any).user?.id;

            // Registra a auditoria
            await auditoriaService.log({
              tabela,
              registroId,
              acao,
              usuario,
              dadosAntes,
              dadosDepois,
            });
          } catch (error) {
            // Log de erro mas não afeta a resposta ao cliente
            console.error('Erro ao registrar auditoria:', error);
          }
        });
      }

      // Retorna a resposta original
      return originalJson(body);
    };

    next();
  };
}

/**
 * Middleware simplificado para diferentes ações
 */
export const auditCreate = (tabela: string, options?: Partial<AuditOptions>) =>
  audit(tabela, AcaoAuditoria.CREATE, options);

export const auditUpdate = (tabela: string, options?: Partial<AuditOptions>) =>
  audit(tabela, AcaoAuditoria.UPDATE, options);

export const auditDelete = (tabela: string, options?: Partial<AuditOptions>) =>
  audit(tabela, AcaoAuditoria.DELETE, options);

export const auditImport = (tabela: string, options?: Partial<AuditOptions>) =>
  audit(tabela, AcaoAuditoria.IMPORT, options);
