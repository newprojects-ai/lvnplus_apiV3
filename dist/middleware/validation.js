"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateExecutionUpdate = exports.validateTestPlanUpdate = exports.validateTestPlanCreation = exports.validateTemplateUpdate = exports.validateTemplateCreation = exports.validateSubtopicUpdate = exports.validateSubtopicCreation = exports.validateTopicUpdate = exports.validateTopicCreation = exports.validateSubjectUpdate = exports.validateSubjectCreation = exports.validateLogin = exports.validateBulkQuestionCreation = exports.validateQuestionUpdate = exports.validateQuestionCreation = exports.validateRegistration = void 0;
const zod_1 = require("zod");
const registerSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8),
    firstName: zod_1.z.string().min(1),
    lastName: zod_1.z.string().min(1),
    roles: zod_1.z.array(zod_1.z.string()).optional(),
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(1),
    role: zod_1.z.string().min(1).transform(val => val.toUpperCase()),
});
const subjectSchema = zod_1.z.object({
    subjectName: zod_1.z.string().min(1),
    description: zod_1.z.string().optional(),
});
const topicSchema = zod_1.z.object({
    topicName: zod_1.z.string().min(1),
    description: zod_1.z.string().optional(),
});
const subtopicSchema = zod_1.z.object({
    subtopicName: zod_1.z.string().min(1),
    description: zod_1.z.string().optional(),
});
const templateSchema = zod_1.z.object({
    templateName: zod_1.z.string().min(1),
    boardId: zod_1.z.number(),
    testType: zod_1.z.enum(['TOPIC', 'MIXED', 'MENTAL_ARITHMETIC']),
    timingType: zod_1.z.enum(['TIMED', 'UNTIMED']),
    timeLimit: zod_1.z.number().optional(),
    configuration: zod_1.z.object({
        topics: zod_1.z.array(zod_1.z.number()),
        subtopics: zod_1.z.array(zod_1.z.number()),
        questionCounts: zod_1.z.object({
            easy: zod_1.z.number(),
            medium: zod_1.z.number(),
            hard: zod_1.z.number(),
        }),
    }),
});
const testPlanSchema = zod_1.z.object({
    templateId: zod_1.z.number().optional().nullable(),
    boardId: zod_1.z.number().optional().nullable(),
    testType: zod_1.z.enum(['TOPIC', 'SUBTOPIC', 'MIXED', 'RANDOM']),
    timingType: zod_1.z.enum(['TIMED', 'UNTIMED']),
    timeLimit: zod_1.z.number().optional(),
    studentId: zod_1.z.number().optional().nullable(),
    plannedBy: zod_1.z.number(),
    configuration: zod_1.z.object({
        topics: zod_1.z.array(zod_1.z.number()),
        subtopics: zod_1.z.array(zod_1.z.number()),
        totalQuestionCount: zod_1.z.number().min(1),
    }),
});
const executionUpdateSchema = zod_1.z.object({
    status: zod_1.z.enum(['IN_PROGRESS', 'COMPLETED', 'ABANDONED']).optional(),
    response: zod_1.z.object({
        questionId: zod_1.z.string(),
        answer: zod_1.z.string(),
        timeSpent: zod_1.z.number(),
    }).optional(),
});
const questionSchema = zod_1.z.object({
    subtopicId: zod_1.z.number(),
    questionText: zod_1.z.string().min(1),
    questionTextPlain: zod_1.z.string().min(1),
    options: zod_1.z.string(),
    correctAnswer: zod_1.z.string().min(1),
    correctAnswerPlain: zod_1.z.string().min(1),
    solution: zod_1.z.string(),
    solutionPlain: zod_1.z.string(),
    difficultyLevel: zod_1.z.number().min(0).max(5),
});
const bulkQuestionSchema = zod_1.z.object({
    questions: zod_1.z.array(questionSchema),
});
const validateRegistration = (req, res, next) => {
    try {
        registerSchema.parse(req.body);
        next();
    }
    catch (error) {
        res.status(400).json({
            error: 'Validation Error',
            details: error.errors,
        });
    }
};
exports.validateRegistration = validateRegistration;
const validateQuestionCreation = (req, res, next) => {
    try {
        questionSchema.parse(req.body);
        next();
    }
    catch (error) {
        res.status(400).json({
            error: 'Validation Error',
            details: error.errors,
        });
    }
};
exports.validateQuestionCreation = validateQuestionCreation;
const validateQuestionUpdate = (req, res, next) => {
    try {
        questionSchema.partial().parse(req.body);
        next();
    }
    catch (error) {
        res.status(400).json({
            error: 'Validation Error',
            details: error.errors,
        });
    }
};
exports.validateQuestionUpdate = validateQuestionUpdate;
const validateBulkQuestionCreation = (req, res, next) => {
    try {
        bulkQuestionSchema.parse(req.body);
        next();
    }
    catch (error) {
        res.status(400).json({
            error: 'Validation Error',
            details: error.errors,
        });
    }
};
exports.validateBulkQuestionCreation = validateBulkQuestionCreation;
const validateLogin = (req, res, next) => {
    try {
        loginSchema.parse(req.body);
        next();
    }
    catch (error) {
        res.status(400).json({
            error: 'Validation Error',
            details: error.errors,
        });
    }
};
exports.validateLogin = validateLogin;
const validateSubjectCreation = (req, res, next) => {
    try {
        subjectSchema.parse(req.body);
        next();
    }
    catch (error) {
        res.status(400).json({
            error: 'Validation Error',
            details: error.errors,
        });
    }
};
exports.validateSubjectCreation = validateSubjectCreation;
const validateSubjectUpdate = (req, res, next) => {
    try {
        subjectSchema.partial().parse(req.body);
        next();
    }
    catch (error) {
        res.status(400).json({
            error: 'Validation Error',
            details: error.errors,
        });
    }
};
exports.validateSubjectUpdate = validateSubjectUpdate;
const validateTopicCreation = (req, res, next) => {
    try {
        topicSchema.parse(req.body);
        next();
    }
    catch (error) {
        res.status(400).json({
            error: 'Validation Error',
            details: error.errors,
        });
    }
};
exports.validateTopicCreation = validateTopicCreation;
const validateTopicUpdate = (req, res, next) => {
    try {
        topicSchema.partial().parse(req.body);
        next();
    }
    catch (error) {
        res.status(400).json({
            error: 'Validation Error',
            details: error.errors,
        });
    }
};
exports.validateTopicUpdate = validateTopicUpdate;
const validateSubtopicCreation = (req, res, next) => {
    try {
        subtopicSchema.parse(req.body);
        next();
    }
    catch (error) {
        res.status(400).json({
            error: 'Validation Error',
            details: error.errors,
        });
    }
};
exports.validateSubtopicCreation = validateSubtopicCreation;
const validateSubtopicUpdate = (req, res, next) => {
    try {
        subtopicSchema.partial().parse(req.body);
        next();
    }
    catch (error) {
        res.status(400).json({
            error: 'Validation Error',
            details: error.errors,
        });
    }
};
exports.validateSubtopicUpdate = validateSubtopicUpdate;
const validateTemplateCreation = (req, res, next) => {
    try {
        templateSchema.parse(req.body);
        next();
    }
    catch (error) {
        res.status(400).json({
            error: 'Validation Error',
            details: error.errors,
        });
    }
};
exports.validateTemplateCreation = validateTemplateCreation;
const validateTemplateUpdate = (req, res, next) => {
    try {
        templateSchema.parse(req.body);
        next();
    }
    catch (error) {
        res.status(400).json({
            error: 'Validation Error',
            details: error.errors,
        });
    }
};
exports.validateTemplateUpdate = validateTemplateUpdate;
const validateTestPlanCreation = (req, res, next) => {
    try {
        console.log('Received test plan creation payload:', JSON.stringify(req.body, null, 2));
        testPlanSchema.parse(req.body);
        next();
    }
    catch (error) {
        console.error('Test Plan Validation Error:', error);
        res.status(400).json({
            error: 'Validation Error',
            details: error.errors || error.message,
        });
    }
};
exports.validateTestPlanCreation = validateTestPlanCreation;
const validateTestPlanUpdate = (req, res, next) => {
    try {
        testPlanSchema.partial().parse(req.body);
        next();
    }
    catch (error) {
        res.status(400).json({
            error: 'Validation Error',
            details: error.errors,
        });
    }
};
exports.validateTestPlanUpdate = validateTestPlanUpdate;
const validateExecutionUpdate = (req, res, next) => {
    try {
        executionUpdateSchema.parse(req.body);
        next();
    }
    catch (error) {
        res.status(400).json({
            error: 'Validation Error',
            details: error.errors,
        });
    }
};
exports.validateExecutionUpdate = validateExecutionUpdate;
