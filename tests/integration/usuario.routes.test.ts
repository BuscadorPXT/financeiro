import request from 'supertest'
import app from '@backend/app'
import prisma from '@database/client'
import { StatusFinal } from '../../src/generated/prisma'

// Mock Prisma to avoid real database operations
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
    $disconnect: jest.fn(),
  },
}))

describe('Usuario Routes', () => {
  afterAll(async () => {
    await prisma.$disconnect()
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/usuarios', () => {
    it('should return list of users', async () => {
      const mockUsers = [
        {
          id: '1',
          emailLogin: 'user1@example.com',
          nomeCompleto: 'User One',
          statusFinal: StatusFinal.ATIVO,
        },
        {
          id: '2',
          emailLogin: 'user2@example.com',
          nomeCompleto: 'User Two',
          statusFinal: StatusFinal.INATIVO,
        },
      ]

      ;(prisma.usuario.findMany as jest.Mock).mockResolvedValue(mockUsers)
      ;(prisma.usuario.count as jest.Mock).mockResolvedValue(2)

      const response = await request(app)
        .get('/api/usuarios')
        .expect('Content-Type', /json/)
        .expect(200)

      expect(response.body).toHaveProperty('data')
      expect(response.body.data).toHaveLength(2)
      expect(response.body).toHaveProperty('total', 2)
    })

    it('should filter users by status', async () => {
      const activeUsers = [
        {
          id: '1',
          emailLogin: 'active@example.com',
          nomeCompleto: 'Active User',
          statusFinal: StatusFinal.ATIVO,
        },
      ]

      ;(prisma.usuario.findMany as jest.Mock).mockResolvedValue(activeUsers)
      ;(prisma.usuario.count as jest.Mock).mockResolvedValue(1)

      const response = await request(app)
        .get('/api/usuarios?statusFinal=ATIVO')
        .expect(200)

      expect(prisma.usuario.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            statusFinal: StatusFinal.ATIVO,
          }),
        })
      )
      expect(response.body.data).toHaveLength(1)
    })

    it('should support pagination', async () => {
      ;(prisma.usuario.findMany as jest.Mock).mockResolvedValue([])
      ;(prisma.usuario.count as jest.Mock).mockResolvedValue(100)

      const response = await request(app)
        .get('/api/usuarios?page=2&pageSize=20')
        .expect(200)

      expect(prisma.usuario.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 20,
          take: 20,
        })
      )
      expect(response.body.page).toBe(2)
      expect(response.body.pageSize).toBe(20)
    })
  })

  describe('GET /api/usuarios/:id', () => {
    it('should return user by id', async () => {
      const mockUser = {
        id: '123',
        emailLogin: 'test@example.com',
        nomeCompleto: 'Test User',
        statusFinal: StatusFinal.ATIVO,
        pagamentos: [],
        agenda: [],
        churnRegistros: [],
      }

      ;(prisma.usuario.findUnique as jest.Mock).mockResolvedValue(mockUser)

      const response = await request(app)
        .get('/api/usuarios/123')
        .expect(200)

      expect(response.body).toEqual(mockUser)
      expect(prisma.usuario.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: '123' },
        })
      )
    })

    it('should return 404 for non-existent user', async () => {
      ;(prisma.usuario.findUnique as jest.Mock).mockResolvedValue(null)

      const response = await request(app)
        .get('/api/usuarios/999')
        .expect(404)

      expect(response.body).toHaveProperty('error', 'Usuário não encontrado')
    })
  })

  describe('POST /api/usuarios', () => {
    it('should create a new user', async () => {
      const newUser = {
        emailLogin: 'new@example.com',
        nomeCompleto: 'New User',
        telefone: '11999999999',
        indicador: 'John Doe',
      }

      const createdUser = {
        id: '123',
        ...newUser,
        telefone: '(11) 99999-9999',
        statusFinal: StatusFinal.INATIVO,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      ;(prisma.usuario.create as jest.Mock).mockResolvedValue(createdUser)

      const response = await request(app)
        .post('/api/usuarios')
        .send(newUser)
        .expect(201)

      expect(response.body).toHaveProperty('id')
      expect(response.body.emailLogin).toBe(newUser.emailLogin)
      expect(response.body.telefone).toBe('(11) 99999-9999')
    })

    it('should return 400 for invalid email', async () => {
      const invalidUser = {
        emailLogin: 'invalid-email',
        nomeCompleto: 'Invalid User',
      }

      const response = await request(app)
        .post('/api/usuarios')
        .send(invalidUser)
        .expect(400)

      expect(response.body).toHaveProperty('error')
    })

    it('should return 400 for duplicate email', async () => {
      const duplicateUser = {
        emailLogin: 'duplicate@example.com',
        nomeCompleto: 'Duplicate User',
      }

      ;(prisma.usuario.create as jest.Mock).mockRejectedValue(
        new Error('Unique constraint failed on the fields: (`email_login`)')
      )

      const response = await request(app)
        .post('/api/usuarios')
        .send(duplicateUser)
        .expect(400)

      expect(response.body).toHaveProperty('error')
    })
  })

  describe('PUT /api/usuarios/:id', () => {
    it('should update user', async () => {
      const updateData = {
        nomeCompleto: 'Updated Name',
        telefone: '11888888888',
      }

      const updatedUser = {
        id: '123',
        emailLogin: 'test@example.com',
        ...updateData,
        telefone: '(11) 88888-8888',
        updatedAt: new Date(),
      }

      ;(prisma.usuario.update as jest.Mock).mockResolvedValue(updatedUser)

      const response = await request(app)
        .put('/api/usuarios/123')
        .send(updateData)
        .expect(200)

      expect(response.body.nomeCompleto).toBe(updateData.nomeCompleto)
      expect(response.body.telefone).toBe('(11) 88888-8888')
    })

    it('should return 404 for non-existent user', async () => {
      ;(prisma.usuario.update as jest.Mock).mockRejectedValue(
        new Error('Record not found')
      )

      const response = await request(app)
        .put('/api/usuarios/999')
        .send({ nomeCompleto: 'Test' })
        .expect(404)

      expect(response.body).toHaveProperty('error')
    })
  })

  describe('DELETE /api/usuarios/:id', () => {
    it('should soft delete user', async () => {
      const deletedUser = {
        id: '123',
        statusFinal: StatusFinal.INATIVO,
        ativoAtual: false,
      }

      ;(prisma.usuario.update as jest.Mock).mockResolvedValue(deletedUser)

      const response = await request(app)
        .delete('/api/usuarios/123')
        .expect(200)

      expect(response.body).toHaveProperty('message', 'Usuário desativado com sucesso')
      expect(prisma.usuario.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: '123' },
          data: expect.objectContaining({
            statusFinal: StatusFinal.INATIVO,
            ativoAtual: false,
          }),
        })
      )
    })
  })

  describe('POST /api/usuarios/import', () => {
    it('should import users from CSV data', async () => {
      const importData = {
        data: [
          {
            emailLogin: 'import1@example.com',
            nomeCompleto: 'Import User 1',
            telefone: '11999999999',
          },
          {
            emailLogin: 'import2@example.com',
            nomeCompleto: 'Import User 2',
            telefone: '11888888888',
          },
        ],
      }

      ;(prisma.usuario.findUnique as jest.Mock).mockResolvedValue(null)
      ;(prisma.usuario.create as jest.Mock).mockImplementation((data) => ({
        id: Math.random().toString(),
        ...data.data,
        createdAt: new Date(),
        updatedAt: new Date(),
      }))

      const response = await request(app)
        .post('/api/usuarios/import')
        .send(importData)
        .expect(200)

      expect(response.body).toHaveProperty('success', 2)
      expect(response.body).toHaveProperty('errors', 0)
      expect(response.body).toHaveProperty('duplicates', 0)
      expect(prisma.usuario.create).toHaveBeenCalledTimes(2)
    })

    it('should handle duplicate emails during import', async () => {
      const importData = {
        data: [
          {
            emailLogin: 'existing@example.com',
            nomeCompleto: 'Existing User',
          },
        ],
      }

      ;(prisma.usuario.findUnique as jest.Mock).mockResolvedValue({
        id: '123',
        emailLogin: 'existing@example.com',
      })

      const response = await request(app)
        .post('/api/usuarios/import')
        .send(importData)
        .expect(200)

      expect(response.body).toHaveProperty('success', 0)
      expect(response.body).toHaveProperty('duplicates', 1)
      expect(prisma.usuario.create).not.toHaveBeenCalled()
    })
  })
})