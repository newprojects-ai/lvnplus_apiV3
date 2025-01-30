"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const performance_tracking_controller_1 = require("../controllers/performance-tracking.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const guardian_auth_middleware_1 = require("../middleware/guardian-auth.middleware");
const router = express_1.default.Router();
const controller = new performance_tracking_controller_1.PerformanceTrackingController();
router.use(auth_middleware_1.requireAuth);
router.get('/my-performance', (req, res, next) => {
    req.params.studentId = req.user?.id;
    controller.getStudentPerformance(req, res, next);
});
router.get('/students/:studentId', guardian_auth_middleware_1.requireGuardianRole, controller.getStudentPerformance);
router.get('/groups/:groupId', guardian_auth_middleware_1.requireGuardianRole, controller.getGroupPerformance);
exports.default = router;
