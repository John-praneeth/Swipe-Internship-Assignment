import { v4 as uuidv4 } from 'uuid';
import { User, LoginCredentials, RegisterData, Session, UserRole } from '../types/auth';

// Mock Database - In production, this would be a real database
class MockAuthDatabase {
  private users: User[] = [];
  private sessions: Session[] = [];

  constructor() {
    // Initialize with default users for demo
    this.users = [
      {
        id: 'admin-001',
        username: 'admin',
        email: 'admin@demo.com',
        password: 'password123',
        role: UserRole.ADMIN,
        createdAt: Date.now(),
        isActive: true
      },
      {
        id: 'interviewer-001',
        username: 'interviewer',
        email: 'interviewer@demo.com',
        password: 'password123',
        role: UserRole.INTERVIEWER,
        createdAt: Date.now(),
        isActive: true
      },
      {
        id: 'interviewee-001',
        username: 'interviewee',
        email: 'interviewee@demo.com',
        password: 'password123',
        role: UserRole.INTERVIEWEE,
        createdAt: Date.now(),
        isActive: true
      }
    ];
  }

  // User Management
  createUser(userData: RegisterData): User {
    const user: User = {
      id: uuidv4(),
      username: userData.name,
      email: userData.email,
      password: userData.password, // In production: bcrypt.hashSync
      role: userData.role || UserRole.INTERVIEWEE,
      createdAt: Date.now(),
      isActive: true
    };

    this.users.push(user);
    return user;
  }

  getUserByUsername(username: string): User | null {
    return this.users.find(user => user.username === username) || null;
  }

  getUserByEmail(email: string): User | null {
    return this.users.find(user => user.email === email) || null;
  }

  getUserById(id: string): User | null {
    return this.users.find(user => user.id === id) || null;
  }

  getAllUsers(): User[] {
    return this.users;
  }

  updateUser(id: string, updates: Partial<User>): User | null {
    const userIndex = this.users.findIndex(user => user.id === id);
    if (userIndex === -1) return null;

    this.users[userIndex] = { ...this.users[userIndex], ...updates };
    return this.users[userIndex];
  }

  deleteUser(id: string): boolean {
    const userIndex = this.users.findIndex(user => user.id === id);
    if (userIndex === -1) return false;

    this.users.splice(userIndex, 1);
    return true;
  }

  // Session Management
  createSession(userId: string): Session {
    const session: Session = {
      userId,
      token: uuidv4(),
      expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
      createdAt: Date.now()
    };

    this.sessions.push(session);
    return session;
  }

  getSession(token: string): Session | null {
    const session = this.sessions.find(s => s.token === token);
    if (!session || session.expiresAt < Date.now()) {
      return null;
    }
    return session;
  }

  deleteSession(token: string): boolean {
    const sessionIndex = this.sessions.findIndex(s => s.token === token);
    if (sessionIndex === -1) return false;

    this.sessions.splice(sessionIndex, 1);
    return true;
  }

  cleanupExpiredSessions(): void {
    const now = Date.now();
    this.sessions = this.sessions.filter(session => session.expiresAt > now);
  }
}

// Authentication Service
class AuthService {
  private db: MockAuthDatabase;

  constructor() {
    this.db = new MockAuthDatabase();
  }

  // Authentication
  async login(credentials: LoginCredentials): Promise<{ user: User; token: string } | null> {
    const user = this.db.getUserByEmail(credentials.email);
    
    if (!user || !user.isActive) {
      return null;
    }

    // In production: bcrypt.compareSync(credentials.password, user.password)
    if (user.password !== credentials.password) {
      return null;
    }

    // Update last login
    this.db.updateUser(user.id, { lastLogin: Date.now() });

    // Create session
    const session = this.db.createSession(user.id);

    return {
      user: { ...user, password: '' }, // Don't send password to client
      token: session.token
    };
  }

  async register(userData: RegisterData): Promise<{ user: User; token: string } | { error: string }> {
    try {
      // Check if user already exists
      if (this.db.getUserByEmail(userData.email)) {
        return { error: 'User with this email already exists' };
      }

      // Create new user
      const user = this.db.createUser(userData);

      // Create session
      const session = this.db.createSession(user.id);

      return {
        user: { ...user, password: '' }, // Don't send password to client
        token: session.token
      };
    } catch (error) {
      return { error: 'Registration failed' };
    }
  }

  async validateSession(token: string): Promise<User | null> {
    const session = this.db.getSession(token);
    
    if (!session) {
      return null;
    }

    const user = this.db.getUserById(session.userId);
    
    if (!user || !user.isActive) {
      return null;
    }

    return { ...user, password: '' }; // Don't send password to client
  }

  async logout(token: string): Promise<boolean> {
    return this.db.deleteSession(token);
  }

  // User Management (Admin functions)
  async getAllUsers(): Promise<User[]> {
    return this.db.getAllUsers().map(user => ({ ...user, password: '' }));
  }

  async createUser(userData: RegisterData): Promise<User | { error: string }> {
    try {
      // Check if user already exists
      if (this.db.getUserByEmail(userData.email)) {
        return { error: 'User with this email already exists' };
      }

      const user = this.db.createUser(userData);
      return { ...user, password: '' }; // Don't send password to client
    } catch (error) {
      return { error: 'Failed to create user' };
    }
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const user = this.db.updateUser(id, updates);
    return user ? { ...user, password: '' } : null;
  }

  async deleteUser(id: string): Promise<boolean> {
    return this.db.deleteUser(id);
  }

  // Permission checking
  hasPermission(user: User, permission: string): boolean {
    const userPermissions = {
      [UserRole.ADMIN]: ['view_dashboard', 'manage_users', 'view_all_interviews', 'delete_interviews', 'system_settings'],
      [UserRole.INTERVIEWER]: ['view_dashboard', 'view_assigned_interviews', 'conduct_interviews'],
      [UserRole.INTERVIEWEE]: ['take_interview', 'view_own_results']
    };

    return userPermissions[user.role]?.includes(permission) || false;
  }
}

// Token storage utilities
export const getStoredToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

export const setStoredToken = (token: string): void => {
  localStorage.setItem('auth_token', token);
};

export const removeStoredToken = (): void => {
  localStorage.removeItem('auth_token');
};

// Export singleton instance
export const authService = new AuthService();
export default authService;
