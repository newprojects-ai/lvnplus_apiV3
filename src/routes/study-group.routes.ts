import express from 'express';
import { StudyGroupController } from '../controllers/study-group.controller';
import { requireTutorRole } from '../middleware/guardian-auth.middleware';
import { requireAuth } from '../middleware/auth.middleware';

const router = express.Router();
const controller = new StudyGroupController();

router.use(requireAuth);
router.use(requireTutorRole); // All study group routes require tutor role

router.post('/', controller.createGroup);
router.get('/', controller.getGroups);
router.post('/:groupId/members', controller.addMember);
router.delete('/:groupId/members/:studentId', controller.removeMember);
router.put('/:groupId/deactivate', controller.deactivateGroup);
router.get('/:groupId/members', controller.getGroupMembers);

export default router;
