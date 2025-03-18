import { Router } from 'express';
import { ParentController } from '../controllers/parent.controller';
import { asyncHandler } from '../middleware/async';
import { authenticate } from '../middleware/auth';
import { hasRole, validateTestPlanCreate, validateTestPlanUpdate, validateGuardianLink } from '../middleware/validation';

const router = Router();
const parentController = new ParentController();

// Apply authentication middleware
router.use(authenticate);

// Parent-Student Management
router.get('/children', hasRole(['parent']), asyncHandler(parentController.getLinkedChildren));
router.post('/children', hasRole(['parent']), validateGuardianLink, asyncHandler(parentController.linkChild));
router.delete('/children/:id', hasRole(['parent']), asyncHandler(parentController.unlinkChild));

// Test Planning
router.post('/test-plans', hasRole(['parent']), validateTestPlanCreate, asyncHandler(parentController.createTestPlan));
router.get('/test-plans', hasRole(['parent']), asyncHandler(parentController.getTestPlans));
router.get('/test-plans/:id', hasRole(['parent']), asyncHandler(parentController.getTestPlan));
router.put('/test-plans/:id', hasRole(['parent']), validateTestPlanUpdate, asyncHandler(parentController.updateTestPlan));
router.delete('/test-plans/:id', hasRole(['parent']), asyncHandler(parentController.deleteTestPlan));

// Test Tracking
router.get('/test-executions', hasRole(['parent']), asyncHandler(parentController.getTestExecutions));
router.get('/children/:id/performance', hasRole(['parent']), asyncHandler(parentController.getChildPerformance));
router.get('/children/:id/tests', hasRole(['parent']), asyncHandler(parentController.getChildTestHistory));

export default router;
