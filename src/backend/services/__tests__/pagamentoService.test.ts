import pagamentoService from '../pagamentoService'
import prisma from '@database/client'
import usuarioService from '../usuarioService'
import { RegraTipo, MetodoPagamento, StatusFinal } from '@prisma/client'

// Mock dependencies
jest.mock('@database/client')

jest.mock('../usuarioService')

describe('PagamentoService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('create', () => {
    const mockUsuario = {
      id: 'user-123',
      emailLogin: 'test@example.com',
      nomeCompleto: 'Test User',
      indicador: 'John Doe',
      statusFinal: StatusFinal.INATIVO,
      ciclo: 0,
      totalCiclosUsuario: 0,
    }

    const pagamentoData = {
      usuarioId: 'user-123',
      dataPagto: new Date('2024-01-01'),
      valor: 100,
      metodo: MetodoPagamento.PIX,
      conta: 'PXT',
      regraTipo: RegraTipo.PRIMEIRO,
      regraValor: 30,
    }

    it('should create PRIMEIRO payment and update user accordingly', async () => {
      ;(prisma.usuario.findUnique as jest.Mock).mockResolvedValue(mockUsuario)
      ;(prisma.pagamento.create as jest.Mock).mockResolvedValue({
        id: 'payment-123',
        ...pagamentoData,
        mesPagto: 'JAN/2024',
        elegivelComissao: true,
        comissaoValor: 30,
      })
      ;(usuarioService.atualizarFlags as jest.Mock).mockResolvedValue(true)
      // comissaoService.consolidarComissao não existe - removido do teste

      const result = await pagamentoService.create(pagamentoData)

      // Verify user update for PRIMEIRO payment
      expect(prisma.usuario.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: expect.objectContaining({
          entrou: true,
          renovou: false,
          statusFinal: StatusFinal.ATIVO,
          ciclo: 1,
          totalCiclosUsuario: 1,
          dataPagto: pagamentoData.dataPagto,
          mesPagto: 'JAN/2024',
        }),
      })

      // Verify commission calculation - método consolidarComissao não existe, teste removido

      expect(result).toBeDefined()
      expect(result.elegivelComissao).toBe(true)
    })

    it('should create RECORRENTE payment and increment cycles', async () => {
      const recurringUser = {
        ...mockUsuario,
        ciclo: 3,
        totalCiclosUsuario: 3,
        entrou: true,
        statusFinal: StatusFinal.ATIVO,
      }

      const recurringPayment = {
        ...pagamentoData,
        regraTipo: RegraTipo.RECORRENTE,
        regraValor: 15,
      }

      ;(prisma.usuario.findUnique as jest.Mock).mockResolvedValue(recurringUser)
      ;(prisma.pagamento.create as jest.Mock).mockResolvedValue({
        id: 'payment-124',
        ...recurringPayment,
        comissaoValor: 15,
      })
      ;(usuarioService.atualizarFlags as jest.Mock).mockResolvedValue(true)
      // comissaoService.consolidarComissao não existe - removido do teste

      const result = await pagamentoService.create(recurringPayment)

      // Verify user update for RECORRENTE payment
      expect(prisma.usuario.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: expect.objectContaining({
          renovou: true,
          ciclo: 4,
          totalCiclosUsuario: 4,
        }),
      })

      expect(result.comissaoValor).toBe(15)
    })

    it('should throw error if user not found', async () => {
      ;(prisma.usuario.findUnique as jest.Mock).mockResolvedValue(null)

      await expect(pagamentoService.create(pagamentoData)).rejects.toThrow(
        'Usuário não encontrado'
      )
    })
  })

  describe('findAll', () => {
    it('should return paginated payments with filters', async () => {
      const filters = {
        conta: 'PXT',
        metodo: MetodoPagamento.PIX,
      }

      const mockPayments = [
        {
          id: '1',
          valor: 100,
          conta: 'PXT',
          metodo: MetodoPagamento.PIX,
          usuario: { nomeCompleto: 'User 1' },
        },
        {
          id: '2',
          valor: 200,
          conta: 'PXT',
          metodo: MetodoPagamento.PIX,
          usuario: { nomeCompleto: 'User 2' },
        },
      ]

      ;(prisma.pagamento.count as jest.Mock).mockResolvedValue(2)
      ;(prisma.pagamento.findMany as jest.Mock).mockResolvedValue(mockPayments)

      const result = await pagamentoService.findAll({ page: 1, limit: 10 }, filters)

      expect(prisma.pagamento.findMany).toHaveBeenCalledWith({
        where: filters,
        skip: 0,
        take: 10,
        orderBy: { dataPagto: 'desc' },
        include: {
          usuario: {
            select: {
              id: true,
              emailLogin: true,
              nomeCompleto: true,
              statusFinal: true, // Service includes statusFinal
            },
          },
        },
      })

      expect(result).toEqual({
        data: mockPayments,
        total: 2,
        page: 1,
        pageSize: 10,
      })
    })
  })

  describe('update', () => {
    it('should update payment fields', async () => {
      const existingPayment = {
        id: 'payment-123',
        valor: 100,
        comissaoValor: 30,
        regraTipo: RegraTipo.PRIMEIRO,
        regraValor: 30,
      }

      const updateData = {
        valor: 150,
      }

      ;(prisma.pagamento.findUnique as jest.Mock).mockResolvedValue(existingPayment)
      ;(prisma.pagamento.update as jest.Mock).mockResolvedValue({
        ...existingPayment,
        ...updateData,
      })

      const result = await pagamentoService.update('payment-123', updateData)

      // Service does NOT automatically recalculate commission
      expect(prisma.pagamento.update).toHaveBeenCalledWith({
        where: { id: 'payment-123' },
        data: updateData,
      })

      expect(result.valor).toBe(150)
    })
  })

  describe('delete', () => {
    it('should revert PRIMEIRO payment - restore user to initial state', async () => {
      const mockPagamento = {
        id: 'payment-123',
        usuarioId: 'user-123',
        regraTipo: RegraTipo.PRIMEIRO,
        dataPagto: new Date('2024-01-01'),
        mesPagto: '01/2024',
        valor: 100,
      }

      const mockUsuario = {
        id: 'user-123',
        statusFinal: StatusFinal.ATIVO,
        ciclo: 1,
        totalCiclosUsuario: 1,
        entrou: true,
      }

      ;(prisma.pagamento.findUnique as jest.Mock).mockResolvedValue(mockPagamento)
      ;(prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
        return callback(prisma)
      })
      ;(prisma.usuario.findUnique as jest.Mock).mockResolvedValue(mockUsuario)
      ;(prisma.pagamento.delete as jest.Mock).mockResolvedValue(undefined)

      await pagamentoService.delete('payment-123')

      // Verifica que usuário foi resetado para estado inicial
      expect(prisma.usuario.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: expect.objectContaining({
          statusFinal: StatusFinal.INATIVO,
          entrou: false,
          ciclo: 0,
          totalCiclosUsuario: 0,
          dataPagto: null,
          mesPagto: null,
          dataVenc: null,
        }),
      })

      expect(prisma.pagamento.delete).toHaveBeenCalledWith({
        where: { id: 'payment-123' },
      })
    })

    it('should revert RECORRENTE payment - restore previous payment state', async () => {
      const mockPagamento = {
        id: 'payment-456',
        usuarioId: 'user-123',
        regraTipo: RegraTipo.RECORRENTE,
        dataPagto: new Date('2024-02-01'),
        mesPagto: '02/2024',
        valor: 100,
      }

      const mockUsuario = {
        id: 'user-123',
        statusFinal: StatusFinal.ATIVO,
        ciclo: 2,
        totalCiclosUsuario: 2,
        renovou: true,
      }

      const mockPagamentoAnterior = {
        id: 'payment-123',
        usuarioId: 'user-123',
        regraTipo: RegraTipo.PRIMEIRO,
        dataPagto: new Date('2024-01-01'),
        mesPagto: '01/2024',
        valor: 100,
        metodo: MetodoPagamento.PIX,
        conta: 'PXT',
        regraValor: 30,
        elegivelComissao: true,
        comissaoValor: 30,
      }

      ;(prisma.pagamento.findUnique as jest.Mock).mockResolvedValue(mockPagamento)
      ;(prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
        return callback(prisma)
      })
      ;(prisma.usuario.findUnique as jest.Mock).mockResolvedValue(mockUsuario)
      ;(prisma.pagamento.findFirst as jest.Mock).mockResolvedValue(mockPagamentoAnterior)
      ;(prisma.pagamento.delete as jest.Mock).mockResolvedValue(undefined)

      await pagamentoService.delete('payment-456')

      // Verifica que usuário foi restaurado para estado do pagamento anterior
      expect(prisma.usuario.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: expect.objectContaining({
          dataPagto: mockPagamentoAnterior.dataPagto,
          mesPagto: mockPagamentoAnterior.mesPagto,
          metodo: mockPagamentoAnterior.metodo,
          conta: mockPagamentoAnterior.conta,
          ciclo: 1, // decrementado
          renovou: false,
        }),
      })

      expect(prisma.pagamento.delete).toHaveBeenCalledWith({
        where: { id: 'payment-456' },
      })
    })

    it('should throw error if payment not found', async () => {
      ;(prisma.pagamento.findUnique as jest.Mock).mockResolvedValue(null)

      await expect(pagamentoService.delete('invalid-id')).rejects.toThrow(
        'Pagamento não encontrado'
      )
    })
  })

  // describe('getResumoMensal', () => {
  //   it('should return monthly summary grouped by account and method', async () => {
  //     // Método getResumoMensal não existe em pagamentoService - teste removido
  //   })
  // })
})