import { Router } from 'express';
import {
  getTopics,
  createTopic,
  getTopic,
  updateTopic,
  deleteTopic,
  getTopicsBySubject
} from '../controllers/topic.controller';
import { authenticate } from '../middleware/auth';
import { hasRole, validateTopicCreation, validateTopicUpdate } from '../middleware/validation';

const router = Router();

/**
 * @swagger
 * /topics/subject/{subjectId}:
 *   get:
 *     summary: Get topics by subject
 *     tags: [Topics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: subjectId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of topics for the subject
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Topic'
 */
router.get('/subject/:subjectId', authenticate, getTopicsBySubject);

/**
 * @swagger
 * /topics:
 *   get:
 *     summary: Get all topics
 *     tags: [Topics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: subject
 *         schema:
 *           type: string
 *         description: Filter topics by subject ID
 *     responses:
 *       200:
 *         description: List of topics
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Topic'
 */
router.get('/', authenticate, getTopics);

/**
 * @swagger
 * /topics:
 *   post:
 *     summary: Create a new topic
 *     tags: [Topics]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TopicInput'
 *     responses:
 *       201:
 *         description: Topic created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Topic'
 */
router.post('/', authenticate, hasRole(['admin']), validateTopicCreation, createTopic);

/**
 * @swagger
 * /topics/{id}:
 *   get:
 *     summary: Get a topic by ID
 *     tags: [Topics]
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
 *         description: Topic details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Topic'
 */
router.get('/:id', authenticate, getTopic);

/**
 * @swagger
 * /topics/{id}:
 *   put:
 *     summary: Update a topic
 *     tags: [Topics]
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
 *             $ref: '#/components/schemas/TopicInput'
 *     responses:
 *       200:
 *         description: Topic updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Topic'
 */
router.put('/:id', authenticate, hasRole(['admin']), validateTopicUpdate, updateTopic);

/**
 * @swagger
 * /topics/{id}:
 *   delete:
 *     summary: Delete a topic
 *     tags: [Topics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Topic deleted successfully
 */
router.delete('/:id', authenticate, hasRole(['admin']), deleteTopic);

export default router;