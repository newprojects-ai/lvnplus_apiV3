import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import { AppError } from '../utils/error';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        roles: string[];
      };
    }
  }
}

// Helper function to normalize roles
const normalizeRole = (role: string): string => role.toLowerCase();

export const authenticate = async (
  req: Request,
  _: Response,
  next: NextFunction
) => {
  try {
    const token = extractToken(req);
    
    if (!token) {
      return next(new AppError(401, 'Authentication required'));
    }

    if (!process.env.JWT_SECRET) {
      return next(new AppError(500, 'Authentication configuration error'));
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET) as any;
    } catch (error) {
      const message = error instanceof jwt.TokenExpiredError 
        ? 'Token expired' 
        : 'Invalid token';
      
      return next(new AppError(401, message));
    }

    // Ensure we have a valid user ID
    const userId = decoded.userId ? decoded.userId : null;
    const userEmail = decoded.email;

    if (!userId && !userEmail) {
      return next(new AppError(401, 'Invalid token format'));
    }

    // Ensure roles are present and normalized
    if (!decoded.roles || !Array.isArray(decoded.roles)) {
      return next(new AppError(401, 'Invalid token: missing roles'));
    }

    // Normalize roles to lowercase
    const normalizedRoles = decoded.roles.map(normalizeRole);

    // Fetch user details from database to ensure they still exist and get latest roles
    const user = await prisma.users.findFirst({
      where: {
        OR: [
          userId ? { user_id: userId } : {},
          userEmail ? { email: userEmail } : {}
        ]
      },
      include: {
        user_roles: {
          include: {
            roles: true
          }
        }
      }
    });

    if (!user) {
      return next(new AppError(401, 'User not found'));
    }

    // Set user info in request
    req.user = {
      id: user.user_id.toString(),
      email: user.email,
      roles: normalizedRoles,
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    next(new AppError(500, 'Authentication failed'));
  }
};

function extractToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;

  const [bearer, token] = authHeader.split(' ');
  if (bearer !== 'Bearer' || !token) return null;

  return token;
}