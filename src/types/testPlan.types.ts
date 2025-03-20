import { TestType, TimingType, TestStatus } from './enums.types';

// Test Plan types
export interface CreateTestPlanDTO {
  studentId: string | number;
  boardId: number;
  testType: TestType;
  timingType: TimingType;
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
  testType: TestType;
  timingType: TimingType;
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
    status: TestStatus;
    startedAt?: Date;
    completedAt?: Date;
    score?: number;
  };
}
