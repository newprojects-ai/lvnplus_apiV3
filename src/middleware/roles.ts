import { Request, Response, NextFunction } from 'express';

export const checkRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    console.log('Checking roles - Allowed roles:', allowedRoles);
    console.log('User role:', req.user?.role);

    if (!req.user) {
      console.log('No user object found in request');
      return res.status(401).json({
        error: 'Authentication required',
      });
    }

    // Convert both user role and allowed roles to uppercase for case-insensitive comparison
    const normalizedUserRole = req.user.role.toUpperCase();
    const normalizedAllowedRoles = allowedRoles.map(role => role.toUpperCase());

    const hasRole = normalizedAllowedRoles.includes(normalizedUserRole);
    
    if (!hasRole) {
      console.log('No matching roles found');
      return res.status(403).json({
        error: 'Insufficient permissions',
        userRole: req.user.role,
        allowedRoles: allowedRoles
      });
    }

    next();
  };
};