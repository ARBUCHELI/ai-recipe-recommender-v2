import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { IngredientService } from '../services/ingredientService';

const router = Router();
const ingredientService = new IngredientService();

// @route   GET /api/ingredients/suggestions
// @desc    Get ingredient suggestions
// @access  Private
router.get('/suggestions', authenticate, async (req, res) => {
  try {
    const search = req.query.search as string;
    const category = req.query.category as string;

    const result = await ingredientService.getIngredientSuggestions(search, category);

    if (result.success) {
      res.json({
        success: true,
        ingredients: result.ingredients,
        count: result.count
      });
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Get ingredient suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/ingredients/categories
// @desc    Get all ingredient categories
// @access  Private
router.get('/categories', authenticate, async (req, res) => {
  try {
    const result = await ingredientService.getIngredientCategories();

    if (result.success) {
      res.json({
        success: true,
        categories: result.categories
      });
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Get ingredient categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/ingredients/search
// @desc    Search ingredients
// @access  Private
router.get('/search', authenticate, async (req, res) => {
  try {
    const query = req.query.q as string;
    const category = req.query.category as string;
    const limit = parseInt(req.query.limit as string) || 20;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const result = await ingredientService.searchIngredients(query, category, limit);

    if (result.success) {
      res.json({
        success: true,
        ingredients: result.ingredients,
        count: result.count
      });
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Search ingredients error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/ingredients/:id
// @desc    Get ingredient by ID
// @access  Private
router.get('/:id', authenticate, async (req, res) => {
  try {
    const result = await ingredientService.getIngredientById(req.params.id);

    if (result.success) {
      res.json({
        success: true,
        ingredient: result.ingredient
      });
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    console.error('Get ingredient by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   POST /api/ingredients
// @desc    Create a new global ingredient
// @access  Private
router.post('/', authenticate, async (req, res) => {
  try {
    const result = await ingredientService.createGlobalIngredient(req.body);

    if (result.success) {
      res.status(201).json({
        success: true,
        message: 'Ingredient created successfully',
        ingredient: result.ingredient
      });
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Create ingredient error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   POST /api/ingredients/seed
// @desc    Seed initial ingredients (admin/development endpoint)
// @access  Private
router.post('/seed', authenticate, async (req, res) => {
  try {
    const result = await ingredientService.seedInitialIngredients();

    if (result.success) {
      res.json({
        success: true,
        message: 'Initial ingredients seeded successfully',
        count: result.count
      });
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Seed ingredients error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;