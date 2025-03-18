import { Router } from 'express';
import { GuardianController } from '../controllers/guardian.controller';
import { authenticate } from '../middleware/auth';
import { hasRole, validateGuardianLink, validateGuardianConfirm } from '../middleware/validation';

const router = Router();
const controller = new GuardianController();

/**
 * @swagger
 * /api/guardians/link-request:
 *   post:
 *     summary: Request to establish a parent-student relationship
 *     description: Creates a link request from the authenticated guardian to the specified student
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
 *               - student_email
 *               - relation_type
 *             properties:
 *               student_email:
 *                 type: string
 *                 format: email
 *                 description: Email of the student to link with
 *               relation_type:
 *                 type: string
 *                 enum: [parent]
 *                 description: The type of relationship
 *     responses:
 *       201:
 *         description: Link request created successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - User is not a parent
 *       404:
 *         description: Student not found
 */
router.post(
  '/link-request',
  authenticate,
  hasRole(['parent']),
  validateGuardianLink,
  controller.requestLink
);

/**
 * @swagger
 * /api/guardians/{guardianId}/students/{studentId}:
 *   delete:
 *     summary: Deactivate link with a student
 *     tags: [Guardians]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: guardianId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Link deactivated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not authorized to deactivate this link
 *       404:
 *         description: Link not found
 */
router.delete(
  '/:guardianId/students/:studentId',
  authenticate,
  hasRole(['parent']),
  controller.deactivateLink
);

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
 *         description: Forbidden - Not a parent
 */
router.get(
  '/students',
  authenticate,
  hasRole(['parent']),
  controller.getStudents
);

/**
 * @swagger
 * /api/guardians/confirm-link/{relationshipId}:
 *   post:
 *     summary: Confirm or reject a guardian link request
 *     tags: [Guardians]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: relationshipId
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
 *               - accepted
 *             properties:
 *               accepted:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Link request processed successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not authorized to confirm this link
 *       404:
 *         description: Link request not found
 */
router.post(
  '/confirm-link/:relationshipId',
  authenticate,
  hasRole(['student']),
  validateGuardianConfirm,
  controller.confirmLink
);

/**
 * @swagger
 * /api/guardians/guardians:
 *   get:
 *     summary: Get guardians linked to the student
 *     tags: [Guardians]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Guardians retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not a student
 */
router.get(
  '/guardians',
  authenticate,
  hasRole(['student']),
  controller.getGuardians
);

export default router;
