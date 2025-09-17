"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class AuthService {
    generateToken(userId, email) {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error('JWT_SECRET is not defined');
        }
        return jsonwebtoken_1.default.sign({ id: userId, email }, secret, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
    }
    async register(data) {
        try {
            const { name, email, password } = data;
            // Validation
            if (!name || !email || !password) {
                return {
                    success: false,
                    message: 'Name, email, and password are required'
                };
            }
            if (password.length < 6) {
                return {
                    success: false,
                    message: 'Password must be at least 6 characters long'
                };
            }
            // Check if user already exists
            const existingUser = await prisma.user.findUnique({
                where: { email }
            });
            if (existingUser) {
                return {
                    success: false,
                    message: 'User with this email already exists'
                };
            }
            // Hash password
            const saltRounds = 12;
            const hashedPassword = await bcryptjs_1.default.hash(password, saltRounds);
            // Create user
            const user = await prisma.user.create({
                data: {
                    name,
                    email: email.toLowerCase(),
                    password: hashedPassword
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    avatarUrl: true,
                    createdAt: true
                }
            });
            // Generate token
            const token = this.generateToken(user.id, user.email);
            return {
                success: true,
                user,
                token
            };
        }
        catch (error) {
            console.error('Registration error:', error);
            return {
                success: false,
                message: 'An error occurred during registration'
            };
        }
    }
    async login(data) {
        try {
            const { email, password } = data;
            // Validation
            if (!email || !password) {
                return {
                    success: false,
                    message: 'Email and password are required'
                };
            }
            // Find user
            const user = await prisma.user.findUnique({
                where: { email: email.toLowerCase() }
            });
            if (!user) {
                return {
                    success: false,
                    message: 'Invalid email or password'
                };
            }
            // Check password
            const isPasswordValid = await bcryptjs_1.default.compare(password, user.password);
            if (!isPasswordValid) {
                return {
                    success: false,
                    message: 'Invalid email or password'
                };
            }
            // Generate token
            const token = this.generateToken(user.id, user.email);
            return {
                success: true,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    avatarUrl: user.avatarUrl,
                    createdAt: user.createdAt
                },
                token
            };
        }
        catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                message: 'An error occurred during login'
            };
        }
    }
    async getCurrentUser(userId) {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    avatarUrl: true,
                    createdAt: true
                }
            });
            if (!user) {
                return {
                    success: false,
                    message: 'User not found'
                };
            }
            return {
                success: true,
                user
            };
        }
        catch (error) {
            console.error('Get current user error:', error);
            return {
                success: false,
                message: 'An error occurred while fetching user data'
            };
        }
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=authService.js.map