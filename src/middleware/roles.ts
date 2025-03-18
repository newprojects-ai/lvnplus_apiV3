import { Request, Response, NextFunction } from 'express';
import type { Role } from '../types';
import { AppError } from '../utils/error';

// Role validation middleware
export const hasRole = (allowedRoles: Role[]) => {
  return (req: Request & { user?: { role?: Role; roles?: Role[] } }, _res: Response, next: NextFunction) => {
    const userRole = req.user?.role;
    const userRoles = req.user?.roles || [];
    
    if (!userRole || !allowedRoles.includes(userRole)) {
      // Check if user has any of the allowed roles as a backup
      const hasAllowedRole = userRoles.some(role => allowedRoles.includes(role));
      if (!hasAllowedRole) {
        throw new AppError(403, `Access denied. Required roles: ${allowedRoles.join(', ')}`);
      }
    }
    
    next();
  };
};

// Multiple roles validation middleware
export const hasAnyRole = (allowedRoles: Role[]) => {
  return (req: Request & { user?: { roles?: Role[] } }, _res: Response, next: NextFunction) => {
    const userRoles = req.user?.roles || [];
    
    const hasAllowedRole = userRoles.some((role: Role) => allowedRoles.includes(role));
    
    if (!hasAllowedRole) {
      throw new AppError(403, `Access denied. Required one of roles: ${allowedRoles.join(', ')}`);
    }
    
    next();
  };
};