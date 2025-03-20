import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AppError } from '../utils/error';
import { test_plans_test_type, test_plans_timing_type } from '@prisma/client';

// Valid roles for validation
const validRoles = ['admin', 'tutor', 'parent', 'student'];

// Helper functions
export const normalizeRole = (role: string): string => role.toLowerCase();
export const isValidRole = (role: string): boolean => validRoles.includes(normalizeRole(role));

// Role validation middleware
export const hasRole = (allowedRoles: string[]) => {
  return (req: any, _: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return next(new AppError(401, 'Authentication required'));
      }

      const userRoles = req.user.roles?.map((r: string) => normalizeRole(r)) || [];
      
      if (!userRoles.length) {
        return next(new AppError(401, 'No roles found for user'));
      }

      const normalizedAllowedRoles = allowedRoles.map(normalizeRole);
      const hasRequiredRole = userRoles.some((role: string) => normalizedAllowedRoles.includes(role));

      if (!hasRequiredRole) {
        return next(new AppError(403, `Access denied. Required roles: ${allowedRoles.join(', ')}`));
      }

      next();
    } catch (error) {
      console.error('Role validation error:', error);
      next(new AppError(500, 'Role validation failed'));
    }
  };
};

// Multiple roles validation middleware
export const hasAnyRole = (allowedRoles: string[]) => {
  return (req: any, _: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return next(new AppError(401, 'Authentication required'));
      }

      const userRoles = req.user.roles?.map((r: string) => normalizeRole(r)) || [];
      
      if (!userRoles.length) {
        return next(new AppError(401, 'No roles found for user'));
      }

      const normalizedAllowedRoles = allowedRoles.map(normalizeRole);
      const hasAllowedRole = userRoles.some((role: string) => normalizedAllowedRoles.includes(role));
      
      if (!hasAllowedRole) {
        return next(new AppError(403, `Access denied. Required one of roles: ${allowedRoles.join(', ')}`));
      }
      
      next();
    } catch (error) {
      console.error('Role validation error:', error);
      next(new AppError(500, 'Role validation failed'));
    }
  };
};

// Subject validation schemas
const subjectCreateSchema = z.object({
  subjectName: z.string().min(1, 'Subject name is required'),
  description: z.string().optional()
});

const subjectUpdateSchema = z.object({
  subjectName: z.string().min(1, 'Subject name is required').optional(),
  description: z.string().optional()
});

// Subtopic validation schemas
const subtopicCreateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  topic_id: z.number().positive('Topic ID must be a positive number')
});

const subtopicUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  description: z.string().optional(),
  topic_id: z.number().positive('Topic ID must be a positive number').optional()
});

// Template validation schemas
const templateCreateSchema = z.object({
  template_name: z.string().min(1, 'Template name is required'),
  board_id: z.number().positive('Board ID must be a positive number'),
  test_type: z.string().min(1, 'Test type is required'),
  timing_type: z.string().min(1, 'Timing type is required'),
  time_limit: z.number().min(0, 'Time limit must be non-negative').optional(),
  configuration: z.record(z.unknown()).optional()
});

const templateUpdateSchema = z.object({
  template_name: z.string().min(1, 'Template name is required').optional(),
  board_id: z.number().positive('Board ID must be a positive number').optional(),
  test_type: z.string().min(1, 'Test type is required').optional(),
  timing_type: z.string().min(1, 'Timing type is required').optional(),
  time_limit: z.number().min(0, 'Time limit must be non-negative').optional(),
  configuration: z.record(z.unknown()).optional()
});

// Test plan validation schemas
const testPlanCreateSchema = z.object({
  studentId: z.union([z.string(), z.number()]).transform(val => BigInt(val)),
  boardId: z.number().positive('Board ID must be a positive number'),
  testType: z.nativeEnum(test_plans_test_type),
  timingType: z.nativeEnum(test_plans_timing_type),
  timeLimit: z.number().min(0, 'Time limit must be non-negative').optional(),
  templateId: z.union([z.string(), z.number()]).optional(),
  configuration: z.object({
    topics: z.array(z.number()).optional(),
    subtopics: z.array(z.number()).optional(),
    totalQuestionCount: z.number().min(1, 'Must have at least one question'),
    difficulty: z.enum(['ALL', 'EASY', 'MEDIUM', 'HARD']).optional()
  }).optional()
});

const testPlanUpdateSchema = z.object({
  scheduled_for: z.string().datetime().optional(),
  description: z.string().optional(),
  status: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'ABANDONED']).optional()
});

// Guardian validation schemas
const guardianLinkSchema = z.object({
  student_email: z.string().email('Invalid student email'),
  relation_type: z.string().refine(val => val === 'parent', {
    message: 'Relationship type must be "parent"'
  })
});

const guardianConfirmSchema = z.object({
  accepted: z.boolean()
});

// Topic validation schemas
const topicCreateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  subject_id: z.number().positive('Subject ID must be a positive number')
});

const topicUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  description: z.string().optional(),
  subject_id: z.number().positive('Subject ID must be a positive number').optional()
});

// Question validation schemas
const questionCreateSchema = z.object({
  subtopic_id: z.number().positive('Subtopic ID must be a positive number'),
  question_text: z.string().min(1, 'Question text is required'),
  question_text_plain: z.string().min(1, 'Plain text version is required'),
  options: z.string().min(1, 'Options are required'),
  correct_answer: z.string().min(1, 'Correct answer is required'),
  correct_answer_plain: z.string().min(1, 'Plain text correct answer is required'),
  solution: z.string().min(1, 'Solution is required'),
  solution_plain: z.string().min(1, 'Plain text solution is required'),
  difficulty_level: z.number().min(1).max(5, 'Difficulty level must be between 1 and 5')
});

const questionUpdateSchema = z.object({
  subtopic_id: z.number().positive('Subtopic ID must be a positive number').optional(),
  question_text: z.string().min(1, 'Question text is required').optional(),
  question_text_plain: z.string().min(1, 'Plain text version is required').optional(),
  options: z.string().min(1, 'Options are required').optional(),
  correct_answer: z.string().min(1, 'Correct answer is required').optional(),
  correct_answer_plain: z.string().min(1, 'Plain text correct answer is required').optional(),
  solution: z.string().min(1, 'Solution is required').optional(),
  solution_plain: z.string().min(1, 'Plain text solution is required').optional(),
  difficulty_level: z.number().min(1).max(5, 'Difficulty level must be between 1 and 5').optional(),
  active: z.boolean().optional()
});

const bulkQuestionCreateSchema = z.array(questionCreateSchema);

// Admin validation schemas
const adminGuardianLinkSchema = z.object({
  guardianId: z.string().min(1, 'Guardian ID is required'),
  studentId: z.string().min(1, 'Student ID is required'),
  relationship: z.literal('PARENT')
});

const adminTutorLinkSchema = z.object({
  tutorId: z.string().min(1, 'Tutor ID is required'),
  studentId: z.string().min(1, 'Student ID is required'),
  subjects: z.array(z.string().min(1, 'Subject ID is required'))
});

const adminBulkTutorLinkSchema = z.object({
  tutorId: z.string().min(1, 'Tutor ID is required'),
  students: z.array(z.object({
    studentId: z.string().min(1, 'Student ID is required'),
    subjects: z.array(z.string().min(1, 'Subject ID is required'))
  }))
});

// Tutor validation schemas
const tutorLinkSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required'),
  subjects: z.array(z.string().min(1, 'Subject ID is required'))
});

const tutorGroupCreateSchema = z.object({
  name: z.string().min(1, 'Group name is required'),
  description: z.string().optional(),
  subjects: z.array(z.string().min(1, 'Subject ID is required')).optional()
});

// Generic request validator
export const validateRequest = <T extends z.ZodType>(schema: T) => {
  return (req: Request, _: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        next(new AppError(400, error.errors[0].message));
      } else {
        next(error);
      }
    }
  };
};

// User validation schemas
const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
  role: z.string().transform((val) => normalizeRole(val)).refine(
    (val) => isValidRole(val),
    { message: `Invalid role. Valid roles are: ${validRoles.join(', ')}` }
  )
});

const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  role: z.string().transform((val) => normalizeRole(val)).refine(
    (val) => isValidRole(val),
    { message: `Invalid role. Valid roles are: ${validRoles.join(', ')}` }
  )
});

// Export validation middleware functions
export const validateTopicCreation = validateRequest(topicCreateSchema);
export const validateTopicUpdate = validateRequest(topicUpdateSchema);
export const validateSubtopicCreation = validateRequest(subtopicCreateSchema);
export const validateSubtopicUpdate = validateRequest(subtopicUpdateSchema);
export const validateTemplateCreation = validateRequest(templateCreateSchema);
export const validateTemplateUpdate = validateRequest(templateUpdateSchema);
export const validateTestPlanCreate = async (
  req: Request,
  _: Response,
  next: NextFunction
) => {
  try {
    const validatedData = await testPlanCreateSchema.parseAsync(req.body);
    req.body = validatedData;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new AppError(400, error.errors[0].message));
      return;
    }
    next(error);
  }
};
export const validateTestPlanUpdate = validateRequest(testPlanUpdateSchema);
export const validateQuestionCreate = validateRequest(questionCreateSchema);
export const validateQuestionUpdate = validateRequest(questionUpdateSchema);
export const validateBulkQuestionCreate = validateRequest(bulkQuestionCreateSchema);
export const validateGuardianLink = validateRequest(guardianLinkSchema);
export const validateGuardianConfirm = validateRequest(guardianConfirmSchema);
export const validateAdminGuardianLink = validateRequest(adminGuardianLinkSchema);
export const validateAdminTutorLink = validateRequest(adminTutorLinkSchema);
export const validateAdminBulkTutorLink = validateRequest(adminBulkTutorLinkSchema);
export const validateTutorLink = validateRequest(tutorLinkSchema);
export const validateLogin = validateRequest(loginSchema);
export const validateRegister = validateRequest(registerSchema);
export const validateSubjectCreation = validateRequest(subjectCreateSchema);
export const validateSubjectUpdate = validateRequest(subjectUpdateSchema);
export const validateTutorGroupCreate = validateRequest(tutorGroupCreateSchema);

// Export schemas for reuse
export {
  loginSchema,
  subjectCreateSchema,
  subjectUpdateSchema,
  subtopicCreateSchema,
  subtopicUpdateSchema,
  templateCreateSchema,
  templateUpdateSchema,
  testPlanCreateSchema,
  testPlanUpdateSchema,
  guardianLinkSchema,
  guardianConfirmSchema,
  topicCreateSchema,
  topicUpdateSchema,
  questionCreateSchema,
  questionUpdateSchema,
  bulkQuestionCreateSchema,
  adminGuardianLinkSchema,
  adminTutorLinkSchema,
  adminBulkTutorLinkSchema,
  tutorLinkSchema,
  tutorGroupCreateSchema
};