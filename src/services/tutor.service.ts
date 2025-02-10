import { PrismaClient } from '@prisma/client';
import { BadRequestError, NotFoundError } from '../utils/errors';

const prisma = new PrismaClient();

export class TutorService {
  // Student Management
  async getLinkedStudents(tutorId: bigint) {
    const students = await prisma.tutorStudents.findMany({
      where: {
        tutor_id: tutorId,
        status: 'ACTIVE'
      },
      include: {
        student: {
          select: {
            user_id: true,
            first_name: true,
            last_name: true,
            email: true
          }
        }
      }
    });
    return students;
  }

  async linkStudent(tutorId: bigint, studentId: bigint) {
    // Check if link already exists
    const existingLink = await prisma.tutorStudents.findFirst({
      where: {
        tutor_id: tutorId,
        student_id: studentId
      }
    });

    if (existingLink) {
      throw new BadRequestError('Student is already linked to this tutor');
    }

    return prisma.tutorStudents.create({
      data: {
        tutor_id: tutorId,
        student_id: studentId,
        status: 'ACTIVE'
      }
    });
  }

  async unlinkStudent(tutorId: bigint, studentId: bigint) {
    const relationship = await prisma.tutorStudents.findFirst({
      where: {
        tutor_id: tutorId,
        student_id: studentId,
        status: 'ACTIVE'
      }
    });

    if (!relationship) {
      throw new NotFoundError('Tutor-student relationship not found');
    }

    return prisma.tutorStudents.update({
      where: {
        id: relationship.id
      },
      data: {
        status: 'INACTIVE'
      }
    });
  }

  // Group Management
  async createGroup(tutorId: bigint, data: {
    name: string;
    description?: string;
    studentIds: bigint[];
  }) {
    // Verify all students are linked to tutor
    const students = await prisma.tutorStudents.findMany({
      where: {
        tutor_id: tutorId,
        student_id: { in: data.studentIds },
        status: 'ACTIVE'
      }
    });

    if (students.length !== data.studentIds.length) {
      throw new BadRequestError('Some students are not linked to this tutor');
    }

    return prisma.studyGroups.create({
      data: {
        group_name: data.name,
        description: data.description,
        tutor_id: tutorId,
        group_members: {
          create: data.studentIds.map(studentId => ({
            student_id: studentId
          }))
        }
      },
      include: {
        group_members: {
          include: {
            student: {
              select: {
                user_id: true,
                first_name: true,
                last_name: true,
                email: true
              }
            }
          }
        }
      }
    });
  }

  async getGroups(tutorId: bigint) {
    return prisma.studyGroups.findMany({
      where: {
        tutor_id: tutorId
      },
      include: {
        group_members: {
          include: {
            student: {
              select: {
                user_id: true,
                first_name: true,
                last_name: true,
                email: true
              }
            }
          }
        }
      }
    });
  }

  async updateGroup(tutorId: bigint, groupId: bigint, data: {
    name?: string;
    description?: string;
  }) {
    const group = await prisma.studyGroups.findFirst({
      where: {
        group_id: groupId,
        tutor_id: tutorId
      }
    });

    if (!group) {
      throw new NotFoundError('Group not found');
    }

    return prisma.studyGroups.update({
      where: {
        group_id: groupId
      },
      data: {
        group_name: data.name,
        description: data.description
      },
      include: {
        group_members: {
          include: {
            student: {
              select: {
                user_id: true,
                first_name: true,
                last_name: true,
                email: true
              }
            }
          }
        }
      }
    });
  }

  async deleteGroup(tutorId: bigint, groupId: bigint) {
    const group = await prisma.studyGroups.findFirst({
      where: {
        group_id: groupId,
        tutor_id: tutorId
      }
    });

    if (!group) {
      throw new NotFoundError('Group not found');
    }

    // Delete group members first due to foreign key constraints
    await prisma.groupMembers.deleteMany({
      where: {
        group_id: groupId
      }
    });

    return prisma.studyGroups.delete({
      where: {
        group_id: groupId
      }
    });
  }

  async addStudentsToGroup(tutorId: bigint, groupId: bigint, studentIds: bigint[]) {
    // Verify group exists and belongs to tutor
    const group = await prisma.studyGroups.findFirst({
      where: {
        group_id: groupId,
        tutor_id: tutorId
      }
    });

    if (!group) {
      throw new NotFoundError('Group not found');
    }

    // Verify all students are linked to tutor
    const students = await prisma.tutorStudents.findMany({
      where: {
        tutor_id: tutorId,
        student_id: { in: studentIds },
        status: 'ACTIVE'
      }
    });

    if (students.length !== studentIds.length) {
      throw new BadRequestError('Some students are not linked to this tutor');
    }

    // Add students to group
    await prisma.groupMembers.createMany({
      data: studentIds.map(studentId => ({
        group_id: groupId,
        student_id: studentId
      })),
      skipDuplicates: true
    });

    return prisma.studyGroups.findUnique({
      where: {
        group_id: groupId
      },
      include: {
        group_members: {
          include: {
            student: {
              select: {
                user_id: true,
                first_name: true,
                last_name: true,
                email: true
              }
            }
          }
        }
      }
    });
  }

  async removeStudentFromGroup(tutorId: bigint, groupId: bigint, studentId: bigint) {
    // Verify group exists and belongs to tutor
    const group = await prisma.studyGroups.findFirst({
      where: {
        group_id: groupId,
        tutor_id: tutorId
      }
    });

    if (!group) {
      throw new NotFoundError('Group not found');
    }

    return prisma.groupMembers.deleteMany({
      where: {
        group_id: groupId,
        student_id: studentId
      }
    });
  }

  // Test Management
  async createTestPlan(tutorId: bigint, data: {
    studentId?: bigint;
    groupId?: bigint;
    title: string;
    description?: string;
    subjectId: number;
    questionSetIds: number[];
    questionsPerSet: number;
    timeLimit?: number;
  }) {
    if (!data.studentId && !data.groupId) {
      throw new BadRequestError('Either studentId or groupId must be provided');
    }

    if (data.studentId && data.groupId) {
      throw new BadRequestError('Cannot specify both studentId and groupId');
    }

    if (data.studentId) {
      // Verify tutor-student relationship
      const relationship = await prisma.tutorStudents.findFirst({
        where: {
          tutor_id: tutorId,
          student_id: data.studentId,
          status: 'ACTIVE'
        }
      });

      if (!relationship) {
        throw new NotFoundError('Tutor-student relationship not found');
      }

      // Create test plan for individual student
      return prisma.testPlan.create({
        data: {
          title: data.title,
          description: data.description,
          subject_id: data.subjectId,
          student_id: data.studentId,
          planned_by: tutorId,
          planned_by_type: 'TUTOR',
          tutor_student_id: relationship.id,
          time_limit: data.timeLimit,
          configuration: JSON.stringify({
            questionSetIds: data.questionSetIds,
            questionsPerSet: data.questionsPerSet
          })
        }
      });
    } else {
      // Verify group exists and belongs to tutor
      const group = await prisma.studyGroups.findFirst({
        where: {
          group_id: data.groupId!,
          tutor_id: tutorId
        },
        include: {
          group_members: true
        }
      });

      if (!group) {
        throw new NotFoundError('Group not found');
      }

      // Create test plan for each student in the group
      const testPlans = await Promise.all(
        group.group_members.map(member =>
          prisma.testPlan.create({
            data: {
              title: data.title,
              description: data.description,
              subject_id: data.subjectId,
              student_id: member.student_id,
              planned_by: tutorId,
              planned_by_type: 'TUTOR',
              time_limit: data.timeLimit,
              configuration: JSON.stringify({
                questionSetIds: data.questionSetIds,
                questionsPerSet: data.questionsPerSet
              }),
              study_groups: {
                connect: {
                  group_id: data.groupId
                }
              }
            }
          })
        )
      );

      return testPlans;
    }
  }

  async getTestPlans(tutorId: bigint) {
    return prisma.testPlan.findMany({
      where: {
        planned_by: tutorId,
        planned_by_type: 'TUTOR'
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
        study_groups: true,
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
  }

  async getTestPlanById(tutorId: bigint, testPlanId: bigint) {
    const plan = await prisma.testPlan.findFirst({
      where: {
        test_plan_id: testPlanId,
        planned_by: tutorId,
        planned_by_type: 'TUTOR'
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
        study_groups: true,
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

  async updateTestPlan(tutorId: bigint, testPlanId: bigint, data: {
    title?: string;
    description?: string;
    timeLimit?: number;
  }) {
    const plan = await prisma.testPlan.findFirst({
      where: {
        test_plan_id: testPlanId,
        planned_by: tutorId,
        planned_by_type: 'TUTOR'
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

  async deleteTestPlan(tutorId: bigint, testPlanId: bigint) {
    const plan = await prisma.testPlan.findFirst({
      where: {
        test_plan_id: testPlanId,
        planned_by: tutorId,
        planned_by_type: 'TUTOR'
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

  // Performance Tracking
  async getStudentPerformance(tutorId: bigint, studentId: bigint) {
    // Verify tutor-student relationship
    const relationship = await prisma.tutorStudents.findFirst({
      where: {
        tutor_id: tutorId,
        student_id: studentId,
        status: 'ACTIVE'
      }
    });

    if (!relationship) {
      throw new NotFoundError('Tutor-student relationship not found');
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
        where: {
          student_id: studentId,
          test_plan: {
            planned_by: tutorId,
            planned_by_type: 'TUTOR'
          }
        },
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

  async getGroupPerformance(tutorId: bigint, groupId: bigint) {
    // Verify group exists and belongs to tutor
    const group = await prisma.studyGroups.findFirst({
      where: {
        group_id: groupId,
        tutor_id: tutorId
      },
      include: {
        group_members: true
      }
    });

    if (!group) {
      throw new NotFoundError('Group not found');
    }

    // Get performance data for all students in group
    const studentIds = group.group_members.map(member => member.student_id);

    const [progress, subjectMastery, recentTests] = await Promise.all([
      prisma.studentProgress.findMany({
        where: { user_id: { in: studentIds } }
      }),
      prisma.subjectMastery.findMany({
        where: { user_id: { in: studentIds } },
        include: { subjects: true }
      }),
      prisma.testExecution.findMany({
        where: {
          student_id: { in: studentIds },
          test_plan: {
            planned_by: tutorId,
            planned_by_type: 'TUTOR'
          }
        },
        orderBy: { completed_at: 'desc' },
        take: 50,
        include: {
          test_plan: {
            include: {
              exam_boards: true
            }
          },
          student: {
            select: {
              user_id: true,
              first_name: true,
              last_name: true
            }
          }
        }
      })
    ]);

    return {
      groupInfo: group,
      progress,
      subjectMastery,
      recentTests
    };
  }

  async getStudentTestHistory(tutorId: bigint, studentId: bigint) {
    // Verify tutor-student relationship
    const relationship = await prisma.tutorStudents.findFirst({
      where: {
        tutor_id: tutorId,
        student_id: studentId,
        status: 'ACTIVE'
      }
    });

    if (!relationship) {
      throw new NotFoundError('Tutor-student relationship not found');
    }

    return prisma.testExecution.findMany({
      where: {
        student_id: studentId,
        test_plan: {
          planned_by: tutorId,
          planned_by_type: 'TUTOR'
        }
      },
      include: {
        test_plan: {
          include: {
            exam_boards: true,
            study_groups: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });
  }
}
