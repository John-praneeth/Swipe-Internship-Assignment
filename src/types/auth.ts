// User Role Enum
export enum UserRole {
  ADMIN = 'admin',
  INTERVIEWER = 'interviewer',
  INTERVIEWEE = 'interviewee'
}

// Authentication and User Management Types
export interface User {
  id: string;
  username: string;
  email: string;
  password: string; // In real app, this would be hashed
  role: UserRole;
  createdAt: number;
  lastLogin?: number;
  isActive: boolean;
}

export interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
  users: User[];
  loading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

// Session Management
export interface Session {
  userId: string;
  token: string;
  expiresAt: number;
  createdAt: number;
}

// User permissions
export const UserPermissions = {
  [UserRole.ADMIN]: [
    'view_dashboard',
    'manage_users',
    'view_all_interviews',
    'delete_interviews',
    'system_settings'
  ],
  [UserRole.INTERVIEWER]: [
    'view_dashboard',
    'view_assigned_interviews',
    'conduct_interviews'
  ],
  [UserRole.INTERVIEWEE]: [
    'take_interview',
    'view_own_results'
  ]
} as const;

export type Permission = typeof UserPermissions[keyof typeof UserPermissions][number];
