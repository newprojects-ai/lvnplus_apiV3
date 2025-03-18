import express from 'express';
import { StudyGroupController } from '../controllers/study-group.controller';
import { authenticate } from '../middleware/auth';
import { validateRole, validateRequest } from '../middleware/validation';
import { z } from 'zod';

const router = express.Router();
const controller = new StudyGroupController();

// Validation schemas
const createGroupSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  subjects: z.array(z.string().or(z.number()).transform(val => BigInt(val))).optional()
});

const addMemberSchema = z.object({
  student_id: z.string().or(z.number()).transform(val => BigInt(val))
});

/**
 * @swagger
 * /api/study-groups:
 *   post:
 *     summary: Create a new study group
 *     tags: [Study Groups]
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
 *               - description
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the study group
 *               description:
 *                 type: string
 *                 description: Description of the study group
 *               subjects:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of subject IDs for this group
 *     responses:
 *       201:
 *         description: Study group created successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not a tutor
 */
router.post(
  '/',
  authenticate,
  validateRole(['tutor']),
  validateRequest(createGroupSchema),
  controller.createGroup
);

/**
 * @swagger
 * /api/study-groups:
 *   get:
 *     summary: Get all study groups for the tutor
 *     tags: [Study Groups]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of study groups
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   description:
 *                     type: string
 *                   member_count:
 *                     type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not a tutor
 */
router.get(
  '/',
  authenticate,
  validateRole(['tutor']),
  controller.getGroups
);

/**
 * @swagger
 * /api/study-groups/{groupId}/members:
 *   post:
 *     summary: Add a member to a study group
 *     tags: [Study Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
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
 *               - student_id
 *             properties:
 *               student_id:
 *                 type: string
 *                 description: ID of the student to add
 *     responses:
 *       200:
 *         description: Member added successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not authorized to modify this group
 *       404:
 *         description: Group or student not found
 */
router.post(
  '/:groupId/members',
  authenticate,
  validateRole(['tutor']),
  validateRequest(addMemberSchema),
  controller.addMember
);

/**
 * @swagger
 * /api/study-groups/{groupId}/members/{studentId}:
 *   delete:
 *     summary: Remove a member from a study group
 *     tags: [Study Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
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
 *         description: Member removed successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not authorized to modify this group
 *       404:
 *         description: Group or member not found
 */
router.delete(
  '/:groupId/members/:studentId',
  authenticate,
  validateRole(['tutor']),
  controller.removeMember
);

/**
 * @swagger
 * /api/study-groups/{groupId}/deactivate:
 *   put:
 *     summary: Deactivate a study group
 *     tags: [Study Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Group deactivated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not authorized to modify this group
 *       404:
 *         description: Group not found
 */
router.put(
  '/:groupId/deactivate',
  authenticate,
  validateRole(['tutor']),
  controller.deactivateGroup
);

/**
 * @swagger
 * /api/study-groups/{groupId}/members:
 *   get:
 *     summary: Get all members of a study group
 *     tags: [Study Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of group members
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   email:
 *                     type: string
 *                   joined_at:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not authorized to view this group
 *       404:
 *         description: Group not found
 */
router.get(
  '/:groupId/members',
  authenticate,
  validateRole(['tutor']),
  controller.getMembers
);

export default router;
