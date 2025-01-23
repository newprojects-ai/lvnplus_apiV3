import { Request, Response, NextFunction } from 'express';
import { TestAssignmentService } from '../services/test-assignment.service';
import { ValidationError } from '../utils/errors';

const testAssignmentService = new TestAssignmentService();

export class TestAssignmentController {
  async assignToStudent(req: Request, res: Response, next: NextFunction) {
    try {
      const assignerId = BigInt(req.user?.id || 0);
      const { testPlanId, studentId, dueDate } = req.body;

      if (!testPlanId || !studentId || !dueDate) {
        throw new ValidationError('Test plan ID, student ID, and due date are required');
      }

      const assignment = await testAssignmentService.assignToStudent(
        BigInt(testPlanId),
        assignerId,
        BigInt(studentId),
        new Date(dueDate)
      );

      res.status(201).json({
        message: 'Test assigned to student successfully',
        data: assignment
      });
    } catch (error) {
      next(error);
    }
  }

  async assignToGroup(req: Request, res: Response, next: NextFunction) {
    try {
      const assignerId = BigInt(req.user?.id || 0);
      const { testPlanId, groupId, dueDate } = req.body;

      if (!testPlanId || !groupId || !dueDate) {
        throw new ValidationError('Test plan ID, group ID, and due date are required');
      }

      const assignment = await testAssignmentService.assignToGroup(
        BigInt(testPlanId),
        assignerId,
        BigInt(groupId),
        new Date(dueDate)
      );

      res.status(201).json({
        message: 'Test assigned to group successfully',
        data: assignment
      });
    } catch (error) {
      next(error);
    }
  }

  async getAssignmentsByAssigner(req: Request, res: Response, next: NextFunction) {
    try {
      const assignerId = BigInt(req.user?.id || 0);

      const assignments = await testAssignmentService.getAssignmentsByAssigner(assignerId);

      res.json({
        message: 'Assignments retrieved successfully',
        data: assignments
      });
    } catch (error) {
      next(error);
    }
  }

  async getAssignmentsByStudent(req: Request, res: Response, next: NextFunction) {
    try {
      const studentId = BigInt(req.user?.id || 0);

      const assignments = await testAssignmentService.getAssignmentsByStudent(studentId);

      res.json({
        message: 'Assignments retrieved successfully',
        data: assignments
      });
    } catch (error) {
      next(error);
    }
  }

  async updateAssignmentStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const assignmentId = BigInt(req.params.assignmentId);
      const { status } = req.body;

      if (!status) {
        throw new ValidationError('Assignment status is required');
      }

      const assignment = await testAssignmentService.updateAssignmentStatus(
        assignmentId,
        status
      );

      res.json({
        message: 'Assignment status updated successfully',
        data: assignment
      });
    } catch (error) {
      next(error);
    }
  }

  async getAssignmentDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const assignmentId = BigInt(req.params.assignmentId);

      const assignment = await testAssignmentService.getAssignmentDetails(assignmentId);

      res.json({
        message: 'Assignment details retrieved successfully',
        data: assignment
      });
    } catch (error) {
      next(error);
    }
  }
}
