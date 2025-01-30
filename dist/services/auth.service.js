"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../lib/prisma"));
const errors_1 = require("../utils/errors");
class AuthService {
    async register(data) {
        const existingUser = await prisma_1.default.users.findUnique({
            where: { email: data.email },
        });
        if (existingUser) {
            throw new errors_1.ValidationError('Email already registered');
        }
        const hashedPassword = await bcryptjs_1.default.hash(data.password, 12);
        const roles = data.roles?.length ? data.roles : ['STUDENT'];
        const user = await prisma_1.default.users.create({
            data: {
                email: data.email,
                password_hash: hashedPassword,
                first_name: data.firstName,
                last_name: data.lastName,
                user_roles: {
                    create: roles.map(role => ({
                        roles: {
                            connect: {
                                role_name: role,
                            },
                        },
                    })),
                },
            },
            include: {
                user_roles: {
                    include: {
                        roles: true,
                    },
                },
            },
        });
        if (roles.includes('STUDENT')) {
            await prisma_1.default.student_progress.create({
                data: {
                    user_id: user.user_id,
                    level: 1,
                    current_xp: 0,
                    next_level_xp: 1000,
                    streak_days: 0,
                    last_activity_date: new Date(),
                    total_points: 0
                }
            });
        }
        const token = this.generateToken(user);
        return {
            user: this.formatUserResponse(user),
            token,
        };
    }
    async login(credentials) {
        try {
            console.log('Login attempt:', {
                email: credentials.email,
                requestedRole: credentials.role.toUpperCase()
            });
            const user = await prisma_1.default.users.findUnique({
                where: { email: credentials.email },
                include: {
                    user_roles: {
                        include: {
                            roles: true,
                        },
                    },
                },
            });
            console.log('User found:', {
                user: user ? {
                    id: user.user_id,
                    email: user.email,
                    roles: user.user_roles.map(ur => ur.roles.role_name.toUpperCase())
                } : null
            });
            if (!user) {
                throw new errors_1.UnauthorizedError('Invalid email or password');
            }
            if (!user.active) {
                throw new errors_1.UnauthorizedError('Account is inactive');
            }
            const isValidPassword = await bcryptjs_1.default.compare(credentials.password, user.password_hash);
            if (!isValidPassword) {
                throw new errors_1.UnauthorizedError('Invalid email or password');
            }
            const userRoles = user.user_roles.map(ur => ur.roles.role_name.toUpperCase());
            console.log('User roles:', userRoles);
            if (!userRoles.includes(credentials.role.toUpperCase())) {
                throw new errors_1.UnauthorizedError('User is not authorized for the requested role');
            }
            const token = this.generateToken(user, credentials.role.toUpperCase());
            const response = {
                user: this.formatUserResponse(user),
                token,
            };
            console.log('Login response:', {
                userId: response.user.id,
                email: response.user.email,
                roles: response.user.roles
            });
            return response;
        }
        catch (error) {
            console.error('Login error:', {
                email: credentials.email,
                error: error instanceof Error ? error.message : 'Unknown error',
            });
            throw error;
        }
    }
    generateToken(user, role) {
        try {
            return jsonwebtoken_1.default.sign({
                userId: user.user_id.toString(),
                email: user.email,
                role,
            }, process.env.JWT_SECRET, {
                expiresIn: '24h',
                algorithm: 'HS256'
            });
        }
        catch (error) {
            console.error('Error generating token:', error);
            throw new Error('Failed to generate authentication token');
        }
    }
    formatUserResponse(user) {
        return {
            id: user.user_id.toString(),
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            roles: user.user_roles.map((ur) => ur.roles.role_name.toUpperCase()),
        };
    }
}
exports.AuthService = AuthService;
