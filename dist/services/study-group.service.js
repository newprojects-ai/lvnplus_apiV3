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
exports.StudyGroupService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let StudyGroupService = class StudyGroupService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createGroup(tutorId, name, description) {
        return this.prisma.study_groups.create({
            data: {
                group_name: name,
                description,
                tutor_id: tutorId,
                created_at: new Date(),
                updated_at: new Date()
            }
        });
    }
    async getGroup(groupId) {
        return this.prisma.study_groups.findUnique({
            where: { group_id: groupId },
            include: {
                tutor: true,
                students: {
                    include: {
                        test_executions: {
                            where: {
                                status: 'COMPLETED'
                            },
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
                        }
                    }
                }
            }
        });
    }
    async getTutorGroups(tutorId) {
        return this.prisma.study_groups.findMany({
            where: {
                tutor_id: tutorId
            },
            include: {
                students: true
            }
        });
    }
    async addStudent(groupId, studentId) {
        const group = await this.prisma.study_groups.update({
            where: { group_id: groupId },
            data: {
                students: {
                    connect: { user_id: studentId }
                },
                updated_at: new Date()
            },
            include: {
                students: true
            }
        });
        await this.prisma.activity_log.create({
            data: {
                activity_type: 'group_joined',
                details: `Joined study group: ${group.group_name}`,
                user: {
                    connect: { user_id: studentId }
                }
            }
        });
        return group;
    }
    async removeStudent(groupId, studentId) {
        const group = await this.prisma.study_groups.update({
            where: { group_id: groupId },
            data: {
                students: {
                    disconnect: { user_id: studentId }
                },
                updated_at: new Date()
            }
        });
        await this.prisma.activity_log.create({
            data: {
                activity_type: 'group_left',
                details: `Left study group: ${group.group_name}`,
                user: {
                    connect: { user_id: studentId }
                }
            }
        });
        return group;
    }
    async getStudentGroups(studentId) {
        return this.prisma.study_groups.findMany({
            where: {
                students: {
                    some: {
                        user_id: studentId
                    }
                }
            },
            include: {
                tutor: true,
                students: true
            }
        });
    }
    async getGroupPerformance(groupId) {
        const group = await this.prisma.study_groups.findUnique({
            where: { group_id: groupId },
            include: {
                students: {
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
                        }
                    }
                }
            }
        });
        if (!group)
            return null;
        const studentPerformance = group.students.map(student => {
            const executions = student.test_executions;
            const averageScore = executions.length > 0
                ? executions.reduce((acc, exec) => acc + exec.score, 0) / executions.length
                : 0;
            return {
                studentId: student.user_id,
                averageScore,
                executions: executions.map(exec => ({
                    testId: exec.test_plan_id,
                    testName: exec.test_plan.name,
                    score: exec.score,
                    date: exec.completed_at
                }))
            };
        });
        const subjectPerformance = group.students.flatMap(s => s.test_executions)
            .reduce((acc, execution) => {
            const subject = execution.test_plan.subject;
            if (!acc[subject]) {
                acc[subject] = {
                    totalScore: 0,
                    count: 0,
                    scores: []
                };
            }
            acc[subject].totalScore += execution.score;
            acc[subject].count += 1;
            acc[subject].scores.push(execution.score);
            return acc;
        }, {});
        const subjectStats = Object.entries(subjectPerformance).map(([subject, data]) => ({
            subject,
            averageScore: data.totalScore / data.count,
            highestScore: Math.max(...data.scores),
            lowestScore: Math.min(...data.scores),
            testsCompleted: data.count
        }));
        return {
            groupId: group.group_id,
            name: group.group_name,
            studentCount: group.students.length,
            studentPerformance,
            subjectPerformance: subjectStats,
            overallAverage: studentPerformance.reduce((acc, s) => acc + s.averageScore, 0) / studentPerformance.length || 0
        };
    }
};
exports.StudyGroupService = StudyGroupService;
exports.StudyGroupService = StudyGroupService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object])
], StudyGroupService);
