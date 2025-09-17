"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const authService_1 = require("../services/authService");
const authService = new authService_1.AuthService();
class AuthController {
    async register(req, res) {
        try {
            const { name, email, password } = req.body;
            const result = await authService.register({ name, email, password });
            if (!result.success) {
                return res.status(400).json(result);
            }
            res.status(201).json({
                success: true,
                message: 'User registered successfully',
                user: result.user,
                token: result.token
            });
        }
        catch (error) {
            console.error('Registration controller error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
    async login(req, res) {
        try {
            const { email, password } = req.body;
            const result = await authService.login({ email, password });
            if (!result.success) {
                return res.status(400).json(result);
            }
            res.status(200).json({
                success: true,
                message: 'Login successful',
                user: result.user,
                token: result.token
            });
        }
        catch (error) {
            console.error('Login controller error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
    async getCurrentUser(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'User not authenticated'
                });
            }
            const result = await authService.getCurrentUser(req.user.id);
            if (!result.success) {
                return res.status(404).json(result);
            }
            res.status(200).json({
                success: true,
                user: result.user
            });
        }
        catch (error) {
            console.error('Get current user controller error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=authController.js.map