"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubtopicService = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
class SubtopicService {
    async getSubtopics(topicId) {
        const subtopics = await prisma_1.default.subtopics.findMany({
            where: { topic_id: topicId },
            include: {
                topics: {
                    include: {
                        subjects: true,
                    },
                },
            },
        });
        return subtopics.map(this.formatSubtopicResponse);
    }
    async createSubtopic(data) {
        const subtopic = await prisma_1.default.subtopics.create({
            data: {
                topic_id: data.topicId,
                subtopic_name: data.subtopicName,
                description: data.description,
            },
            include: {
                topics: {
                    include: {
                        subjects: true,
                    },
                },
            },
        });
        return this.formatSubtopicResponse(subtopic);
    }
    async updateSubtopic(id, data) {
        const subtopic = await prisma_1.default.subtopics.update({
            where: { subtopic_id: id },
            data: {
                subtopic_name: data.subtopicName,
                description: data.description,
            },
            include: {
                topics: {
                    include: {
                        subjects: true,
                    },
                },
            },
        });
        return this.formatSubtopicResponse(subtopic);
    }
    async deleteSubtopic(id) {
        await prisma_1.default.subtopics.delete({
            where: { subtopic_id: id },
        });
    }
    formatSubtopicResponse(subtopic) {
        return {
            id: subtopic.subtopic_id,
            name: subtopic.subtopic_name,
            description: subtopic.description,
            topic: {
                id: subtopic.topics.topic_id,
                name: subtopic.topics.topic_name,
                subject: {
                    id: subtopic.topics.subjects.subject_id,
                    name: subtopic.topics.subjects.subject_name,
                },
            },
        };
    }
}
exports.SubtopicService = SubtopicService;
