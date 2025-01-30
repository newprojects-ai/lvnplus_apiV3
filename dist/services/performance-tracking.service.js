"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerformanceTrackingService = void 0;
const db_1 = require("../utils/db");
const errors_1 = require("../utils/errors");
class PerformanceTrackingService {
    async getStudentPerformance(studentId) {
        const student = await db_1.prisma.users.findUnique({
            where: { user_id: studentId }
        });
        if (!student) {
            throw new errors_1.NotFoundError('Student not found');
        }
        const testExecutions = await db_1.prisma.test_executions.findMany({
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
        const totalTests = testExecutions.length;
        const completedTests = testExecutions.filter(te => te.completed_at).length;
        const scores = testExecutions
            .filter(te => te.score !== null)
            .map(te => te.score);
        const averageScore = scores.length > 0
            ? scores.reduce((a, b) => a + b, 0) / scores.length
            : 0;
        const testCompletion = totalTests > 0
            ? (completedTests / totalTests) * 100
            : 0;
        const subjectPerformance = {};
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
        const formattedSubjectPerformance = {};
        Object.entries(subjectPerformance).forEach(([subject, data]) => {
            formattedSubjectPerformance[subject] = {
                averageScore: data.count > 0 ? data.total / data.count : 0,
                testsAttempted: data.count
            };
        });
        const recentActivity = testExecutions
            .filter(te => te.completed_at)
            .slice(0, 5)
            .map(te => ({
            date: te.completed_at,
            testId: te.test_plan_id,
            score: te.score || 0,
            subjectName: te.test_plans.exam_boards.board_name
        }));
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        const monthlyData = {};
        testExecutions
            .filter(te => te.completed_at && te.completed_at > sixMonthsAgo)
            .forEach(te => {
            const monthYear = te.completed_at.toISOString().slice(0, 7);
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
    async getGroupPerformance(groupId) {
        const group = await db_1.prisma.study_groups.findUnique({
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
            throw new errors_1.NotFoundError('Study group not found');
        }
        const studentMetrics = await Promise.all(group.members.map(async (member) => {
            const metrics = await this.getStudentPerformance(member.student_id);
            return {
                studentId: member.student_id,
                studentName: `${member.student.first_name} ${member.student.last_name}`,
                metrics
            };
        }));
        const groupAverages = {
            averageScore: 0,
            completionRate: 0,
            subjectPerformance: {}
        };
        if (studentMetrics.length > 0) {
            groupAverages.averageScore = studentMetrics.reduce((sum, student) => sum + student.metrics.averageScore, 0) / studentMetrics.length;
            groupAverages.completionRate = studentMetrics.reduce((sum, student) => sum + student.metrics.testCompletion, 0) / studentMetrics.length;
            const allSubjects = new Set();
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
                        averageScore: subjectData.reduce((sum, data) => sum + data.averageScore, 0) / subjectData.length,
                        totalAttempts: subjectData.reduce((sum, data) => sum + data.testsAttempted, 0)
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
exports.PerformanceTrackingService = PerformanceTrackingService;
