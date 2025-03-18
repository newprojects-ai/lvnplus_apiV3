import { Request, Response, NextFunction } from 'express';
import { SubtopicService } from '../services/subtopic.service';
import { CreateSubtopicDTO, UpdateSubtopicDTO, SubtopicResponse } from '../types';
import { BadRequestError } from '../utils/errors';

const subtopicService = new SubtopicService();

/**
 * @swagger
 * /api/subtopics:
 *   get:
 *     tags: [Subtopics]
 *     summary: Get all subtopics, optionally filtered by topic ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: topicId
 *         schema:
 *           type: integer
 *         description: Optional topic ID to filter subtopics
 *     responses:
 *       200:
 *         description: List of subtopics
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SubtopicResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - User does not have required role
 */
export const getSubtopics = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const topicId = req.query.topicId ? Number(req.query.topicId) : undefined;
    const subtopics = await subtopicService.getSubtopics({ topicId });
    res.json(subtopics);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/subtopics/{id}:
 *   get:
 *     tags: [Subtopics]
 *     summary: Get a subtopic by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Subtopic details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SubtopicResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - User does not have required role
 *       404:
 *         description: Subtopic not found
 */
export const getSubtopic = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    if (!id) {
      throw new BadRequestError('ID is required');
    }
    const subtopic = await subtopicService.getSubtopic(Number(id));
    if (!subtopic) {
      res.status(404).json({
        success: false,
        message: 'Subtopic not found'
      });
      return;
    }
    res.json(subtopic);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/topics/{topicId}/subtopics:
 *   get:
 *     tags: [Subtopics]
 *     summary: Get all subtopics for a specific topic
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: topicId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of subtopics for the topic
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SubtopicResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - User does not have required role
 */
export const getSubtopicsByTopic = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { topicId } = req.params;
    if (!topicId) {
      throw new BadRequestError('Topic ID is required');
    }
    const subtopics = await subtopicService.getSubtopics({
      topicId: Number(topicId)
    });
    res.json(subtopics);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/subtopics:
 *   post:
 *     tags: [Subtopics]
 *     summary: Create a new subtopic
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - topicId
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               topicId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Subtopic created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SubtopicResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - User does not have required role
 */
export const createSubtopic = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data: CreateSubtopicDTO = {
      name: req.body.name,
      description: req.body.description,
      topicId: Number(req.body.topicId)
    };

    if (!data.name || !data.topicId) {
      throw new BadRequestError('Name and topicId are required');
    }

    const subtopic = await subtopicService.createSubtopic(data);
    res.status(201).json(subtopic);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/subtopics/{id}:
 *   put:
 *     tags: [Subtopics]
 *     summary: Update a subtopic
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               topicId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Subtopic updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SubtopicResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - User does not have required role
 *       404:
 *         description: Subtopic not found
 */
export const updateSubtopic = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    if (!id) {
      throw new BadRequestError('ID is required');
    }
    const data: UpdateSubtopicDTO = {
      name: req.body.name,
      description: req.body.description,
      topicId: req.body.topicId ? Number(req.body.topicId) : undefined
    };

    const subtopic = await subtopicService.updateSubtopic(Number(id), data);
    res.json(subtopic);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/subtopics/{id}:
 *   delete:
 *     tags: [Subtopics]
 *     summary: Delete a subtopic
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Subtopic deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - User does not have required role
 *       404:
 *         description: Subtopic not found
 */
export const deleteSubtopic = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    if (!id) {
      throw new BadRequestError('ID is required');
    }
    await subtopicService.deleteSubtopic(Number(id));
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};