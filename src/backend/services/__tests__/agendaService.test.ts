import agendaService from '../agendaService'
import prisma from '@database/client'
import pagamentoService from '../pagamentoService'
import { StatusAgenda, StatusFinal, RegraTipo } from '@prisma/client'

// Mock dependencies
jest.mock('@database/client')

jest.mock('../pagamentoService')

describe('AgendaService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('create', () => {
    const mockUsuario = {
      id: 'user-123',
      emailLogin: 'test@example.com',
      nomeCompleto: 'Test User',
      dataVenc: new Date('2025-01-15'),
    }

    const agendaData = {
      usuarioId: 'user-123',
      dataVenc: new Date('2025-01-15'),
      diasParaVencer: 10,
      ciclo: 1,
      status: StatusAgenda.ATIVO,
    }

    it('should create agenda item successfully', async () => {
      ;(prisma.usuario.findUnique as jest.Mock).mockResolvedValue(mockUsuario)
      ;(prisma.agenda.findFirst as jest.Mock).mockResolvedValue(null) // Sem duplicata
      ;(prisma.agenda.create as jest.Mock).mockResolvedValue({
        id: 'agenda-123',
        ...agendaData,
      })

      const result = await agendaService.create(agendaData)

      // Service calculates diasParaVencer automatically and uses connect syntax
      expect(prisma.agenda.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          ciclo: agendaData.ciclo,
          dataVenc: agendaData.dataVenc,
          status: agendaData.status,
        }),
      })
      expect(result).toBeDefined()
      expect(result.id).toBe('agenda-123')
    })

    it('should throw error if duplicate ATIVO item exists (Bug 3.1)', async () => {
      const itemExistente = {
        id: 'agenda-existing',
        usuarioId: 'user-123',
        status: StatusAgenda.ATIVO,
        renovou: false,
        cancelou: false,
      }

      ;(prisma.usuario.findUnique as jest.Mock).mockResolvedValue(mockUsuario)
      ;(prisma.agenda.findFirst as jest.Mock).mockResolvedValue(itemExistente)

      await expect(agendaService.create(agendaData)).rejects.toThrow(
        'Já existe um item ATIVO não processado na agenda para este usuário'
      )

      // Não deve ter tentado criar
      expect(prisma.agenda.create).not.toHaveBeenCalled()
    })

    it('should throw error if user not found', async () => {
      ;(prisma.usuario.findUnique as jest.Mock).mockResolvedValue(null)

      await expect(agendaService.create(agendaData)).rejects.toThrow(
        'Usuário não encontrado'
      )
    })
  })

  describe('marcarCancelou', () => {
    const mockAgenda = {
      id: 'agenda-123',
      usuarioId: 'user-123',
      dataVenc: new Date('2025-01-15'),
      renovou: false,
      cancelou: false,
    }

    it('should cancel agenda without reverting payment (not renewed)', async () => {
      ;(prisma.agenda.findUnique as jest.Mock).mockResolvedValue(mockAgenda)
      ;(prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
        return callback(prisma)
      })
      ;(prisma.pagamento.findFirst as jest.Mock).mockResolvedValue(null) // Sem pagamento RECORRENTE

      const result = await agendaService.marcarCancelou('agenda-123', 'Cliente cancelou')

      // Verifica churn criado
      expect(prisma.churn.create).toHaveBeenCalledWith({
        data: {
          usuarioId: 'user-123',
          dataChurn: expect.any(Date),
          motivo: 'Cliente cancelou',
        },
      })

      // Verifica usuário marcado como INATIVO
      expect(prisma.usuario.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: {
          churn: true,
          statusFinal: StatusFinal.INATIVO,
        },
      })

      // Verifica agenda marcada como cancelada
      expect(prisma.agenda.update).toHaveBeenCalledWith({
        where: { id: 'agenda-123' },
        data: {
          cancelou: true,
          renovou: false,
          status: expect.any(String), // Service also sets status
        },
      })

      expect(result.pagamentoRevertido).toBeUndefined()
    })

    it('should cancel agenda and revert payment if already renewed (Bug 1.2)', async () => {
      const mockAgendaRenovada = {
        ...mockAgenda,
        renovou: true, // JÁ RENOVADA
      }

      const mockPagamentoRecorrente = {
        id: 'payment-recorrente',
        usuarioId: 'user-123',
        regraTipo: RegraTipo.RECORRENTE,
        dataPagto: new Date('2025-01-10'),
      }

      ;(prisma.agenda.findUnique as jest.Mock).mockResolvedValue(mockAgendaRenovada)
      ;(prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
        return callback(prisma)
      })
      ;(prisma.pagamento.findFirst as jest.Mock).mockResolvedValue(mockPagamentoRecorrente)
      ;(pagamentoService.delete as jest.Mock).mockResolvedValue(undefined)

      const result = await agendaService.marcarCancelou('agenda-123', 'Cliente cancelou')

      // Verifica que pagamento RECORRENTE foi deletado
      expect(pagamentoService.delete).toHaveBeenCalledWith('payment-recorrente')

      // Verifica flag pagamentoRevertido
      expect(result.pagamentoRevertido).toBe(true)

      // Verifica churn e usuário atualizados
      expect(prisma.churn.create).toHaveBeenCalled()
      expect(prisma.usuario.update).toHaveBeenCalled()
    })

    it('should throw error if agenda not found', async () => {
      ;(prisma.agenda.findUnique as jest.Mock).mockResolvedValue(null)

      await expect(agendaService.marcarCancelou('invalid-id')).rejects.toThrow(
        'Item da agenda não encontrado'
      )
    })

    it('should throw error if already cancelled', async () => {
      const mockAgendaCancelada = {
        ...mockAgenda,
        cancelou: true,
      }

      ;(prisma.agenda.findUnique as jest.Mock).mockResolvedValue(mockAgendaCancelada)

      await expect(agendaService.marcarCancelou('agenda-123')).rejects.toThrow(
        'Este item já foi marcado como cancelado'
      )
    })
  })
})
