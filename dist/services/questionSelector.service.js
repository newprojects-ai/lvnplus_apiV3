"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.questionSelectorService = exports.QuestionSelectorService = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const errors_1 = require("../utils/errors");
class QuestionSelectorService {
    async selectQuestions(criteria, options = {
        randomize: true,
        allowCrossDifficulty: true,
        topicDistributionStrategy: 'PROPORTIONAL'
    }) {
        if (criteria.totalQuestionCount <= 0) {
            throw new errors_1.ValidationError('Total questions must be positive');
        }
        console.log('Question Selection Criteria:', JSON.stringify(criteria, null, 2));
        const distributionItems = criteria.subtopicIds || criteria.topicIds;
        const distributionType = criteria.subtopicIds ? 'SUBTOPIC' : 'TOPIC';
        const baseQuery = {
            active: true,
            ...(criteria.subtopicIds && { subtopic_id: { in: criteria.subtopicIds } }),
            ...(criteria.topicIds && {
                subtopics: {
                    topics: {
                        topic_id: { in: criteria.topicIds }
                    }
                }
            })
        };
        const totalAvailableQuestions = await prisma_1.default.questions.count({
            where: baseQuery
        });
        console.log(`Total available questions: ${totalAvailableQuestions}`);
        if (totalAvailableQuestions < criteria.totalQuestionCount) {
            console.warn(`Not enough questions available. Found ${totalAvailableQuestions}, needed ${criteria.totalQuestionCount}`);
            if (options.allowCrossDifficulty) {
                const relaxedQuery = { active: true };
                const relaxedTotalQuestions = await prisma_1.default.questions.count({
                    where: relaxedQuery
                });
                console.log(`Total questions after relaxing constraints: ${relaxedTotalQuestions}`);
                if (relaxedTotalQuestions >= criteria.totalQuestionCount) {
                    const questions = await prisma_1.default.questions.findMany({
                        where: relaxedQuery,
                        take: criteria.totalQuestionCount,
                        orderBy: options.randomize
                            ? { question_id: 'desc' }
                            : undefined
                    });
                    console.log(`Selected questions count: ${questions.length}`);
                    return questions;
                }
            }
            throw new errors_1.ValidationError(`Not enough questions available. Found ${totalAvailableQuestions}, needed ${criteria.totalQuestionCount}`);
        }
        const questions = await prisma_1.default.questions.findMany({
            where: baseQuery,
            take: criteria.totalQuestionCount,
            orderBy: options.randomize
                ? { question_id: 'desc' }
                : undefined
        });
        console.log(`Selected questions count: ${questions.length}`);
        return questions;
    }
    async selectQuestionsForItem({ subtopicIds, topicIds, count, options }) {
        const baseQuery = {
            active: true,
            ...(subtopicIds && { subtopic_id: { in: subtopicIds } }),
            ...(topicIds && {
                subtopics: {
                    topics: {
                        topic_id: { in: topicIds }
                    }
                }
            })
        };
        console.log('Question Selection Query:', JSON.stringify({
            subtopicIds,
            topicIds,
            count,
            baseQuery
        }, null, 2));
        const totalQuestions = await prisma_1.default.questions.count({
            where: baseQuery
        });
        console.log(`Total available questions: ${totalQuestions}`);
        const questions = await prisma_1.default.questions.findMany({
            where: baseQuery,
            take: count,
            orderBy: options.randomize
                ? { question_id: 'desc' }
                : undefined
        });
        console.log(`Selected questions count: ${questions.length}`);
        return questions;
    }
    shuffleQuestions(questions) {
        return questions.sort(() => 0.5 - Math.random());
    }
}
exports.QuestionSelectorService = QuestionSelectorService;
exports.questionSelectorService = new QuestionSelectorService();
