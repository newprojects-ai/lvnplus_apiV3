import { Request, Response, NextFunction } from 'express';
import { GuardianService } from '../services/guardian.service';
import { ValidationError } from '../utils/errors';

const guardianService = new GuardianService();

export class GuardianController {
  async requestLink(req: Request, res: Response, next: NextFunction) {
    try {
      const guardianId = BigInt(req.user?.id || 0);
      const { studentEmail, relationType } = req.body;

      if (!studentEmail || !relationType) {
        throw new ValidationError('Student email and relationship type are required');
      }

      const relationship = await guardianService.requestLink(
        guardianId,
        studentEmail,
        relationType
      );

      res.status(201).json({
        message: 'Guardian link request created successfully',
        data: relationship
      });
    } catch (error) {
      next(error);
    }
  }

  async confirmLink(req: Request, res: Response, next: NextFunction) {
    try {
      const studentId = BigInt(req.user?.id || 0);
      const relationshipId = BigInt(req.params.relationshipId);

      const relationship = await guardianService.confirmLink(relationshipId, studentId);

      res.json({
        message: 'Guardian link confirmed successfully',
        data: relationship
      });
    } catch (error) {
      next(error);
    }
  }

  async deactivateLink(req: Request, res: Response, next: NextFunction) {
    try {
      const guardianId = BigInt(req.user?.id || 0);
      const studentId = BigInt(req.params.studentId);

      const relationship = await guardianService.deactivateLink(guardianId, studentId);

      res.json({
        message: 'Guardian link deactivated successfully',
        data: relationship
      });
    } catch (error) {
      next(error);
    }
  }

  async getStudents(req: Request, res: Response, next: NextFunction) {
    try {
      const guardianId = BigInt(req.user?.id || 0);

      const students = await guardianService.getStudents(guardianId);

      res.json({
        message: 'Students retrieved successfully',
        data: students
      });
    } catch (error) {
      next(error);
    }
  }

  async getGuardians(req: Request, res: Response, next: NextFunction) {
    try {
      const studentId = BigInt(req.user?.id || 0);

      const guardians = await guardianService.getGuardians(studentId);

      res.json({
        message: 'Guardians retrieved successfully',
        data: guardians
      });
    } catch (error) {
      next(error);
    }
  }
}
