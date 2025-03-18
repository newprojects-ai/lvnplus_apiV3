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

/**
 * @swagger
 * /api/tests/plan:
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
 *               - templateId
 *               - studentId
 *             properties:
 *               templateId:
 *                 type: string
 *               studentId:
 *                 type: string
 *               scheduledFor:
 *                 type: string
 *                 format: date-time
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
router.post('/plan', authenticate, hasRole(['tutor', 'parent']), validateTestPlanCreate, createTestPlan);

/**
 * @swagger
 * /api/tests/plan/{id}:
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
router.get('/plan/:id', authenticate, hasRole(['tutor', 'parent', 'student']), getTestPlan);

/**
 * @swagger
 * /api/tests/student/{studentId}:
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
 *           format: date
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: List of student's tests
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/student/:studentId', authenticate, hasRole(['tutor', 'parent', 'student']), getStudentTests);

/**
 * @swagger
 * /api/tests/{planId}/start:
 *   post:
 *     summary: Start a test execution
 *     tags: [Tests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: planId
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
 *         description: Test plan not found
 */
router.post('/:planId/start', authenticate, hasRole(['student']), startTest);

/**
 * @swagger
 * /api/tests/{executionId}/submit:
 *   put:
 *     summary: Submit an answer for a test
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
 *               - timeSpent
 *             properties:
 *               questionId:
 *                 type: string
 *               answer:
 *                 type: string
 *               timeSpent:
 *                 type: number
 *     responses:
 *       200:
 *         description: Answer submitted successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Test execution not found
 */
router.put('/:executionId/submit', authenticate, hasRole(['student']), submitTest);

/**
 * @swagger
 * /api/tests/{executionId}/status:
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
router.get('/:executionId/status', authenticate, hasRole(['student', 'tutor', 'parent']), getTestStatus);

/**
 * @swagger
 * /api/tests/{executionId}/results:
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
router.get('/:executionId/results', authenticate, hasRole(['student', 'tutor', 'parent']), getTestResults);

/**
 * @swagger
 * /api/tests/{executionId}/complete:
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
router.post('/:executionId/complete', authenticate, hasRole(['student']), completeTest);

/**
 * @swagger
 * /api/tests/{executionId}/submit-all:
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
 *                     - timeSpent
 *                   properties:
 *                     questionId:
 *                       type: string
 *                     answer:
 *                       type: string
 *                     timeSpent:
 *                       type: number
 *     responses:
 *       200:
 *         description: All answers submitted successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Test execution not found
 */
router.post('/:executionId/submit-all', authenticate, hasRole(['student']), submitAllAnswers);

export default router;