import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// @route   GET /api/questions
// @desc    Get all active questions
// @access  Private
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const questions = await prisma.question.findMany({
      where: { isActive: true },
      orderBy: [
        { difficulty: 'asc' },
        { createdAt: 'asc' }
      ]
    });

    res.json({
      success: true,
      data: { questions }
    });
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// @route   POST /api/questions
// @desc    Create question
// @access  Private (Admin only)
router.post('/', authenticate, authorize('ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const { text, difficulty, timeLimit, category } = req.body;

    if (!text || !difficulty || !timeLimit || !category) {
      return res.status(400).json({
        success: false,
        error: 'Please provide text, difficulty, timeLimit, and category'
      });
    }

    const question = await prisma.question.create({
      data: {
        text,
        difficulty: difficulty.toUpperCase(),
        timeLimit,
        category
      }
    });

    res.status(201).json({
      success: true,
      data: { question }
    });
  } catch (error) {
    console.error('Create question error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// @route   PUT /api/questions/:id
// @desc    Update question
// @access  Private (Admin only)
router.put('/:id', authenticate, authorize('ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { text, difficulty, timeLimit, category, isActive } = req.body;

    const question = await prisma.question.update({
      where: { id },
      data: {
        ...(text && { text }),
        ...(difficulty && { difficulty: difficulty.toUpperCase() }),
        ...(timeLimit && { timeLimit }),
        ...(category && { category }),
        ...(isActive !== undefined && { isActive })
      }
    });

    res.json({
      success: true,
      data: { question }
    });
  } catch (error) {
    console.error('Update question error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// @route   DELETE /api/questions/:id
// @desc    Delete question (soft delete by setting isActive to false)
// @access  Private (Admin only)
router.delete('/:id', authenticate, authorize('ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.question.update({
      where: { id },
      data: { isActive: false }
    });

    res.json({
      success: true,
      message: 'Question deleted successfully'
    });
  } catch (error) {
    console.error('Delete question error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export default router;
