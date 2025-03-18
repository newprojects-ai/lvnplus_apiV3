import { Request } from 'express';
import { 
  test_plans_test_type, 
  test_plans_timing_type, 
  test_executions_status,
  test_templates_source,
  test_templates_test_type,
  test_templates_timing_type,
  exam_boards_input_type
} from '@prisma/client';

// Role types and constants
export type Role = 'admin' | 'tutor' | 'parent' | 'student';

export const VALID_ROLES = ['ADMIN', 'TUTOR', 'PARENT', 'STUDENT'] as const;

// Helper functions
export const normalizeRole = (role: string): string => role.toLowerCase();
export const isValidRole = (role: string): boolean => {
  const normalized = normalizeRole(role);
  return ['admin', 'tutor', 'parent', 'student'].includes(normalized);
};

// Auth types
export interface LoginUserDTO {
  email: string;
  password: string;
  role: string;
}

export interface RegisterUserDTO extends LoginUserDTO {
  first_name: string;
  last_name: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: bigint;
    email: string;
    first_name: string;
    last_name: string;
    role: Role;
  };
}

// Request types
export interface UserRequest extends Request {
  user?: {
    id: bigint;
    email: string;
    role: Role;
    roles: Role[];
  };
}

// Database Models
export interface UserRole {
  role_id: number;
  role_name: Role;
  description?: string;
}

export interface User {
  user_id: bigint;
  email: string;
  first_name: string;
  last_name: string;
  roles: Role[];
}

// Template types
export interface CreateTemplateDTO {
  template_name: string;
  board_id: number;
  test_type: string;
  timing_type: string;
  time_limit?: number;
  configuration?: Record<string, unknown>;
}

export interface UpdateTemplateDTO {
  template_name?: string;
  board_id?: number;
  test_type?: string;
  timing_type?: string;
  time_limit?: number;
  configuration?: Record<string, unknown>;
}

export interface TemplateResponse {
  template_id: number;
  template_name: string;
  source: 'SYSTEM' | 'USER';
  board_id: number;
  test_type: string;
  timing_type: string;
  time_limit: number | null;
  configuration: Record<string, unknown>;
  created_by: number;
  created_at: Date;
  updated_at: Date;
  active: boolean;
  user?: {
    user_id: bigint;
    email: string;
    first_name: string;
    last_name: string;
  };
  exam_board?: {
    board_id: number;
    board_name: string;
    input_type: string;
  };
}

export interface TemplateFilters {
  source?: 'SYSTEM' | 'USER';
  board_id?: number;
}

// Topic types
export interface CreateTopicDTO {
  name: string;
  description?: string;
  subjectId: number;
}

export interface UpdateTopicDTO {
  name?: string;
  description?: string;
  subjectId?: number;
}

export interface TopicResponse {
  topic_id: number;
  topic_name: string;
  description: string | null;
  subject_id: number;
  created_at: Date;
  updated_at: Date;
}

// Common types
export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResponse {
  success: boolean;
  message: string;
  errors: ValidationError[];
}

export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

// Question types
export interface Question {
  id: number;
  title: string;
  content: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  type: string;
  answer: string;
  explanation?: string;
  subtopic_id: number;
}

// Test types
export interface TestPlan {
  id: number;
  name: string;
  description?: string;
  template_id: number;
  student_id: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
}

export interface TestExecution {
  id: number;
  test_plan_id: number;
  start_time: Date;
  end_time?: Date;
  score?: number;
  status: 'IN_PROGRESS' | 'COMPLETED';
}

// Test Plan types
export interface CreateTestPlanDTO {
  template_id: string | number;
  student_id: string | number;
  scheduled_for?: string;
  description?: string;
}

export interface UpdateTestPlanDTO {
  scheduled_for?: string;
  description?: string;
}

export interface TestPlanResponse {
  id: string;
  template_id?: string;
  board_id: number;
  test_type: test_plans_test_type;
  timing_type: test_plans_timing_type;
  time_limit?: number;
  student: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
  };
  planner: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
  };
  template?: {
    id: string;
    name: string;
    source: test_templates_source;
    test_type: test_templates_test_type;
    timing_type: test_templates_timing_type;
    time_limit?: number;
    configuration: any;
  };
  exam_board?: {
    id: string;
    name: string;
    description?: string;
    input_type: exam_boards_input_type;
  };
  planned_at: Date;
  configuration: any;
}

// Test Execution types
export interface TestExecutionResponse {
  execution_id: string | number;
  test_plan_id: string | number;
  student_id?: string | number;
  status: string;
  started_at?: Date;
  test_data: string | any;
  responses: Record<string, string>;
  timing_data: {
    start_time: number;
    end_time?: number;
    paused_duration?: number;
  };
  score?: number;
}

export interface TestExecutionQuestionData {
  question_id: number;
  subtopic_id: number;
  question_text: string;
  options: string[];
  difficulty_level: number;
  correct_answer: string;
  correct_answer_plain?: string;
}

export interface TestExecutionResponseData {
  question_id: number;
  student_answer: string | null;
  is_correct: boolean | null;
  time_spent: number;
  confidence_level?: number | null;
}

export interface TestExecutionData {
  questions: TestExecutionQuestionData[];
  responses: TestExecutionResponseData[];
  total_correct?: number;
  total_questions?: number;
  score?: number;
}

// Test Result types
export interface SubmitAnswerDTO {
  question_id: string;
  answer: string;
}

export interface SubmitAllAnswersDTO {
  execution_id: number;
  end_time: number;
  responses: {
    question_id: number;
    answer: string;
    time_taken: number;
  }[];
}

export interface TestResultResponse {
  id: string;
  test_session_id: string;
  user_id: string;
  score: number;
  total_questions: number;
  time_spent: number;
  completed_at: string;
  accuracy: number;
  topic_performance: Array<{
    topic_id: string;
    correct: number;
    total: number;
    accuracy: number;
  }>;
}

// Subject types
export interface CreateSubjectDTO {
  name: string;
  description?: string;
  boardId?: number;
}

export interface UpdateSubjectDTO {
  name?: string;
  description?: string;
  boardId?: number;
}

export interface SubjectResponse {
  id: number;
  name: string;
  description: string | null;
  topics: {
    id: number;
    name: string;
    description: string | null;
  }[];
}

// Subtopic types
export interface CreateSubtopicDTO {
  name: string;
  description?: string;
  topicId: number;
}

export interface UpdateSubtopicDTO {
  name?: string;
  description?: string;
  topicId?: number;
}

export interface SubtopicResponse {
  subtopic_id: number;
  subtopic_name: string;
  description: string | null;
  topic: {
    topic_id: number;
    topic_name: string;
    subject: {
      subject_id: number;
      subject_name: string;
    };
  };
  created_at: Date;
  updated_at: Date;
}

// Question types
export interface CreateQuestionDTO {
  text: string;
  type: 'MULTIPLE_CHOICE' | 'SHORT_ANSWER' | 'LONG_ANSWER';
  difficulty: number;
  subtopicId: number;
  options?: string[];
  correctAnswer: string;
  explanation?: string;
}

export interface UpdateQuestionDTO {
  text?: string;
  type?: 'MULTIPLE_CHOICE' | 'SHORT_ANSWER' | 'LONG_ANSWER';
  difficulty?: number;
  subtopicId?: number;
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
}

export interface QuestionResponse {
  id: string | number;
  question_text: string;
  options: any;
  correct_answer: string;
  difficulty_level: number;
  subtopic: {
    id: number;
    name: string;
    topic: {
      id: number;
      name: string;
      subject: {
        id: number;
        name: string;
      };
    };
  };
  creator: {
    id: string | number;
    email: string;
    first_name: string | null;
    last_name: string | null;
  };
  created_at: Date;
}

export interface QuestionFilters {
  topic_id?: number;
  subtopic_id?: number;
  difficulty?: number;
  exam_board?: number;
  limit: number;
  offset: number;
}

export interface RandomQuestionParams {
  count: number;
  difficulty?: number;
  topic_ids?: number[];
  subtopic_ids?: number[];
}

export interface FilterQuestionParams {
  topic_id?: number | string;
  subtopic_id?: number | string;
  difficulty?: number | string;
  limit: number;
  offset?: number;
}

export interface FilterQuestionResponse {
  data: (QuestionResponse & { topic_id?: number; topic_name?: string })[];
  total: number;
  limit: number;
  offset: number;
}

// Validation types
export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResponse {
  status: 'error';
  message: string;
  errors: ValidationError[];
}

// Error types
export interface AppError {
  status: 'error';
  message: string;
  details?: unknown;
}