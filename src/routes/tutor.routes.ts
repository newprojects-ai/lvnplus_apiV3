import { Router } from 'express';
import type { Request as ExpressRequest, Response } from 'express';
import { TutorController } from '../controllers/tutor.controller';
import { authenticate } from '../middleware/auth';
import { hasRole, validateTutorLink, validateTutorGroupCreate, validateTestPlanCreate } from '../middleware/validation';
import { TutorService } from '../services/tutor.service';

const router = Router();
const tutorService = new TutorService();
const controller = new TutorController(tutorService);

// Helper to wrap async controller methods
const asyncHandler = (fn: (req: ExpressRequest, res: Response) => Promise<any>) => {
  return (req: ExpressRequest, res: Response) => {
    Promise.resolve(fn(req, res)).catch((err) => {
      console.error('Error in async handler:', err);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: err.message
      });
    });
  };
};

// Student Management
router.post(
  '/students/link',
  authenticate,
  hasRole(['tutor']),
  validateTutorLink,
  asyncHandler(controller.linkStudent.bind(controller))
);

router.delete(
  '/students/:id',
  authenticate,
  hasRole(['tutor']),
  asyncHandler(controller.unlinkStudent.bind(controller))
);

router.get(
  '/students',
  authenticate,
  hasRole(['tutor']),
  asyncHandler(controller.getLinkedStudents.bind(controller))
);

// Group Management
router.post(
  '/groups',
  authenticate,
  hasRole(['tutor']),
  validateTutorGroupCreate,
  asyncHandler(controller.createGroup.bind(controller))
);

router.get(
  '/groups',
  authenticate,
  hasRole(['tutor']),
  asyncHandler(controller.getGroups.bind(controller))
);

router.get(
  '/groups/:id',
  authenticate,
  hasRole(['tutor']),
  asyncHandler(controller.getGroup.bind(controller))
);

router.put(
  '/groups/:id',
  authenticate,
  hasRole(['tutor']),
  validateTutorGroupCreate,
  asyncHandler(controller.updateGroup.bind(controller))
);

router.delete(
  '/groups/:id',
  authenticate,
  hasRole(['tutor']),
  asyncHandler(controller.deleteGroup.bind(controller))
);

router.post(
  '/groups/:id/students',
  authenticate,
  hasRole(['tutor']),
  asyncHandler(controller.addStudentsToGroup.bind(controller))
);

router.delete(
  '/groups/:id/students/:studentId',
  authenticate,
  hasRole(['tutor']),
  asyncHandler(controller.removeStudentFromGroup.bind(controller))
);

// Test Plans
router.post(
  '/test-plans',
  authenticate,
  hasRole(['tutor']),
  validateTestPlanCreate,
  asyncHandler(controller.createTestPlan.bind(controller))
);

router.get(
  '/test-plans',
  authenticate,
  hasRole(['tutor']),
  asyncHandler(controller.getTestPlans.bind(controller))
);

router.get(
  '/test-plans/:id',
  authenticate,
  hasRole(['tutor']),
  asyncHandler(controller.getTestPlan.bind(controller))
);

router.put(
  '/test-plans/:id',
  authenticate,
  hasRole(['tutor']),
  validateTestPlanCreate,
  asyncHandler(controller.updateTestPlan.bind(controller))
);

router.delete(
  '/test-plans/:id',
  authenticate,
  hasRole(['tutor']),
  asyncHandler(controller.deleteTestPlan.bind(controller))
);

// Performance Tracking
router.get(
  '/students/:id/performance',
  authenticate,
  hasRole(['tutor']),
  asyncHandler(controller.getStudentPerformance.bind(controller))
);

router.get(
  '/groups/:id/performance',
  authenticate,
  hasRole(['tutor']),
  asyncHandler(controller.getGroupPerformance.bind(controller))
);

router.get(
  '/students/:id/test-history',
  authenticate,
  hasRole(['tutor']),
  asyncHandler(controller.getStudentTestHistory.bind(controller))
);

export default router;
