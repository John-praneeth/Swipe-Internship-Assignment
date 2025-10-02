import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';

// Generic validation middleware
export const validateRequest = (schema: {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate request body
      if (schema.body) {
        req.body = schema.body.parse(req.body);
      }

      // Validate query parameters
      if (schema.query) {
        req.query = schema.query.parse(req.query);
      }

      // Validate route parameters
      if (schema.params) {
        req.params = schema.params.parse(req.params);
      }

      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        });
      }

      return res.status(400).json({
        success: false,
        error: 'Invalid request data',
      });
    }
  };
};

// Common validation schemas
export const schemas = {
  // Authentication schemas
  login: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  }),

  register: z.object({
    username: z.string().min(2, 'Username must be at least 2 characters'),
    email: z.string().email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum(['ADMIN', 'INTERVIEWER', 'INTERVIEWEE']).optional(),
  }),

  // Candidate schemas
  createCandidate: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email format'),
    phone: z.string().min(10, 'Phone number must be at least 10 characters'),
    resumeFileName: z.string().optional(),
    resumeFileUrl: z.string().optional(),
    resumeText: z.string().optional(),
  }),

  updateCandidate: z.object({
    name: z.string().min(2).optional(),
    email: z.string().email().optional(),
    phone: z.string().min(10).optional(),
    status: z.enum(['COLLECTING_INFO', 'IN_PROGRESS', 'COMPLETED']).optional(),
    currentQuestionIndex: z.number().min(0).optional(),
    finalScore: z.number().min(0).max(100).optional(),
    summary: z.string().optional(),
    isPaused: z.boolean().optional(),
  }),

  // Answer schemas
  createAnswer: z.object({
    questionId: z.string().uuid('Invalid question ID'),
    answer: z.string().min(1, 'Answer cannot be empty'),
    timeSpent: z.number().min(0, 'Time spent cannot be negative'),
    difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
  }),

  // Message schemas
  createMessage: z.object({
    type: z.enum(['SYSTEM', 'USER', 'QUESTION', 'TIMER_WARNING', 'FEEDBACK']),
    content: z.string().min(1, 'Content cannot be empty'),
    questionId: z.string().uuid().optional(),
    difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).optional(),
    timeLimit: z.number().min(0).optional(),
  }),

  // Question schemas
  createQuestion: z.object({
    text: z.string().min(10, 'Question text must be at least 10 characters'),
    difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
    timeLimit: z.number().min(10, 'Time limit must be at least 10 seconds'),
    category: z.string().min(2, 'Category must be at least 2 characters'),
  }),

  // Common parameter schemas
  uuidParam: z.object({
    id: z.string().uuid('Invalid ID format'),
  }),

  // Pagination schemas
  pagination: z.object({
    page: z.string().transform(val => parseInt(val, 10)).refine(val => val > 0, 'Page must be positive').optional(),
    limit: z.string().transform(val => parseInt(val, 10)).refine(val => val > 0 && val <= 100, 'Limit must be between 1 and 100').optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
};

// Sanitization helpers
export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

export const sanitizeObject = (obj: Record<string, any>): Record<string, any> => {
  const sanitized: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
};