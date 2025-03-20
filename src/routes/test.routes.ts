import { Router } from 'express';
import {
  createTestPlan,
  getTestPlan,
  getStudentTests,
  startTest,
  submitTest,
  getTestStatus,
  getTestResults,
  completeTest,
  submitAllAnswers
} from '../controllers/test.controller';
import { authenticate } from '../middleware/auth';
import { hasRole, validateTestPlanCreate } from '../middleware/validation';

const router = Router();

// Test plan routes

/**
 * @swagger
 * /api/tests/plans:
 *   post:
 *     summary: Create a new test plan
 *     tags: [Tests]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - studentId
 *               - boardId
 *               - testType
 *               - timingType
 *             properties:
 *               studentId:
 *                 type: string
 *               boardId:
 *                 type: number
 *               testType:
 *                 type: string
 *                 enum: [TOPIC, MIXED, MENTAL_ARITHMETIC]
 *               timingType:
 *                 type: string
 *                 enum: [TIMED, UNTIMED]
 *               timeLimit:
 *                 type: number
 *               templateId:
 *                 type: string
 *               configuration:
 *                 type: object
 *                 properties:
 *                   topics:
 *                     type: array
 *                     items:
 *                       type: number
 *                   subtopics:
 *                     type: array
 *                     items:
 *                       type: number
 *                   totalQuestionCount:
 *                     type: number
 *                     minimum: 1
 *                   difficulty:
 *                     type: string
 *                     enum: [ALL, EASY, MEDIUM, HARD]
 *     responses:
 *       201:
 *         description: Test plan created successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post(
  '/plans',
  authenticate,
  hasRole(['tutor', 'parent', 'student']),
  validateTestPlanCreate,
  createTestPlan
);

/**
 * @swagger
 * /api/tests/plans/{id}:
 *   get:
 *     summary: Get a test plan by ID
 *     tags: [Tests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Test plan details
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Test plan not found
 */
router.get('/plans/:id', authenticate, hasRole(['admin', 'tutor', 'parent', 'student']), getTestPlan);

/**
 * @swagger
 * /api/tests/student/{studentId}/tests:
 *   get:
 *     summary: Get all tests for a student
 *     tags: [Tests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [NOT_STARTED, IN_PROGRESS, COMPLETED, ABANDONED]
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date-time
 *     responses:
 *       200:
 *         description: List of tests
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/student/:studentId/tests', authenticate, hasRole(['tutor', 'parent']), getStudentTests);

// Test execution routes

/**
 * @swagger
 * /api/tests/executions/{executionId}/start:
 *   post:
 *     summary: Start a test execution
 *     tags: [Tests]
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
 *         description: Test started successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Test execution not found
 */
router.post('/executions/:executionId/start', authenticate, hasRole(['student']), startTest);

/**
 * @swagger
 * /api/tests/executions/{executionId}/submit:
 *   post:
 *     summary: Submit an answer for a test question
 *     tags: [Tests]
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
 *       200:
 *         description: Answer submitted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post('/executions/:executionId/submit', authenticate, hasRole(['student']), submitTest);

/**
 * @swagger
 * /api/tests/executions/{executionId}/status:
 *   get:
 *     summary: Get test execution status
 *     tags: [Tests]
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
 *         description: Test execution status
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Test execution not found
 */
router.get('/executions/:executionId/status', authenticate, hasRole(['student', 'tutor', 'parent']), getTestStatus);

/**
 * @swagger
 * /api/tests/executions/{executionId}/results:
 *   get:
 *     summary: Get test results
 *     tags: [Tests]
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
 *         description: Test results
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Test execution not found
 */
router.get('/executions/:executionId/results', authenticate, hasRole(['student', 'tutor', 'parent']), getTestResults);

/**
 * @swagger
 * /api/tests/executions/{executionId}/complete:
 *   post:
 *     summary: Complete a test execution
 *     tags: [Tests]
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
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Test execution not found
 */
router.post('/executions/:executionId/complete', authenticate, hasRole(['student']), completeTest);

/**
 * @swagger
 * /api/tests/executions/{executionId}/answers:
 *   post:
 *     summary: Submit all answers for a test
 *     tags: [Tests]
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
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post('/executions/:executionId/answers', authenticate, hasRole(['student']), submitAllAnswers);

export default router;