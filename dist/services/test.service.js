"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestService = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const errors_1 = require("../utils/errors");
class TestService {
    async createTestPlan(plannerId, data) {
        const testPlan = await prisma_1.default.test_plans.create({
            data: {
                template_id: data.templateId ? BigInt(data.templateId) : null,
                board_id: data.boardId,
                test_type: data.testType,
                timing_type: data.timingType,
                time_limit: data.timeLimit,
                student_id: BigInt(data.studentId),
                planned_by: plannerId,
                configuration: JSON.stringify(data.configuration),
            },
            include: {
                users_test_plans_student_idTousers: {
                    select: {
                        user_id: true,
                        email: true,
                        first_name: true,
                        last_name: true,
                    },
                },
                test_executions: {
                    select: {
                        status: true,
                        started_at: true,
                        completed_at: true,
                        score: true,
                    },
                    take: 1,
                    orderBy: {
                        execution_id: 'desc',
                    },
                },
            },
        });
        await prisma_1.default.test_executions.create({
            data: {
                test_plan_id: testPlan.test_plan_id,
                status: 'NOT_STARTED',
                test_data: JSON.stringify({
                    questions: await this.selectQuestions(data.configuration),
                    responses: [],
                    timing: [],
                }),
            },
        });
        return this.formatTestPlanResponse(testPlan);
    }
    async getTestPlan(testPlanId, userId) {
        const testPlan = await prisma_1.default.test_plans.findUnique({
            where: { test_plan_id: testPlanId },
            include: {
                users_test_plans_student_idTousers: {
                    select: {
                        user_id: true,
                        email: true,
                        first_name: true,
                        last_name: true,
                    },
                },
                test_executions: {
                    select: {
                        status: true,
                        started_at: true,
                        completed_at: true,
                        score: true,
                    },
                    take: 1,
                    orderBy: {
                        execution_id: 'desc',
                    },
                },
            },
        });
        if (!testPlan) {
            throw new errors_1.NotFoundError('Test plan not found');
        }
        if (testPlan.student_id !== userId && testPlan.planned_by !== userId) {
            throw new errors_1.UnauthorizedError('Unauthorized access to test plan');
        }
        return this.formatTestPlanResponse(testPlan);
    }
    async getStudentTests(studentId, userId, filters) {
        if (studentId !== userId) {
            const hasAccess = await this.verifyStudentAccess(userId, studentId);
            if (!hasAccess) {
                throw new errors_1.UnauthorizedError('Unauthorized access to student tests');
            }
        }
        const where = {
            student_id: studentId,
        };
        if (filters.status) {
            where.test_executions = {
                some: {
                    status: filters.status,
                },
            };
        }
        if (filters.from || filters.to) {
            where.planned_at = {};
            if (filters.from) {
                where.planned_at.gte = new Date(filters.from);
            }
            if (filters.to) {
                where.planned_at.lte = new Date(filters.to);
            }
        }
        const testPlans = await prisma_1.default.test_plans.findMany({
            where,
            include: {
                users_test_plans_student_idTousers: {
                    select: {
                        user_id: true,
                        email: true,
                        first_name: true,
                        last_name: true,
                    },
                },
                test_executions: {
                    select: {
                        status: true,
                        started_at: true,
                        completed_at: true,
                        score: true,
                    },
                    take: 1,
                    orderBy: {
                        execution_id: 'desc',
                    },
                },
            },
            orderBy: {
                planned_at: 'desc',
            },
        });
        return testPlans.map(this.formatTestPlanResponse);
    }
    async startTest(testPlanId, userId) {
        const testPlan = await prisma_1.default.test_plans.findUnique({
            where: { test_plan_id: testPlanId },
            include: {
                test_executions: {
                    orderBy: {
                        execution_id: 'desc',
                    },
                    take: 1,
                },
            },
        });
        if (!testPlan) {
            throw new errors_1.NotFoundError('Test plan not found');
        }
        if (testPlan.student_id !== userId) {
            throw new errors_1.UnauthorizedError('Only the assigned student can start the test');
        }
        const latestExecution = testPlan.test_executions[0];
        if (!latestExecution || latestExecution.status !== 'NOT_STARTED') {
            throw new errors_1.ValidationError('Test cannot be started');
        }
        const execution = await prisma_1.default.test_executions.update({
            where: { execution_id: latestExecution.execution_id },
            data: {
                status: 'IN_PROGRESS',
                started_at: new Date(),
            },
        });
        return this.formatExecutionResponse(execution);
    }
    async submitAnswer(executionId, userId, answer) {
        const execution = await this.findExecutionWithAccess(executionId, userId);
        if (execution.status !== 'IN_PROGRESS') {
            throw new errors_1.ValidationError('Test is not in progress');
        }
        const testData = JSON.parse(execution.test_data);
        testData.responses.push(answer);
        const updatedExecution = await prisma_1.default.test_executions.update({
            where: { execution_id: executionId },
            data: {
                test_data: JSON.stringify(testData),
            },
        });
        return this.formatExecutionResponse(updatedExecution);
    }
    async getTestStatus(executionId, userId) {
        const execution = await this.findExecutionWithAccess(executionId, userId);
        const testData = JSON.parse(execution.test_data);
        return {
            status: execution.status,
            timeRemaining: this.calculateTimeRemaining(execution),
            questionsAnswered: testData.responses.length,
            totalQuestions: testData.questions.length,
        };
    }
    async getTestResults(executionId, userId) {
        const execution = await this.findExecutionWithAccess(executionId, userId);
        if (execution.status !== 'COMPLETED') {
            throw new errors_1.ValidationError('Test results are not available');
        }
        const testData = JSON.parse(execution.test_data);
        const analysis = this.analyzeTestResults(testData);
        return {
            score: execution.score,
            totalQuestions: testData.questions.length,
            correctAnswers: analysis.correctAnswers,
            timeSpent: analysis.totalTimeSpent,
            questionAnalysis: analysis.questionAnalysis,
        };
    }
    async selectQuestions(configuration) {
        return [];
    }
    async findExecutionWithAccess(executionId, userId) {
        const execution = await prisma_1.default.test_executions.findUnique({
            where: { execution_id: executionId },
            include: {
                test_plans: true,
            },
        });
        if (!execution) {
            throw new errors_1.NotFoundError('Test execution not found');
        }
        if (execution.test_plans.student_id !== userId &&
            execution.test_plans.planned_by !== userId) {
            throw new errors_1.UnauthorizedError('Unauthorized access to test execution');
        }
        return execution;
    }
    async verifyStudentAccess(teacherId, studentId) {
        const teacher = await prisma_1.default.users.findFirst({
            where: {
                user_id: teacherId,
                user_roles: {
                    some: {
                        roles: {
                            role_name: {
                                in: ['TEACHER', 'ADMIN'],
                            },
                        },
                    },
                },
            },
        });
        return !!teacher;
    }
    calculateTimeRemaining(execution) {
        if (!execution.test_plans.time_limit || execution.status !== 'IN_PROGRESS') {
            return null;
        }
        const startTime = new Date(execution.started_at).getTime();
        const timeLimit = execution.test_plans.time_limit * 60 * 1000;
        const elapsed = Date.now() - startTime;
        return Math.max(0, timeLimit - elapsed);
    }
    analyzeTestResults(testData) {
        let correctAnswers = 0;
        let totalTimeSpent = 0;
        const questionAnalysis = [];
        for (const response of testData.responses) {
            const question = testData.questions.find((q) => q.question_id === response.questionId);
            const isCorrect = question?.correct_answer === response.answer;
            if (isCorrect)
                correctAnswers++;
            totalTimeSpent += response.timeSpent;
            questionAnalysis.push({
                questionId: response.questionId,
                correct: isCorrect,
                timeSpent: response.timeSpent,
                topic: question?.topic?.name,
            });
        }
        return {
            correctAnswers,
            totalTimeSpent,
            questionAnalysis,
        };
    }
    formatTestPlanResponse(testPlan) {
        return {
            testPlanId: testPlan.test_plan_id,
            testType: testPlan.test_type,
            timingType: testPlan.timing_type,
            timeLimit: testPlan.time_limit,
            student: {
                userId: testPlan.users_test_plans_student_idTousers.user_id,
                email: testPlan.users_test_plans_student_idTousers.email,
                firstName: testPlan.users_test_plans_student_idTousers.first_name,
                lastName: testPlan.users_test_plans_student_idTousers.last_name,
            },
            configuration: JSON.parse(testPlan.configuration),
            execution: testPlan.test_executions[0] ? {
                status: testPlan.test_executions[0].status,
                startedAt: testPlan.test_executions[0].started_at,
                completedAt: testPlan.test_executions[0].completed_at,
                score: testPlan.test_executions[0].score,
            } : undefined,
        };
    }
    formatExecutionResponse(execution) {
        return {
            executionId: execution.execution_id,
            status: execution.status,
            startedAt: execution.started_at,
            completedAt: execution.completed_at,
            score: execution.score,
            testData: JSON.parse(execution.test_data),
        };
    }
}
exports.TestService = TestService;
