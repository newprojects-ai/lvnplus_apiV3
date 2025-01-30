"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudyGroupController = void 0;
const study_group_service_1 = require("../services/study-group.service");
const errors_1 = require("../utils/errors");
const studyGroupService = new study_group_service_1.StudyGroupService();
class StudyGroupController {
    async createGroup(req, res, next) {
        try {
            const tutorId = BigInt(req.user?.id || 0);
            const { groupName, description } = req.body;
            if (!groupName) {
                throw new errors_1.ValidationError('Group name is required');
            }
            const group = await studyGroupService.createGroup(tutorId, groupName, description);
            res.status(201).json({
                message: 'Study group created successfully',
                data: group
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getGroups(req, res, next) {
        try {
            const tutorId = BigInt(req.user?.id || 0);
            const groups = await studyGroupService.getGroups(tutorId);
            res.json({
                message: 'Study groups retrieved successfully',
                data: groups
            });
        }
        catch (error) {
            next(error);
        }
    }
    async addMember(req, res, next) {
        try {
            const groupId = BigInt(req.params.groupId);
            const { studentId } = req.body;
            if (!studentId) {
                throw new errors_1.ValidationError('Student ID is required');
            }
            const member = await studyGroupService.addMember(groupId, BigInt(studentId));
            res.status(201).json({
                message: 'Student added to group successfully',
                data: member
            });
        }
        catch (error) {
            next(error);
        }
    }
    async removeMember(req, res, next) {
        try {
            const groupId = BigInt(req.params.groupId);
            const studentId = BigInt(req.params.studentId);
            await studyGroupService.removeMember(groupId, studentId);
            res.json({
                message: 'Student removed from group successfully'
            });
        }
        catch (error) {
            next(error);
        }
    }
    async deactivateGroup(req, res, next) {
        try {
            const tutorId = BigInt(req.user?.id || 0);
            const groupId = BigInt(req.params.groupId);
            const group = await studyGroupService.deactivateGroup(groupId, tutorId);
            res.json({
                message: 'Study group deactivated successfully',
                data: group
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getGroupMembers(req, res, next) {
        try {
            const groupId = BigInt(req.params.groupId);
            const members = await studyGroupService.getGroupMembers(groupId);
            res.json({
                message: 'Group members retrieved successfully',
                data: members
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.StudyGroupController = StudyGroupController;
