import { Prisma } from '@prisma/client';
import prisma from '../lib/prisma';
import {
  CreateTestPlanDTO,
  TestPlanResponse,
  TestExecutionResponse,
} from '../types';
import { NotFoundError, UnauthorizedError, ValidationError } from '../utils/errors';

export class TestService {
  async createTestPlan(
    plannerId: bigint,
    data: CreateTestPlanDTO
  ): Promise<TestPlanResponse> {
    const testPlan = await prisma.test_plans.create({
      data: {
        template_id: data.templateId ? BigInt(data.templateId) : null,
        board_id: data.boardId,
        test_type: data.testType,
        timing_type: data.timingType,
        time_limit: data.timeLimit,
        student_id: BigInt(data.studentId),
        planned_by: plannerId,
        configuration: JSON.stringify(data.configuration),
      },
      include: {
        users_test_plans_student_idTousers: {
          select: {
            user_id: true,
            email: true,
            first_name: true,
            last_name: true,
          },
        },
        test_executions: {
          select: {
            status: true,
            started_at: true,
            completed_at: true,
            score: true,
          },
          take: 1,
          orderBy: {
            execution_id: 'desc',
          },
        },
      },
    });

    // Create initial test execution
    await prisma.test_executions.create({
      data: {
        test_plan_id: testPlan.test_plan_id,
        status: 'NOT_STARTED',
        test_data: JSON.stringify({
          questions: await this.selectQuestions(data.configuration),
          responses: [],
          timing: [],
        }),
      },
    });

    return this.formatTestPlanResponse(testPlan);
  }

  async getTestPlan(
    testPlanId: bigint,
    userId: bigint
  ): Promise<TestPlanResponse> {
    const testPlan = await prisma.test_plans.findUnique({
      where: { test_plan_id: testPlanId },
      include: {
        users_test_plans_student_idTousers: {
          select: {
            user_id: true,
            email: true,
            first_name: true,
            last_name: true,
          },
        },
        test_executions: {
          select: {
            status: true,
            started_at: true,
            completed_at: true,
            score: true,
          },
          take: 1,
          orderBy: {
            execution_id: 'desc',
          },
        },
      },
    });

    if (!testPlan) {
      throw new NotFoundError('Test plan not found');
    }

    if (testPlan.student_id !== userId && testPlan.planned_by !== userId) {
      throw new UnauthorizedError('Unauthorized access to test plan');
    }

    return this.formatTestPlanResponse(testPlan);
  }

  async getStudentTests(
    studentId: bigint,
    userId: bigint,
    filters: {
      status?: string;
      from?: string;
      to?: string;
    }
  ) {
    // Verify access rights
    if (studentId !== userId) {
      const hasAccess = await this.verifyStudentAccess(userId, studentId);
      if (!hasAccess) {
        throw new UnauthorizedError('Unauthorized access to student tests');
      }
    }

    const where: Prisma.test_plansWhereInput = {
      student_id: studentId,
    };

    if (filters.status) {
      where.test_executions = {
        some: {
          status: filters.status as any,
        },
      };
    }

    if (filters.from || filters.to) {
      where.planned_at = {};
      if (filters.from) {
        where.planned_at.gte = new Date(filters.from);
      }
      if (filters.to) {
        where.planned_at.lte = new Date(filters.to);
      }
    }

    const testPlans = await prisma.test_plans.findMany({
      where,
      include: {
        users_test_plans_student_idTousers: {
          select: {
            user_id: true,
            email: true,
            first_name: true,
            last_name: true,
          },
        },
        test_executions: {
          select: {
            status: true,
            started_at: true,
            completed_at: true,
            score: true,
          },
          take: 1,
          orderBy: {
            execution_id: 'desc',
          },
        },
      },
      orderBy: {
        planned_at: 'desc',
      },
    });

    return testPlans.map(this.formatTestPlanResponse);
  }

  async startTest(
    testPlanId: bigint,
    userId: bigint
  ): Promise<TestExecutionResponse> {
    const testPlan = await prisma.test_plans.findUnique({
      where: { test_plan_id: testPlanId },
      include: {
        test_executions: {
          orderBy: {
            execution_id: 'desc',
          },
          take: 1,
        },
      },
    });

    if (!testPlan) {
      throw new NotFoundError('Test plan not found');
    }

    if (testPlan.student_id !== userId) {
      throw new UnauthorizedError('Only the assigned student can start the test');
    }

    const latestExecution = testPlan.test_executions[0];
    if (!latestExecution || latestExecution.status !== 'NOT_STARTED') {
      throw new ValidationError('Test cannot be started');
    }

    const execution = await prisma.test_executions.update({
      where: { execution_id: latestExecution.execution_id },
      data: {
        status: 'IN_PROGRESS',
        started_at: new Date(),
      },
    });

    return this.formatExecutionResponse(execution);
  }

  async submitAnswer(
    executionId: bigint,
    userId: bigint,
    answer: {
      questionId: bigint;
      answer: string;
      timeSpent: number;
    }
  ): Promise<TestExecutionResponse> {
    const execution = await this.findExecutionWithAccess(executionId, userId);

    if (execution.status !== 'IN_PROGRESS') {
      throw new ValidationError('Test is not in progress');
    }

    const testData = JSON.parse(execution.test_data);
    testData.responses.push(answer);

    const updatedExecution = await prisma.test_executions.update({
      where: { execution_id: executionId },
      data: {
        test_data: JSON.stringify(testData),
      },
    });

    return this.formatExecutionResponse(updatedExecution);
  }

  async submitAllAnswers(
    executionId: bigint,
    userId: bigint,
    data: {
      responses: Array<{
        questionId: number;
        answer: string;
        timeTaken: number;
      }>;
      endTime: number;
    }
  ): Promise<TestExecutionResponse> {
    const execution = await this.findExecutionWithAccess(executionId, userId);

    if (execution.status !== 'IN_PROGRESS') {
      throw new ValidationError('Test is not in progress');
    }

    const testData = JSON.parse(execution.test_data);
    
    // Update responses with validation and scoring
    testData.responses = data.responses.map(response => ({
      questionId: BigInt(response.questionId),
      answer: response.answer,
      timeSpent: response.timeTaken
    }));

    const scoringResult = this.validateAndScoreResponses(testData);
    
    // Update test data with scoring information
    testData.responses = scoringResult.responses;
    testData.total_correct = scoringResult.total_correct;
    testData.total_questions = scoringResult.total_questions;
    testData.score = scoringResult.score;

    const updatedExecution = await prisma.test_executions.update({
      where: { execution_id: executionId },
      data: {
        test_data: JSON.stringify(testData),
        score: scoringResult.score // Update the score column
      }
    });

    return this.formatExecutionResponse(updatedExecution);
  }

  async getTestStatus(
    executionId: bigint,
    userId: bigint
  ) {
    const execution = await this.findExecutionWithAccess(executionId, userId);
    const testData = JSON.parse(execution.test_data);

    return {
      status: execution.status,
      timeRemaining: this.calculateTimeRemaining(execution),
      questionsAnswered: testData.responses.length,
      totalQuestions: testData.questions.length,
    };
  }

  async getTestResults(
    executionId: bigint,
    userId: bigint
  ) {
    const execution = await this.findExecutionWithAccess(executionId, userId);

    if (execution.status !== 'COMPLETED') {
      throw new ValidationError('Test results are not available');
    }

    const testData = JSON.parse(execution.test_data);
    const analysis = this.analyzeTestResults(testData);

    return {
      score: execution.score,
      totalQuestions: testData.questions.length,
      correctAnswers: analysis.correctAnswers,
      timeSpent: analysis.totalTimeSpent,
      questionAnalysis: analysis.questionAnalysis,
    };
  }

  async completeTest(
    executionId: bigint,
    userId: bigint,
    timingData: {
      endTime: number;
      startTime: number;
      TotalTimeTaken: number;
      testTotalTimeTaken: number;
    }
  ): Promise<TestExecutionResponse> {
    const execution = await this.findExecutionWithAccess(executionId, userId);

    if (execution.status !== 'IN_PROGRESS') {
      throw new ValidationError('Test is not in progress');
    }

    const testData = JSON.parse(execution.test_data);
    
    // Update timing information
    testData.timing = {
      ...testData.timing,
      ...timingData,
      completedAt: new Date().toISOString()
    };

    // Make sure responses are scored if not already
    if (!testData.score) {
      const scoringResult = this.validateAndScoreResponses(testData);
      testData.responses = scoringResult.responses;
      testData.total_correct = scoringResult.total_correct;
      testData.total_questions = scoringResult.total_questions;
      testData.score = scoringResult.score;
    }

    const updatedExecution = await prisma.test_executions.update({
      where: { execution_id: executionId },
      data: {
        status: 'COMPLETED',
        completed_at: new Date(),
        score: testData.score,
        test_data: JSON.stringify(testData)
      },
      include: {
        test_plans: true
      }
    });

    return this.formatExecutionResponse(updatedExecution);
  }

  private validateAndScoreResponses(testData: any) {
    console.log('Validating and scoring responses:', JSON.stringify(testData, null, 2));
    
    let correctCount = 0;
    const scoredResponses = testData.responses.map((response: any) => {
      const question = testData.questions.find(
        (q: any) => BigInt(q.question_id) === BigInt(response.questionId)
      );

      const isCorrect = question && 
        String(response.answer).toLowerCase().trim() === 
        String(question.correct_answer).toLowerCase().trim();

      if (isCorrect) {
        correctCount++;
      }

      console.log('Response validation:', {
        questionId: response.questionId,
        givenAnswer: response.answer,
        correctAnswer: question?.correct_answer,
        isCorrect
      });

      return {
        ...response,
        is_correct: isCorrect,
        correct_answer: question?.correct_answer,
        question_text: question?.question_text
      };
    });

    const totalQuestions = testData.questions.length;
    const score = Math.round((correctCount / totalQuestions) * 100);

    console.log('Final scoring:', {
      correctCount,
      totalQuestions,
      score
    });

    return {
      responses: scoredResponses,
      total_correct: correctCount,
      total_questions: totalQuestions,
      score
    };
  }

  private async selectQuestions(configuration: any) {
    // Implementation of question selection logic
    // This should be similar to the logic in TestPlanService
    return [];
  }

  private async findExecutionWithAccess(executionId: bigint, userId: bigint) {
    const execution = await prisma.test_executions.findUnique({
      where: { execution_id: executionId },
      include: {
        test_plans: true,
      },
    });

    if (!execution) {
      throw new NotFoundError('Test execution not found');
    }

    if (
      execution.test_plans.student_id !== userId &&
      execution.test_plans.planned_by !== userId
    ) {
      throw new UnauthorizedError('Unauthorized access to test execution');
    }

    return execution;
  }

  private async verifyStudentAccess(teacherId: bigint, studentId: bigint) {
    // In a real implementation, this would check if the teacher has access to the student
    // For now, we'll assume all teachers have access to all students
    const teacher = await prisma.users.findFirst({
      where: {
        user_id: teacherId,
        user_roles: {
          some: {
            roles: {
              role_name: {
                in: ['TEACHER', 'ADMIN'],
              },
            },
          },
        },
      },
    });

    return !!teacher;
  }

  private calculateTimeRemaining(execution: any) {
    if (!execution.test_plans.time_limit || execution.status !== 'IN_PROGRESS') {
      return null;
    }

    const startTime = new Date(execution.started_at).getTime();
    const timeLimit = execution.test_plans.time_limit * 60 * 1000; // Convert minutes to milliseconds
    const elapsed = Date.now() - startTime;

    return Math.max(0, timeLimit - elapsed);
  }

  private analyzeTestResults(testData: any) {
    console.log('Analyzing test results:', JSON.stringify(testData, null, 2));
    
    let correctAnswers = 0;
    let totalTimeSpent = 0;
    const questionAnalysis = [];

    for (const response of testData.responses) {
      const question = testData.questions.find(
        (q: any) => BigInt(q.question_id) === BigInt(response.questionId)
      );

      console.log('Comparing answer:', {
        questionId: response.questionId,
        givenAnswer: response.answer,
        correctAnswer: question?.correct_answer,
        question
      });

      const isCorrect = question && 
        String(response.answer).toLowerCase().trim() === 
        String(question.correct_answer).toLowerCase().trim();

      if (isCorrect) {
        console.log(`Question ${response.questionId} is correct`);
        correctAnswers++;
      }

      totalTimeSpent += response.timeSpent;

      questionAnalysis.push({
        questionId: response.questionId,
        timeSpent: response.timeSpent,
        isCorrect,
        givenAnswer: response.answer,
        correctAnswer: question?.correct_answer
      });
    }

    console.log('Analysis results:', {
      correctAnswers,
      totalQuestions: testData.questions.length,
      score: Math.round((correctAnswers / testData.questions.length) * 100)
    });

    return {
      correctAnswers,
      totalTimeSpent,
      questionAnalysis
    };
  }

  private formatTestPlanResponse(testPlan: any): TestPlanResponse {
    return {
      testPlanId: testPlan.test_plan_id,
      testType: testPlan.test_type,
      timingType: testPlan.timing_type,
      timeLimit: testPlan.time_limit,
      student: {
        userId: testPlan.users_test_plans_student_idTousers.user_id,
        email: testPlan.users_test_plans_student_idTousers.email,
        firstName: testPlan.users_test_plans_student_idTousers.first_name,
        lastName: testPlan.users_test_plans_student_idTousers.last_name,
      },
      configuration: JSON.parse(testPlan.configuration),
      execution: testPlan.test_executions[0] ? {
        status: testPlan.test_executions[0].status,
        startedAt: testPlan.test_executions[0].started_at,
        completedAt: testPlan.test_executions[0].completed_at,
        score: testPlan.test_executions[0].score,
      } : undefined,
    };
  }

  private formatExecutionResponse(execution: any): TestExecutionResponse {
    const testData = execution.test_data ? JSON.parse(execution.test_data) : {};
    
    return {
      executionId: execution.execution_id.toString(),
      testPlanId: execution.test_plan_id.toString(),
      studentId: execution.test_plans?.student_id?.toString(),
      status: execution.status,
      startedAt: execution.started_at,
      completedAt: execution.completed_at,
      score: execution.score,
      testData: {
        questions: testData.questions || [],
        responses: testData.responses || [],
        total_correct: testData.total_correct,
        total_questions: testData.total_questions,
        timing: testData.timing || {
          startTime: execution.started_at ? new Date(execution.started_at).getTime() : undefined,
          endTime: execution.completed_at ? new Date(execution.completed_at).getTime() : undefined,
          pausedDuration: 0
        },
        question_analysis: testData.question_analysis || []
      }
    };
  }
}