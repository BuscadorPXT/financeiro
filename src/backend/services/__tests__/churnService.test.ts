import churnService from '../churnService'
import prisma from '@database/client'
import { StatusFinal } from '@prisma/client'

// Mock dependencies
jest.mock('@database/client')

describe('ChurnService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('reverterChurn', () => {
    const mockChurn = {
      id: 'churn-123',
      usuarioId: 'user-123',
      dataChurn: new Date('2025-01-01'),
      motivo: 'Cliente cancelou',
      revertido: false,
    }

    it('should revert churn WITH valid payment - set user as ATIVO (Bug 1.3)', async () => {
      const dataVencFutura = new Date()
      dataVencFutura.setDate(dataVencFutura.getDate() + 15) // 15 dias no futuro

      const mockUsuarioComPagamento = {
        id: 'user-123',
        emailLogin: 'test@example.com',
        dataVenc: dataVencFutura, // TEM PAGAMENTO VÁLIDO
        statusFinal: StatusFinal.INATIVO,
        churn: true,
      }

      ;(prisma.churn.findUnique as jest.Mock).mockResolvedValue(mockChurn)
      ;(prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
        return callback(prisma)
      })
      ;(prisma.usuario.findUnique as jest.Mock).mockResolvedValue(mockUsuarioComPagamento)
      ;(prisma.churn.update as jest.Mock).mockResolvedValue({
        ...mockChurn,
        revertido: true,
      })

      const result = await churnService.reverterChurn('churn-123')

      // Verifica que churn foi marcado como revertido
      expect(prisma.churn.update).toHaveBeenCalledWith({
        where: { id: 'churn-123' },
        data: { revertido: true },
      })

      // Verifica que usuário foi reativado como ATIVO (tem pagamento válido)
      expect(prisma.usuario.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: {
          churn: false,
          statusFinal: StatusFinal.ATIVO, // ATIVO pois tem dataVenc futura
        },
      })

      expect(result.revertido).toBe(true)
    })

    it('should revert churn WITHOUT valid payment - set user as INATIVO (Bug 1.3)', async () => {
      const dataVencPassada = new Date()
      dataVencPassada.setDate(dataVencPassada.getDate() - 10) // 10 dias atrás

      const mockUsuarioSemPagamento = {
        id: 'user-123',
        emailLogin: 'test@example.com',
        dataVenc: dataVencPassada, // SEM PAGAMENTO VÁLIDO (vencido)
        statusFinal: StatusFinal.INATIVO,
        churn: true,
      }

      ;(prisma.churn.findUnique as jest.Mock).mockResolvedValue(mockChurn)
      ;(prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
        return callback(prisma)
      })
      ;(prisma.usuario.findUnique as jest.Mock).mockResolvedValue(mockUsuarioSemPagamento)
      ;(prisma.churn.update as jest.Mock).mockResolvedValue({
        ...mockChurn,
        revertido: true,
      })

      // Mock console.warn para verificar log
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()

      const result = await churnService.reverterChurn('churn-123')

      // Verifica que churn foi marcado como revertido
      expect(prisma.churn.update).toHaveBeenCalledWith({
        where: { id: 'churn-123' },
        data: { revertido: true },
      })

      // Verifica que usuário foi reativado como INATIVO (sem pagamento válido)
      expect(prisma.usuario.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: {
          churn: false,
          statusFinal: StatusFinal.INATIVO, // INATIVO pois sem pagamento válido
        },
      })

      // Verifica log de aviso
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('reativado mas sem pagamento válido')
      )

      consoleSpy.mockRestore()
      expect(result.revertido).toBe(true)
    })

    it('should revert churn with NULL dataVenc - set user as INATIVO', async () => {
      const mockUsuarioSemDataVenc = {
        id: 'user-123',
        emailLogin: 'test@example.com',
        dataVenc: null, // SEM DATA DE VENCIMENTO
        statusFinal: StatusFinal.INATIVO,
        churn: true,
      }

      ;(prisma.churn.findUnique as jest.Mock).mockResolvedValue(mockChurn)
      ;(prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
        return callback(prisma)
      })
      ;(prisma.usuario.findUnique as jest.Mock).mockResolvedValue(mockUsuarioSemDataVenc)
      ;(prisma.churn.update as jest.Mock).mockResolvedValue({
        ...mockChurn,
        revertido: true,
      })

      await churnService.reverterChurn('churn-123')

      // Verifica que usuário foi reativado como INATIVO (sem dataVenc)
      expect(prisma.usuario.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: {
          churn: false,
          statusFinal: StatusFinal.INATIVO,
        },
      })
    })

    it('should throw error if churn not found', async () => {
      ;(prisma.churn.findUnique as jest.Mock).mockResolvedValue(null)

      await expect(churnService.reverterChurn('invalid-id')).rejects.toThrow(
        'Registro de churn não encontrado'
      )
    })

    it('should throw error if churn already reverted', async () => {
      const mockChurnRevertido = {
        ...mockChurn,
        revertido: true, // JÁ REVERTIDO
      }

      ;(prisma.churn.findUnique as jest.Mock).mockResolvedValue(mockChurnRevertido)

      await expect(churnService.reverterChurn('churn-123')).rejects.toThrow(
        'Este churn já foi revertido'
      )
    })

    it('should throw error if user not found', async () => {
      ;(prisma.churn.findUnique as jest.Mock).mockResolvedValue(mockChurn)
      ;(prisma.usuario.findUnique as jest.Mock).mockResolvedValue(null)

      await expect(churnService.reverterChurn('churn-123')).rejects.toThrow(
        'Usuário não encontrado'
      )
    })
  })
})
