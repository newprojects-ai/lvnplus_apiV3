import { Request, Response, NextFunction } from 'express';
import { StudyGroupService } from '../services/study-group.service';
import { ValidationError } from '../utils/errors';
import { PrismaService } from '../prisma/prisma.service';

export class StudyGroupController {
  private studyGroupService: StudyGroupService;

  constructor() {
    this.studyGroupService = new StudyGroupService(new PrismaService());
  }

  async createGroup(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ValidationError('User not authenticated');
      }

      const { id: tutorId } = req.user;
      const { name, description, subjects } = req.body;

      if (!name) {
        throw new ValidationError('Group name is required');
      }

      const group = await this.studyGroupService.createGroup(
        BigInt(tutorId),
        name,
        description,
        subjects?.map(id => BigInt(id))
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
      if (!req.user) {
        throw new ValidationError('User not authenticated');
      }

      const { id: tutorId } = req.user;
      const groups = await this.studyGroupService.getGroups(BigInt(tutorId));

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
      if (!req.user) {
        throw new ValidationError('User not authenticated');
      }

      const groupId = BigInt(req.params.groupId);
      const { student_id } = req.body;

      if (!student_id) {
        throw new ValidationError('Student ID is required');
      }

      const member = await this.studyGroupService.addMember(
        groupId,
        BigInt(student_id)
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
      if (!req.user) {
        throw new ValidationError('User not authenticated');
      }

      const groupId = BigInt(req.params.groupId);
      const studentId = BigInt(req.params.studentId);

      await this.studyGroupService.removeMember(groupId, studentId);

      res.json({
        message: 'Student removed from group successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async deactivateGroup(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ValidationError('User not authenticated');
      }

      const { id: tutorId } = req.user;
      const groupId = BigInt(req.params.groupId);

      const group = await this.studyGroupService.deactivateGroup(groupId, BigInt(tutorId));

      res.json({
        message: 'Study group deactivated successfully',
        data: group
      });
    } catch (error) {
      next(error);
    }
  }

  async getMembers(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ValidationError('User not authenticated');
      }

      const groupId = BigInt(req.params.groupId);
      const members = await this.studyGroupService.getGroupMembers(groupId);

      if (!members) {
        throw new ValidationError('Study group not found');
      }

      res.json({
        message: 'Group members retrieved successfully',
        data: members
      });
    } catch (error) {
      next(error);
    }
  }
}
