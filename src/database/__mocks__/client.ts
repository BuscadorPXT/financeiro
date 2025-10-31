// Mock Prisma Client for testing
const mockPrisma: any = {
  usuario: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  pagamento: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    groupBy: jest.fn(),
  },
  agenda: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  churn: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  comissao: {
    create: jest.fn(),
    findMany: jest.fn(),
    groupBy: jest.fn(),
  },
  prospeccao: {
    create: jest.fn(),
    findMany: jest.fn(),
  },
  despesa: {
    create: jest.fn(),
    findMany: jest.fn(),
  },
}

// Add $transaction after the object is created to avoid circular reference issue
mockPrisma.$transaction = jest.fn((callback: any) => callback(mockPrisma))
mockPrisma.$disconnect = jest.fn()

export default mockPrisma
