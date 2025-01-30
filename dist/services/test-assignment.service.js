"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestAssignmentService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let TestAssignmentService = class TestAssignmentService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async assignToStudent(tutorId, studentId, data) {
        return this.prisma.test_assignments.create({
            data: {
                due_date: data.dueDate,
                instructions: data.instructions,
                test_plan: {
                    connect: { test_plan_id: data.testId }
                },
                student: {
                    connect: { user_id: studentId }
                },
                assigned_by: tutorId
            }
        });
    }
    async assignToGroup(tutorId, groupId, data) {
        const group = await this.prisma.study_groups.findUnique({
            where: { group_id: groupId },
            include: {
                students: true
            }
        });
        if (!group) {
            throw new Error('Group not found');
        }
        const assignments = await Promise.all(group.students.map(student => this.prisma.test_assignments.create({
            data: {
                due_date: data.dueDate,
                instructions: data.instructions,
                test_plan: {
                    connect: { test_plan_id: data.testId }
                },
                student: {
                    connect: { user_id: student.user_id }
                },
                assigned_by: tutorId,
                group: {
                    connect: { group_id: groupId }
                }
            }
        })));
        await Promise.all(group.students.map(student => this.prisma.activity_log.create({
            data: {
                activity_type: 'test_assigned',
                details: `Test assigned to group ${group.group_name}`,
                user: {
                    connect: { user_id: student.user_id }
                }
            }
        })));
        return {
            groupId,
            assignments
        };
    }
    async getStudentAssignments(studentId) {
        return this.prisma.test_assignments.findMany({
            where: {
                student_id: studentId,
                status: 'PENDING'
            },
            include: {
                test_plan: true,
                group: true,
                assigner: true
            },
            orderBy: {
                due_date: 'asc'
            }
        });
    }
    async getGroupAssignments(groupId) {
        return this.prisma.test_assignments.findMany({
            where: {
                group_id: groupId
            },
            include: {
                test_plan: true,
                student: true,
                assigner: true
            },
            orderBy: {
                due_date: 'asc'
            }
        });
    }
    async completeAssignment(assignmentId, score) {
        const assignment = await this.prisma.test_assignments.update({
            where: { assignment_id: assignmentId },
            data: {
                status: 'COMPLETED',
                completed_at: new Date()
            },
            include: {
                student: true,
                group: true
            }
        });
        await this.prisma.test_executions.create({
            data: {
                test_plan_id: assignment.test_plan_id,
                student_id: assignment.student_id,
                score: score,
                status: 'COMPLETED',
                completed_at: new Date()
            }
        });
        await this.prisma.activity_log.create({
            data: {
                activity_type: 'test_completed',
                details: `Completed test with score ${score}%${assignment.group ? ` (Group: ${assignment.group.group_name})` : ''}`,
                user: {
                    connect: { user_id: assignment.student_id }
                }
            }
        });
        return assignment;
    }
    async getAssignmentStats(assignmentId) {
        const assignment = await this.prisma.test_assignments.findUnique({
            where: { assignment_id: assignmentId },
            include: {
                student: true,
                test_plan: true,
                group: {
                    include: {
                        students: {
                            include: {
                                test_executions: {
                                    where: {
                                        test_plan_id: assignment.test_plan_id,
                                        status: 'COMPLETED'
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
        if (!assignment) {
            throw new Error('Assignment not found');
        }
        if (!assignment.group_id) {
            const execution = await this.prisma.test_executions.findFirst({
                where: {
                    test_plan_id: assignment.test_plan_id,
                    student_id: assignment.student_id,
                    status: 'COMPLETED'
                }
            });
            return {
                studentScore: execution?.score || 0,
                completed: assignment.status === 'COMPLETED',
                dueDate: assignment.due_date
            };
        }
        const groupScores = assignment.group.students
            .map(student => student.test_executions[0]?.score || 0)
            .filter(score => score > 0);
        return {
            studentScore: assignment.student.test_executions[0]?.score || 0,
            completed: assignment.status === 'COMPLETED',
            dueDate: assignment.due_date,
            groupAverage: groupScores.reduce((acc, score) => acc + score, 0) / groupScores.length || 0,
            groupHighest: Math.max(...groupScores, 0),
            groupLowest: Math.min(...groupScores.filter(score => score > 0), 100)
        };
    }
};
exports.TestAssignmentService = TestAssignmentService;
exports.TestAssignmentService = TestAssignmentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object])
], TestAssignmentService);
