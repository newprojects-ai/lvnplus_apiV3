"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubjectService = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const errors_1 = require("../utils/errors");
class SubjectService {
    async getSubjects() {
        const subjects = await prisma_1.default.subjects.findMany({
            include: {
                topics: true,
            },
        });
        return subjects.map(this.formatSubjectResponse);
    }
    async createSubject(data) {
        const subject = await prisma_1.default.subjects.create({
            data: {
                subject_name: data.subjectName,
                description: data.description,
            },
            include: {
                topics: true,
            },
        });
        return this.formatSubjectResponse(subject);
    }
    async getSubject(id) {
        const subject = await prisma_1.default.subjects.findUnique({
            where: { subject_id: id },
            include: {
                topics: true,
            },
        });
        if (!subject) {
            throw new errors_1.NotFoundError('Subject not found');
        }
        return this.formatSubjectResponse(subject);
    }
    async updateSubject(id, data) {
        const subject = await prisma_1.default.subjects.update({
            where: { subject_id: id },
            data: {
                subject_name: data.subjectName,
                description: data.description,
            },
            include: {
                topics: true,
            },
        });
        return this.formatSubjectResponse(subject);
    }
    async deleteSubject(id) {
        await prisma_1.default.subjects.delete({
            where: { subject_id: id },
        });
    }
    formatSubjectResponse(subject) {
        return {
            id: subject.subject_id,
            name: subject.subject_name,
            description: subject.description,
            topics: subject.topics.map((topic) => ({
                id: topic.topic_id,
                name: topic.topic_name,
                description: topic.description,
            })),
        };
    }
}
exports.SubjectService = SubjectService;
