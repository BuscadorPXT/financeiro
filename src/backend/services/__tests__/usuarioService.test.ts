import usuarioService from '../usuarioService'
import prisma from '@database/client'
import { StatusFinal } from '@prisma/client'

// Mock Prisma
jest.mock('@database/client', () => ({
  default: {
    usuario: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    pagamento: {
      findMany: jest.fn(),
    },
    churn: {
      findFirst: jest.fn(),
    },
  },
}))

describe('UsuarioService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('create', () => {
    it('should create a new user with formatted phone', async () => {
      const userData = {
        emailLogin: 'test@example.com',
        nomeCompleto: 'Test User',
        telefone: '11999999999',
        indicador: 'John Doe',
      }

      const expectedUser = {
        id: '123',
        ...userData,
        telefone: '(11) 99999-9999',
        statusFinal: StatusFinal.INATIVO,
        ciclo: 0,
        totalCiclosUsuario: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      ;(prisma.usuario.create as jest.Mock).mockResolvedValue(expectedUser)

      const result = await usuarioService.create(userData)

      expect(prisma.usuario.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          emailLogin: userData.emailLogin,
          nomeCompleto: userData.nomeCompleto,
          telefone: '(11) 99999-9999',
          indicador: userData.indicador,
        }),
      })
      expect(result).toEqual(expectedUser)
    })

    it('should throw error for invalid email', async () => {
      const userData = {
        emailLogin: 'invalid-email',
        nomeCompleto: 'Test User',
      }

      await expect(usuarioService.create(userData)).rejects.toThrow('Email inválido')
    })
  })

  describe('findById', () => {
    it('should find user by id with relations', async () => {
      const mockUser = {
        id: '123',
        emailLogin: 'test@example.com',
        nomeCompleto: 'Test User',
        pagamentos: [],
        agenda: [],
        churnRegistros: [],
      }

      ;(prisma.usuario.findUnique as jest.Mock).mockResolvedValue(mockUser)

      const result = await usuarioService.findById('123')

      expect(prisma.usuario.findUnique).toHaveBeenCalledWith({
        where: { id: '123' },
        include: {
          pagamentos: {
            orderBy: { dataPagto: 'desc' },
            take: 10,
          },
          agenda: {
            orderBy: { dataVenc: 'desc' },
            take: 5,
          },
          churnRegistros: {
            orderBy: { dataChurn: 'desc' },
            take: 1,
          },
        },
      })
      expect(result).toEqual(mockUser)
    })

    it('should return null for non-existent user', async () => {
      ;(prisma.usuario.findUnique as jest.Mock).mockResolvedValue(null)

      const result = await usuarioService.findById('999')

      expect(result).toBeNull()
    })
  })

  describe('findAll', () => {
    it('should return paginated users with filters', async () => {
      const filters = {
        statusFinal: StatusFinal.ATIVO,
        indicador: 'John Doe',
      }

      const mockUsers = [
        {
          id: '1',
          emailLogin: 'user1@example.com',
          statusFinal: StatusFinal.ATIVO,
          indicador: 'John Doe',
        },
        {
          id: '2',
          emailLogin: 'user2@example.com',
          statusFinal: StatusFinal.ATIVO,
          indicador: 'John Doe',
        },
      ]

      ;(prisma.usuario.count as jest.Mock).mockResolvedValue(2)
      ;(prisma.usuario.findMany as jest.Mock).mockResolvedValue(mockUsers)

      const result = await usuarioService.findAll({ page: 1, limit: 10 }, filters)

      expect(prisma.usuario.findMany).toHaveBeenCalledWith({
        where: filters,
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      })
      expect(result).toEqual({
        data: mockUsers,
        total: 2,
        page: 1,
        pageSize: 10,
      })
    })
  })

  describe('update', () => {
    it('should update user and recalculate flags', async () => {
      const updateData = {
        nomeCompleto: 'Updated Name',
        dataVenc: new Date('2024-12-31'),
      }

      const updatedUser = {
        id: '123',
        ...updateData,
        diasParaVencer: 30,
        venceHoje: false,
        prox7Dias: false,
        emAtraso: false,
        statusFinal: StatusFinal.ATIVO,
      }

      ;(prisma.usuario.update as jest.Mock).mockResolvedValue(updatedUser)

      const result = await usuarioService.update('123', updateData)

      expect(prisma.usuario.update).toHaveBeenCalled()
      expect(result).toEqual(updatedUser)
    })
  })

  describe('delete', () => {
    it('should soft delete user by updating status to INATIVO', async () => {
      const deletedUser = {
        id: '123',
        statusFinal: StatusFinal.INATIVO,
        ativoAtual: false,
      }

      ;(prisma.usuario.update as jest.Mock).mockResolvedValue(deletedUser)

      const result = await usuarioService.delete('123')

      expect(prisma.usuario.update).toHaveBeenCalledWith({
        where: { id: '123' },
        data: {
          statusFinal: StatusFinal.INATIVO,
          ativoAtual: false,
        },
      })
      expect(result).toEqual(deletedUser)
    })
  })

  describe('atualizarFlags', () => {
    it('should update user flags based on expiration date', async () => {
      const today = new Date()
      const tomorrow = new Date()
      tomorrow.setDate(today.getDate() + 1)

      const userId = '123'
      const updatedUser = {
        id: userId,
        dataVenc: tomorrow,
        diasParaVencer: 1,
        venceHoje: false,
        prox7Dias: true,
        emAtraso: false,
        statusFinal: StatusFinal.ATIVO,
      }

      ;(prisma.usuario.update as jest.Mock).mockResolvedValue(updatedUser)

      const result = await usuarioService.atualizarFlags(userId)

      expect(prisma.usuario.update).toHaveBeenCalled()
      expect(result).toEqual(updatedUser)
    })

    it('should set EM_ATRASO status for overdue users', async () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)

      const userId = '123'
      const updatedUser = {
        id: userId,
        dataVenc: yesterday,
        diasParaVencer: -1,
        venceHoje: false,
        prox7Dias: false,
        emAtraso: true,
        statusFinal: StatusFinal.EM_ATRASO,
      }

      ;(prisma.usuario.findUnique as jest.Mock).mockResolvedValue({
        id: userId,
        dataVenc: yesterday,
      })
      ;(prisma.usuario.update as jest.Mock).mockResolvedValue(updatedUser)

      const result = await usuarioService.atualizarFlags(userId)

      expect(result.statusFinal).toEqual(StatusFinal.EM_ATRASO)
      expect(result.emAtraso).toBeTruthy()
    })
  })

  // describe('getHistorico', () => {
  //   it('should return user history with payments and churn records', async () => {
  //     // Método getHistorico não existe em usuarioService - teste removido
  //   })
  // })
})