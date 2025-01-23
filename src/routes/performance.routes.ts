import express from 'express';
import { PerformanceTrackingController } from '../controllers/performance-tracking.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { requireGuardianRole } from '../middleware/guardian-auth.middleware';

const router = express.Router();
const controller = new PerformanceTrackingController();

router.use(requireAuth);

// Routes for students to view their own performance
router.get('/my-performance', (req, res, next) => {
  req.params.studentId = req.user?.id;
  controller.getStudentPerformance(req, res, next);
});

// Routes for guardians/tutors
router.get('/students/:studentId', requireGuardianRole, controller.getStudentPerformance);
router.get('/groups/:groupId', requireGuardianRole, controller.getGroupPerformance);

export default router;
