import { Response } from 'express';
import { TestPlanService } from '../services/testPlan.service';
import { UnauthorizedError, ValidationError } from '../utils/errors';
import type { UserRequest } from '../types/auth.types';
import type { CreateTestPlanDTO, UpdateTestPlanDTO } from '../types/testPlan.types';

const testPlanService = new TestPlanService();

export class TestPlanController {
  async createTestPlan(req: UserRequest, res: Response) {
    try {
      const testPlanData = req.body as CreateTestPlanDTO;
      const userId = req.user?.id;

      if (!userId) {
        throw new UnauthorizedError('User not authenticated');
      }

      // Check if user has tutor or parent role
      const userRoles = (req.user?.roles || []).map((role: string) => role.toLowerCase());
      if (!userRoles.includes('tutor') && !userRoles.includes('parent')) {
        throw new UnauthorizedError('Only tutors and parents can create test plans');
      }

      // If user is a student, they can only create test plans for themselves
      if (userRoles.includes('student') && testPlanData.studentId.toString() !== userId.toString()) {
        throw new UnauthorizedError('Students can only create test plans for themselves');
      }

      const testPlan = await testPlanService.createTestPlan(userId, testPlanData);
      return res.status(201).json(testPlan);
    } catch (error) {
      console.error('Error in createTestPlan:', error);
      if (error instanceof UnauthorizedError) {
        return res.status(403).json({ error: error.message });
      }
      if (error instanceof ValidationError) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to create test plan'
      });
    }
  }

  async getTestPlans(req: UserRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new UnauthorizedError('User not authenticated');
      }

      const filters = {
        userId,
        studentId: req.query.studentId as string | undefined,
        status: req.query.status as string | undefined
      };

      // If user is a student, they can only view their own test plans
      const userRoles = (req.user?.roles || []).map((role: string) => role.toLowerCase());
      if (userRoles.includes('student') && filters.studentId && filters.studentId !== userId) {
        throw new UnauthorizedError('Students can only view their own test plans');
      }

      const testPlans = await testPlanService.getTestPlans(filters);
      return res.json(testPlans);
    } catch (error) {
      console.error('Error in getTestPlans:', error);
      if (error instanceof UnauthorizedError) {
        return res.status(403).json({ error: error.message });
      }
      return res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to get test plans'
      });
    }
  }

  async getTestPlan(req: UserRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new UnauthorizedError('User not authenticated');
      }

      const testPlan = await testPlanService.getTestPlan(req.params.id, userId);
      if (!testPlan) {
        return res.status(404).json({ error: 'Test plan not found' });
      }

      // Check if user has access to this test plan
      const userRoles = (req.user?.roles || []).map((role: string) => role.toLowerCase());
      if (userRoles.includes('student') && testPlan.student.userId.toString() !== userId.toString()) {
        throw new UnauthorizedError('Access denied');
      }

      return res.json(testPlan);
    } catch (error) {
      console.error('Error in getTestPlan:', error);
      if (error instanceof UnauthorizedError) {
        return res.status(403).json({ error: error.message });
      }
      return res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to get test plan'
      });
    }
  }

  async updateTestPlan(req: UserRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new UnauthorizedError('User not authenticated');
      }

      // Check if user has tutor or parent role
      const userRoles = (req.user?.roles || []).map((role: string) => role.toLowerCase());
      if (!userRoles.includes('tutor') && !userRoles.includes('parent')) {
        throw new UnauthorizedError('Only tutors and parents can update test plans');
      }

      const updateData = req.body as UpdateTestPlanDTO;
      const testPlan = await testPlanService.updateTestPlan(req.params.id, userId, updateData);
      if (!testPlan) {
        return res.status(404).json({ error: 'Test plan not found' });
      }
      return res.json(testPlan);
    } catch (error) {
      console.error('Error in updateTestPlan:', error);
      if (error instanceof UnauthorizedError) {
        return res.status(403).json({ error: error.message });
      }
      if (error instanceof ValidationError) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to update test plan'
      });
    }
  }

  async deleteTestPlan(req: UserRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new UnauthorizedError('User not authenticated');
      }

      // Check if user has tutor or parent role
      const userRoles = (req.user?.roles || []).map((role: string) => role.toLowerCase());
      if (!userRoles.includes('tutor') && !userRoles.includes('parent')) {
        throw new UnauthorizedError('Only tutors and parents can delete test plans');
      }

      await testPlanService.deleteTestPlan(req.params.id, userId);
      return res.status(204).send();
    } catch (error) {
      console.error('Error in deleteTestPlan:', error);
      if (error instanceof UnauthorizedError) {
        return res.status(403).json({ error: error.message });
      }
      return res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to delete test plan'
      });
    }
  }
}