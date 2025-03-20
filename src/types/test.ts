import { test_plans_test_type, test_plans_timing_type, test_executions_status } from '@prisma/client';

// Test plan types
export interface CreateTestPlanDTO {
  templateId?: string;
  studentId: string;
  boardId: number;
  testType: test_plans_test_type;
  timingType: test_plans_timing_type;
  timeLimit?: number;
  configuration?: {
    topics?: number[];
    subtopics?: number[];
    totalQuestionCount: number;
    difficulty?: 'ALL' | 'EASY' | 'MEDIUM' | 'HARD';
  };
}

export interface TestPlanResponse {
  id: string;
  templateId?: string;
  studentId: string;
  boardId: number;
  testType: test_plans_test_type;
  timingType: test_plans_timing_type;
  timeLimit?: number;
  configuration?: {
    topics?: number[];
    subtopics?: number[];
    totalQuestionCount: number;
    difficulty?: 'ALL' | 'EASY' | 'MEDIUM' | 'HARD';
  };
  status: test_executions_status;
  plannedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TestExecutionResponse {
  id: string;
  testPlanId: string;
  status: test_executions_status;
  startedAt?: Date;
  completedAt?: Date;
  score?: number;
  answers: Array<{
    questionId: string;
    answer: string;
    isCorrect?: boolean;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface TestStatusResponse {
  id: string;
  status: test_executions_status;
  timeRemaining?: number;
  questionsAnswered: number;
  totalQuestions: number;
}

export interface TestResultsResponse {
  id: string;
  score: number;
  answers: Array<{
    questionId: string;
    answer: string;
    isCorrect: boolean;
    correctAnswer?: string;
    explanation?: string;
  }>;
  completedAt: Date;
}
