"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkRole = void 0;
const checkRole = (allowedRoles) => {
    return (req, res, next) => {
        console.log('Checking roles - Allowed roles:', allowedRoles);
        console.log('User roles:', req.user?.roles);
        if (!req.user) {
            console.log('No user object found in request');
            return res.status(401).json({
                error: 'Authentication required',
            });
        }
        const normalizedUserRoles = req.user.roles.map(role => role.toUpperCase());
        const normalizedAllowedRoles = allowedRoles.map(role => role.toUpperCase());
        const hasRole = normalizedUserRoles.some(role => normalizedAllowedRoles.includes(role));
        if (!hasRole) {
            console.log('No matching roles found');
            return res.status(403).json({
                error: 'Insufficient permissions',
                userRoles: req.user.roles,
                allowedRoles: allowedRoles
            });
        }
        next();
    };
};
exports.checkRole = checkRole;
