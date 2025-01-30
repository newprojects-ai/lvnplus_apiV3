"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const guardian_controller_1 = require("../controllers/guardian.controller");
const guardian_auth_middleware_1 = require("../middleware/guardian-auth.middleware");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
const controller = new guardian_controller_1.GuardianController();
router.use(auth_middleware_1.requireAuth);
router.post('/request-link', guardian_auth_middleware_1.requireGuardianRole, controller.requestLink);
router.get('/students', guardian_auth_middleware_1.requireGuardianRole, controller.getStudents);
router.put('/deactivate/:studentId', guardian_auth_middleware_1.requireGuardianRole, controller.deactivateLink);
router.put('/confirm-link/:relationshipId', controller.confirmLink);
router.get('/guardians', controller.getGuardians);
exports.default = router;
