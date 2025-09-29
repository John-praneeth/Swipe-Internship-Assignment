export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  resumeFile?: File;
  resumeText?: string;
  currentQuestionIndex: number;
  answers: Answer[];
  finalScore?: number;
  summary?: string;
  status: 'collecting-info' | 'in-progress' | 'completed';
  startTime?: number;
  endTime?: number;
  isPaused: boolean;
  remainingTime?: number;
}

export interface Answer {
  questionId: string;
  question: string;
  answer: string;
  timeSpent: number;
  difficulty: QuestionDifficulty;
  score?: number;
  feedback?: string;
}

export interface Question {
  id: string;
  text: string;
  difficulty: QuestionDifficulty;
  timeLimit: number; // in seconds
  category: string;
}

export type QuestionDifficulty = 'easy' | 'medium' | 'hard';

export interface ChatMessage {
  id: string;
  type: 'system' | 'user' | 'question' | 'timer-warning' | 'feedback';
  content: string;
  timestamp: number;
  questionId?: string;
  difficulty?: QuestionDifficulty;
  timeLimit?: number;
}

export interface InterviewState {
  currentCandidate: Candidate | null;
  candidates: Candidate[];
  isInterviewActive: boolean;
  currentTimer: number;
  questions: Question[];
  chatMessages: ChatMessage[];
  showWelcomeBack: boolean;
}

export interface RootState {
  interview: InterviewState;
}
