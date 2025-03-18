import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { hasRole, validateTemplateCreation, validateTemplateUpdate } from '../middleware/validation';
import {
  getTemplates,
  createTemplate,
  getTemplate,
  updateTemplate,
  deleteTemplate
} from '../controllers/template.controller';

const router = Router();

/**
 * @swagger
 * /api/templates:
 *   get:
 *     tags: [Templates]
 *     summary: Get all templates
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: source
 *         schema:
 *           type: string
 *           enum: [SYSTEM, USER]
 *         description: Filter templates by source
 *       - in: query
 *         name: boardId
 *         schema:
 *           type: integer
 *         description: Filter templates by board ID
 *     responses:
 *       200:
 *         description: List of templates
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/', authenticate, hasRole(['tutor', 'admin']), getTemplates);

/**
 * @swagger
 * /api/templates:
 *   post:
 *     tags: [Templates]
 *     summary: Create a new template
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - template_name
 *               - board_id
 *               - test_type
 *               - timing_type
 *             properties:
 *               template_name:
 *                 type: string
 *               board_id:
 *                 type: integer
 *               test_type:
 *                 type: string
 *               timing_type:
 *                 type: string
 *               time_limit:
 *                 type: integer
 *               configuration:
 *                 type: object
 *     responses:
 *       201:
 *         description: Template created successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post('/', authenticate, hasRole(['tutor', 'admin']), validateTemplateCreation, createTemplate);

/**
 * @swagger
 * /api/templates/{id}:
 *   get:
 *     tags: [Templates]
 *     summary: Get a template by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Template ID
 *     responses:
 *       200:
 *         description: Template details
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Template not found
 */
router.get('/:id', authenticate, hasRole(['tutor', 'admin']), getTemplate);

/**
 * @swagger
 * /api/templates/{id}:
 *   put:
 *     tags: [Templates]
 *     summary: Update a template
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Template ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               template_name:
 *                 type: string
 *               board_id:
 *                 type: integer
 *               test_type:
 *                 type: string
 *               timing_type:
 *                 type: string
 *               time_limit:
 *                 type: integer
 *               configuration:
 *                 type: object
 *     responses:
 *       200:
 *         description: Template updated successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Template not found
 */
router.put('/:id', authenticate, hasRole(['tutor', 'admin']), validateTemplateUpdate, updateTemplate);

/**
 * @swagger
 * /api/templates/{id}:
 *   delete:
 *     tags: [Templates]
 *     summary: Delete a template
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Template ID
 *     responses:
 *       200:
 *         description: Template deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Template not found
 */
router.delete('/:id', authenticate, hasRole(['tutor', 'admin']), deleteTemplate);

export default router;