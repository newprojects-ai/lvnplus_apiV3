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
exports.GuardianService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const errors_1 = require("../utils/errors");
let GuardianService = class GuardianService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async requestLink(guardianId, studentEmail, relationType) {
        const student = await this.prisma.users.findUnique({
            where: { email: studentEmail },
            include: {
                user_roles: {
                    include: {
                        roles: true
                    }
                }
            }
        });
        if (!student || !student.user_roles.some(ur => ur.roles.role_name.toLowerCase() === 'student')) {
            throw new errors_1.NotFoundError('Student not found');
        }
        const existingRelation = await this.prisma.student_guardians.findFirst({
            where: {
                guardian_id: guardianId,
                student_id: student.user_id
            }
        });
        if (existingRelation) {
            throw new Error('Relationship already exists');
        }
        return await this.prisma.student_guardians.create({
            data: {
                guardian_id: guardianId,
                student_id: student.user_id,
                relation_type: relationType,
                status: client_1.GuardianRelationStatus.PENDING
            }
        });
    }
    async confirmLink(relationshipId, studentId) {
        const relationship = await this.prisma.student_guardians.findFirst({
            where: {
                relationship_id: relationshipId,
                student_id: studentId,
                status: client_1.GuardianRelationStatus.PENDING
            }
        });
        if (!relationship) {
            throw new Error('Relationship request not found');
        }
        return await this.prisma.student_guardians.update({
            where: { relationship_id: relationshipId },
            data: {
                status: client_1.GuardianRelationStatus.ACTIVE,
                confirmed_at: new Date()
            }
        });
    }
    async deactivateLink(guardianId, studentId) {
        const relationship = await this.prisma.student_guardians.findUnique({
            where: {
                unique_guardian_student: {
                    guardian_id: guardianId,
                    student_id: studentId
                }
            }
        });
        return await this.prisma.student_guardians.update({
            where: { relationship_id: relationship.relationship_id },
            data: {
                status: client_1.GuardianRelationStatus.INACTIVE,
                updated_at: new Date()
            }
        });
    }
    async getStudents(guardianId) {
        const relations = await this.prisma.student_guardians.findMany({
            where: {
                guardian_id: guardianId,
                status: client_1.GuardianRelationStatus.ACTIVE
            },
            include: {
                student: {
                    include: {
                        test_executions: {
                            orderBy: {
                                completed_at: 'desc'
                            },
                            take: 5
                        },
                        activity_log: {
                            orderBy: {
                                created_at: 'desc'
                            },
                            take: 10
                        },
                        student_groups: {
                            include: {
                                tutor: true
                            }
                        }
                    }
                }
            }
        });
        return relations.map(relation => relation.student);
    }
    async getStudentProgress(studentId, guardianId) {
        const relation = await this.prisma.student_guardians.findFirst({
            where: {
                student_id: studentId,
                guardian_id: guardianId,
                status: client_1.GuardianRelationStatus.ACTIVE
            }
        });
        if (!relation) {
            throw new errors_1.NotFoundError('Guardian relationship not found');
        }
        const student = await this.prisma.users.findFirst({
            where: {
                user_id: studentId
            },
            include: {
                test_executions: {
                    where: {
                        status: 'COMPLETED'
                    },
                    orderBy: {
                        completed_at: 'desc'
                    },
                    include: {
                        test_plan: true
                    }
                },
                activity_log: {
                    orderBy: {
                        created_at: 'desc'
                    }
                }
            }
        });
        if (!student)
            return null;
        const subjectPerformance = student.test_executions.reduce((acc, execution) => {
            const subject = execution.test_plan?.subject || 'Unknown';
            if (!acc[subject]) {
                acc[subject] = {
                    totalScore: 0,
                    count: 0,
                    scores: []
                };
            }
            acc[subject].totalScore += execution.score;
            acc[subject].count += 1;
            acc[subject].scores.push({
                score: execution.score,
                date: execution.completed_at
            });
            return acc;
        }, {});
        const performance = Object.entries(subjectPerformance).map(([subject, data]) => ({
            subject,
            averageScore: data.totalScore / data.count,
            trend: data.scores
                .sort((a, b) => a.date.getTime() - b.date.getTime())
                .map(s => ({ score: s.score, date: s.date })),
            testsCompleted: data.count
        }));
        return {
            studentId: student.user_id,
            performance,
            recentActivities: student.activity_log,
            overallAverage: performance.reduce((acc, p) => acc + p.averageScore, 0) / performance.length || 0
        };
    }
    async getStudentTestResults(studentId, guardianId) {
        const relation = await this.prisma.student_guardians.findFirst({
            where: {
                student_id: studentId,
                guardian_id: guardianId,
                status: client_1.GuardianRelationStatus.ACTIVE
            }
        });
        if (!relation) {
            throw new errors_1.NotFoundError('Guardian relationship not found');
        }
        return this.prisma.test_executions.findMany({
            where: {
                student_id: studentId,
                status: 'COMPLETED'
            },
            orderBy: {
                completed_at: 'desc'
            },
            include: {
                test_plan: true
            }
        });
    }
    async getStudentActivity(studentId, guardianId) {
        const relation = await this.prisma.student_guardians.findFirst({
            where: {
                student_id: studentId,
                guardian_id: guardianId,
                status: client_1.GuardianRelationStatus.ACTIVE
            }
        });
        if (!relation) {
            throw new errors_1.NotFoundError('Guardian relationship not found');
        }
        return this.prisma.activity_log.findMany({
            where: {
                user_id: studentId
            },
            orderBy: {
                created_at: 'desc'
            },
            take: 50
        });
    }
    async addActivityLog(studentId, type, description) {
        return this.prisma.activity_log.create({
            data: {
                activity_type: type,
                details: description,
                user: {
                    connect: { user_id: studentId }
                }
            }
        });
    }
    async getGuardians(studentId) {
        return await this.prisma.student_guardians.findMany({
            where: {
                student_id: studentId,
                status: client_1.GuardianRelationStatus.ACTIVE
            },
            include: {
                guardian: true
            }
        });
    }
};
exports.GuardianService = GuardianService;
exports.GuardianService = GuardianService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object])
], GuardianService);
