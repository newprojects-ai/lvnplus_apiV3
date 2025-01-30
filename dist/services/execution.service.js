"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestExecutionService = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const errors_1 = require("../utils/errors");
const gamification_service_1 = require("./gamification.service");
class TestExecutionService {
    gamificationService;
    constructor() {
        this.gamificationService = new gamification_service_1.GamificationService();
    }
    safeBigInt(value, defaultValue = BigInt(0)) {
        if (value === undefined) {
            return defaultValue;
        }
        try {
            if (typeof value === 'string' && value.trim() === '') {
                throw new Error('Empty string is not a valid BigInt');
            }
            const result = typeof value === 'string' ? BigInt(value) : value;
            if (result === BigInt(0) && value !== '0' && value !== 0n) {
                throw new Error(`Invalid BigInt value: ${value}`);
            }
            return result;
        }
        catch (error) {
            console.error('Failed to convert to BigInt:', {
                value,
                type: typeof value,
                error: error instanceof Error ? error.message : String(error)
            });
            throw new errors_1.ValidationError(`Invalid execution ID: ${value}`);
        }
    }
    async getExecution(executionId, userId) {
        const safeExecutionId = this.safeBigInt(executionId);
        const safeUserId = this.safeBigInt(userId);
        const execution = await this.findExecutionWithAccess(safeExecutionId, safeUserId);
        return this.formatExecutionResponse(execution);
    }
    async startExecution(executionId, userId) {
        const safeExecutionId = this.safeBigInt(executionId);
        const safeUserId = this.safeBigInt(userId);
        const execution = await this.findExecutionWithAccess(safeExecutionId, safeUserId);
        if (execution.status !== 'NOT_STARTED') {
            throw new errors_1.ValidationError('Test has already been started');
        }
        const updatedExecution = await prisma_1.default.test_executions.update({
            where: { execution_id: safeExecutionId },
            data: {
                status: 'IN_PROGRESS',
                started_at: new Date(),
            },
        });
        return this.formatExecutionResponse(updatedExecution);
    }
    async submitAnswer(executionId, userId, updateData) {
        console.log('FULL submitAnswer Input', {
            executionId,
            userId,
            updateData,
            updateDataType: typeof updateData
        });
        const safeExecutionId = this.safeBigInt(executionId);
        const safeUserId = this.safeBigInt(userId);
        const safeQuestionId = this.safeBigInt(updateData.question_id);
        console.log('Safe Conversion', {
            safeExecutionId,
            safeUserId,
            safeQuestionId
        });
        const execution = await this.findExecutionWithAccess(safeExecutionId, safeUserId);
        console.log('Execution Data', {
            executionStatus: execution.status,
            testData: execution.test_data
        });
        let testData;
        try {
            testData = JSON.parse(execution.test_data || '{}');
        }
        catch (error) {
            console.error('Error parsing test data', {
                rawTestData: execution.test_data,
                error
            });
            throw new Error('Invalid test data format');
        }
        console.log('Parsed Test Data', {
            questions: testData.questions,
            responses: testData.responses,
            questionsType: typeof testData.questions,
            responsesType: typeof testData.responses
        });
        if (!testData.responses || !Array.isArray(testData.responses)) {
            console.error('Responses is not an array', { testData });
            throw new Error('Invalid responses format');
        }
        const questionIndex = testData.responses.findIndex((resp) => resp.question_id === safeQuestionId);
        console.log('Question Index Search', {
            questionIndex,
            safeQuestionId,
            responsesLength: testData.responses.length
        });
        if (questionIndex === -1) {
            console.error('Question not found in responses', {
                safeQuestionId,
                responses: testData.responses
            });
            throw new errors_1.NotFoundError('Question not found in the test execution');
        }
        const currentQuestion = testData.questions.find((q) => q.question_id === safeQuestionId);
        if (!currentQuestion) {
            console.error('Question details not found', {
                safeQuestionId,
                questions: testData.questions
            });
            throw new errors_1.NotFoundError('Question details not found');
        }
        const updatedResponses = [...testData.responses];
        updatedResponses[questionIndex] = {
            ...updatedResponses[questionIndex],
            student_answer: updateData.student_answer,
            is_correct: this.checkAnswer(currentQuestion, updateData.student_answer),
            time_spent: updateData.time_spent || 0
        };
        console.log('Updated Responses', {
            originalResponse: testData.responses[questionIndex],
            updatedResponse: updatedResponses[questionIndex]
        });
        const testPlan = await prisma_1.default.test_plans.findUnique({
            where: { test_plan_id: execution.test_plan_id },
            include: {
                test_templates: {
                    include: {
                        exam_boards: true
                    }
                }
            }
        });
        if (testPlan?.test_templates?.exam_boards?.board_id) {
            await this.gamificationService.updateSubjectMastery(safeUserId, testPlan.test_templates.exam_boards.board_id, updatedResponses[questionIndex].is_correct);
            await this.gamificationService.logActivity(safeUserId, 'ANSWER_SUBMISSION', updatedResponses[questionIndex].is_correct ? 10 : 0, {
                questionId: safeQuestionId.toString(),
                correct: updatedResponses[questionIndex].is_correct,
                testPlanId: execution.test_plan_id.toString()
            });
        }
        const updatedTestData = {
            ...testData,
            responses: updatedResponses
        };
        const updatedExecution = await prisma_1.default.test_executions.update({
            where: { execution_id: safeExecutionId },
            data: {
                test_data: JSON.stringify(updatedTestData),
                status: this.determineExecutionStatus(updatedResponses)
            }
        });
        console.log('Final Execution Update', {
            updatedTestData,
            executionStatus: updatedExecution.status
        });
        return {
            execution: updatedExecution,
            testData: updatedTestData
        };
    }
    async completeExecution(executionId, userId) {
        console.log('Complete Execution Request', {
            executionId,
            userId,
            executionIdType: typeof executionId,
            userIdType: typeof userId,
            prismaClientStatus: prisma_1.default ? 'initialized' : 'NOT_INITIALIZED'
        });
        const safeExecutionId = this.safeBigInt(executionId);
        const safeUserId = this.safeBigInt(userId);
        if (!prisma_1.default) {
            console.error('Prisma client is not initialized');
            throw new Error('Database connection is not available');
        }
        try {
            console.log('Querying test execution', {
                executionId: safeExecutionId,
                userId: safeUserId
            });
            const existingExecution = await prisma_1.default.test_executions.findUnique({
                where: { execution_id: safeExecutionId },
                select: {
                    status: true,
                    student_id: true,
                    test_plan_id: true,
                    test_data: true
                }
            });
            console.log('Execution Query Result', {
                executionFound: !!existingExecution,
                executionDetails: existingExecution ? {
                    status: existingExecution.status,
                    studentId: existingExecution.student_id,
                    testPlanId: existingExecution.test_plan_id,
                    testDataType: typeof existingExecution.test_data,
                    testDataLength: existingExecution.test_data?.length
                } : null
            });
            if (!existingExecution) {
                throw new errors_1.NotFoundError(`Test execution ${safeExecutionId} not found`);
            }
            console.log('Access Verification', {
                expectedStudentId: existingExecution.student_id,
                providedUserId: safeUserId,
                accessCheck: existingExecution.student_id === safeUserId
            });
            if (existingExecution.student_id !== safeUserId) {
                throw new errors_1.UnauthorizedError('You are not authorized to complete this test execution');
            }
            if (existingExecution.status === 'NOT_STARTED') {
                throw new errors_1.ValidationError('Cannot complete test. Test must be started first. Please click "Start Test" before attempting to complete the test.');
            }
            if (existingExecution.status === 'COMPLETED') {
                throw new errors_1.ValidationError('Cannot complete test. Test has already been completed.');
            }
            if (existingExecution.status === 'PAUSED') {
                throw new errors_1.ValidationError('Cannot complete test while it is paused. Please resume the test first.');
            }
            const scoreResult = await this.calculateAndUpdateTestScore(safeExecutionId, safeUserId);
            const xpEarned = Math.floor(scoreResult.execution.score * 10);
            await this.gamificationService.addXP(safeUserId, xpEarned, 'test_completion');
            await this.gamificationService.updateStreak(safeUserId);
            await this.gamificationService.logActivity(safeUserId, 'TEST_COMPLETION', xpEarned, {
                testPlanId: existingExecution.test_plan_id.toString(),
                score: scoreResult.execution.score,
                totalQuestions: JSON.parse(scoreResult.execution.test_data).questions.length
            });
            const updatedExecution = await prisma_1.default.test_executions.update({
                where: { execution_id: safeExecutionId },
                data: {
                    status: 'COMPLETED',
                    completed_at: new Date(),
                    score: scoreResult.execution.score,
                    test_data: scoreResult.execution.test_data
                },
            });
            console.log('Execution Completed Successfully', {
                executionId: safeExecutionId,
                updatedStatus: updatedExecution.status,
                score: updatedExecution.score
            });
            return {
                execution: updatedExecution,
                testData: JSON.parse(updatedExecution.test_data)
            };
        }
        catch (error) {
            console.error('Error in completeExecution', {
                executionId: safeExecutionId,
                userId: safeUserId,
                errorName: error.name,
                errorMessage: error.message,
                errorStack: error.stack,
                errorDetails: {
                    isNotFoundError: error instanceof errors_1.NotFoundError,
                    isUnauthorizedError: error instanceof errors_1.UnauthorizedError,
                    isValidationError: error instanceof errors_1.ValidationError
                }
            });
            throw error;
        }
    }
    async createExecution(planId, userId) {
        const safeUserId = this.safeBigInt(userId);
        const safePlanId = this.safeBigInt(planId);
        const testPlan = await prisma_1.default.test_plans.findUnique({
            where: { test_plan_id: safePlanId },
            include: {
                users_test_plans_student_idTousers: {
                    select: {
                        user_id: true,
                        email: true,
                        first_name: true,
                        last_name: true
                    }
                },
                users_test_plans_planned_byTousers: {
                    select: {
                        user_id: true,
                        email: true,
                        first_name: true,
                        last_name: true
                    }
                },
                test_templates: true,
                exam_boards: true,
                test_executions: {
                    orderBy: { execution_id: 'desc' },
                    take: 1
                }
            },
        });
        console.log('Creating test execution', {
            testPlanId: safePlanId.toString(),
            planStudentId: testPlan?.student_id?.toString(),
            currentUserId: safeUserId.toString(),
            studentDetails: {
                id: testPlan?.users_test_plans_student_idTousers?.user_id,
                email: testPlan?.users_test_plans_student_idTousers?.email
            }
        });
        if (!testPlan) {
            throw new errors_1.NotFoundError('Test plan not found');
        }
        const extractUserIds = (users) => {
            if (Array.isArray(users)) {
                return users.map(u => BigInt(u.user_id));
            }
            if (users && typeof users === 'object' && 'user_id' in users) {
                return [BigInt(users.user_id)];
            }
            console.error('Invalid users structure:', users);
            return [];
        };
        const studentUserIds = extractUserIds(testPlan.users_test_plans_student_idTousers);
        const plannedByUserIds = extractUserIds(testPlan.users_test_plans_planned_byTousers);
        const isAuthorized = studentUserIds.some(id => id === safeUserId) ||
            plannedByUserIds.some(id => id === safeUserId);
        if (!isAuthorized) {
            throw new errors_1.UnauthorizedError('You are not authorized to start this test');
        }
        if (testPlan.test_executions && testPlan.test_executions.length > 0) {
            const existingExecution = testPlan.test_executions[0];
            if (existingExecution.status === 'NOT_STARTED') {
                console.log('Existing NOT_STARTED execution found', {
                    executionId: existingExecution.execution_id.toString(),
                });
                return this.formatExecutionResponse(existingExecution);
            }
        }
        const selectedQuestions = await prisma_1.default.questions.findMany({
            where: {
                question_id: {
                    in: JSON.parse(testPlan.configuration).questions.map(q => BigInt(q.question_id))
                }
            }
        });
        const newExecution = await prisma_1.default.test_executions.create({
            data: {
                test_plan_id: safePlanId,
                student_id: testPlan.student_id || safeUserId,
                status: 'NOT_STARTED',
                test_data: JSON.stringify({
                    questions: selectedQuestions.map(q => ({
                        question_id: q.question_id.toString(),
                        question_text: q.question_text,
                        question_text_plain: q.question_text_plain,
                        options: JSON.parse(q.options),
                        correct_answer: q.correct_answer,
                        correct_answer_plain: q.correct_answer_plain,
                        solution: q.solution,
                        solution_plain: q.solution_plain,
                        difficulty_level: q.difficulty_level
                    })),
                    responses: selectedQuestions.map(q => ({
                        question_id: q.question_id.toString(),
                        student_answer: null,
                        is_correct: null,
                        time_spent: 0
                    }))
                })
            },
            include: {
                test_plans: true
            }
        });
        await this.gamificationService.logActivity(safeUserId, 'TEST_START', 0, {
            testPlanId: safePlanId.toString(),
            totalQuestions: selectedQuestions.length
        });
        return this.formatExecutionResponse(newExecution);
    }
    async resumeExecution(executionId, userId) {
        const safeExecutionId = this.safeBigInt(executionId);
        const safeUserId = this.safeBigInt(userId);
        const execution = await this.findExecutionWithAccess(safeExecutionId, safeUserId);
        if (execution.status !== 'PAUSED') {
            throw new errors_1.ValidationError('Test is not paused');
        }
        const updatedExecution = await prisma_1.default.test_executions.update({
            where: { execution_id: safeExecutionId },
            data: {
                status: 'IN_PROGRESS',
                paused_at: null,
            },
        });
        return this.formatExecutionResponse(updatedExecution);
    }
    async pauseExecution(executionId, userId) {
        const safeExecutionId = this.safeBigInt(executionId);
        const safeUserId = this.safeBigInt(userId);
        const execution = await this.findExecutionWithAccess(safeExecutionId, safeUserId);
        if (execution.status !== 'IN_PROGRESS') {
            throw new errors_1.ValidationError('Test is not in progress');
        }
        const updatedExecution = await prisma_1.default.test_executions.update({
            where: { execution_id: safeExecutionId },
            data: {
                status: 'PAUSED',
                paused_at: new Date(),
            },
        });
        return this.formatExecutionResponse(updatedExecution);
    }
    async submitAllAnswers(executionId, userId, submissionData) {
        console.log('Submit All Answers Service Method Called:', {
            executionId: executionId.toString(),
            userId: userId.toString(),
            submissionDataDetails: {
                responsesCount: submissionData.responses?.length,
                endTime: submissionData.endTime
            }
        });
        try {
            const execution = await this.findTestExecutionWithAccess(executionId, userId);
            console.log('Execution Lookup Result:', {
                executionFound: !!execution,
                executionStatus: execution?.status,
                executionTestId: execution?.test_plan_id.toString()
            });
            if (execution.status !== 'IN_PROGRESS') {
                console.error('Cannot submit answers - Invalid execution status', {
                    currentStatus: execution.status,
                    expectedStatus: 'IN_PROGRESS'
                });
                throw new errors_1.ValidationError('Cannot submit answers. Test must be started first. Please click "Start Test" before submitting answers.');
            }
            if (!submissionData.responses || submissionData.responses.length === 0) {
                console.error('No responses provided in submission');
                throw new errors_1.ValidationError('No answers to submit');
            }
            const invalidResponses = submissionData.responses.filter(r => !r.questionId || !r.answer || typeof r.timeTaken !== 'number');
            if (invalidResponses.length > 0) {
                console.error('Invalid response structure', {
                    invalidResponses,
                    totalResponses: submissionData.responses.length
                });
                throw new errors_1.ValidationError('Invalid response structure. Each response must have questionId, answer, and timeTaken.');
            }
            const testData = JSON.parse(execution.test_data);
            const updatedResponses = testData.responses.map((existingResponse) => {
                const submittedResponse = submissionData.responses.find(r => r.questionId === Number(existingResponse.question_id));
                const currentQuestion = testData.questions.find((q) => q.question_id === BigInt(existingResponse.question_id));
                return {
                    ...existingResponse,
                    ...(submittedResponse && {
                        student_answer: submittedResponse.answer,
                        is_correct: currentQuestion
                            ? this.checkAnswer(currentQuestion, submittedResponse.answer)
                            : null,
                        time_spent: submittedResponse.timeTaken || 0
                    })
                };
            });
            console.log('Updated Responses in Submit All', {
                originalResponses: testData.responses,
                updatedResponses
            });
            const updatedTestData = {
                ...testData,
                responses: updatedResponses,
                timingData: {
                    ...testData.timingData,
                    endTime: submissionData.endTime || Date.now()
                }
            };
            const updatedExecution = await prisma_1.default.test_executions.update({
                where: { execution_id: Number(executionId) },
                data: {
                    test_data: JSON.stringify(updatedTestData)
                }
            });
            return this.formatTestExecutionResponse(updatedExecution);
        }
        catch (error) {
            console.error('Error in submitAllAnswers service method:', {
                errorName: error.name,
                errorMessage: error.message,
                errorStack: error.stack,
                submissionData: JSON.stringify(submissionData)
            });
            throw error;
        }
    }
    async getExecutionResults(executionId, userId) {
        console.log('Get Execution Results Request', {
            executionId,
            userId,
            executionIdType: typeof executionId,
            userIdType: typeof userId
        });
        const safeExecutionId = this.safeBigInt(executionId);
        const safeUserId = this.safeBigInt(userId);
        try {
            const execution = await prisma_1.default.test_executions.findUnique({
                where: { execution_id: safeExecutionId },
                include: {
                    test_plans: {
                        include: {
                            users_test_plans_student_idTousers: true
                        }
                    }
                }
            });
            if (!execution) {
                throw new errors_1.NotFoundError(`Test execution ${safeExecutionId} not found`);
            }
            if (execution.student_id !== safeUserId) {
                throw new errors_1.UnauthorizedError('You are not authorized to view these results');
            }
            if (execution.status !== 'COMPLETED') {
                throw new errors_1.ValidationError('Test results are only available after completing the test');
            }
            let testData;
            try {
                testData = JSON.parse(execution.test_data);
            }
            catch (parseError) {
                console.error('Failed to parse test data', {
                    executionId: safeExecutionId,
                    parseErrorMessage: parseError.message
                });
                throw new errors_1.BadRequestError('Unable to process test data');
            }
            const totalQuestions = testData.responses?.length || 0;
            const correctAnswers = testData.responses?.filter((resp) => resp.is_correct).length || 0;
            console.log('Execution Results', {
                executionId: safeExecutionId,
                totalQuestions,
                correctAnswers,
                score: execution.score
            });
            return {
                executionId: execution.execution_id.toString(),
                testPlanId: execution.test_plan_id.toString(),
                studentId: execution.student_id.toString(),
                status: execution.status,
                startedAt: execution.started_at || undefined,
                completedAt: execution.completed_at || undefined,
                score: execution.score,
                testData: {
                    totalQuestions,
                    correctAnswers,
                    questions: testData.questions || [],
                    responses: testData.responses || []
                }
            };
        }
        catch (error) {
            console.error('Error in getExecutionResults', {
                executionId: safeExecutionId,
                userId: safeUserId,
                errorName: error.name,
                errorMessage: error.message,
                errorStack: error.stack
            });
            throw error;
        }
    }
    async calculateAndUpdateTestScore(executionId, userId) {
        const execution = await this.findExecutionWithAccess(executionId, userId);
        const testData = JSON.parse(execution.test_data);
        console.log('Original Test Data (Full):', JSON.stringify(testData, null, 2));
        let totalCorrect = 0;
        const updatedResponses = testData.responses.map((response) => {
            const question = testData.questions.find((q) => q.question_id === response.question_id);
            console.log('Processing Response:', JSON.stringify(response, null, 2));
            console.log('Corresponding Question:', JSON.stringify(question, null, 2));
            const isCorrect = this.checkAnswer(question, response.student_answer);
            console.log(`Question ${response.question_id} - Correct: ${isCorrect}`);
            response.is_correct = isCorrect;
            if (isCorrect)
                totalCorrect++;
            return response;
        });
        const totalQuestions = testData.questions.length;
        const scorePercentage = Math.round((totalCorrect / totalQuestions) * 100);
        console.log('Total Correct:', totalCorrect);
        console.log('Total Questions:', totalQuestions);
        console.log('Score Percentage:', scorePercentage);
        const updatedTestData = {
            ...testData,
            responses: updatedResponses,
            total_correct: totalCorrect,
            total_questions: totalQuestions,
            score: scorePercentage
        };
        const updatedExecution = await prisma_1.default.test_executions.update({
            where: { execution_id: BigInt(executionId) },
            data: {
                score: scorePercentage,
                test_data: JSON.stringify(updatedTestData)
            },
        });
        console.log('Data Being Written to Database:', JSON.stringify({
            score: scorePercentage,
            test_data: updatedTestData
        }, null, 2));
        return {
            execution: {
                ...updatedExecution,
                score: scorePercentage,
                test_data: JSON.stringify(updatedTestData)
            }
        };
    }
    async findExecutionWithAccess(executionId, userId) {
        const safeExecutionId = this.safeBigInt(executionId);
        const safeUserId = this.safeBigInt(userId);
        const execution = await this.findTestExecutionWithAccess(safeExecutionId, safeUserId);
        return execution;
    }
    async findTestExecutionWithAccess(executionId, userId) {
        try {
            console.log('Finding test execution with access:', {
                executionId: executionId.toString(),
                userId: userId.toString()
            });
            const execution = await prisma_1.default.test_executions.findUnique({
                where: {
                    execution_id: Number(executionId)
                },
                include: {
                    test_plans: true
                }
            });
            if (!execution) {
                console.error('No execution found', {
                    executionId: executionId.toString()
                });
                throw new errors_1.NotFoundError(`Test execution not found for ID: ${executionId.toString()}`);
            }
            const userExecutionAccess = await prisma_1.default.test_executions.count({
                where: {
                    execution_id: Number(executionId),
                    student_id: Number(userId)
                }
            });
            if (userExecutionAccess === 0) {
                console.error('User does not have access to this test execution', {
                    executionId: executionId.toString(),
                    userId: userId.toString()
                });
                throw new errors_1.UnauthorizedError('User does not have access to this test execution');
            }
            console.log('Execution details:', {
                id: execution.execution_id.toString(),
                status: execution.status,
                planId: execution.test_plan_id.toString()
            });
            return execution;
        }
        catch (error) {
            console.error('Complete error in findTestExecutionWithAccess:', {
                errorName: error.name,
                errorMessage: error.message,
                errorStack: error.stack,
                executionId: executionId.toString(),
                userId: userId.toString()
            });
            if (error instanceof errors_1.ValidationError ||
                error instanceof errors_1.UnauthorizedError ||
                error instanceof errors_1.NotFoundError) {
                throw error;
            }
            throw new errors_1.ValidationError(`Failed to access test execution: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async calculateScore(execution) {
        console.log('Calculating Score', {
            executionType: typeof execution,
            executionKeys: execution ? Object.keys(execution) : 'No execution provided'
        });
        try {
            let testData;
            if (typeof execution === 'object') {
                testData = execution.test_data || execution;
            }
            if (typeof testData === 'string') {
                try {
                    testData = JSON.parse(testData);
                }
                catch (parseError) {
                    console.error('Failed to parse test data for score calculation', {
                        originalData: testData,
                        parseErrorMessage: parseError.message
                    });
                    return 0;
                }
            }
            if (!testData || !testData.responses) {
                console.warn('Invalid test data structure for score calculation', {
                    testData
                });
                return 0;
            }
            const correctAnswers = testData.responses.filter((resp) => resp.is_correct === true).length;
            const totalQuestions = testData.responses.length;
            console.log('Score Calculation Details', {
                correctAnswers,
                totalQuestions,
                scorePercentage: totalQuestions > 0
                    ? Math.round((correctAnswers / totalQuestions) * 100)
                    : 0
            });
            return totalQuestions > 0
                ? Math.round((correctAnswers / totalQuestions) * 100)
                : 0;
        }
        catch (error) {
            console.error('Error in calculateScore', {
                errorName: error.name,
                errorMessage: error.message,
                errorStack: error.stack,
                executionData: execution
            });
            return 0;
        }
    }
    checkAnswer(question, studentAnswer) {
        console.log('Check Answer Input', {
            questionId: question.question_id,
            studentAnswer,
            correctAnswerKaTeX: question.correct_answer,
            correctAnswerPlain: question.correct_answer_plain,
            options: question.options,
            isKaTeX: question.is_katex
        });
        const normalizeAnswer = (answer) => (answer || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
        const isKaTeXFormat = question.is_katex === true;
        const correctAnswer = isKaTeXFormat
            ? (question.correct_answer || question.correct_answer_plain || '')
            : (question.correct_answer_plain || question.correct_answer || '');
        const normalizedStudentAnswer = normalizeAnswer(studentAnswer);
        const normalizedCorrectAnswer = normalizeAnswer(correctAnswer);
        const isCorrect = normalizedStudentAnswer === normalizedCorrectAnswer;
        console.log('Answer Comparison', {
            studentAnswer,
            correctAnswer,
            normalizedStudentAnswer,
            normalizedCorrectAnswer,
            isCorrect,
            usingKaTeXFormat: isKaTeXFormat
        });
        return isCorrect;
    }
    determineExecutionStatus(responses) {
        const allAnswered = responses.every(resp => resp.student_answer !== null);
        return allAnswered ? 'COMPLETED' : 'IN_PROGRESS';
    }
    formatExecutionResponse(execution) {
        let testData;
        try {
            try {
                testData = JSON.parse(execution.test_data);
            }
            catch (parseError) {
                console.warn('Unable to parse test_data, using original format', {
                    executionId: execution.execution_id,
                    originalData: execution.test_data
                });
                testData = execution.test_data;
            }
        }
        catch (error) {
            console.error('Error processing test data in formatExecutionResponse', {
                executionId: execution.execution_id,
                errorName: error.name,
                errorMessage: error.message,
                originalData: execution.test_data
            });
            throw new Error(`Failed to process test data for execution ${execution.execution_id}: ${error.message}`);
        }
        return {
            executionId: execution.execution_id,
            testPlanId: execution.test_plan_id,
            studentId: execution.student_id,
            status: execution.status,
            startedAt: execution.started_at || undefined,
            testData: testData
        };
    }
    formatTestExecutionResponse(execution) {
        return {
            executionId: execution.execution_id,
            testPlanId: execution.test_plan_id,
            status: execution.status,
            startedAt: execution.started_at,
            completedAt: execution.completed_at,
            pausedAt: execution.paused_at,
            score: execution.score,
            testData: JSON.parse(execution.test_data),
        };
    }
}
exports.TestExecutionService = TestExecutionService;
