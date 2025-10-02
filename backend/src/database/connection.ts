import { PrismaClient } from '@prisma/client';

// Singleton Prisma client with optimized configuration
class DatabaseConnection {
  private static instance: PrismaClient;

  public static getInstance(): PrismaClient {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new PrismaClient({
        datasources: {
          db: {
            url: process.env.DATABASE_URL,
          },
        },
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
        errorFormat: 'pretty',
      });

      // Handle graceful shutdown
      process.on('beforeExit', async () => {
        await DatabaseConnection.instance.$disconnect();
      });

      process.on('SIGINT', async () => {
        await DatabaseConnection.instance.$disconnect();
        process.exit(0);
      });

      process.on('SIGTERM', async () => {
        await DatabaseConnection.instance.$disconnect();
        process.exit(0);
      });
    }

    return DatabaseConnection.instance;
  }

  public static async disconnect(): Promise<void> {
    if (DatabaseConnection.instance) {
      await DatabaseConnection.instance.$disconnect();
    }
  }

  public static async healthCheck(): Promise<boolean> {
    try {
      await DatabaseConnection.getInstance().$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  }
}

export default DatabaseConnection;
export const prisma = DatabaseConnection.getInstance();