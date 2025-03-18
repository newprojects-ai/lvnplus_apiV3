import { Router } from 'express';
import { PerformanceTrackingController } from '../controllers/performance-tracking.controller';
import { authenticate } from '../middleware/auth';
import { validateRole } from '../middleware/validation';

const router = Router();
const controller = new PerformanceTrackingController();

/**
 * @swagger
 * /api/performance/my-performance:
 *   get:
 *     summary: Get authenticated student's performance data
 *     description: Students can view their own performance metrics, including test scores, progress, and achievements
 *     tags: [Performance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Student performance data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 test_scores:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       test_id:
 *                         type: string
 *                       score:
 *                         type: number
 *                       date:
 *                         type: string
 *                         format: date-time
 *                 subject_progress:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       subject_id:
 *                         type: string
 *                       progress:
 *                         type: number
 *                       level:
 *                         type: string
 *                 achievements:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       earned_at:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - User is not a student
 */
router.get(
  '/my-performance',
  authenticate,
  validateRole(['student']),
  controller.getStudentPerformance
);

/**
 * @swagger
 * /api/performance/students/{studentId}:
 *   get:
 *     summary: Get performance data for a specific student
 *     description: Guardians and tutors can view performance data for students they are linked to
 *     tags: [Performance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the student to get performance for
 *     responses:
 *       200:
 *         description: Student performance data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 test_scores:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       test_id:
 *                         type: string
 *                       score:
 *                         type: number
 *                       date:
 *                         type: string
 *                         format: date-time
 *                 subject_progress:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       subject_id:
 *                         type: string
 *                       progress:
 *                         type: number
 *                       level:
 *                         type: string
 *                 achievements:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       earned_at:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not authorized to view this student's performance
 *       404:
 *         description: Student not found
 */
router.get(
  '/students/:studentId',
  authenticate,
  validateRole(['parent', 'tutor']),
  controller.getStudentPerformance
);

/**
 * @swagger
 * /api/performance/groups/{groupId}:
 *   get:
 *     summary: Get performance data for a study group
 *     description: Get aggregated performance metrics for all students in a study group
 *     tags: [Performance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the study group
 *     responses:
 *       200:
 *         description: Group performance data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 group_average:
 *                   type: number
 *                 subject_performance:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       subject_id:
 *                         type: string
 *                       average:
 *                         type: number
 *                       highest_score:
 *                         type: number
 *                       lowest_score:
 *                         type: number
 *                 student_performance:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       student_id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       average:
 *                         type: number
 *                       trend:
 *                         type: string
 *                         enum: [IMPROVING, STABLE, DECLINING]
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not authorized to view this group's performance
 *       404:
 *         description: Group not found
 */
router.get(
  '/groups/:groupId',
  authenticate,
  validateRole(['tutor']),
  controller.getGroupPerformance
);

export default router;
