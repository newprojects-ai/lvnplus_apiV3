import express from 'express';
import { StudyGroupController } from '../controllers/study-group.controller';
import { requireTutorRole } from '../middleware/guardian-auth.middleware';
import { requireAuth } from '../middleware/auth.middleware';

const router = express.Router();
const controller = new StudyGroupController();

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
 *                   memberCount:
 *                     type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not a tutor
 */

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
 *               - studentId
 *             properties:
 *               studentId:
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
 *                   joinedAt:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not authorized to view this group
 *       404:
 *         description: Group not found
 */

router.use(requireAuth);
router.use(requireTutorRole); // All study group routes require tutor role

router.post('/', controller.createGroup);
router.get('/', controller.getGroups);
router.post('/:groupId/members', controller.addMember);
router.delete('/:groupId/members/:studentId', controller.removeMember);
router.put('/:groupId/deactivate', controller.deactivateGroup);
router.get('/:groupId/members', controller.getGroupMembers);

export default router;
