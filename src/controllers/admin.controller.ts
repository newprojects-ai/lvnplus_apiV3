import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../utils/error';

export class AdminController {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Links a guardian with a student directly (admin only)
   */
  public linkGuardianStudent = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { guardianId, studentId, relationship } = req.body;

      // Verify both users exist
      const [guardian, student] = await Promise.all([
        this.prisma.user.findUnique({ where: { id: guardianId } }),
        this.prisma.user.findUnique({ where: { id: studentId } })
      ]);

      if (!guardian) {
        throw new AppError(404, 'Guardian not found');
      }
      if (!student) {
        throw new AppError(404, 'Student not found');
      }

      // Create the link
      const link = await this.prisma.studentGuardian.create({
        data: {
          guardianId,
          studentId,
          relationship,
          status: 'ACTIVE'
        }
      });

      res.status(201).json({
        message: 'Guardian-student link created successfully',
        data: link
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Links a tutor with a student directly (admin only)
   */
  public linkTutorStudent = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { tutorId, studentId, subjects } = req.body;

      // Verify both users exist
      const [tutor, student] = await Promise.all([
        this.prisma.user.findUnique({ where: { id: tutorId } }),
        this.prisma.user.findUnique({ where: { id: studentId } })
      ]);

      if (!tutor) {
        throw new AppError(404, 'Tutor not found');
      }
      if (!student) {
        throw new AppError(404, 'Student not found');
      }

      // Create the link with subjects
      const link = await this.prisma.tutorStudent.create({
        data: {
          tutorId,
          studentId,
          subjects,
          status: 'ACTIVE'
        }
      });

      res.status(201).json({
        message: 'Tutor-student link created successfully',
        data: link
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Bulk links a tutor with multiple students (admin only)
   */
  public bulkLinkTutorStudents = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { tutorId, students } = req.body;

      // Verify tutor exists
      const tutor = await this.prisma.user.findUnique({
        where: { id: tutorId }
      });

      if (!tutor) {
        throw new AppError(404, 'Tutor not found');
      }

      // Process each student link
      const results = {
        successful: [] as string[],
        failed: [] as Array<{ studentId: string; error: string }>
      };

      await Promise.all(
        students.map(async ({ studentId, subjects }) => {
          try {
            // Verify student exists
            const student = await this.prisma.user.findUnique({
              where: { id: studentId }
            });

            if (!student) {
              throw new Error('Student not found');
            }

            // Create the link
            await this.prisma.tutorStudent.create({
              data: {
                tutorId,
                studentId,
                subjects,
                status: 'ACTIVE'
              }
            });

            results.successful.push(studentId);
          } catch (error) {
            results.failed.push({
              studentId,
              error: error instanceof Error ? error.message : 'Unknown error'
            });
          }
        })
      );

      res.status(201).json({
        message: 'Bulk tutor-student links processed',
        data: results
      });
    } catch (error) {
      next(error);
    }
  };
}
