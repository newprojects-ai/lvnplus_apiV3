import express from 'express';
import { PerformanceTrackingController } from '../controllers/performance-tracking.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { requireGuardianRole } from '../middleware/guardian-auth.middleware';

const router = express.Router();
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
 *                 testScores:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       testId:
 *                         type: string
 *                       score:
 *                         type: number
 *                       date:
 *                         type: string
 *                         format: date-time
 *                 subjectProgress:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       subjectId:
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
 *                       earnedAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized
 */

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
 *                 testScores:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       testId:
 *                         type: string
 *                       score:
 *                         type: number
 *                       date:
 *                         type: string
 *                         format: date-time
 *                 subjectProgress:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       subjectId:
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
 *                       earnedAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not authorized to view this student's performance
 *       404:
 *         description: Student not found
 */

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
 *                 groupAverage:
 *                   type: number
 *                 subjectPerformance:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       subjectId:
 *                         type: string
 *                       average:
 *                         type: number
 *                       highestScore:
 *                         type: number
 *                       lowestScore:
 *                         type: number
 *                 studentPerformance:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       studentId:
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

router.use(requireAuth);

// Routes for students to view their own performance
router.get('/my-performance', (req, res, next) => {
  req.params.studentId = req.user?.id;
  controller.getStudentPerformance(req, res, next);
});

// Routes for guardians/tutors
router.get('/students/:studentId', requireGuardianRole, controller.getStudentPerformance);
router.get('/groups/:groupId', requireGuardianRole, controller.getGroupPerformance);

export default router;
