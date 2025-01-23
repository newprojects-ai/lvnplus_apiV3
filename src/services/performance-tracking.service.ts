import { prisma } from '../utils/db';
import { NotFoundError } from '../utils/errors';

interface PerformanceMetrics {
  totalTests: number;
  completedTests: number;
  averageScore: number;
  testCompletion: number;
  subjectPerformance: Record<string, {
    averageScore: number;
    testsAttempted: number;
  }>;
  recentActivity: {
    date: Date;
    testId: bigint;
    score: number;
    subjectName: string;
  }[];
  progressTrend: {
    period: string;
    averageScore: number;
    testsCompleted: number;
  }[];
}

export class PerformanceTrackingService {
  async getStudentPerformance(studentId: bigint): Promise<PerformanceMetrics> {
    const student = await prisma.users.findUnique({
      where: { user_id: studentId }
    });

    if (!student) {
      throw new NotFoundError('Student not found');
    }

    // Get all test executions for the student
    const testExecutions = await prisma.test_executions.findMany({
      where: {
        student_id: studentId
      },
      include: {
        test_plans: {
          include: {
            exam_boards: true
          }
        }
      },
      orderBy: {
        completed_at: 'desc'
      }
    });

    // Calculate total and completed tests
    const totalTests = testExecutions.length;
    const completedTests = testExecutions.filter(te => te.completed_at).length;

    // Calculate average score
    const scores = testExecutions
      .filter(te => te.score !== null)
      .map(te => te.score!);
    const averageScore = scores.length > 0
      ? scores.reduce((a, b) => a + b, 0) / scores.length
      : 0;

    // Calculate test completion rate
    const testCompletion = totalTests > 0
      ? (completedTests / totalTests) * 100
      : 0;

    // Calculate subject-wise performance
    const subjectPerformance: Record<string, { total: number; count: number }> = {};
    testExecutions.forEach(te => {
      if (te.score !== null) {
        const subject = te.test_plans.exam_boards.board_name;
        if (!subjectPerformance[subject]) {
          subjectPerformance[subject] = { total: 0, count: 0 };
        }
        subjectPerformance[subject].total += te.score;
        subjectPerformance[subject].count += 1;
      }
    });

    // Format subject performance
    const formattedSubjectPerformance: Record<string, {
      averageScore: number;
      testsAttempted: number;
    }> = {};
    
    Object.entries(subjectPerformance).forEach(([subject, data]) => {
      formattedSubjectPerformance[subject] = {
        averageScore: data.count > 0 ? data.total / data.count : 0,
        testsAttempted: data.count
      };
    });

    // Get recent activity
    const recentActivity = testExecutions
      .filter(te => te.completed_at)
      .slice(0, 5)
      .map(te => ({
        date: te.completed_at!,
        testId: te.test_plan_id,
        score: te.score || 0,
        subjectName: te.test_plans.exam_boards.board_name
      }));

    // Calculate progress trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyData: Record<string, { scores: number[]; count: number }> = {};
    testExecutions
      .filter(te => te.completed_at && te.completed_at > sixMonthsAgo)
      .forEach(te => {
        const monthYear = te.completed_at!.toISOString().slice(0, 7);
        if (!monthlyData[monthYear]) {
          monthlyData[monthYear] = { scores: [], count: 0 };
        }
        if (te.score !== null) {
          monthlyData[monthYear].scores.push(te.score);
        }
        monthlyData[monthYear].count++;
      });

    const progressTrend = Object.entries(monthlyData)
      .map(([period, data]) => ({
        period,
        averageScore: data.scores.length > 0
          ? data.scores.reduce((a, b) => a + b, 0) / data.scores.length
          : 0,
        testsCompleted: data.count
      }))
      .sort((a, b) => a.period.localeCompare(b.period));

    return {
      totalTests,
      completedTests,
      averageScore,
      testCompletion,
      subjectPerformance: formattedSubjectPerformance,
      recentActivity,
      progressTrend
    };
  }

  async getGroupPerformance(groupId: bigint) {
    const group = await prisma.study_groups.findUnique({
      where: { group_id: groupId },
      include: {
        members: {
          include: {
            student: true
          }
        }
      }
    });

    if (!group) {
      throw new NotFoundError('Study group not found');
    }

    // Get performance metrics for each student
    const studentMetrics = await Promise.all(
      group.members.map(async member => {
        const metrics = await this.getStudentPerformance(member.student_id);
        return {
          studentId: member.student_id,
          studentName: `${member.student.first_name} ${member.student.last_name}`,
          metrics
        };
      })
    );

    // Calculate group averages
    const groupAverages = {
      averageScore: 0,
      completionRate: 0,
      subjectPerformance: {} as Record<string, {
        averageScore: number;
        totalAttempts: number;
      }>
    };

    if (studentMetrics.length > 0) {
      // Calculate overall averages
      groupAverages.averageScore = studentMetrics.reduce(
        (sum, student) => sum + student.metrics.averageScore,
        0
      ) / studentMetrics.length;

      groupAverages.completionRate = studentMetrics.reduce(
        (sum, student) => sum + student.metrics.testCompletion,
        0
      ) / studentMetrics.length;

      // Calculate subject averages
      const allSubjects = new Set<string>();
      studentMetrics.forEach(student => {
        Object.keys(student.metrics.subjectPerformance).forEach(subject => {
          allSubjects.add(subject);
        });
      });

      allSubjects.forEach(subject => {
        const subjectData = studentMetrics
          .filter(student => student.metrics.subjectPerformance[subject])
          .map(student => student.metrics.subjectPerformance[subject]);

        if (subjectData.length > 0) {
          groupAverages.subjectPerformance[subject] = {
            averageScore: subjectData.reduce(
              (sum, data) => sum + data.averageScore,
              0
            ) / subjectData.length,
            totalAttempts: subjectData.reduce(
              (sum, data) => sum + data.testsAttempted,
              0
            )
          };
        }
      });
    }

    return {
      groupInfo: {
        groupId: group.group_id,
        groupName: group.group_name,
        memberCount: group.members.length
      },
      groupAverages,
      studentMetrics
    };
  }
}
