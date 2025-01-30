"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GamificationService = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const errors_1 = require("../utils/errors");
class GamificationService {
    async getProgress(userId) {
        const progress = await prisma_1.default.student_progress.findUnique({
            where: { user_id: userId }
        });
        if (!progress) {
            const newProgress = await this.initializeStudentProgress(userId);
            return this.formatProgressResponse(newProgress);
        }
        return this.formatProgressResponse(progress);
    }
    formatProgressResponse(progress) {
        return {
            userId: progress.user_id.toString(),
            level: progress.level,
            currentXP: progress.current_xp,
            nextLevelXP: progress.next_level_xp,
            streakDays: progress.streak_days,
            lastActivityDate: progress.last_activity_date,
            totalPoints: progress.total_points,
            subjectMastery: {}
        };
    }
    async initializeStudentProgress(userId) {
        try {
            const user = await prisma_1.default.users.findUnique({
                where: { user_id: userId },
                include: {
                    user_roles: {
                        include: {
                            roles: true
                        }
                    }
                }
            });
            if (!user) {
                throw new errors_1.NotFoundError('User not found');
            }
            const isStudent = user.user_roles.some(ur => ur.roles.role_name.toUpperCase() === 'STUDENT');
            if (!isStudent) {
                throw new errors_1.ValidationError('User is not a student');
            }
            return await prisma_1.default.student_progress.create({
                data: {
                    user_id: userId,
                    level: 1,
                    current_xp: 0,
                    next_level_xp: 1000,
                    streak_days: 0,
                    last_activity_date: new Date(),
                    total_points: 0
                }
            });
        }
        catch (error) {
            console.error('Error initializing student progress:', error);
            throw error;
        }
    }
    async addXP(userId, amount, source) {
        if (amount <= 0) {
            throw new errors_1.ValidationError('XP amount must be positive');
        }
        let progress = await prisma_1.default.student_progress.findUnique({
            where: { user_id: userId }
        });
        if (!progress) {
            progress = await this.initializeStudentProgress(userId);
        }
        const newXP = progress.current_xp + amount;
        let leveledUp = false;
        let newLevel = progress.level;
        if (newXP >= progress.next_level_xp) {
            leveledUp = true;
            newLevel++;
            const nextLevel = await prisma_1.default.level_config.findUnique({
                where: { level: newLevel }
            });
            if (!nextLevel) {
                throw new errors_1.ValidationError('Level configuration not found');
            }
            await prisma_1.default.student_progress.update({
                where: { user_id: userId },
                data: {
                    level: newLevel,
                    current_xp: newXP,
                    next_level_xp: nextLevel.xp_required
                }
            });
        }
        else {
            await prisma_1.default.student_progress.update({
                where: { user_id: userId },
                data: {
                    current_xp: newXP
                }
            });
        }
        await prisma_1.default.activity_log.create({
            data: {
                user_id: userId,
                activity_type: 'XP_GAIN',
                xp_earned: amount,
                details: JSON.stringify({ source })
            }
        });
        return {
            newXP,
            totalXP: newXP,
            level: newLevel,
            leveledUp
        };
    }
    async updateStreak(userId) {
        const progress = await prisma_1.default.student_progress.findUnique({
            where: { user_id: userId }
        });
        if (!progress) {
            throw new errors_1.NotFoundError('Student progress not found');
        }
        const lastActivity = progress.last_activity_date;
        const now = new Date();
        const streakBonus = 0;
        if (!lastActivity || this.isNextDay(lastActivity, now)) {
            const newStreak = progress.streak_days + 1;
            await prisma_1.default.student_progress.update({
                where: { user_id: userId },
                data: {
                    streak_days: newStreak,
                    last_activity_date: now
                }
            });
            return {
                streakDays: newStreak,
                streakBonus
            };
        }
        return {
            streakDays: progress.streak_days,
            streakBonus
        };
    }
    isNextDay(lastActivity, now) {
        const lastDate = new Date(lastActivity);
        const today = new Date(now);
        lastDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);
        const diffTime = Math.abs(today.getTime() - lastDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays === 1;
    }
    async getAchievements(userId) {
        const achievements = await prisma_1.default.achievements.findMany({
            include: {
                student_achievements: {
                    where: { user_id: userId }
                }
            }
        });
        return achievements.map(achievement => ({
            id: achievement.achievement_id.toString(),
            title: achievement.title,
            description: achievement.description,
            category: achievement.category,
            points: achievement.points,
            requiredCriteria: JSON.parse(achievement.required_criteria),
            unlockedAt: achievement.student_achievements[0]?.unlocked_at
        }));
    }
    async unlockAchievement(userId, achievementId) {
        const achievement = await prisma_1.default.achievements.findUnique({
            where: { achievement_id: BigInt(achievementId) }
        });
        if (!achievement) {
            throw new errors_1.NotFoundError('Achievement not found');
        }
        const existing = await prisma_1.default.student_achievements.findUnique({
            where: {
                user_id_achievement_id: {
                    user_id: userId,
                    achievement_id: BigInt(achievementId)
                }
            }
        });
        if (existing) {
            throw new errors_1.ValidationError('Achievement already unlocked');
        }
        await prisma_1.default.student_achievements.create({
            data: {
                user_id: userId,
                achievement_id: BigInt(achievementId)
            }
        });
        const xpAwarded = achievement.points;
        await this.addXP(userId, xpAwarded, 'achievement_unlock');
        return {
            achievement,
            xpAwarded
        };
    }
    async getAchievementProgress(userId) {
        const achievements = await prisma_1.default.student_achievements.findMany({
            where: { user_id: userId },
            include: {
                achievements: true
            }
        });
        return {
            achievements: achievements.map(a => ({
                id: a.achievement_id.toString(),
                progress: a.progress,
                target: JSON.parse(a.achievements.required_criteria).target
            }))
        };
    }
    async getAvailableRewards(userId) {
        const rewards = await prisma_1.default.rewards.findMany({
            include: {
                student_rewards: {
                    where: { user_id: userId }
                }
            }
        });
        return rewards.map(reward => ({
            id: reward.reward_id.toString(),
            title: reward.title,
            description: reward.description,
            cost: reward.cost,
            category: reward.category,
            unlocked: reward.student_rewards.length > 0
        }));
    }
    async purchaseReward(userId, rewardId) {
        const reward = await prisma_1.default.rewards.findUnique({
            where: { reward_id: BigInt(rewardId) }
        });
        if (!reward) {
            throw new errors_1.NotFoundError('Reward not found');
        }
        const existing = await prisma_1.default.student_rewards.findUnique({
            where: {
                user_id_reward_id: {
                    user_id: userId,
                    reward_id: BigInt(rewardId)
                }
            }
        });
        if (existing) {
            throw new errors_1.ValidationError('Reward already purchased');
        }
        const progress = await prisma_1.default.student_progress.findUnique({
            where: { user_id: userId }
        });
        if (!progress || progress.total_points < reward.cost) {
            throw new errors_1.ValidationError('Insufficient points');
        }
        await prisma_1.default.student_rewards.create({
            data: {
                user_id: userId,
                reward_id: BigInt(rewardId)
            }
        });
        const newBalance = progress.total_points - reward.cost;
        await prisma_1.default.student_progress.update({
            where: { user_id: userId },
            data: { total_points: newBalance }
        });
        return {
            success: true,
            newBalance,
            unlockedReward: reward
        };
    }
    async getLevelInfo(userId) {
        const progress = await prisma_1.default.student_progress.findUnique({
            where: { user_id: userId }
        });
        if (!progress) {
            throw new errors_1.NotFoundError('Student progress not found');
        }
        const levelConfig = await prisma_1.default.level_config.findUnique({
            where: { level: progress.level }
        });
        if (!levelConfig) {
            throw new errors_1.NotFoundError('Level configuration not found');
        }
        return {
            currentLevel: progress.level,
            xpProgress: progress.current_xp,
            xpRequired: progress.next_level_xp,
            availablePerks: levelConfig.perks ? JSON.parse(levelConfig.perks).unlocks : []
        };
    }
    async levelUpNotification(userId) {
        const progress = await prisma_1.default.student_progress.findUnique({
            where: { user_id: userId }
        });
        if (!progress) {
            throw new errors_1.NotFoundError('Student progress not found');
        }
        const levelConfig = await prisma_1.default.level_config.findUnique({
            where: { level: progress.level }
        });
        if (!levelConfig) {
            throw new errors_1.NotFoundError('Level configuration not found');
        }
        const perks = JSON.parse(levelConfig.perks);
        return {
            newLevel: progress.level,
            unlockedRewards: perks.unlocks,
            xpBonus: 0
        };
    }
    async updateSubjectMastery(userId, subjectId, correct) {
        const mastery = await prisma_1.default.subject_mastery.findUnique({
            where: {
                user_id_subject_id: {
                    user_id: userId,
                    subject_id: subjectId
                }
            }
        });
        if (!mastery) {
            await prisma_1.default.subject_mastery.create({
                data: {
                    user_id: userId,
                    subject_id: subjectId,
                    mastery_level: 0,
                    total_questions_attempted: 1,
                    correct_answers: correct ? 1 : 0,
                    last_test_date: new Date()
                }
            });
            return { masteryLevel: 0, isNewMastery: true };
        }
        const totalAttempted = mastery.total_questions_attempted + 1;
        const correctAnswers = mastery.correct_answers + (correct ? 1 : 0);
        const accuracy = correctAnswers / totalAttempted;
        let newMasteryLevel = Math.floor(accuracy * 5);
        newMasteryLevel = Math.min(newMasteryLevel, 5);
        await prisma_1.default.subject_mastery.update({
            where: {
                user_id_subject_id: {
                    user_id: userId,
                    subject_id: subjectId
                }
            },
            data: {
                mastery_level: newMasteryLevel,
                total_questions_attempted: totalAttempted,
                correct_answers: correctAnswers,
                last_test_date: new Date()
            }
        });
        if (newMasteryLevel > mastery.mastery_level) {
            const xpGain = (newMasteryLevel - mastery.mastery_level) * 100;
            await this.addXP(userId, xpGain, 'mastery_increase');
        }
        return {
            masteryLevel: newMasteryLevel,
            accuracy: Math.round(accuracy * 100),
            totalAttempted,
            correctAnswers
        };
    }
    async getActivityLog(userId, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const [activities, total] = await Promise.all([
            prisma_1.default.activity_log.findMany({
                where: { user_id: userId },
                orderBy: { created_at: 'desc' },
                skip,
                take: limit,
            }),
            prisma_1.default.activity_log.count({
                where: { user_id: userId }
            })
        ]);
        return {
            activities: activities.map(activity => ({
                id: activity.activity_id.toString(),
                type: activity.activity_type,
                xpEarned: activity.xp_earned,
                details: activity.details ? JSON.parse(activity.details) : null,
                timestamp: activity.created_at
            })),
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalItems: total
            }
        };
    }
    async logActivity(userId, activityType, xpEarned = 0, details = null) {
        return prisma_1.default.activity_log.create({
            data: {
                user_id: userId,
                activity_type: activityType,
                xp_earned: xpEarned,
                details: details ? JSON.stringify(details) : null
            }
        });
    }
}
exports.GamificationService = GamificationService;
