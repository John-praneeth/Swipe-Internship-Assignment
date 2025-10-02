import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';

// Import configuration
import config, { validateConfig } from './config/environment';

// Import routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import candidateRoutes from './routes/candidates';
import questionRoutes from './routes/questions';
import uploadRoutes from './routes/upload';

// Import middleware
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';
import { performanceMonitor, memoryMonitor, requestTimeout, getPerformanceMetrics } from './middleware/performance';

// Validate environment configuration
validateConfig();

const app = express();
const PORT = config.port;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: config.isProduction ? undefined : false, // Disable CSP in development
}));

// Performance monitoring (before other middleware)
app.use(performanceMonitor);
app.use(memoryMonitor);

// Request timeout
app.use(requestTimeout(30000)); // 30 second timeout

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// CORS configuration
app.use(cors(config.cors));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
app.use(morgan(config.isProduction ? 'combined' : 'dev'));

// Static files middleware (for uploaded files)
app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
  maxAge: config.isProduction ? '1d' : 0, // Cache static files in production
  etag: true,
}));

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'AI Interview Assistant Backend API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      apiDocs: '/api',
      auth: '/api/auth/*',
      users: '/api/users/*',
      candidates: '/api/candidates/*',
      questions: '/api/questions/*',
      upload: '/api/upload/*'
    },
    documentation: 'Visit /api for detailed endpoint documentation'
  });
});

// Health check endpoint
app.get('/health', async (req, res) => {
  const { prisma } = await import('./database/connection');
  
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    
    const memUsage = process.memoryUsage();
    
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: config.nodeEnv,
      database: 'connected',
      memory: {
        rss: Math.round(memUsage.rss / 1024 / 1024) + 'MB',
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + 'MB',
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + 'MB',
      },
    });
  } catch (error) {
    res.status(503).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      environment: config.nodeEnv,
      database: 'disconnected',
      error: 'Database connection failed',
    });
  }
});

// Performance metrics endpoint (development only)
if (config.isDevelopment) {
  app.get('/metrics', getPerformanceMetrics);
}

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/upload', uploadRoutes);

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'AI Interview Assistant API',
    version: '1.0.0',
    endpoints: {
      auth: {
        'POST /api/auth/login': 'User login',
        'POST /api/auth/register': 'User registration',
        'POST /api/auth/logout': 'User logout',
        'GET /api/auth/me': 'Get current user',
      },
      users: {
        'GET /api/users': 'Get all users (admin only)',
        'POST /api/users': 'Create user (admin only)',
        'PUT /api/users/:id': 'Update user (admin only)',
        'DELETE /api/users/:id': 'Delete user (admin only)',
      },
      candidates: {
        'GET /api/candidates': 'Get all candidates',
        'POST /api/candidates': 'Create candidate',
        'GET /api/candidates/:id': 'Get candidate by ID',
        'PUT /api/candidates/:id': 'Update candidate',
        'DELETE /api/candidates/:id': 'Delete candidate',
      },
      questions: {
        'GET /api/questions': 'Get all questions',
        'POST /api/questions': 'Create question (admin only)',
        'PUT /api/questions/:id': 'Update question (admin only)',
        'DELETE /api/questions/:id': 'Delete question (admin only)',
      },
      upload: {
        'POST /api/upload/resume': 'Upload resume file',
      },
    },
  });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Graceful shutdown handling
const gracefulShutdown = async (signal: string) => {
  console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);
  
  try {
    const { prisma } = await import('./database/connection');
    await prisma.$disconnect();
    console.log('✅ Database connections closed');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${config.nodeEnv}`);
  console.log(`🔗 Frontend URL: ${config.cors.origin}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API docs: http://localhost:${PORT}/api`);
  
  if (config.isDevelopment) {
    console.log(`📈 Performance metrics: http://localhost:${PORT}/metrics`);
  }
});

// Handle server errors
server.on('error', (error: NodeJS.ErrnoException) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use`);
  } else {
    console.error('❌ Server error:', error);
  }
  process.exit(1);
});

export default app;
