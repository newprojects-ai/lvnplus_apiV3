import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

const guardianStudentSchema = z.object({
  guardianId: z.string().min(1),
  studentId: z.string().min(1),
  relationship: z.literal('PARENT')
});

const tutorStudentSchema = z.object({
  tutorId: z.string().min(1),
  studentId: z.string().min(1),
  subjects: z.array(z.string()).min(1)
});

const tutorStudentsBulkSchema = z.object({
  tutorId: z.string().min(1),
  students: z.array(z.object({
    studentId: z.string().min(1),
    subjects: z.array(z.string()).min(1)
  })).min(1)
});

const validateSchema = (schema: z.ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: 'Validation Error',
          details: error.errors
        });
      } else {
        next(error);
      }
    }
  };
};

export const adminLinkSchema = {
  guardianStudent: validateSchema(guardianStudentSchema),
  tutorStudent: validateSchema(tutorStudentSchema)
};

export const adminBulkLinkSchema = {
  tutorStudents: validateSchema(tutorStudentsBulkSchema)
};
