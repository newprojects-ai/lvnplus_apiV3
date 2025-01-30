"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateTestScore = exports.getTestExecutionResults = exports.submitAllAnswers = exports.pauseTest = exports.resumeTest = exports.createExecution = exports.completeExecution = exports.submitAnswer = exports.startExecution = exports.getExecution = void 0;
const execution_service_1 = require("../services/execution.service");
const errors_1 = require("../utils/errors");
const executionService = new execution_service_1.TestExecutionService();
const getExecution = async (req, res, next) => {
    try {
        const executionId = req.params.executionId;
        const userId = req.user?.id;
        console.log('Get execution request:', {
            executionId,
            userId: userId?.toString(),
            params: req.params,
            query: req.query
        });
        if (!userId) {
            console.error('Unauthorized - Missing user ID');
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'User ID is required',
                details: 'No user ID found in request'
            });
        }
        if (!executionId) {
            console.error('Bad request - Missing execution ID');
            return res.status(400).json({
                error: 'ValidationError',
                message: 'Invalid execution ID provided',
                details: 'Execution ID is required'
            });
        }
        const numericId = Number(executionId);
        if (isNaN(numericId)) {
            console.error('Bad request - Invalid execution ID format:', executionId);
            return res.status(400).json({
                error: 'ValidationError',
                message: 'Invalid execution ID provided',
                details: 'Execution ID must be a valid number'
            });
        }
        const execution = await executionService.getExecution(executionId, userId);
        console.log('Successfully retrieved execution:', {
            executionId: execution.executionId?.toString(),
            status: execution.status
        });
        res.json(execution);
    }
    catch (error) {
        console.error('Error in getExecution:', {
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined
        });
        if (error instanceof Error) {
            const errorResponse = {
                error: error.constructor.name,
                message: error.message,
                details: error.stack
            };
            switch (error.constructor.name) {
                case 'ValidationError':
                    return res.status(400).json(errorResponse);
                case 'NotFoundError':
                    return res.status(404).json(errorResponse);
                case 'UnauthorizedError':
                    return res.status(401).json(errorResponse);
                default:
                    return res.status(500).json({
                        error: 'InternalServerError',
                        message: 'An unexpected error occurred',
                        details: process.env.NODE_ENV === 'development' ? error.message : undefined
                    });
            }
        }
        next(error);
    }
};
exports.getExecution = getExecution;
const startExecution = async (req, res, next) => {
    try {
        const { executionId } = req.params;
        const userId = req.user?.id;
        console.log('Start Test Execution Request:', {
            executionId,
            userId: userId?.toString()
        });
        if (!executionId) {
            console.error('Missing executionId in request');
            return res.status(400).json({
                message: 'Execution ID is required',
                error: 'BAD_REQUEST'
            });
        }
        if (!userId) {
            console.error('Unauthorized - Missing user ID');
            return res.status(401).json({
                message: 'User ID is required',
                error: 'UNAUTHORIZED'
            });
        }
        const result = await executionService.startExecution(BigInt(executionId), userId);
        res.status(200).json({
            message: 'Test execution started successfully',
            data: result
        });
    }
    catch (error) {
        console.error('Error in startExecution controller:', {
            errorName: error.name,
            errorMessage: error.message,
            errorStack: error.stack
        });
        next(error);
    }
};
exports.startExecution = startExecution;
const submitAnswer = async (req, res, next) => {
    try {
        const executionId = req.params.executionId;
        const userId = req.user?.id;
        const updateData = req.body;
        if (!userId) {
            console.error('Unauthorized - Missing user ID');
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'User ID is required',
                details: 'No user ID found in request'
            });
        }
        const execution = await executionService.submitAnswer(executionId, userId, updateData);
        res.json(execution);
    }
    catch (error) {
        next(error);
    }
};
exports.submitAnswer = submitAnswer;
const completeExecution = async (req, res, next) => {
    try {
        const executionId = req.params.executionId;
        const userId = req.user?.id;
        if (!userId) {
            console.error('Unauthorized - Missing user ID');
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'User ID is required',
                details: 'No user ID found in request'
            });
        }
        const execution = await executionService.completeExecution(executionId, userId);
        res.json(execution);
    }
    catch (error) {
        next(error);
    }
};
exports.completeExecution = completeExecution;
const createExecution = async (req, res, next) => {
    try {
        const planId = req.params.planId;
        const userId = req.user?.id;
        if (!userId) {
            console.error('Unauthorized - Missing user ID');
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'User ID is required',
                details: 'No user ID found in request'
            });
        }
        const execution = await executionService.createExecution(planId, userId);
        res.status(201).json(execution);
    }
    catch (error) {
        next(error);
    }
};
exports.createExecution = createExecution;
const resumeTest = async (req, res, next) => {
    try {
        const executionId = req.params.executionId;
        const userId = req.user?.id;
        if (!userId) {
            console.error('Unauthorized - Missing user ID');
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'User ID is required',
                details: 'No user ID found in request'
            });
        }
        const execution = await executionService.resumeExecution(executionId, userId);
        res.status(200).json(execution);
    }
    catch (error) {
        next(error);
    }
};
exports.resumeTest = resumeTest;
const pauseTest = async (req, res, next) => {
    try {
        const executionId = req.params.executionId;
        const userId = req.user?.id;
        if (!userId) {
            console.error('Unauthorized - Missing user ID');
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'User ID is required',
                details: 'No user ID found in request'
            });
        }
        const execution = await executionService.pauseExecution(executionId, userId);
        res.status(200).json(execution);
    }
    catch (error) {
        next(error);
    }
};
exports.pauseTest = pauseTest;
const submitAllAnswers = async (req, res, next) => {
    try {
        const { executionId } = req.params;
        const { endTime, responses } = req.body;
        const userId = req.user.id;
        console.log('Submit All Answers Controller Method Called:', {
            executionId,
            userId: userId.toString(),
            endTime,
            responsesCount: responses?.length
        });
        if (!executionId) {
            console.error('Missing executionId in request');
            return res.status(400).json({
                message: 'Execution ID is required',
                error: 'BAD_REQUEST'
            });
        }
        const testExecutionService = new execution_service_1.TestExecutionService();
        const result = await testExecutionService.submitAllAnswers(BigInt(executionId), userId, {
            endTime,
            responses
        });
        res.status(200).json({
            message: 'Answers submitted successfully',
            data: result
        });
    }
    catch (error) {
        console.error('Error in submitAllAnswers controller:', {
            errorName: error.name,
            errorMessage: error.message,
            errorStack: error.stack,
            requestBody: JSON.stringify(req.body)
        });
        next(error);
    }
};
exports.submitAllAnswers = submitAllAnswers;
const getTestExecutionResults = async (req, res, next) => {
    console.log('GET Test Execution Results - Full Request Details', {
        fullUrl: req.originalUrl,
        baseUrl: req.baseUrl,
        path: req.path,
        method: req.method,
        params: JSON.stringify(req.params),
        query: JSON.stringify(req.query),
        headers: Object.keys(req.headers),
        user: req.user?.id
    });
    try {
        const executionId = req.params.executionId || req.query.executionId;
        console.log('Execution Results Request Specifics', {
            extractedExecutionId: executionId,
            paramExecutionId: req.params.executionId,
            queryExecutionId: req.query.executionId,
            userIdFromAuth: req.user?.id
        });
        if (!executionId) {
            console.error('Missing Execution ID - Request Details', {
                params: JSON.stringify(req.params),
                query: JSON.stringify(req.query)
            });
            return res.status(400).json({
                message: 'Execution ID is required',
                details: {
                    params: req.params,
                    query: req.query
                }
            });
        }
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                message: 'User authentication is required'
            });
        }
        const results = await executionService.getExecutionResults(String(executionId), userId);
        console.log('Test Execution Results Retrieved Successfully', {
            executionId,
            resultScore: results?.score,
            resultDetails: results ? Object.keys(results) : 'No results'
        });
        res.json({
            message: 'Test execution results retrieved successfully',
            data: results
        });
    }
    catch (error) {
        console.error('Error in getTestExecutionResults - Detailed Error Log', {
            errorName: error.name,
            errorMessage: error.message,
            errorStack: error.stack,
            requestDetails: {
                fullUrl: req.originalUrl,
                baseUrl: req.baseUrl,
                path: req.path,
                params: JSON.stringify(req.params),
                query: JSON.stringify(req.query),
                userId: req.user?.id
            }
        });
        if (error instanceof errors_1.NotFoundError) {
            return res.status(404).json({
                message: error.message,
                details: {
                    executionId: req.params.executionId
                }
            });
        }
        if (error instanceof errors_1.UnauthorizedError) {
            return res.status(403).json({
                message: error.message,
                details: {
                    userId: req.user?.id
                }
            });
        }
        if (error instanceof errors_1.ValidationError) {
            return res.status(400).json({
                message: error.message,
                details: {
                    params: req.params,
                    query: req.query
                }
            });
        }
        next(error);
    }
};
exports.getTestExecutionResults = getTestExecutionResults;
const calculateTestScore = async (req, res, next) => {
    try {
        const executionId = req.params.executionId;
        const userId = req.user?.id;
        console.log('Calculate test score request:', {
            executionId,
            userId: userId?.toString(),
            params: req.params,
            query: req.query
        });
        if (!userId) {
            console.error('Unauthorized - Missing user ID');
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'User ID is required',
                details: 'No user ID found in request'
            });
        }
        if (!executionId) {
            console.error('Bad request - Missing execution ID');
            return res.status(400).json({
                error: 'ValidationError',
                message: 'Invalid execution ID provided',
                details: 'Execution ID is required'
            });
        }
        const executionService = new execution_service_1.TestExecutionService();
        const result = await executionService.calculateAndUpdateTestScore(BigInt(executionId), BigInt(userId));
        res.json(result);
    }
    catch (error) {
        console.error('Error calculating test score:', error);
        next(error);
    }
};
exports.calculateTestScore = calculateTestScore;
