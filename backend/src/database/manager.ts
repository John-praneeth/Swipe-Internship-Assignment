import { PrismaClient } from '@prisma/client';
import { DatabaseConnection } from './connection';

export class DatabaseManager {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = DatabaseConnection.getInstance();
  }

  // User Management
  async createUser(userData: {
    username: string;
    email: string;
    password: string;
    role: string;
  }) {
    try {
      const existingUser = await this.prisma.user.findFirst({
        where: {
          OR: [
            { email: userData.email },
            { username: userData.username }
          ]
        }
      });

      if (existingUser) {
        throw new Error('User already exists with this email or username');
      }

      return await this.prisma.user.create({
        data: userData,
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
          lastLogin: true
        }
      });
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async getUserById(id: string) {
    try {
      return await this.prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
          lastLogin: true
        }
      });
    } catch (error) {
      console.error('Error fetching user by ID:', error);
      throw error;
    }
  }

  async getUserByEmail(email: string) {
    try {
      return await this.prisma.user.findUnique({
        where: { email }
      });
    } catch (error) {
      console.error('Error fetching user by email:', error);
      throw error;
    }
  }

  async getAllUsers(filters?: {
    role?: string;
    isActive?: boolean;
    search?: string;
  }) {
    try {
      const where: any = {};

      if (filters?.role) {
        where.role = filters.role;
      }

      if (filters?.isActive !== undefined) {
        where.isActive = filters.isActive;
      }

      if (filters?.search) {
        where.OR = [
          { username: { contains: filters.search } },
          { email: { contains: filters.search } }
        ];
      }

      return await this.prisma.user.findMany({
        where,
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
          lastLogin: true
        },
        orderBy: { createdAt: 'desc' }
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  async updateUser(id: string, updates: Partial<{
    username: string;
    email: string;
    role: string;
    isActive: boolean;
    lastLogin: Date;
  }>) {
    try {
      return await this.prisma.user.update({
        where: { id },
        data: updates,
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
          lastLogin: true
        }
      });
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  async deleteUser(id: string) {
    try {
      // First, delete related records
      await this.prisma.session.deleteMany({
        where: { userId: id }
      });

      await this.prisma.candidate.deleteMany({
        where: {
          OR: [
            { interviewerId: id },
            { intervieweeId: id }
          ]
        }
      });

      return await this.prisma.user.delete({
        where: { id }
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  // Session Management
  async createSession(userId: string, token: string, expiresAt: Date) {
    try {
      return await this.prisma.session.create({
        data: {
          userId,
          token,
          expiresAt
        }
      });
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  }

  async getSession(token: string) {
    try {
      return await this.prisma.session.findUnique({
        where: { token },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
              role: true,
              isActive: true
            }
          }
        }
      });
    } catch (error) {
      console.error('Error fetching session:', error);
      throw error;
    }
  }

  async deleteSession(token: string) {
    try {
      return await this.prisma.session.delete({
        where: { token }
      });
    } catch (error) {
      console.error('Error deleting session:', error);
      throw error;
    }
  }

  async cleanupExpiredSessions() {
    try {
      const result = await this.prisma.session.deleteMany({
        where: {
          expiresAt: {
            lt: new Date()
          }
        }
      });
      console.log(`Cleaned up ${result.count} expired sessions`);
      return result;
    } catch (error) {
      console.error('Error cleaning up sessions:', error);
      throw error;
    }
  }

  // Candidate Management
  async createCandidate(candidateData: {
    name: string;
    email: string;
    phone: string;
    resumeFileName?: string;
    resumeFileUrl?: string;
    resumeText?: string;
    intervieweeId?: string;
  }) {
    try {
      return await this.prisma.candidate.create({
        data: candidateData,
        include: {
          answers: true,
          messages: true,
          interviewer: {
            select: {
              id: true,
              username: true,
              email: true
            }
          },
          interviewee: {
            select: {
              id: true,
              username: true,
              email: true
            }
          }
        }
      });
    } catch (error) {
      console.error('Error creating candidate:', error);
      throw error;
    }
  }

  async getCandidateById(id: string) {
    try {
      return await this.prisma.candidate.findUnique({
        where: { id },
        include: {
          answers: {
            include: {
              question: true
            },
            orderBy: { createdAt: 'asc' }
          },
          messages: {
            orderBy: { timestamp: 'asc' }
          },
          interviewer: {
            select: {
              id: true,
              username: true,
              email: true
            }
          },
          interviewee: {
            select: {
              id: true,
              username: true,
              email: true
            }
          }
        }
      });
    } catch (error) {
      console.error('Error fetching candidate:', error);
      throw error;
    }
  }

  async getAllCandidates(filters?: {
    status?: string;
    interviewerId?: string;
    search?: string;
    dateFrom?: Date;
    dateTo?: Date;
  }) {
    try {
      const where: any = {};

      if (filters?.status) {
        where.status = filters.status;
      }

      if (filters?.interviewerId) {
        where.interviewerId = filters.interviewerId;
      }

      if (filters?.search) {
        where.OR = [
          { name: { contains: filters.search } },
          { email: { contains: filters.search } }
        ];
      }

      if (filters?.dateFrom || filters?.dateTo) {
        where.createdAt = {};
        if (filters.dateFrom) {
          where.createdAt.gte = filters.dateFrom;
        }
        if (filters.dateTo) {
          where.createdAt.lte = filters.dateTo;
        }
      }

      return await this.prisma.candidate.findMany({
        where,
        include: {
          answers: true,
          interviewer: {
            select: {
              id: true,
              username: true,
              email: true
            }
          },
          interviewee: {
            select: {
              id: true,
              username: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    } catch (error) {
      console.error('Error fetching candidates:', error);
      throw error;
    }
  }

  async updateCandidate(id: string, updates: any) {
    try {
      return await this.prisma.candidate.update({
        where: { id },
        data: updates,
        include: {
          answers: true,
          messages: true
        }
      });
    } catch (error) {
      console.error('Error updating candidate:', error);
      throw error;
    }
  }

  async deleteCandidate(id: string) {
    try {
      return await this.prisma.candidate.delete({
        where: { id }
      });
    } catch (error) {
      console.error('Error deleting candidate:', error);
      throw error;
    }
  }

  // Question Management
  async createQuestion(questionData: {
    text: string;
    difficulty: string;
    timeLimit: number;
    category: string;
    type?: string;
    options?: string;
    correctAnswer?: string;
    explanation?: string;
  }) {
    try {
      return await this.prisma.question.create({
        data: questionData
      });
    } catch (error) {
      console.error('Error creating question:', error);
      throw error;
    }
  }

  async getAllQuestions(filters?: {
    difficulty?: string;
    category?: string;
    type?: string;
    isActive?: boolean;
  }) {
    try {
      const where: any = {};

      if (filters?.difficulty) {
        where.difficulty = filters.difficulty;
      }

      if (filters?.category) {
        where.category = filters.category;
      }

      if (filters?.type) {
        where.type = filters.type;
      }

      if (filters?.isActive !== undefined) {
        where.isActive = filters.isActive;
      }

      return await this.prisma.question.findMany({
        where,
        orderBy: { createdAt: 'desc' }
      });
    } catch (error) {
      console.error('Error fetching questions:', error);
      throw error;
    }
  }

  async updateQuestion(id: string, updates: any) {
    try {
      return await this.prisma.question.update({
        where: { id },
        data: updates
      });
    } catch (error) {
      console.error('Error updating question:', error);
      throw error;
    }
  }

  async deleteQuestion(id: string) {
    try {
      return await this.prisma.question.delete({
        where: { id }
      });
    } catch (error) {
      console.error('Error deleting question:', error);
      throw error;
    }
  }

  // Answer Management
  async createAnswer(answerData: {
    candidateId: string;
    questionId: string;
    answer: string;
    timeSpent: number;
    difficulty: string;
    score?: number;
    feedback?: string;
    isCorrect?: boolean;
    selectedOption?: string;
  }) {
    try {
      return await this.prisma.answer.create({
        data: answerData,
        include: {
          question: true
        }
      });
    } catch (error) {
      console.error('Error creating answer:', error);
      throw error;
    }
  }

  // Chat Message Management
  async createChatMessage(messageData: {
    candidateId: string;
    type: string;
    content: string;
    questionId?: string;
    difficulty?: string;
    timeLimit?: number;
  }) {
    try {
      return await this.prisma.chatMessage.create({
        data: messageData
      });
    } catch (error) {
      console.error('Error creating chat message:', error);
      throw error;
    }
  }

  // Analytics and Reports
  async getInterviewStats(filters?: {
    dateFrom?: Date;
    dateTo?: Date;
    interviewerId?: string;
  }) {
    try {
      const where: any = {};

      if (filters?.dateFrom || filters?.dateTo) {
        where.createdAt = {};
        if (filters.dateFrom) {
          where.createdAt.gte = filters.dateFrom;
        }
        if (filters.dateTo) {
          where.createdAt.lte = filters.dateTo;
        }
      }

      if (filters?.interviewerId) {
        where.interviewerId = filters.interviewerId;
      }

      const [
        totalCandidates,
        completedInterviews,
        inProgressInterviews,
        averageScore,
        totalQuestions,
        totalUsers
      ] = await Promise.all([
        this.prisma.candidate.count({ where }),
        this.prisma.candidate.count({ 
          where: { ...where, status: 'COMPLETED' } 
        }),
        this.prisma.candidate.count({ 
          where: { ...where, status: 'IN_PROGRESS' } 
        }),
        this.prisma.candidate.aggregate({
          where: { ...where, status: 'COMPLETED' },
          _avg: { finalScore: true }
        }),
        this.prisma.question.count({ where: { isActive: true } }),
        this.prisma.user.count({ where: { isActive: true } })
      ]);

      return {
        totalCandidates,
        completedInterviews,
        inProgressInterviews,
        averageScore: Math.round(averageScore._avg.finalScore || 0),
        totalQuestions,
        totalUsers,
        completionRate: totalCandidates > 0 ? Math.round((completedInterviews / totalCandidates) * 100) : 0
      };
    } catch (error) {
      console.error('Error fetching interview stats:', error);
      throw error;
    }
  }

  async getPerformanceAnalytics() {
    try {
      const [
        scoreDistribution,
        difficultyPerformance,
        categoryPerformance
      ] = await Promise.all([
        this.prisma.candidate.groupBy({
          by: ['finalScore'],
          where: { status: 'COMPLETED' },
          _count: true
        }),
        this.prisma.answer.groupBy({
          by: ['difficulty'],
          _avg: { score: true },
          _count: true
        }),
        this.prisma.answer.groupBy({
          by: ['difficulty'],
          _avg: { timeSpent: true },
          _count: true
        })
      ]);

      return {
        scoreDistribution,
        difficultyPerformance,
        categoryPerformance
      };
    } catch (error) {
      console.error('Error fetching performance analytics:', error);
      throw error;
    }
  }

  // Database Maintenance
  async performMaintenance() {
    try {
      console.log('Starting database maintenance...');

      // Clean up expired sessions
      await this.cleanupExpiredSessions();

      // Clean up old incomplete interviews (older than 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const cleanupResult = await this.prisma.candidate.deleteMany({
        where: {
          status: 'COLLECTING_INFO',
          createdAt: {
            lt: sevenDaysAgo
          }
        }
      });

      console.log(`Cleaned up ${cleanupResult.count} old incomplete interviews`);

      // Update statistics
      const stats = await this.getInterviewStats();
      console.log('Current database stats:', stats);

      console.log('Database maintenance completed successfully');
      return { success: true, stats };
    } catch (error) {
      console.error('Error during database maintenance:', error);
      throw error;
    }
  }

  // Backup and Export
  async exportData(type: 'candidates' | 'users' | 'questions' | 'all') {
    try {
      const data: any = {};

      if (type === 'candidates' || type === 'all') {
        data.candidates = await this.getAllCandidates();
      }

      if (type === 'users' || type === 'all') {
        data.users = await this.getAllUsers();
      }

      if (type === 'questions' || type === 'all') {
        data.questions = await this.getAllQuestions();
      }

      return {
        exportDate: new Date().toISOString(),
        type,
        data
      };
    } catch (error) {
      console.error('Error exporting data:', error);
      throw error;
    }
  }
}

export const dbManager = new DatabaseManager();