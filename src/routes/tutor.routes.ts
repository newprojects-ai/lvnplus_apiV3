import express from 'express';
import { TutorController } from '../controllers/tutor.controller';
import { asyncHandler } from '../middleware/async';
import { authenticate } from '../middleware/auth';
import { checkRole } from '../middleware/roles';
import { validateRequest } from '../middleware/validation';
import { tutorLinkSchema } from '../validation/tutor.validation';

const router = express.Router();
const tutorController = new TutorController();

// Apply authentication and role middleware
router.use(authenticate);
router.use(checkRole(['TUTOR']));

// Student Management
router.post(
  '/students/link-request',
  validateRequest(tutorLinkSchema),
  asyncHandler(tutorController.requestStudentLink)
);

router.delete(
  '/:tutorId/students/:studentId',
  asyncHandler(tutorController.removeStudentLink)
);

router.get('/students', asyncHandler(tutorController.getLinkedStudents));

// Student routes (require student role)
router.post(
  '/confirm-tutor/:linkId',
  validateRequest({ accepted: 'boolean|required' }),
  asyncHandler(tutorController.confirmLink)
);

// Group Management
router.post('/groups', asyncHandler(tutorController.createGroup));
router.get('/groups', asyncHandler(tutorController.getGroups));
router.put('/groups/:id', asyncHandler(tutorController.updateGroup));
router.delete('/groups/:id', asyncHandler(tutorController.deleteGroup));
router.post('/groups/:id/students', asyncHandler(tutorController.addStudentsToGroup));
router.delete('/groups/:id/students/:studentId', asyncHandler(tutorController.removeStudentFromGroup));

// Test Planning
router.post('/test-plans', asyncHandler(tutorController.createTestPlan));
router.get('/test-plans', asyncHandler(tutorController.getTestPlans));
router.get('/test-plans/:id', asyncHandler(tutorController.getTestPlan));
router.put('/test-plans/:id', asyncHandler(tutorController.updateTestPlan));
router.delete('/test-plans/:id', asyncHandler(tutorController.deleteTestPlan));

// Performance Tracking
router.get('/students/:id/performance', asyncHandler(tutorController.getStudentPerformance));
router.get('/groups/:id/performance', asyncHandler(tutorController.getGroupPerformance));
router.get('/students/:id/tests', asyncHandler(tutorController.getStudentTestHistory));

export default router;
