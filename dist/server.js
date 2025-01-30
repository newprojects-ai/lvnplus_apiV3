"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const dotenv_1 = require("dotenv");
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_1 = require("./config/swagger");
const errorHandler_1 = require("./middleware/errorHandler");
const notFoundHandler_1 = require("./middleware/notFoundHandler");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const template_routes_1 = __importDefault(require("./routes/template.routes"));
const test_routes_1 = __importDefault(require("./routes/test.routes"));
const topic_routes_1 = __importDefault(require("./routes/topic.routes"));
const subject_routes_1 = __importDefault(require("./routes/subject.routes"));
const subtopic_routes_1 = __importDefault(require("./routes/subtopic.routes"));
const testPlan_routes_1 = __importDefault(require("./routes/testPlan.routes"));
const execution_routes_1 = __importDefault(require("./routes/execution.routes"));
const question_routes_1 = __importDefault(require("./routes/question.routes"));
const gamification_routes_1 = __importDefault(require("./routes/gamification.routes"));
(0, dotenv_1.config)();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
app.use((0, cors_1.default)({
    origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:3001'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use((0, helmet_1.default)());
app.use((0, morgan_1.default)('dev'));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.specs));
console.log('Registering routes...');
console.log('Auth routes:', auth_routes_1.default);
console.log('Execution routes:', execution_routes_1.default);
app.use('/api/auth', auth_routes_1.default);
app.use('/api/templates', template_routes_1.default);
app.use('/api/subjects', subject_routes_1.default);
app.use('/api/topics', topic_routes_1.default);
app.use('/api', subtopic_routes_1.default);
app.use('/api/tests/plans', testPlan_routes_1.default);
app.use('/api/tests', test_routes_1.default);
app.use('/api/tests', execution_routes_1.default);
app.use('/api/executions', execution_routes_1.default);
app.use('/api/questions', question_routes_1.default);
app.use('/api/gamification', gamification_routes_1.default);
console.log('Routes registered. Checking route stack...');
app._router.stack.forEach((r) => {
    if (r.route) {
        console.log('Registered route:', r.route.path);
    }
    else if (r.handle && r.handle.name === 'router') {
        console.log('Router middleware registered');
        r.handle.stack.forEach((route) => {
            if (route.route) {
                console.log('  Subroute:', route.route.path);
            }
        });
    }
});
app.use(notFoundHandler_1.notFoundHandler);
app.use(errorHandler_1.errorHandler);
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log(`API Documentation available at http://localhost:${port}/api-docs`);
});
