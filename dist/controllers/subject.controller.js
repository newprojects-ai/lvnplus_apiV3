"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSubject = exports.updateSubject = exports.getSubject = exports.createSubject = exports.getSubjects = void 0;
const subject_service_1 = require("../services/subject.service");
const subjectService = new subject_service_1.SubjectService();
const getSubjects = async (req, res, next) => {
    try {
        const subjects = await subjectService.getSubjects();
        res.json(subjects);
    }
    catch (error) {
        next(error);
    }
};
exports.getSubjects = getSubjects;
const createSubject = async (req, res, next) => {
    try {
        const subjectData = req.body;
        const subject = await subjectService.createSubject(subjectData);
        res.status(201).json(subject);
    }
    catch (error) {
        next(error);
    }
};
exports.createSubject = createSubject;
const getSubject = async (req, res, next) => {
    try {
        const { id } = req.params;
        const subject = await subjectService.getSubject(parseInt(id));
        res.json(subject);
    }
    catch (error) {
        next(error);
    }
};
exports.getSubject = getSubject;
const updateSubject = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const subject = await subjectService.updateSubject(parseInt(id), updateData);
        res.json(subject);
    }
    catch (error) {
        next(error);
    }
};
exports.updateSubject = updateSubject;
const deleteSubject = async (req, res, next) => {
    try {
        const { id } = req.params;
        await subjectService.deleteSubject(parseInt(id));
        res.json({ message: 'Subject deleted successfully' });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteSubject = deleteSubject;
