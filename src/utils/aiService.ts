import { Question } from '../types';

// Advanced AI service for generating questions, scores, and summaries
// In a real application, these would call actual AI APIs like OpenAI GPT-4, Claude, etc.

export const generateQuestions = (): Question[] => {
  const questionPools = {
    easy: [
      {
        id: 'easy_1',
        text: 'What does HTML stand for?',
        difficulty: 'easy' as const,
        timeLimit: 30,
        category: 'Web Fundamentals',
        type: 'multiple-choice' as const,
        options: [
          'Hyper Text Markup Language',
          'High Tech Modern Language',
          'Home Tool Markup Language',
          'Hyperlink and Text Markup Language'
        ],
        correctAnswer: 'Hyper Text Markup Language',
        explanation: 'HTML stands for Hyper Text Markup Language, which is the standard markup language for creating web pages.'
      },
      {
        id: 'easy_2',
        text: 'Which of the following is NOT a JavaScript data type?',
        difficulty: 'easy' as const,
        timeLimit: 30,
        category: 'JavaScript Fundamentals',
        type: 'multiple-choice' as const,
        options: [
          'String',
          'Boolean',
          'Float',
          'Number'
        ],
        correctAnswer: 'Float',
        explanation: 'JavaScript has Number type for all numeric values. There is no separate Float type.'
      },
      {
        id: 'easy_3',
        text: 'What is the correct way to declare a variable in JavaScript (ES6+)?',
        difficulty: 'easy' as const,
        timeLimit: 30,
        category: 'JavaScript Fundamentals',
        type: 'multiple-choice' as const,
        options: [
          'var myVariable = 5;',
          'let myVariable = 5;',
          'const myVariable = 5;',
          'Both let and const are correct'
        ],
        correctAnswer: 'Both let and const are correct',
        explanation: 'Both let and const are modern ways to declare variables in ES6+. Use const for constants and let for variables that will change.'
      },
      {
        id: 'easy_4',
        text: 'Which CSS property is used to change the text color?',
        difficulty: 'easy' as const,
        timeLimit: 30,
        category: 'CSS Basics',
        type: 'multiple-choice' as const,
        options: [
          'text-color',
          'font-color',
          'color',
          'text-style'
        ],
        correctAnswer: 'color',
        explanation: 'The CSS color property is used to set the color of text.'
      },
      {
        id: 'easy_5',
        text: 'What does CSS stand for?',
        difficulty: 'easy' as const,
        timeLimit: 30,
        category: 'CSS Basics',
        type: 'multiple-choice' as const,
        options: [
          'Computer Style Sheets',
          'Cascading Style Sheets',
          'Creative Style Sheets',
          'Colorful Style Sheets'
        ],
        correctAnswer: 'Cascading Style Sheets',
        explanation: 'CSS stands for Cascading Style Sheets, used for styling web pages.'
      }
    ],
    medium: [
      {
        id: 'medium_1',
        text: 'What is the purpose of the useEffect hook in React?',
        difficulty: 'medium' as const,
        timeLimit: 30,
        category: 'React Hooks',
        type: 'multiple-choice' as const,
        options: [
          'To manage component state',
          'To perform side effects in functional components',
          'To create custom hooks',
          'To handle form submissions'
        ],
        correctAnswer: 'To perform side effects in functional components',
        explanation: 'useEffect is used to perform side effects like API calls, subscriptions, or manually changing the DOM in React functional components.'
      },
      {
        id: 'medium_2',
        text: 'Which HTTP method is typically used to update existing data?',
        difficulty: 'medium' as const,
        timeLimit: 30,
        category: 'Web APIs',
        type: 'multiple-choice' as const,
        options: [
          'GET',
          'POST',
          'PUT',
          'DELETE'
        ],
        correctAnswer: 'PUT',
        explanation: 'PUT is typically used to update existing resources, while POST creates new resources.'
      },
      {
        id: 'medium_3',
        text: 'What is the difference between == and === in JavaScript?',
        difficulty: 'medium' as const,
        timeLimit: 30,
        category: 'JavaScript Fundamentals',
        type: 'multiple-choice' as const,
        options: [
          '== checks type and value, === checks only value',
          '== checks only value, === checks type and value',
          'They are exactly the same',
          '== is faster than ==='
        ],
        correctAnswer: '== checks only value, === checks type and value',
        explanation: '== performs type coercion and compares values, while === compares both type and value without coercion.'
      },
      {
        id: 'medium_4',
        text: 'Which of the following is a NoSQL database?',
        difficulty: 'medium' as const,
        timeLimit: 30,
        category: 'Database Systems',
        type: 'multiple-choice' as const,
        options: [
          'MySQL',
          'PostgreSQL',
          'MongoDB',
          'SQLite'
        ],
        correctAnswer: 'MongoDB',
        explanation: 'MongoDB is a popular NoSQL document database, while the others are SQL databases.'
      },
      {
        id: 'medium_5',
        text: 'What is the purpose of async/await in JavaScript?',
        difficulty: 'medium' as const,
        timeLimit: 30,
        category: 'Asynchronous JavaScript',
        type: 'multiple-choice' as const,
        options: [
          'To make code run faster',
          'To handle asynchronous operations more readably',
          'To create multiple threads',
          'To handle errors automatically'
        ],
        correctAnswer: 'To handle asynchronous operations more readably',
        explanation: 'async/await provides a cleaner, more readable way to handle asynchronous operations compared to callbacks or promise chains.'
      }
    ],
    hard: [
      {
        id: 'hard_1',
        text: 'What is the time complexity of searching in a balanced binary search tree?',
        difficulty: 'hard' as const,
        timeLimit: 30,
        category: 'Data Structures & Algorithms',
        type: 'multiple-choice' as const,
        options: [
          'O(1)',
          'O(log n)',
          'O(n)',
          'O(n log n)'
        ],
        correctAnswer: 'O(log n)',
        explanation: 'In a balanced BST, search operations have O(log n) time complexity because we can eliminate half the nodes at each level.'
      },
      {
        id: 'hard_2',
        text: 'Which design pattern is commonly used for managing application state in large React applications?',
        difficulty: 'hard' as const,
        timeLimit: 30,
        category: 'React Architecture',
        type: 'multiple-choice' as const,
        options: [
          'Singleton Pattern',
          'Observer Pattern',
          'Flux/Redux Pattern',
          'Factory Pattern'
        ],
        correctAnswer: 'Flux/Redux Pattern',
        explanation: 'The Flux architecture pattern, implemented by Redux, provides predictable state management for large React applications.'
      },
      {
        id: 'hard_3',
        text: 'What is the main advantage of using a CDN (Content Delivery Network)?',
        difficulty: 'hard' as const,
        timeLimit: 30,
        category: 'Web Performance',
        type: 'multiple-choice' as const,
        options: [
          'Reduces server costs',
          'Improves security',
          'Reduces latency by serving content from geographically closer servers',
          'Automatically optimizes images'
        ],
        correctAnswer: 'Reduces latency by serving content from geographically closer servers',
        explanation: 'CDNs cache content on servers distributed globally, serving users from the nearest location to reduce latency.'
      },
      {
        id: 'hard_4',
        text: 'In microservices architecture, what is the purpose of an API Gateway?',
        difficulty: 'hard' as const,
        timeLimit: 30,
        category: 'System Architecture',
        type: 'multiple-choice' as const,
        options: [
          'To store data',
          'To provide a single entry point and handle cross-cutting concerns',
          'To replace databases',
          'To compile code'
        ],
        correctAnswer: 'To provide a single entry point and handle cross-cutting concerns',
        explanation: 'An API Gateway acts as a single entry point for clients and handles concerns like authentication, rate limiting, and request routing.'
      },
      {
        id: 'hard_5',
        text: 'What is the CAP theorem in distributed systems?',
        difficulty: 'hard' as const,
        timeLimit: 30,
        category: 'Distributed Systems',
        type: 'multiple-choice' as const,
        options: [
          'Consistency, Availability, Performance',
          'Consistency, Availability, Partition tolerance',
          'Concurrency, Availability, Performance',
          'Consistency, Accuracy, Partition tolerance'
        ],
        correctAnswer: 'Consistency, Availability, Partition tolerance',
        explanation: 'CAP theorem states that distributed systems can only guarantee two out of three: Consistency, Availability, and Partition tolerance.'
      }
    ]
  };

  // Randomly select 2 questions from each difficulty level (6 total)
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

// Enhanced scoring algorithm with support for multiple choice questions
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
    } else if (answer.isCorrect !== undefined) {
      // Multiple choice question - binary scoring
      if (answer.isCorrect) {
        questionScore = maxQuestionScore;
      } else {
        // Partial credit for attempting
        questionScore = Math.round(maxQuestionScore * 0.1);
      }
    } else {
      // Text-based question - enhanced scoring based on multiple factors
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
