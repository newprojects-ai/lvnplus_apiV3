import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import type { Role, UserRequest, ValidationResponse } from '../types';

// Valid roles for validation
const validRoles: Role[] = ['admin', 'tutor', 'parent', 'student'];

// Helper functions
export const normalizeRole = (role: string): string => role.toLowerCase();
export const isValidRole = (role: string): boolean => validRoles.includes(role as Role);

// Role validation middleware
export const hasRole = (allowedRoles: Role[]) => {
  return (req: UserRequest, res: Response, next: NextFunction) => {
    const userRole = req.user?.role;
    if (!userRole) {
      return res.status(401).json({
        success: false,
        message: 'User role not found'
      });
    }

    const normalizedRole = normalizeRole(userRole);
    if (!allowedRoles.includes(normalizedRole as Role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
        errors: [{
          field: 'role',
          message: `Required roles: ${allowedRoles.join(', ')}`
        }]
      });
    }

    return next();
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
  template_id: z.union([z.string(), z.number()]).transform(val => BigInt(val)),
  student_id: z.union([z.string(), z.number()]).transform(val => BigInt(val)),
  scheduled_for: z.string().datetime().optional(),
  description: z.string().optional()
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
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.body);
      return next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationResponse: ValidationResponse = {
          success: false,
          message: 'Validation failed',
          errors: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        };
        return res.status(400).json(validationResponse);
      }
      return next(error);
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

// Export validation middlewares
export const validateLogin = validateRequest(loginSchema);
export const validateRegister = validateRequest(registerSchema);
export const validateTopicCreation = validateRequest(topicCreateSchema);
export const validateTopicUpdate = validateRequest(topicUpdateSchema);
export const validateTemplateCreation = validateRequest(templateCreateSchema);
export const validateTemplateUpdate = validateRequest(templateUpdateSchema);
export const validateTestPlanCreate = validateRequest(testPlanCreateSchema);
export const validateTestPlanUpdate = validateRequest(testPlanUpdateSchema);
export const validateGuardianLink = validateRequest(guardianLinkSchema);
export const validateGuardianConfirm = validateRequest(guardianConfirmSchema);
export const validateSubjectCreation = validateRequest(subjectCreateSchema);
export const validateSubjectUpdate = validateRequest(subjectUpdateSchema);
export const validateSubtopicCreation = validateRequest(subtopicCreateSchema);
export const validateSubtopicUpdate = validateRequest(subtopicUpdateSchema);
export const validateQuestionCreate = validateRequest(questionCreateSchema);
export const validateQuestionUpdate = validateRequest(questionUpdateSchema);
export const validateBulkQuestionCreate = validateRequest(bulkQuestionCreateSchema);
export const validateAdminGuardianLink = validateRequest(adminGuardianLinkSchema);
export const validateAdminTutorLink = validateRequest(adminTutorLinkSchema);
export const validateAdminBulkTutorLink = validateRequest(adminBulkTutorLinkSchema);
export const validateTutorLink = validateRequest(tutorLinkSchema);
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