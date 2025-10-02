import { CodingQuestion } from './advancedQuestionBank';

// Dynamic question generator for creating variations
export class QuestionGenerator {
  
  // Generate system design questions based on real-world scenarios
  static generateSystemDesignQuestion(scenario: string, difficulty: 'Easy' | 'Medium' | 'Hard'): CodingQuestion {
    const scenarios = {
      'chat-system': {
        title: 'Design a Scalable Chat System',
        description: `Design a real-time chat system that supports:
1. One-on-one messaging
2. Group chats (up to 100 users)
3. Message history and search
4. Online presence indicators
5. File sharing capabilities
6. Push notifications

Consider scalability for 10M+ users and handle network partitions gracefully.`,
        constraints: [
          'Support 10M+ concurrent users',
          'Message delivery latency < 100ms',
          '99.9% uptime requirement',
          'Handle network partitions',
          'Support multimedia messages'
        ]
      },
      'payment-system': {
        title: 'Design a Secure Payment Processing System',
        description: `Design a payment system that handles:
1. Multiple payment methods (cards, wallets, bank transfers)
2. Multi-currency support
3. Fraud detection and prevention
4. PCI-DSS compliance
5. Real-time transaction processing
6. Dispute and chargeback handling

Ensure ACID properties and handle high transaction volumes.`,
        constraints: [
          'PCI-DSS Level 1 compliance',
          'Process 100K+ transactions/minute',
          'Support 50+ currencies',
          'Fraud detection < 50ms',
          '99.99% transaction success rate'
        ]
      },
      'video-streaming': {
        title: 'Design a Video Streaming Platform',
        description: `Design a video streaming service like Netflix that supports:
1. Video upload and encoding
2. Content delivery network (CDN)
3. Adaptive bitrate streaming
4. User recommendations
5. Content search and discovery
6. Offline viewing capabilities

Handle global scale with millions of concurrent viewers.`,
        constraints: [
          'Support 100M+ concurrent streams',
          'Video startup time < 2 seconds',
          'Global CDN coverage',
          'Multiple video qualities',
          'Recommendation latency < 100ms'
        ]
      }
    };

    const scenarioData = scenarios[scenario as keyof typeof scenarios];
    const timeLimit = difficulty === 'Easy' ? 30 : difficulty === 'Medium' ? 45 : 60;

    return {
      id: `system_design_${scenario}_${Date.now()}`,
      title: scenarioData.title,
      difficulty,
      category: 'System Design',
      timeLimit,
      description: scenarioData.description,
      examples: [],
      constraints: scenarioData.constraints,
      hints: this.generateSystemDesignHints(scenario, difficulty),
      followUpQuestions: this.generateFollowUpQuestions(scenario),
      edgeCases: this.generateEdgeCases(scenario),
      securityConsiderations: this.generateSecurityConsiderations(scenario),
      performanceRequirements: 'Design for high availability and scalability',
      testCases: []
    };
  }

  // Generate algorithm questions with varying complexity
  static generateAlgorithmQuestion(type: string, difficulty: 'Easy' | 'Medium' | 'Hard'): CodingQuestion {
    const algorithms = {
      'graph-traversal': {
        easy: {
          title: 'Find Connected Components in Graph',
          description: 'Given an undirected graph, find the number of connected components.',
          timeComplexity: 'O(V + E)',
          spaceComplexity: 'O(V)'
        },
        medium: {
          title: 'Shortest Path in Weighted Graph',
          description: 'Implement Dijkstra\'s algorithm to find shortest path between two nodes.',
          timeComplexity: 'O((V + E) log V)',
          spaceComplexity: 'O(V)'
        },
        hard: {
          title: 'Minimum Spanning Tree with Constraints',
          description: 'Find MST where certain edges must be included and others excluded.',
          timeComplexity: 'O(E log V)',
          spaceComplexity: 'O(V)'
        }
      },
      'dynamic-programming': {
        easy: {
          title: 'Fibonacci with Memoization',
          description: 'Calculate nth Fibonacci number efficiently using dynamic programming.',
          timeComplexity: 'O(n)',
          spaceComplexity: 'O(n)'
        },
        medium: {
          title: 'Longest Common Subsequence',
          description: 'Find the length of longest common subsequence between two strings.',
          timeComplexity: 'O(m * n)',
          spaceComplexity: 'O(m * n)'
        },
        hard: {
          title: 'Edit Distance with Custom Operations',
          description: 'Calculate minimum edit distance with custom operation costs.',
          timeComplexity: 'O(m * n)',
          spaceComplexity: 'O(m * n)'
        }
      }
    };

    const algorithmType = algorithms[type as keyof typeof algorithms];
    const problemData = algorithmType[difficulty.toLowerCase() as keyof typeof algorithmType];
    
    return {
      id: `algorithm_${type}_${difficulty.toLowerCase()}_${Date.now()}`,
      title: problemData.title,
      difficulty,
      category: 'DSA',
      timeLimit: difficulty === 'Easy' ? 20 : difficulty === 'Medium' ? 30 : 45,
      description: problemData.description,
      examples: this.generateAlgorithmExamples(type, difficulty),
      constraints: this.generateAlgorithmConstraints(type, difficulty),
      hints: this.generateAlgorithmHints(type, difficulty),
      followUpQuestions: [
        'What is the time and space complexity of your solution?',
        'How would you optimize for different input sizes?',
        'What are the trade-offs of your approach?'
      ],
      edgeCases: this.generateAlgorithmEdgeCases(type),
      securityConsiderations: [
        'Input validation for large datasets',
        'Prevention of stack overflow in recursive solutions',
        'Memory usage limits for large inputs'
      ],
      performanceRequirements: `${problemData.timeComplexity} time, ${problemData.spaceComplexity} space`,
      starterCode: this.generateStarterCode(type, difficulty),
      testCases: this.generateTestCases(type, difficulty)
    };
  }

  // Generate security-focused questions
  static generateSecurityQuestion(focus: string, difficulty: 'Easy' | 'Medium' | 'Hard'): CodingQuestion {
    const securityTopics = {
      'authentication': {
        title: 'Implement Secure Authentication System',
        description: `Create a secure authentication system with:
1. Password hashing and salting
2. JWT token management
3. Rate limiting for login attempts
4. Multi-factor authentication
5. Session management
6. Password reset functionality

Focus on preventing common attacks like brute force, session hijacking, and token theft.`,
        securityFocus: [
          'Secure password storage with bcrypt/scrypt',
          'JWT token security and rotation',
          'Rate limiting and account lockout',
          'CSRF protection',
          'Secure session management'
        ]
      },
      'input-validation': {
        title: 'Secure Input Validation and Sanitization',
        description: `Implement comprehensive input validation that prevents:
1. SQL injection attacks
2. XSS (Cross-Site Scripting)
3. Command injection
4. Path traversal attacks
5. Buffer overflow vulnerabilities
6. NoSQL injection

Create a validation framework that can be used across different input types.`,
        securityFocus: [
          'SQL injection prevention',
          'XSS protection through encoding',
          'Command injection mitigation',
          'Input length and type validation',
          'Whitelist-based validation'
        ]
      }
    };

    const topic = securityTopics[focus as keyof typeof securityTopics];
    
    return {
      id: `security_${focus}_${difficulty.toLowerCase()}_${Date.now()}`,
      title: topic.title,
      difficulty,
      category: 'Security',
      timeLimit: difficulty === 'Easy' ? 25 : difficulty === 'Medium' ? 35 : 50,
      description: topic.description,
      examples: this.generateSecurityExamples(focus),
      constraints: [
        'Must prevent all common injection attacks',
        'Performance impact < 10ms per validation',
        'Support for internationalization',
        'Configurable validation rules'
      ],
      hints: this.generateSecurityHints(focus, difficulty),
      followUpQuestions: [
        'How would you handle zero-day vulnerabilities?',
        'What logging and monitoring would you implement?',
        'How would you ensure compliance with security standards?',
        'What are the performance implications of your security measures?'
      ],
      edgeCases: this.generateSecurityEdgeCases(focus),
      securityConsiderations: topic.securityFocus,
      performanceRequirements: 'Minimal performance impact while maintaining security',
      testCases: this.generateSecurityTestCases(focus)
    };
  }

  // Helper methods for generating content
  private static generateSystemDesignHints(_scenario: string, difficulty: string) {
    const baseHints = [
      { level: 1, hint: 'Start with identifying the core components and their interactions' },
      { level: 2, hint: 'Consider data storage requirements and access patterns' },
      { level: 3, hint: 'Think about scalability bottlenecks and how to address them' }
    ];

    if (difficulty === 'Hard') {
      baseHints.push(
        { level: 4, hint: 'Consider fault tolerance and disaster recovery strategies' },
        { level: 5, hint: 'Think about monitoring, logging, and observability' }
      );
    }

    return baseHints;
  }

  private static generateFollowUpQuestions(scenario: string): string[] {
    const common = [
      'How would you handle system failures and ensure high availability?',
      'What monitoring and alerting would you implement?',
      'How would you optimize for different geographic regions?'
    ];

    const specific = {
      'chat-system': [
        'How would you implement end-to-end encryption?',
        'How would you handle message ordering in distributed systems?'
      ],
      'payment-system': [
        'How would you handle payment processor failures?',
        'What fraud detection algorithms would you implement?'
      ],
      'video-streaming': [
        'How would you optimize video encoding for different devices?',
        'How would you implement content recommendation algorithms?'
      ]
    };

    return [...common, ...(specific[scenario as keyof typeof specific] || [])];
  }

  private static generateEdgeCases(_scenario: string): string[] {
    return [
      'Network partitions and split-brain scenarios',
      'Database failover and data consistency',
      'Sudden traffic spikes (10x normal load)',
      'Third-party service outages',
      'Data center failures'
    ];
  }

  private static generateSecurityConsiderations(_scenario: string): string[] {
    return [
      'Authentication and authorization mechanisms',
      'Data encryption in transit and at rest',
      'Rate limiting and DDoS protection',
      'Input validation and sanitization',
      'Audit logging and compliance'
    ];
  }

  private static generateAlgorithmExamples(_type: string, _difficulty: string) {
    // Generate appropriate examples based on algorithm type and difficulty
    return [
      {
        input: 'Example input based on algorithm type',
        output: 'Expected output',
        explanation: 'Step-by-step explanation of the algorithm'
      }
    ];
  }

  private static generateAlgorithmConstraints(_type: string, difficulty: string): string[] {
    const base = ['1 ≤ n ≤ 10^5', 'All inputs are valid'];
    
    if (difficulty === 'Hard') {
      base.push('Memory limit: 256MB', 'Time limit: 2 seconds');
    }
    
    return base;
  }

  private static generateAlgorithmHints(_type: string, _difficulty: string) {
    return [
      { level: 1, hint: 'Consider the optimal data structure for this problem' },
      { level: 2, hint: 'Think about the time-space trade-offs' },
      { level: 3, hint: 'Look for patterns or subproblems that can be optimized' }
    ];
  }

  private static generateAlgorithmEdgeCases(_type: string): string[] {
    return [
      'Empty input arrays or strings',
      'Single element inputs',
      'Maximum constraint values',
      'Negative numbers (if applicable)',
      'Duplicate elements'
    ];
  }

  private static generateStarterCode(_type: string, _difficulty: string) {
    return {
      javascript: `
function solve(input) {
  // Implement your solution here
  return result;
}
      `,
      python: `
def solve(input):
    # Implement your solution here
    return result
      `,
      java: `
public class Solution {
    public int solve(int[] input) {
        // Implement your solution here
        return result;
    }
}
      `
    };
  }

  private static generateTestCases(_type: string, _difficulty: string) {
    return [
      {
        input: [1, 2, 3, 4, 5],
        expectedOutput: 15,
        isHidden: false
      },
      {
        input: [],
        expectedOutput: 0,
        isHidden: true
      }
    ];
  }

  private static generateSecurityExamples(_focus: string) {
    return [
      {
        input: 'validateInput("user@example.com", "password123")',
        output: '{isValid: true, sanitized: "user@example.com"}',
        explanation: 'Valid input passes validation and is sanitized'
      }
    ];
  }

  private static generateSecurityHints(_focus: string, _difficulty: string) {
    return [
      { level: 1, hint: 'Use whitelist validation instead of blacklist' },
      { level: 2, hint: 'Implement proper encoding for output contexts' },
      { level: 3, hint: 'Consider using parameterized queries for database operations' }
    ];
  }

  private static generateSecurityEdgeCases(_focus: string): string[] {
    return [
      'Malicious script injection attempts',
      'SQL injection with various payloads',
      'Unicode and encoding edge cases',
      'Very long input strings (DoS attempts)',
      'Null bytes and special characters'
    ];
  }

  private static generateSecurityTestCases(_focus: string) {
    return [
      {
        input: { email: 'test@example.com', password: 'ValidPass123!' },
        expectedOutput: { isValid: true, errors: [] },
        isHidden: false
      },
      {
        input: { email: 'test@example.com', password: '<script>alert("xss")</script>' },
        expectedOutput: { isValid: false, errors: ['Invalid characters in password'] },
        isHidden: true
      }
    ];
  }
}

// Question difficulty progression system
export class DifficultyProgression {
  static getNextQuestion(
    currentDifficulty: string,
    performance: number,
    _category: string
  ): { difficulty: string; suggestion: string } {
    
    if (performance >= 80) {
      // Excellent performance - increase difficulty
      if (currentDifficulty === 'Easy') {
        return { difficulty: 'Medium', suggestion: 'Great job! Ready for medium difficulty.' };
      } else if (currentDifficulty === 'Medium') {
        return { difficulty: 'Hard', suggestion: 'Excellent! Try a hard problem.' };
      } else {
        return { difficulty: 'Hard', suggestion: 'Outstanding! Continue with hard problems.' };
      }
    } else if (performance >= 60) {
      // Good performance - maintain or slightly increase
      return { difficulty: currentDifficulty, suggestion: 'Good work! Try another at this level.' };
    } else {
      // Poor performance - decrease difficulty or provide more practice
      if (currentDifficulty === 'Hard') {
        return { difficulty: 'Medium', suggestion: 'Let\'s try a medium problem to build confidence.' };
      } else if (currentDifficulty === 'Medium') {
        return { difficulty: 'Easy', suggestion: 'Practice with easier problems first.' };
      } else {
        return { difficulty: 'Easy', suggestion: 'Keep practicing! You\'ll improve with time.' };
      }
    }
  }

  static getPersonalizedFeedback(
    performance: number,
    timeSpent: number,
    hintsUsed: number,
    _attempts: number
  ): string {
    let feedback = '';

    // Performance feedback
    if (performance >= 90) {
      feedback += '🌟 Outstanding performance! You\'re ready for senior-level challenges.\n';
    } else if (performance >= 80) {
      feedback += '🎯 Excellent work! You have strong problem-solving skills.\n';
    } else if (performance >= 70) {
      feedback += '👍 Good job! Focus on optimization and edge cases.\n';
    } else if (performance >= 60) {
      feedback += '📚 Decent attempt. Review the concepts and try similar problems.\n';
    } else {
      feedback += '💪 Keep practicing! Break down problems into smaller steps.\n';
    }

    // Time management feedback
    if (timeSpent < 300) { // Less than 5 minutes
      feedback += '⚡ Impressive speed! Make sure to consider all edge cases.\n';
    } else if (timeSpent > 1800) { // More than 30 minutes
      feedback += '🕐 Take time to plan your approach before coding.\n';
    }

    // Hint usage feedback
    if (hintsUsed === 0) {
      feedback += '🧠 Great independent problem-solving!\n';
    } else if (hintsUsed > 3) {
      feedback += '💡 Consider studying similar problem patterns.\n';
    }

    return feedback;
  }
}

export default QuestionGenerator;