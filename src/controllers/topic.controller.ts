import { Request, Response, NextFunction } from 'express';
import { TopicService } from '../services/topic.service';
import { CreateTopicDTO, UpdateTopicDTO } from '../types';
import { BadRequestError } from '../utils/errors';

const topicService = new TopicService();

export const getTopics = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const topics = await topicService.getTopics();
    res.json(topics);
  } catch (error) {
    next(error);
  }
};

export const createTopic = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data: CreateTopicDTO = {
      name: req.body.name,
      description: req.body.description,
      subjectId: Number(req.body.subjectId)
    };

    if (!data.name || !data.subjectId) {
      throw new BadRequestError('Name and subjectId are required');
    }

    const topic = await topicService.createTopic(data);
    res.status(201).json(topic);
  } catch (error) {
    next(error);
  }
};

export const getTopic = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id) || id <= 0) {
      throw new BadRequestError('Topic ID must be a positive integer');
    }

    const topic = await topicService.getTopic(id);
    res.json(topic);
  } catch (error) {
    next(error);
  }
};

export const updateTopic = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id) || id <= 0) {
      throw new BadRequestError('Topic ID must be a positive integer');
    }

    const data: UpdateTopicDTO = {
      name: req.body.name,
      description: req.body.description,
      subjectId: req.body.subjectId ? Number(req.body.subjectId) : undefined
    };

    const topic = await topicService.updateTopic(id, data);
    res.json(topic);
  } catch (error) {
    next(error);
  }
};

export const deleteTopic = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id) || id <= 0) {
      throw new BadRequestError('Topic ID must be a positive integer');
    }

    await topicService.deleteTopic(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const getTopicsBySubject = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const subjectId = Number(req.params.subjectId);
    if (isNaN(subjectId) || subjectId <= 0) {
      throw new BadRequestError('Subject ID must be a positive integer');
    }

    const topics = await topicService.getTopicsBySubject(subjectId);
    res.json(topics);
  } catch (error) {
    next(error);
  }
};