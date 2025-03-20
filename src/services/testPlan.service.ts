import { PrismaClient, test_plans_test_type, test_plans_timing_type, Prisma } from '@prisma/client';
import { NotFoundError, ValidationError, UnauthorizedError } from '../utils/errors';
import type { CreateTestPlanDTO, TestPlanResponse, UpdateTestPlanDTO } from '../types/testPlan.types';
import { TestType, TimingType, TestStatus } from '../types/enums.types';

const prisma = new PrismaClient();

export class TestPlanService {
  async createTestPlan(
    plannerId: string,
    data: CreateTestPlanDTO
  ): Promise<TestPlanResponse> {
    try {
      // Validate required fields
      if (!data.studentId) {
        throw new ValidationError('A student must be assigned to the test plan');
      }

      // Convert IDs to safe numbers
      const safePlannerId = Number(plannerId);
      const safeStudentId = Number(data.studentId);
      const boardId = Number(data.boardId);
      const templateId = data.templateId ? Number(data.templateId) : null;
      
      // Create test plan in the database
      const testPlan = await prisma.test_plans.create({
        data: {
          board_id: boardId,
          test_type: data.testType.toUpperCase() as test_plans_test_type,
          timing_type: data.timingType.toUpperCase() as test_plans_timing_type,
          time_limit: data.timeLimit,
          student_id: safeStudentId,
          planned_by: safePlannerId,
          planned_at: new Date(),
          configuration: JSON.stringify(data.configuration),
          template_id: templateId
        },
        include: {
          student: {
            select: {
              user_id: true,
              email: true,
              first_name: true,
              last_name: true
            }
          },
          planner: {
            select: {
              user_id: true,
              email: true,
              first_name: true,
              last_name: true
            }
          },
          test_templates: true,
          exam_boards: true,
          test_executions: {
            take: 1,
            orderBy: {
              started_at: 'desc'
            }
          }
        }
      });

      return this.formatTestPlanResponse(testPlan);
    } catch (error) {
      console.error('Error creating test plan:', error);
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new Error('Failed to create test plan');
    }
  }

  async getTestPlans(filters: {
    userId: string;
    studentId?: string;
    status?: string;
  }): Promise<TestPlanResponse[]> {
    try {
      const safeUserId = Number(filters.userId);
      const safeStudentId = filters.studentId ? Number(filters.studentId) : undefined;

      // Build where clause based on filters
      const whereClause: any = {
        OR: [
          { planned_by: safeUserId },
          { student_id: safeUserId }
        ]
      };

      if (safeStudentId) {
        whereClause.student_id = safeStudentId;
      }

      const testPlans = await prisma.test_plans.findMany({
        where: whereClause,
        include: {
          student: {
            select: {
              user_id: true,
              email: true,
              first_name: true,
              last_name: true
            }
          },
          planner: {
            select: {
              user_id: true,
              email: true,
              first_name: true,
              last_name: true
            }
          },
          test_templates: true,
          exam_boards: true,
          test_executions: {
            take: 1,
            orderBy: {
              started_at: 'desc'
            }
          }
        },
        orderBy: {
          planned_at: 'desc'
        }
      });

      return testPlans.map(plan => this.formatTestPlanResponse(plan));
    } catch (error) {
      console.error('Error getting test plans:', error);
      throw new Error('Failed to get test plans');
    }
  }

  async getTestPlan(
    planId: string,
    userId: string
  ): Promise<TestPlanResponse | null> {
    try {
      const safePlanId = Number(planId);
      const safeUserId = Number(userId);

      const testPlan = await prisma.test_plans.findFirst({
        where: {
          test_plan_id: safePlanId,
          OR: [
            { planned_by: safeUserId },
            { student_id: safeUserId }
          ]
        },
        include: {
          student: {
            select: {
              user_id: true,
              email: true,
              first_name: true,
              last_name: true
            }
          },
          planner: {
            select: {
              user_id: true,
              email: true,
              first_name: true,
              last_name: true
            }
          },
          test_templates: true,
          exam_boards: true,
          test_executions: {
            take: 1,
            orderBy: {
              started_at: 'desc'
            }
          }
        }
      });

      if (!testPlan) {
        return null;
      }

      return this.formatTestPlanResponse(testPlan);
    } catch (error) {
      console.error('Error getting test plan:', error);
      throw new Error('Failed to get test plan');
    }
  }

  async updateTestPlan(
    planId: string,
    userId: string,
    data: UpdateTestPlanDTO
  ): Promise<TestPlanResponse | null> {
    try {
      const safePlanId = Number(planId);
      const safeUserId = Number(userId);

      // Check if test plan exists and user has access
      const existingPlan = await prisma.test_plans.findFirst({
        where: {
          test_plan_id: safePlanId,
          OR: [
            { planned_by: safeUserId },
            { student_id: safeUserId }
          ]
        }
      });

      if (!existingPlan) {
        throw new NotFoundError('Test plan not found');
      }

      // Only planner can update the test plan
      if (Number(existingPlan.planned_by) !== safeUserId) {
        throw new UnauthorizedError('Only the planner can update the test plan');
      }

      // Parse existing configuration
      const existingConfig = JSON.parse(existingPlan.configuration as string);

      // Prepare update data
      const updateData: Prisma.test_plansUpdateInput = {
        configuration: JSON.stringify({
          ...existingConfig,
          description: data.description
        })
      };

      if (data.scheduled_for) {
        updateData.planned_at = new Date(data.scheduled_for);
      }

      const testPlan = await prisma.test_plans.update({
        where: {
          test_plan_id: safePlanId
        },
        data: updateData,
        include: {
          student: {
            select: {
              user_id: true,
              email: true,
              first_name: true,
              last_name: true
            }
          },
          planner: {
            select: {
              user_id: true,
              email: true,
              first_name: true,
              last_name: true
            }
          },
          test_templates: true,
          exam_boards: true,
          test_executions: {
            take: 1,
            orderBy: {
              started_at: 'desc'
            }
          }
        }
      });

      return this.formatTestPlanResponse(testPlan);
    } catch (error) {
      console.error('Error updating test plan:', error);
      if (error instanceof NotFoundError || error instanceof UnauthorizedError) {
        throw error;
      }
      throw new Error('Failed to update test plan');
    }
  }

  async deleteTestPlan(
    planId: string,
    userId: string
  ): Promise<void> {
    try {
      const safePlanId = Number(planId);
      const safeUserId = Number(userId);

      // Check if test plan exists and user has access
      const existingPlan = await prisma.test_plans.findFirst({
        where: {
          test_plan_id: safePlanId,
          OR: [
            { planned_by: safeUserId },
            { student_id: safeUserId }
          ]
        }
      });

      if (!existingPlan) {
        throw new NotFoundError('Test plan not found');
      }

      // Only planner can delete the test plan
      if (Number(existingPlan.planned_by) !== safeUserId) {
        throw new UnauthorizedError('Only the planner can delete the test plan');
      }

      await prisma.test_plans.delete({
        where: {
          test_plan_id: safePlanId
        }
      });
    } catch (error) {
      console.error('Error deleting test plan:', error);
      if (error instanceof NotFoundError || error instanceof UnauthorizedError) {
        throw error;
      }
      throw new Error('Failed to delete test plan');
    }
  }

  private formatTestPlanResponse(testPlan: any): TestPlanResponse {
    if (!testPlan) {
      throw new Error('Invalid test plan data');
    }

    try {
      const config = typeof testPlan.configuration === 'string' 
        ? JSON.parse(testPlan.configuration)
        : testPlan.configuration;

      return {
        id: testPlan.test_plan_id.toString(),
        templateId: testPlan.template_id?.toString(),
        boardId: testPlan.board_id,
        testType: testPlan.test_type.toUpperCase() as TestType,
        timingType: testPlan.timing_type.toUpperCase() as TimingType,
        timeLimit: testPlan.time_limit,
        student: {
          userId: testPlan.student.user_id.toString(),
          email: testPlan.student.email,
          firstName: testPlan.student.first_name,
          lastName: testPlan.student.last_name
        },
        planner: {
          userId: testPlan.planner.user_id.toString(),
          email: testPlan.planner.email,
          firstName: testPlan.planner.first_name,
          lastName: testPlan.planner.last_name
        },
        configuration: config,
        execution: testPlan.test_executions?.[0] ? {
          status: testPlan.test_executions[0].status.toUpperCase() as TestStatus,
          startedAt: testPlan.test_executions[0].started_at,
          completedAt: testPlan.test_executions[0].completed_at,
          score: testPlan.test_executions[0].score
        } : undefined
      };
    } catch (error) {
      console.error('Error formatting test plan response:', error);
      throw new Error('Failed to format test plan response');
    }
  }
}