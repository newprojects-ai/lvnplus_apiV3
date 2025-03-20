import { Request, Response, NextFunction } from 'express';
import { TestService } from '../services/test.service';
import { UserRequest } from '../types/auth';
import { CreateTestPlanDTO } from '../types/test';
import { AppError } from '../utils/error';

const testService = new TestService();

export const createTestPlan = async (
  req: UserRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError(401, 'User ID not found');
    }

    const planData: CreateTestPlanDTO = req.body;
    
    // If user is a student, they can only create test plans for themselves
    if (req.user?.roles.includes('student') && planData.studentId.toString() !== userId.toString()) {
      throw new AppError(403, 'Students can only create test plans for themselves');
    }
    
    const plan = await testService.createTestPlan(userId, planData);
    res.status(201).json(plan);
  } catch (error) {
    next(error);
  }
};

export const getTestPlan = async (
  req: UserRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError(401, 'User ID not found');
    }

    const plan = await testService.getTestPlan(id, userId);
    
    // If user is a student, they can only view their own test plans
    if (req.user?.roles.includes('student') && plan.studentId.toString() !== userId.toString()) {
      throw new AppError(403, 'Students can only view their own test plans');
    }

    res.json(plan);
  } catch (error) {
    next(error);
  }
};

export const getStudentTests = async (
  req: UserRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { studentId } = req.params;
    const { status, from, to } = req.query;
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError(401, 'User ID not found');
    }

    // If user is a student, they can only view their own tests
    if (req.user?.roles.includes('student') && studentId.toString() !== userId.toString()) {
      throw new AppError(403, 'Students can only view their own tests');
    }
    
    const tests = await testService.getStudentTests(
      studentId,
      userId,
      {
        status: status as string,
        from: from as string,
        to: to as string,
      }
    );
    res.json(tests);
  } catch (error) {
    next(error);
  }
};

export const startTest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { executionId } = req.params;
    const execution = await testService.startTest(executionId);
    res.status(200).json(execution);
  } catch (error) {
    next(error);
  }
};

export const submitTest = async (
  req: UserRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { executionId } = req.params;
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError(401, 'User ID not found');
    }

    const { questionId, answer } = req.body;
    
    const execution = await testService.submitAnswer(
      executionId,
      questionId,
      answer
    );
    res.json(execution);
  } catch (error) {
    next(error);
  }
};

export const getTestStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { executionId } = req.params;
    const status = await testService.getTestStatus(executionId);
    res.status(200).json(status);
  } catch (error) {
    next(error);
  }
};

export const getTestResults = async (
  req: UserRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { executionId } = req.params;
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError(401, 'User ID not found');
    }
    
    const results = await testService.getTestResults(executionId, userId);
    res.json(results);
  } catch (error) {
    next(error);
  }
};

export const completeTest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { executionId } = req.params;
    const result = await testService.completeTest(executionId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const submitAllAnswers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { executionId } = req.params;
    const { answers } = req.body;
    const result = await testService.submitAllAnswers(executionId, answers);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};