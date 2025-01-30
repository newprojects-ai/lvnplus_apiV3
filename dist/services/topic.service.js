"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TopicService = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const errors_1 = require("../utils/errors");
class TopicService {
    async getTopics(subjectId) {
        const topics = await prisma_1.default.topics.findMany({
            where: { subject_id: subjectId },
            include: {
                subjects: true,
                subtopics: true,
            },
        });
        return topics.map(this.formatTopicResponse);
    }
    async createTopic(data) {
        const topic = await prisma_1.default.topics.create({
            data: {
                subject_id: data.subjectId,
                topic_name: data.topicName,
                description: data.description,
            },
            include: {
                subjects: true,
                subtopics: true,
            },
        });
        return this.formatTopicResponse(topic);
    }
    async getTopic(id) {
        const topic = await prisma_1.default.topics.findUnique({
            where: { topic_id: id },
            include: {
                subjects: true,
                subtopics: true,
            },
        });
        if (!topic) {
            throw new errors_1.NotFoundError('Topic not found');
        }
        return this.formatTopicResponse(topic);
    }
    async updateTopic(id, data) {
        const topic = await prisma_1.default.topics.update({
            where: { topic_id: id },
            data: {
                topic_name: data.topicName,
                description: data.description,
            },
            include: {
                subjects: true,
                subtopics: true,
            },
        });
        return this.formatTopicResponse(topic);
    }
    async deleteTopic(id) {
        await prisma_1.default.topics.delete({
            where: { topic_id: id },
        });
    }
    formatTopicResponse(topic) {
        return {
            id: topic.topic_id,
            name: topic.topic_name,
            description: topic.description,
            subject: {
                id: topic.subjects.subject_id,
                name: topic.subjects.subject_name,
            },
            subtopics: topic.subtopics.map((subtopic) => ({
                id: subtopic.subtopic_id,
                name: subtopic.subtopic_name,
                description: subtopic.description,
            })),
        };
    }
}
exports.TopicService = TopicService;
