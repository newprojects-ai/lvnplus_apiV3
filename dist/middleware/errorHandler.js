"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const client_1 = require("@prisma/client");
const errors_1 = require("../utils/errors");
BigInt.prototype.toJSON = function () {
    return this.toString();
};
const errorHandler = (error, req, res, next) => {
    console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
    if (error instanceof errors_1.UnauthorizedError) {
        return res.status(401).json({
            error: 'Unauthorized',
            message: error.message || 'Authentication required',
        });
    }
    if (error instanceof errors_1.ValidationError) {
        return res.status(400).json({
            error: 'Validation Error',
            message: error.message || 'Invalid input data',
        });
    }
    if (error instanceof errors_1.NotFoundError) {
        return res.status(404).json({
            error: 'Not Found',
            message: error.message || 'Resource not found',
        });
    }
    if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
            case 'P2002':
                return res.status(409).json({
                    error: 'Unique constraint violation',
                    message: 'A record with this data already exists',
                    field: error.meta?.target,
                });
            case 'P2025':
                return res.status(404).json({
                    error: 'Not found',
                    message: 'The requested resource was not found',
                });
            default:
                return res.status(400).json({
                    error: 'Database error',
                    message: process.env.NODE_ENV === 'development' ? `Database error: ${error.code}` : 'Database operation failed',
                });
        }
    }
    if (error instanceof client_1.Prisma.PrismaClientValidationError) {
        return res.status(400).json({
            error: 'Validation Error',
            message: 'Invalid data provided to database operation',
        });
    }
    if (error instanceof TypeError && error.message.includes('serialize a BigInt')) {
        return res.status(500).json({
            error: 'Serialization Error',
            message: 'Unable to serialize BigInt. Please check your data types.',
        });
    }
    return res.status(500).json({
        error: 'Internal server error',
        message: 'An unexpected error occurred',
        ...(process.env.NODE_ENV === 'development' && { details: error.message }),
    });
};
exports.errorHandler = errorHandler;
