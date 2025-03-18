import { Router } from 'express';
import {
  getSubtopics,
  createSubtopic,
  getSubtopic,
  updateSubtopic,
  deleteSubtopic,
  getSubtopicsByTopic,
} from '../controllers/subtopic.controller';
import { authenticate } from '../middleware/auth';
import { hasRole, validateSubtopicCreation, validateSubtopicUpdate } from '../middleware/validation';

const router = Router();

/**
 * @swagger
 * /topics/{topicId}/subtopics:
 *   post:
 *     summary: Create a new subtopic for a topic
 *     tags: [Subtopics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: topicId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SubtopicInput'
 *     responses:
 *       201:
 *         description: Subtopic created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Subtopic'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.post('/topics/:topicId/subtopics', authenticate, hasRole(['admin']), validateSubtopicCreation, createSubtopic);

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
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SubtopicInput'
 *     responses:
 *       200:
 *         description: Subtopic updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Subtopic'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.put('/:id', authenticate, hasRole(['admin']), validateSubtopicUpdate, updateSubtopic);

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
 *           type: string
 *     responses:
 *       200:
 *         description: Subtopic deleted successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.delete('/:id', authenticate, hasRole(['admin']), deleteSubtopic);

/**
 * @swagger
 * /subtopics:
 *   get:
 *     summary: Get all subtopics
 *     tags: [Subtopics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: topicId
 *         schema:
 *           type: string
 *         description: Filter subtopics by topic ID
 *     responses:
 *       200:
 *         description: List of subtopics
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Subtopic'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/', authenticate, getSubtopics);

/**
 * @swagger
 * /subtopics/{id}:
 *   get:
 *     summary: Get a subtopic by ID
 *     tags: [Subtopics]
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
 *         description: Subtopic details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Subtopic'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/:id', authenticate, getSubtopic);

/**
 * @swagger
 * /subtopics/topic/{topicId}:
 *   get:
 *     summary: Get subtopics by topic
 *     tags: [Subtopics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: topicId
 *         required: true
 *         schema:
 *           type: string
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
 */
router.get('/topic/:topicId', authenticate, getSubtopicsByTopic);

export default router;