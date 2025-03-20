import { Router } from 'express';
import { hasRole } from '../middleware/roles';
import { validateTestPlanCreate, validateTestPlanUpdate } from '../middleware/validation';
import { TestPlanController } from '../controllers/testPlan.controller';

const router = Router();
const testPlanController = new TestPlanController();

/**
 * @swagger
 * /test-plans:
 *   get:
 *     summary: Get all test plans
 *     tags: [TestPlans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: studentId
 *         schema:
 *           type: string
 *         description: Filter by student ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [NOT_STARTED, IN_PROGRESS, COMPLETED]
 *         description: Filter by test status
 *     responses:
 *       200:
 *         description: List of test plans
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/TestPlan'
 */
router.get(
  '/',
  hasRole(['parent', 'tutor', 'admin']),
  testPlanController.getTestPlans.bind(testPlanController)
);

/**
 * @swagger
 * /test-plans:
 *   post:
 *     summary: Create a new test plan
 *     tags: [TestPlans]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TestPlanInput'
 *     responses:
 *       201:
 *         description: Test plan created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TestPlan'
 */
router.post(
  '/',
  hasRole(['parent', 'tutor', 'student', 'admin']),
  validateTestPlanCreate,
  testPlanController.createTestPlan.bind(testPlanController)
);

/**
 * @swagger
 * /test-plans/{planId}:
 *   get:
 *     summary: Get a test plan by ID
 *     tags: [TestPlans]
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
 *         description: Test plan details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TestPlan'
 */
router.get(
  '/:planId',
  hasRole(['parent', 'tutor', 'student', 'admin']),
  testPlanController.getTestPlan.bind(testPlanController)
);

/**
 * @swagger
 * /test-plans/{planId}:
 *   put:
 *     summary: Update a test plan
 *     tags: [TestPlans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: planId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TestPlanInput'
 *     responses:
 *       200:
 *         description: Test plan updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TestPlan'
 */
router.put(
  '/:planId',
  hasRole(['parent', 'tutor', 'admin']),
  validateTestPlanUpdate,
  (req, res) => testPlanController.updateTestPlan(req, res)
);

/**
 * @swagger
 * /test-plans/{planId}:
 *   delete:
 *     summary: Delete a test plan
 *     tags: [TestPlans]
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
 *         description: Test plan deleted successfully
 */
router.delete(
  '/:planId',
  hasRole(['parent', 'tutor', 'admin']),
  testPlanController.deleteTestPlan.bind(testPlanController)
);

export default router;