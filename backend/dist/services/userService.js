"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class UserService {
    // Update user profile information
    static async updateProfile(userId, profileData) {
        try {
            const updatedUser = await prisma.user.update({
                where: { id: userId },
                data: {
                    name: profileData.name,
                    email: profileData.email,
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    avatarUrl: true,
                    createdAt: true,
                    updatedAt: true,
                },
            });
            return { success: true, user: updatedUser };
        }
        catch (error) {
            console.error('Profile update error:', error);
            // Handle unique constraint violation for email
            if (error instanceof Error && error.message.includes('Unique constraint')) {
                return {
                    success: false,
                    message: 'Email address is already in use by another account'
                };
            }
            return {
                success: false,
                message: 'Failed to update profile'
            };
        }
    }
    // Update user avatar URL
    static async updateAvatar(userId, avatarUrl) {
        try {
            const updatedUser = await prisma.user.update({
                where: { id: userId },
                data: { avatarUrl },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    avatarUrl: true,
                    createdAt: true,
                    updatedAt: true,
                },
            });
            return { success: true, user: updatedUser, avatarUrl };
        }
        catch (error) {
            console.error('Avatar update error:', error);
            return {
                success: false,
                message: 'Failed to update avatar'
            };
        }
    }
    // Remove user avatar
    static async removeAvatar(userId) {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { avatarUrl: true },
            });
            const updatedUser = await prisma.user.update({
                where: { id: userId },
                data: { avatarUrl: null },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    avatarUrl: true,
                    createdAt: true,
                    updatedAt: true,
                },
            });
            return {
                success: true,
                user: updatedUser,
                oldAvatarUrl: user?.avatarUrl || undefined
            };
        }
        catch (error) {
            console.error('Avatar removal error:', error);
            return {
                success: false,
                message: 'Failed to remove avatar'
            };
        }
    }
    // Get user preferences
    static async getPreferences(userId) {
        try {
            const preferences = await prisma.userPreferences.findUnique({
                where: { userId },
            });
            return { success: true, preferences };
        }
        catch (error) {
            console.error('Get preferences error:', error);
            return {
                success: false,
                message: 'Failed to retrieve preferences',
                preferences: null
            };
        }
    }
    // Update or create user preferences
    static async updatePreferences(userId, preferencesData) {
        try {
            const preferences = await prisma.userPreferences.upsert({
                where: { userId },
                update: {
                    dietaryRestrictions: preferencesData.dietaryRestrictions,
                    allergies: preferencesData.allergies,
                    favoriteCuisines: preferencesData.favoriteCuisines,
                    dislikedCuisines: preferencesData.dislikedCuisines,
                    cookingSkillLevel: preferencesData.cookingSkillLevel,
                    preferredMealTypes: preferencesData.preferredMealTypes,
                    maxCookingTime: preferencesData.maxCookingTime,
                    servingSize: preferencesData.servingSize,
                    emailNotifications: preferencesData.emailNotifications,
                    pushNotifications: preferencesData.pushNotifications,
                    weeklyRecipeEmails: preferencesData.weeklyRecipeEmails,
                    recipeRecommendations: preferencesData.recipeRecommendations,
                    units: preferencesData.units,
                    language: preferencesData.language,
                    theme: preferencesData.theme,
                },
                create: {
                    userId,
                    dietaryRestrictions: preferencesData.dietaryRestrictions,
                    allergies: preferencesData.allergies,
                    favoriteCuisines: preferencesData.favoriteCuisines,
                    dislikedCuisines: preferencesData.dislikedCuisines,
                    cookingSkillLevel: preferencesData.cookingSkillLevel,
                    preferredMealTypes: preferencesData.preferredMealTypes,
                    maxCookingTime: preferencesData.maxCookingTime,
                    servingSize: preferencesData.servingSize,
                    emailNotifications: preferencesData.emailNotifications,
                    pushNotifications: preferencesData.pushNotifications,
                    weeklyRecipeEmails: preferencesData.weeklyRecipeEmails,
                    recipeRecommendations: preferencesData.recipeRecommendations,
                    units: preferencesData.units,
                    language: preferencesData.language,
                    theme: preferencesData.theme,
                },
            });
            return { success: true, preferences };
        }
        catch (error) {
            console.error('Update preferences error:', error);
            return {
                success: false,
                message: 'Failed to update preferences'
            };
        }
    }
    // Get full user profile with preferences
    static async getUserProfile(userId) {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    avatarUrl: true,
                    createdAt: true,
                    updatedAt: true,
                    preferences: true,
                },
            });
            if (!user) {
                return { success: false, message: 'User not found' };
            }
            return { success: true, user };
        }
        catch (error) {
            console.error('Get user profile error:', error);
            return {
                success: false,
                message: 'Failed to retrieve user profile'
            };
        }
    }
}
exports.UserService = UserService;
//# sourceMappingURL=userService.js.map