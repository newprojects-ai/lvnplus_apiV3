"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplateService = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const errors_1 = require("../utils/errors");
class TemplateService {
    async getTemplates(filters) {
        const where = {
            active: true,
        };
        if (filters.source) {
            where.source = filters.source;
        }
        if (filters.boardId) {
            where.board_id = filters.boardId;
        }
        const templates = await prisma_1.default.test_templates.findMany({
            where,
            include: {
                users: {
                    select: {
                        user_id: true,
                        email: true,
                        first_name: true,
                        last_name: true,
                    },
                },
                exam_boards: {
                    select: {
                        board_id: true,
                        board_name: true,
                        input_type: true,
                    },
                },
            },
            orderBy: {
                created_at: 'desc',
            },
        });
        return templates.map(this.formatTemplateResponse);
    }
    async createTemplate(userId, data) {
        const template = await prisma_1.default.test_templates.create({
            data: {
                template_name: data.templateName,
                source: 'USER',
                created_by: userId,
                board_id: data.boardId,
                test_type: data.testType,
                timing_type: data.timingType,
                time_limit: data.timeLimit,
                configuration: JSON.stringify(data.configuration),
            },
            include: {
                users: {
                    select: {
                        user_id: true,
                        email: true,
                        first_name: true,
                        last_name: true,
                    },
                },
                exam_boards: {
                    select: {
                        board_id: true,
                        board_name: true,
                        input_type: true,
                    },
                },
            },
        });
        return this.formatTemplateResponse(template);
    }
    async getTemplate(templateId, userId) {
        const template = await prisma_1.default.test_templates.findUnique({
            where: {
                template_id: templateId,
                active: true,
            },
            include: {
                users: {
                    select: {
                        user_id: true,
                        email: true,
                        first_name: true,
                        last_name: true,
                    },
                },
                exam_boards: {
                    select: {
                        board_id: true,
                        board_name: true,
                        input_type: true,
                    },
                },
            },
        });
        if (!template) {
            throw new errors_1.NotFoundError('Template not found');
        }
        return this.formatTemplateResponse(template);
    }
    async updateTemplate(templateId, userId, data) {
        const template = await prisma_1.default.test_templates.findUnique({
            where: { template_id: templateId },
        });
        if (!template) {
            throw new errors_1.NotFoundError('Template not found');
        }
        if (template.source === 'SYSTEM') {
            throw new errors_1.ValidationError('System templates cannot be modified');
        }
        if (template.created_by !== userId) {
            throw new errors_1.UnauthorizedError('Not authorized to modify this template');
        }
        const updatedTemplate = await prisma_1.default.test_templates.update({
            where: { template_id: templateId },
            data: {
                template_name: data.templateName,
                board_id: data.boardId,
                test_type: data.testType,
                timing_type: data.timingType,
                time_limit: data.timeLimit,
                configuration: JSON.stringify(data.configuration),
            },
            include: {
                users: {
                    select: {
                        user_id: true,
                        email: true,
                        first_name: true,
                        last_name: true,
                    },
                },
                exam_boards: {
                    select: {
                        board_id: true,
                        board_name: true,
                        input_type: true,
                    },
                },
            },
        });
        return this.formatTemplateResponse(updatedTemplate);
    }
    async deleteTemplate(templateId, userId) {
        const template = await prisma_1.default.test_templates.findUnique({
            where: { template_id: templateId },
        });
        if (!template) {
            throw new errors_1.NotFoundError('Template not found');
        }
        if (template.source === 'SYSTEM') {
            throw new errors_1.ValidationError('System templates cannot be deleted');
        }
        if (template.created_by !== userId) {
            throw new errors_1.UnauthorizedError('Not authorized to delete this template');
        }
        await prisma_1.default.test_templates.update({
            where: { template_id: templateId },
            data: { active: false },
        });
    }
    formatTemplateResponse(template) {
        return {
            id: template.template_id.toString(),
            templateName: template.template_name,
            source: template.source,
            creator: {
                id: template.users.user_id.toString(),
                email: template.users.email,
                firstName: template.users.first_name,
                lastName: template.users.last_name,
            },
            examBoard: {
                id: template.exam_boards.board_id,
                name: template.exam_boards.board_name,
                inputType: template.exam_boards.input_type,
            },
            testType: template.test_type,
            timingType: template.timing_type,
            timeLimit: template.time_limit,
            configuration: JSON.parse(template.configuration),
            createdAt: template.created_at,
        };
    }
}
exports.TemplateService = TemplateService;
