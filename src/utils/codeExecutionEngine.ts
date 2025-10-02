// Mock Code Execution Engine
// In production, this would integrate with Docker containers or cloud execution services

export interface ExecutionResult {
  success: boolean;
  output: any;
  error?: string;
  executionTime: number;
  memoryUsage: number;
  securityViolations: string[];
}

export interface TestCase {
  input: any;
  expectedOutput: any;
  isHidden: boolean;
}

export interface CodeAnalysis {
  timeComplexity: string;
  spaceComplexity: string;
  securityIssues: string[];
  performanceIssues: string[];
  codeQuality: number; // 0-100
  suggestions: string[];
}

class CodeExecutionEngine {
  private securityPatterns = {
    sqlInjection: [
      /SELECT.*FROM.*WHERE/i,
      /INSERT.*INTO.*VALUES/i,
      /UPDATE.*SET.*WHERE/i,
      /DELETE.*FROM.*WHERE/i,
      /DROP.*TABLE/i,
      /UNION.*SELECT/i
    ],
    xss: [
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe[^>]*>.*?<\/iframe>/gi
    ],
    commandInjection: [
      /exec\s*\(/gi,
      /system\s*\(/gi,
      /eval\s*\(/gi,
      /setTimeout\s*\(/gi,
      /setInterval\s*\(/gi
    ]
  };

  async executeCode(
    code: string, 
    language: string, 
    testCases: TestCase[]
  ): Promise<{ results: ExecutionResult[]; analysis: CodeAnalysis }> {
    
    // Security scan first
    const securityViolations = this.scanForSecurityIssues(code);
    
    if (securityViolations.length > 0) {
      return {
        results: [{
          success: false,
          output: null,
          error: 'Security violations detected',
          executionTime: 0,
          memoryUsage: 0,
          securityViolations
        }],
        analysis: {
          timeComplexity: 'N/A',
          spaceComplexity: 'N/A',
          securityIssues: securityViolations,
          performanceIssues: [],
          codeQuality: 0,
          suggestions: ['Fix security issues before execution']
        }
      };
    }

    // Execute test cases
    const results: ExecutionResult[] = [];
    
    for (const testCase of testCases) {
      const result = await this.executeTestCase(code, language, testCase);
      results.push(result);
    }

    // Analyze code quality and performance
    const analysis = this.analyzeCode(code, language);

    return { results, analysis };
  }

  private async executeTestCase(
    code: string, 
    language: string, 
    testCase: TestCase
  ): Promise<ExecutionResult> {
    
    const startTime = performance.now();
    
    try {
      let result;
      
      // Handle SQL execution differently
      if (language.toLowerCase() === 'sql') {
        result = await this.executeSQLCode(code, testCase.input);
      } else {
        // Mock execution for other languages
        result = await this.mockExecution(code, language, testCase.input);
      }
      
      const executionTime = performance.now() - startTime;
      
      return {
        success: this.compareOutputs(result.output, testCase.expectedOutput),
        output: result.output,
        executionTime,
        memoryUsage: result.memoryUsage,
        securityViolations: []
      };
      
    } catch (error) {
      return {
        success: false,
        output: null,
        error: error instanceof Error ? error.message : 'Execution failed',
        executionTime: performance.now() - startTime,
        memoryUsage: 0,
        securityViolations: []
      };
    }
  }

  private async mockExecution(code: string, language: string, input: any): Promise<{
    output: any;
    memoryUsage: number;
  }> {
    // This is a mock implementation that tries to simulate realistic code execution
    // In production, you would use Docker containers or cloud execution services
    
    await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50)); // Simulate execution time
    
    try {
      // Attempt to execute simple JavaScript code patterns
      if (language.toLowerCase() === 'javascript') {
        return await this.mockJavaScriptExecution(code, input);
      } else if (language.toLowerCase() === 'python') {
        return await this.mockPythonExecution(code, input);
      } else if (language.toLowerCase() === 'java') {
        return await this.mockJavaExecution(code, input);
      } else {
        // Default fallback
        return {
          output: input,
          memoryUsage: Math.random() * 256 * 1024
        };
      }
    } catch (error) {
      // If mock execution fails, return an error-like output
      throw new Error(`Mock execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async mockJavaScriptExecution(code: string, input: any): Promise<{
    output: any;
    memoryUsage: number;
  }> {
    // Try to extract and simulate function execution
    const functionMatch = code.match(/function\s+(\w+)\s*\([^)]*\)\s*{([^}]*)}/);
    
    if (functionMatch) {
      const functionBody = functionMatch[2];
      
      // Simple pattern matching for common algorithms
      if (functionBody.includes('Math.max') || code.includes('Math.max')) {
        if (Array.isArray(input)) {
          return {
            output: Math.max(...input),
            memoryUsage: input.length * 8
          };
        }
      }
      
      if (functionBody.includes('sort') || code.includes('sort')) {
        if (Array.isArray(input)) {
          return {
            output: [...input].sort((a, b) => a - b),
            memoryUsage: input.length * 16
          };
        }
      }
      
      if (functionBody.includes('reverse') || code.includes('reverse')) {
        if (Array.isArray(input)) {
          return {
            output: [...input].reverse(),
            memoryUsage: input.length * 8
          };
        }
      }
      
      if (functionBody.includes('length') || code.includes('length')) {
        if (Array.isArray(input) || typeof input === 'string') {
          return {
            output: input.length,
            memoryUsage: 32
          };
        }
      }
      
      // For sum/addition patterns
      if (functionBody.includes('+') && (functionBody.includes('reduce') || functionBody.includes('for'))) {
        if (Array.isArray(input)) {
          return {
            output: input.reduce((sum: number, num: number) => sum + num, 0),
            memoryUsage: input.length * 8
          };
        }
      }
    }
    
    // If no pattern matches, simulate a basic execution
    // This creates more realistic but still deterministic results
    const codeHash = this.simpleHash(code + JSON.stringify(input));
    const shouldSucceed = codeHash % 10 >= 3; // 70% success rate, but deterministic
    
    if (!shouldSucceed) {
      throw new Error('Simulated execution error - check your logic');
    }
    
    return {
      output: this.generateReasonableOutput(input, code),
      memoryUsage: Math.max(1024, JSON.stringify(input).length * 4)
    };
  }

  private async mockPythonExecution(code: string, input: any): Promise<{
    output: any;
    memoryUsage: number;
  }> {
    // Similar logic for Python
    if (code.includes('max(') && Array.isArray(input)) {
      return {
        output: Math.max(...input),
        memoryUsage: input.length * 8
      };
    }
    
    if (code.includes('sorted(') && Array.isArray(input)) {
      return {
        output: [...input].sort((a, b) => a - b),
        memoryUsage: input.length * 16
      };
    }
    
    return this.mockJavaScriptExecution(code, input);
  }

  private async mockJavaExecution(code: string, input: any): Promise<{
    output: any;
    memoryUsage: number;
  }> {
    // Basic Java simulation
    if (code.includes('Arrays.sort') && Array.isArray(input)) {
      return {
        output: [...input].sort((a, b) => a - b),
        memoryUsage: input.length * 32 // Java uses more memory
      };
    }
    
    return this.mockJavaScriptExecution(code, input);
  }

  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  private generateReasonableOutput(input: any, code: string): any {
    // Generate output that makes sense based on input type and code patterns
    if (Array.isArray(input)) {
      if (code.includes('return') && code.includes('0')) {
        return 0;
      }
      if (code.includes('true') || code.includes('false')) {
        return input.length > 0;
      }
      return input[0]; // Return first element as default
    }
    
    if (typeof input === 'number') {
      if (code.includes('*')) return input * 2;
      if (code.includes('+')) return input + 1;
      if (code.includes('-')) return input - 1;
      return input;
    }
    
    if (typeof input === 'string') {
      if (code.includes('toUpperCase')) return input.toUpperCase();
      if (code.includes('toLowerCase')) return input.toLowerCase();
      if (code.includes('length')) return input.length;
      return input;
    }
    
    return input;
  }

  private async executeSQLCode(code: string, input: any): Promise<{
    output: any;
    memoryUsage: number;
  }> {
    // Mock SQL execution with in-memory database simulation
    try {
      // Initialize SQL.js for in-browser SQL execution
      let initSqlJs;
      try {
        initSqlJs = (await import('sql.js' as any)).default;
      } catch (importError) {
        console.warn('SQL.js not available, using mock SQL execution');
        return this.mockSQLExecution(code, input);
      }
      
      const SQL = await initSqlJs({
        locateFile: (file: string) => `https://sql.js.org/dist/${file}`
      });
      
      const db = new SQL.Database();
      
      // Create sample tables for testing
      this.createSampleTables(db);
      
      // Execute the SQL query
      const results = db.exec(code);
      
      // Format results
      let output;
      if (results.length > 0) {
        const result = results[0];
        output = {
          columns: result.columns,
          values: result.values,
          rowCount: result.values.length
        };
      } else {
        output = { message: 'Query executed successfully', rowCount: 0 };
      }
      
      db.close();
      
      return {
        output,
        memoryUsage: Math.random() * 512 * 1024 // Mock memory usage
      };
      
    } catch (error) {
      console.error('SQL execution error:', error);
      return this.mockSQLExecution(code, input);
    }
  }
  
  private mockSQLExecution(code: string, _input: any): {
    output: any;
    memoryUsage: number;
  } {
    // Simple mock SQL execution for common queries
    const lowerCode = code.toLowerCase().trim();
    
    if (lowerCode.includes('select') && lowerCode.includes('employees')) {
      // Mock employee query results
      if (lowerCode.includes('engineering') && lowerCode.includes('salary')) {
        return {
          output: {
            columns: ['id', 'name', 'department', 'salary', 'hire_date'],
            values: [
              [4, 'Alice', 'Engineering', 80000, '2020-11-05'],
              [1, 'John', 'Engineering', 75000, '2022-01-15']
            ],
            rowCount: 2
          },
          memoryUsage: Math.random() * 256 * 1024
        };
      } else {
        return {
          output: {
            columns: ['id', 'name', 'department', 'salary', 'hire_date'],
            values: [
              [1, 'John', 'Engineering', 75000, '2022-01-15'],
              [2, 'Jane', 'Marketing', 65000, '2021-03-10'],
              [3, 'Bob', 'Engineering', 55000, '2023-02-20'],
              [4, 'Alice', 'Engineering', 80000, '2020-11-05']
            ],
            rowCount: 4
          },
          memoryUsage: Math.random() * 256 * 1024
        };
      }
    }
    
    // Default mock response
    return {
      output: { message: 'SQL query executed successfully', rowCount: 1 },
      memoryUsage: Math.random() * 128 * 1024
    };
  }
  
  private createSampleTables(db: any): void {
    // Create sample employees table
    db.run(`
      CREATE TABLE employees (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        department TEXT NOT NULL,
        salary INTEGER NOT NULL,
        hire_date TEXT NOT NULL
      )
    `);
    
    // Insert sample data
    db.run(`
      INSERT INTO employees (id, name, department, salary, hire_date) VALUES
      (1, 'John', 'Engineering', 75000, '2022-01-15'),
      (2, 'Jane', 'Marketing', 65000, '2021-03-10'),
      (3, 'Bob', 'Engineering', 55000, '2023-02-20'),
      (4, 'Alice', 'Engineering', 80000, '2020-11-05'),
      (5, 'Charlie', 'Sales', 50000, '2022-06-01'),
      (6, 'Diana', 'Engineering', 70000, '2021-09-15')
    `);
    
    // Create sample products table
    db.run(`
      CREATE TABLE products (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        category TEXT NOT NULL,
        stock INTEGER NOT NULL
      )
    `);
    
    db.run(`
      INSERT INTO products (id, name, price, category, stock) VALUES
      (1, 'Laptop', 999.99, 'Electronics', 50),
      (2, 'Mouse', 29.99, 'Electronics', 100),
      (3, 'Desk', 299.99, 'Furniture', 25),
      (4, 'Chair', 199.99, 'Furniture', 30)
    `);
  }



  private compareOutputs(actual: any, expected: any): boolean {
    // Deep comparison for complex objects
    return JSON.stringify(actual) === JSON.stringify(expected);
  }

  private scanForSecurityIssues(code: string): string[] {
    const violations: string[] = [];

    // Check for SQL injection patterns
    for (const pattern of this.securityPatterns.sqlInjection) {
      if (pattern.test(code)) {
        violations.push('Potential SQL injection vulnerability detected');
        break;
      }
    }

    // Check for XSS patterns
    for (const pattern of this.securityPatterns.xss) {
      if (pattern.test(code)) {
        violations.push('Potential XSS vulnerability detected');
        break;
      }
    }

    // Check for command injection patterns
    for (const pattern of this.securityPatterns.commandInjection) {
      if (pattern.test(code)) {
        violations.push('Potential command injection vulnerability detected');
        break;
      }
    }

    // Check for hardcoded secrets
    if (/password\s*=\s*["'][^"']+["']/gi.test(code) || 
        /api_key\s*=\s*["'][^"']+["']/gi.test(code)) {
      violations.push('Hardcoded credentials detected');
    }

    // Check for unsafe operations
    if (/eval\s*\(/gi.test(code)) {
      violations.push('Use of eval() is dangerous and should be avoided');
    }

    return violations;
  }

  private analyzeCode(code: string, _language: string): CodeAnalysis {
    const analysis: CodeAnalysis = {
      timeComplexity: 'O(?)',
      spaceComplexity: 'O(?)',
      securityIssues: this.scanForSecurityIssues(code),
      performanceIssues: [],
      codeQuality: 70, // Base score
      suggestions: []
    };

    // Analyze time complexity patterns
    if (code.includes('for') && code.includes('for')) {
      analysis.timeComplexity = 'O(n²)';
      analysis.performanceIssues.push('Nested loops detected - consider optimization');
    } else if (code.includes('for') || code.includes('while')) {
      analysis.timeComplexity = 'O(n)';
    } else if (code.includes('sort')) {
      analysis.timeComplexity = 'O(n log n)';
    } else {
      analysis.timeComplexity = 'O(1)';
    }

    // Analyze space complexity
    if (code.includes('new Array') || code.includes('[]')) {
      analysis.spaceComplexity = 'O(n)';
    } else {
      analysis.spaceComplexity = 'O(1)';
    }

    // Code quality analysis
    let qualityScore = 70;

    // Check for good practices
    if (code.includes('const ') || code.includes('let ')) {
      qualityScore += 5; // Modern variable declarations
    }
    if (code.includes('try') && code.includes('catch')) {
      qualityScore += 10; // Error handling
    }
    if (code.includes('//') || code.includes('/*')) {
      qualityScore += 5; // Comments
    }
    if (!/var\s+/.test(code)) {
      qualityScore += 5; // Avoiding var
    }

    // Check for bad practices
    if (code.includes('eval(')) {
      qualityScore -= 20; // Dangerous eval
    }
    if (code.includes('document.write')) {
      qualityScore -= 10; // Outdated practices
    }
    if (code.length > 1000 && !code.includes('function')) {
      qualityScore -= 10; // Long code without functions
    }

    analysis.codeQuality = Math.max(0, Math.min(100, qualityScore));

    // Generate suggestions
    if (analysis.securityIssues.length > 0) {
      analysis.suggestions.push('Address security vulnerabilities before deployment');
    }
    if (analysis.timeComplexity === 'O(n²)') {
      analysis.suggestions.push('Consider optimizing nested loops for better performance');
    }
    if (!code.includes('try')) {
      analysis.suggestions.push('Add error handling for robustness');
    }
    if (analysis.codeQuality < 70) {
      analysis.suggestions.push('Improve code quality by following best practices');
    }

    return analysis;
  }

  // Performance benchmarking
  async benchmarkCode(_code: string, _language: string, iterations: number = 1000): Promise<{
    averageExecutionTime: number;
    memoryUsage: number;
    throughput: number;
  }> {
    const times: number[] = [];
    let totalMemory = 0;

    for (let i = 0; i < iterations; i++) {
      const startTime = performance.now();
      
      // Mock execution
      await new Promise(resolve => setTimeout(resolve, Math.random() * 10));
      
      const endTime = performance.now();
      times.push(endTime - startTime);
      totalMemory += Math.random() * 1024 * 1024; // Mock memory usage
    }

    const averageExecutionTime = times.reduce((a, b) => a + b, 0) / times.length;
    const throughput = 1000 / averageExecutionTime; // Operations per second

    return {
      averageExecutionTime,
      memoryUsage: totalMemory / iterations,
      throughput
    };
  }

  // Static code analysis
  analyzeComplexity(code: string): {
    cyclomaticComplexity: number;
    linesOfCode: number;
    maintainabilityIndex: number;
  } {
    const lines = code.split('\n').filter(line => line.trim().length > 0);
    const linesOfCode = lines.length;

    // Calculate cyclomatic complexity (simplified)
    let complexity = 1; // Base complexity
    const complexityPatterns = [
      /if\s*\(/g,
      /else\s+if\s*\(/g,
      /while\s*\(/g,
      /for\s*\(/g,
      /switch\s*\(/g,
      /case\s+/g,
      /catch\s*\(/g,
      /\?\s*.*\s*:/g // Ternary operator
    ];

    for (const pattern of complexityPatterns) {
      const matches = code.match(pattern);
      if (matches) {
        complexity += matches.length;
      }
    }

    // Calculate maintainability index (simplified)
    const maintainabilityIndex = Math.max(0, 
      171 - 5.2 * Math.log(linesOfCode) - 0.23 * complexity - 16.2 * Math.log(linesOfCode)
    );

    return {
      cyclomaticComplexity: complexity,
      linesOfCode,
      maintainabilityIndex: Math.round(maintainabilityIndex)
    };
  }
}

export const codeExecutionEngine = new CodeExecutionEngine();

// Utility functions for interview feedback
export const generatePerformanceFeedback = (
  executionResults: ExecutionResult[],
  codeAnalysis: CodeAnalysis,
  timeSpent: number,
  attempts: number
): string => {
  let feedback = "## Code Review & Performance Analysis\n\n";

  // Test results summary
  const passedTests = executionResults.filter(r => r.success).length;
  const totalTests = executionResults.length;
  
  feedback += `### Test Results: ${passedTests}/${totalTests} passed\n`;
  
  if (passedTests === totalTests) {
    feedback += "✅ All test cases passed! Great job on the correctness.\n\n";
  } else {
    feedback += "❌ Some test cases failed. Review the edge cases and error handling.\n\n";
  }

  // Performance analysis
  feedback += `### Performance Analysis\n`;
  feedback += `- **Time Complexity**: ${codeAnalysis.timeComplexity}\n`;
  feedback += `- **Space Complexity**: ${codeAnalysis.spaceComplexity}\n`;
  feedback += `- **Code Quality Score**: ${codeAnalysis.codeQuality}/100\n\n`;

  // Security analysis
  if (codeAnalysis.securityIssues.length > 0) {
    feedback += `### Security Issues ⚠️\n`;
    codeAnalysis.securityIssues.forEach(issue => {
      feedback += `- ${issue}\n`;
    });
    feedback += "\n";
  }

  // Performance issues
  if (codeAnalysis.performanceIssues.length > 0) {
    feedback += `### Performance Concerns\n`;
    codeAnalysis.performanceIssues.forEach(issue => {
      feedback += `- ${issue}\n`;
    });
    feedback += "\n";
  }

  // Suggestions
  if (codeAnalysis.suggestions.length > 0) {
    feedback += `### Recommendations\n`;
    codeAnalysis.suggestions.forEach(suggestion => {
      feedback += `- ${suggestion}\n`;
    });
    feedback += "\n";
  }

  // Interview performance
  feedback += `### Interview Performance\n`;
  feedback += `- **Time Spent**: ${Math.round(timeSpent / 60)} minutes\n`;
  feedback += `- **Attempts**: ${attempts}\n`;
  
  if (attempts === 1) {
    feedback += "- **First Attempt Success**: Excellent problem-solving approach!\n";
  } else if (attempts <= 3) {
    feedback += "- **Iterative Improvement**: Good debugging and refinement process.\n";
  } else {
    feedback += "- **Multiple Attempts**: Consider breaking down problems into smaller steps.\n";
  }

  return feedback;
};

export default CodeExecutionEngine;