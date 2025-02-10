import express from 'express';
import { TutorController } from '../controllers/tutor.controller';
import { asyncHandler } from '../middleware/async';
import { authenticate } from '../middleware/auth';
import { checkRole } from '../middleware/roles';

const router = express.Router();
const tutorController = new TutorController();

// Apply authentication and role middleware
router.use(authenticate);
router.use(checkRole(['TUTOR']));

// Student Management
router.get('/students', asyncHandler(tutorController.getLinkedStudents));
router.post('/students', asyncHandler(tutorController.linkStudent));
router.delete('/students/:id', asyncHandler(tutorController.unlinkStudent));

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
