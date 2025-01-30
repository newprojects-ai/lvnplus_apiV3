"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSubtopic = exports.updateSubtopic = exports.createSubtopic = exports.getSubtopics = void 0;
const subtopic_service_1 = require("../services/subtopic.service");
const subtopicService = new subtopic_service_1.SubtopicService();
const getSubtopics = async (req, res, next) => {
    try {
        const { topicId } = req.params;
        const subtopics = await subtopicService.getSubtopics(parseInt(topicId));
        res.json(subtopics);
    }
    catch (error) {
        next(error);
    }
};
exports.getSubtopics = getSubtopics;
const createSubtopic = async (req, res, next) => {
    try {
        const { topicId } = req.params;
        const subtopicData = {
            ...req.body,
            topicId: parseInt(topicId),
        };
        const subtopic = await subtopicService.createSubtopic(subtopicData);
        res.status(201).json(subtopic);
    }
    catch (error) {
        next(error);
    }
};
exports.createSubtopic = createSubtopic;
const updateSubtopic = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const subtopic = await subtopicService.updateSubtopic(parseInt(id), updateData);
        res.json(subtopic);
    }
    catch (error) {
        next(error);
    }
};
exports.updateSubtopic = updateSubtopic;
const deleteSubtopic = async (req, res, next) => {
    try {
        const { id } = req.params;
        await subtopicService.deleteSubtopic(parseInt(id));
        res.json({ message: 'Subtopic deleted successfully' });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteSubtopic = deleteSubtopic;
