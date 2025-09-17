"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const auth_1 = require("../middleware/auth");
const upload_1 = require("../middleware/upload");
const userService_1 = require("../services/userService");
const upload_2 = require("../middleware/upload");
const bcrypt_1 = __importDefault(require("bcrypt"));
const router = (0, express_1.Router)();
const authController = new authController_1.AuthController();
// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', authController.register);
// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', authController.login);
// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth_1.authenticate, authController.getCurrentUser);
// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth_1.authenticate, async (req, res) => {
    try {
        const userId = req.user?.id;
        const { name, email } = req.body;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }
        if (!name || !email) {
            return res.status(400).json({
                success: false,
                message: 'Name and email are required'
            });
        }
        const result = await userService_1.UserService.updateProfile(userId, { name, email });
        if (result.success) {
            res.json({
                success: true,
                message: 'Profile updated successfully',
                user: result.user
            });
        }
        else {
            res.status(400).json(result);
        }
    }
    catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
// @route   PUT /api/auth/password
// @desc    Change user password
// @access  Private
router.put('/password', auth_1.authenticate, async (req, res) => {
    try {
        const userId = req.user?.id;
        const { currentPassword, newPassword } = req.body;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Current password and new password are required'
            });
        }
        // Get user with password for verification
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, password: true }
        });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        // Verify current password
        const isValidPassword = await bcrypt_1.default.compare(currentPassword, user.password);
        if (!isValidPassword) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }
        // Hash new password
        const hashedNewPassword = await bcrypt_1.default.hash(newPassword, 12);
        // Update password
        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedNewPassword }
        });
        res.json({
            success: true,
            message: 'Password changed successfully'
        });
    }
    catch (error) {
        console.error('Password change error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
// @route   POST /api/auth/avatar
// @desc    Upload user avatar
// @access  Private
router.post('/avatar', auth_1.authenticate, upload_1.upload.single('avatar'), upload_1.processAvatarImage, async (req, res) => {
    try {
        const userId = req.user?.id;
        const processedFile = req.processedFile;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }
        if (!processedFile) {
            return res.status(400).json({
                success: false,
                message: 'No file processed'
            });
        }
        // Get old avatar URL for cleanup
        const userProfile = await userService_1.UserService.getUserProfile(userId);
        const oldAvatarUrl = userProfile.user?.avatarUrl;
        // Update user avatar URL in database
        const result = await userService_1.UserService.updateAvatar(userId, processedFile.avatarUrl);
        if (result.success) {
            // Clean up old avatar file
            if (oldAvatarUrl) {
                (0, upload_2.cleanupOldAvatar)(oldAvatarUrl);
            }
            res.json({
                success: true,
                message: 'Avatar uploaded successfully',
                avatarUrl: result.avatarUrl,
                user: result.user
            });
        }
        else {
            res.status(400).json(result);
        }
    }
    catch (error) {
        console.error('Avatar upload error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
// @route   DELETE /api/auth/avatar
// @desc    Remove user avatar
// @access  Private
router.delete('/avatar', auth_1.authenticate, async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }
        const result = await userService_1.UserService.removeAvatar(userId);
        if (result.success) {
            // Clean up old avatar file
            if (result.oldAvatarUrl) {
                (0, upload_2.cleanupOldAvatar)(result.oldAvatarUrl);
            }
            res.json({
                success: true,
                message: 'Avatar removed successfully',
                user: result.user
            });
        }
        else {
            res.status(400).json(result);
        }
    }
    catch (error) {
        console.error('Avatar removal error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
// @route   GET /api/auth/preferences
// @desc    Get user preferences
// @access  Private
router.get('/preferences', auth_1.authenticate, async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }
        const result = await userService_1.UserService.getPreferences(userId);
        if (result.success) {
            res.json({
                success: true,
                preferences: result.preferences
            });
        }
        else {
            res.status(400).json(result);
        }
    }
    catch (error) {
        console.error('Get preferences error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
// @route   PUT /api/auth/preferences
// @desc    Update user preferences
// @access  Private
router.put('/preferences', auth_1.authenticate, async (req, res) => {
    try {
        const userId = req.user?.id;
        const preferencesData = req.body;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }
        // Validate required fields
        const requiredFields = [
            'dietaryRestrictions', 'allergies', 'favoriteCuisines', 'dislikedCuisines',
            'cookingSkillLevel', 'preferredMealTypes', 'maxCookingTime', 'servingSize',
            'emailNotifications', 'pushNotifications', 'weeklyRecipeEmails', 'recipeRecommendations',
            'units', 'language', 'theme'
        ];
        for (const field of requiredFields) {
            if (!(field in preferencesData)) {
                return res.status(400).json({
                    success: false,
                    message: `Missing required field: ${field}`
                });
            }
        }
        const result = await userService_1.UserService.updatePreferences(userId, preferencesData);
        if (result.success) {
            res.json({
                success: true,
                message: 'Preferences updated successfully',
                preferences: result.preferences
            });
        }
        else {
            res.status(400).json(result);
        }
    }
    catch (error) {
        console.error('Update preferences error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map