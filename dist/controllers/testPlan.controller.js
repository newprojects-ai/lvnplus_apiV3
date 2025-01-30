"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTestPlan = exports.updateTestPlan = exports.getTestPlan = exports.createTestPlan = void 0;
const testPlan_service_1 = require("../services/testPlan.service");
const testPlanService = new testPlan_service_1.TestPlanService();
const createTestPlan = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const testPlanData = req.body;
        const testPlan = await testPlanService.createTestPlan(userId, testPlanData);
        res.status(201).json(testPlan);
    }
    catch (error) {
        next(error);
    }
};
exports.createTestPlan = createTestPlan;
const getTestPlan = async (req, res, next) => {
    try {
        const { planId } = req.params;
        const userId = req.user?.id;
        const testPlan = await testPlanService.getTestPlan(BigInt(planId), userId);
        res.json(testPlan);
    }
    catch (error) {
        next(error);
    }
};
exports.getTestPlan = getTestPlan;
const updateTestPlan = async (req, res, next) => {
    try {
        const { planId } = req.params;
        const userId = req.user?.id;
        const updateData = req.body;
        const testPlan = await testPlanService.updateTestPlan(BigInt(planId), userId, updateData);
        res.json(testPlan);
    }
    catch (error) {
        next(error);
    }
};
exports.updateTestPlan = updateTestPlan;
const deleteTestPlan = async (req, res, next) => {
    try {
        const { planId } = req.params;
        const userId = req.user?.id;
        await testPlanService.deleteTestPlan(BigInt(planId), userId);
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
};
exports.deleteTestPlan = deleteTestPlan;
