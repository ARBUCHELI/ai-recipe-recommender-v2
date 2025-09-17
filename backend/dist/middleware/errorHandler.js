"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const library_1 = require("@prisma/client/runtime/library");
const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;
    console.error(`Error: ${err.message}`);
    // Prisma validation error
    if (err instanceof library_1.PrismaClientKnownRequestError) {
        if (err.code === 'P2002') {
            const message = 'Duplicate field value entered';
            error = { statusCode: 400, message };
        }
        else if (err.code === 'P2025') {
            const message = 'Record not found';
            error = { statusCode: 404, message };
        }
        else {
            const message = 'Database error';
            error = { statusCode: 400, message };
        }
    }
    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const message = 'Validation Error';
        error = { statusCode: 400, message };
    }
    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        const message = 'Invalid token';
        error = { statusCode: 401, message };
    }
    if (err.name === 'TokenExpiredError') {
        const message = 'Token expired';
        error = { statusCode: 401, message };
    }
    // Default error
    res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map