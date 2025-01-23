import { Prisma } from '@prisma/client';
import { NotFoundError, ValidationError } from '../utils/errors';
import { prisma } from '../utils/db';

export class StudyGroupService {
  async createGroup(tutorId: bigint, groupName: string, description?: string) {
    // Verify the user is a tutor
    const tutor = await prisma.users.findFirst({
      where: {
        user_id: tutorId,
        user_roles: {
          some: {
            roles: {
              role_name: {
                equals: 'TUTOR',
                mode: 'insensitive'
              }
            }
          }
        }
      }
    });

    if (!tutor) {
      throw new ValidationError('User is not a tutor');
    }

    return await prisma.study_groups.create({
      data: {
        tutor_id: tutorId,
        group_name: groupName,
        description
      }
    });
  }

  async getGroups(tutorId: bigint) {
    return await prisma.study_groups.findMany({
      where: {
        tutor_id: tutorId,
        active: true
      },
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
    });
  }

  async addMember(groupId: bigint, studentId: bigint) {
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

    // Verify the user is a student
    const student = await prisma.users.findFirst({
      where: {
        user_id: studentId,
        user_roles: {
          some: {
            roles: {
              role_name: {
                equals: 'STUDENT',
                mode: 'insensitive'
              }
            }
          }
        }
      }
    });

    if (!student) {
      throw new ValidationError('User is not a student');
    }

    // Add the student to the group
    return await prisma.group_members.create({
      data: {
        group_id: groupId,
        student_id: studentId
      }
    });
  }

  async removeMember(groupId: bigint, studentId: bigint) {
    return await prisma.group_members.delete({
      where: {
        group_id_student_id: {
          group_id: groupId,
          student_id: studentId
        }
      }
    });
  }

  async deactivateGroup(groupId: bigint, tutorId: bigint) {
    const group = await prisma.study_groups.findFirst({
      where: {
        group_id: groupId,
        tutor_id: tutorId
      }
    });

    if (!group) {
      throw new NotFoundError('Study group not found');
    }

    return await prisma.study_groups.update({
      where: { group_id: groupId },
      data: { active: false }
    });
  }

  async getGroupMembers(groupId: bigint) {
    const group = await prisma.study_groups.findUnique({
      where: { group_id: groupId },
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
    });

    if (!group) {
      throw new NotFoundError('Study group not found');
    }

    return group.members;
  }
}
