import { Request, Response, NextFunction } from 'express';
import { PerformanceTrackingService } from '../services/performance-tracking.service';
import { ValidationError } from '../utils/errors';

const performanceService = new PerformanceTrackingService();

export class PerformanceTrackingController {
  async getStudentPerformance(req: Request, res: Response, next: NextFunction) {
    try {
      const studentId = BigInt(req.params.studentId);

      // Verify the requester has access to this student's data
      const userId = BigInt(req.user?.id || 0);
      if (userId !== studentId) {
        const hasAccess = await this.verifyGuardianAccess(userId, studentId);
        if (!hasAccess) {
          throw new ValidationError('Unauthorized to view this student\'s performance');
        }
      }

      const performance = await performanceService.getStudentPerformance(studentId);

      res.json({
        message: 'Student performance retrieved successfully',
        data: performance
      });
    } catch (error) {
      next(error);
    }
  }

  async getGroupPerformance(req: Request, res: Response, next: NextFunction) {
    try {
      const groupId = BigInt(req.params.groupId);
      const userId = BigInt(req.user?.id || 0);

      // Verify the requester is the group's tutor
      const group = await prisma.study_groups.findFirst({
        where: {
          group_id: groupId,
          tutor_id: userId
        }
      });

      if (!group) {
        throw new ValidationError('Unauthorized to view this group\'s performance');
      }

      const performance = await performanceService.getGroupPerformance(groupId);

      res.json({
        message: 'Group performance retrieved successfully',
        data: performance
      });
    } catch (error) {
      next(error);
    }
  }

  private async verifyGuardianAccess(guardianId: bigint, studentId: bigint): Promise<boolean> {
    const relationship = await prisma.student_guardians.findFirst({
      where: {
        guardian_id: guardianId,
        student_id: studentId,
        status: 'ACTIVE'
      }
    });

    return !!relationship;
  }
}
