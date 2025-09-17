import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface CreateRecipeData {
  name: string;
  description?: string;
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  difficulty?: string;
  cuisine?: string;
  ingredients: any[]; // JSON array of ingredients
  instructions: any[]; // JSON array of instructions
  nutrition?: any; // JSON object for nutrition data
  tags?: string[];
  isPublic?: boolean;
}

interface UpdateRecipeData extends Partial<CreateRecipeData> {}

interface RecipeResponse {
  success: boolean;
  recipe?: any;
  recipes?: any[];
  message?: string;
  count?: number;
}

export class RecipeService {
  /**
   * Create a new recipe for a user
   */
  async createRecipe(userId: string, data: CreateRecipeData): Promise<RecipeResponse> {
    try {
      // Validate required fields
      if (!data.name || !data.ingredients || !data.instructions) {
        return {
          success: false,
          message: 'Name, ingredients, and instructions are required'
        };
      }

      if (!Array.isArray(data.ingredients) || data.ingredients.length === 0) {
        return {
          success: false,
          message: 'At least one ingredient is required'
        };
      }

      if (!Array.isArray(data.instructions) || data.instructions.length === 0) {
        return {
          success: false,
          message: 'At least one instruction is required'
        };
      }

      // Verify user exists
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      // Create the recipe
      const recipe = await prisma.recipe.create({
        data: {
          name: data.name,
          description: data.description || null,
          prepTime: data.prepTime || null,
          cookTime: data.cookTime || null,
          servings: data.servings || null,
          difficulty: data.difficulty || null,
          cuisine: data.cuisine || null,
          ingredients: data.ingredients,
          instructions: data.instructions,
          nutrition: data.nutrition || null,
          tags: data.tags || [],
          isPublic: data.isPublic || false,
          userId: userId
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          images: true
        }
      });

      return {
        success: true,
        recipe
      };
    } catch (error) {
      console.error('Recipe creation error:', error);
      return {
        success: false,
        message: 'An error occurred while creating the recipe'
      };
    }
  }

  /**
   * Get all recipes for a user
   */
  async getUserRecipes(
    userId: string, 
    page: number = 1, 
    limit: number = 10,
    search?: string,
    tags?: string[],
    difficulty?: string,
    cuisine?: string
  ): Promise<RecipeResponse> {
    try {
      const skip = (page - 1) * limit;
      
      // Build filter conditions
      const where: any = {
        userId: userId
      };

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { cuisine: { contains: search, mode: 'insensitive' } }
        ];
      }

      if (tags && tags.length > 0) {
        // For SQLite with JSON, we need to use string_contains for each tag
        where.AND = tags.map(tag => ({
          tags: {
            string_contains: `"${tag}"`
          }
        }));
      }

      if (difficulty) {
        where.difficulty = difficulty;
      }

      if (cuisine) {
        where.cuisine = { contains: cuisine, mode: 'insensitive' };
      }

      // Get recipes with pagination
      const [recipes, totalCount] = await Promise.all([
        prisma.recipe.findMany({
          where,
          skip,
          take: limit,
          orderBy: {
            createdAt: 'desc'
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            images: true
          }
        }),
        prisma.recipe.count({ where })
      ]);

      return {
        success: true,
        recipes,
        count: totalCount
      };
    } catch (error) {
      console.error('Get user recipes error:', error);
      return {
        success: false,
        message: 'An error occurred while fetching recipes'
      };
    }
  }

  /**
   * Get a specific recipe by ID (only if it belongs to the user or is public)
   */
  async getRecipeById(recipeId: string, userId: string): Promise<RecipeResponse> {
    try {
      const recipe = await prisma.recipe.findFirst({
        where: {
          id: recipeId,
          OR: [
            { userId: userId },
            { isPublic: true }
          ]
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          images: true
        }
      });

      if (!recipe) {
        return {
          success: false,
          message: 'Recipe not found or access denied'
        };
      }

      return {
        success: true,
        recipe
      };
    } catch (error) {
      console.error('Get recipe by ID error:', error);
      return {
        success: false,
        message: 'An error occurred while fetching the recipe'
      };
    }
  }

  /**
   * Update a recipe (only if it belongs to the user)
   */
  async updateRecipe(recipeId: string, userId: string, data: UpdateRecipeData): Promise<RecipeResponse> {
    try {
      // Check if recipe exists and belongs to user
      const existingRecipe = await prisma.recipe.findFirst({
        where: {
          id: recipeId,
          userId: userId
        }
      });

      if (!existingRecipe) {
        return {
          success: false,
          message: 'Recipe not found or access denied'
        };
      }

      // Validate arrays if provided
      if (data.ingredients !== undefined && (!Array.isArray(data.ingredients) || data.ingredients.length === 0)) {
        return {
          success: false,
          message: 'At least one ingredient is required'
        };
      }

      if (data.instructions !== undefined && (!Array.isArray(data.instructions) || data.instructions.length === 0)) {
        return {
          success: false,
          message: 'At least one instruction is required'
        };
      }

      // Update the recipe
      const recipe = await prisma.recipe.update({
        where: {
          id: recipeId
        },
        data: {
          ...(data.name && { name: data.name }),
          ...(data.description !== undefined && { description: data.description }),
          ...(data.prepTime !== undefined && { prepTime: data.prepTime }),
          ...(data.cookTime !== undefined && { cookTime: data.cookTime }),
          ...(data.servings !== undefined && { servings: data.servings }),
          ...(data.difficulty !== undefined && { difficulty: data.difficulty }),
          ...(data.cuisine !== undefined && { cuisine: data.cuisine }),
          ...(data.ingredients && { ingredients: data.ingredients }),
          ...(data.instructions && { instructions: data.instructions }),
          ...(data.nutrition !== undefined && { nutrition: data.nutrition }),
          ...(data.tags !== undefined && { tags: data.tags }),
          ...(data.isPublic !== undefined && { isPublic: data.isPublic })
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          images: true
        }
      });

      return {
        success: true,
        recipe
      };
    } catch (error) {
      console.error('Recipe update error:', error);
      return {
        success: false,
        message: 'An error occurred while updating the recipe'
      };
    }
  }

  /**
   * Delete a recipe (only if it belongs to the user)
   */
  async deleteRecipe(recipeId: string, userId: string): Promise<RecipeResponse> {
    try {
      // Check if recipe exists and belongs to user
      const existingRecipe = await prisma.recipe.findFirst({
        where: {
          id: recipeId,
          userId: userId
        }
      });

      if (!existingRecipe) {
        return {
          success: false,
          message: 'Recipe not found or access denied'
        };
      }

      // Delete the recipe (cascade will handle related images)
      await prisma.recipe.delete({
        where: {
          id: recipeId
        }
      });

      return {
        success: true,
        message: 'Recipe deleted successfully'
      };
    } catch (error) {
      console.error('Recipe deletion error:', error);
      return {
        success: false,
        message: 'An error occurred while deleting the recipe'
      };
    }
  }

  /**
   * Get public recipes (for discovery)
   */
  async getPublicRecipes(
    page: number = 1, 
    limit: number = 10,
    search?: string,
    tags?: string[],
    difficulty?: string,
    cuisine?: string
  ): Promise<RecipeResponse> {
    try {
      const skip = (page - 1) * limit;
      
      // Build filter conditions
      const where: any = {
        isPublic: true
      };

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { cuisine: { contains: search, mode: 'insensitive' } }
        ];
      }

      if (tags && tags.length > 0) {
        // For SQLite with JSON, we need to use string_contains for each tag
        where.AND = tags.map(tag => ({
          tags: {
            string_contains: `"${tag}"`
          }
        }));
      }

      if (difficulty) {
        where.difficulty = difficulty;
      }

      if (cuisine) {
        where.cuisine = { contains: cuisine, mode: 'insensitive' };
      }

      // Get recipes with pagination
      const [recipes, totalCount] = await Promise.all([
        prisma.recipe.findMany({
          where,
          skip,
          take: limit,
          orderBy: {
            createdAt: 'desc'
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            images: true
          }
        }),
        prisma.recipe.count({ where })
      ]);

      return {
        success: true,
        recipes,
        count: totalCount
      };
    } catch (error) {
      console.error('Get public recipes error:', error);
      return {
        success: false,
        message: 'An error occurred while fetching public recipes'
      };
    }
  }

  /**
   * Get recipe statistics for a user
   */
  async getUserRecipeStats(userId: string): Promise<RecipeResponse & { stats?: any }> {
    try {
      const [
        totalRecipes,
        publicRecipes,
        recentRecipes,
        cuisineStats,
        difficultyStats
      ] = await Promise.all([
        prisma.recipe.count({
          where: { userId }
        }),
        prisma.recipe.count({
          where: { userId, isPublic: true }
        }),
        prisma.recipe.count({
          where: {
            userId,
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
            }
          }
        }),
        prisma.recipe.groupBy({
          by: ['cuisine'],
          where: { userId, cuisine: { not: null } },
          _count: {
            id: true
          }
        }),
        prisma.recipe.groupBy({
          by: ['difficulty'],
          where: { userId, difficulty: { not: null } },
          _count: {
            id: true
          }
        })
      ]);

      const stats = {
        totalRecipes,
        publicRecipes,
        privateRecipes: totalRecipes - publicRecipes,
        recentRecipes,
        cuisineDistribution: cuisineStats.map(item => ({
          cuisine: item.cuisine,
          count: item._count.id
        })),
        difficultyDistribution: difficultyStats.map(item => ({
          difficulty: item.difficulty,
          count: item._count.id
        }))
      };

      return {
        success: true,
        stats
      };
    } catch (error) {
      console.error('Get user recipe stats error:', error);
      return {
        success: false,
        message: 'An error occurred while fetching recipe statistics'
      };
    }
  }
}

export default RecipeService;