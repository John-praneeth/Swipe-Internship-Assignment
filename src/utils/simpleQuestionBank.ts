export interface CodingQuestion {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: 'DSA' | 'System Design' | 'OOP' | 'Database' | 'API' | 'Security' | 'Functional';
  timeLimit: number; // in minutes
  description: string;
  examples: Array<{
    input: string;
    output: string;
    explanation: string;
  }>;
  constraints: string[];
  hints: Array<{
    level: number;
    hint: string;
  }>;
  followUpQuestions: string[];
  edgeCases: string[];
  securityConsiderations: string[];
  performanceRequirements: string;
  starterCode?: {
    javascript: string;
    python: string;
    java: string;
  };
  solution?: {
    code: string;
    explanation: string;
    timeComplexity: string;
    spaceComplexity: string;
  };
  testCases: Array<{
    input: any;
    expectedOutput: any;
    isHidden: boolean;
  }>;
}

export const simpleQuestionBank: CodingQuestion[] = [
  // EASY QUESTIONS
  {
    id: 'easy_1',
    title: 'Two Sum',
    difficulty: 'Easy',
    category: 'DSA',
    timeLimit: 15,
    description: `
Given an array of integers and a target sum, return the indices of two numbers that add up to the target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.
    `,
    examples: [
      {
        input: `nums = [2, 7, 11, 15], target = 9`,
        output: `[0, 1]`,
        explanation: "nums[0] + nums[1] = 2 + 7 = 9"
      },
      {
        input: `nums = [3, 2, 4], target = 6`,
        output: `[1, 2]`,
        explanation: "nums[1] + nums[2] = 2 + 4 = 6"
      }
    ],
    constraints: [
      "2 ≤ nums.length ≤ 10^4",
      "-10^9 ≤ nums[i] ≤ 10^9",
      "-10^9 ≤ target ≤ 10^9",
      "Only one valid answer exists"
    ],
    hints: [
      { level: 1, hint: "Try using a hash map to store numbers you've seen" },
      { level: 2, hint: "For each number, check if (target - number) exists in your hash map" }
    ],
    followUpQuestions: [
      "What if the array is sorted?",
      "What if there are multiple solutions?",
      "How would you handle duplicate numbers?"
    ],
    edgeCases: [
      "Array with only 2 elements",
      "Negative numbers",
      "Zero in the array"
    ],
    securityConsiderations: [
      "Input validation for array bounds",
      "Integer overflow protection"
    ],
    performanceRequirements: "O(n) time complexity, O(n) space complexity",
    starterCode: {
      javascript: `
function twoSum(nums, target) {
    // Your code here
    return [];
}
      `,
      python: `
def two_sum(nums, target):
    # Your code here
    return []
      `,
      java: `
public int[] twoSum(int[] nums, int target) {
    // Your code here
    return new int[0];
}
      `
    },
    testCases: [
      {
        input: { nums: [2, 7, 11, 15], target: 9 },
        expectedOutput: [0, 1],
        isHidden: false
      },
      {
        input: { nums: [3, 2, 4], target: 6 },
        expectedOutput: [1, 2],
        isHidden: false
      },
      {
        input: { nums: [3, 3], target: 6 },
        expectedOutput: [0, 1],
        isHidden: true
      }
    ]
  },

  {
    id: 'easy_2',
    title: 'Valid Parentheses',
    difficulty: 'Easy',
    category: 'DSA',
    timeLimit: 15,
    description: `
Given a string containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets
2. Open brackets must be closed in the correct order
    `,
    examples: [
      {
        input: `"()"`,
        output: `true`,
        explanation: "Valid parentheses"
      },
      {
        input: `"()[]{}"`,
        output: `true`,
        explanation: "All brackets are properly closed"
      },
      {
        input: `"(]"`,
        output: `false`,
        explanation: "Mismatched bracket types"
      }
    ],
    constraints: [
      "1 ≤ s.length ≤ 10^4",
      "s consists of parentheses only '()[]{}'."
    ],
    hints: [
      { level: 1, hint: "Use a stack data structure" },
      { level: 2, hint: "Push opening brackets, pop and match closing brackets" }
    ],
    followUpQuestions: [
      "How would you handle nested brackets?",
      "What if there are other characters in the string?"
    ],
    edgeCases: [
      "Empty string",
      "Only opening brackets",
      "Only closing brackets"
    ],
    securityConsiderations: [
      "Input length validation",
      "Character validation"
    ],
    performanceRequirements: "O(n) time complexity, O(n) space complexity",
    starterCode: {
      javascript: `
function isValid(s) {
    // Your code here
    return false;
}
      `,
      python: `
def is_valid(s):
    # Your code here
    return False
      `,
      java: `
public boolean isValid(String s) {
    // Your code here
    return false;
}
      `
    },
    testCases: [
      {
        input: "()",
        expectedOutput: true,
        isHidden: false
      },
      {
        input: "()[]{}", 
        expectedOutput: true,
        isHidden: false
      },
      {
        input: "(]",
        expectedOutput: false,
        isHidden: true
      }
    ]
  },

  {
    id: 'easy_3',
    title: 'Simple Database Query',
    difficulty: 'Easy',
    category: 'Database',
    timeLimit: 10,
    description: `
Write a SQL query to find all employees who earn more than $50,000 from the 'employees' table.

Table structure:
- employees (id, name, salary, department)
    `,
    examples: [
      {
        input: `Table: employees
| id | name  | salary | department |
|----|-------|--------|------------|
| 1  | John  | 60000  | IT         |
| 2  | Jane  | 45000  | HR         |
| 3  | Bob   | 75000  | IT         |`,
        output: `| id | name | salary | department |
|----|------|--------|------------|
| 1  | John | 60000  | IT         |
| 3  | Bob  | 75000  | IT         |`,
        explanation: "Only employees with salary > 50000"
      }
    ],
    constraints: [
      "Use standard SQL syntax",
      "Consider NULL values",
      "Order results by salary descending"
    ],
    hints: [
      { level: 1, hint: "Use WHERE clause to filter salary" },
      { level: 2, hint: "Use ORDER BY to sort results" }
    ],
    followUpQuestions: [
      "How would you find the average salary by department?",
      "What if you need to join with another table?"
    ],
    edgeCases: [
      "Empty table",
      "NULL salary values",
      "Exactly $50,000 salary"
    ],
    securityConsiderations: [
      "SQL injection prevention",
      "Data access permissions"
    ],
    performanceRequirements: "Use indexes on salary column for better performance",
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
        input: "employees table with various salaries",
        expectedOutput: "employees with salary > 50000",
        isHidden: false
      }
    ]
  },

  // MEDIUM QUESTIONS
  {
    id: 'medium_1',
    title: 'Longest Substring Without Repeating Characters',
    difficulty: 'Medium',
    category: 'DSA',
    timeLimit: 25,
    description: `
Given a string, find the length of the longest substring without repeating characters.
    `,
    examples: [
      {
        input: `"abcabcbb"`,
        output: `3`,
        explanation: `The answer is "abc", with the length of 3`
      },
      {
        input: `"bbbbb"`,
        output: `1`,
        explanation: `The answer is "b", with the length of 1`
      }
    ],
    constraints: [
      "0 ≤ s.length ≤ 5 * 10^4",
      "s consists of English letters, digits, symbols and spaces"
    ],
    hints: [
      { level: 1, hint: "Use sliding window technique" },
      { level: 2, hint: "Keep track of character positions with a hash map" }
    ],
    followUpQuestions: [
      "How would you modify this for k distinct characters?",
      "What if the string is very large?"
    ],
    edgeCases: [
      "Empty string",
      "Single character",
      "All unique characters"
    ],
    securityConsiderations: [
      "Input length validation",
      "Memory usage limits"
    ],
    performanceRequirements: "O(n) time complexity, O(min(m,n)) space complexity",
    starterCode: {
      javascript: `
function lengthOfLongestSubstring(s) {
    // Your code here
    return 0;
}
      `,
      python: `
def length_of_longest_substring(s):
    # Your code here
    return 0
      `,
      java: `
public int lengthOfLongestSubstring(String s) {
    // Your code here
    return 0;
}
      `
    },
    testCases: [
      {
        input: "abcabcbb",
        expectedOutput: 3,
        isHidden: false
      },
      {
        input: "bbbbb",
        expectedOutput: 1,
        isHidden: false
      },
      {
        input: "pwwkew",
        expectedOutput: 3,
        isHidden: true
      }
    ]
  },

  {
    id: 'medium_2',
    title: 'REST API Design',
    difficulty: 'Medium',
    category: 'API',
    timeLimit: 20,
    description: `
Design a RESTful API for a simple blog system. Define the endpoints for:
1. Creating a new blog post
2. Getting all blog posts
3. Getting a specific blog post
4. Updating a blog post
5. Deleting a blog post

Include HTTP methods, URL patterns, request/response formats, and status codes.
    `,
    examples: [
      {
        input: `Create a new blog post`,
        output: `POST /api/posts
Content-Type: application/json
{
  "title": "My First Post",
  "content": "Hello World!",
  "author": "John Doe"
}

Response: 201 Created
{
  "id": 1,
  "title": "My First Post",
  "content": "Hello World!",
  "author": "John Doe",
  "createdAt": "2024-01-01T10:00:00Z"
}`,
        explanation: "POST request creates a new resource"
      }
    ],
    constraints: [
      "Follow REST conventions",
      "Use appropriate HTTP status codes",
      "Include error handling",
      "Consider pagination for list endpoints"
    ],
    hints: [
      { level: 1, hint: "Use HTTP verbs: GET, POST, PUT, DELETE" },
      { level: 2, hint: "Use resource-based URLs like /posts/{id}" }
    ],
    followUpQuestions: [
      "How would you handle authentication?",
      "What about rate limiting?",
      "How would you version your API?"
    ],
    edgeCases: [
      "Invalid post ID",
      "Missing required fields",
      "Unauthorized access"
    ],
    securityConsiderations: [
      "Input validation",
      "Authentication and authorization",
      "Rate limiting",
      "CORS handling"
    ],
    performanceRequirements: "Consider caching and pagination for large datasets",
    starterCode: {
      javascript: `
// Define your API endpoints here
// Example:
// GET /api/posts - Get all posts
// POST /api/posts - Create new post
// GET /api/posts/:id - Get specific post
// PUT /api/posts/:id - Update post
// DELETE /api/posts/:id - Delete post
      `,
      python: `
# Define your API endpoints here
# Example:
# GET /api/posts - Get all posts
# POST /api/posts - Create new post
# GET /api/posts/:id - Get specific post
# PUT /api/posts/:id - Update post
# DELETE /api/posts/:id - Delete post
      `,
      java: `
// Define your API endpoints here
// Example:
// GET /api/posts - Get all posts
// POST /api/posts - Create new post
// GET /api/posts/:id - Get specific post
// PUT /api/posts/:id - Update post
// DELETE /api/posts/:id - Delete post
      `
    },
    testCases: [
      {
        input: "API design requirements",
        expectedOutput: "Complete REST API specification",
        isHidden: false
      }
    ]
  },

  {
    id: 'easy_4',
    title: 'Find Maximum in Array',
    difficulty: 'Easy',
    category: 'DSA',
    timeLimit: 10,
    description: `
Write a function that finds the maximum number in an array.

Requirements:
- Handle empty arrays (return null)
- Handle arrays with negative numbers
- Don't use built-in Math.max()
    `,
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
      }
    ],
    constraints: [
      "Array length can be 0 to 1000",
      "Numbers can be negative",
      "Don't use Math.max()"
    ],
    hints: [
      { level: 1, hint: "Loop through the array and keep track of the maximum value" },
      { level: 2, hint: "Initialize your max variable with the first element" }
    ],
    followUpQuestions: [
      "How would you find the second largest number?",
      "What if the array contains non-numeric values?"
    ],
    edgeCases: [
      "Empty array",
      "Array with one element",
      "All negative numbers"
    ],
    securityConsiderations: [
      "Input validation"
    ],
    performanceRequirements: "O(n) time complexity",
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
  },

  {
    id: 'easy_5',
    title: 'Count Vowels in String',
    difficulty: 'Easy',
    category: 'DSA',
    timeLimit: 10,
    description: `
Write a function that counts the number of vowels in a string.

Requirements:
- Count both uppercase and lowercase vowels (a, e, i, o, u)
- Ignore non-alphabetic characters
- Return the count as an integer
    `,
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
      }
    ],
    constraints: [
      "String length can be 0 to 1000",
      "String can contain any characters",
      "Case insensitive vowel counting"
    ],
    hints: [
      { level: 1, hint: "Loop through each character and check if it's a vowel" },
      { level: 2, hint: "Convert to lowercase for easier comparison" }
    ],
    followUpQuestions: [
      "How would you count consonants instead?",
      "What about handling accented characters?"
    ],
    edgeCases: [
      "Empty string",
      "String with no vowels",
      "String with only vowels"
    ],
    securityConsiderations: [
      "Input validation"
    ],
    performanceRequirements: "O(n) time complexity",
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
  },

  {
    id: 'easy_6',
    title: 'Employee Database Query',
    difficulty: 'Easy',
    category: 'Database',
    timeLimit: 10,
    description: `
Write a SQL query to find all employees who work in the 'Engineering' department and earn more than $60,000.

Table: employees
Columns: id, name, department, salary, hire_date

Requirements:
- Filter by department = 'Engineering'
- Filter by salary > 60000
- Order results by salary in descending order
- Show all columns
    `,
    examples: [
      {
        input: `Table data with various employees`,
        output: `Engineering employees with salary > 60000, ordered by salary DESC`,
        explanation: 'Only Engineering employees with salary > 60000, ordered by salary DESC'
      }
    ],
    constraints: [
      "Use standard SQL syntax",
      "Include proper WHERE clause",
      "Order by salary descending"
    ],
    hints: [
      { level: 1, hint: "Use WHERE clause with AND condition" },
      { level: 2, hint: "Use ORDER BY salary DESC for descending order" }
    ],
    followUpQuestions: [
      "How would you find the average salary by department?",
      "What if you needed to join with another table?"
    ],
    edgeCases: [
      "No matching records",
      "Exact salary match (60000)",
      "Case sensitivity in department name"
    ],
    securityConsiderations: [
      "SQL injection prevention",
      "Data access permissions"
    ],
    performanceRequirements: "Use indexes on department and salary columns",
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
  },

  // HARD QUESTIONS
  {
    id: 'hard_1',
    title: 'Design a URL Shortener',
    difficulty: 'Hard',
    category: 'System Design',
    timeLimit: 45,
    description: `
Design a URL shortening service like bit.ly or tinyurl.com.

Requirements:
1. Shorten long URLs to short URLs
2. Redirect short URLs to original URLs
3. Handle 100 million URLs per day
4. URLs should be as short as possible
5. Analytics (optional): track click counts

Consider:
- Database design
- API design
- Scalability
- Caching strategy
- Rate limiting
    `,
    examples: [
      {
        input: `Long URL: https://www.example.com/very/long/path/to/resource?param1=value1&param2=value2`,
        output: `Short URL: https://short.ly/abc123`,
        explanation: "Long URL is converted to a short, unique identifier"
      }
    ],
    constraints: [
      "Handle high traffic (100M URLs/day)",
      "Short URLs should be unique",
      "System should be highly available",
      "Consider data consistency"
    ],
    hints: [
      { level: 1, hint: "Think about how to generate unique short codes" },
      { level: 2, hint: "Consider using base62 encoding (a-z, A-Z, 0-9)" },
      { level: 3, hint: "Think about database sharding for scalability" }
    ],
    followUpQuestions: [
      "How would you handle custom short URLs?",
      "What about URL expiration?",
      "How would you prevent abuse?",
      "How would you handle analytics at scale?"
    ],
    edgeCases: [
      "Duplicate long URLs",
      "Invalid URLs",
      "Very long URLs",
      "High traffic spikes"
    ],
    securityConsiderations: [
      "Prevent malicious URLs",
      "Rate limiting to prevent abuse",
      "Input validation",
      "DDoS protection"
    ],
    performanceRequirements: "Sub-100ms response time, 99.9% availability",
    starterCode: {
      javascript: `
// Design your URL shortener system
// Consider:
// 1. Database schema
// 2. API endpoints
// 3. Short code generation algorithm
// 4. Caching strategy
// 5. Scalability approach

class URLShortener {
    constructor() {
        // Initialize your system
    }
    
    shortenURL(longURL) {
        // Generate short URL
    }
    
    expandURL(shortCode) {
        // Get original URL
    }
}
      `,
      python: `
# Design your URL shortener system
# Consider:
# 1. Database schema
# 2. API endpoints  
# 3. Short code generation algorithm
# 4. Caching strategy
# 5. Scalability approach

class URLShortener:
    def __init__(self):
        # Initialize your system
        pass
    
    def shorten_url(self, long_url):
        # Generate short URL
        pass
    
    def expand_url(self, short_code):
        # Get original URL
        pass
      `,
      java: `
// Design your URL shortener system
// Consider:
// 1. Database schema
// 2. API endpoints
// 3. Short code generation algorithm  
// 4. Caching strategy
// 5. Scalability approach

public class URLShortener {
    public URLShortener() {
        // Initialize your system
    }
    
    public String shortenURL(String longURL) {
        // Generate short URL
        return "";
    }
    
    public String expandURL(String shortCode) {
        // Get original URL
        return "";
    }
}
      `
    },
    testCases: [
      {
        input: "System design requirements",
        expectedOutput: "Complete system design with scalability considerations",
        isHidden: false
      }
    ]
  }
];

// Helper functions
export const getQuestionsByDifficulty = (difficulty: 'Easy' | 'Medium' | 'Hard'): CodingQuestion[] => {
  return simpleQuestionBank.filter(q => q.difficulty === difficulty);
};

export const getQuestionsByCategory = (category: string): CodingQuestion[] => {
  return simpleQuestionBank.filter(q => q.category === category);
};

export const getRandomQuestion = (difficulty?: 'Easy' | 'Medium' | 'Hard', category?: string): CodingQuestion => {
  let filteredQuestions = simpleQuestionBank;
  
  if (difficulty) {
    filteredQuestions = filteredQuestions.filter(q => q.difficulty === difficulty);
  }
  
  if (category) {
    filteredQuestions = filteredQuestions.filter(q => q.category === category);
  }
  
  const randomIndex = Math.floor(Math.random() * filteredQuestions.length);
  return filteredQuestions[randomIndex];
};

export { simpleQuestionBank as advancedQuestionBank };