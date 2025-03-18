import { Router } from 'express';
import {
  getExecution,
  createExecution,
  submitAnswer,
  completeExecution,
  pauseTest,
  resumeTest,
  submitAllAnswers,
  startExecution,
  getTestExecutionResults,
  calculateTestScore
} from '../controllers/execution.controller';
import { authenticate } from '../middleware/auth';
import prisma from '../lib/prisma';

const router = Router();

console.log('Execution Routes: Initializing routes...');

// Debug logging for routes
router.use((req, _res, next) => {
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

  // Log all registered routes
  console.log('Registered Routes in Execution Router:');
  router.stack.forEach((r) => {
    if (r.route) {
      console.log(`  ${r.route.stack[0].method.toUpperCase()}: ${r.route.path}`);
    }
  });

  next();
});

/**
 * @swagger
 * /tests/plans/{planId}/executions:
 *   post:
 *     summary: Create a new test execution
 *     tags: [Test Executions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: planId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Test execution created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TestExecution'
 */
router.post('/plans/:planId/executions', authenticate, createExecution);

/**
 * @swagger
 * /tests/executions/{executionId}:
 *   get:
 *     summary: Get a test execution by ID
 *     tags: [Test Executions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: executionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Test execution retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TestExecution'
 */
router.get('/executions/:executionId', authenticate, getExecution);

/**
 * @swagger
 * /tests/executions/{executionId}/answers:
 *   post:
 *     summary: Submit an answer for a test
 *     tags: [Test Executions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: executionId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - questionId
 *               - answer
 *             properties:
 *               questionId:
 *                 type: string
 *               answer:
 *                 type: string
 *     responses:
 *       204:
 *         description: Answer submitted successfully
 */
router.post('/executions/:executionId/answers', authenticate, submitAnswer);
router.post('/executions/:executionId/submit', authenticate, submitAnswer); // Alias for compatibility

/**
 * @swagger
 * /tests/executions/{executionId}/complete:
 *   post:
 *     summary: Complete a test execution
 *     tags: [Test Executions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: executionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Test completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TestResult'
 */
router.post('/executions/:executionId/complete', authenticate, completeExecution);

/**
 * @swagger
 * /tests/executions/{executionId}/pause:
 *   post:
 *     summary: Pause a test execution
 *     tags: [Test Executions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: executionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Test execution paused successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TestExecution'
 */
router.post('/executions/:executionId/pause', authenticate, pauseTest);

/**
 * @swagger
 * /tests/executions/{executionId}/resume:
 *   post:
 *     summary: Resume a test execution
 *     tags: [Test Executions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: executionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Test execution resumed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TestExecution'
 */
router.post('/executions/:executionId/resume', authenticate, resumeTest);

/**
 * @swagger
 * /tests/executions/{executionId}/submitAllAnswers:
 *   post:
 *     summary: Submit all answers for a test execution in one go
 *     tags: [Test Executions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: executionId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - answers
 *             properties:
 *               answers:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - questionId
 *                     - answer
 *                   properties:
 *                     questionId:
 *                       type: string
 *                     answer:
 *                       type: string
 *     responses:
 *       200:
 *         description: All answers submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TestExecution'
 */
router.post('/executions/:executionId/submitAllAnswers', authenticate, submitAllAnswers);

/**
 * @swagger
 * /tests/executions/{executionId}/start:
 *   post:
 *     summary: Start a test execution
 *     description: Changes the status of a test execution from NOT_STARTED to IN_PROGRESS and sets the started_at timestamp
 *     tags: [Test Executions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: executionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the test execution to start
 *     responses:
 *       200:
 *         description: Test execution started successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TestExecution'
 *       400:
 *         description: Invalid execution ID or test already started
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized - User not authenticated
 *       404:
 *         description: Test execution not found
 */
router.post('/executions/:executionId/start', authenticate, startExecution);

/**
 * @swagger
 * /tests/executions/{executionId}/results:
 *   get:
 *     summary: Get test execution results
 *     tags: [Test Executions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: executionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Test execution results retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TestExecutionResults'
 */
router.get('/executions/:executionId/results', authenticate, getTestExecutionResults);

/**
 * @swagger
 * /tests/executions/{executionId}/calculate-score:
 *   post:
 *     summary: Calculate and update test score
 *     tags: [Test Executions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: executionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Test score calculated successfully
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 */
router.post('/executions/:executionId/calculate-score', authenticate, calculateTestScore);

// Debug route to inspect test execution data
router.get('/debug/:executionId', authenticate, async (req, res) => {
  try {
    const executionId = Number(req.params.executionId);
    
    // Fetch the full test execution
    const execution = await prisma.test_executions.findUnique({
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

    // Detailed logging of test data
    console.log('Debug Execution Data', {
      executionId: execution.execution_id,
      testDataType: typeof execution.test_data,
      testDataLength: execution.test_data.length,
      testDataFirstChars: execution.test_data.substring(0, 500),
      testDataLastChars: execution.test_data.substring(Math.max(0, execution.test_data.length - 500)),
      studentId: execution.student_id,
      testPlanId: execution.test_plan_id
    });

    return res.json({
      executionId: execution.execution_id,
      testData: execution.test_data,
      testDataType: typeof execution.test_data,
      testDataLength: execution.test_data.length,
      studentId: execution.student_id,
      testPlanId: execution.test_plan_id
    });
  } catch (error: any) {
    console.error('Debug route error', {
      errorName: error.name,
      errorMessage: error.message,
      errorStack: error.stack
    });
    return res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message 
    });
  }
});

// Add a simple root route for debugging
router.get('/', (_req, res) => {
  return res.json({
    message: 'Execution Routes are working!',
    routes: router.stack
      .filter((r) => r.route !== undefined)
      .map((r) => {
        if (r.route) {
          return {
            path: r.route.path,
            methods: Object.keys(r.route as any)
              .filter(key => key !== 'path' && key !== 'stack')
          };
        }
        return null;
      })
      .filter(Boolean)
  });
});

// Catch-all route for debugging
router.use((req, _res, next) => {
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

export default router;