import express from 'express';
import { GuardianController } from '../controllers/guardian.controller';
import { requireGuardianRole } from '../middleware/guardian-auth.middleware';
import { requireAuth } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation';
import { guardianLinkSchema } from '../validation/guardian.validation';

const router = express.Router();
const controller = new GuardianController();

// Apply authentication middleware
router.use(requireAuth);

// Guardian routes (require guardian role)
router.post(
  '/link-request',
  requireGuardianRole,
  validateRequest(guardianLinkSchema),
  controller.requestLink
);

router.delete(
  '/:guardianId/students/:studentId',
  requireGuardianRole,
  controller.removeLink
);

router.get('/students', requireGuardianRole, controller.getStudents);

// Student routes (require student role)
router.post(
  '/confirm-guardian/:linkId',
  validateRequest({ accepted: 'boolean|required' }),
  controller.confirmLink
);

router.get('/guardians', controller.getGuardians);

export default router;
