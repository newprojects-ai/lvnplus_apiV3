import { Router } from 'express';
import { QuestionSetController } from '../controllers/questionSet.controller';
import { authenticate } from '../middleware/auth';
import { validateRole, validateRequest } from '../middleware/validation';
import { z } from 'zod';

const router = Router();
const controller = new QuestionSetController();

/**
 * @swagger
 * /api/question-sets:
 *   post:
 *     summary: Create a new question set
 *     description: Create a new question set with specified questions and configuration
 *     tags: [Question Sets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - subject_id
 *               - questions
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the question set
 *               subject_id:
 *                 type: string
 *                 description: ID of the subject this set belongs to
 *               description:
 *                 type: string
 *                 description: Optional description of the question set
 *               questions:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - question_id
 *                     - sequence
 *                   properties:
 *                     question_id:
 *                       type: string
 *                       description: ID of the question
 *                     sequence:
 *                       type: integer
 *                       description: Order of the question in the set
 *     responses:
 *       201:
 *         description: Question set created successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - User is not a tutor
 */
router.post(
  '/api/question-sets',
  authenticate,
  validateRole(['tutor']),
  validateRequest(z.object({
    name: z.string().min(1, 'Name is required'),
    subject_id: z.string().or(z.number()).transform(val => BigInt(val)),
    description: z.string().optional(),
    questions: z.array(z.object({
      question_id: z.string().or(z.number()).transform(val => BigInt(val)),
      sequence: z.number().int().min(0)
    }))
  })),
  controller.createQuestionSet
);

/**
 * @swagger
 * /api/question-sets/{setId}:
 *   get:
 *     summary: Get a specific question set
 *     description: Retrieve details of a specific question set including its questions
 *     tags: [Question Sets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: setId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the question set to retrieve
 *     responses:
 *       200:
 *         description: Question set retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 subject_id:
 *                   type: string
 *                 description:
 *                   type: string
 *                 questions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       content:
 *                         type: string
 *                       sequence:
 *                         type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - User is not a tutor or student
 *       404:
 *         description: Question set not found
 */
router.get(
  '/api/question-sets/:setId',
  authenticate,
  validateRole(['tutor', 'student']),
  controller.getQuestionSet
);

/**
 * @swagger
 * /api/question-sets/{setId}/link/{testPlanId}:
 *   post:
 *     summary: Link question set to test plan
 *     description: Associate a question set with a test plan and specify its sequence
 *     tags: [Question Sets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: setId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the question set
 *       - in: path
 *         name: testPlanId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the test plan
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sequence
 *             properties:
 *               sequence:
 *                 type: integer
 *                 description: Order of this set in the test plan
 *     responses:
 *       201:
 *         description: Question set linked successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - User is not a tutor
 *       404:
 *         description: Question set or test plan not found
 */
router.post(
  '/api/question-sets/:setId/link/:testPlanId',
  authenticate,
  validateRole(['tutor']),
  validateRequest(z.object({
    sequence: z.number().int().min(0)
  })),
  controller.linkToTestPlan
);

export default router;
