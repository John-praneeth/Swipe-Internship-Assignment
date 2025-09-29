import { Question } from '../types';

// Advanced AI service for generating questions, scores, and summaries
// In a real application, these would call actual AI APIs like OpenAI GPT-4, Claude, etc.

export const generateQuestions = (): Question[] => {
  const questionPools = {
    easy: [
      {
        id: 'easy_1',
        text: 'What is the difference between `let`, `const`, and `var` in JavaScript? Explain with examples.',
        difficulty: 'easy' as const,
        timeLimit: 20,
        category: 'JavaScript Fundamentals',
      },
      {
        id: 'easy_2',
        text: 'Explain what JSX is and why it\'s used in React. What are its advantages over plain JavaScript?',
        difficulty: 'easy' as const,
        timeLimit: 20,
        category: 'React Basics',
      },
      {
        id: 'easy_3',
        text: 'What is the DOM and how does virtual DOM in React improve performance?',
        difficulty: 'easy' as const,
        timeLimit: 20,
        category: 'Web Development',
      },
      {
        id: 'easy_4',
        text: 'Explain the difference between == and === operators in JavaScript.',
        difficulty: 'easy' as const,
        timeLimit: 20,
        category: 'JavaScript Fundamentals',
      }
    ],
    medium: [
      {
        id: 'medium_1',
        text: 'How do React hooks like useState and useEffect work? Provide an example of using useEffect for API calls.',
        difficulty: 'medium' as const,
        timeLimit: 60,
        category: 'React Hooks',
      },
      {
        id: 'medium_2',
        text: 'What is the difference between SQL and NoSQL databases? When would you choose one over the other?',
        difficulty: 'medium' as const,
        timeLimit: 60,
        category: 'Database Design',
      },
      {
        id: 'medium_3',
        text: 'Explain how promises work in JavaScript. How would you handle errors in promise chains?',
        difficulty: 'medium' as const,
        timeLimit: 60,
        category: 'Asynchronous JavaScript',
      },
      {
        id: 'medium_4',
        text: 'What is state management in React? Compare useState, useContext, and external libraries like Redux.',
        difficulty: 'medium' as const,
        timeLimit: 60,
        category: 'State Management',
      }
    ],
    hard: [
      {
        id: 'hard_1',
        text: 'Design a scalable architecture for a real-time chat application. Consider both frontend and backend components, data flow, and scalability challenges.',
        difficulty: 'hard' as const,
        timeLimit: 120,
        category: 'System Design',
      },
      {
        id: 'hard_2',
        text: 'Explain the concept of closures in JavaScript. Provide a practical use case where closures solve a real-world problem in web development.',
        difficulty: 'hard' as const,
        timeLimit: 120,
        category: 'Advanced JavaScript',
      },
      {
        id: 'hard_3',
        text: 'How would you optimize a React application for performance? Discuss techniques like code splitting, memoization, and virtual scrolling.',
        difficulty: 'hard' as const,
        timeLimit: 120,
        category: 'Performance Optimization',
      },
      {
        id: 'hard_4',
        text: 'Design a distributed system for handling user authentication across multiple microservices. How would you ensure security and scalability?',
        difficulty: 'hard' as const,
        timeLimit: 120,
        category: 'Distributed Systems',
      }
    ]
  };

  // Randomly select 2 questions from each difficulty level
  const selectedQuestions = [
    ...shuffleArray(questionPools.easy).slice(0, 2),
    ...shuffleArray(questionPools.medium).slice(0, 2),
    ...shuffleArray(questionPools.hard).slice(0, 2),
  ];

  return selectedQuestions;
};

// Utility function to shuffle array
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Enhanced scoring algorithm with detailed analysis
export const generateFinalScore = (answers: any[]): number => {
  let totalScore = 0;
  let maxPossibleScore = 0;
  
  answers.forEach((answer) => {
    let questionScore = 0;
    let maxQuestionScore = 0;
    
    // Set maximum score based on difficulty
    switch (answer.difficulty) {
      case 'easy':
        maxQuestionScore = 15;
        break;
      case 'medium':
        maxQuestionScore = 25;
        break;
      case 'hard':
        maxQuestionScore = 35;
        break;
      default:
        maxQuestionScore = 20;
    }
    
    maxPossibleScore += maxQuestionScore;
    
    if (answer.answer.includes('(No answer provided')) {
      // No answer provided - 0 score
      questionScore = 0;
    } else {
      // Enhanced scoring based on multiple factors
      const answerText = answer.answer.toLowerCase();
      const answerLength = answer.answer.trim().length;
      
      // Base score calculation
      let contentScore = 0;
      let structureScore = 0;
      let technicalScore = 0;
      
      // Content quality scoring (40% of total)
      if (answerLength >= 50) contentScore += 0.3;
      if (answerLength >= 150) contentScore += 0.4;
      if (answerLength >= 300) contentScore += 0.3;
      
      // Structure and clarity scoring (30% of total)
      const sentences = answer.answer.split(/[.!?]+/).filter((s: string) => s.trim().length > 0);
      if (sentences.length >= 2) structureScore += 0.5;
      if (sentences.length >= 4) structureScore += 0.5;
      
      // Technical keyword scoring (30% of total)
      const technicalKeywords = getTechnicalKeywords(answer.question);
      const foundKeywords = technicalKeywords.filter(keyword => 
        answerText.includes(keyword.toLowerCase())
      ).length;
      technicalScore = Math.min(1, foundKeywords / Math.max(1, technicalKeywords.length / 3));
      
      // Calculate final question score
      const baseScore = (contentScore * 0.4 + structureScore * 0.3 + technicalScore * 0.3);
      questionScore = Math.min(maxQuestionScore, baseScore * maxQuestionScore);
      
      // Ensure minimum score for attempted answers
      if (questionScore < 2 && answerLength > 20) {
        questionScore = 2;
      }
    }
    
    totalScore += Math.round(questionScore);
  });
  
  // Convert to percentage
  const percentage = Math.round((totalScore / maxPossibleScore) * 100);
  return Math.max(0, Math.min(100, percentage));
};

// Helper function to get relevant technical keywords for a question
const getTechnicalKeywords = (question: string): string[] => {
  const questionLower = question.toLowerCase();
  const keywordSets: Record<string, string[]> = {
    javascript: ['javascript', 'js', 'variable', 'function', 'scope', 'hoisting', 'closure', 'async', 'promise', 'callback'],
    react: ['react', 'jsx', 'component', 'props', 'state', 'hook', 'useeffect', 'usestate', 'virtual dom', 'lifecycle'],
    web: ['html', 'css', 'dom', 'browser', 'performance', 'optimization', 'responsive', 'accessibility'],
    database: ['sql', 'nosql', 'mongodb', 'postgresql', 'index', 'query', 'transaction', 'acid', 'schema'],
    system: ['architecture', 'scalability', 'microservices', 'api', 'rest', 'graphql', 'load balancing', 'caching'],
  };
  
  let relevantKeywords: string[] = [];
  
  Object.entries(keywordSets).forEach(([, keywords]) => {
    if (keywords.some(keyword => questionLower.includes(keyword))) {
      relevantKeywords = [...relevantKeywords, ...keywords];
    }
  });
  
  return [...new Set(relevantKeywords)];
};

// Enhanced summary generation with detailed analysis
export const generateSummary = (answers: any[]): string => {
  let summary = '';
  let strengths: string[] = [];
  let improvements: string[] = [];
  let totalTime = 0;
  let answerLengths: number[] = [];
  
  answers.forEach((answer, index) => {
    const answerLength = answer.answer.trim().length;
    answerLengths.push(answerLength);
    totalTime += answer.timeSpent;
    
    // Analyze individual answers
    if (answerLength > 200) {
      strengths.push(`Provided comprehensive answer for Question ${index + 1}`);
    } else if (answerLength < 50) {
      improvements.push(`Question ${index + 1} could benefit from more detailed explanation`);
    }
    
    if (answer.timeSpent < (answer.difficulty === 'easy' ? 10 : answer.difficulty === 'medium' ? 30 : 60)) {
      strengths.push(`Efficient time management on Question ${index + 1}`);
    }
  });
  
  const avgAnswerLength = answerLengths.reduce((a, b) => a + b, 0) / answerLengths.length;
  const avgTime = Math.round(totalTime / answers.length);
  
  summary += `**Interview Performance Summary**\n\n`;
  summary += `• **Total Questions:** ${answers.length}\n`;
  summary += `• **Average Answer Length:** ${Math.round(avgAnswerLength)} characters\n`;
  summary += `• **Average Time per Question:** ${avgTime} seconds\n\n`;
  
  if (strengths.length > 0) {
    summary += `**Strengths:**\n`;
    strengths.slice(0, 3).forEach(strength => {
      summary += `• ${strength}\n`;
    });
    summary += '\n';
  }
  
  if (improvements.length > 0) {
    summary += `**Areas for Improvement:**\n`;
    improvements.slice(0, 3).forEach(improvement => {
      summary += `• ${improvement}\n`;
    });
    summary += '\n';
  }
  
  // Overall assessment
  if (avgAnswerLength > 150) {
    summary += `**Overall:** Demonstrates good communication skills with detailed responses. `;
  } else {
    summary += `**Overall:** Consider providing more comprehensive answers with specific examples. `;
  }
  
  if (totalTime < answers.length * 45) {
    summary += `Excellent time management throughout the interview.`;
  } else {
    summary += `Good time utilization with thoughtful responses.`;
  }
  
  return summary;
};
