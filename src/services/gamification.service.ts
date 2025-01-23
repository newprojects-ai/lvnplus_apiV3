import prisma from '../lib/prisma';
import { NotFoundError, ValidationError } from '../utils/errors';

export class GamificationService {
  async getProgress(userId: bigint) {
    const progress = await prisma.student_progress.findUnique({
      where: { user_id: userId }
    });

    if (!progress) {
      // Create initial progress record if not found
      const newProgress = await this.initializeStudentProgress(userId);
      return this.formatProgressResponse(newProgress);
    }

    return this.formatProgressResponse(progress);
  }

  private formatProgressResponse(progress: any) {
    return {
      userId: progress.user_id.toString(),
      level: progress.level,
      currentXP: progress.current_xp,
      nextLevelXP: progress.next_level_xp,
      streakDays: progress.streak_days,
      lastActivityDate: progress.last_activity_date,
      totalPoints: progress.total_points,
      subjectMastery: {}  // Initialize as empty object since we'll handle subject mastery separately
    };
  }

  private async initializeStudentProgress(userId: bigint) {
    try {
      // First verify that the user exists and is a student
      const user = await prisma.users.findUnique({
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
        throw new NotFoundError('User not found');
      }

      const isStudent = user.user_roles.some(ur => 
        ur.roles.role_name.toUpperCase() === 'STUDENT'
      );
      if (!isStudent) {
        throw new ValidationError('User is not a student');
      }

      // Create initial progress record
      return await prisma.student_progress.create({
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
    } catch (error) {
      console.error('Error initializing student progress:', error);
      throw error;
    }
  }

  async addXP(userId: bigint, amount: number, source: string) {
    if (amount <= 0) {
      throw new ValidationError('XP amount must be positive');
    }

    let progress = await prisma.student_progress.findUnique({
      where: { user_id: userId }
    });

    if (!progress) {
      // Initialize progress if not found
      progress = await this.initializeStudentProgress(userId);
    }

    const newXP = progress.current_xp + amount;
    let leveledUp = false;
    let newLevel = progress.level;

    // Check if level up is needed
    if (newXP >= progress.next_level_xp) {
      leveledUp = true;
      newLevel++;
      
      // Get next level XP requirement
      const nextLevel = await prisma.level_config.findUnique({
        where: { level: newLevel }
      });

      if (!nextLevel) {
        throw new ValidationError('Level configuration not found');
      }

      // Update progress with new level info
      await prisma.student_progress.update({
        where: { user_id: userId },
        data: {
          level: newLevel,
          current_xp: newXP,
          next_level_xp: nextLevel.xp_required
        }
      });
    } else {
      // Just update XP
      await prisma.student_progress.update({
        where: { user_id: userId },
        data: {
          current_xp: newXP
        }
      });
    }

    // Log activity
    await prisma.activity_log.create({
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

  async updateStreak(userId: bigint) {
    const progress = await prisma.student_progress.findUnique({
      where: { user_id: userId }
    });

    if (!progress) {
      throw new NotFoundError('Student progress not found');
    }

    const lastActivity = progress.last_activity_date;
    const now = new Date();
    const streakBonus = 0;

    // Check if streak should be updated
    if (!lastActivity || this.isNextDay(lastActivity, now)) {
      const newStreak = progress.streak_days + 1;
      
      await prisma.student_progress.update({
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

  private isNextDay(lastActivity: Date, now: Date): boolean {
    const lastDate = new Date(lastActivity);
    const today = new Date(now);
    
    lastDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
    const diffTime = Math.abs(today.getTime() - lastDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays === 1;
  }

  async getAchievements(userId: bigint) {
    const achievements = await prisma.achievements.findMany({
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

  async unlockAchievement(userId: bigint, achievementId: string) {
    const achievement = await prisma.achievements.findUnique({
      where: { achievement_id: BigInt(achievementId) }
    });

    if (!achievement) {
      throw new NotFoundError('Achievement not found');
    }

    // Check if already unlocked
    const existing = await prisma.student_achievements.findUnique({
      where: {
        user_id_achievement_id: {
          user_id: userId,
          achievement_id: BigInt(achievementId)
        }
      }
    });

    if (existing) {
      throw new ValidationError('Achievement already unlocked');
    }

    // Create achievement unlock record
    await prisma.student_achievements.create({
      data: {
        user_id: userId,
        achievement_id: BigInt(achievementId)
      }
    });

    // Award XP
    const xpAwarded = achievement.points;
    await this.addXP(userId, xpAwarded, 'achievement_unlock');

    return {
      achievement,
      xpAwarded
    };
  }

  async getAchievementProgress(userId: bigint) {
    const achievements = await prisma.student_achievements.findMany({
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

  async getAvailableRewards(userId: bigint) {
    const rewards = await prisma.rewards.findMany({
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

  async purchaseReward(userId: bigint, rewardId: string) {
    const reward = await prisma.rewards.findUnique({
      where: { reward_id: BigInt(rewardId) }
    });

    if (!reward) {
      throw new NotFoundError('Reward not found');
    }

    // Check if already purchased
    const existing = await prisma.student_rewards.findUnique({
      where: {
        user_id_reward_id: {
          user_id: userId,
          reward_id: BigInt(rewardId)
        }
      }
    });

    if (existing) {
      throw new ValidationError('Reward already purchased');
    }

    // Check if user has enough points
    const progress = await prisma.student_progress.findUnique({
      where: { user_id: userId }
    });

    if (!progress || progress.total_points < reward.cost) {
      throw new ValidationError('Insufficient points');
    }

    // Purchase reward
    await prisma.student_rewards.create({
      data: {
        user_id: userId,
        reward_id: BigInt(rewardId)
      }
    });

    // Deduct points
    const newBalance = progress.total_points - reward.cost;
    await prisma.student_progress.update({
      where: { user_id: userId },
      data: { total_points: newBalance }
    });

    return {
      success: true,
      newBalance,
      unlockedReward: reward
    };
  }

  async getLevelInfo(userId: bigint) {
    const progress = await prisma.student_progress.findUnique({
      where: { user_id: userId }
    });

    if (!progress) {
      throw new NotFoundError('Student progress not found');
    }

    const levelConfig = await prisma.level_config.findUnique({
      where: { level: progress.level }
    });

    if (!levelConfig) {
      throw new NotFoundError('Level configuration not found');
    }

    return {
      currentLevel: progress.level,
      xpProgress: progress.current_xp,
      xpRequired: progress.next_level_xp,
      availablePerks: levelConfig.perks ? JSON.parse(levelConfig.perks).unlocks : []
    };
  }

  async levelUpNotification(userId: bigint) {
    const progress = await prisma.student_progress.findUnique({
      where: { user_id: userId }
    });

    if (!progress) {
      throw new NotFoundError('Student progress not found');
    }

    const levelConfig = await prisma.level_config.findUnique({
      where: { level: progress.level }
    });

    if (!levelConfig) {
      throw new NotFoundError('Level configuration not found');
    }

    const perks = JSON.parse(levelConfig.perks);

    return {
      newLevel: progress.level,
      unlockedRewards: perks.unlocks,
      xpBonus: 0 // Implement XP bonus logic if needed
    };
  }

  async updateSubjectMastery(userId: bigint, subjectId: number, correct: boolean) {
    const mastery = await prisma.subject_mastery.findUnique({
      where: {
        user_id_subject_id: {
          user_id: userId,
          subject_id: subjectId
        }
      }
    });

    if (!mastery) {
      // Create new mastery record if it doesn't exist
      await prisma.subject_mastery.create({
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

    // Calculate new mastery level based on performance
    const totalAttempted = mastery.total_questions_attempted + 1;
    const correctAnswers = mastery.correct_answers + (correct ? 1 : 0);
    const accuracy = correctAnswers / totalAttempted;
    
    // Mastery levels:
    // 0: Beginner (0-20% accuracy)
    // 1: Novice (21-40% accuracy)
    // 2: Intermediate (41-60% accuracy)
    // 3: Advanced (61-80% accuracy)
    // 4: Expert (81-95% accuracy)
    // 5: Master (96-100% accuracy)
    let newMasteryLevel = Math.floor(accuracy * 5);
    newMasteryLevel = Math.min(newMasteryLevel, 5); // Cap at level 5

    await prisma.subject_mastery.update({
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

    // Award XP for mastery level increase
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

  async getActivityLog(userId: bigint, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    
    const [activities, total] = await Promise.all([
      prisma.activity_log.findMany({
        where: { user_id: userId },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
      prisma.activity_log.count({
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

  async logActivity(userId: bigint, activityType: string, xpEarned: number = 0, details: any = null) {
    return prisma.activity_log.create({
      data: {
        user_id: userId,
        activity_type: activityType,
        xp_earned: xpEarned,
        details: details ? JSON.stringify(details) : null
      }
    });
  }
}