import { PrismaClient } from '@prisma/client';
import { BadRequestError, NotFoundError } from '../utils/errors';
import { generateLinkCode } from '../utils/codeGenerator';

const prisma = new PrismaClient();

export class StudentService {
  // Get student details
  async getStudent(studentId: bigint) {
    const student = await prisma.student.findUnique({
      where: { id: studentId }
    });

    if (!student) {
      throw new NotFoundError('Student not found');
    }

    return student;
  }

  // Generate linking code for student
  async generateLinkCode(studentId: bigint) {
    const student = await this.getStudent(studentId);
    const code = generateLinkCode();

    await prisma.student.update({
      where: { id: studentId },
      data: { linkCode: code }
    });

    return code;
  }

  // Get linked guardians
  async getLinkedGuardians(studentId: bigint) {
    const guardians = await prisma.studentGuardian.findMany({
      where: {
        student_id: studentId
      },
      include: {
        guardian: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        }
      }
    });

    return guardians;
  }

  // Link guardian using code
  async linkGuardian(studentId: bigint, guardianId: bigint, code: string) {
    const student = await prisma.student.findUnique({
      where: { id: studentId }
    });

    if (!student) {
      throw new NotFoundError('Student not found');
    }

    if (student.linkCode !== code) {
      throw new BadRequestError('Invalid link code');
    }

    // Check if link already exists
    const existingLink = await prisma.studentGuardian.findFirst({
      where: {
        student_id: studentId,
        guardian_id: guardianId
      }
    });

    if (existingLink) {
      throw new BadRequestError('Guardian is already linked to this student');
    }

    // Create link and clear the code
    await prisma.$transaction([
      prisma.studentGuardian.create({
        data: {
          student_id: studentId,
          guardian_id: guardianId,
          relationship: 'GUARDIAN'
        }
      }),
      prisma.student.update({
        where: { id: studentId },
        data: { linkCode: null }
      })
    ]);

    return student;
  }

  // Unlink guardian
  async unlinkGuardian(studentId: bigint, guardianId: bigint) {
    const link = await prisma.studentGuardian.findFirst({
      where: {
        student_id: studentId,
        guardian_id: guardianId
      }
    });

    if (!link) {
      throw new NotFoundError('Guardian-student relationship not found');
    }

    await prisma.studentGuardian.delete({
      where: { id: link.id }
    });
  }

  // Get test plans for student
  async getTestPlans(studentId: bigint) {
    const plans = await prisma.testPlan.findMany({
      where: {
        student_id: studentId
      },
      include: {
        subject: true,
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    return plans;
  }

  // Get test executions for student
  async getTestExecutions(studentId: bigint) {
    const executions = await prisma.testExecution.findMany({
      where: {
        student_id: studentId
      },
      include: {
        testPlan: {
          include: {
            subject: true
          }
        }
      }
    });

    return executions;
  }

  // Get performance data for student
  async getPerformanceData(studentId: bigint) {
    const executions = await prisma.testExecution.findMany({
      where: {
        student_id: studentId,
        status: 'COMPLETED'
      },
      include: {
        testPlan: {
          include: {
            subject: true
          }
        }
      },
      orderBy: {
        completedAt: 'asc'
      }
    });

    // Group by subject and calculate averages
    const performanceBySubject = executions.reduce((acc, exec) => {
      const subjectId = exec.testPlan.subject.id;
      if (!acc[subjectId]) {
        acc[subjectId] = {
          subjectName: exec.testPlan.subject.name,
          scores: [],
          dates: []
        };
      }
      acc[subjectId].scores.push(exec.score);
      acc[subjectId].dates.push(exec.completedAt);
      return acc;
    }, {});

    return performanceBySubject;
  }
}
