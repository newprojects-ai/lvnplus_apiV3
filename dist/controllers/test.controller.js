"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTestResults = exports.getTestStatus = exports.submitTest = exports.startTest = exports.getStudentTests = exports.getTestPlan = exports.createTestPlan = void 0;
const test_service_1 = require("../services/test.service");
const testService = new test_service_1.TestService();
const createTestPlan = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const planData = req.body;
        const plan = await testService.createTestPlan(userId, planData);
        res.status(201).json(plan);
    }
    catch (error) {
        next(error);
    }
};
exports.createTestPlan = createTestPlan;
const getTestPlan = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        const plan = await testService.getTestPlan(BigInt(id), userId);
        res.json(plan);
    }
    catch (error) {
        next(error);
    }
};
exports.getTestPlan = getTestPlan;
const getStudentTests = async (req, res, next) => {
    try {
        const { studentId } = req.params;
        const { status, from, to } = req.query;
        const userId = req.user?.id;
        const tests = await testService.getStudentTests(BigInt(studentId), userId, {
            status: status,
            from: from,
            to: to,
        });
        res.json(tests);
    }
    catch (error) {
        next(error);
    }
};
exports.getStudentTests = getStudentTests;
const startTest = async (req, res, next) => {
    try {
        const { planId } = req.params;
        const userId = req.user?.id;
        const execution = await testService.startTest(BigInt(planId), userId);
        res.json(execution);
    }
    catch (error) {
        next(error);
    }
};
exports.startTest = startTest;
const submitTest = async (req, res, next) => {
    try {
        const { executionId } = req.params;
        const userId = req.user?.id;
        const { questionId, answer, timeSpent } = req.body;
        const execution = await testService.submitAnswer(BigInt(executionId), userId, {
            questionId: BigInt(questionId),
            answer,
            timeSpent,
        });
        res.json(execution);
    }
    catch (error) {
        next(error);
    }
};
exports.submitTest = submitTest;
const getTestStatus = async (req, res, next) => {
    try {
        const { executionId } = req.params;
        const userId = req.user?.id;
        const status = await testService.getTestStatus(BigInt(executionId), userId);
        res.json(status);
    }
    catch (error) {
        next(error);
    }
};
exports.getTestStatus = getTestStatus;
const getTestResults = async (req, res, next) => {
    try {
        const { executionId } = req.params;
        const userId = req.user?.id;
        const results = await testService.getTestResults(BigInt(executionId), userId);
        res.json(results);
    }
    catch (error) {
        next(error);
    }
};
exports.getTestResults = getTestResults;
