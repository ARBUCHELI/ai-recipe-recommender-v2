import { Router } from 'express';
import { authenticate } from '../middleware/auth';

const router = Router();

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', authenticate, (req, res) => {
  res.json({
    success: true,
    message: 'User profile endpoint',
    user: req.user
  });
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', authenticate, (req, res) => {
  res.json({
    success: true,
    message: 'Update user profile endpoint - Coming soon'
  });
});

export default router;