import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';

// Import routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import candidateRoutes from './routes/candidates';
import questionRoutes from './routes/questions';
import uploadRoutes from './routes/upload';

// Import middleware
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: (parseInt(process.env.RATE_LIMIT_WINDOW) || 15) * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Static files middleware (for uploaded files)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

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
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
});

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

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API docs: http://localhost:${PORT}/api`);
});

export default app;
