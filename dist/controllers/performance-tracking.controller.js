"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerformanceTrackingController = void 0;
const performance_tracking_service_1 = require("../services/performance-tracking.service");
const errors_1 = require("../utils/errors");
const performanceService = new performance_tracking_service_1.PerformanceTrackingService();
class PerformanceTrackingController {
    async getStudentPerformance(req, res, next) {
        try {
            const studentId = BigInt(req.params.studentId);
            const userId = BigInt(req.user?.id || 0);
            if (userId !== studentId) {
                const hasAccess = await this.verifyGuardianAccess(userId, studentId);
                if (!hasAccess) {
                    throw new errors_1.ValidationError('Unauthorized to view this student\'s performance');
                }
            }
            const performance = await performanceService.getStudentPerformance(studentId);
            res.json({
                message: 'Student performance retrieved successfully',
                data: performance
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getGroupPerformance(req, res, next) {
        try {
            const groupId = BigInt(req.params.groupId);
            const userId = BigInt(req.user?.id || 0);
            const group = await prisma.study_groups.findFirst({
                where: {
                    group_id: groupId,
                    tutor_id: userId
                }
            });
            if (!group) {
                throw new errors_1.ValidationError('Unauthorized to view this group\'s performance');
            }
            const performance = await performanceService.getGroupPerformance(groupId);
            res.json({
                message: 'Group performance retrieved successfully',
                data: performance
            });
        }
        catch (error) {
            next(error);
        }
    }
    async verifyGuardianAccess(guardianId, studentId) {
        const relationship = await prisma.student_guardians.findFirst({
            where: {
                guardian_id: guardianId,
                student_id: studentId,
                status: 'ACTIVE'
            }
        });
        return !!relationship;
    }
}
exports.PerformanceTrackingController = PerformanceTrackingController;
