"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logActivity = exports.getActivityLog = exports.updateSubjectMastery = exports.levelUpNotification = exports.getLevelInfo = exports.purchaseReward = exports.getAvailableRewards = exports.getAchievementProgress = exports.unlockAchievement = exports.getAchievements = exports.updateStreak = exports.addXP = exports.getProgress = void 0;
const gamification_service_1 = require("../services/gamification.service");
const gamificationService = new gamification_service_1.GamificationService();
const getProgress = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const progress = await gamificationService.getProgress(userId);
        res.json(progress);
    }
    catch (error) {
        next(error);
    }
};
exports.getProgress = getProgress;
const addXP = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const { amount, source } = req.body;
        const result = await gamificationService.addXP(userId, amount, source);
        res.json(result);
    }
    catch (error) {
        next(error);
    }
};
exports.addXP = addXP;
const updateStreak = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const result = await gamificationService.updateStreak(userId);
        res.json(result);
    }
    catch (error) {
        next(error);
    }
};
exports.updateStreak = updateStreak;
const getAchievements = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const achievements = await gamificationService.getAchievements(userId);
        res.json(achievements);
    }
    catch (error) {
        next(error);
    }
};
exports.getAchievements = getAchievements;
const unlockAchievement = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const { achievementId } = req.params;
        const result = await gamificationService.unlockAchievement(userId, achievementId);
        res.json(result);
    }
    catch (error) {
        next(error);
    }
};
exports.unlockAchievement = unlockAchievement;
const getAchievementProgress = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const progress = await gamificationService.getAchievementProgress(userId);
        res.json(progress);
    }
    catch (error) {
        next(error);
    }
};
exports.getAchievementProgress = getAchievementProgress;
const getAvailableRewards = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const rewards = await gamificationService.getAvailableRewards(userId);
        res.json(rewards);
    }
    catch (error) {
        next(error);
    }
};
exports.getAvailableRewards = getAvailableRewards;
const purchaseReward = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const { rewardId } = req.params;
        const result = await gamificationService.purchaseReward(userId, rewardId);
        res.json(result);
    }
    catch (error) {
        next(error);
    }
};
exports.purchaseReward = purchaseReward;
const getLevelInfo = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const levelInfo = await gamificationService.getLevelInfo(userId);
        res.json(levelInfo);
    }
    catch (error) {
        next(error);
    }
};
exports.getLevelInfo = getLevelInfo;
const levelUpNotification = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const result = await gamificationService.levelUpNotification(userId);
        res.json(result);
    }
    catch (error) {
        next(error);
    }
};
exports.levelUpNotification = levelUpNotification;
const updateSubjectMastery = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const { subjectId, correct } = req.body;
        const result = await gamificationService.updateSubjectMastery(userId, subjectId, correct);
        res.json(result);
    }
    catch (error) {
        next(error);
    }
};
exports.updateSubjectMastery = updateSubjectMastery;
const getActivityLog = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const activities = await gamificationService.getActivityLog(userId, page, limit);
        res.json(activities);
    }
    catch (error) {
        next(error);
    }
};
exports.getActivityLog = getActivityLog;
const logActivity = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const { activityType, xpEarned, details } = req.body;
        const result = await gamificationService.logActivity(userId, activityType, xpEarned, details);
        res.json(result);
    }
    catch (error) {
        next(error);
    }
};
exports.logActivity = logActivity;
