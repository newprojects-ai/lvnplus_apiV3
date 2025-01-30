import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GuardianRelationStatus, GuardianRelationType } from '@prisma/client';
import { NotFoundError, ValidationError } from '../utils/errors';

@Injectable()
export class GuardianService {
  constructor(private prisma: PrismaService) {}

  async requestLink(guardianId: string, studentEmail: string, relationType: GuardianRelationType) {
    // Find the student by email
    const student = await this.prisma.users.findUnique({
      where: { email: studentEmail },
      include: {
        user_roles: {
          include: {
            roles: true
          }
        }
      }
    });

    if (!student || !student.user_roles.some(ur => ur.roles.role_name.toLowerCase() === 'student')) {
      throw new NotFoundError('Student not found');
    }

    // Check if relationship already exists
    const existingRelation = await this.prisma.student_guardians.findFirst({
      where: {
        guardian_id: guardianId,
        student_id: student.user_id
      }
    });

    if (existingRelation) {
      throw new Error('Relationship already exists');
    }

    // Create the relationship request
    return await this.prisma.student_guardians.create({
      data: {
        guardian_id: guardianId,
        student_id: student.user_id,
        relation_type: relationType,
        status: GuardianRelationStatus.PENDING
      }
    });
  }

  async confirmLink(relationshipId: string, studentId: string) {
    const relationship = await this.prisma.student_guardians.findFirst({
      where: {
        relationship_id: relationshipId,
        student_id: studentId,
        status: GuardianRelationStatus.PENDING
      }
    });

    if (!relationship) {
      throw new Error('Relationship request not found');
    }

    return await this.prisma.student_guardians.update({
      where: { relationship_id: relationshipId },
      data: {
        status: GuardianRelationStatus.ACTIVE,
        confirmed_at: new Date()
      }
    });
  }

  async deactivateLink(guardianId: string, studentId: string) {
    const relationship = await this.prisma.student_guardians.findUnique({
      where: {
        unique_guardian_student: {
          guardian_id: guardianId,
          student_id: studentId
        }
      }
    });

    return await this.prisma.student_guardians.update({
      where: { relationship_id: relationship.relationship_id },
      data: {
        status: GuardianRelationStatus.INACTIVE,
        updated_at: new Date()
      }
    });
  }

  async getStudents(guardianId: string) {
    const relations = await this.prisma.student_guardians.findMany({
      where: {
        guardian_id: guardianId,
        status: GuardianRelationStatus.ACTIVE
      },
      include: {
        student: {
          include: {
            test_executions: {
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
            },
            student_groups: {
              include: {
                tutor: true
              }
            }
          }
        }
      }
    });

    return relations.map(relation => relation.student);
  }

  async getStudentProgress(studentId: string, guardianId: string) {
    // Verify guardian relationship
    const relation = await this.prisma.student_guardians.findFirst({
      where: {
        student_id: studentId,
        guardian_id: guardianId,
        status: GuardianRelationStatus.ACTIVE
      }
    });

    if (!relation) {
      throw new NotFoundError('Guardian relationship not found');
    }

    const student = await this.prisma.users.findFirst({
      where: {
        user_id: studentId
      },
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
        },
        activity_log: {
          orderBy: {
            created_at: 'desc'
          }
        }
      }
    });

    if (!student) return null;

    // Calculate subject-wise performance
    const subjectPerformance = student.test_executions.reduce((acc, execution) => {
      const subject = execution.test_plan?.subject || 'Unknown';
      if (!acc[subject]) {
        acc[subject] = {
          totalScore: 0,
          count: 0,
          scores: []
        };
      }
      
      acc[subject].totalScore += execution.score;
      acc[subject].count += 1;
      acc[subject].scores.push({
        score: execution.score,
        date: execution.completed_at
      });
      
      return acc;
    }, {} as Record<string, { totalScore: number; count: number; scores: { score: number; date: Date }[] }>);

    // Calculate trends and averages
    const performance = Object.entries(subjectPerformance).map(([subject, data]) => ({
      subject,
      averageScore: data.totalScore / data.count,
      trend: data.scores
        .sort((a, b) => a.date.getTime() - b.date.getTime())
        .map(s => ({ score: s.score, date: s.date })),
      testsCompleted: data.count
    }));

    return {
      studentId: student.user_id,
      performance,
      recentActivities: student.activity_log,
      overallAverage: performance.reduce((acc, p) => acc + p.averageScore, 0) / performance.length || 0
    };
  }

  async getStudentTestResults(studentId: string, guardianId: string) {
    // Verify guardian relationship
    const relation = await this.prisma.student_guardians.findFirst({
      where: {
        student_id: studentId,
        guardian_id: guardianId,
        status: GuardianRelationStatus.ACTIVE
      }
    });

    if (!relation) {
      throw new NotFoundError('Guardian relationship not found');
    }

    return this.prisma.test_executions.findMany({
      where: {
        student_id: studentId,
        status: 'COMPLETED'
      },
      orderBy: {
        completed_at: 'desc'
      },
      include: {
        test_plan: true
      }
    });
  }

  async getStudentActivity(studentId: string, guardianId: string) {
    // Verify guardian relationship
    const relation = await this.prisma.student_guardians.findFirst({
      where: {
        student_id: studentId,
        guardian_id: guardianId,
        status: GuardianRelationStatus.ACTIVE
      }
    });

    if (!relation) {
      throw new NotFoundError('Guardian relationship not found');
    }

    return this.prisma.activity_log.findMany({
      where: {
        user_id: studentId
      },
      orderBy: {
        created_at: 'desc'
      },
      take: 50
    });
  }

  async addActivityLog(
    studentId: string,
    type: string,
    description: string
  ) {
    return this.prisma.activity_log.create({
      data: {
        activity_type: type,
        details: description,
        user: {
          connect: { user_id: studentId }
        }
      }
    });
  }

  async getGuardians(studentId: string) {
    return await this.prisma.student_guardians.findMany({
      where: {
        student_id: studentId,
        status: GuardianRelationStatus.ACTIVE
      },
      include: {
        guardian: true
      }
    });
  }
}
