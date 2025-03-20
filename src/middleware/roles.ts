import { Request, Response, NextFunction } from 'express';
import { Role, normalizeRole } from '../types';
import { AppError } from '../utils/error';

// Role validation middleware
export const hasRole = (allowedRoles: Role[]) => {
  return (req: Request & { user?: { role?: string; roles?: string[] } }, _res: Response, next: NextFunction) => {
    const userRole = req.user?.role ? normalizeRole(req.user.role) : undefined;
    const userRoles = (req.user?.roles || []).map(normalizeRole);
    const normalizedAllowedRoles = allowedRoles.map(normalizeRole);
    
    if (!userRole || !normalizedAllowedRoles.includes(userRole)) {
      // Check if user has any of the allowed roles as a backup
      const hasAllowedRole = userRoles.some(role => normalizedAllowedRoles.includes(role));
      if (!hasAllowedRole) {
        throw new AppError(403, `Access denied. Required roles: ${allowedRoles.join(', ')}`);
      }
    }
    
    next();
  };
};

// Multiple roles validation middleware
export const hasAnyRole = (allowedRoles: Role[]) => {
  return (req: Request & { user?: { roles?: string[] } }, _res: Response, next: NextFunction) => {
    const userRoles = (req.user?.roles || []).map(normalizeRole);
    const normalizedAllowedRoles = allowedRoles.map(normalizeRole);
    
    const hasAllowedRole = userRoles.some(role => normalizedAllowedRoles.includes(role));
    
    if (!hasAllowedRole) {
      throw new AppError(403, `Access denied. Required one of roles: ${allowedRoles.join(', ')}`);
    }
    
    next();
  };
};