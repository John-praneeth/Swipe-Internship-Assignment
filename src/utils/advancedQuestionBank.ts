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

export const advancedQuestionBank: CodingQuestion[] = [
  // EASY QUESTIONS
  {
    id: 'easy_1',
    title: 'Two Sum Problem',
    difficulty: 'Easy',
    category: 'DSA',
    timeLimit: 15,
    description: `
Given an array of integers and a target sum, return the indices of two numbers that add up to the target.

Example:
Input: nums = [2, 7, 11, 15], target = 9
Output: [0, 1] (because nums[0] + nums[1] = 2 + 7 = 9)
2. Check password strength (min 8 chars, uppercase, lowercase, number, special char)
3. Sanitize input to prevent XSS attacks
4. Return validation results with specific error messages

**Security Focus**: Input validation and XSS prevention
    `,
    examples: [
      {
        input: `validateUser({email: "test@example.com", password: "SecurePass123!"})`,
        output: `{isValid: true, errors: []}`,
        explanation: "Valid email and strong password"
      },
      {
        input: `validateUser({email: "invalid-email", password: "weak"})`,
        output: `{isValid: false, errors: ["Invalid email format", "Password too weak"]}`,
        explanation: "Invalid input returns specific errors"
      }
    ],
    constraints: [
      "Email must follow RFC 5322 standard",
      "Password must be 8-50 characters",
      "Input must be sanitized against XSS",
      "No SQL injection vulnerabilities"
    ],
    hints: [
      { level: 1, hint: "Use regex for email validation and consider edge cases" },
      { level: 2, hint: "Password validation should check multiple criteria separately" },
      { level: 3, hint: "Use HTML entity encoding or a sanitization library for XSS prevention" }
    ],
    followUpQuestions: [
      "How would you handle internationalized email addresses?",
      "What additional security measures would you implement for password storage?",
      "How would you prevent timing attacks in your validation?"
    ],
    edgeCases: [
      "Empty or null inputs",
      "Extremely long inputs (DoS prevention)",
      "Unicode characters in email/password",
      "Script tags in input fields"
    ],
    securityConsiderations: [
      "XSS prevention through input sanitization",
      "Rate limiting for validation attempts",
      "Secure password hashing (bcrypt/scrypt)",
      "Input length limits to prevent DoS"
    ],
    performanceRequirements: "O(n) time complexity where n is input length",
    starterCode: {
      javascript: `
function validateUser(userData) {
  // Implement validation logic here
  // Return {isValid: boolean, errors: string[]}
}

function sanitizeInput(input) {
  // Implement XSS prevention
}
      `,
      python: `
def validate_user(user_data):
    # Implement validation logic here
    # Return {"is_valid": bool, "errors": list}
    pass

def sanitize_input(input_str):
    # Implement XSS prevention
    pass
      `,
      java: `
public class UserValidator {
    public ValidationResult validateUser(UserData userData) {
        // Implement validation logic here
        return new ValidationResult();
    }
    
    public String sanitizeInput(String input) {
        // Implement XSS prevention
        return input;
    }
}
      `
    },
    testCases: [
      {
        input: { email: "test@example.com", password: "SecurePass123!" },
        expectedOutput: { isValid: true, errors: [] },
        isHidden: false
      },
      {
        input: { email: "invalid", password: "weak" },
        expectedOutput: { isValid: false, errors: ["Invalid email format", "Password too weak"] },
        isHidden: false
      },
      {
        input: { email: "test@example.com", password: "<script>alert('xss')</script>" },
        expectedOutput: { isValid: false, errors: ["Password contains invalid characters"] },
        isHidden: true
      }
    ]
  },

  // MEDIUM QUESTIONS
  {
    id: 'medium_1',
    title: 'Design a Rate-Limited API Gateway',
    difficulty: 'Medium',
    category: 'System Design',
    timeLimit: 30,
    description: `
Design and implement a rate-limited API gateway that:
1. Handles multiple API endpoints
2. Implements token bucket rate limiting per user
3. Provides different rate limits for different user tiers (free, premium, enterprise)
4. Includes circuit breaker pattern for downstream services
5. Logs and monitors API usage

**System Design Focus**: Scalability, reliability, and performance monitoring
    `,
    examples: [
      {
        input: `gateway.handleRequest({userId: "user1", endpoint: "/api/data", tier: "free"})`,
        output: `{allowed: true, remainingRequests: 99, resetTime: 1640995200}`,
        explanation: "Request allowed within rate limit"
      },
      {
        input: `gateway.handleRequest({userId: "user1", endpoint: "/api/data", tier: "free"}) // after 100 requests`,
        output: `{allowed: false, error: "Rate limit exceeded", retryAfter: 3600}`,
        explanation: "Request blocked due to rate limit"
      }
    ],
    constraints: [
      "Support 10,000+ concurrent users",
      "Rate limits: Free (100/hour), Premium (1000/hour), Enterprise (10000/hour)",
      "Circuit breaker should trip after 5 consecutive failures",
      "Response time should be < 10ms for rate limit check"
    ],
    hints: [
      { level: 1, hint: "Consider using Redis for distributed rate limiting storage" },
      { level: 2, hint: "Implement token bucket algorithm with refill rate" },
      { level: 3, hint: "Use sliding window for more accurate rate limiting" },
      { level: 4, hint: "Circuit breaker should have half-open state for recovery" }
    ],
    followUpQuestions: [
      "How would you handle rate limiting across multiple server instances?",
      "What metrics would you track for monitoring API health?",
      "How would you implement graceful degradation when rate limits are hit?",
      "What caching strategies would you use to improve performance?"
    ],
    edgeCases: [
      "Clock skew between servers",
      "Redis connection failures",
      "Burst traffic patterns",
      "User tier changes during active sessions"
    ],
    securityConsiderations: [
      "DDoS protection through rate limiting",
      "API key validation and rotation",
      "Request signature verification",
      "Audit logging for security monitoring"
    ],
    performanceRequirements: "O(1) rate limit check, < 10ms latency, 99.9% availability",
    starterCode: {
      javascript: `
class APIGateway {
  constructor() {
    this.rateLimiter = new RateLimiter();
    this.circuitBreaker = new CircuitBreaker();
  }

  async handleRequest(request) {
    // Implement rate limiting and circuit breaker logic
  }
}

class RateLimiter {
  // Implement token bucket algorithm
}

class CircuitBreaker {
  // Implement circuit breaker pattern
}
      `,
      python: `
class APIGateway:
    def __init__(self):
        self.rate_limiter = RateLimiter()
        self.circuit_breaker = CircuitBreaker()
    
    async def handle_request(self, request):
        # Implement rate limiting and circuit breaker logic
        pass

class RateLimiter:
    # Implement token bucket algorithm
    pass

class CircuitBreaker:
    # Implement circuit breaker pattern
    pass
      `,
      java: `
public class APIGateway {
    private RateLimiter rateLimiter;
    private CircuitBreaker circuitBreaker;
    
    public APIGateway() {
        this.rateLimiter = new RateLimiter();
        this.circuitBreaker = new CircuitBreaker();
    }
    
    public CompletableFuture<Response> handleRequest(Request request) {
        // Implement rate limiting and circuit breaker logic
        return null;
    }
}
      `
    },
    testCases: [
      {
        input: { userId: "user1", endpoint: "/api/data", tier: "free", timestamp: 1640995200 },
        expectedOutput: { allowed: true, remainingRequests: 99, resetTime: 1640998800 },
        isHidden: false
      },
      {
        input: { userId: "user1", endpoint: "/api/data", tier: "premium", requestCount: 500 },
        expectedOutput: { allowed: true, remainingRequests: 500, resetTime: 1640998800 },
        isHidden: true
      }
    ]
  },

  // HARD QUESTIONS
  {
    id: 'hard_1',
    title: 'Distributed Transaction Manager with ACID Properties',
    difficulty: 'Hard',
    category: 'System Design',
    timeLimit: 45,
    description: `
Design and implement a distributed transaction manager that ensures ACID properties across multiple databases. The system should:

1. Implement Two-Phase Commit (2PC) protocol
2. Handle coordinator and participant failures
3. Provide transaction isolation levels
4. Include deadlock detection and resolution
5. Support rollback and recovery mechanisms
6. Implement distributed locking

**Advanced Requirements**:
- Handle network partitions gracefully
- Implement saga pattern as an alternative to 2PC
- Provide transaction monitoring and logging
- Support both synchronous and asynchronous operations

**Real-world Scenario**: Design this for a banking system where money transfers involve multiple accounts across different database shards.
    `,
    examples: [
      {
        input: `
transaction = manager.beginTransaction();
transaction.addOperation("debit", {account: "A", amount: 100});
transaction.addOperation("credit", {account: "B", amount: 100});
result = transaction.commit();
        `,
        output: `{success: true, transactionId: "tx_123", timestamp: 1640995200}`,
        explanation: "Successful distributed transaction across multiple databases"
      },
      {
        input: `
transaction = manager.beginTransaction();
transaction.addOperation("debit", {account: "A", amount: 1000000}); // Insufficient funds
result = transaction.commit();
        `,
        output: `{success: false, error: "Transaction rolled back", reason: "Insufficient funds"}`,
        explanation: "Transaction fails and rolls back all operations"
      }
    ],
    constraints: [
      "Support up to 1000 concurrent transactions",
      "Transaction timeout: 30 seconds maximum",
      "Support 5 different isolation levels",
      "Recovery time after coordinator failure: < 5 seconds",
      "Support transactions across up to 10 different databases"
    ],
    hints: [
      { level: 1, hint: "Start with implementing the basic 2PC protocol with prepare and commit phases" },
      { level: 2, hint: "Consider using vector clocks for ordering distributed events" },
      { level: 3, hint: "Implement a transaction log for recovery and audit purposes" },
      { level: 4, hint: "Use timeout mechanisms to handle participant failures" },
      { level: 5, hint: "Consider implementing saga pattern for long-running transactions" }
    ],
    followUpQuestions: [
      "How would you optimize for read-heavy vs write-heavy workloads?",
      "What would you do if the coordinator fails during the commit phase?",
      "How would you implement distributed deadlock detection?",
      "What are the trade-offs between 2PC and saga patterns?",
      "How would you handle Byzantine failures in your system?",
      "What monitoring and alerting would you implement?"
    ],
    edgeCases: [
      "Network partitions during commit phase",
      "Coordinator failure after prepare phase",
      "Participant recovery after crash",
      "Clock synchronization issues",
      "Cascading failures across multiple databases",
      "Memory pressure during large transactions"
    ],
    securityConsiderations: [
      "Transaction authorization and authentication",
      "Audit logging for compliance (SOX, PCI-DSS)",
      "Encryption of transaction data in transit and at rest",
      "Protection against transaction replay attacks",
      "Secure coordinator election in case of failures"
    ],
    performanceRequirements: "< 100ms latency for local transactions, < 500ms for distributed transactions, 99.99% consistency guarantee",
    starterCode: {
      javascript: `
class DistributedTransactionManager {
  constructor() {
    this.transactions = new Map();
    this.coordinators = new Map();
    this.participants = new Set();
  }

  beginTransaction(isolationLevel = 'READ_COMMITTED') {
    // Implement transaction initialization
  }

  async twoPhaseCommit(transactionId) {
    // Implement 2PC protocol
  }

  async handleCoordinatorFailure(coordinatorId) {
    // Implement coordinator recovery
  }
}

class Transaction {
  constructor(id, isolationLevel) {
    this.id = id;
    this.operations = [];
    this.state = 'ACTIVE';
    this.isolationLevel = isolationLevel;
  }

  addOperation(type, data) {
    // Add operation to transaction
  }

  async commit() {
    // Implement commit logic
  }

  async rollback() {
    // Implement rollback logic
  }
}
      `,
      python: `
class DistributedTransactionManager:
    def __init__(self):
        self.transactions = {}
        self.coordinators = {}
        self.participants = set()
    
    def begin_transaction(self, isolation_level='READ_COMMITTED'):
        # Implement transaction initialization
        pass
    
    async def two_phase_commit(self, transaction_id):
        # Implement 2PC protocol
        pass
    
    async def handle_coordinator_failure(self, coordinator_id):
        # Implement coordinator recovery
        pass

class Transaction:
    def __init__(self, transaction_id, isolation_level):
        self.id = transaction_id
        self.operations = []
        self.state = 'ACTIVE'
        self.isolation_level = isolation_level
    
    def add_operation(self, operation_type, data):
        # Add operation to transaction
        pass
    
    async def commit(self):
        # Implement commit logic
        pass
    
    async def rollback(self):
        # Implement rollback logic
        pass
      `,
      java: `
public class DistributedTransactionManager {
    private Map<String, Transaction> transactions;
    private Map<String, Coordinator> coordinators;
    private Set<Participant> participants;
    
    public DistributedTransactionManager() {
        this.transactions = new ConcurrentHashMap<>();
        this.coordinators = new ConcurrentHashMap<>();
        this.participants = ConcurrentHashMap.newKeySet();
    }
    
    public Transaction beginTransaction(IsolationLevel isolationLevel) {
        // Implement transaction initialization
        return null;
    }
    
    public CompletableFuture<Boolean> twoPhaseCommit(String transactionId) {
        // Implement 2PC protocol
        return null;
    }
    
    public void handleCoordinatorFailure(String coordinatorId) {
        // Implement coordinator recovery
    }
}
      `
    },
    testCases: [
      {
        input: {
          operations: [
            { type: "debit", account: "A", amount: 100 },
            { type: "credit", account: "B", amount: 100 }
          ],
          isolationLevel: "SERIALIZABLE"
        },
        expectedOutput: { success: true, transactionId: "tx_123" },
        isHidden: false
      },
      {
        input: {
          operations: [
            { type: "debit", account: "A", amount: 1000000 }
          ],
          simulateFailure: "INSUFFICIENT_FUNDS"
        },
        expectedOutput: { success: false, error: "Transaction rolled back" },
        isHidden: true
      }
    ]
  },

  // DATABASE QUESTION
  {
    id: 'medium_2',
    title: 'Optimize Database Query Performance',
    difficulty: 'Medium',
    category: 'Database',
    timeLimit: 25,
    description: `
Given a slow-performing e-commerce database, optimize the following scenarios:

1. **Product Search Query**: Users search for products by name, category, price range, and ratings
2. **Order History**: Retrieve user's order history with pagination
3. **Inventory Updates**: Handle concurrent inventory updates during high traffic
4. **Analytics Query**: Generate sales reports by date, category, and region

**Database Schema**:
- products (id, name, category_id, price, rating, stock_quantity, created_at)
- orders (id, user_id, total_amount, status, created_at)
- order_items (id, order_id, product_id, quantity, price)
- users (id, email, region, created_at)
- categories (id, name, parent_id)

**Current Issues**:
- Product search takes 5+ seconds with 1M products
- Order history pagination is slow for users with many orders
- Inventory updates cause deadlocks during flash sales
- Analytics queries timeout during peak hours
    `,
    examples: [
      {
        input: `
-- Current slow query
SELECT p.*, c.name as category_name 
FROM products p 
JOIN categories c ON p.category_id = c.id 
WHERE p.name LIKE '%laptop%' 
AND p.price BETWEEN 500 AND 2000 
AND p.rating >= 4.0 
ORDER BY p.rating DESC, p.price ASC;
        `,
        output: `Execution time: 5.2 seconds, Full table scan on products`,
        explanation: "Query scans entire products table without proper indexing"
      }
    ],
    constraints: [
      "Database: PostgreSQL 13+",
      "1M+ products, 10M+ orders, 100K+ users",
      "Peak traffic: 10,000 concurrent users",
      "Query response time must be < 100ms",
      "Support for read replicas"
    ],
    hints: [
      { level: 1, hint: "Analyze the query execution plan using EXPLAIN ANALYZE" },
      { level: 2, hint: "Consider composite indexes for multi-column WHERE clauses" },
      { level: 3, hint: "Use database partitioning for large tables like orders" },
      { level: 4, hint: "Implement proper locking strategies for inventory updates" },
      { level: 5, hint: "Consider materialized views for complex analytics queries" }
    ],
    followUpQuestions: [
      "How would you handle database sharding as the system scales?",
      "What caching strategies would you implement?",
      "How would you ensure data consistency across read replicas?",
      "What monitoring would you set up for database performance?"
    ],
    edgeCases: [
      "Handling NULL values in search queries",
      "Dealing with hot partitions in sharded databases",
      "Managing connection pool exhaustion",
      "Handling long-running analytics queries"
    ],
    securityConsiderations: [
      "SQL injection prevention in dynamic queries",
      "Row-level security for multi-tenant data",
      "Audit logging for sensitive operations",
      "Encryption of PII data at rest"
    ],
    performanceRequirements: "< 100ms for OLTP queries, < 5s for analytics queries, 99.9% uptime",
    testCases: [
      {
        input: {
          query: "product_search",
          filters: { name: "laptop", priceMin: 500, priceMax: 2000, rating: 4.0 }
        },
        expectedOutput: { executionTime: "<100ms", resultsCount: 150 },
        isHidden: false
      }
    ]
  },

  // API SECURITY QUESTION
  {
    id: 'medium_3',
    title: 'Secure Payment API Design',
    difficulty: 'Medium',
    category: 'API',
    timeLimit: 35,
    description: `
Design a secure payment processing API that handles:

1. **Payment Processing**: Credit card, digital wallet, bank transfer payments
2. **Security**: PCI-DSS compliance, fraud detection, secure tokenization
3. **Reliability**: Idempotency, retry logic, transaction status tracking
4. **Integration**: Webhook notifications, third-party payment processors
5. **Monitoring**: Real-time fraud detection, transaction monitoring

**Security Requirements**:
- PCI-DSS Level 1 compliance
- End-to-end encryption
- Tokenization of sensitive data
- Multi-factor authentication for high-value transactions
- Real-time fraud detection

**API Endpoints to Design**:
- POST /payments/process
- GET /payments/{id}/status
- POST /payments/{id}/refund
- POST /webhooks/payment-status
- GET /payments/analytics
    `,
    examples: [
      {
        input: `
POST /payments/process
{
  "amount": 10000,
  "currency": "USD",
  "paymentMethod": {
    "type": "card",
    "token": "tok_1234567890"
  },
  "merchantId": "merchant_123",
  "idempotencyKey": "idem_abc123"
}
        `,
        output: `
{
  "paymentId": "pay_xyz789",
  "status": "processing",
  "amount": 10000,
  "currency": "USD",
  "createdAt": "2024-01-10T10:00:00Z",
  "estimatedSettlement": "2024-01-12T10:00:00Z"
}
        `,
        explanation: "Secure payment initiation with tokenized card data"
      }
    ],
    constraints: [
      "PCI-DSS Level 1 compliance required",
      "Support 10,000+ transactions per minute",
      "99.99% uptime requirement",
      "< 500ms API response time",
      "Support 50+ currencies",
      "Fraud detection latency < 100ms"
    ],
    hints: [
      { level: 1, hint: "Never store raw credit card data - use tokenization" },
      { level: 2, hint: "Implement proper idempotency using unique keys" },
      { level: 3, hint: "Use HTTPS with certificate pinning for all communications" },
      { level: 4, hint: "Implement rate limiting and DDoS protection" },
      { level: 5, hint: "Use webhook signatures to verify authenticity" }
    ],
    followUpQuestions: [
      "How would you handle payment processor failover?",
      "What fraud detection algorithms would you implement?",
      "How would you ensure PCI-DSS compliance in a microservices architecture?",
      "What disaster recovery procedures would you implement?",
      "How would you handle chargebacks and disputes?"
    ],
    edgeCases: [
      "Duplicate payment attempts",
      "Network timeouts during processing",
      "Currency conversion edge cases",
      "Partial payment failures",
      "Webhook delivery failures"
    ],
    securityConsiderations: [
      "PCI-DSS compliance for card data handling",
      "End-to-end encryption of sensitive data",
      "API authentication using OAuth 2.0 + JWT",
      "Request signing for webhook verification",
      "Real-time fraud detection and blocking"
    ],
    performanceRequirements: "< 500ms API latency, 10K+ TPS, 99.99% availability, < 100ms fraud check",
    testCases: [
      {
        input: {
          amount: 10000,
          currency: "USD",
          paymentMethod: { type: "card", token: "tok_test" },
          idempotencyKey: "test_123"
        },
        expectedOutput: { status: "processing", paymentId: "pay_test" },
        isHidden: false
      }
    ]
  }
];

// Question difficulty distribution
export const questionStats = {
  easy: advancedQuestionBank.filter(q => q.difficulty === 'Easy').length,
  medium: advancedQuestionBank.filter(q => q.difficulty === 'Medium').length,
  hard: advancedQuestionBank.filter(q => q.difficulty === 'Hard').length,
  categories: {
    DSA: advancedQuestionBank.filter(q => q.category === 'DSA').length,
    'System Design': advancedQuestionBank.filter(q => q.category === 'System Design').length,
    OOP: advancedQuestionBank.filter(q => q.category === 'OOP').length,
    Database: advancedQuestionBank.filter(q => q.category === 'Database').length,
    API: advancedQuestionBank.filter(q => q.category === 'API').length,
    Security: advancedQuestionBank.filter(q => q.category === 'Security').length,
    Functional: advancedQuestionBank.filter(q => q.category === 'Functional').length,
  }
};

export const getQuestionsByDifficulty = (difficulty: 'Easy' | 'Medium' | 'Hard') => {
  return advancedQuestionBank.filter(q => q.difficulty === difficulty);
};

export const getQuestionsByCategory = (category: string) => {
  return advancedQuestionBank.filter(q => q.category === category);
};

export const getRandomQuestion = (difficulty?: string, category?: string) => {
  let filteredQuestions = advancedQuestionBank;
  
  if (difficulty) {
    filteredQuestions = filteredQuestions.filter(q => q.difficulty === difficulty);
  }
  
  if (category) {
    filteredQuestions = filteredQuestions.filter(q => q.category === category);
  }
  
  return filteredQuestions[Math.floor(Math.random() * filteredQuestions.length)];
};