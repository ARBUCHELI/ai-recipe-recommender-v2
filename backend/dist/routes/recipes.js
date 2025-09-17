"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// All routes are protected and require authentication
// @route   GET /api/recipes
// @desc    Get all user recipes
// @access  Private
router.get('/', auth_1.authenticate, (req, res) => {
    res.json({
        success: true,
        message: 'Get user recipes endpoint - Coming soon',
        recipes: []
    });
});
// @route   POST /api/recipes
// @desc    Create a new recipe
// @access  Private
router.post('/', auth_1.authenticate, (req, res) => {
    res.json({
        success: true,
        message: 'Create recipe endpoint - Coming soon'
    });
});
// @route   GET /api/recipes/:id
// @desc    Get recipe by ID
// @access  Private
router.get('/:id', auth_1.authenticate, (req, res) => {
    res.json({
        success: true,
        message: `Get recipe ${req.params.id} endpoint - Coming soon`
    });
});
// @route   PUT /api/recipes/:id
// @desc    Update recipe
// @access  Private
router.put('/:id', auth_1.authenticate, (req, res) => {
    res.json({
        success: true,
        message: `Update recipe ${req.params.id} endpoint - Coming soon`
    });
});
// @route   DELETE /api/recipes/:id
// @desc    Delete recipe
// @access  Private
router.delete('/:id', auth_1.authenticate, (req, res) => {
    res.json({
        success: true,
        message: `Delete recipe ${req.params.id} endpoint - Coming soon`
    });
});
exports.default = router;
//# sourceMappingURL=recipes.js.map