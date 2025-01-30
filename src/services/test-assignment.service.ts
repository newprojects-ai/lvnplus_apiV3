import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AssignTestDto } from '../dto/test-assignment.dto';

@Injectable()
export class TestAssignmentService {
  constructor(private prisma: PrismaService) {}

  async assignToStudent(tutorId: string, studentId: string, data: AssignTestDto) {
    return this.prisma.test_assignments.create({
      data: {
        due_date: data.dueDate,
        instructions: data.instructions,
        test_plan: {
          connect: { test_plan_id: data.testId }
        },
        student: {
          connect: { user_id: studentId }
        },
        assigned_by: tutorId
      }
    });
  }

  async assignToGroup(tutorId: string, groupId: string, data: AssignTestDto) {
    // First, get all students in the group
    const group = await this.prisma.study_groups.findUnique({
      where: { group_id: groupId },
      include: {
        students: true
      }
    });

    if (!group) {
      throw new Error('Group not found');
    }

    // Create assignments for each student in the group
    const assignments = await Promise.all(
      group.students.map(student =>
        this.prisma.test_assignments.create({
          data: {
            due_date: data.dueDate,
            instructions: data.instructions,
            test_plan: {
              connect: { test_plan_id: data.testId }
            },
            student: {
              connect: { user_id: student.user_id }
            },
            assigned_by: tutorId,
            group: {
              connect: { group_id: groupId }
            }
          }
        })
      )
    );

    // Log activity for each student
    await Promise.all(
      group.students.map(student =>
        this.prisma.activity_log.create({
          data: {
            activity_type: 'test_assigned',
            details: `Test assigned to group ${group.group_name}`,
            user: {
              connect: { user_id: student.user_id }
            }
          }
        })
      )
    );

    return {
      groupId,
      assignments
    };
  }

  async getStudentAssignments(studentId: string) {
    return this.prisma.test_assignments.findMany({
      where: {
        student_id: studentId,
        status: 'PENDING'
      },
      include: {
        test_plan: true,
        group: true,
        assigner: true
      },
      orderBy: {
        due_date: 'asc'
      }
    });
  }

  async getGroupAssignments(groupId: string) {
    return this.prisma.test_assignments.findMany({
      where: {
        group_id: groupId
      },
      include: {
        test_plan: true,
        student: true,
        assigner: true
      },
      orderBy: {
        due_date: 'asc'
      }
    });
  }

  async completeAssignment(assignmentId: string, score: number) {
    const assignment = await this.prisma.test_assignments.update({
      where: { assignment_id: assignmentId },
      data: {
        status: 'COMPLETED',
        completed_at: new Date()
      },
      include: {
        student: true,
        group: true
      }
    });

    // Create test execution
    await this.prisma.test_executions.create({
      data: {
        test_plan_id: assignment.test_plan_id,
        student_id: assignment.student_id,
        score: score,
        status: 'COMPLETED',
        completed_at: new Date()
      }
    });

    // Log activity
    await this.prisma.activity_log.create({
      data: {
        activity_type: 'test_completed',
        details: `Completed test with score ${score}%${
          assignment.group ? ` (Group: ${assignment.group.group_name})` : ''
        }`,
        user: {
          connect: { user_id: assignment.student_id }
        }
      }
    });

    return assignment;
  }

  async getAssignmentStats(assignmentId: string) {
    const assignment = await this.prisma.test_assignments.findUnique({
      where: { assignment_id: assignmentId },
      include: {
        student: true,
        test_plan: true,
        group: {
          include: {
            students: {
              include: {
                test_executions: {
                  where: {
                    test_plan_id: assignment.test_plan_id,
                    status: 'COMPLETED'
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!assignment) {
      throw new Error('Assignment not found');
    }

    if (!assignment.group_id) {
      const execution = await this.prisma.test_executions.findFirst({
        where: {
          test_plan_id: assignment.test_plan_id,
          student_id: assignment.student_id,
          status: 'COMPLETED'
        }
      });

      return {
        studentScore: execution?.score || 0,
        completed: assignment.status === 'COMPLETED',
        dueDate: assignment.due_date
      };
    }

    const groupScores = assignment.group.students
      .map(student => student.test_executions[0]?.score || 0)
      .filter(score => score > 0);

    return {
      studentScore: assignment.student.test_executions[0]?.score || 0,
      completed: assignment.status === 'COMPLETED',
      dueDate: assignment.due_date,
      groupAverage: groupScores.reduce((acc, score) => acc + score, 0) / groupScores.length || 0,
      groupHighest: Math.max(...groupScores, 0),
      groupLowest: Math.min(...groupScores.filter(score => score > 0), 100)
    };
  }
}
