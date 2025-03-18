import { Request, Response, NextFunction } from 'express';
import { QuestionSetService } from '../services/questionSet.service';

export class QuestionSetController {
  private questionSetService: QuestionSetService;

  constructor() {
    this.questionSetService = new QuestionSetService();
  }

  async createQuestionSet(req: Request, res: Response, next: NextFunction) {
    try {
      const { id: userId } = req.user;
      const questionSet = await this.questionSetService.createQuestionSet(BigInt(userId), req.body);
      res.status(201).json({
        message: 'Question set created successfully',
        data: questionSet
      });
    } catch (error) {
      next(error);
    }
  }

  async getQuestionSet(req: Request, res: Response, next: NextFunction) {
    try {
      const setId = BigInt(req.params.setId);
      const questionSet = await this.questionSetService.getQuestionSet(setId);
      res.json({
        message: 'Question set retrieved successfully',
        data: questionSet
      });
    } catch (error) {
      next(error);
    }
  }

  async linkToTestPlan(req: Request, res: Response, next: NextFunction) {
    try {
      const setId = BigInt(req.params.setId);
      const testPlanId = BigInt(req.params.testPlanId);
      const { sequence } = req.body;

      await this.questionSetService.linkToTestPlan(testPlanId, setId, sequence);
      res.status(201).json({
        message: 'Question set linked to test plan successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}
