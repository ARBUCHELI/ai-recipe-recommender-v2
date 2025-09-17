/**
 * Health Profile Types and Interfaces
 * Comprehensive types for user health data, calorie calculations, and meal planning
 */

// Core user health data
export interface UserHealthProfile {
  id?: string;
  userId?: string;
  
  // Basic measurements
  height: number; // in cm
  weight: number; // in kg
  age: number;
  gender: 'male' | 'female' | 'other';
  
  // Activity and goals
  activityLevel: ActivityLevel;
  fitnessGoal: FitnessGoal;
  dietaryRestrictions: string[];
  
  // Health conditions
  healthConditions: string[];
  medications: string[];
  
  // Preferences
  numberOfMeals: number; // 3-6 meals
  wakeUpTime: string; // HH:MM format
  bedTime: string; // HH:MM format
  
  // Calculated values
  bmr?: number; // Basal Metabolic Rate
  tdee?: number; // Total Daily Energy Expenditure
  targetCalories?: number;
  
  // Timestamps
  createdAt?: string;
  updatedAt?: string;
}

// Activity levels with multipliers for TDEE calculation
export interface ActivityLevel {
  id: string;
  name: string;
  description: string;
  multiplier: number;
  examples: string[];
}

export const ACTIVITY_LEVELS: ActivityLevel[] = [
  {
    id: 'sedentary',
    name: 'Sedentary',
    description: 'Little or no exercise',
    multiplier: 1.2,
    examples: ['Desk job', 'Minimal walking', 'No regular exercise']
  },
  {
    id: 'lightly_active',
    name: 'Lightly Active',
    description: 'Light exercise 1-3 days/week',
    multiplier: 1.375,
    examples: ['Light jogging', 'Yoga', 'Walking 30min/day']
  },
  {
    id: 'moderately_active',
    name: 'Moderately Active',
    description: 'Moderate exercise 3-5 days/week',
    multiplier: 1.55,
    examples: ['Gym 3-4 times/week', 'Sports', 'Regular cardio']
  },
  {
    id: 'very_active',
    name: 'Very Active',
    description: 'Heavy exercise 6-7 days/week',
    multiplier: 1.725,
    examples: ['Daily workouts', 'Physical job', 'Training athlete']
  },
  {
    id: 'extra_active',
    name: 'Extra Active',
    description: 'Very heavy physical work/exercise',
    multiplier: 1.9,
    examples: ['Construction worker', 'Professional athlete', '2+ workouts/day']
  }
];

// Fitness goals affecting calorie targets
export interface FitnessGoal {
  id: string;
  name: string;
  description: string;
  calorieAdjustment: number; // Percentage adjustment to TDEE
  proteinRatio: number; // % of calories from protein
  carbRatio: number; // % of calories from carbs
  fatRatio: number; // % of calories from fat
}

export const FITNESS_GOALS: FitnessGoal[] = [
  {
    id: 'lose_weight',
    name: 'Lose Weight',
    description: 'Create a caloric deficit for weight loss',
    calorieAdjustment: -0.2, // 20% deficit
    proteinRatio: 0.30,
    carbRatio: 0.35,
    fatRatio: 0.35
  },
  {
    id: 'maintain_weight',
    name: 'Maintain Weight',
    description: 'Maintain current weight and body composition',
    calorieAdjustment: 0, // No adjustment
    proteinRatio: 0.25,
    carbRatio: 0.45,
    fatRatio: 0.30
  },
  {
    id: 'gain_weight',
    name: 'Gain Weight',
    description: 'Create a caloric surplus for weight gain',
    calorieAdjustment: 0.15, // 15% surplus
    proteinRatio: 0.25,
    carbRatio: 0.50,
    fatRatio: 0.25
  },
  {
    id: 'build_muscle',
    name: 'Build Muscle',
    description: 'Optimize for muscle growth and strength',
    calorieAdjustment: 0.10, // 10% surplus
    proteinRatio: 0.35,
    carbRatio: 0.40,
    fatRatio: 0.25
  },
  {
    id: 'improve_health',
    name: 'Improve Health',
    description: 'Focus on overall health and nutrition',
    calorieAdjustment: 0, // No adjustment
    proteinRatio: 0.20,
    carbRatio: 0.50,
    fatRatio: 0.30
  }
];

// Calculated nutritional targets
export interface NutritionTargets {
  totalCalories: number;
  protein: {
    grams: number;
    calories: number;
    percentage: number;
  };
  carbs: {
    grams: number;
    calories: number;
    percentage: number;
  };
  fat: {
    grams: number;
    calories: number;
    percentage: number;
  };
  fiber: number;
  water: number; // in liters
}

// Meal timing recommendations
export interface MealTiming {
  mealType: MealType;
  recommendedTime: string; // HH:MM format
  timeWindow: string; // e.g., "7:00-9:00"
  caloriePercentage: number; // % of daily calories
  macroFocus: string[]; // ['protein', 'carbs', 'fats']
  foodCategories: string[]; // Recommended food types
  reasoning: string;
}

export type MealType = 'breakfast' | 'morning_snack' | 'lunch' | 'afternoon_snack' | 'dinner' | 'evening_snack';

// Personalized meal plan
export interface PersonalizedMealPlan {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  totalCalories: number;
  meals: {
    breakfast: MealPlanItem;
    lunch: MealPlanItem;
    dinner: MealPlanItem;
    snacks?: MealPlanItem[];
  };
  nutritionSummary: NutritionTargets;
  shoppingList: ShoppingRecommendation[];
  createdAt: string;
}

export interface MealPlanItem {
  mealType: MealType;
  targetCalories: number;
  recommendedTime: string;
  recipes: {
    recipeId?: string;
    recipeName: string;
    servings: number;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    ingredients: string[];
  }[];
  nutritionBreakdown: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

// Shopping recommendations based on health profile
export interface ShoppingRecommendation {
  category: string;
  items: {
    name: string;
    quantity: string;
    priority: 'essential' | 'recommended' | 'optional';
    healthBenefit: string;
    calories: number;
    macroProfile: {
      protein: number;
      carbs: number;
      fat: number;
    };
  }[];
  reasoning: string;
}

// BMI and health metrics
export interface HealthMetrics {
  bmi: number;
  bmiCategory: 'underweight' | 'normal' | 'overweight' | 'obese';
  bmr: number;
  tdee: number;
  waterNeed: number; // liters per day
  idealWeight: {
    min: number;
    max: number;
  };
  healthScore: number; // 0-100
  recommendations: string[];
}

// Food timing optimization
export interface FoodTimingRecommendation {
  timeOfDay: string;
  period: 'morning' | 'afternoon' | 'evening' | 'night';
  foodCategories: {
    highly_recommended: string[];
    recommended: string[];
    avoid: string[];
  };
  reasoning: string;
  metabolicBenefit: string;
}

// API request/response types
export interface UpdateHealthProfileRequest {
  height: number;
  weight: number;
  age: number;
  gender: 'male' | 'female' | 'other';
  activityLevelId: string;
  fitnessGoalId: string;
  dietaryRestrictions?: string[];
  healthConditions?: string[];
  mealsPerDay?: number;
  wakeUpTime?: string;
  bedTime?: string;
}

export interface HealthProfileResponse {
  success: boolean;
  profile?: UserHealthProfile;
  metrics?: HealthMetrics;
  nutritionTargets?: NutritionTargets;
  mealTimings?: MealTiming[];
  message?: string;
}

export interface GenerateMealPlanRequest {
  profileId: string;
  date?: string; // YYYY-MM-DD, defaults to today
  preferences?: {
    cookingTime?: 'quick' | 'moderate' | 'extended';
    complexity?: 'simple' | 'moderate' | 'advanced';
    cuisine?: string[];
    avoidIngredients?: string[];
  };
}

export interface MealPlanResponse {
  success: boolean;
  mealPlan?: PersonalizedMealPlan;
  message?: string;
}

// Additional types for components
export interface MealTimingRecommendation {
  mealTimes: string[];
  snackTimes: string[];
  categoryTiming: Record<FoodCategory, { bestTimes: string[]; reasoning: string; }>;
  hydrationSchedule: { time: string; amount: string; note: string; }[];
  metabolismTips: string[];
  fastingWindow?: {
    start: string;
    end: string;
    duration: number;
    recommended: boolean;
  } | null;
}

export type FoodCategory = 'carbs' | 'proteins' | 'healthy_fats' | 'vegetables' | 'fruits';

export interface ShoppingRecommendations {
  focusAreas: {
    category: string;
    targetPercentage: number;
    reasoning: string;
  }[];
  priorityItems: {
    item: string;
    reason: string;
  }[];
}

// Extended PersonalizedMealPlan for AI service
export interface PersonalizedMealPlan {
  id: string;
  userId: string;
  createdAt: string;
  targetCalories: number;
  macroTargets: {
    protein: number;
    carbs: number;
    fat: number;
  };
  breakfast: {
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
  };
  lunch: {
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
  };
  dinner: {
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
  };
  totalNutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  dietaryRestrictions: string[];
  fitnessGoal: string;
}
