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

const router = Router();

/**
 * @swagger
 * /gamification/progress:
 *   get:
 *     summary: Get student's progress
 *     tags: [Gamification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Student progress details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userId:
 *                   type: string
 *                 level:
 *                   type: number
 *                 currentXP:
 *                   type: number
 *                 nextLevelXP:
 *                   type: number
 *                 streakDays:
 *                   type: number
 *                 lastActivityDate:
 *                   type: string
 *                   format: date-time
 *                 totalPoints:
 *                   type: number
 *                 subjectMastery:
 *                   type: object
 *                   additionalProperties:
 *                     type: number
 */

// Student Progress Routes
router.get('/progress', authenticate, getProgress);

/**
 * @swagger
 * /gamification/xp:
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 newXP:
 *                   type: number
 *                 totalXP:
 *                   type: number
 *                 level:
 *                   type: number
 *                 leveledUp:
 *                   type: boolean
 */
router.post('/xp', authenticate, addXP);

/**
 * @swagger
 * /gamification/streak:
 *   post:
 *     summary: Update student's streak
 *     tags: [Gamification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Streak updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 streakDays:
 *                   type: number
 *                 streakBonus:
 *                   type: number
 */
router.post('/streak', authenticate, updateStreak);

/**
 * @swagger
 * /gamification/achievements:
 *   get:
 *     summary: Get all achievements
 *     tags: [Gamification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of achievements
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
 *                   category:
 *                     type: string
 *                     enum: [Practice, Performance, Consistency, Mastery]
 *                   requiredCriteria:
 *                     type: object
 *                     properties:
 *                       type:
 *                         type: string
 *                         enum: [TestCount, Score, Streak, TopicMastery]
 *                       target:
 *                         type: number
 *                       progress:
 *                         type: number
 *                   points:
 *                     type: number
 *                   unlockedAt:
 *                     type: string
 *                     format: date-time
 *                     nullable: true
 */
// Achievement Routes
router.get('/achievements', authenticate, getAchievements);

/**
 * @swagger
 * /gamification/achievements/{achievementId}/unlock:
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 achievement:
 *                   type: object
 *                 xpAwarded:
 *                   type: number
 */
router.post('/achievements/:achievementId/unlock', authenticate, unlockAchievement);

/**
 * @swagger
 * /gamification/achievements/progress:
 *   get:
 *     summary: Get achievement progress
 *     tags: [Gamification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Achievement progress details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 achievements:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       progress:
 *                         type: number
 *                       target:
 *                         type: number
 */
router.get('/achievements/progress', authenticate, getAchievementProgress);

/**
 * @swagger
 * /gamification/rewards:
 *   get:
 *     summary: Get available rewards
 *     tags: [Gamification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of available rewards
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
 *                   cost:
 *                     type: number
 *                   category:
 *                     type: string
 *                     enum: [Avatar, Theme, Badge, Certificate]
 *                   unlocked:
 *                     type: boolean
 */
// Reward Routes
router.get('/rewards', authenticate, getAvailableRewards);

/**
 * @swagger
 * /gamification/rewards/{rewardId}/purchase:
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 newBalance:
 *                   type: number
 *                 unlockedReward:
 *                   type: object
 */
router.post('/rewards/:rewardId/purchase', authenticate, purchaseReward);

/**
 * @swagger
 * /gamification/levels:
 *   get:
 *     summary: Get level information
 *     tags: [Gamification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Level information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 currentLevel:
 *                   type: number
 *                 xpProgress:
 *                   type: number
 *                 xpRequired:
 *                   type: number
 *                 availablePerks:
 *                   type: array
 *                   items:
 *                     type: string
 */
// Level Routes
router.get('/levels', authenticate, getLevelInfo);

/**
 * @swagger
 * /gamification/levels/up:
 *   post:
 *     summary: Level up notification
 *     tags: [Gamification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Level up notification details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 newLevel:
 *                   type: number
 *                 unlockedRewards:
 *                   type: array
 *                   items:
 *                     type: string
 *                 xpBonus:
 *                   type: number
 */
router.post('/levels/up', authenticate, levelUpNotification);

/**
 * @swagger
 * /gamification/subject-mastery:
 *   post:
 *     summary: Update subject mastery based on question performance
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
 *               - correct
 *             properties:
 *               subjectId:
 *                 type: number
 *               correct:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Subject mastery updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 masteryLevel:
 *                   type: number
 *                 accuracy:
 *                   type: number
 *                 totalAttempted:
 *                   type: number
 *                 correctAnswers:
 *                   type: number
 */
router.post('/subject-mastery', authenticate, updateSubjectMastery);

/**
 * @swagger
 * /gamification/activity:
 *   get:
 *     summary: Get user's activity log
 *     tags: [Gamification]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Activity log with pagination
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 activities:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       type:
 *                         type: string
 *                       xpEarned:
 *                         type: number
 *                       details:
 *                         type: object
 *                       timestamp:
 *                         type: string
 *                         format: date-time
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: number
 *                     totalPages:
 *                       type: number
 *                     totalItems:
 *                       type: number
 */
router.get('/activity', authenticate, getActivityLog);

/**
 * @swagger
 * /gamification/activity:
 *   post:
 *     summary: Log a new activity
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
 *               - activityType
 *             properties:
 *               activityType:
 *                 type: string
 *               xpEarned:
 *                 type: number
 *                 default: 0
 *               details:
 *                 type: object
 *     responses:
 *       200:
 *         description: Activity logged successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 activity_id:
 *                   type: string
 *                 activity_type:
 *                   type: string
 *                 xp_earned:
 *                   type: number
 *                 created_at:
 *                   type: string
 *                   format: date-time
 */
router.post('/activity', authenticate, logActivity);

export default router;