"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestPlanService = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const errors_1 = require("../utils/errors");
const questionSelector_service_1 = require("./questionSelector.service");
class TestPlanService {
    async createTestPlan(plannerId, data) {
        if (!data.studentId) {
            console.error('Attempt to create test plan without student ID', {
                plannerId: plannerId.toString(),
                providedData: JSON.stringify(data)
            });
            throw new errors_1.ValidationError('A student must be assigned to the test plan. Student ID is required.');
        }
        const safePlannerId = BigInt(plannerId);
        const safeStudentId = BigInt(data.studentId);
        const safeBoardId = data.boardId ? BigInt(data.boardId) : null;
        const subtopicIds = data.configuration.subtopics.map(id => BigInt(id));
        const topicIds = data.configuration.topics.map(id => BigInt(id));
        const totalQuestionCount = data.configuration.totalQuestionCount;
        const selectedQuestions = await this.selectQuestions(subtopicIds.length > 0 ? subtopicIds.map(id => Number(id)) : undefined, topicIds.length > 0 ? topicIds.map(id => Number(id)) : undefined, totalQuestionCount);
        if (selectedQuestions.length < totalQuestionCount) {
            throw new errors_1.ValidationError(`Not enough questions available. Found ${selectedQuestions.length}, needed ${totalQuestionCount}`);
        }
        const randomQuestions = this.selectRandomQuestions(selectedQuestions, totalQuestionCount);
        const testPlan = await prisma_1.default.test_plans.create({
            data: {
                board_id: safeBoardId ? Number(safeBoardId) : null,
                student_id: Number(safeStudentId),
                planned_by: Number(safePlannerId),
                test_type: data.testType,
                timing_type: data.timingType,
                time_limit: data.timeLimit,
                planned_at: new Date(),
                configuration: JSON.stringify({
                    topics: topicIds.map(id => id.toString()),
                    subtopics: subtopicIds.map(id => id.toString()),
                    totalQuestionCount: data.configuration.totalQuestionCount,
                }),
                template_id: data.templateId || undefined,
            },
        });
        const testExecution = await prisma_1.default.test_executions.create({
            data: {
                test_plan_id: testPlan.test_plan_id,
                student_id: Number(safeStudentId),
                status: 'NOT_STARTED',
                test_data: JSON.stringify({
                    questions: randomQuestions.map(q => ({
                        question_id: Number(q.question_id),
                        subtopic_id: Number(q.subtopic_id),
                        question_text: q.question_text,
                        options: JSON.parse(q.options),
                        difficulty_level: Number(q.difficulty_level),
                        correct_answer: q.correct_answer,
                        correct_answer_plain: q.correct_answer_plain || q.correct_answer,
                    })),
                    responses: randomQuestions.map(q => ({
                        question_id: Number(q.question_id),
                        student_answer: null,
                        is_correct: null,
                        time_spent: 0
                    })),
                }),
            },
        });
        console.log('Test plan and execution created', {
            testPlanId: testPlan.test_plan_id,
            testExecutionId: testExecution.execution_id,
            selectedQuestionsCount: randomQuestions.length,
            totalQuestionCount,
        });
        const completeTestPlan = await prisma_1.default.test_plans.findUnique({
            where: { test_plan_id: testPlan.test_plan_id },
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
        return this.formatTestPlanResponse(completeTestPlan);
    }
    async selectQuestions(subtopicIds, topicIds, totalQuestions) {
        const selectedQuestions = await questionSelector_service_1.questionSelectorService.selectQuestions({
            subtopicIds,
            topicIds,
            totalQuestionCount: totalQuestions || 10,
        }, {
            randomize: true,
            allowCrossDifficulty: true,
            topicDistributionStrategy: 'PROPORTIONAL'
        });
        return selectedQuestions;
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
        if (testPlan.planned_by !== userId && testPlan.student_id !== userId) {
            throw new errors_1.UnauthorizedError('Unauthorized access to test plan');
        }
        return this.formatTestPlanResponse(testPlan);
    }
    async updateTestPlan(testPlanId, userId, data) {
        const testPlan = await this.findTestPlanWithAccess(testPlanId, userId);
        const updatedTestPlan = await prisma_1.default.test_plans.update({
            where: { test_plan_id: testPlanId },
            data: {
                ...(data.templateId && { template_id: data.templateId }),
                ...(data.boardId && { board_id: data.boardId }),
                ...(data.testType && { test_type: data.testType }),
                ...(data.timingType && { timing_type: data.timingType }),
                ...(data.timeLimit !== undefined && { time_limit: data.timeLimit }),
                ...(data.studentId && { student_id: typeof data.studentId === 'bigint'
                        ? data.studentId
                        : BigInt(String(data.studentId)) }),
                ...(data.configuration && { configuration: JSON.stringify(data.configuration) }),
            },
            include: this.getTestPlanIncludes(),
        });
        return this.formatTestPlanResponse(updatedTestPlan);
    }
    async deleteTestPlan(testPlanId, userId) {
        await this.findTestPlanWithAccess(testPlanId, userId);
        await prisma_1.default.test_plans.delete({
            where: { test_plan_id: testPlanId },
        });
    }
    async findTestPlanWithAccess(testPlanId, userId) {
        const testPlan = await prisma_1.default.test_plans.findUnique({
            where: { test_plan_id: testPlanId },
            include: this.getTestPlanIncludes(),
        });
        if (!testPlan) {
            throw new errors_1.NotFoundError('Test plan not found');
        }
        if (testPlan.planned_by !== userId) {
            throw new errors_1.UnauthorizedError('Not authorized to access this test plan');
        }
        return testPlan;
    }
    getTestPlanIncludes() {
        return {
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
        };
    }
    selectRandomQuestions(questions, count) {
        const shuffled = [...questions].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }
    formatTestPlanResponse(testPlan) {
        return {
            testPlanId: testPlan.test_plan_id,
            templateId: testPlan.template_id,
            boardId: testPlan.board_id,
            testType: testPlan.test_type,
            timingType: testPlan.timing_type,
            timeLimit: testPlan.time_limit,
            student: {
                userId: testPlan.users_test_plans_student_idTousers.user_id,
                email: testPlan.users_test_plans_student_idTousers.email,
                firstName: testPlan.users_test_plans_student_idTousers.first_name,
                lastName: testPlan.users_test_plans_student_idTousers.last_name,
            },
            plannedBy: testPlan.planned_by,
            plannedAt: testPlan.planned_at,
            configuration: JSON.parse(testPlan.configuration),
            execution: testPlan.test_executions[0] ? {
                status: testPlan.test_executions[0].status,
                startedAt: testPlan.test_executions[0].started_at,
                completedAt: testPlan.test_executions[0].completed_at,
                score: testPlan.test_executions[0].score,
            } : undefined,
        };
    }
}
exports.TestPlanService = TestPlanService;
