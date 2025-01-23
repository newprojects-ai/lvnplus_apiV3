import express from 'express';
import { GuardianController } from '../controllers/guardian.controller';
import { requireGuardianRole } from '../middleware/guardian-auth.middleware';
import { requireAuth } from '../middleware/auth.middleware';

const router = express.Router();
const controller = new GuardianController();

// Guardian routes (require guardian role)
router.use(requireAuth);

router.post('/request-link', requireGuardianRole, controller.requestLink);
router.get('/students', requireGuardianRole, controller.getStudents);
router.put('/deactivate/:studentId', requireGuardianRole, controller.deactivateLink);

// Student routes (require student role)
router.put('/confirm-link/:relationshipId', controller.confirmLink);
router.get('/guardians', controller.getGuardians);

export default router;
