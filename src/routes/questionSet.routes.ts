import express from 'express';
import { QuestionSetService } from '../services/questionSet.service';
import { validateToken } from '../middleware/auth.middleware';
import { ValidationError } from '../utils/errors';

const router = express.Router();
const questionSetService = new QuestionSetService();

// Create a new question set
router.post('/', validateToken, async (req, res, next) => {
  try {
    const { userId } = req.user;
    const questionSet = await questionSetService.createQuestionSet(BigInt(userId), req.body);
    res.status(201).json(questionSet);
  } catch (error) {
    next(error);
  }
});

// Get a specific question set
router.get('/:setId', validateToken, async (req, res, next) => {
  try {
    const setId = BigInt(req.params.setId);
    const questionSet = await questionSetService.getQuestionSet(setId);
    res.json(questionSet);
  } catch (error) {
    next(error);
  }
});

// Link question set to test plan
router.post('/:setId/link/:testPlanId', validateToken, async (req, res, next) => {
  try {
    const setId = BigInt(req.params.setId);
    const testPlanId = BigInt(req.params.testPlanId);
    const { sequence } = req.body;

    if (typeof sequence !== 'number') {
      throw new ValidationError('Sequence must be a number');
    }

    await questionSetService.linkToTestPlan(testPlanId, setId, sequence);
    res.status(201).send();
  } catch (error) {
    next(error);
  }
});

export default router;
