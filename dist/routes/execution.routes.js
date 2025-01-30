"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const execution_controller_1 = require("../controllers/execution.controller");
const auth_1 = require("../middleware/auth");
const prisma_1 = __importDefault(require("../lib/prisma"));
const router = (0, express_1.Router)();
console.log('Execution Routes: Initializing routes...');
router.use((req, res, next) => {
    console.log('Execution Routes Middleware:', {
        baseUrl: req.baseUrl,
        path: req.path,
        originalUrl: req.originalUrl,
        method: req.method,
        headers: {
            host: req.headers.host,
            contentType: req.headers['content-type']
        },
        routeMatched: false
    });
    console.log('Registered Routes in Execution Router:');
    router.stack.forEach((r) => {
        if (r.route) {
            console.log(`  ${r.route.stack[0].method.toUpperCase()}: ${r.route.path}`);
        }
    });
    next();
});
router.post('/plans/:planId/executions', auth_1.authenticate, execution_controller_1.createExecution);
router.get('/executions/:executionId', auth_1.authenticate, execution_controller_1.getExecution);
router.post('/executions/:executionId/answers', auth_1.authenticate, execution_controller_1.submitAnswer);
router.post('/executions/:executionId/complete', auth_1.authenticate, execution_controller_1.completeExecution);
router.post('/executions/:executionId/pause', auth_1.authenticate, execution_controller_1.pauseTest);
router.post('/executions/:executionId/resume', auth_1.authenticate, execution_controller_1.resumeTest);
router.post('/executions/:executionId/submitAllAnswers', auth_1.authenticate, execution_controller_1.submitAllAnswers);
router.post('/tests/executions/:executionId/start', auth_1.authenticate, execution_controller_1.startExecution);
router.post('/executions/:executionId/start', auth_1.authenticate, execution_controller_1.startExecution);
router.get('/results/:executionId', auth_1.authenticate, execution_controller_1.getTestExecutionResults);
router.get('/executions/:executionId/results', auth_1.authenticate, execution_controller_1.getTestExecutionResults);
router.get('/tests/executions/:executionId/results', auth_1.authenticate, execution_controller_1.getTestExecutionResults);
router.post('/executions/:executionId/calculate-score', auth_1.authenticate, execution_controller_1.calculateTestScore);
router.post('/executions/:executionId/submit', auth_1.authenticate, execution_controller_1.submitAnswer);
router.post('/executions/:executionId/complete', auth_1.authenticate, execution_controller_1.completeExecution);
router.post('/executions/:executionId/pause', auth_1.authenticate, execution_controller_1.pauseTest);
router.post('/executions/:executionId/resume', auth_1.authenticate, execution_controller_1.resumeTest);
router.post('/executions/:executionId/submitAllAnswers', auth_1.authenticate, execution_controller_1.submitAllAnswers);
router.get('/debug/:executionId', auth_1.authenticate, async (req, res) => {
    try {
        const executionId = Number(req.params.executionId);
        const execution = await prisma_1.default.test_executions.findUnique({
            where: { execution_id: executionId },
            include: {
                test_plans: true
            }
        });
        if (!execution) {
            return res.status(404).json({
                message: 'Execution not found',
                executionId
            });
        }
        console.log('Debug Execution Data', {
            executionId: execution.execution_id,
            testDataType: typeof execution.test_data,
            testDataLength: execution.test_data.length,
            testDataFirstChars: execution.test_data.substring(0, 500),
            testDataLastChars: execution.test_data.substring(Math.max(0, execution.test_data.length - 500)),
            studentId: execution.student_id,
            testPlanId: execution.test_plan_id
        });
        res.json({
            executionId: execution.execution_id,
            testData: execution.test_data,
            testDataType: typeof execution.test_data,
            testDataLength: execution.test_data.length,
            studentId: execution.student_id,
            testPlanId: execution.test_plan_id
        });
    }
    catch (error) {
        console.error('Debug route error', {
            errorName: error.name,
            errorMessage: error.message,
            errorStack: error.stack
        });
        res.status(500).json({
            message: 'Internal server error',
            error: error.message
        });
    }
});
router.get('/', (req, res) => {
    res.json({
        message: 'Execution Routes are working!',
        routes: router.stack
            .filter((r) => r.route)
            .map((r) => ({
            path: r.route.path,
            methods: Object.keys(r.route.methods)
        }))
    });
});
router.use((req, res, next) => {
    console.error('Unhandled route in execution routes:', {
        method: req.method,
        path: req.path,
        baseUrl: req.baseUrl,
        body: req.body,
        params: req.params,
        query: req.query,
        headers: req.headers
    });
    next();
});
console.log('Execution Routes: Routes initialized.');
exports.default = router;
