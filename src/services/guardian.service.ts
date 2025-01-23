import { GuardianRelationStatus, GuardianRelationType, Prisma } from '@prisma/client';
import { NotFoundError, ValidationError } from '../utils/errors';
import { prisma } from '../utils/db';

export class GuardianService {
  async requestLink(guardianId: bigint, studentEmail: string, relationType: GuardianRelationType) {
    // Find the student by email
    const student = await prisma.users.findUnique({
      where: { email: studentEmail },
      include: {
        user_roles: {
          include: { roles: true }
        }
      }
    });

    if (!student) {
      throw new NotFoundError('Student not found');
    }

    // Verify the user is a student
    const isStudent = student.user_roles.some(ur => 
      ur.roles.role_name.toUpperCase() === 'STUDENT'
    );

    if (!isStudent) {
      throw new ValidationError('User is not a student');
    }

    // Check if relationship already exists
    const existingRelation = await prisma.student_guardians.findUnique({
      where: {
        unique_guardian_student: {
          guardian_id: guardianId,
          student_id: student.user_id
        }
      }
    });

    if (existingRelation) {
      if (existingRelation.status === GuardianRelationStatus.ACTIVE) {
        throw new ValidationError('Relationship already exists');
      } else if (existingRelation.status === GuardianRelationStatus.PENDING) {
        throw new ValidationError('Relationship request already pending');
      }
    }

    // Create the relationship request
    return await prisma.student_guardians.create({
      data: {
        guardian_id: guardianId,
        student_id: student.user_id,
        relationship_type: relationType,
        status: GuardianRelationStatus.PENDING
      }
    });
  }

  async confirmLink(relationshipId: bigint, studentId: bigint) {
    const relationship = await prisma.student_guardians.findFirst({
      where: {
        relationship_id: relationshipId,
        student_id: studentId,
        status: GuardianRelationStatus.PENDING
      }
    });

    if (!relationship) {
      throw new NotFoundError('Relationship request not found');
    }

    return await prisma.student_guardians.update({
      where: { relationship_id: relationshipId },
      data: { 
        status: GuardianRelationStatus.ACTIVE,
        updated_at: new Date()
      }
    });
  }

  async deactivateLink(guardianId: bigint, studentId: bigint) {
    const relationship = await prisma.student_guardians.findUnique({
      where: {
        unique_guardian_student: {
          guardian_id: guardianId,
          student_id: studentId
        }
      }
    });

    if (!relationship) {
      throw new NotFoundError('Relationship not found');
    }

    return await prisma.student_guardians.update({
      where: { relationship_id: relationship.relationship_id },
      data: { 
        status: GuardianRelationStatus.INACTIVE,
        updated_at: new Date()
      }
    });
  }

  async getStudents(guardianId: bigint) {
    return await prisma.student_guardians.findMany({
      where: {
        guardian_id: guardianId,
        status: GuardianRelationStatus.ACTIVE
      },
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
    });
  }

  async getGuardians(studentId: bigint) {
    return await prisma.student_guardians.findMany({
      where: {
        student_id: studentId,
        status: GuardianRelationStatus.ACTIVE
      },
      include: {
        guardian: {
          select: {
            user_id: true,
            email: true,
            first_name: true,
            last_name: true
          }
        }
      }
    });
  }
}
