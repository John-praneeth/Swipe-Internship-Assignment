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

// Advanced scoring algorithm with detailed analysis
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
      const timeEfficiency = Math.max(0, 1 - (answer.timeSpent / (answer.difficulty === 'easy' ? 20 : answer.difficulty === 'medium' ? 60 : 120)));
      
      // Base score calculation
      let contentScore = 0;
      let structureScore = 0;
      let technicalScore = 0;
      
      // Content quality scoring (40% of total)
      if (answerLength >= 100) contentScore += 0.4;
      if (answerLength >= 200) contentScore += 0.3;
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
      technicalScore = Math.min(1, foundKeywords / Math.max(1, technicalKeywords.length / 2));
      
      // Calculate final question score
      const baseScore = (contentScore * 0.4 + structureScore * 0.3 + technicalScore * 0.3);
      const timeBonus = timeEfficiency * 0.2; // Up to 20% bonus for time efficiency
      questionScore = Math.min(maxQuestionScore, (baseScore + timeBonus) * maxQuestionScore);
      
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
  
  Object.entries(keywordSets).forEach(([category, keywords]) => {
    if (keywords.some(keyword => questionLower.includes(keyword))) {
      relevantKeywords = [...relevantKeywords, ...keywords];
    }
  });
  
  return [...new Set(relevantKeywords)];
};
      const answerText = answer.answer.toLowerCase();
      const answerLength = answer.answer.length;
      const timeSpent = answer.timeSpent;
      const timeLimit = getTimeLimitForDifficulty(answer.difficulty);
      
      // Base score from answer length (30% weight)
      let lengthScore = Math.min(answerLength / 50, 1) * 0.3;
      
      // Time utilization score (20% weight)
      const timeUtilization = Math.min(timeSpent / timeLimit, 1);
      let timeScore = timeUtilization * 0.2;
      
      // Content quality score based on keywords (50% weight)
      let contentScore = 0;
      
      // Keywords and concepts to look for based on difficulty
      const keywordSets = getKeywordsForQuestion(answer.difficulty, answer.question);
      
      keywordSets.forEach(keywords => {
        const foundKeywords = keywords.filter(keyword => 
          answerText.includes(keyword.toLowerCase())
        );
        contentScore += (foundKeywords.length / keywords.length) * 0.1;
      });
      
      contentScore = Math.min(contentScore, 0.5);
      
      // Combine all scores
      const normalizedScore = (lengthScore + timeScore + contentScore);
      questionScore = Math.round(normalizedScore * maxQuestionScore);
      
      // Bonus for comprehensive answers
      if (answerLength > 200 && contentScore > 0.3) {
        questionScore = Math.min(questionScore + 5, maxQuestionScore);
      }
    }
    
    totalScore += questionScore;
  });
  
  // Calculate percentage score
  const finalScore = Math.round((totalScore / maxPossibleScore) * 100);
  return Math.min(finalScore, 100);
};

// Helper function to get time limit based on difficulty
function getTimeLimitForDifficulty(difficulty: string): number {
  switch (difficulty) {
    case 'easy': return 20;
    case 'medium': return 60;
    case 'hard': return 120;
    default: return 60;
  }
}

// Helper function to get relevant keywords for scoring
function getKeywordsForQuestion(difficulty: string, question: string): string[][] {
  const questionLower = question.toLowerCase();
  
  // Define keyword sets for different topics
  const keywordSets: { [key: string]: string[][] } = {
    javascript: [
      ['variable', 'scope', 'hoisting', 'function'],
      ['const', 'let', 'var', 'block'],
      ['closure', 'lexical', 'scope', 'function'],
      ['promise', 'async', 'await', 'callback']
    ],
    react: [
      ['component', 'jsx', 'virtual dom', 'render'],
      ['hooks', 'usestate', 'useeffect', 'lifecycle'],
      ['props', 'state', 'component', 'render'],
      ['performance', 'memo', 'callback', 'optimization']
    ],
    database: [
      ['relational', 'acid', 'consistency', 'transaction'],
      ['nosql', 'document', 'scalability', 'mongodb'],
      ['sql', 'query', 'index', 'join'],
      ['schema', 'normalization', 'relationship']
    ],
    system: [
      ['scalability', 'microservice', 'load balancer', 'cache'],
      ['architecture', 'distributed', 'fault tolerance', 'redundancy'],
      ['database', 'api', 'security', 'authentication'],
      ['performance', 'optimization', 'monitoring', 'logging']
    ]
  };
  
  // Determine relevant keyword sets based on question content
  let relevantSets: string[][] = [];
  
  if (questionLower.includes('javascript') || questionLower.includes('js') || questionLower.includes('closure') || questionLower.includes('var')) {
    relevantSets = keywordSets.javascript;
  } else if (questionLower.includes('react') || questionLower.includes('jsx') || questionLower.includes('hook')) {
    relevantSets = keywordSets.react;
  } else if (questionLower.includes('database') || questionLower.includes('sql') || questionLower.includes('nosql')) {
    relevantSets = keywordSets.database;
  } else if (questionLower.includes('system') || questionLower.includes('architecture') || questionLower.includes('scalable')) {
    relevantSets = keywordSets.system;
  } else {
    // Default keyword set for general programming questions
    relevantSets = [
      ['function', 'method', 'class', 'object'],
      ['performance', 'optimization', 'efficient', 'fast'],
      ['security', 'validation', 'authentication', 'authorization']
    ];
  }
  
  return relevantSets;
}

// Advanced summary generation
export const generateSummary = (answers: any[]): string => {
  const completedAnswers = answers.filter(a => !a.answer.includes('(No answer provided'));
  const skippedCount = answers.length - completedAnswers.length;
  
  let summary = `## Interview Performance Analysis\n\n`;
  
  // Overall completion rate
  const completionRate = (completedAnswers.length / answers.length) * 100;
  summary += `**Completion Rate:** ${completedAnswers.length}/${answers.length} questions (${completionRate.toFixed(1)}%)\n\n`;
  
  if (skippedCount > 0) {
    summary += `⚠️ **Attention:** ${skippedCount} question${skippedCount > 1 ? 's were' : ' was'} skipped due to time constraints.\n\n`;
  }
  
  // Performance by difficulty
  const easyAnswers = answers.filter(a => a.difficulty === 'easy');
  const mediumAnswers = answers.filter(a => a.difficulty === 'medium');
  const hardAnswers = answers.filter(a => a.difficulty === 'hard');
  
  summary += `### Performance Breakdown:\n`;
  summary += `- **Easy Questions:** ${easyAnswers.filter(a => !a.answer.includes('(No answer provided')).length}/${easyAnswers.length} `;
  summary += `${getPerformanceEmoji(easyAnswers.filter(a => !a.answer.includes('(No answer provided')).length, easyAnswers.length)}\n`;
  
  summary += `- **Medium Questions:** ${mediumAnswers.filter(a => !a.answer.includes('(No answer provided')).length}/${mediumAnswers.length} `;
  summary += `${getPerformanceEmoji(mediumAnswers.filter(a => !a.answer.includes('(No answer provided')).length, mediumAnswers.length)}\n`;
  
  summary += `- **Hard Questions:** ${hardAnswers.filter(a => !a.answer.includes('(No answer provided')).length}/${hardAnswers.length} `;
  summary += `${getPerformanceEmoji(hardAnswers.filter(a => !a.answer.includes('(No answer provided')).length, hardAnswers.length)}\n\n`;
  
  // Answer quality analysis
  const averageAnswerLength = completedAnswers.reduce((sum, a) => sum + a.answer.length, 0) / completedAnswers.length || 0;
  const totalTimeSpent = completedAnswers.reduce((sum, a) => sum + a.timeSpent, 0);
  const averageTimePerAnswer = totalTimeSpent / completedAnswers.length || 0;
  
  summary += `### Answer Quality Insights:\n`;
  
  if (averageAnswerLength > 200) {
    summary += `✅ **Comprehensive Responses:** Candidate provided detailed answers (avg. ${Math.round(averageAnswerLength)} characters), demonstrating thorough understanding.\n`;
  } else if (averageAnswerLength > 100) {
    summary += `📝 **Moderate Detail:** Answers were adequately detailed (avg. ${Math.round(averageAnswerLength)} characters), with room for more elaboration.\n`;
  } else if (averageAnswerLength > 50) {
    summary += `⚡ **Concise Answers:** Brief but focused responses (avg. ${Math.round(averageAnswerLength)} characters), could benefit from more examples.\n`;
  } else {
    summary += `🔍 **Limited Elaboration:** Very brief answers (avg. ${Math.round(averageAnswerLength)} characters), lacking detail and examples.\n`;
  }
  
  // Time management analysis
  summary += `\n**Time Management:** Average ${Math.round(averageTimePerAnswer)}s per question. `;
  if (averageTimePerAnswer > 45) {
    summary += `Good time utilization, thoughtful consideration of answers.`;
  } else if (averageTimePerAnswer > 20) {
    summary += `Efficient time management with adequate consideration.`;
  } else {
    summary += `Very quick responses - could benefit from more detailed analysis.`;
  }
  
  // Technical assessment
  const technicalKeywords = ['function', 'component', 'database', 'api', 'algorithm', 'performance', 'security', 'scalability'];
  const technicalMentions = completedAnswers.reduce((count, answer) => {
    return count + technicalKeywords.filter(keyword => 
      answer.answer.toLowerCase().includes(keyword)
    ).length;
  }, 0);
  
  summary += `\n\n### Technical Knowledge Assessment:\n`;
  if (technicalMentions > 10) {
    summary += `🎯 **Strong Technical Vocabulary:** Demonstrated solid understanding of technical concepts and terminology.\n`;
  } else if (technicalMentions > 5) {
    summary += `💡 **Good Technical Understanding:** Shows familiarity with relevant technical concepts.\n`;
  } else {
    summary += `📚 **Basic Technical Knowledge:** Limited use of technical terminology, may benefit from deeper technical study.\n`;
  }
  
  // Overall recommendation
  const overallScore = generateFinalScore(answers);
  summary += `\n### Overall Assessment:\n`;
  if (overallScore >= 80) {
    summary += `🌟 **Excellent Performance:** Strong candidate with comprehensive knowledge and good communication skills. Recommended for next interview round.`;
  } else if (overallScore >= 60) {
    summary += `✅ **Good Performance:** Solid candidate with decent technical knowledge. Consider for technical assessment or pair programming session.`;
  } else if (overallScore >= 40) {
    summary += `⚠️ **Average Performance:** Shows potential but needs improvement in technical depth and communication. Consider for junior positions with mentoring.`;
  } else {
    summary += `❌ **Below Expectations:** Significant gaps in technical knowledge and communication. Requires substantial improvement before proceeding.`;
  }
  
  return summary;
};

// Helper function to get performance emoji
function getPerformanceEmoji(completed: number, total: number): string {
  const rate = completed / total;
  if (rate === 1) return '🎯';
  if (rate >= 0.5) return '👍';
  return '💡';
}
