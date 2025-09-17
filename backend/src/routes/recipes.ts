import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { RecipeService } from '../services/recipeService';

const router = Router();
const recipeService = new RecipeService();

// All routes are protected and require authentication

// @route   GET /api/recipes
// @desc    Get all user recipes
// @access  Private
router.get('/', authenticate, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Extract query parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const tags = req.query.tags ? (req.query.tags as string).split(',') : undefined;
    const difficulty = req.query.difficulty as string;
    const cuisine = req.query.cuisine as string;

    const result = await recipeService.getUserRecipes(
      userId,
      page,
      limit,
      search,
      tags,
      difficulty,
      cuisine
    );

    if (result.success) {
      res.json({
        success: true,
        recipes: result.recipes,
        count: result.count,
        page,
        limit
      });
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Get recipes error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   POST /api/recipes
// @desc    Create a new recipe
// @access  Private
router.post('/', authenticate, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const result = await recipeService.createRecipe(userId, req.body);

    if (result.success) {
      res.status(201).json({
        success: true,
        message: 'Recipe created successfully',
        recipe: result.recipe
      });
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Create recipe error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/recipes/public
// @desc    Get public recipes for discovery
// @access  Private
router.get('/public', authenticate, async (req, res) => {
  try {
    // Extract query parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const tags = req.query.tags ? (req.query.tags as string).split(',') : undefined;
    const difficulty = req.query.difficulty as string;
    const cuisine = req.query.cuisine as string;

    const result = await recipeService.getPublicRecipes(
      page,
      limit,
      search,
      tags,
      difficulty,
      cuisine
    );

    if (result.success) {
      res.json({
        success: true,
        recipes: result.recipes,
        count: result.count,
        page,
        limit
      });
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Get public recipes error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/recipes/stats
// @desc    Get user recipe statistics
// @access  Private
router.get('/stats', authenticate, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const result = await recipeService.getUserRecipeStats(userId);

    if (result.success) {
      res.json({
        success: true,
        stats: result.stats
      });
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Get recipe stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/recipes/:id
// @desc    Get recipe by ID
// @access  Private
router.get('/:id', authenticate, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const result = await recipeService.getRecipeById(req.params.id, userId);

    if (result.success) {
      res.json({
        success: true,
        recipe: result.recipe
      });
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    console.error('Get recipe by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   PUT /api/recipes/:id
// @desc    Update recipe
// @access  Private
router.put('/:id', authenticate, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const result = await recipeService.updateRecipe(req.params.id, userId, req.body);

    if (result.success) {
      res.json({
        success: true,
        message: 'Recipe updated successfully',
        recipe: result.recipe
      });
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Update recipe error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   DELETE /api/recipes/:id
// @desc    Delete recipe
// @access  Private
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const result = await recipeService.deleteRecipe(req.params.id, userId);

    if (result.success) {
      res.json({
        success: true,
        message: 'Recipe deleted successfully'
      });
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Delete recipe error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
