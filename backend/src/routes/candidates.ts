import express, { Request, Response } from 'express';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { dbManager } from '../database/manager';

const router = express.Router();

// @route   GET /api/candidates
// @desc    Get all candidates
// @access  Private (Interviewer/Admin)
router.get('/', authenticate, authorize('INTERVIEWER', 'ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const candidates = await prisma.candidate.findMany({
      include: {
        answers: {
          include: {
            question: true
          }
        },
        messages: true,
        interviewer: {
          select: {
            id: true,
            username: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      success: true,
      data: { candidates }
    });
  } catch (error) {
    console.error('Get candidates error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// @route   POST /api/candidates
// @desc    Create a new candidate
// @access  Private
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const {
      name,
      email,
      phone,
      resumeFileName,
      resumeFileUrl,
      resumeText
    } = req.body;

    // Validation
    if (!name || !email || !phone) {
      return res.status(400).json({
        success: false,
        error: 'Please provide name, email, and phone'
      });
    }

    // Check if candidate already exists
    const existingCandidate = await prisma.candidate.findFirst({
      where: { email }
    });

    if (existingCandidate) {
      return res.status(400).json({
        success: false,
        error: 'Candidate already exists with this email'
      });
    }

    const candidate = await prisma.candidate.create({
      data: {
        name,
        email,
        phone,
        resumeFileName,
        resumeFileUrl,
        resumeText,
        intervieweeId: req.user!.role === 'INTERVIEWEE' ? req.user!.id : undefined
      },
      include: {
        answers: true,
        messages: true
      }
    });

    res.status(201).json({
      success: true,
      data: { candidate }
    });
  } catch (error) {
    console.error('Create candidate error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// @route   GET /api/candidates/:id
// @desc    Get candidate by ID
// @access  Private
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const candidate = await prisma.candidate.findUnique({
      where: { id },
      include: {
        answers: {
          include: {
            question: true
          },
          orderBy: {
            createdAt: 'asc'
          }
        },
        messages: {
          orderBy: {
            timestamp: 'asc'
          }
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

    if (!candidate) {
      return res.status(404).json({
        success: false,
        error: 'Candidate not found'
      });
    }

    // Check permissions
    if (req.user!.role === 'INTERVIEWEE' && candidate.intervieweeId !== req.user!.id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: { candidate }
    });
  } catch (error) {
    console.error('Get candidate error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// @route   PUT /api/candidates/:id
// @desc    Update candidate
// @access  Private
router.put('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Find existing candidate
    const existingCandidate = await prisma.candidate.findUnique({
      where: { id }
    });

    if (!existingCandidate) {
      return res.status(404).json({
        success: false,
        error: 'Candidate not found'
      });
    }

    // Check permissions
    if (req.user!.role === 'INTERVIEWEE' && existingCandidate.intervieweeId !== req.user!.id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    const candidate = await prisma.candidate.update({
      where: { id },
      data: updateData,
      include: {
        answers: {
          include: {
            question: true
          }
        },
        messages: true
      }
    });

    res.json({
      success: true,
      data: { candidate }
    });
  } catch (error) {
    console.error('Update candidate error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// @route   POST /api/candidates/:id/answers
// @desc    Add answer to candidate
// @access  Private
router.post('/:id/answers', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { questionId, answer, timeSpent, difficulty } = req.body;

    // Validation
    if (!questionId || !answer || timeSpent === undefined || !difficulty) {
      return res.status(400).json({
        success: false,
        error: 'Please provide questionId, answer, timeSpent, and difficulty'
      });
    }

    // Find candidate
    const candidate = await prisma.candidate.findUnique({
      where: { id }
    });

    if (!candidate) {
      return res.status(404).json({
        success: false,
        error: 'Candidate not found'
      });
    }

    // Check permissions
    if (req.user!.role === 'INTERVIEWEE' && candidate.intervieweeId !== req.user!.id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    // Create answer
    const newAnswer = await prisma.answer.create({
      data: {
        candidateId: id,
        questionId,
        answer,
        timeSpent,
        difficulty: difficulty.toUpperCase()
      },
      include: {
        question: true
      }
    });

    res.status(201).json({
      success: true,
      data: { answer: newAnswer }
    });
  } catch (error) {
    console.error('Add answer error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// @route   POST /api/candidates/:id/messages
// @desc    Add chat message to candidate
// @access  Private
router.post('/:id/messages', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { type, content, questionId, difficulty, timeLimit } = req.body;

    // Validation
    if (!type || !content) {
      return res.status(400).json({
        success: false,
        error: 'Please provide type and content'
      });
    }

    // Find candidate
    const candidate = await prisma.candidate.findUnique({
      where: { id }
    });

    if (!candidate) {
      return res.status(404).json({
        success: false,
        error: 'Candidate not found'
      });
    }

    // Check permissions
    if (req.user!.role === 'INTERVIEWEE' && candidate.intervieweeId !== req.user!.id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    // Create message
    const message = await prisma.chatMessage.create({
      data: {
        candidateId: id,
        type: type.toUpperCase(),
        content,
        questionId,
        difficulty: difficulty?.toUpperCase(),
        timeLimit
      }
    });

    res.status(201).json({
      success: true,
      data: { message }
    });
  } catch (error) {
    console.error('Add message error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// @route   DELETE /api/candidates/:id
// @desc    Delete candidate
// @access  Private (Admin only)
router.delete('/:id', authenticate, authorize('ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const candidate = await prisma.candidate.findUnique({
      where: { id }
    });

    if (!candidate) {
      return res.status(404).json({
        success: false,
        error: 'Candidate not found'
      });
    }

    await prisma.candidate.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Candidate deleted successfully'
    });
  } catch (error) {
    console.error('Delete candidate error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export default router;
