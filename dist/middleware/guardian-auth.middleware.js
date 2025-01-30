"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireTutorRole = exports.requireGuardianRole = void 0;
const errors_1 = require("../utils/errors");
const db_1 = require("../utils/db");
const requireGuardianRole = async (req, res, next) => {
    try {
        const userId = BigInt(req.user?.id || 0);
        const user = await db_1.prisma.users.findFirst({
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
            throw new errors_1.ValidationError('User must be a parent or tutor to access this resource');
        }
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.requireGuardianRole = requireGuardianRole;
const requireTutorRole = async (req, res, next) => {
    try {
        const userId = BigInt(req.user?.id || 0);
        const user = await db_1.prisma.users.findFirst({
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
            throw new errors_1.ValidationError('User must be a tutor to access this resource');
        }
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.requireTutorRole = requireTutorRole;
