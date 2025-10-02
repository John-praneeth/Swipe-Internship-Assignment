import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';
import { InterviewState, Candidate, ChatMessage, Answer } from '../types';
import { generateQuestions, generateFinalScore, generateSummary } from '../utils/aiService';

const initialState: InterviewState = {
  currentCandidate: null,
  candidates: [],
  isInterviewActive: false,
  currentTimer: 0,
  questions: [],
  chatMessages: [],
  showWelcomeBack: false,
};

const interviewSlice = createSlice({
  name: 'interview',
  initialState,
  reducers: {
    createCandidate: (state, action: PayloadAction<{ 
      name?: string; 
      email?: string; 
      phone?: string; 
      resumeFile?: File; 
      resumeText?: string;
      projects?: any[];
      skills?: string[];
      experience?: any[];
      education?: any[];
      projectQuestions?: any[];
    }>) => {
      const candidate: Candidate = {
        id: uuidv4(),
        name: action.payload.name || '',
        email: action.payload.email || '',
        phone: action.payload.phone || '',
        resumeFile: action.payload.resumeFile,
        resumeText: action.payload.resumeText,
        projects: action.payload.projects || [],
        skills: action.payload.skills || [],
        experience: action.payload.experience || [],
        education: action.payload.education || [],
        projectQuestions: action.payload.projectQuestions || [],
        currentQuestionIndex: 0,
        answers: [],
        status: 'collecting-info',
        isPaused: false,
      };

      state.currentCandidate = candidate;
      state.candidates.push(candidate);

      // Add system message
      state.chatMessages = [{
        id: uuidv4(),
        type: 'system',
        content: 'Welcome! I\'ll help you with your interview today. Let me first gather some information from your resume.',
        timestamp: Date.now(),
      }];

      state.showWelcomeBack = false;
    },

    updateCandidateInfo: (state, action: PayloadAction<{ field: 'name' | 'email' | 'phone'; value: string }>) => {
      if (state.currentCandidate) {
        state.currentCandidate[action.payload.field] = action.payload.value;

        // Update in candidates array
        const index = state.candidates.findIndex(c => c.id === state.currentCandidate!.id);
        if (index !== -1) {
          state.candidates[index][action.payload.field] = action.payload.value;
        }
      }
    },

    startInterview: (state) => {
      if (state.currentCandidate) {
        state.currentCandidate.status = 'in-progress';
        state.currentCandidate.startTime = Date.now();
        state.isInterviewActive = true;
        state.showWelcomeBack = false; // Clear welcome back modal when starting interview

        // Always use the predefined questions from aiService.ts
        state.questions = generateQuestions();

        // Add first question
        const firstQuestion = state.questions[0];
        if (firstQuestion) {
          const questionMessage: ChatMessage = {
            id: uuidv4(),
            type: 'question',
            content: `**Question 1 (${firstQuestion.difficulty.toUpperCase()}):** ${firstQuestion.text}`,
            timestamp: Date.now(),
            questionId: firstQuestion.id,
            difficulty: firstQuestion.difficulty,
            timeLimit: firstQuestion.timeLimit,
          };

          state.chatMessages.push(questionMessage);
          state.currentTimer = firstQuestion.timeLimit;
        }

        // Update candidates array
        const index = state.candidates.findIndex(c => c.id === state.currentCandidate!.id);
        if (index !== -1) {
          state.candidates[index] = { ...state.currentCandidate };
        }
      }
    },

    submitAnswer: (state, action: PayloadAction<{ answer: string; timeSpent: number; isCorrect?: boolean; selectedOption?: string }>) => {
      if (!state.currentCandidate || state.questions.length === 0) return;

      const currentQuestion = state.questions[state.currentCandidate.currentQuestionIndex];
      if (!currentQuestion) return;

      // Create answer object
      const answer: Answer = {
        questionId: currentQuestion.id,
        question: currentQuestion.text,
        answer: action.payload.answer,
        timeSpent: action.payload.timeSpent,
        difficulty: currentQuestion.difficulty,
        isCorrect: action.payload.isCorrect,
        selectedOption: action.payload.selectedOption,
      };

      // Batch state updates for better performance
      const updates = {
        answers: [...state.currentCandidate.answers, answer],
        currentQuestionIndex: state.currentCandidate.currentQuestionIndex + 1,
      };

      Object.assign(state.currentCandidate, updates);

      // Add user message to chat
      const userMessage: ChatMessage = {
        id: uuidv4(),
        type: 'user',
        content: action.payload.answer,
        timestamp: Date.now(),
      };

      const newMessages = [userMessage];

      // Add immediate feedback based on answer length and time
      const answerLength = action.payload.answer.trim().length;
      const timeUsed = action.payload.timeSpent;
      const timePercentage = (timeUsed / currentQuestion.timeLimit) * 100;

      let feedback = '';
      if (answerLength < 50) {
        feedback = '💡 Consider providing more detailed examples in your future answers.';
      } else if (timePercentage > 90) {
        feedback = '⚡ Great job using most of your allocated time to think through the answer!';
      } else if (timePercentage < 30) {
        feedback = '🚀 Quick thinking! You finished with time to spare.';
      }

      if (feedback) {
        newMessages.push({
          id: uuidv4(),
          type: 'feedback',
          content: feedback,
          timestamp: Date.now(),
        });
      }

      // Check if interview is complete
      if (state.currentCandidate.currentQuestionIndex >= state.questions.length) {
        // Interview complete
        Object.assign(state.currentCandidate, {
          status: 'completed',
          endTime: Date.now(),
          finalScore: generateFinalScore(state.currentCandidate.answers),
          summary: generateSummary(state.currentCandidate.answers),
        });

        state.isInterviewActive = false;
        state.currentTimer = 0;

        newMessages.push({
          id: uuidv4(),
          type: 'system',
          content: `🎉 Interview completed! Your score: ${state.currentCandidate.finalScore}/100. Thank you - we will reach you soon!`,
          timestamp: Date.now(),
        });
      } else {
        // Next question
        const nextQuestion = state.questions[state.currentCandidate.currentQuestionIndex];
        if (nextQuestion) {
          const questionMessage: ChatMessage = {
            id: uuidv4(),
            type: 'question',
            content: `**Question ${state.currentCandidate.currentQuestionIndex + 1} (${nextQuestion.difficulty.toUpperCase()}):** ${nextQuestion.text}`,
            timestamp: Date.now(),
            questionId: nextQuestion.id,
            difficulty: nextQuestion.difficulty,
            timeLimit: nextQuestion.timeLimit,
          };

          newMessages.push(questionMessage);
          state.currentTimer = nextQuestion.timeLimit;
        }
      }

      // Batch add all messages
      state.chatMessages.push(...newMessages);

      // Update candidates array efficiently
      const candidateIndex = state.candidates.findIndex(c => c.id === state.currentCandidate!.id);
      if (candidateIndex !== -1) {
        state.candidates[candidateIndex] = { ...state.currentCandidate };
      }
    },

    updateTimer: (state, action: PayloadAction<number>) => {
      state.currentTimer = action.payload;

      // Timer warning at 10 seconds
      if (action.payload === 10 && state.isInterviewActive) {
        state.chatMessages.push({
          id: uuidv4(),
          type: 'timer-warning',
          content: '⏰ 10 seconds remaining!',
          timestamp: Date.now(),
        });
      }
    },

    timeUp: (state) => {
      if (state.currentCandidate && state.isInterviewActive) {
        const currentQuestion = state.questions[state.currentCandidate.currentQuestionIndex];

        // Auto-submit empty answer
        const answer: Answer = {
          questionId: currentQuestion.id,
          question: currentQuestion.text,
          answer: '(No answer provided - time expired)',
          timeSpent: currentQuestion.timeLimit,
          difficulty: currentQuestion.difficulty,
        };

        state.currentCandidate.answers.push(answer);
        state.currentCandidate.currentQuestionIndex++;

        state.chatMessages.push({
          id: uuidv4(),
          type: 'system',
          content: '⏰ Time\'s up! Moving to the next question.',
          timestamp: Date.now(),
        });

        // Check if interview is complete or move to next question
        if (state.currentCandidate.currentQuestionIndex >= state.questions.length) {
          state.currentCandidate.status = 'completed';
          state.currentCandidate.endTime = Date.now();
          state.currentCandidate.finalScore = generateFinalScore(state.currentCandidate.answers);
          state.currentCandidate.summary = generateSummary(state.currentCandidate.answers);
          state.isInterviewActive = false;
          state.currentTimer = 0;

          state.chatMessages.push({
            id: uuidv4(),
            type: 'system',
            content: `🎉 Interview completed! Your score: ${state.currentCandidate.finalScore}/100. Thank you - we will reach you soon!`,
            timestamp: Date.now(),
          });
        } else {
          const nextQuestion = state.questions[state.currentCandidate.currentQuestionIndex];
          const questionMessage: ChatMessage = {
            id: uuidv4(),
            type: 'question',
            content: `**Question ${state.currentCandidate.currentQuestionIndex + 1} (${nextQuestion.difficulty.toUpperCase()}):** ${nextQuestion.text}`,
            timestamp: Date.now(),
            questionId: nextQuestion.id,
            difficulty: nextQuestion.difficulty,
            timeLimit: nextQuestion.timeLimit,
          };

          state.chatMessages.push(questionMessage);
          state.currentTimer = nextQuestion.timeLimit;
        }

        // Update candidates array
        const index = state.candidates.findIndex(c => c.id === state.currentCandidate!.id);
        if (index !== -1) {
          state.candidates[index] = { ...state.currentCandidate };
        }
      }
    },

    pauseInterview: (state) => {
      if (state.currentCandidate) {
        state.currentCandidate.isPaused = true;
        state.currentCandidate.remainingTime = state.currentTimer;
        state.isInterviewActive = false;

        // Update candidates array
        const index = state.candidates.findIndex(c => c.id === state.currentCandidate!.id);
        if (index !== -1) {
          state.candidates[index] = { ...state.currentCandidate };
        }
      }
    },

    resumeInterview: (state) => {
      if (state.currentCandidate && state.currentCandidate.isPaused) {
        state.currentCandidate.isPaused = false;
        state.isInterviewActive = true;
        state.currentTimer = state.currentCandidate.remainingTime || 0;

        // Update candidates array
        const index = state.candidates.findIndex(c => c.id === state.currentCandidate!.id);
        if (index !== -1) {
          state.candidates[index] = { ...state.currentCandidate };
        }
      }
    },

    selectCandidate: (state, action: PayloadAction<string>) => {
      const candidate = state.candidates.find(c => c.id === action.payload);
      if (candidate) {
        state.currentCandidate = { ...candidate };

        // Reconstruct chat messages for this candidate
        state.chatMessages = [{
          id: uuidv4(),
          type: 'system',
          content: 'Welcome! I\'ll help you with your interview today.',
          timestamp: candidate.startTime || Date.now(),
        }];

        // Add questions and answers to chat
        candidate.answers.forEach((answer, index) => {
          const question = state.questions.find(q => q.id === answer.questionId);
          if (question) {
            state.chatMessages.push({
              id: uuidv4(),
              type: 'question',
              content: `**Question ${index + 1} (${answer.difficulty.toUpperCase()}):** ${answer.question}`,
              timestamp: (candidate.startTime || Date.now()) + index * 60000,
              questionId: answer.questionId,
              difficulty: answer.difficulty,
            });

            state.chatMessages.push({
              id: uuidv4(),
              type: 'user',
              content: answer.answer,
              timestamp: (candidate.startTime || Date.now()) + index * 60000 + 30000,
            });
          }
        });

        if (candidate.status === 'completed') {
          state.chatMessages.push({
            id: uuidv4(),
            type: 'system',
            content: `🎉 Interview completed! Your score: ${candidate.finalScore}/100. Thank you - we will reach you soon!`,
            timestamp: candidate.endTime || Date.now(),
          });
        }

        // Check if should show welcome back modal
        if (candidate.isPaused || (candidate.status === 'in-progress' && !state.isInterviewActive)) {
          state.showWelcomeBack = true;
        }
      }
    },

    addChatMessage: (state, action: PayloadAction<Omit<ChatMessage, 'id' | 'timestamp'>>) => {
      state.chatMessages.push({
        ...action.payload,
        id: uuidv4(),
        timestamp: Date.now(),
      });
    },

    setWelcomeBackModal: (state, action: PayloadAction<boolean>) => {
      state.showWelcomeBack = action.payload;
    },

    resetCurrentCandidate: (state) => {
      state.currentCandidate = null;
      state.isInterviewActive = false;
      state.currentTimer = 0;
      state.questions = [];
      state.chatMessages = [];
      state.showWelcomeBack = false;
    },
  },
});

export const {
  createCandidate,
  updateCandidateInfo,
  startInterview,
  submitAnswer,
  updateTimer,
  timeUp,
  pauseInterview,
  resumeInterview,
  selectCandidate,
  addChatMessage,
  setWelcomeBackModal,
  resetCurrentCandidate,
} = interviewSlice.actions;

export default interviewSlice.reducer;
