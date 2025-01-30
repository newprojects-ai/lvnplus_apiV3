"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTemplate = exports.updateTemplate = exports.getTemplate = exports.createTemplate = exports.getTemplates = void 0;
const template_service_1 = require("../services/template.service");
const templateService = new template_service_1.TemplateService();
const getTemplates = async (req, res, next) => {
    try {
        const { source, boardId } = req.query;
        const filters = {
            source: source,
            boardId: boardId ? parseInt(boardId) : undefined,
        };
        const templates = await templateService.getTemplates(filters);
        res.json(templates);
    }
    catch (error) {
        next(error);
    }
};
exports.getTemplates = getTemplates;
const createTemplate = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const templateData = req.body;
        const template = await templateService.createTemplate(userId, templateData);
        res.status(201).json(template);
    }
    catch (error) {
        next(error);
    }
};
exports.createTemplate = createTemplate;
const getTemplate = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        const template = await templateService.getTemplate(BigInt(id), userId);
        res.json(template);
    }
    catch (error) {
        next(error);
    }
};
exports.getTemplate = getTemplate;
const updateTemplate = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        const updateData = req.body;
        const template = await templateService.updateTemplate(BigInt(id), userId, updateData);
        res.json(template);
    }
    catch (error) {
        next(error);
    }
};
exports.updateTemplate = updateTemplate;
const deleteTemplate = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        await templateService.deleteTemplate(BigInt(id), userId);
        res.json({ message: 'Template deleted successfully' });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteTemplate = deleteTemplate;
