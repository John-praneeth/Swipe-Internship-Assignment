import { CandidateInfo, ProjectInfo } from './resumeParser';
import { CodingQuestion } from './simpleQuestionBank';

export class ProjectBasedQuestionGenerator {
  
  // Generate questions based on candidate's projects
  static generateProjectQuestions(candidateInfo: CandidateInfo): CodingQuestion[] {
    const questions: CodingQuestion[] = [];
    
    // Generate questions for each project
    candidateInfo.projects.forEach((project, index) => {
      const projectQuestions = this.generateQuestionsForProject(project, index);
      questions.push(...projectQuestions);
    });
    
    // Generate skill-based questions
    const skillQuestions = this.generateSkillBasedQuestions(candidateInfo.skills);
    questions.push(...skillQuestions);
    
    // Generate experience-based questions
    const experienceQuestions = this.generateExperienceBasedQuestions(candidateInfo.experience);
    questions.push(...experienceQuestions);
    
    return questions;
  }
  
  private static generateQuestionsForProject(project: ProjectInfo, index: number): CodingQuestion[] {
    const questions: CodingQuestion[] = [];
    
    // General project discussion question
    questions.push({
      id: `project_${index}_overview`,
      title: `Tell me about your ${project.title} project`,
      difficulty: 'Easy',
      category: 'OOP',
      timeLimit: 10,
      description: `I see you worked on "${project.title}". Can you walk me through:
1. What problem this project solves
2. Your role and responsibilities
3. The most challenging part you faced
4. What you learned from this project
5. How you would improve it if you had more time

Project Description: ${project.description}
Technologies Used: ${project.technologies.join(', ')}`,
      examples: [],
      constraints: [],
      hints: [
        { level: 1, hint: 'Focus on your specific contributions and technical decisions' },
        { level: 2, hint: 'Mention any challenges you overcame and lessons learned' }
      ],
      followUpQuestions: [
        'What was the most difficult bug you encountered in this project?',
        'How did you handle version control and collaboration?',
        'What would you do differently if you started this project again?'
      ],
      edgeCases: [],
      securityConsiderations: [],
      performanceRequirements: 'Clear communication and technical depth',
      testCases: []
    });
    
    // Technology-specific questions based on project tech stack
    project.technologies.forEach(tech => {
      const techQuestion = this.generateTechnologyQuestion(tech, project, index);
      if (techQuestion) {
        questions.push(techQuestion);
      }
    });
    
    return questions;
  }
  
  private static generateTechnologyQuestion(
    technology: string, 
    project: ProjectInfo, 
    projectIndex: number
  ): CodingQuestion | null {
    
    const techLower = technology.toLowerCase();
    
    // React-specific questions
    if (techLower.includes('react')) {
      return {
        id: `project_${projectIndex}_react`,
        title: `React Implementation in ${project.title}`,
        difficulty: 'Medium',
        category: 'OOP',
        timeLimit: 15,
        description: `Since you used React in your ${project.title} project, let's discuss:

1. How did you structure your React components?
2. Did you use functional or class components? Why?
3. How did you manage state in your application?
4. Did you use any React hooks? Which ones and why?
5. How did you handle API calls and data fetching?

Please provide a code example of a key component from your project.`,
        examples: [
          {
            input: 'Component structure example',
            output: 'Well-organized React component with proper state management',
            explanation: 'Show understanding of React best practices'
          }
        ],
        constraints: [
          'Use modern React patterns (hooks, functional components)',
          'Show proper component organization',
          'Demonstrate state management understanding'
        ],
        hints: [
          { level: 1, hint: 'Think about component reusability and separation of concerns' },
          { level: 2, hint: 'Consider how you handled side effects and API calls' }
        ],
        followUpQuestions: [
          'How did you optimize performance in your React app?',
          'Did you use any state management libraries like Redux?',
          'How did you handle routing in your application?'
        ],
        edgeCases: [],
        securityConsiderations: ['Input validation', 'XSS prevention'],
        performanceRequirements: 'Demonstrate React best practices',
        starterCode: {
          javascript: `
// Describe a key React component from your ${project.title} project
import React, { useState, useEffect } from 'react';

const YourComponent = () => {
  // Your implementation here
  
  return (
    <div>
      {/* Your JSX here */}
    </div>
  );
};

export default YourComponent;
          `,
          python: `# This question is specific to React/JavaScript`,
          java: `// This question is specific to React/JavaScript`
        },
        testCases: []
      };
    }
    
    // Node.js/Backend questions
    if (techLower.includes('node') || techLower.includes('express')) {
      return {
        id: `project_${projectIndex}_backend`,
        title: `Backend Architecture in ${project.title}`,
        difficulty: 'Medium',
        category: 'API',
        timeLimit: 15,
        description: `You mentioned using ${technology} in ${project.title}. Let's discuss:

1. How did you structure your backend API?
2. What database did you use and why?
3. How did you handle authentication and authorization?
4. Did you implement any middleware? What for?
5. How did you handle errors and logging?

Please show an example of an API endpoint from your project.`,
        examples: [
          {
            input: 'API endpoint example',
            output: 'Well-structured REST endpoint with proper error handling',
            explanation: 'Demonstrate backend development skills'
          }
        ],
        constraints: [
          'Follow REST API conventions',
          'Include proper error handling',
          'Show security considerations'
        ],
        hints: [
          { level: 1, hint: 'Think about API design principles and HTTP status codes' },
          { level: 2, hint: 'Consider middleware for cross-cutting concerns' }
        ],
        followUpQuestions: [
          'How did you handle database connections and queries?',
          'What security measures did you implement?',
          'How did you test your API endpoints?'
        ],
        edgeCases: [],
        securityConsiderations: ['Input validation', 'SQL injection prevention', 'Authentication'],
        performanceRequirements: 'Demonstrate backend best practices',
        starterCode: {
          javascript: `
// Example API endpoint from your ${project.title} project
const express = require('express');
const router = express.Router();

// Your endpoint implementation
router.get('/your-endpoint', async (req, res) => {
  try {
    // Your logic here
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
          `,
          python: `
# Example API endpoint using Flask/FastAPI
from flask import Flask, jsonify, request

app = Flask(__name__)

@app.route('/your-endpoint', methods=['GET'])
def your_endpoint():
    try:
        # Your logic here
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
          `,
          java: `
// Example Spring Boot controller
@RestController
@RequestMapping("/api")
public class YourController {
    
    @GetMapping("/your-endpoint")
    public ResponseEntity<?> yourEndpoint() {
        try {
            // Your logic here
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }
}
          `
        },
        testCases: []
      };
    }
    
    // Database questions
    if (techLower.includes('sql') || techLower.includes('mysql') || 
        techLower.includes('postgres') || techLower.includes('mongodb')) {
      return {
        id: `project_${projectIndex}_database`,
        title: `Database Design in ${project.title}`,
        difficulty: 'Medium',
        category: 'Database',
        timeLimit: 15,
        description: `You used ${technology} in your ${project.title} project. Let's discuss:

1. How did you design your database schema?
2. What were the main entities and relationships?
3. Did you face any performance issues? How did you solve them?
4. How did you handle data validation and constraints?
5. Did you use any ORM or write raw queries?

Please provide an example of a key database query or schema from your project.`,
        examples: [
          {
            input: 'Database schema or query example',
            output: 'Well-designed schema with proper relationships',
            explanation: 'Show database design understanding'
          }
        ],
        constraints: [
          'Follow database normalization principles',
          'Include proper indexing considerations',
          'Show understanding of relationships'
        ],
        hints: [
          { level: 1, hint: 'Think about data relationships and normalization' },
          { level: 2, hint: 'Consider performance implications of your design' }
        ],
        followUpQuestions: [
          'How did you handle database migrations?',
          'What indexing strategy did you use?',
          'How did you ensure data consistency?'
        ],
        edgeCases: [],
        securityConsiderations: ['SQL injection prevention', 'Data encryption', 'Access control'],
        performanceRequirements: 'Demonstrate database design principles',
        starterCode: {
          javascript: `
-- Example database schema or query from your ${project.title} project
-- Describe your table structure and key relationships

CREATE TABLE your_table (
  id INT PRIMARY KEY AUTO_INCREMENT,
  -- Your columns here
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Example query
SELECT * FROM your_table WHERE condition;
          `,
          python: `
-- Example database schema or query from your ${project.title} project
-- Describe your table structure and key relationships

CREATE TABLE your_table (
  id INT PRIMARY KEY AUTO_INCREMENT,
  -- Your columns here
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Example query
SELECT * FROM your_table WHERE condition;
          `,
          java: `
-- Example database schema or query from your ${project.title} project
-- Describe your table structure and key relationships

CREATE TABLE your_table (
  id INT PRIMARY KEY AUTO_INCREMENT,
  -- Your columns here
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Example query
SELECT * FROM your_table WHERE condition;
          `
        },
        testCases: []
      };
    }
    
    return null;
  }
  
  private static generateSkillBasedQuestions(skills: string[]): CodingQuestion[] {
    const questions: CodingQuestion[] = [];
    
    // Generate simple coding questions based on skills
    if (skills.some(skill => skill.toLowerCase().includes('javascript') || 
                            skill.toLowerCase().includes('js'))) {
      questions.push(this.generateSimpleJavaScriptQuestion());
    }
    
    if (skills.some(skill => skill.toLowerCase().includes('python'))) {
      questions.push(this.generateSimplePythonQuestion());
    }
    
    if (skills.some(skill => skill.toLowerCase().includes('sql') || 
                            skill.toLowerCase().includes('database'))) {
      questions.push(this.generateSimpleSQLQuestion());
    }
    
    return questions;
  }
  
  private static generateSimpleJavaScriptQuestion(): CodingQuestion {
    return {
      id: 'simple_js_array',
      title: 'Array Manipulation - Find Maximum',
      difficulty: 'Easy',
      category: 'DSA',
      timeLimit: 10,
      description: `Write a function that finds the maximum number in an array.

Requirements:
- Handle empty arrays (return null)
- Handle arrays with negative numbers
- Don't use built-in Math.max()`,
      examples: [
        {
          input: '[1, 5, 3, 9, 2]',
          output: '9',
          explanation: '9 is the largest number in the array'
        },
        {
          input: '[-1, -5, -3]',
          output: '-1',
          explanation: '-1 is the largest among negative numbers'
        },
        {
          input: '[]',
          output: 'null',
          explanation: 'Empty array returns null'
        }
      ],
      constraints: [
        'Array length can be 0 to 1000',
        'Numbers can be negative',
        'Don\'t use Math.max()'
      ],
      hints: [
        { level: 1, hint: 'Loop through the array and keep track of the maximum value' },
        { level: 2, hint: 'Initialize your max variable with the first element' }
      ],
      followUpQuestions: [
        'How would you find the second largest number?',
        'What if the array contains non-numeric values?'
      ],
      edgeCases: [
        'Empty array',
        'Array with one element',
        'All negative numbers',
        'Duplicate maximum values'
      ],
      securityConsiderations: ['Input validation'],
      performanceRequirements: 'O(n) time complexity',
      starterCode: {
        javascript: `
function findMax(arr) {
  // Your code here
  return null;
}
        `,
        python: `
def find_max(arr):
    # Your code here
    return None
        `,
        java: `
public static Integer findMax(int[] arr) {
    // Your code here
    return null;
}
        `
      },
      testCases: [
        {
          input: [1, 5, 3, 9, 2],
          expectedOutput: 9,
          isHidden: false
        },
        {
          input: [-1, -5, -3],
          expectedOutput: -1,
          isHidden: false
        },
        {
          input: [],
          expectedOutput: null,
          isHidden: true
        }
      ]
    };
  }
  
  private static generateSimplePythonQuestion(): CodingQuestion {
    return {
      id: 'simple_python_string',
      title: 'String Manipulation - Count Vowels',
      difficulty: 'Easy',
      category: 'DSA',
      timeLimit: 10,
      description: `Write a function that counts the number of vowels in a string.

Requirements:
- Count both uppercase and lowercase vowels (a, e, i, o, u)
- Ignore non-alphabetic characters
- Return the count as an integer`,
      examples: [
        {
          input: '"Hello World"',
          output: '3',
          explanation: 'e, o, o are the vowels'
        },
        {
          input: '"PROGRAMMING"',
          output: '3',
          explanation: 'O, A, I are the vowels'
        },
        {
          input: '"xyz123"',
          output: '0',
          explanation: 'No vowels found'
        }
      ],
      constraints: [
        'String length can be 0 to 1000',
        'String can contain any characters',
        'Case insensitive vowel counting'
      ],
      hints: [
        { level: 1, hint: 'Loop through each character and check if it\'s a vowel' },
        { level: 2, hint: 'Convert to lowercase for easier comparison' }
      ],
      followUpQuestions: [
        'How would you count consonants instead?',
        'What about handling accented characters?'
      ],
      edgeCases: [
        'Empty string',
        'String with no vowels',
        'String with only vowels',
        'Mixed case string'
      ],
      securityConsiderations: ['Input validation'],
      performanceRequirements: 'O(n) time complexity',
      starterCode: {
        javascript: `
function countVowels(str) {
  // Your code here
  return 0;
}
        `,
        python: `
def count_vowels(s):
    # Your code here
    return 0
        `,
        java: `
public static int countVowels(String str) {
    // Your code here
    return 0;
}
        `
      },
      testCases: [
        {
          input: "Hello World",
          expectedOutput: 3,
          isHidden: false
        },
        {
          input: "PROGRAMMING",
          expectedOutput: 3,
          isHidden: false
        },
        {
          input: "xyz123",
          expectedOutput: 0,
          isHidden: true
        }
      ]
    };
  }
  
  private static generateSimpleSQLQuestion(): CodingQuestion {
    return {
      id: 'simple_sql_select',
      title: 'Basic SQL Query - Employee Data',
      difficulty: 'Easy',
      category: 'Database',
      timeLimit: 10,
      description: `Write a SQL query to find all employees who work in the 'Engineering' department and earn more than $60,000.

Table: employees
Columns: id, name, department, salary, hire_date

Requirements:
- Filter by department = 'Engineering'
- Filter by salary > 60000
- Order results by salary in descending order
- Show all columns`,
      examples: [
        {
          input: `Table data:
| id | name  | department  | salary | hire_date  |
|----|-------|-------------|--------|------------|
| 1  | John  | Engineering | 75000  | 2022-01-15 |
| 2  | Jane  | Marketing   | 65000  | 2021-03-10 |
| 3  | Bob   | Engineering | 55000  | 2023-02-20 |
| 4  | Alice | Engineering | 80000  | 2020-11-05 |`,
          output: `| id | name  | department  | salary | hire_date  |
|----|-------|-------------|--------|------------|
| 4  | Alice | Engineering | 80000  | 2020-11-05 |
| 1  | John  | Engineering | 75000  | 2022-01-15 |`,
          explanation: 'Only Engineering employees with salary > 60000, ordered by salary DESC'
        }
      ],
      constraints: [
        'Use standard SQL syntax',
        'Include proper WHERE clause',
        'Order by salary descending'
      ],
      hints: [
        { level: 1, hint: 'Use WHERE clause with AND condition' },
        { level: 2, hint: 'Use ORDER BY salary DESC for descending order' }
      ],
      followUpQuestions: [
        'How would you find the average salary by department?',
        'What if you needed to join with another table?'
      ],
      edgeCases: [
        'No matching records',
        'Exact salary match (60000)',
        'Case sensitivity in department name'
      ],
      securityConsiderations: ['SQL injection prevention', 'Data access permissions'],
      performanceRequirements: 'Use indexes on department and salary columns',
      starterCode: {
        javascript: `
-- Write your SQL query here
SELECT * FROM employees;
        `,
        python: `
-- Write your SQL query here
SELECT * FROM employees;
        `,
        java: `
-- Write your SQL query here
SELECT * FROM employees;
        `
      },
      testCases: [
        {
          input: "employees table with various departments and salaries",
          expectedOutput: "Engineering employees with salary > 60000, ordered by salary DESC",
          isHidden: false
        }
      ]
    };
  }
  
  private static generateExperienceBasedQuestions(experience: any[]): CodingQuestion[] {
    const questions: CodingQuestion[] = [];
    
    if (experience.length > 0) {
      questions.push({
        id: 'experience_overview',
        title: 'Professional Experience Discussion',
        difficulty: 'Easy',
        category: 'OOP',
        timeLimit: 15,
        description: `Let's discuss your professional experience:

${experience.map((exp, index) => `
${index + 1}. ${exp.position} at ${exp.company} (${exp.duration})
   ${exp.description}
`).join('\n')}

Please tell me about:
1. Your most significant achievement in your recent role
2. A challenging technical problem you solved
3. How you collaborated with team members
4. What technologies you worked with daily
5. What you learned that you'd apply to future projects`,
        examples: [],
        constraints: [],
        hints: [
          { level: 1, hint: 'Focus on specific examples and quantifiable results' },
          { level: 2, hint: 'Highlight your problem-solving approach and teamwork' }
        ],
        followUpQuestions: [
          'What was the most difficult project you worked on?',
          'How do you stay updated with new technologies?',
          'Describe a time when you had to learn a new technology quickly'
        ],
        edgeCases: [],
        securityConsiderations: [],
        performanceRequirements: 'Clear communication and specific examples',
        testCases: []
      });
    }
    
    return questions;
  }
}

export default ProjectBasedQuestionGenerator;