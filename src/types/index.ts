import type { Request } from 'express';
import type { ParamsDictionary } from 'express-serve-static-core';
import type { ParsedQs } from 'qs';

// Role types and constants
export type Role = 'admin' | 'tutor' | 'parent' | 'student';
export const VALID_ROLES = ['admin', 'tutor', 'parent', 'student'] as const;

// Helper functions
export const normalizeRole = (role: string): string => role.toLowerCase();

export const isValidRole = (role: string): boolean => {
  const normalized = normalizeRole(role);
  return VALID_ROLES.includes(normalized as Role);
};

// Auth and User types
export interface UserRequest extends Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>> {
  user?: {
    id: string;
    email: string;
    role?: Role;
    roles: string[];
    iat?: number;
    exp?: number;
  };
}

export interface LoginUserDTO {
  email: string;
  password: string;
}

export interface RegisterUserDTO extends LoginUserDTO {
  firstName: string;
  lastName: string;
  role: Role;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: Role;
    roles: string[];
  };
}

// Test Plan types
export interface CreateTestPlanDTO {
  studentId: string | number;
  boardId: number;
  testType: string;
  timingType: string;
  timeLimit?: number;
  templateId?: string | number;
  configuration: {
    topics: number[];
    subtopics: number[];
    totalQuestionCount: number;
    description?: string;
  };
}

export interface UpdateTestPlanDTO {
  scheduled_for?: string;
  description?: string;
}

export interface TestPlanResponse {
  id: string;
  templateId?: string;
  boardId: number;
  testType: string;
  timingType: string;
  timeLimit?: number;
  student: {
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  planner: {
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  configuration: {
    topics: number[];
    subtopics: number[];
    totalQuestionCount: number;
    description?: string;
  };
  execution?: {
    status: string;
    startedAt?: Date;
    completedAt?: Date;
    score?: number;
  };
}

// Test Execution types
export interface TestExecutionQuestionData {
  id: string;
  question: string;
  options: string[];
  correctAnswer?: string;
  explanation?: string;
  marks: number;
  type: string;
  difficulty: string;
  topicId: number;
  subtopicId: number;
}

export interface TestExecutionResponseData {
  questionId: string;
  selectedAnswer: string;
  isCorrect?: boolean;
  marks?: number;
}

export interface TestExecutionData {
  questions: TestExecutionQuestionData[];
  responses: TestExecutionResponseData[];
}

export interface TestExecutionResponse {
  id: string;
  testPlanId: string;
  status: string;
  startedAt: Date;
  completedAt?: Date;
  score?: number;
  data: TestExecutionData;
}

export interface SubmitAnswerDTO {
  questionId: string;
  selectedAnswer: string;
}

export interface SubmitAllAnswersDTO {
  answers: SubmitAnswerDTO[];
}

// Error types
export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResponse {
  errors: ValidationError[];
}

export interface AppError {
  code: string;
  message: string;
  details?: unknown;
}