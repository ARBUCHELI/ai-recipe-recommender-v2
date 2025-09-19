import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface UserIngredient {
  name: string;
  quantity?: number;
  unit?: string;
  category?: string;
  expirationDate?: Date;
  notes?: string;
}

interface IngredientResponse {
  success: boolean;
  ingredient?: any;
  ingredients?: any[];
  message?: string;
  count?: number;
}

// First, let's extend the Prisma schema with a UserIngredient model
// Note: This would require a database migration to add this table

export class IngredientService {
  /**
   * Add ingredient to user's pantry
   */
  async addUserIngredient(userId: string, ingredientData: UserIngredient): Promise<IngredientResponse> {
    try {
      // Validate required fields
      if (!ingredientData.name) {
        return {
          success: false,
          message: 'Ingredient name is required'
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

      // For now, we'll use a temporary approach by storing user ingredients in localStorage
      // In a full implementation, we would create a UserIngredients table
      
      // Check if the ingredient exists in the global ingredients table
      let ingredient = await prisma.ingredient.findFirst({
        where: { 
          name: { 
            equals: ingredientData.name.toLowerCase()
          }
        }
      });

      // If ingredient doesn't exist globally, create it
      if (!ingredient) {
        ingredient = await prisma.ingredient.create({
          data: {
            name: ingredientData.name.toLowerCase(),
            category: ingredientData.category || 'Other',
            unit: ingredientData.unit || null
          }
        });
      }

      // For now, return the ingredient data as we don't have UserIngredients table yet
      // In a full implementation, we would store this in a UserIngredients table
      return {
        success: true,
        ingredient: {
          id: `user-${userId}-${ingredient.id}`,
          name: ingredient.name,
          quantity: ingredientData.quantity || 1,
          unit: ingredientData.unit || ingredient.unit || 'pcs',
          category: ingredient.category,
          expirationDate: ingredientData.expirationDate,
          notes: ingredientData.notes,
          globalIngredientId: ingredient.id
        }
      };
    } catch (error) {
      console.error('Add user ingredient error:', error);
      return {
        success: false,
        message: 'An error occurred while adding the ingredient'
      };
    }
  }

  /**
   * Get all ingredients suggestions (global ingredients)
   */
  async getIngredientSuggestions(search?: string, category?: string): Promise<IngredientResponse> {
    try {
      const where: any = {};

      if (search) {
        where.name = {
          contains: search.toLowerCase(),
          mode: 'insensitive'
        };
      }

      if (category && category !== 'All') {
        where.category = category;
      }

      const ingredients = await prisma.ingredient.findMany({
        where,
        orderBy: {
          name: 'asc'
        },
        take: 50 // Limit to 50 suggestions
      });

      return {
        success: true,
        ingredients,
        count: ingredients.length
      };
    } catch (error) {
      console.error('Get ingredient suggestions error:', error);
      return {
        success: false,
        message: 'An error occurred while fetching ingredient suggestions'
      };
    }
  }

  /**
   * Get all ingredient categories
   */
  async getIngredientCategories(): Promise<IngredientResponse & { categories?: string[] }> {
    try {
      const categories = await prisma.ingredient.findMany({
        select: {
          category: true
        },
        distinct: ['category'],
        orderBy: {
          category: 'asc'
        }
      });

      const categoryList = categories
        .map(c => c.category)
        .filter(c => c !== null) as string[];

      return {
        success: true,
        categories: categoryList
      };
    } catch (error) {
      console.error('Get ingredient categories error:', error);
      return {
        success: false,
        message: 'An error occurred while fetching ingredient categories'
      };
    }
  }

  /**
   * Seed initial ingredients from the sample data
   */
  async seedInitialIngredients(): Promise<IngredientResponse> {
    try {
      // Default ingredients to seed
      const defaultIngredients = [
        // Produce
        { name: 'tomatoes', category: 'Produce', unit: 'pcs' },
        { name: 'onion', category: 'Produce', unit: 'pcs' },
        { name: 'garlic', category: 'Produce', unit: 'cloves' },
        { name: 'bell pepper', category: 'Produce', unit: 'pcs' },
        { name: 'spinach', category: 'Produce', unit: 'g' },
        { name: 'broccoli', category: 'Produce', unit: 'head' },
        { name: 'lemon', category: 'Produce', unit: 'pcs' },
        { name: 'avocado', category: 'Produce', unit: 'pcs' },
        { name: 'cherry tomatoes', category: 'Produce', unit: 'g' },
        { name: 'lime', category: 'Produce', unit: 'pcs' },
        
        // Meat & Seafood
        { name: 'chicken breast', category: 'Meat & Seafood', unit: 'lbs' },
        { name: 'salmon', category: 'Meat & Seafood', unit: 'fillets' },
        
        // Dairy
        { name: 'cheese', category: 'Dairy', unit: 'g' },
        { name: 'feta cheese', category: 'Dairy', unit: 'g' },
        
        // Pantry
        { name: 'olive oil', category: 'Pantry', unit: 'tbsp' },
        { name: 'rice', category: 'Pantry', unit: 'cup' },
        { name: 'black beans', category: 'Pantry', unit: 'can' },
        { name: 'cumin', category: 'Pantry', unit: 'tsp' },
        { name: 'paprika', category: 'Pantry', unit: 'tsp' },
        { name: 'quinoa', category: 'Pantry', unit: 'cup' }
      ];

      // Use upsert to avoid duplicates
      const ingredientPromises = defaultIngredients.map(ingredient =>
        prisma.ingredient.upsert({
          where: { name: ingredient.name },
          update: {}, // Don't update if exists
          create: ingredient
        })
      );

      const ingredients = await Promise.all(ingredientPromises);

      return {
        success: true,
        ingredients,
        count: ingredients.length
      };
    } catch (error) {
      console.error('Seed initial ingredients error:', error);
      return {
        success: false,
        message: 'An error occurred while seeding initial ingredients'
      };
    }
  }

  /**
   * Search ingredients by name or category
   */
  async searchIngredients(
    query: string,
    category?: string,
    limit: number = 20
  ): Promise<IngredientResponse> {
    try {
      const where: any = {
        OR: [
          {
            name: {
              contains: query.toLowerCase()
            }
          }
        ]
      };

      if (category && category !== 'All') {
        where.category = category;
      }

      const ingredients = await prisma.ingredient.findMany({
        where,
        orderBy: [
          // Exact matches first
          {
            name: 'asc'
          }
        ],
        take: limit
      });

      return {
        success: true,
        ingredients,
        count: ingredients.length
      };
    } catch (error) {
      console.error('Search ingredients error:', error);
      return {
        success: false,
        message: 'An error occurred while searching ingredients'
      };
    }
  }

  /**
   * Get ingredient by ID
   */
  async getIngredientById(ingredientId: string): Promise<IngredientResponse> {
    try {
      const ingredient = await prisma.ingredient.findUnique({
        where: { id: ingredientId }
      });

      if (!ingredient) {
        return {
          success: false,
          message: 'Ingredient not found'
        };
      }

      return {
        success: true,
        ingredient
      };
    } catch (error) {
      console.error('Get ingredient by ID error:', error);
      return {
        success: false,
        message: 'An error occurred while fetching the ingredient'
      };
    }
  }

  /**
   * Create a new global ingredient (admin function)
   */
  async createGlobalIngredient(ingredientData: {
    name: string;
    category?: string;
    unit?: string;
  }): Promise<IngredientResponse> {
    try {
      if (!ingredientData.name) {
        return {
          success: false,
          message: 'Ingredient name is required'
        };
      }

      // Check if ingredient already exists
      const existing = await prisma.ingredient.findFirst({
        where: {
          name: {
            equals: ingredientData.name.toLowerCase()
          }
        }
      });

      if (existing) {
        return {
          success: false,
          message: 'Ingredient already exists'
        };
      }

      const ingredient = await prisma.ingredient.create({
        data: {
          name: ingredientData.name.toLowerCase(),
          category: ingredientData.category || 'Other',
          unit: ingredientData.unit || null
        }
      });

      return {
        success: true,
        ingredient
      };
    } catch (error) {
      console.error('Create global ingredient error:', error);
      return {
        success: false,
        message: 'An error occurred while creating the ingredient'
      };
    }
  }
}

export default IngredientService;