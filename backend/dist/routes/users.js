"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', auth_1.authenticate, (req, res) => {
    res.json({
        success: true,
        message: 'User profile endpoint',
        user: req.user
    });
});
// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth_1.authenticate, (req, res) => {
    res.json({
        success: true,
        message: 'Update user profile endpoint - Coming soon'
    });
});
exports.default = router;
//# sourceMappingURL=users.js.map