import { recipeService, CreateRecipeData } from '@/services/recipeService';
import { LocalStorageService } from '@/utils/localStorage';
import { UserHealthProfile, PersonalizedMealPlan } from '../types/HealthProfile';
import { HealthCalculationService } from './healthCalculationService';

interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
  category: string;
}

interface Recipe {
  id: string;
  name: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  prepTime: number;
  cookTime: number;
  servings: number;
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

interface MealPlan {
  id: string;
  name: string;
  days: number;
  recipes: Recipe[];
  totalNutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

// Mock AI service for now - will integrate with HuggingFace later
export class AIService {
  private static instance: AIService;
  
  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  /**
   * Save a generated recipe to the backend
   */
  async saveGeneratedRecipe(recipe: Recipe): Promise<{ success: boolean; savedRecipe?: any; message?: string }> {
    console.log('💾 Starting to save generated recipe:', recipe);
    
    try {
      const createData: CreateRecipeData = {
        name: recipe.name,
        description: recipe.description,
        prepTime: recipe.prepTime,
        cookTime: recipe.cookTime,
        servings: recipe.servings,
        difficulty: 'easy', // Default difficulty for AI-generated recipes
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        nutrition: recipe.nutrition,
        tags: ['ai-generated'], // Mark as AI-generated
        isPublic: false // Private by default
      };
      
      console.log('📝 Prepared create data for backend:', createData);

      const result = await recipeService.createRecipe(createData);
      console.log('📨 Backend response:', result);
      
      if (result.success && result.recipe) {
        console.log('✅ Recipe saved successfully to backend');
        // Also add to local history for quick access
        LocalStorageService.addRecipeToHistory(result.recipe.id);
        
        return {
          success: true,
          savedRecipe: result.recipe
        };
      } else {
        console.error('❌ Backend returned error:', result.message);
        return {
          success: false,
          message: result.message || 'Failed to save recipe'
        };
      }
    } catch (error) {
      console.error('❌ Error saving generated recipe:', error);
      return {
        success: false,
        message: 'An error occurred while saving the recipe'
      };
    }
  }

  async generateRecipe(ingredients: Ingredient[], autoSave: boolean = false): Promise<Recipe> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const ingredientNames = ingredients.map(ing => ing.name);
    const mainIngredient = ingredientNames[0] || 'vegetables';
    
    const recipe = {
      id: `recipe-${Date.now()}`,
      name: `Delicious ${mainIngredient.charAt(0).toUpperCase() + mainIngredient.slice(1)} Dish`,
      description: `A flavorful recipe featuring ${ingredientNames.slice(0, 3).join(', ')} and more fresh ingredients.`,
      ingredients: [
        ...ingredients.map(ing => `${ing.quantity} ${ing.unit} ${ing.name}`),
        "2 tbsp olive oil",
        "Salt and pepper to taste",
        "1 tsp herbs (thyme or oregano)"
      ],
      instructions: [
        "Prepare all ingredients by washing and chopping as needed.",
        `Heat olive oil in a large pan over medium heat.`,
        `Add ${ingredientNames[0]} and cook for 3-4 minutes until slightly softened.`,
        `Add remaining ingredients and season with salt, pepper, and herbs.`,
        "Cook for 10-15 minutes, stirring occasionally, until tender.",
        "Taste and adjust seasoning as needed.",
        "Serve hot and enjoy your delicious meal!"
      ],
      prepTime: 15,
      cookTime: 20,
      servings: 4,
      nutrition: {
        calories: Math.floor(Math.random() * 200) + 300,
        protein: Math.floor(Math.random() * 20) + 15,
        carbs: Math.floor(Math.random() * 30) + 25,
        fat: Math.floor(Math.random() * 15) + 10
      }
    };

    console.log('🔄 Recipe generated, checking auto-save...', { autoSave, recipe });
    
    // Auto-save if requested
    if (autoSave) {
      console.log('💾 Auto-save is enabled, saving recipe...');
      try {
        const saveResult = await this.saveGeneratedRecipe(recipe);
        console.log('💾 Save result:', saveResult);
        
        if (saveResult.success && saveResult.savedRecipe) {
          console.log('✅ Auto-save successful, returning saved recipe');
          // Return the saved recipe with database ID
          return saveResult.savedRecipe;
        } else {
          console.error('❌ Auto-save failed, returning generated recipe:', saveResult.message);
        }
      } catch (error) {
        console.error('❌ Auto-save failed with error, returning generated recipe:', error);
      }
    } else {
      console.log('🚫 Auto-save disabled, returning generated recipe');
    }

    return recipe;
  }

  async generateMealPlan(ingredients: Ingredient[], days: number = 3, autoSave: boolean = false): Promise<MealPlan> {
    // Generate multiple recipes for the meal plan
    const recipes: Recipe[] = [];
    
    for (let i = 0; i < days; i++) {
      const recipe = await this.generateRecipe(ingredients, autoSave); // Pass autoSave to individual recipes
      recipe.id = `meal-plan-recipe-${i}-${Date.now()}`;
      recipe.name = `Day ${i + 1}: ${recipe.name}`;
      recipes.push(recipe);
    }
    
    // Calculate total nutrition
    const totalNutrition = recipes.reduce((total, recipe) => ({
      calories: total.calories + recipe.nutrition.calories,
      protein: total.protein + recipe.nutrition.protein,
      carbs: total.carbs + recipe.nutrition.carbs,
      fat: total.fat + recipe.nutrition.fat
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

    const mealPlan = {
      id: `meal-plan-${Date.now()}`,
      name: `${days}-Day Meal Plan`,
      days,
      recipes,
      totalNutrition
    };

    // Add meal plan to history if auto-save is enabled
    if (autoSave) {
      LocalStorageService.addMealPlanToHistory(mealPlan.id);
    }

    return mealPlan;
  }

  /**
   * Generate personalized meal plans based on user's health profile
   */
  async generatePersonalizedMealPlans(healthProfile: UserHealthProfile, autoSave: boolean = false): Promise<PersonalizedMealPlan> {
    console.log('🎯 Generating personalized meal plans for health profile:', healthProfile);
    
    // Calculate nutritional targets
    const nutritionTargets = HealthCalculationService.calculateNutritionTargets(healthProfile);
    
    // Generate meal plans for each meal type
    const breakfastPlan = await this.generateMealForType('breakfast', nutritionTargets, healthProfile, autoSave);
    const lunchPlan = await this.generateMealForType('lunch', nutritionTargets, healthProfile, autoSave);
    const dinnerPlan = await this.generateMealForType('dinner', nutritionTargets, healthProfile, autoSave);
    
    const personalizedPlan: PersonalizedMealPlan = {
      id: `personalized-plan-${Date.now()}`,
      userId: healthProfile.userId,
      createdAt: new Date().toISOString(),
      targetCalories: nutritionTargets.dailyCalories,
      macroTargets: nutritionTargets.macros,
      breakfast: breakfastPlan,
      lunch: lunchPlan,
      dinner: dinnerPlan,
      totalNutrition: {
        calories: breakfastPlan.nutrition.calories + lunchPlan.nutrition.calories + dinnerPlan.nutrition.calories,
        protein: breakfastPlan.nutrition.protein + lunchPlan.nutrition.protein + dinnerPlan.nutrition.protein,
        carbs: breakfastPlan.nutrition.carbs + lunchPlan.nutrition.carbs + dinnerPlan.nutrition.carbs,
        fat: breakfastPlan.nutrition.fat + lunchPlan.nutrition.fat + dinnerPlan.nutrition.fat
      },
      dietaryRestrictions: healthProfile.dietaryRestrictions,
      fitnessGoal: healthProfile.fitnessGoal
    };

    // Save to local history if auto-save enabled
    if (autoSave) {
      LocalStorageService.addPersonalizedPlanToHistory(personalizedPlan.id);
    }

    return personalizedPlan;
  }

  /**
   * Generate a meal recipe tailored for specific meal type and nutritional targets
   */
  private async generateMealForType(
    mealType: 'breakfast' | 'lunch' | 'dinner',
    nutritionTargets: any,
    healthProfile: UserHealthProfile,
    autoSave: boolean
  ): Promise<Recipe> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Calculate meal-specific calorie targets (breakfast: 25%, lunch: 35%, dinner: 40%)
    const mealCalorieDistribution = { breakfast: 0.25, lunch: 0.35, dinner: 0.40 };
    const targetCalories = Math.round(nutritionTargets.dailyCalories * mealCalorieDistribution[mealType]);
    
    // Adjust macros for meal type
    const targetProtein = Math.round(nutritionTargets.macros.protein * mealCalorieDistribution[mealType]);
    const targetCarbs = Math.round(nutritionTargets.macros.carbs * mealCalorieDistribution[mealType]);
    const targetFat = Math.round(nutritionTargets.macros.fat * mealCalorieDistribution[mealType]);

    // Generate meal-specific recipes based on type and dietary restrictions
    const recipe = this.createMealRecipe(mealType, targetCalories, targetProtein, targetCarbs, targetFat, healthProfile);

    // Auto-save individual meals if requested
    if (autoSave) {
      try {
        const saveResult = await this.saveGeneratedRecipe(recipe);
        if (saveResult.success && saveResult.savedRecipe) {
          return saveResult.savedRecipe;
        }
      } catch (error) {
        console.error(`❌ Failed to save ${mealType} recipe:`, error);
      }
    }

    return recipe;
  }

  /**
   * Create a meal recipe based on meal type and nutritional requirements
   */
  private createMealRecipe(
    mealType: 'breakfast' | 'lunch' | 'dinner',
    targetCalories: number,
    targetProtein: number,
    targetCarbs: number,
    targetFat: number,
    healthProfile: UserHealthProfile
  ): Recipe {
    const mealData = this.getMealTypeData(mealType, healthProfile);
    
    return {
      id: `${mealType}-recipe-${Date.now()}`,
      name: mealData.name,
      description: mealData.description,
      ingredients: mealData.ingredients,
      instructions: mealData.instructions,
      prepTime: mealData.prepTime,
      cookTime: mealData.cookTime,
      servings: 1,
      nutrition: {
        calories: targetCalories,
        protein: targetProtein,
        carbs: targetCarbs,
        fat: targetFat
      }
    };
  }

  /**
   * Get meal-specific data based on type and health profile
   */
  private getMealTypeData(mealType: 'breakfast' | 'lunch' | 'dinner', healthProfile: UserHealthProfile) {
    const isVegetarian = healthProfile.dietaryRestrictions.includes('vegetarian');
    const isVegan = healthProfile.dietaryRestrictions.includes('vegan');
    const isGlutenFree = healthProfile.dietaryRestrictions.includes('gluten-free');
    const isDairyFree = healthProfile.dietaryRestrictions.includes('dairy-free');
    
    const proteinSource = isVegan ? 'plant-based protein' : 
                         isVegetarian ? 'eggs or plant protein' : 
                         'lean protein (chicken, fish, or eggs)';
    
    const grainBase = isGlutenFree ? 'quinoa or rice' : 'whole grains';
    const dairyOption = isDairyFree ? 'plant-based milk' : 'Greek yogurt or milk';

    switch (mealType) {
      case 'breakfast':
        return {
          name: `Power ${isVegan ? 'Plant' : 'Protein'} Breakfast Bowl`,
          description: `A nutritious breakfast featuring ${proteinSource}, ${grainBase}, and fresh fruits to fuel your morning.`,
          ingredients: [
            isVegan ? '1/2 cup cooked quinoa' : '2 large eggs or 1/2 cup Greek yogurt',
            '1/2 cup fresh berries (blueberries, strawberries)',
            '1 medium banana, sliced',
            '1 tbsp almond butter or chia seeds',
            isGlutenFree ? '1/4 cup gluten-free oats' : '1/4 cup rolled oats',
            '1 tsp honey or maple syrup',
            isDairyFree ? '1/2 cup almond milk' : '1/2 cup milk',
            '1/4 tsp cinnamon'
          ],
          instructions: [
            'Prepare your protein base (cook eggs, warm quinoa, or portion yogurt).',
            'In a bowl, layer the protein base with oats.',
            'Top with sliced banana and fresh berries.',
            'Drizzle with almond butter and honey.',
            'Add a splash of milk and sprinkle with cinnamon.',
            'Mix gently and enjoy your power-packed breakfast!'
          ],
          prepTime: 10,
          cookTime: 5
        };
        
      case 'lunch':
        return {
          name: `Mediterranean ${isVegan ? 'Veggie' : 'Protein'} Bowl`,
          description: `A balanced lunch with ${proteinSource}, colorful vegetables, and healthy fats for sustained energy.`,
          ingredients: [
            isVegan ? '1/2 cup chickpeas or lentils' : '4 oz grilled chicken or salmon',
            '1 cup mixed greens (spinach, arugula)',
            '1/2 cup cherry tomatoes',
            '1/4 cup cucumber, diced',
            '1/4 avocado, sliced',
            isGlutenFree ? '1/3 cup cooked quinoa' : '1/3 cup whole grain couscous',
            '2 tbsp olive oil',
            '1 tbsp lemon juice',
            '1 tsp herbs (oregano, basil)',
            isDairyFree ? '2 tbsp nutritional yeast' : '2 tbsp feta cheese'
          ],
          instructions: [
            'Cook and season your protein source.',
            'Prepare the grain base according to package instructions.',
            'Wash and chop all vegetables.',
            'In a large bowl, combine greens, tomatoes, cucumber, and grain.',
            'Top with protein and avocado slices.',
            'Whisk olive oil, lemon juice, and herbs for dressing.',
            'Drizzle dressing over bowl and add cheese or nutritional yeast.',
            'Toss gently and serve immediately.'
          ],
          prepTime: 15,
          cookTime: 10
        };
        
      case 'dinner':
        return {
          name: `Hearty ${isVegan ? 'Plant-Based' : 'Balanced'} Dinner`,
          description: `A satisfying dinner with ${proteinSource}, roasted vegetables, and complex carbohydrates.`,
          ingredients: [
            isVegan ? '3/4 cup cooked lentils or tofu' : '5 oz lean protein (fish, chicken, or turkey)',
            '1 cup roasted vegetables (broccoli, bell peppers, zucchini)',
            isGlutenFree ? '2/3 cup sweet potato or rice' : '2/3 cup whole grain pasta or rice',
            '2 tbsp olive oil',
            '2 cloves garlic, minced',
            '1 tsp herbs (thyme, rosemary)',
            '1/4 cup vegetable broth',
            'Salt and pepper to taste',
            '1 tbsp fresh parsley'
          ],
          instructions: [
            'Preheat oven to 425°F (220°C).',
            'Cut vegetables into even pieces and toss with 1 tbsp olive oil, salt, and pepper.',
            'Roast vegetables for 20-25 minutes until tender.',
            'Cook grain or pasta according to package instructions.',
            'Season and cook protein source until done.',
            'In a large pan, heat remaining oil and sauté garlic.',
            'Add cooked grain, roasted vegetables, and protein to pan.',
            'Add broth and herbs, toss to combine.',
            'Garnish with fresh parsley and serve hot.'
          ],
          prepTime: 20,
          cookTime: 25
        };
    }
  }
}

export type { Recipe, MealPlan, Ingredient };
