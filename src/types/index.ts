export interface ProjectInfo {
  title: string;
  description: string;
  technologies: string[];
  duration?: string;
  url?: string;
}

export interface ExperienceInfo {
  company: string;
  position: string;
  duration: string;
  description: string;
}

export interface EducationInfo {
  institution: string;
  degree: string;
  duration: string;
  gpa?: string;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  resumeFile?: File;
  resumeText?: string;
  projects: ProjectInfo[];
  skills: string[];
  experience: ExperienceInfo[];
  education: EducationInfo[];
  projectQuestions?: any[]; // CodingQuestion[] - avoiding circular import
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
  isCorrect?: boolean;
  selectedOption?: string;
}

export interface Question {
  id: string;
  text: string;
  difficulty: QuestionDifficulty;
  timeLimit: number; // in seconds
  category: string;
  type: 'multiple-choice' | 'text';
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
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
