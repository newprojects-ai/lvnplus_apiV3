import express from 'express';
import { TestAssignmentController } from '../controllers/test-assignment.controller';
import { requireGuardianRole } from '../middleware/guardian-auth.middleware';
import { requireAuth } from '../middleware/auth.middleware';

const router = express.Router();
const controller = new TestAssignmentController();

router.use(requireAuth);

// Routes for guardians/tutors
router.post('/assign/student', requireGuardianRole, controller.assignToStudent);
router.post('/assign/group', requireGuardianRole, controller.assignToGroup);
router.get('/assigned', requireGuardianRole, controller.getAssignmentsByAssigner);

// Routes for students
router.get('/my-assignments', controller.getAssignmentsByStudent);
router.get('/:assignmentId', controller.getAssignmentDetails);
router.put('/:assignmentId/status', controller.updateAssignmentStatus);

export default router;
