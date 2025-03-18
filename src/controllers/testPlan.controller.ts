import { Request, Response } from 'express';
import { hasRole } from '../middleware/roles';
import { CreateTestPlanDTO, UpdateTestPlanDTO, Role } from '../types';
import { TestPlanService } from '../services/testPlan.service';
import { NotFoundError, ValidationError } from '../utils/errors';

export class TestPlanController {
  private testPlanService: TestPlanService;

  constructor() {
    this.testPlanService = new TestPlanService();
  }

  async createTestPlan(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new ValidationError('User ID is required');
      }

      const testPlanData: CreateTestPlanDTO = {
        template_id: req.body.template_id,
        student_id: req.body.student_id,
        scheduled_for: req.body.scheduled_for,
        description: req.body.description
      };

      const testPlan = await this.testPlanService.createTestPlan(
        userId.toString(),
        testPlanData
      );

      res.status(201).json(testPlan);
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.message });
      } else {
        console.error('Error creating test plan:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async getTestPlans(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new ValidationError('User ID is required');
      }

      const filters = {
        userId: userId.toString(),
        studentId: req.query.student_id?.toString(),
        status: req.query.status?.toString()
      };

      const testPlans = await this.testPlanService.getTestPlans(filters);
      res.json(testPlans);
    } catch (error) {
      console.error('Error getting test plans:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getTestPlan(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new ValidationError('User ID is required');
      }

      const testPlanId = req.params.planId;
      if (!testPlanId) {
        throw new ValidationError('Test plan ID is required');
      }

      const testPlan = await this.testPlanService.getTestPlan(
        testPlanId,
        userId.toString()
      );

      if (!testPlan) {
        throw new NotFoundError('Test plan not found');
      }

      res.json(testPlan);
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(404).json({ error: error.message });
      } else if (error instanceof ValidationError) {
        res.status(400).json({ error: error.message });
      } else {
        console.error('Error getting test plan:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async updateTestPlan(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new ValidationError('User ID is required');
      }

      const testPlanId = req.params.planId;
      if (!testPlanId) {
        throw new ValidationError('Test plan ID is required');
      }

      const updateData: UpdateTestPlanDTO = {
        scheduled_for: req.body.scheduled_for,
        description: req.body.description,
        status: req.body.status
      };

      const testPlan = await this.testPlanService.updateTestPlan(
        testPlanId,
        userId.toString(),
        updateData
      );

      if (!testPlan) {
        throw new NotFoundError('Test plan not found');
      }

      res.json(testPlan);
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(404).json({ error: error.message });
      } else if (error instanceof ValidationError) {
        res.status(400).json({ error: error.message });
      } else {
        console.error('Error updating test plan:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async deleteTestPlan(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new ValidationError('User ID is required');
      }

      const testPlanId = req.params.planId;
      if (!testPlanId) {
        throw new ValidationError('Test plan ID is required');
      }

      await this.testPlanService.deleteTestPlan(
        testPlanId,
        userId.toString()
      );

      res.status(204).send();
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(404).json({ error: error.message });
      } else if (error instanceof ValidationError) {
        res.status(400).json({ error: error.message });
      } else {
        console.error('Error deleting test plan:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }
}