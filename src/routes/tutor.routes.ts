import express from 'express';
import { TutorController } from '../controllers/tutor.controller';
import { asyncHandler } from '../middleware/async';
import { authenticate } from '../middleware/auth';
import { checkRole } from '../middleware/roles';
import { validateRequest } from '../middleware/validation';
import { tutorLinkSchema } from '../validation/tutor.validation';

const router = express.Router();
const tutorController = new TutorController();

/**
 * @swagger
 * /api/tutors/students/link-request:
 *   post:
 *     summary: Request to link with a student
 *     tags: [Tutors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               studentId:
 *                 type: string
 *                 format: bigint
 *               subjects:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: bigint
 *     responses:
 *       201:
 *         description: Link request created successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not a tutor
 */

/**
 * @swagger
 * /api/tutors/{tutorId}/students/{studentId}:
 *   delete:
 *     summary: Remove link with a student
 *     tags: [Tutors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tutorId
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
 * /api/students/confirm-tutor/{linkId}:
 *   post:
 *     summary: Confirm or reject a tutor link request
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

/**
 * @swagger
 * /api/tutors/students:
 *   get:
 *     summary: Get all students linked to the tutor
 *     tags: [Tutors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of linked students
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
 *                   subjects:
 *                     type: array
 *                     items:
 *                       type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not a tutor
 */

/**
 * @swagger
 * /api/tutors/groups:
 *   post:
 *     summary: Create a new study group
 *     tags: [Tutors]
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
 *                 description: Description of the group
 *               subjects:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of subject IDs for this group
 *     responses:
 *       201:
 *         description: Group created successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not a tutor
 */

/**
 * @swagger
 * /api/tutors/groups:
 *   get:
 *     summary: Get all study groups for the tutor
 *     tags: [Tutors]
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
 *                   subjects:
 *                     type: array
 *                     items:
 *                       type: string
 *                   memberCount:
 *                     type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not a tutor
 */

/**
 * @swagger
 * /api/tutors/groups/{id}:
 *   put:
 *     summary: Update a study group
 *     tags: [Tutors]
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
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               subjects:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Group updated successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not authorized to modify this group
 *       404:
 *         description: Group not found
 */

/**
 * @swagger
 * /api/tutors/groups/{id}:
 *   delete:
 *     summary: Delete a study group
 *     tags: [Tutors]
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
 *         description: Group deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not authorized to delete this group
 *       404:
 *         description: Group not found
 */

/**
 * @swagger
 * /api/tutors/groups/{id}/students:
 *   post:
 *     summary: Add students to a study group
 *     tags: [Tutors]
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
 *             type: object
 *             required:
 *               - studentIds
 *             properties:
 *               studentIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Students added successfully
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
 * /api/tutors/groups/{id}/students/{studentId}:
 *   delete:
 *     summary: Remove a student from a study group
 *     tags: [Tutors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *         description: Student removed successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not authorized to modify this group
 *       404:
 *         description: Group or student not found
 */

/**
 * @swagger
 * /api/tutors/test-plans:
 *   post:
 *     summary: Create a new test plan
 *     tags: [Tutors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - subjects
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               subjects:
 *                 type: array
 *                 items:
 *                   type: string
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Test plan created successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not a tutor
 */

/**
 * @swagger
 * /api/tutors/test-plans:
 *   get:
 *     summary: Get all test plans for the tutor
 *     tags: [Tutors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of test plans
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   title:
 *                     type: string
 *                   description:
 *                     type: string
 *                   subjects:
 *                     type: array
 *                     items:
 *                       type: string
 *                   startDate:
 *                     type: string
 *                     format: date-time
 *                   endDate:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not a tutor
 */

/**
 * @swagger
 * /api/tutors/test-plans/{id}:
 *   get:
 *     summary: Get a specific test plan
 *     tags: [Tutors]
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
 *         description: Test plan details
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not authorized to view this test plan
 *       404:
 *         description: Test plan not found
 */

/**
 * @swagger
 * /api/tutors/test-plans/{id}:
 *   put:
 *     summary: Update a test plan
 *     tags: [Tutors]
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
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               subjects:
 *                 type: array
 *                 items:
 *                   type: string
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Test plan updated successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not authorized to modify this test plan
 *       404:
 *         description: Test plan not found
 */

/**
 * @swagger
 * /api/tutors/test-plans/{id}:
 *   delete:
 *     summary: Delete a test plan
 *     tags: [Tutors]
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
 *         description: Test plan deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not authorized to delete this test plan
 *       404:
 *         description: Test plan not found
 */

// Apply authentication and role middleware
router.use(authenticate);
router.use(checkRole(['TUTOR']));

// Student Management
router.post(
  '/students/link-request',
  validateRequest(tutorLinkSchema),
  asyncHandler(tutorController.requestStudentLink)
);

router.delete(
  '/:tutorId/students/:studentId',
  asyncHandler(tutorController.removeStudentLink)
);

router.get('/students', asyncHandler(tutorController.getLinkedStudents));

// Student routes (require student role)
router.post(
  '/confirm-tutor/:linkId',
  validateRequest({ accepted: 'boolean|required' }),
  asyncHandler(tutorController.confirmLink)
);

// Group Management
router.post('/groups', asyncHandler(tutorController.createGroup));
router.get('/groups', asyncHandler(tutorController.getGroups));
router.put('/groups/:id', asyncHandler(tutorController.updateGroup));
router.delete('/groups/:id', asyncHandler(tutorController.deleteGroup));
router.post('/groups/:id/students', asyncHandler(tutorController.addStudentsToGroup));
router.delete('/groups/:id/students/:studentId', asyncHandler(tutorController.removeStudentFromGroup));

// Test Planning
router.post('/test-plans', asyncHandler(tutorController.createTestPlan));
router.get('/test-plans', asyncHandler(tutorController.getTestPlans));
router.get('/test-plans/:id', asyncHandler(tutorController.getTestPlan));
router.put('/test-plans/:id', asyncHandler(tutorController.updateTestPlan));
router.delete('/test-plans/:id', asyncHandler(tutorController.deleteTestPlan));

// Performance Tracking
router.get('/students/:id/performance', asyncHandler(tutorController.getStudentPerformance));
router.get('/groups/:id/performance', asyncHandler(tutorController.getGroupPerformance));
router.get('/students/:id/tests', asyncHandler(tutorController.getStudentTestHistory));

export default router;
