import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../utils/errors';
import { prisma } from '../utils/db';

export const requireGuardianRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = BigInt(req.user?.id || 0);
    
    const user = await prisma.users.findFirst({
      where: {
        user_id: userId,
        user_roles: {
          some: {
            roles: {
              role_name: {
                in: ['PARENT', 'TUTOR'],
                mode: 'insensitive'
              }
            }
          }
        }
      }
    });

    if (!user) {
      throw new ValidationError('User must be a parent or tutor to access this resource');
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const requireTutorRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = BigInt(req.user?.id || 0);
    
    const user = await prisma.users.findFirst({
      where: {
        user_id: userId,
        user_roles: {
          some: {
            roles: {
              role_name: {
                equals: 'TUTOR',
                mode: 'insensitive'
              }
            }
          }
        }
      }
    });

    if (!user) {
      throw new ValidationError('User must be a tutor to access this resource');
    }

    next();
  } catch (error) {
    next(error);
  }
};
