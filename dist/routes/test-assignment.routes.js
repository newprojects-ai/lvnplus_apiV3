"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const test_assignment_controller_1 = require("../controllers/test-assignment.controller");
const guardian_auth_middleware_1 = require("../middleware/guardian-auth.middleware");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
const controller = new test_assignment_controller_1.TestAssignmentController();
router.use(auth_middleware_1.requireAuth);
router.post('/assign/student', guardian_auth_middleware_1.requireGuardianRole, controller.assignToStudent);
router.post('/assign/group', guardian_auth_middleware_1.requireGuardianRole, controller.assignToGroup);
router.get('/assigned', guardian_auth_middleware_1.requireGuardianRole, controller.getAssignmentsByAssigner);
router.get('/my-assignments', controller.getAssignmentsByStudent);
router.get('/:assignmentId', controller.getAssignmentDetails);
router.put('/:assignmentId/status', controller.updateAssignmentStatus);
exports.default = router;
