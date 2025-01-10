import { Router } from 'express';
import {
  getSubtopics,
  createSubtopic,
  updateSubtopic,
  deleteSubtopic,
} from '../controllers/subtopic.controller';
import { authenticate } from '../middleware/auth';
import { checkRole } from '../middleware/roles';
import { validateSubtopicCreation, validateSubtopicUpdate } from '../middleware/validation';

const router = Router();

/**
 * @swagger
 * /topics/{topicId}/subtopics:
 *   get:
 *     summary: Get all subtopics for a topic
 *     tags: [Subtopics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: topicId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the topic
 *     responses:
 *       200:
 *         description: List of subtopics for the topic
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Subtopic'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get('/topics/:topicId/subtopics', authenticate, getSubtopics);

/**
 * @swagger
 * /topics/{topicId}/subtopics:
 *   post:
 *     summary: Create a new subtopic
 *     tags: [Subtopics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: topicId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the parent topic
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - subtopicName
 *             properties:
 *               subtopicName:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Subtopic created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Subtopic'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.post('/topics/:topicId/subtopics', authenticate, checkRole(['ADMIN']), validateSubtopicCreation, createSubtopic);

/**
 * @swagger
 * /subtopics/{id}:
 *   put:
 *     summary: Update a subtopic
 *     tags: [Subtopics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the subtopic to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               subtopicName:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Subtopic updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Subtopic'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.put(
  '/subtopics/:id',
  authenticate,
  checkRole(['ADMIN']),
  validateSubtopicUpdate,
  updateSubtopic
);

/**
 * @swagger
 * /subtopics/{id}:
 *   delete:
 *     summary: Delete a subtopic
 *     tags: [Subtopics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the subtopic to delete
 *     responses:
 *       200:
 *         description: Subtopic deleted successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.delete(
  '/subtopics/:id',
  authenticate,
  checkRole(['ADMIN']),
  deleteSubtopic
);

export default router;