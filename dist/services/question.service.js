"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestionService = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const errors_1 = require("../utils/errors");
class QuestionService {
    async getQuestions(page, limit) {
        const skip = (page - 1) * limit;
        const [questions, total] = await Promise.all([
            prisma_1.default.questions.findMany({
                where: { active: true },
                include: this.getQuestionIncludes(),
                skip,
                take: limit,
                orderBy: { created_at: 'desc' },
            }),
            prisma_1.default.questions.count({ where: { active: true } }),
        ]);
        return {
            data: questions.map(this.formatQuestionResponse),
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                current: page,
                perPage: limit,
            },
        };
    }
    async createQuestion(userId, data) {
        const isKaTeX = /\$.*\$/.test(data.correctAnswer);
        const question = await prisma_1.default.questions.create({
            data: {
                subtopic_id: data.subtopicId,
                question_text: data.questionText,
                options: JSON.stringify(data.options),
                correct_answer: isKaTeX ? data.correctAnswer : null,
                correct_answer_plain: !isKaTeX ? data.correctAnswer : null,
                is_katex: isKaTeX,
                difficulty_level: data.difficultyLevel,
                created_by: userId,
            },
            include: this.getQuestionIncludes(),
        });
        return this.formatQuestionResponse(question);
    }
    async getQuestion(questionId) {
        const question = await prisma_1.default.questions.findUnique({
            where: {
                question_id: questionId,
                active: true,
            },
            include: this.getQuestionIncludes(),
        });
        if (!question) {
            throw new errors_1.NotFoundError('Question not found');
        }
        return this.formatQuestionResponse(question);
    }
    async updateQuestion(questionId, userId, data) {
        const question = await prisma_1.default.questions.findUnique({
            where: { question_id: questionId },
        });
        if (!question) {
            throw new errors_1.NotFoundError('Question not found');
        }
        if (question.created_by !== userId) {
            throw new errors_1.UnauthorizedError('Not authorized to modify this question');
        }
        const isKaTeX = /\$.*\$/.test(data.correctAnswer);
        const updatedQuestion = await prisma_1.default.questions.update({
            where: { question_id: questionId },
            data: {
                subtopic_id: data.subtopicId,
                question_text: data.questionText,
                options: JSON.stringify(data.options),
                correct_answer: isKaTeX ? data.correctAnswer : null,
                correct_answer_plain: !isKaTeX ? data.correctAnswer : null,
                is_katex: isKaTeX,
                difficulty_level: data.difficultyLevel,
            },
            include: this.getQuestionIncludes(),
        });
        return this.formatQuestionResponse(updatedQuestion);
    }
    async deleteQuestion(questionId, userId) {
        const question = await prisma_1.default.questions.findUnique({
            where: { question_id: questionId },
        });
        if (!question) {
            throw new errors_1.NotFoundError('Question not found');
        }
        if (question.created_by !== userId) {
            throw new errors_1.UnauthorizedError('Not authorized to delete this question');
        }
        await prisma_1.default.questions.update({
            where: { question_id: questionId },
            data: { active: false },
        });
    }
    async filterQuestions(params) {
        const difficultyMap = {
            'EASY': 1,
            'MEDIUM': 2,
            'HARD': 3,
            '1': 1,
            '2': 2,
            '3': 3,
            '4': 4
        };
        const difficulty = typeof params.difficulty === 'string'
            ? difficultyMap[params.difficulty] || 2
            : params.difficulty || 2;
        const query = {
            ...(params.subtopicId && { subtopic_id: Number(params.subtopicId) }),
            difficulty_level: difficulty,
        };
        const topicQuery = params.topicId
            ? {
                subtopics: {
                    topic_id: Number(params.topicId)
                }
            }
            : {};
        try {
            const totalCount = await prisma_1.default.questions.count({
                where: {
                    ...query,
                    ...topicQuery
                }
            });
            if (totalCount < params.limit) {
                console.warn(`Not enough questions at difficulty level ${difficulty}. Attempting to find more...`);
                const adjacentDifficulties = difficulty === 2
                    ? [1, 3]
                    : difficulty < 2
                        ? [2, 3]
                        : [1, 2];
                for (const adjDifficulty of adjacentDifficulties) {
                    const adjustedQuery = {
                        ...query,
                        difficulty_level: adjDifficulty,
                        ...topicQuery
                    };
                    const adjustedCount = await prisma_1.default.questions.count({ where: adjustedQuery });
                    if (adjustedCount >= params.limit) {
                        query.difficulty_level = adjDifficulty;
                        break;
                    }
                }
            }
            const questions = await prisma_1.default.questions.findMany({
                where: {
                    ...query,
                    ...topicQuery
                },
                include: {
                    subtopics: {
                        include: {
                            topics: true
                        }
                    }
                },
                take: params.limit,
                skip: params.offset || 0,
                orderBy: {
                    question_id: 'desc'
                }
            });
            if (questions.length < params.limit) {
                throw new errors_1.ValidationError(`Not enough questions available. Found ${questions.length}, needed ${params.limit}`);
            }
            return {
                data: questions.map(q => ({
                    ...q,
                    topicId: q.subtopics.topic_id,
                    topicName: q.subtopics.topics.topic_name
                })),
                total: totalCount,
                limit: params.limit,
                offset: params.offset || 0
            };
        }
        catch (error) {
            console.error('Error filtering questions:', error);
            throw error;
        }
    }
    async bulkCreateQuestions(userId, questions) {
        const createdQuestions = await prisma_1.default.$transaction(questions.map(question => prisma_1.default.questions.create({
            data: {
                subtopic_id: question.subtopicId,
                question_text: question.questionText,
                options: JSON.stringify(question.options),
                correct_answer: question.correctAnswer,
                difficulty_level: question.difficultyLevel,
                created_by: userId,
            },
            include: this.getQuestionIncludes(),
        })));
        return createdQuestions.map(this.formatQuestionResponse);
    }
    async getRandomQuestions(params) {
        try {
            const where = {
                active: true,
                ...(params.difficulty && { difficulty_level: String(params.difficulty) })
            };
            if (params.topicIds?.length) {
                where.subtopics = {
                    topics: {
                        topic_id: { in: params.topicIds }
                    }
                };
            }
            if (params.subtopicIds?.length) {
                where.subtopic_id = {
                    in: params.subtopicIds
                };
            }
            const questions = await prisma_1.default.questions.findMany({
                where,
                include: this.getQuestionIncludes(),
                take: params.count,
                orderBy: {
                    question_id: 'asc'
                }
            });
            const shuffled = questions.sort(() => Math.random() - 0.5);
            return shuffled.slice(0, params.count).map(this.formatQuestionResponse);
        }
        catch (error) {
            console.error('Error in getRandomQuestions:', error);
            throw error;
        }
    }
    async getTopics() {
        return prisma_1.default.topics.findMany({
            include: {
                subjects: {
                    select: {
                        subject_id: true,
                        subject_name: true,
                    },
                },
            },
        });
    }
    async getSubtopics(topicId) {
        return prisma_1.default.subtopics.findMany({
            where: { topic_id: topicId },
            include: {
                topics: {
                    select: {
                        topic_id: true,
                        topic_name: true,
                    },
                },
            },
        });
    }
    getQuestionIncludes() {
        return {
            subtopics: {
                include: {
                    topics: {
                        include: {
                            subjects: true,
                        },
                    },
                },
            },
            users: {
                select: {
                    user_id: true,
                    email: true,
                    first_name: true,
                    last_name: true,
                },
            },
        };
    }
    formatQuestionResponse(question) {
        return {
            id: question.question_id.toString(),
            questionText: question.question_text,
            options: JSON.parse(question.options),
            correctAnswer: question.correct_answer || question.correct_answer_plain,
            correctAnswerPlain: question.correct_answer_plain,
            isKaTeX: question.is_katex,
            difficultyLevel: question.difficulty_level,
            subtopic: {
                id: question.subtopics.subtopic_id,
                name: question.subtopics.subtopic_name,
                topic: {
                    id: question.subtopics.topics.topic_id,
                    name: question.subtopics.topics.topic_name,
                    subject: {
                        id: question.subtopics.topics.subjects.subject_id,
                        name: question.subtopics.topics.subjects.subject_name,
                    },
                },
            },
            creator: {
                id: question.users.user_id.toString(),
                email: question.users.email,
                firstName: question.users.first_name,
                lastName: question.users.last_name,
            },
            createdAt: question.created_at,
        };
    }
}
exports.QuestionService = QuestionService;
