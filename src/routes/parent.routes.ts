import express from 'express';
import { ParentController } from '../controllers/parent.controller';
import { asyncHandler } from '../middleware/async';
import { authenticate } from '../middleware/auth';
import { checkRole } from '../middleware/roles';

const router = express.Router();
const parentController = new ParentController();

// Apply authentication and role middleware
router.use(authenticate);
router.use(checkRole(['PARENT']));

// Parent-Student Management
router.get('/children', asyncHandler(parentController.getLinkedChildren));
router.post('/children', asyncHandler(parentController.linkChild));
router.delete('/children/:id', asyncHandler(parentController.unlinkChild));

// Test Planning
router.post('/test-plans', asyncHandler(parentController.createTestPlan));
router.get('/test-plans', asyncHandler(parentController.getTestPlans));
router.get('/test-plans/:id', asyncHandler(parentController.getTestPlan));
router.put('/test-plans/:id', asyncHandler(parentController.updateTestPlan));
router.delete('/test-plans/:id', asyncHandler(parentController.deleteTestPlan));

// Test Tracking
router.get('/test-executions', asyncHandler(parentController.getTestExecutions));
router.get('/children/:id/performance', asyncHandler(parentController.getChildPerformance));
router.get('/children/:id/tests', asyncHandler(parentController.getChildTestHistory));

export default router;
