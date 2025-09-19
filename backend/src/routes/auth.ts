import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { upload, processAvatarImage } from '../middleware/upload';
import { UserService } from '../services/userService';
import { cleanupOldAvatar } from '../middleware/upload';
import bcrypt from 'bcrypt';

const router = Router();
const authController = new AuthController();

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', authController.register);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', authController.login);

// @route   POST /api/auth/google/callback
// @desc    Google OAuth callback
// @access  Public
router.post('/google/callback', authController.googleCallback);

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', authenticate, authController.getCurrentUser);

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', authenticate, async (req, res) => {
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

    const result = await UserService.updateProfile(userId, { name, email });
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Profile updated successfully',
        user: result.user
      });
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
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
router.put('/password', authenticate, async (req, res) => {
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
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword }
    });

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
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
router.post('/avatar', authenticate, upload.single('avatar'), processAvatarImage, async (req, res) => {
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
    const userProfile = await UserService.getUserProfile(userId);
    const oldAvatarUrl = userProfile.user?.avatarUrl;

    // Update user avatar URL in database
    const result = await UserService.updateAvatar(userId, processedFile.avatarUrl);
    
    if (result.success) {
      // Clean up old avatar file
      if (oldAvatarUrl) {
        cleanupOldAvatar(oldAvatarUrl);
      }

      res.json({
        success: true,
        message: 'Avatar uploaded successfully',
        avatarUrl: result.avatarUrl,
        user: result.user
      });
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
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
router.delete('/avatar', authenticate, async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const result = await UserService.removeAvatar(userId);
    
    if (result.success) {
      // Clean up old avatar file
      if (result.oldAvatarUrl) {
        cleanupOldAvatar(result.oldAvatarUrl);
      }

      res.json({
        success: true,
        message: 'Avatar removed successfully',
        user: result.user
      });
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
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
router.get('/preferences', authenticate, async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const result = await UserService.getPreferences(userId);
    
    if (result.success) {
      res.json({
        success: true,
        preferences: result.preferences
      });
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
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
router.put('/preferences', authenticate, async (req, res) => {
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

    const result = await UserService.updatePreferences(userId, preferencesData);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Preferences updated successfully',
        preferences: result.preferences
      });
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
