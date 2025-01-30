"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSubtopics = exports.getTopics = exports.getRandomQuestions = exports.bulkCreateQuestions = exports.filterQuestions = exports.deleteQuestion = exports.updateQuestion = exports.getQuestion = exports.createQuestion = exports.getQuestions = void 0;
const question_service_1 = require("../services/question.service");
const questionService = new question_service_1.QuestionService();
const getQuestions = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const questions = await questionService.getQuestions(page, limit);
        res.json(questions);
    }
    catch (error) {
        next(error);
    }
};
exports.getQuestions = getQuestions;
const createQuestion = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const questionData = req.body;
        const question = await questionService.createQuestion(userId, questionData);
        res.status(201).json(question);
    }
    catch (error) {
        next(error);
    }
};
exports.createQuestion = createQuestion;
const getQuestion = async (req, res, next) => {
    try {
        const { id } = req.params;
        const question = await questionService.getQuestion(BigInt(id));
        res.json(question);
    }
    catch (error) {
        next(error);
    }
};
exports.getQuestion = getQuestion;
const updateQuestion = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        const updateData = req.body;
        const question = await questionService.updateQuestion(BigInt(id), userId, updateData);
        res.json(question);
    }
    catch (error) {
        next(error);
    }
};
exports.updateQuestion = updateQuestion;
const deleteQuestion = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        await questionService.deleteQuestion(BigInt(id), userId);
        res.json({ message: 'Question deleted successfully' });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteQuestion = deleteQuestion;
const filterQuestions = async (req, res, next) => {
    try {
        const filters = {
            topicId: req.query.topicId ? parseInt(req.query.topicId) : undefined,
            subtopicId: req.query.subtopicId ? parseInt(req.query.subtopicId) : undefined,
            difficulty: req.query.difficulty ? parseInt(req.query.difficulty) : undefined,
            examBoard: req.query.examBoard ? parseInt(req.query.examBoard) : undefined,
            limit: Math.min(parseInt(req.query.limit) || 20, 100),
            offset: parseInt(req.query.offset) || 0,
        };
        if (filters.difficulty !== undefined && (filters.difficulty < 0 || filters.difficulty > 5)) {
            return res.status(400).json({
                error: 'Validation Error',
                message: 'Difficulty must be between 0 and 5',
            });
        }
        const questions = await questionService.filterQuestions({
            ...filters,
        });
        res.json(questions);
    }
    catch (error) {
        next(error);
    }
};
exports.filterQuestions = filterQuestions;
const bulkCreateQuestions = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const { questions } = req.body;
        const createdQuestions = await questionService.bulkCreateQuestions(userId, questions);
        res.status(201).json(createdQuestions);
    }
    catch (error) {
        next(error);
    }
};
exports.bulkCreateQuestions = bulkCreateQuestions;
const getRandomQuestions = async (req, res, next) => {
    try {
        const { count, difficulty, topicIds, subtopicIds, } = req.query;
        if (!count) {
            return res.status(400).json({
                error: 'Validation Error',
                message: 'Count parameter is required'
            });
        }
        const parsedCount = parseInt(count);
        if (isNaN(parsedCount) || parsedCount < 1 || parsedCount > 50) {
            return res.status(400).json({
                error: 'Validation Error',
                message: 'Count must be between 1 and 50'
            });
        }
        const parsedDifficulty = difficulty ? parseInt(difficulty) : undefined;
        if (parsedDifficulty !== undefined && (isNaN(parsedDifficulty) || parsedDifficulty < 0 || parsedDifficulty > 5)) {
            return res.status(400).json({
                error: 'Validation Error',
                message: 'Difficulty must be between 0 and 5'
            });
        }
        const questions = await questionService.getRandomQuestions({
            count: parsedCount,
            difficulty: parsedDifficulty,
            topicIds: topicIds ? topicIds.split(',').map(Number) : undefined,
            subtopicIds: subtopicIds ? subtopicIds.split(',').map(Number) : undefined,
        });
        res.json(questions);
    }
    catch (error) {
        next(error);
    }
};
exports.getRandomQuestions = getRandomQuestions;
const getTopics = async (req, res, next) => {
    try {
        const topics = await questionService.getTopics();
        res.json(topics);
    }
    catch (error) {
        next(error);
    }
};
exports.getTopics = getTopics;
const getSubtopics = async (req, res, next) => {
    try {
        const { id } = req.params;
        const subtopics = await questionService.getSubtopics(parseInt(id));
        res.json(subtopics);
    }
    catch (error) {
        next(error);
    }
};
exports.getSubtopics = getSubtopics;
