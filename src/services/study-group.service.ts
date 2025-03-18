import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

type StudyGroup = Prisma.study_groupsGetPayload<{
  include: {
    students: true;
    subjects: true;
  }
}>;

type Student = Prisma.usersGetPayload<{
  include: {
    test_executions: true;
    activity_log: true;
  }
}>;

interface GroupMemberResponse {
  id: string;
  name: string;
  email: string;
  joined_at: Date;
  recent_tests: Array<{
    id: string;
    status: string;
    score: number | null;
    completed_at: Date | null;
  }>;
  recent_activity: Array<{
    id: string;
    activity_type: string;
    details: string | null;
    created_at: Date | null;
  }>;
}

@Injectable()
export class StudyGroupService {
  constructor(private prisma: PrismaService) {}

  async createGroup(tutorId: bigint, name: string, description: string, subjects?: bigint[]): Promise<StudyGroup> {
    return this.prisma.study_groups.create({
      data: {
        group_name: name,
        description,
        tutor_id: tutorId.toString(),
        created_at: new Date(),
        updated_at: new Date(),
        subjects: subjects ? {
          connect: subjects.map(id => ({ subject_id: id.toString() }))
        } : undefined
      },
      include: {
        students: true,
        subjects: true
      }
    });
  }

  async getGroups(tutorId: bigint): Promise<StudyGroup[]> {
    return this.prisma.study_groups.findMany({
      where: {
        tutor_id: tutorId.toString()
      },
      include: {
        students: true,
        subjects: true
      }
    });
  }

  async addMember(groupId: bigint, studentId: bigint): Promise<StudyGroup> {
    const group = await this.prisma.study_groups.update({
      where: { group_id: groupId.toString() },
      data: {
        students: {
          connect: { user_id: studentId.toString() }
        },
        updated_at: new Date()
      },
      include: {
        students: true,
        subjects: true
      }
    });

    // Log activity
    await this.prisma.activity_log.create({
      data: {
        activity_type: 'group_joined',
        details: `Joined study group: ${group.group_name}`,
        user: {
          connect: { user_id: studentId.toString() }
        }
      }
    });

    return group;
  }

  async removeMember(groupId: bigint, studentId: bigint): Promise<StudyGroup> {
    const group = await this.prisma.study_groups.update({
      where: { group_id: groupId.toString() },
      data: {
        students: {
          disconnect: { user_id: studentId.toString() }
        },
        updated_at: new Date()
      },
      include: {
        students: true,
        subjects: true
      }
    });

    // Log activity
    await this.prisma.activity_log.create({
      data: {
        activity_type: 'group_left',
        details: `Left study group: ${group.group_name}`,
        user: {
          connect: { user_id: studentId.toString() }
        }
      }
    });

    return group;
  }

  async deactivateGroup(groupId: bigint, tutorId: bigint): Promise<StudyGroup> {
    return this.prisma.study_groups.update({
      where: { 
        group_id: groupId.toString(),
        tutor_id: tutorId.toString()
      },
      data: {
        active: false,
        updated_at: new Date()
      },
      include: {
        students: true,
        subjects: true
      }
    });
  }

  async getGroupMembers(groupId: bigint): Promise<GroupMemberResponse[] | null> {
    const group = await this.prisma.study_groups.findUnique({
      where: { group_id: groupId.toString() },
      include: {
        students: {
          include: {
            test_executions: true,
            activity_log: true
          }
        }
      }
    });

    if (!group) return null;

    return group.students.map((student: Student) => ({
      id: student.user_id.toString(),
      name: student.name || '',
      email: student.email,
      joined_at: student.created_at,
      recent_tests: student.test_executions
        .filter((test): test is NonNullable<typeof student.test_executions[0]> => test !== null)
        .filter(test => test.status === 'COMPLETED')
        .sort((a, b) => (b.completed_at?.getTime() || 0) - (a.completed_at?.getTime() || 0))
        .slice(0, 5)
        .map(test => ({
          id: test.execution_id.toString(),
          status: test.status,
          score: test.score,
          completed_at: test.completed_at
        })),
      recent_activity: student.activity_log
        .filter((log): log is NonNullable<typeof student.activity_log[0]> => log !== null)
        .sort((a, b) => (b.created_at?.getTime() || 0) - (a.created_at?.getTime() || 0))
        .slice(0, 10)
        .map(log => ({
          id: log.activity_id.toString(),
          activity_type: log.activity_type,
          details: log.details || '',
          created_at: log.created_at
        }))
    }));
  }
}
