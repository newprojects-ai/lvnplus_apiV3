import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StudyGroupService {
  constructor(private prisma: PrismaService) {}

  async createGroup(tutorId: string, name: string, description?: string) {
    return this.prisma.study_groups.create({
      data: {
        group_name: name,
        description,
        tutor_id: tutorId,
        created_at: new Date(),
        updated_at: new Date()
      }
    });
  }

  async getGroup(groupId: string) {
    return this.prisma.study_groups.findUnique({
      where: { group_id: groupId },
      include: {
        tutor: true,
        students: {
          include: {
            test_executions: {
              where: {
                status: 'COMPLETED'
              },
              orderBy: {
                completed_at: 'desc'
              },
              take: 5
            },
            activity_log: {
              orderBy: {
                created_at: 'desc'
              },
              take: 10
            }
          }
        }
      }
    });
  }

  async getTutorGroups(tutorId: string) {
    return this.prisma.study_groups.findMany({
      where: {
        tutor_id: tutorId
      },
      include: {
        students: true
      }
    });
  }

  async addStudent(groupId: string, studentId: string) {
    const group = await this.prisma.study_groups.update({
      where: { group_id: groupId },
      data: {
        students: {
          connect: { user_id: studentId }
        },
        updated_at: new Date()
      },
      include: {
        students: true
      }
    });

    // Log activity
    await this.prisma.activity_log.create({
      data: {
        activity_type: 'group_joined',
        details: `Joined study group: ${group.group_name}`,
        user: {
          connect: { user_id: studentId }
        }
      }
    });

    return group;
  }

  async removeStudent(groupId: string, studentId: string) {
    const group = await this.prisma.study_groups.update({
      where: { group_id: groupId },
      data: {
        students: {
          disconnect: { user_id: studentId }
        },
        updated_at: new Date()
      }
    });

    // Log activity
    await this.prisma.activity_log.create({
      data: {
        activity_type: 'group_left',
        details: `Left study group: ${group.group_name}`,
        user: {
          connect: { user_id: studentId }
        }
      }
    });

    return group;
  }

  async getStudentGroups(studentId: string) {
    return this.prisma.study_groups.findMany({
      where: {
        students: {
          some: {
            user_id: studentId
          }
        }
      },
      include: {
        tutor: true,
        students: true
      }
    });
  }

  async getGroupPerformance(groupId: string) {
    const group = await this.prisma.study_groups.findUnique({
      where: { group_id: groupId },
      include: {
        students: {
          include: {
            test_executions: {
              where: {
                status: 'COMPLETED'
              },
              orderBy: {
                completed_at: 'desc'
              },
              include: {
                test_plan: true
              }
            }
          }
        }
      }
    });

    if (!group) return null;

    // Calculate overall group performance
    const studentPerformance = group.students.map(student => {
      const executions = student.test_executions;
      const averageScore = executions.length > 0
        ? executions.reduce((acc, exec) => acc + exec.score, 0) / executions.length
        : 0;

      return {
        studentId: student.user_id,
        averageScore,
        executions: executions.map(exec => ({
          testId: exec.test_plan_id,
          testName: exec.test_plan.name,
          score: exec.score,
          date: exec.completed_at
        }))
      };
    });

    // Calculate subject-wise performance
    const subjectPerformance = group.students.flatMap(s => s.test_executions)
      .reduce((acc, execution) => {
        const subject = execution.test_plan.subject;
        if (!acc[subject]) {
          acc[subject] = {
            totalScore: 0,
            count: 0,
            scores: []
          };
        }
        
        acc[subject].totalScore += execution.score;
        acc[subject].count += 1;
        acc[subject].scores.push(execution.score);
        
        return acc;
      }, {} as Record<string, { totalScore: number; count: number; scores: number[] }>);

    const subjectStats = Object.entries(subjectPerformance).map(([subject, data]) => ({
      subject,
      averageScore: data.totalScore / data.count,
      highestScore: Math.max(...data.scores),
      lowestScore: Math.min(...data.scores),
      testsCompleted: data.count
    }));

    return {
      groupId: group.group_id,
      name: group.group_name,
      studentCount: group.students.length,
      studentPerformance,
      subjectPerformance: subjectStats,
      overallAverage: studentPerformance.reduce((acc, s) => acc + s.averageScore, 0) / studentPerformance.length || 0
    };
  }
}
