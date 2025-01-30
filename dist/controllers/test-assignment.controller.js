"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestAssignmentController = void 0;
const test_assignment_service_1 = require("../services/test-assignment.service");
const errors_1 = require("../utils/errors");
const testAssignmentService = new test_assignment_service_1.TestAssignmentService();
class TestAssignmentController {
    async assignToStudent(req, res, next) {
        try {
            const assignerId = BigInt(req.user?.id || 0);
            const { testPlanId, studentId, dueDate } = req.body;
            if (!testPlanId || !studentId || !dueDate) {
                throw new errors_1.ValidationError('Test plan ID, student ID, and due date are required');
            }
            const assignment = await testAssignmentService.assignToStudent(BigInt(testPlanId), assignerId, BigInt(studentId), new Date(dueDate));
            res.status(201).json({
                message: 'Test assigned to student successfully',
                data: assignment
            });
        }
        catch (error) {
            next(error);
        }
    }
    async assignToGroup(req, res, next) {
        try {
            const assignerId = BigInt(req.user?.id || 0);
            const { testPlanId, groupId, dueDate } = req.body;
            if (!testPlanId || !groupId || !dueDate) {
                throw new errors_1.ValidationError('Test plan ID, group ID, and due date are required');
            }
            const assignment = await testAssignmentService.assignToGroup(BigInt(testPlanId), assignerId, BigInt(groupId), new Date(dueDate));
            res.status(201).json({
                message: 'Test assigned to group successfully',
                data: assignment
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getAssignmentsByAssigner(req, res, next) {
        try {
            const assignerId = BigInt(req.user?.id || 0);
            const assignments = await testAssignmentService.getAssignmentsByAssigner(assignerId);
            res.json({
                message: 'Assignments retrieved successfully',
                data: assignments
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getAssignmentsByStudent(req, res, next) {
        try {
            const studentId = BigInt(req.user?.id || 0);
            const assignments = await testAssignmentService.getAssignmentsByStudent(studentId);
            res.json({
                message: 'Assignments retrieved successfully',
                data: assignments
            });
        }
        catch (error) {
            next(error);
        }
    }
    async updateAssignmentStatus(req, res, next) {
        try {
            const assignmentId = BigInt(req.params.assignmentId);
            const { status } = req.body;
            if (!status) {
                throw new errors_1.ValidationError('Assignment status is required');
            }
            const assignment = await testAssignmentService.updateAssignmentStatus(assignmentId, status);
            res.json({
                message: 'Assignment status updated successfully',
                data: assignment
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getAssignmentDetails(req, res, next) {
        try {
            const assignmentId = BigInt(req.params.assignmentId);
            const assignment = await testAssignmentService.getAssignmentDetails(assignmentId);
            res.json({
                message: 'Assignment details retrieved successfully',
                data: assignment
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.TestAssignmentController = TestAssignmentController;
