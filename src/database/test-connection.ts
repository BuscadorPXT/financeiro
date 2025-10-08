import prisma from './client';

async function testConnection() {
  try {
    // Test connection with a simple query
    await prisma.$connect();
    console.log('✅ Database connection successful!');

    // Optional: test a simple query
    const count = await prisma.usuario.count();
    console.log(`📊 Current user count: ${count}`);

    await prisma.$disconnect();
    console.log('✅ Database disconnected successfully!');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

testConnection();
