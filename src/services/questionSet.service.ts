import { PrismaClient } from '@prisma/client';
import prisma from '../lib/prisma';
import { NotFoundError, ValidationError } from '../utils/errors';

export interface CreateQuestionSetDTO {
  name: string;
  description?: string;
  metadata?: Record<string, any>;
  questions: {
    questionId: number;
    sequence: number;
  }[];
}

export interface QuestionSetResponse {
  setId: number;
  name: string;
  description: string | null;
  createdBy: number;
  createdAt: Date;
  updatedAt: Date;
  metadata: Record<string, any> | null;
  questions: {
    questionId: number;
    sequence: number;
    questionText: string;
    difficultyLevel: number;
  }[];
}

export class QuestionSetService {
  async createQuestionSet(
    createdBy: bigint,
    data: CreateQuestionSetDTO
  ): Promise<QuestionSetResponse> {
    // Validate questions exist
    const questionIds = data.questions.map(q => q.questionId);
    const existingQuestions = await prisma.questions.findMany({
      where: {
        question_id: {
          in: questionIds,
        },
        active: true,
      },
    });

    if (existingQuestions.length !== questionIds.length) {
      throw new ValidationError('Some questions do not exist or are inactive');
    }

    // Create question set
    const questionSet = await prisma.question_sets.create({
      data: {
        name: data.name,
        description: data.description,
        created_by: Number(createdBy),
        metadata: data.metadata ? JSON.stringify(data.metadata) : null,
      },
    });

    // Create question set items
    await prisma.question_set_items.createMany({
      data: data.questions.map(q => ({
        set_id: questionSet.set_id,
        question_id: q.questionId,
        sequence: q.sequence,
      })),
    });

    return this.getQuestionSet(questionSet.set_id);
  }

  async getQuestionSet(setId: bigint): Promise<QuestionSetResponse> {
    const questionSet = await prisma.question_sets.findUnique({
      where: {
        set_id: setId,
        active: true,
      },
      include: {
        question_set_items: {
          include: {
            question: true,
          },
          orderBy: {
            sequence: 'asc',
          },
        },
      },
    });

    if (!questionSet) {
      throw new NotFoundError('Question set not found');
    }

    return {
      setId: Number(questionSet.set_id),
      name: questionSet.name,
      description: questionSet.description,
      createdBy: Number(questionSet.created_by),
      createdAt: questionSet.created_at,
      updatedAt: questionSet.updated_at,
      metadata: questionSet.metadata ? JSON.parse(questionSet.metadata as string) : null,
      questions: questionSet.question_set_items.map(item => ({
        questionId: Number(item.question_id),
        sequence: item.sequence,
        questionText: item.question.question_text,
        difficultyLevel: Number(item.question.difficulty_level),
      })),
    };
  }

  async linkToTestPlan(
    testPlanId: bigint,
    setId: bigint,
    sequence: number
  ): Promise<void> {
    // Verify test plan exists
    const testPlan = await prisma.test_plans.findUnique({
      where: { test_plan_id: testPlanId },
    });

    if (!testPlan) {
      throw new NotFoundError('Test plan not found');
    }

    // Verify question set exists and is active
    const questionSet = await prisma.question_sets.findUnique({
      where: {
        set_id: setId,
        active: true,
      },
    });

    if (!questionSet) {
      throw new NotFoundError('Question set not found or inactive');
    }

    // Create link
    await prisma.test_plan_question_sets.create({
      data: {
        test_plan_id: Number(testPlanId),
        set_id: Number(setId),
        sequence,
      },
    });
  }
}
