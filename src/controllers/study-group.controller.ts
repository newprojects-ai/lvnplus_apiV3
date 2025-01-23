import { Request, Response, NextFunction } from 'express';
import { StudyGroupService } from '../services/study-group.service';
import { ValidationError } from '../utils/errors';

const studyGroupService = new StudyGroupService();

export class StudyGroupController {
  async createGroup(req: Request, res: Response, next: NextFunction) {
    try {
      const tutorId = BigInt(req.user?.id || 0);
      const { groupName, description } = req.body;

      if (!groupName) {
        throw new ValidationError('Group name is required');
      }

      const group = await studyGroupService.createGroup(
        tutorId,
        groupName,
        description
      );

      res.status(201).json({
        message: 'Study group created successfully',
        data: group
      });
    } catch (error) {
      next(error);
    }
  }

  async getGroups(req: Request, res: Response, next: NextFunction) {
    try {
      const tutorId = BigInt(req.user?.id || 0);

      const groups = await studyGroupService.getGroups(tutorId);

      res.json({
        message: 'Study groups retrieved successfully',
        data: groups
      });
    } catch (error) {
      next(error);
    }
  }

  async addMember(req: Request, res: Response, next: NextFunction) {
    try {
      const groupId = BigInt(req.params.groupId);
      const { studentId } = req.body;

      if (!studentId) {
        throw new ValidationError('Student ID is required');
      }

      const member = await studyGroupService.addMember(
        groupId,
        BigInt(studentId)
      );

      res.status(201).json({
        message: 'Student added to group successfully',
        data: member
      });
    } catch (error) {
      next(error);
    }
  }

  async removeMember(req: Request, res: Response, next: NextFunction) {
    try {
      const groupId = BigInt(req.params.groupId);
      const studentId = BigInt(req.params.studentId);

      await studyGroupService.removeMember(groupId, studentId);

      res.json({
        message: 'Student removed from group successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async deactivateGroup(req: Request, res: Response, next: NextFunction) {
    try {
      const tutorId = BigInt(req.user?.id || 0);
      const groupId = BigInt(req.params.groupId);

      const group = await studyGroupService.deactivateGroup(groupId, tutorId);

      res.json({
        message: 'Study group deactivated successfully',
        data: group
      });
    } catch (error) {
      next(error);
    }
  }

  async getGroupMembers(req: Request, res: Response, next: NextFunction) {
    try {
      const groupId = BigInt(req.params.groupId);

      const members = await studyGroupService.getGroupMembers(groupId);

      res.json({
        message: 'Group members retrieved successfully',
        data: members
      });
    } catch (error) {
      next(error);
    }
  }
}
