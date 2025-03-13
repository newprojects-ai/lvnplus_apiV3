import express from 'express';
import { AdminController } from '../controllers/admin.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { checkRole } from '../middleware/roles';
import { adminLinkSchema, adminBulkLinkSchema } from '../validation/admin.validation';

const router = express.Router();
const controller = new AdminController();

/**
 * @swagger
 * /api/admin/link/guardian-student:
 *   post:
 *     summary: Link a guardian with a student (Admin only)
 *     description: Creates a direct link between a guardian and a student. No confirmation needed.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - guardianId
 *               - studentId
 *               - relationship
 *             properties:
 *               guardianId:
 *                 type: string
 *                 description: ID of the guardian to link
 *                 example: "123456789"
 *               studentId:
 *                 type: string
 *                 description: ID of the student to link
 *                 example: "987654321"
 *               relationship:
 *                 type: string
 *                 enum: ["PARENT"]
 *                 description: Type of relationship
 *                 example: "PARENT"
 *     responses:
 *       201:
 *         description: Link created successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized - Not authenticated
 *       403:
 *         description: Forbidden - Not an admin
 *       404:
 *         description: Guardian or student not found
 */

/**
 * @swagger
 * /api/admin/link/tutor-student:
 *   post:
 *     summary: Link a tutor with a student (Admin only)
 *     description: Creates a direct link between a tutor and a student. No confirmation needed.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tutorId
 *               - studentId
 *               - subjects
 *             properties:
 *               tutorId:
 *                 type: string
 *                 description: ID of the tutor to link
 *                 example: "123456789"
 *               studentId:
 *                 type: string
 *                 description: ID of the student to link
 *                 example: "987654321"
 *               subjects:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of subject IDs the tutor will teach
 *                 example: ["MATH_01", "PHY_01"]
 *     responses:
 *       201:
 *         description: Link created successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized - Not authenticated
 *       403:
 *         description: Forbidden - Not an admin
 *       404:
 *         description: Tutor or student not found
 */

/**
 * @swagger
 * /api/admin/link/tutor-students/bulk:
 *   post:
 *     summary: Bulk link a tutor with multiple students (Admin only)
 *     description: Creates direct links between a tutor and multiple students. No confirmation needed.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tutorId
 *               - students
 *             properties:
 *               tutorId:
 *                 type: string
 *                 description: ID of the tutor to link
 *                 example: "123456789"
 *               students:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - studentId
 *                     - subjects
 *                   properties:
 *                     studentId:
 *                       type: string
 *                       description: ID of the student to link
 *                       example: "987654321"
 *                     subjects:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: List of subject IDs the tutor will teach this student
 *                       example: ["MATH_01", "PHY_01"]
 *     responses:
 *       201:
 *         description: Links created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 successful:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: List of successfully linked student IDs
 *                 failed:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       studentId:
 *                         type: string
 *                       error:
 *                         type: string
 *                   description: List of failed links with reasons
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized - Not authenticated
 *       403:
 *         description: Forbidden - Not an admin
 */

// Apply authentication and admin role middleware
router.use(requireAuth);
router.use(checkRole(['ADMIN']));

// Guardian-Student Links
router.post(
  '/link/guardian-student',
  adminLinkSchema.guardianStudent,
  controller.linkGuardianStudent
);

// Tutor-Student Links
router.post(
  '/link/tutor-student',
  adminLinkSchema.tutorStudent,
  controller.linkTutorStudent
);

// Bulk Tutor-Student Links
router.post(
  '/link/tutor-students/bulk',
  adminBulkLinkSchema.tutorStudents,
  controller.bulkLinkTutorStudents
);

export default router;
