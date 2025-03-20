import { PrismaClient, test_executions_status } from '@prisma/client';
import { AppError } from '../utils/error';
import { CreateTestPlanDTO, TestPlanResponse, TestExecutionResponse, TestResultsResponse } from '../types/test';

const prisma = new PrismaClient();

export class TestService {
  async createTestPlan(
    plannerId: string,
    data: CreateTestPlanDTO
  ): Promise<TestPlanResponse> {
    try {
      // Ensure configuration has default values if not provided
      const configuration = {
        topics: [],
        subtopics: [],
        totalQuestionCount: 5,
        difficulty: 'ALL',
        ...data.configuration
      };

      const testPlan = await prisma.test_plans.create({
        data: {
          template_id: data.templateId ? BigInt(data.templateId) : null,
          board_id: data.boardId,
          test_type: data.testType,
          timing_type: data.timingType,
          time_limit: data.timeLimit,
          student_id: BigInt(data.studentId),
          planned_by: BigInt(plannerId),
          configuration: JSON.stringify(configuration)
        },
        include: {
          test_executions: {
            select: {
              status: true
            },
            take: 1,
            orderBy: {
              execution_id: 'desc'
            }
          }
        }
      });

      return {
        id: testPlan.test_plan_id.toString(),
        templateId: testPlan.template_id?.toString(),
        studentId: testPlan.student_id.toString(),
        boardId: testPlan.board_id,
        testType: testPlan.test_type,
        timingType: testPlan.timing_type,
        timeLimit: testPlan.time_limit || undefined,
        configuration: testPlan.configuration ? JSON.parse(testPlan.configuration) : undefined,
        status: testPlan.test_executions[0]?.status || 'NOT_STARTED',
        plannedBy: testPlan.planned_by.toString(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
    } catch (error) {
      console.error('Error creating test plan:', error);
      if (error instanceof Error) {
        throw new AppError(500, `Failed to create test plan: ${error.message}`);
      }
      throw new AppError(500, 'Failed to create test plan: Unknown error');
    }
  }

  async getTestPlan(id: string): Promise<TestPlanResponse> {
    try {
      const testPlan = await prisma.test_plans.findUnique({
        where: {
          test_plan_id: Number(id)
        },
        include: {
          test_executions: {
            select: {
              status: true
            },
            take: 1,
            orderBy: {
              execution_id: 'desc'
            }
          }
        }
      });

      if (!testPlan) {
        throw new AppError(404, 'Test plan not found');
      }

      return {
        id: testPlan.test_plan_id.toString(),
        templateId: testPlan.template_id?.toString(),
        studentId: testPlan.student_id.toString(),
        boardId: testPlan.board_id,
        testType: testPlan.test_type,
        timingType: testPlan.timing_type,
        timeLimit: testPlan.time_limit || undefined,
        configuration: testPlan.configuration ? JSON.parse(testPlan.configuration) : undefined,
        status: testPlan.test_executions[0]?.status || 'NOT_STARTED',
        plannedBy: testPlan.planned_by.toString(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
    } catch (error) {
      console.error('Error getting test plan:', error);
      if (error instanceof Error) {
        throw new AppError(500, `Failed to get test plan: ${error.message}`);
      }
      throw new AppError(500, 'Failed to get test plan: Unknown error');
    }
  }

  async getStudentTests(studentId: string, filters: { status?: string; from?: string; to?: string }): Promise<TestPlanResponse[]> {
    try {
      const where: any = {
        student_id: BigInt(studentId)
      };

      if (filters.status) {
        where.test_executions = {
          some: {
            status: filters.status
          }
        };
      }

      if (filters.from || filters.to) {
        where.created_at = {};
        if (filters.from) {
          where.created_at.gte = new Date(filters.from);
        }
        if (filters.to) {
          where.created_at.lte = new Date(filters.to);
        }
      }

      const testPlans = await prisma.test_plans.findMany({
        where,
        include: {
          test_executions: {
            select: {
              status: true
            },
            take: 1,
            orderBy: {
              execution_id: 'desc'
            }
          }
        },
        orderBy: {
          test_plan_id: 'desc'
        }
      });

      return testPlans.map(plan => ({
        id: plan.test_plan_id.toString(),
        templateId: plan.template_id?.toString(),
        studentId: plan.student_id.toString(),
        boardId: plan.board_id,
        testType: plan.test_type,
        timingType: plan.timing_type,
        timeLimit: plan.time_limit || undefined,
        configuration: plan.configuration ? JSON.parse(plan.configuration) : undefined,
        status: plan.test_executions[0]?.status || 'NOT_STARTED',
        plannedBy: plan.planned_by.toString(),
        createdAt: new Date(),
        updatedAt: new Date()
      }));
    } catch (error) {
      console.error('Error getting student tests:', error);
      if (error instanceof Error) {
        throw new AppError(500, `Failed to get student tests: ${error.message}`);
      }
      throw new AppError(500, 'Failed to get student tests: Unknown error');
    }
  }

  async startTest(executionId: string): Promise<TestExecutionResponse> {
    try {
      const execution = await prisma.test_executions.update({
        where: {
          execution_id: Number(executionId)
        },
        data: {
          status: 'IN_PROGRESS',
          started_at: new Date(),
          test_data: JSON.stringify({
            startTime: new Date().toISOString()
          })
        },
        include: {
          test_plans: {
            select: {
              test_plan_id: true,
              template_id: true,
              student_id: true,
              board_id: true,
              test_type: true,
              timing_type: true,
              time_limit: true,
              configuration: true,
              planned_by: true
            }
          }
        }
      });

      return {
        id: execution.execution_id.toString(),
        testPlanId: execution.test_plan_id.toString(),
        status: execution.status,
        startedAt: execution.started_at || undefined,
        completedAt: execution.completed_at || undefined,
        score: execution.score || undefined,
        answers: execution.test_data ? JSON.parse(execution.test_data).responses || [] : [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
    } catch (error) {
      console.error('Error starting test:', error);
      if (error instanceof Error) {
        throw new AppError(500, `Failed to start test: ${error.message}`);
      }
      throw new AppError(500, 'Failed to start test: Unknown error');
    }
  }

  async getTestStatus(executionId: string): Promise<TestExecutionResponse> {
    try {
      const execution = await prisma.test_executions.findUnique({
        where: {
          execution_id: Number(executionId)
        },
        include: {
          test_plans: {
            select: {
              test_plan_id: true,
              template_id: true,
              student_id: true,
              board_id: true,
              test_type: true,
              timing_type: true,
              time_limit: true,
              configuration: true,
              planned_by: true
            }
          }
        }
      });

      if (!execution) {
        throw new AppError(404, 'Test execution not found');
      }

      return {
        id: execution.execution_id.toString(),
        testPlanId: execution.test_plan_id.toString(),
        status: execution.status,
        startedAt: execution.started_at || undefined,
        completedAt: execution.completed_at || undefined,
        score: execution.score || undefined,
        answers: execution.test_data ? JSON.parse(execution.test_data).responses || [] : [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
    } catch (error) {
      console.error('Error getting test status:', error);
      if (error instanceof Error) {
        throw new AppError(500, `Failed to get test status: ${error.message}`);
      }
      throw new AppError(500, 'Failed to get test status: Unknown error');
    }
  }

  async submitAnswer(
    executionId: string,
    questionId: string,
    answer: string
  ): Promise<TestExecutionResponse> {
    try {
      const execution = await prisma.test_executions.findUnique({
        where: {
          execution_id: Number(executionId)
        },
        include: {
          test_plans: {
            select: {
              test_plan_id: true,
              template_id: true,
              student_id: true,
              board_id: true,
              test_type: true,
              timing_type: true,
              time_limit: true,
              configuration: true,
              planned_by: true
            }
          }
        }
      });

      if (!execution) {
        throw new AppError(404, 'Test execution not found');
      }

      if (execution.status !== 'IN_PROGRESS') {
        throw new AppError(400, 'Test is not in progress');
      }

      let testData;
      try {
        testData = JSON.parse(execution.test_data || '{}');
      } catch (error) {
        throw new AppError(500, 'Failed to parse test data');
      }

      const responses = testData.responses || [];
      responses.push({
        questionId: questionId.toString(),
        answer,
        submittedAt: new Date().toISOString()
      });

      const updatedExecution = await prisma.test_executions.update({
        where: {
          execution_id: Number(executionId)
        },
        data: {
          test_data: JSON.stringify({
            ...testData,
            responses
          })
        },
        include: {
          test_plans: {
            select: {
              test_plan_id: true,
              template_id: true,
              student_id: true,
              board_id: true,
              test_type: true,
              timing_type: true,
              time_limit: true,
              configuration: true,
              planned_by: true
            }
          }
        }
      });

      return {
        id: updatedExecution.execution_id.toString(),
        testPlanId: updatedExecution.test_plan_id.toString(),
        status: updatedExecution.status,
        startedAt: updatedExecution.started_at || undefined,
        completedAt: updatedExecution.completed_at || undefined,
        score: updatedExecution.score || undefined,
        answers: JSON.parse(updatedExecution.test_data || '{}').responses || [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
    } catch (error) {
      console.error('Error submitting answer:', error);
      if (error instanceof AppError) {
        throw error;
      }
      if (error instanceof Error) {
        throw new AppError(500, `Failed to submit answer: ${error.message}`);
      }
      throw new AppError(500, 'Failed to submit answer: Unknown error');
    }
  }

  async getTestResults(executionId: string): Promise<TestResultsResponse> {
    try {
      const execution = await prisma.test_executions.findUnique({
        where: {
          execution_id: Number(executionId)
        }
      });

      if (!execution) {
        throw new AppError(404, 'Test execution not found');
      }

      if (!execution.completed_at) {
        throw new AppError(400, 'Test has not been completed');
      }

      const testData = JSON.parse(execution.test_data || '{}');
      const answers = testData.responses || [];

      return {
        id: execution.execution_id.toString(),
        score: execution.score || 0,
        answers,
        completedAt: execution.completed_at
      };
    } catch (error) {
      console.error('Error getting test results:', error);
      if (error instanceof Error) {
        throw new AppError(500, `Failed to get test results: ${error.message}`);
      }
      throw new AppError(500, 'Failed to get test results: Unknown error');
    }
  }

  async completeTest(executionId: string): Promise<TestResultsResponse> {
    try {
      const execution = await prisma.test_executions.findUnique({
        where: {
          execution_id: Number(executionId)
        }
      });

      if (!execution) {
        throw new AppError(404, 'Test execution not found');
      }

      const testData = JSON.parse(execution.test_data || '{}');
      const responses = testData.responses || [];
      const questions = testData.questions || [];

      // Calculate score
      let correctAnswers = 0;
      responses.forEach((response: any) => {
        const question = questions.find((q: any) => q.id === response.questionId);
        if (question && question.correctAnswer === response.answer) {
          correctAnswers++;
        }
      });

      const score = Math.round((correctAnswers / questions.length) * 100);

      const updatedExecution = await prisma.test_executions.update({
        where: {
          execution_id: Number(executionId)
        },
        data: {
          status: 'COMPLETED' as test_executions_status,
          completed_at: new Date(),
          score
        }
      });

      return {
        id: updatedExecution.execution_id.toString(),
        score: updatedExecution.score || 0,
        answers: responses,
        completedAt: updatedExecution.completed_at || new Date()
      };
    } catch (error) {
      console.error('Error completing test:', error);
      if (error instanceof Error) {
        throw new AppError(500, `Failed to complete test: ${error.message}`);
      }
      throw new AppError(500, 'Failed to complete test: Unknown error');
    }
  }

  async submitAllAnswers(
    executionId: string,
    answers: Array<{ questionId: string; answer: string }>
  ): Promise<TestResultsResponse> {
    try {
      const execution = await prisma.test_executions.findUnique({
        where: {
          execution_id: Number(executionId)
        }
      });

      if (!execution) {
        throw new AppError(404, 'Test execution not found');
      }

      if (execution.status !== 'IN_PROGRESS') {
        throw new AppError(400, 'Test is not in progress');
      }

      let testData;
      try {
        testData = JSON.parse(execution.test_data || '{}');
      } catch (error) {
        throw new AppError(500, 'Failed to parse test data');
      }

      const responses = answers.map(a => ({
        ...a,
        submittedAt: new Date().toISOString()
      }));

      const score = await this.calculateScore(testData.questions || [], responses);

      const completedExecution = await prisma.test_executions.update({
        where: {
          execution_id: Number(executionId)
        },
        data: {
          status: 'COMPLETED' as test_executions_status,
          completed_at: new Date(),
          test_data: JSON.stringify({
            ...testData,
            responses
          }),
          score
        }
      });

      return {
        id: completedExecution.execution_id.toString(),
        score: completedExecution.score || 0,
        answers: responses,
        completedAt: completedExecution.completed_at || new Date()
      };
    } catch (error) {
      console.error('Error submitting all answers:', error);
      if (error instanceof AppError) {
        throw error;
      }
      if (error instanceof Error) {
        throw new AppError(500, `Failed to submit all answers: ${error.message}`);
      }
      throw new AppError(500, 'Failed to submit all answers: Unknown error');
    }
  }

  private async calculateScore(questions: any[], responses: any[]): Promise<number> {
    try {
      let correctAnswers = 0;
      responses.forEach((response: any) => {
        const question = questions.find((q: any) => q.id === response.questionId);
        if (question && question.correctAnswer === response.answer) {
          correctAnswers++;
        }
      });

      return Math.round((correctAnswers / questions.length) * 100);
    } catch (error) {
      console.error('Error calculating score:', error);
      throw error;
    }
  }
}