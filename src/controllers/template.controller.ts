import { Request, Response, NextFunction } from 'express';
import { TemplateService } from '../services/template.service';
import type { CreateTemplateDTO, UpdateTemplateDTO, UserRequest } from '../types';
import { BadRequestError } from '../utils/errors';

const templateService = new TemplateService();

export const getTemplates = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { source, boardId } = req.query;
    const filters = {
      source: source as 'SYSTEM' | 'USER' | undefined,
      board_id: boardId ? Number(boardId) : undefined,
    };
    
    const templates = await templateService.getTemplates(filters);
    res.json(templates);
  } catch (error) {
    next(error);
  }
};

export const createTemplate = async (
  req: UserRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new BadRequestError('User ID is required');
    }

    const templateData: CreateTemplateDTO = {
      template_name: req.body.template_name,
      board_id: req.body.board_id,
      test_type: req.body.test_type,
      timing_type: req.body.timing_type,
      time_limit: req.body.time_limit,
      configuration: req.body.configuration
    };
    
    const template = await templateService.createTemplate(userId, templateData);
    res.status(201).json(template);
  } catch (error) {
    next(error);
  }
};

export const getTemplate = async (
  req: UserRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    if (!userId) {
      throw new BadRequestError('User ID is required');
    }
    
    const template = await templateService.getTemplate(BigInt(id), userId);
    res.json(template);
  } catch (error) {
    next(error);
  }
};

export const updateTemplate = async (
  req: UserRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    if (!userId) {
      throw new BadRequestError('User ID is required');
    }

    const updateData: UpdateTemplateDTO = {
      template_name: req.body.template_name,
      board_id: req.body.board_id,
      test_type: req.body.test_type,
      timing_type: req.body.timing_type,
      time_limit: req.body.time_limit,
      configuration: req.body.configuration
    };
    
    const template = await templateService.updateTemplate(
      BigInt(id),
      userId,
      updateData
    );
    res.json(template);
  } catch (error) {
    next(error);
  }
};

export const deleteTemplate = async (
  req: UserRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    if (!userId) {
      throw new BadRequestError('User ID is required');
    }
    
    await templateService.deleteTemplate(BigInt(id), userId);
    res.json({ message: 'Template deleted successfully' });
  } catch (error) {
    next(error);
  }
};