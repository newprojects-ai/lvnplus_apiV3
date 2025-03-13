import express from 'express';
import { GuardianController } from '../controllers/guardian.controller';
import { requireGuardianRole } from '../middleware/guardian-auth.middleware';
import { requireAuth } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation';
import { guardianLinkSchema } from '../validation/guardian.validation';

const router = express.Router();
const controller = new GuardianController();

/**
 * @swagger
 * /api/guardians/link-request:
 *   post:
 *     summary: Request to establish a parent-student relationship
 *     description: Creates a link request from the authenticated guardian (identified by JWT token) to the specified student
 *     tags: [Guardians]
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
 *               - relationship
 *             properties:
 *               studentId:
 *                 type: string
 *                 description: The ID of the student that the authenticated guardian wants to link with
 *                 example: "123456789"
 *               relationship:
 *                 type: string
 *                 enum: ["PARENT"]
 *                 description: The type of relationship the authenticated guardian will have with the student
 *                 example: "PARENT"
 *     responses:
 *       201:
 *         description: Link request created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 linkId:
 *                   type: string
 *                   description: ID of the created link request
 *                 guardianId:
 *                   type: string
 *                   description: ID of the authenticated guardian who made the request
 *                 studentId:
 *                   type: string
 *                   description: ID of the student to be linked
 *                 status:
 *                   type: string
 *                   enum: ["PENDING"]
 *                   description: Initial status of the link request
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized - Guardian not authenticated
 *       403:
 *         description: Forbidden - User is not a guardian
 *       404:
 *         description: Student not found
 */

/**
 * @swagger
 * /api/guardians/{guardianId}/students/{studentId}:
 *   delete:
 *     summary: Remove link with a student
 *     tags: [Guardians]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: guardianId
 *         required: true
 *         schema:
 *           type: string
 *           format: bigint
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *           format: bigint
 *     responses:
 *       200:
 *         description: Link removed successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not authorized to remove this link
 *       404:
 *         description: Link not found
 */

/**
 * @swagger
 * /api/guardians/students:
 *   get:
 *     summary: Get students linked to the guardian
 *     tags: [Guardians]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Students retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not a guardian
 */

/**
 * @swagger
 * /api/students/confirm-guardian/{linkId}:
 *   post:
 *     summary: Confirm or reject a guardian link request
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: linkId
 *         required: true
 *         schema:
 *           type: string
 *           format: bigint
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               accepted:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Link request processed successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not authorized to confirm this link
 *       404:
 *         description: Link request not found
 */

// Apply authentication middleware
router.use(requireAuth);

// Guardian routes (require guardian role)
router.post(
  '/link-request',
  requireGuardianRole,
  validateRequest(guardianLinkSchema),
  controller.requestLink
);

router.delete(
  '/:guardianId/students/:studentId',
  requireGuardianRole,
  controller.removeLink
);

router.get('/students', requireGuardianRole, controller.getStudents);

// Student routes (require student role)
router.post(
  '/confirm-guardian/:linkId',
  validateRequest({ accepted: 'boolean|required' }),
  controller.confirmLink
);

router.get('/guardians', controller.getGuardians);

export default router;
