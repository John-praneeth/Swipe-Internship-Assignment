import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables
dotenv.config();

// Environment validation schema
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(val => parseInt(val, 10)).default('5000'),
  
  // Database
  DATABASE_URL: z.string().url('Invalid database URL'),
  
  // JWT
  JWT_SECRET: z.string().min(32, 'JWT secret must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('24h'),
  
  // File Upload
  MAX_FILE_SIZE: z.string().transform(val => parseInt(val, 10)).default('10485760'), // 10MB
  UPLOAD_PATH: z.string().default('./uploads'),
  
  // CORS
  FRONTEND_URL: z.string().url('Invalid frontend URL').default('http://localhost:3000'),
  
  // Rate Limiting
  RATE_LIMIT_WINDOW: z.string().transform(val => parseInt(val, 10)).default('15'),
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(val => parseInt(val, 10)).default('100'),
});

// Validate environment variables
let env: z.infer<typeof envSchema>;

try {
  env = envSchema.parse(process.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('❌ Environment validation failed:');
    error.errors.forEach(err => {
      console.error(`  - ${err.path.join('.')}: ${err.message}`);
    });
    process.exit(1);
  }
  throw error;
}

// Export validated environment configuration
export const config = {
  // Server
  nodeEnv: env.NODE_ENV,
  port: env.PORT,
  isDevelopment: env.NODE_ENV === 'development',
  isProduction: env.NODE_ENV === 'production',
  isTest: env.NODE_ENV === 'test',
  
  // Database
  databaseUrl: env.DATABASE_URL,
  
  // JWT
  jwt: {
    secret: env.JWT_SECRET,
    expiresIn: env.JWT_EXPIRES_IN,
  },
  
  // File Upload
  upload: {
    maxFileSize: env.MAX_FILE_SIZE,
    uploadPath: env.UPLOAD_PATH,
    allowedTypes: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  },
  
  // CORS
  cors: {
    origin: env.FRONTEND_URL,
    credentials: true,
  },
  
  // Rate Limiting
  rateLimit: {
    windowMs: env.RATE_LIMIT_WINDOW * 60 * 1000, // Convert to milliseconds
    max: env.RATE_LIMIT_MAX_REQUESTS,
  },
};

// Validate critical configurations
export const validateConfig = (): void => {
  const criticalChecks = [
    {
      name: 'JWT Secret Security',
      check: () => config.jwt.secret.length >= 64,
      message: 'JWT secret should be at least 64 characters for production use',
      level: 'warning' as const,
    },
    {
      name: 'Database Connection',
      check: () => config.databaseUrl.startsWith('postgresql://'),
      message: 'Database URL should use PostgreSQL',
      level: 'error' as const,
    },
    {
      name: 'Production Environment',
      check: () => !config.isProduction || config.jwt.secret !== 'your-super-secret-jwt-key-change-this-in-production',
      message: 'Default JWT secret detected in production environment',
      level: 'error' as const,
    },
  ];

  let hasErrors = false;

  criticalChecks.forEach(({ name, check, message, level }) => {
    if (!check()) {
      const prefix = level === 'error' ? '❌' : '⚠️';
      console[level === 'error' ? 'error' : 'warn'](`${prefix} ${name}: ${message}`);
      
      if (level === 'error') {
        hasErrors = true;
      }
    }
  });

  if (hasErrors) {
    console.error('❌ Configuration validation failed. Please fix the errors above.');
    process.exit(1);
  }

  if (config.isDevelopment) {
    console.log('✅ Environment configuration validated successfully');
  }
};

export default config;