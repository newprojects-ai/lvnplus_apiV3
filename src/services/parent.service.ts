import { PrismaClient } from '@prisma/client';
import { BadRequestError, NotFoundError } from '../utils/errors';

const prisma = new PrismaClient();

export class ParentService {
  // Get all children linked to a parent
  async getLinkedChildren(parentId: bigint) {
    const children = await prisma.studentGuardian.findMany({
      where: {
        guardian_id: parentId,
        relationship: 'PARENT'
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });
    return children;
  }

  // Link a child to a parent
  async linkChild(parentId: bigint, studentId: bigint) {
    // Check if link already exists
    const existingLink = await prisma.studentGuardian.findFirst({
      where: {
        guardian_id: parentId,
        student_id: studentId
      }
    });

    if (existingLink) {
      throw new BadRequestError('Student is already linked to this parent');
    }

    return prisma.studentGuardian.create({
      data: {
        guardian_id: parentId,
        student_id: studentId,
        relationship: 'PARENT'
      }
    });
  }

  // Create a test plan
  async createTestPlan(parentId: bigint, data: {
    title: string;
    description?: string;
    subjectId: number;
    questionSetIds: number[];
    questionsPerSet: number;
    timeLimit?: number;
    type: string;
  }) {
    // Create test plan without assigning to any student
    return prisma.testPlan.create({
      data: {
        title: data.title,
        description: data.description,
        subject_id: data.subjectId,
        planned_by: parentId,
        planned_by_type: 'PARENT',
        time_limit: data.timeLimit,
        type: data.type,
        configuration: JSON.stringify({
          questionSetIds: data.questionSetIds,
          questionsPerSet: data.questionsPerSet
        })
      }
    });
  }

  // Assign test plan to student
  async assignTestPlan(parentId: bigint, testPlanId: bigint, studentId: bigint) {
    // Verify parent-child relationship
    const relationship = await prisma.studentGuardian.findFirst({
      where: {
        guardian_id: parentId,
        student_id: studentId
      }
    });

    if (!relationship) {
      throw new NotFoundError('Parent-child relationship not found');
    }

    // Verify test plan ownership
    const testPlan = await prisma.testPlan.findFirst({
      where: {
        id: testPlanId,
        planned_by: parentId,
        planned_by_type: 'PARENT'
      }
    });

    if (!testPlan) {
      throw new NotFoundError('Test plan not found or not owned by parent');
    }

    // Create test plan assignment
    return prisma.testPlanAssignment.create({
      data: {
        test_plan_id: testPlanId,
        student_id: studentId,
        student_guardian_id: relationship.id,
        status: 'ASSIGNED'
      }
    });
  }

  // Get test plans created by parent
  async getTestPlans(parentId: bigint) {
    return prisma.testPlan.findMany({
      where: {
        planned_by: parentId,
        planned_by_type: 'PARENT'
      },
      include: {
        student: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });
  }

  // Get test executions for parent's children
  async getTestExecutions(parentId: bigint) {
    const children = await this.getLinkedChildren(parentId);
    const childIds = children.map(c => c.student_id);

    return prisma.testExecution.findMany({
      where: {
        test_plan: {
          student_id: {
            in: childIds
          },
          planned_by: parentId,
          planned_by_type: 'PARENT'
        }
      },
      include: {
        test_plan: {
          include: {
            student: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        }
      }
    });
  }

  // Unlink a child from a parent
  async unlinkChild(parentId: bigint, studentId: bigint) {
    const relationship = await prisma.studentGuardian.findFirst({
      where: {
        guardian_id: parentId,
        student_id: studentId,
        relationship: 'PARENT'
      }
    });

    if (!relationship) {
      throw new NotFoundError('Parent-child relationship not found');
    }

    return prisma.studentGuardian.delete({
      where: {
        id: relationship.id
      }
    });
  }

  // Get specific test plan details
  async getTestPlanById(parentId: bigint, testPlanId: bigint) {
    const plan = await prisma.testPlan.findFirst({
      where: {
        test_plan_id: testPlanId,
        planned_by: parentId,
        planned_by_type: 'PARENT'
      },
      include: {
        student: {
          select: {
            user_id: true,
            first_name: true,
            last_name: true,
            email: true
          }
        },
        test_executions: {
          include: {
            student: {
              select: {
                user_id: true,
                first_name: true,
                last_name: true
              }
            }
          }
        }
      }
    });

    if (!plan) {
      throw new NotFoundError('Test plan not found');
    }

    return plan;
  }

  // Update test plan
  async updateTestPlan(parentId: bigint, testPlanId: bigint, data: {
    title?: string;
    description?: string;
    timeLimit?: number;
  }) {
    const plan = await prisma.testPlan.findFirst({
      where: {
        test_plan_id: testPlanId,
        planned_by: parentId,
        planned_by_type: 'PARENT'
      }
    });

    if (!plan) {
      throw new NotFoundError('Test plan not found');
    }

    return prisma.testPlan.update({
      where: {
        test_plan_id: testPlanId
      },
      data: {
        title: data.title,
        description: data.description,
        time_limit: data.timeLimit
      }
    });
  }

  // Delete test plan
  async deleteTestPlan(parentId: bigint, testPlanId: bigint) {
    const plan = await prisma.testPlan.findFirst({
      where: {
        test_plan_id: testPlanId,
        planned_by: parentId,
        planned_by_type: 'PARENT'
      }
    });

    if (!plan) {
      throw new NotFoundError('Test plan not found');
    }

    return prisma.testPlan.delete({
      where: {
        test_plan_id: testPlanId
      }
    });
  }

  // Get child's performance
  async getChildPerformance(parentId: bigint, studentId: bigint) {
    // Verify parent-child relationship
    const relationship = await prisma.studentGuardian.findFirst({
      where: {
        guardian_id: parentId,
        student_id: studentId,
        relationship: 'PARENT'
      }
    });

    if (!relationship) {
      throw new NotFoundError('Parent-child relationship not found');
    }

    // Get performance data
    const [progress, subjectMastery, recentTests] = await Promise.all([
      prisma.studentProgress.findUnique({
        where: { user_id: studentId }
      }),
      prisma.subjectMastery.findMany({
        where: { user_id: studentId },
        include: { subjects: true }
      }),
      prisma.testExecution.findMany({
        where: { student_id: studentId },
        orderBy: { completed_at: 'desc' },
        take: 10,
        include: {
          test_plan: {
            include: {
              exam_boards: true
            }
          }
        }
      })
    ]);

    return {
      progress,
      subjectMastery,
      recentTests
    };
  }

  // Get child's test history
  async getChildTestHistory(parentId: bigint, studentId: bigint) {
    // Verify parent-child relationship
    const relationship = await prisma.studentGuardian.findFirst({
      where: {
        guardian_id: parentId,
        student_id: studentId,
        relationship: 'PARENT'
      }
    });

    if (!relationship) {
      throw new NotFoundError('Parent-child relationship not found');
    }

    return prisma.testExecution.findMany({
      where: {
        student_id: studentId
      },
      include: {
        test_plan: {
          include: {
            exam_boards: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });
  }
}
