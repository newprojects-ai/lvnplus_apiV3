import { Router } from 'express';
import { TestAssignmentController } from '../controllers/test-assignment.controller';
import { authenticate } from '../middleware/auth';
import { validateRole, validateRequest } from '../middleware/validation';
import { z } from 'zod';

const router = Router();
const controller = new TestAssignmentController();

// Validation schemas
const assignToStudentSchema = z.object({
  student_id: z.string().or(z.number()).transform(val => BigInt(val)),
  test_id: z.string().or(z.number()).transform(val => BigInt(val)),
  due_date: z.string().datetime().optional(),
  instructions: z.string().optional()
});

const assignToGroupSchema = z.object({
  group_id: z.string().or(z.number()).transform(val => BigInt(val)),
  test_id: z.string().or(z.number()).transform(val => BigInt(val)),
  due_date: z.string().datetime().optional(),
  instructions: z.string().optional()
});

const updateStatusSchema = z.object({
  status: z.enum(['started', 'completed', 'abandoned'])
});

/**
 * @swagger
 * /api/test-assignments/assign/student:
 *   post:
 *     summary: Assign a test to a student
 *     description: Guardians and tutors can assign tests to individual students
 *     tags: [Test Assignments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - student_id
 *               - test_id
 *             properties:
 *               student_id:
 *                 type: string
 *                 description: ID of the student to assign the test to
 *               test_id:
 *                 type: string
 *                 description: ID of the test to assign
 *               due_date:
 *                 type: string
 *                 format: date-time
 *                 description: Optional due date for the test
 *               instructions:
 *                 type: string
 *                 description: Optional instructions for the student
 *     responses:
 *       201:
 *         description: Test assigned successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not authorized to assign tests
 *       404:
 *         description: Student or test not found
 */
router.post(
  '/assign/student',
  authenticate,
  validateRole(['parent', 'tutor']),
  validateRequest(assignToStudentSchema),
  controller.assignToStudent
);

/**
 * @swagger
 * /api/test-assignments/assign/group:
 *   post:
 *     summary: Assign a test to a study group
 *     description: Tutors can assign tests to entire study groups
 *     tags: [Test Assignments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - group_id
 *               - test_id
 *             properties:
 *               group_id:
 *                 type: string
 *                 description: ID of the study group
 *               test_id:
 *                 type: string
 *                 description: ID of the test to assign
 *               due_date:
 *                 type: string
 *                 format: date-time
 *                 description: Optional due date for the test
 *               instructions:
 *                 type: string
 *                 description: Optional instructions for the group
 *     responses:
 *       201:
 *         description: Test assigned successfully to group
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not authorized to assign tests to groups
 *       404:
 *         description: Group or test not found
 */
router.post(
  '/assign/group',
  authenticate,
  validateRole(['tutor']),
  validateRequest(assignToGroupSchema),
  controller.assignToGroup
);

/**
 * @swagger
 * /api/test-assignments/assigned:
 *   get:
 *     summary: Get tests assigned by the current user
 *     description: Guardians and tutors can view tests they have assigned
 *     tags: [Test Assignments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of assigned tests
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   test_id:
 *                     type: string
 *                   student_id:
 *                     type: string
 *                   assigned_at:
 *                     type: string
 *                     format: date-time
 *                   due_date:
 *                     type: string
 *                     format: date-time
 *                   status:
 *                     type: string
 *                     enum: [pending, started, completed, abandoned]
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not authorized to view assignments
 */
router.get(
  '/assigned',
  authenticate,
  validateRole(['parent', 'tutor']),
  controller.getAssignmentsByAssigner
);

/**
 * @swagger
 * /api/test-assignments/my-assignments:
 *   get:
 *     summary: Get tests assigned to the current student
 *     description: Students can view their assigned tests
 *     tags: [Test Assignments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of assigned tests
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   test_id:
 *                     type: string
 *                   assigned_by:
 *                     type: string
 *                   assigned_at:
 *                     type: string
 *                     format: date-time
 *                   due_date:
 *                     type: string
 *                     format: date-time
 *                   status:
 *                     type: string
 *                     enum: [pending, started, completed, abandoned]
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not a student
 */
router.get(
  '/my-assignments',
  authenticate,
  validateRole(['student']),
  controller.getAssignmentsByStudent
);

/**
 * @swagger
 * /api/test-assignments/{assignmentId}:
 *   get:
 *     summary: Get details of a specific test assignment
 *     description: Get detailed information about a test assignment
 *     tags: [Test Assignments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: assignmentId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the test assignment
 *     responses:
 *       200:
 *         description: Test assignment details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 test_id:
 *                   type: string
 *                 student_id:
 *                   type: string
 *                 assigned_by:
 *                   type: string
 *                 assigned_at:
 *                   type: string
 *                   format: date-time
 *                 due_date:
 *                   type: string
 *                   format: date-time
 *                 status:
 *                   type: string
 *                   enum: [pending, started, completed, abandoned]
 *                 instructions:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not authorized to view this assignment
 *       404:
 *         description: Assignment not found
 */
router.get(
  '/:assignmentId',
  authenticate,
  validateRole(['student', 'parent', 'tutor']),
  controller.getAssignmentDetails
);

/**
 * @swagger
 * /api/test-assignments/{assignmentId}/status:
 *   put:
 *     summary: Update the status of a test assignment
 *     description: Students can update the status of their assigned tests
 *     tags: [Test Assignments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: assignmentId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the test assignment
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [started, completed, abandoned]
 *                 description: New status of the assignment
 *     responses:
 *       200:
 *         description: Assignment status updated successfully
 *       400:
 *         description: Invalid status value
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not authorized to update this assignment
 *       404:
 *         description: Assignment not found
 */
router.put(
  '/:assignmentId/status',
  authenticate,
  validateRole(['student']),
  validateRequest(updateStatusSchema),
  controller.updateAssignmentStatus
);

export default router;
