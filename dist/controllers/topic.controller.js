"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTopic = exports.updateTopic = exports.getTopic = exports.createTopic = exports.getTopics = void 0;
const topic_service_1 = require("../services/topic.service");
const topicService = new topic_service_1.TopicService();
const getTopics = async (req, res, next) => {
    try {
        const { subjectId } = req.query;
        if (!subjectId) {
            throw new ValidationError('Subject ID is required');
        }
        const topics = await topicService.getTopics(parseInt(subjectId));
        res.json(topics);
    }
    catch (error) {
        next(error);
    }
};
exports.getTopics = getTopics;
const createTopic = async (req, res, next) => {
    try {
        const topicData = req.body;
        const topic = await topicService.createTopic(topicData);
        res.status(201).json(topic);
    }
    catch (error) {
        next(error);
    }
};
exports.createTopic = createTopic;
const getTopic = async (req, res, next) => {
    try {
        const { id } = req.params;
        const topic = await topicService.getTopic(parseInt(id));
        res.json(topic);
    }
    catch (error) {
        next(error);
    }
};
exports.getTopic = getTopic;
const updateTopic = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const topic = await topicService.updateTopic(parseInt(id), updateData);
        res.json(topic);
    }
    catch (error) {
        next(error);
    }
};
exports.updateTopic = updateTopic;
const deleteTopic = async (req, res, next) => {
    try {
        const { id } = req.params;
        await topicService.deleteTopic(parseInt(id));
        res.json({ message: 'Topic deleted successfully' });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteTopic = deleteTopic;
