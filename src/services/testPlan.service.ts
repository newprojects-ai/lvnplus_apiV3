import { PrismaClient } from '@prisma/client';
import { NotFoundError, UnauthorizedError, ValidationError } from '../utils/errors';
import { CreateTestPlanDTO, UpdateTestPlanDTO, TestPlanResponse } from '../types/index';

const prisma = new PrismaClient();

export class TestPlanService {
  async createTestPlan(
    plannerId: string,
    data: CreateTestPlanDTO
  ): Promise<TestPlanResponse> {
    // Validate student_id is provided
    if (!data.student_id) {
      throw new ValidationError('A student must be assigned to the test plan');
    }

    // Convert IDs to safe BigInt values
    const safePlannerId = BigInt(plannerId);
    const safeStudentId = BigInt(data.student_id);
    const safeTemplateId = BigInt(data.template_id);

    // Get template info for board_id and test types
    const template = await prisma.test_templates.findUnique({
      where: { template_id: Number(safeTemplateId) }
    });

    if (!template) {
      throw new ValidationError('Template not found');
    }

    // Create test plan in the database
    const testPlan = await prisma.test_plans.create({
      data: {
        template_id: Number(safeTemplateId),
        board_id: template.board_id,
        test_type: template.test_type,
        timing_type: template.timing_type,
        time_limit: template.time_limit,
        student_id: Number(safeStudentId),
        planned_by: Number(safePlannerId),
        planned_at: new Date(),
        configuration: template.configuration
      },
      include: {
        student: true,
        planner: true,
        test_templates: true,
        exam_boards: true
      }
    });

    return this.formatTestPlanResponse(testPlan);
  }

  async getTestPlans(filters: {
    userId: string;
    studentId?: string;
    status?: string;
  }): Promise<TestPlanResponse[]> {
    const safeUserId = BigInt(filters.userId);

    // Build where clause based on filters
    const whereClause: any = {
      OR: [
        { planned_by: Number(safeUserId) },
        { student_id: Number(safeUserId) }
      ]
    };

    if (filters.studentId) {
      whereClause.student_id = Number(BigInt(filters.studentId));
    }

    const testPlans = await prisma.test_plans.findMany({
      where: whereClause,
      include: {
        student: true,
        planner: true,
        test_templates: true,
        exam_boards: true
      },
      orderBy: {
        planned_at: 'desc'
      }
    });

    return testPlans.map(plan => this.formatTestPlanResponse(plan));
  }

  async getTestPlan(
    planId: string,
    userId: string
  ): Promise<TestPlanResponse | null> {
    const safePlanId = BigInt(planId);
    const safeUserId = BigInt(userId);

    const testPlan = await prisma.test_plans.findFirst({
      where: {
        test_plan_id: Number(safePlanId),
        OR: [
          { planned_by: Number(safeUserId) },
          { student_id: Number(safeUserId) }
        ]
      },
      include: {
        student: true,
        planner: true,
        test_templates: true,
        exam_boards: true
      }
    });

    if (!testPlan) {
      throw new NotFoundError('Test plan not found');
    }

    return this.formatTestPlanResponse(testPlan);
  }

  async updateTestPlan(
    planId: string,
    userId: string,
    data: UpdateTestPlanDTO
  ): Promise<TestPlanResponse | null> {
    const safePlanId = BigInt(planId);
    const safeUserId = BigInt(userId);

    // Check if test plan exists and user has access
    const existingPlan = await prisma.test_plans.findFirst({
      where: {
        test_plan_id: Number(safePlanId),
        OR: [
          { planned_by: Number(safeUserId) },
          { student_id: Number(safeUserId) }
        ]
      }
    });

    if (!existingPlan) {
      throw new NotFoundError('Test plan not found');
    }

    // Only planner can update the test plan
    if (Number(existingPlan.planned_by) !== Number(safeUserId)) {
      throw new UnauthorizedError('Only the planner can update the test plan');
    }

    // Update test plan
    const testPlan = await prisma.test_plans.update({
      where: {
        test_plan_id: Number(safePlanId)
      },
      data: {
        planned_at: data.scheduled_for ? new Date(data.scheduled_for) : undefined,
        configuration: JSON.stringify({
          ...JSON.parse(existingPlan.configuration),
          description: data.description
        })
      },
      include: {
        student: true,
        planner: true,
        test_templates: true,
        exam_boards: true
      }
    });

    return this.formatTestPlanResponse(testPlan);
  }

  async deleteTestPlan(
    planId: string,
    userId: string
  ): Promise<void> {
    const safePlanId = BigInt(planId);
    const safeUserId = BigInt(userId);

    // Check if test plan exists and user has access
    const existingPlan = await prisma.test_plans.findFirst({
      where: {
        test_plan_id: Number(safePlanId),
        OR: [
          { planned_by: Number(safeUserId) },
          { student_id: Number(safeUserId) }
        ]
      }
    });

    if (!existingPlan) {
      throw new NotFoundError('Test plan not found');
    }

    // Only planner can delete the test plan
    if (Number(existingPlan.planned_by) !== Number(safeUserId)) {
      throw new UnauthorizedError('Only the planner can delete the test plan');
    }

    await prisma.test_plans.delete({
      where: {
        test_plan_id: Number(safePlanId)
      }
    });
  }

  private formatTestPlanResponse(testPlan: any): TestPlanResponse {
    try {
      const configuration = JSON.parse(testPlan.configuration);
      return {
        id: testPlan.test_plan_id.toString(),
        template_id: testPlan.template_id?.toString(),
        board_id: testPlan.board_id,
        test_type: testPlan.test_type,
        timing_type: testPlan.timing_type,
        time_limit: testPlan.time_limit,
        student: {
          id: testPlan.student.user_id.toString(),
          email: testPlan.student.email,
          first_name: testPlan.student.first_name,
          last_name: testPlan.student.last_name
        },
        planner: {
          id: testPlan.planner.user_id.toString(),
          email: testPlan.planner.email,
          first_name: testPlan.planner.first_name,
          last_name: testPlan.planner.last_name
        },
        template: testPlan.test_templates ? {
          id: testPlan.test_templates.template_id.toString(),
          name: testPlan.test_templates.template_name,
          source: testPlan.test_templates.source,
          test_type: testPlan.test_templates.test_type,
          timing_type: testPlan.test_templates.timing_type,
          time_limit: testPlan.test_templates.time_limit,
          configuration: JSON.parse(testPlan.test_templates.configuration)
        } : undefined,
        exam_board: testPlan.exam_boards ? {
          id: testPlan.exam_boards.board_id.toString(),
          name: testPlan.exam_boards.board_name,
          description: testPlan.exam_boards.description,
          input_type: testPlan.exam_boards.input_type
        } : undefined,
        planned_at: testPlan.planned_at,
        configuration
      };
    } catch (error) {
      throw new Error('Failed to parse configuration');
    }
  }
}