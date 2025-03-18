import { Router } from 'express';
import {
  getProgress,
  addXP,
  updateStreak,
  getAchievements,
  unlockAchievement,
  getAchievementProgress,
  getAvailableRewards,
  purchaseReward,
  getLevelInfo,
  levelUpNotification,
  updateSubjectMastery,
  getActivityLog,
  logActivity
} from '../controllers/gamification.controller';
import { authenticate } from '../middleware/auth';
import { hasRole } from '../middleware/validation';

const router = Router();

/**
 * @swagger
 * /api/gamification/progress:
 *   get:
 *     summary: Get student's progress
 *     tags: [Gamification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Student progress details
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/api/gamification/progress', authenticate, hasRole(['student']), getProgress);

/**
 * @swagger
 * /api/gamification/xp:
 *   post:
 *     summary: Add XP to student's progress
 *     tags: [Gamification]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - source
 *             properties:
 *               amount:
 *                 type: number
 *               source:
 *                 type: string
 *                 enum: [test_completion, achievement, daily_login]
 *     responses:
 *       200:
 *         description: XP added successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post('/api/gamification/xp', authenticate, hasRole(['student']), addXP);

/**
 * @swagger
 * /api/gamification/streak:
 *   post:
 *     summary: Update student's streak
 *     tags: [Gamification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Streak updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post('/api/gamification/streak', authenticate, hasRole(['student']), updateStreak);

/**
 * @swagger
 * /api/gamification/achievements:
 *   get:
 *     summary: Get all achievements
 *     tags: [Gamification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of achievements
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/api/gamification/achievements', authenticate, hasRole(['student']), getAchievements);

/**
 * @swagger
 * /api/gamification/achievements/{achievementId}/unlock:
 *   post:
 *     summary: Unlock an achievement
 *     tags: [Gamification]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: achievementId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Achievement unlocked successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Achievement not found
 */
router.post('/api/gamification/achievements/:achievementId/unlock', authenticate, hasRole(['student']), unlockAchievement);

/**
 * @swagger
 * /api/gamification/achievements/progress:
 *   get:
 *     summary: Get achievement progress
 *     tags: [Gamification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Achievement progress details
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/api/gamification/achievements/progress', authenticate, hasRole(['student']), getAchievementProgress);

/**
 * @swagger
 * /api/gamification/rewards:
 *   get:
 *     summary: Get available rewards
 *     tags: [Gamification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of available rewards
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/api/gamification/rewards', authenticate, hasRole(['student']), getAvailableRewards);

/**
 * @swagger
 * /api/gamification/rewards/{rewardId}/purchase:
 *   post:
 *     summary: Purchase a reward
 *     tags: [Gamification]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: rewardId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Reward purchased successfully
 *       400:
 *         description: Insufficient points
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Reward not found
 */
router.post('/api/gamification/rewards/:rewardId/purchase', authenticate, hasRole(['student']), purchaseReward);

/**
 * @swagger
 * /api/gamification/level:
 *   get:
 *     summary: Get level information
 *     tags: [Gamification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Level information
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/api/gamification/level', authenticate, hasRole(['student']), getLevelInfo);

/**
 * @swagger
 * /api/gamification/level/notify:
 *   post:
 *     summary: Send level up notification
 *     tags: [Gamification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notification sent successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post('/api/gamification/level/notify', authenticate, hasRole(['student']), levelUpNotification);

/**
 * @swagger
 * /api/gamification/subject-mastery:
 *   post:
 *     summary: Update subject mastery
 *     tags: [Gamification]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - subjectId
 *               - score
 *             properties:
 *               subjectId:
 *                 type: string
 *               score:
 *                 type: number
 *     responses:
 *       200:
 *         description: Subject mastery updated successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post('/api/gamification/subject-mastery', authenticate, hasRole(['student']), updateSubjectMastery);

/**
 * @swagger
 * /api/gamification/activity:
 *   get:
 *     summary: Get activity log
 *     tags: [Gamification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Activity log
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/api/gamification/activity', authenticate, hasRole(['student']), getActivityLog);

/**
 * @swagger
 * /api/gamification/activity/log:
 *   post:
 *     summary: Log an activity
 *     tags: [Gamification]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - details
 *             properties:
 *               type:
 *                 type: string
 *               details:
 *                 type: object
 *     responses:
 *       200:
 *         description: Activity logged successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post('/api/gamification/activity/log', authenticate, hasRole(['student']), logActivity);

export default router;