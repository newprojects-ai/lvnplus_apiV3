"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../lib/prisma"));
const authenticate = async (req, res, next) => {
    try {
        const token = extractToken(req);
        console.log('Authentication Middleware - Token:', token ? 'Present' : 'Missing');
        if (!token) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Authentication required'
            });
        }
        if (!process.env.JWT_SECRET) {
            return res.status(500).json({
                error: 'Internal server error',
                message: 'Authentication configuration error'
            });
        }
        let decoded;
        try {
            decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            console.log('Authentication Middleware - Token decoded:', JSON.stringify(decoded, null, 2));
        }
        catch (error) {
            const message = error instanceof jsonwebtoken_1.default.TokenExpiredError
                ? 'Token expired'
                : 'Invalid token';
            return res.status(401).json({
                error: 'Unauthorized',
                message
            });
        }
        const userId = decoded.userId ? BigInt(decoded.userId) : null;
        const userEmail = decoded.email;
        if (!userId && !userEmail) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Invalid token format'
            });
        }
        const user = await prisma_1.default.users.findFirst({
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
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'User not found'
            });
        }
        req.user = {
            id: user.user_id,
            email: user.email,
            roles: user.user_roles.map(ur => ur.roles.role_name)
        };
        next();
    }
    catch (error) {
        console.error('Authentication Middleware - Unexpected error:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: 'Authentication error'
        });
    }
};
exports.authenticate = authenticate;
function extractToken(req) {
    if (req.headers.authorization?.startsWith('Bearer ')) {
        return req.headers.authorization.substring(7);
    }
    return req.cookies?.token || null;
}
