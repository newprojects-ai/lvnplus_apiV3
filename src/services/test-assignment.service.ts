import { TestAssignmentStatus } from '@prisma/client';
import { NotFoundError, ValidationError } from '../utils/errors';
import { prisma } from '../utils/db';

export class TestAssignmentService {
  async assignToStudent(
    testPlanId: bigint,
    assignerId: bigint,
    studentId: bigint,
    dueDate: Date
  ) {
    // Verify the test plan exists
    const testPlan = await prisma.test_plans.findUnique({
      where: { test_plan_id: testPlanId }
    });

    if (!testPlan) {
      throw new NotFoundError('Test plan not found');
    }

    // Create the assignment
    return await prisma.test_assignments.create({
      data: {
        test_plan_id: testPlanId,
        assigned_by: assignerId,
        student_id: studentId,
        due_date: dueDate
      }
    });
  }

  async assignToGroup(
    testPlanId: bigint,
    assignerId: bigint,
    groupId: bigint,
    dueDate: Date
  ) {
    // Verify the group exists and is active
    const group = await prisma.study_groups.findFirst({
      where: {
        group_id: groupId,
        active: true
      }
    });

    if (!group) {
      throw new NotFoundError('Study group not found or inactive');
    }

    // Create the group assignment
    return await prisma.test_assignments.create({
      data: {
        test_plan_id: testPlanId,
        assigned_by: assignerId,
        group_id: groupId,
        due_date: dueDate
      }
    });
  }

  async getAssignmentsByAssigner(assignerId: bigint) {
    return await prisma.test_assignments.findMany({
      where: {
        assigned_by: assignerId
      },
      include: {
        test_plan: true,
        student: {
          select: {
            user_id: true,
            email: true,
            first_name: true,
            last_name: true
          }
        },
        group: {
          include: {
            members: {
              include: {
                student: {
                  select: {
                    user_id: true,
                    email: true,
                    first_name: true,
                    last_name: true
                  }
                }
              }
            }
          }
        }
      }
    });
  }

  async getAssignmentsByStudent(studentId: bigint) {
    return await prisma.test_assignments.findMany({
      where: {
        OR: [
          { student_id: studentId },
          {
            group: {
              members: {
                some: {
                  student_id: studentId
                }
              }
            }
          }
        ]
      },
      include: {
        test_plan: true,
        assigner: {
          select: {
            user_id: true,
            email: true,
            first_name: true,
            last_name: true
          }
        },
        group: true
      }
    });
  }

  async updateAssignmentStatus(assignmentId: bigint, status: TestAssignmentStatus) {
    const assignment = await prisma.test_assignments.findUnique({
      where: { assignment_id: assignmentId }
    });

    if (!assignment) {
      throw new NotFoundError('Assignment not found');
    }

    return await prisma.test_assignments.update({
      where: { assignment_id: assignmentId },
      data: { status }
    });
  }

  async getAssignmentDetails(assignmentId: bigint) {
    const assignment = await prisma.test_assignments.findUnique({
      where: { assignment_id: assignmentId },
      include: {
        test_plan: true,
        assigner: {
          select: {
            user_id: true,
            email: true,
            first_name: true,
            last_name: true
          }
        },
        student: {
          select: {
            user_id: true,
            email: true,
            first_name: true,
            last_name: true
          }
        },
        group: {
          include: {
            members: {
              include: {
                student: {
                  select: {
                    user_id: true,
                    email: true,
                    first_name: true,
                    last_name: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!assignment) {
      throw new NotFoundError('Assignment not found');
    }

    return assignment;
  }
}
