/**
 * Health Calculation Service
 * Implements BMR/TDEE calculations, nutrition targets, and meal timing recommendations
 */

import {
  UserHealthProfile,
  HealthMetrics,
  NutritionTargets,
  MealTiming,
  FoodTimingRecommendation,
  ACTIVITY_LEVELS,
  FITNESS_GOALS,
  UpdateHealthProfileRequest,
  HealthProfileResponse,
  ShoppingRecommendation,
  MealType
} from '@/types/healthProfile';

export class HealthCalculationService {
  /**
   * Calculate Basal Metabolic Rate using Mifflin-St Jeor Equation
   * Men: BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age(years) + 5
   * Women: BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age(years) - 161
   */
  static calculateBMR(weight: number, height: number, age: number, gender: string): number {
    const baseBMR = (10 * weight) + (6.25 * height) - (5 * age);
    
    switch (gender.toLowerCase()) {
      case 'male':
        return baseBMR + 5;
      case 'female':
        return baseBMR - 161;
      default:
        // For 'other', use average of male/female
        return baseBMR - 78;
    }
  }

  /**
   * Calculate Total Daily Energy Expenditure (TDEE)
   * TDEE = BMR × Activity Level Multiplier
   */
  static calculateTDEE(bmr: number, activityLevelId: string): number {
    const activityLevel = ACTIVITY_LEVELS.find(level => level.id === activityLevelId);
    if (!activityLevel) {
      console.warn(`Activity level ${activityLevelId} not found, using sedentary`);
      return bmr * 1.2;
    }
    return bmr * activityLevel.multiplier;
  }

  /**
   * Calculate target calories based on fitness goal
   */
  static calculateTargetCalories(tdee: number, fitnessGoalId: string): number {
    const goal = FITNESS_GOALS.find(g => g.id === fitnessGoalId);
    if (!goal) {
      console.warn(`Fitness goal ${fitnessGoalId} not found, using maintenance`);
      return tdee;
    }
    
    return Math.round(tdee * (1 + goal.calorieAdjustment));
  }

  /**
   * Calculate BMI and determine category
   */
  static calculateBMI(weight: number, height: number): { bmi: number; category: string } {
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);
    
    let category: string;
    if (bmi < 18.5) category = 'underweight';
    else if (bmi < 25) category = 'normal';
    else if (bmi < 30) category = 'overweight';
    else category = 'obese';
    
    return { bmi: Math.round(bmi * 10) / 10, category };
  }

  /**
   * Calculate ideal weight range based on height
   */
  static calculateIdealWeight(height: number): { min: number; max: number } {
    const heightInMeters = height / 100;
    const minWeight = 18.5 * heightInMeters * heightInMeters;
    const maxWeight = 24.9 * heightInMeters * heightInMeters;
    
    return {
      min: Math.round(minWeight * 10) / 10,
      max: Math.round(maxWeight * 10) / 10
    };
  }

  /**
   * Calculate daily water needs (in liters)
   * Base: 35ml per kg body weight + activity adjustments
   */
  static calculateWaterNeeds(weight: number, activityLevelId: string): number {
    const baseWater = (weight * 35) / 1000; // Base water in liters
    
    const activityLevel = ACTIVITY_LEVELS.find(level => level.id === activityLevelId);
    const activityMultiplier = activityLevel ? activityLevel.multiplier : 1.2;
    
    // Add extra water for higher activity levels
    const extraWater = activityMultiplier > 1.55 ? (activityMultiplier - 1.2) * 0.5 : 0;
    
    return Math.round((baseWater + extraWater) * 10) / 10;
  }

  /**
   * Calculate nutrition targets based on calories and fitness goal
   */
  static calculateNutritionTargets(targetCalories: number, fitnessGoalId: string): NutritionTargets {
    const goal = FITNESS_GOALS.find(g => g.id === fitnessGoalId);
    if (!goal) {
      console.warn(`Fitness goal ${fitnessGoalId} not found, using balanced macros`);
      return this.getBalancedNutritionTargets(targetCalories);
    }

    const proteinCalories = targetCalories * goal.proteinRatio;
    const carbCalories = targetCalories * goal.carbRatio;
    const fatCalories = targetCalories * goal.fatRatio;

    return {
      totalCalories: targetCalories,
      protein: {
        grams: Math.round(proteinCalories / 4), // 4 calories per gram
        calories: proteinCalories,
        percentage: Math.round(goal.proteinRatio * 100)
      },
      carbs: {
        grams: Math.round(carbCalories / 4), // 4 calories per gram
        calories: carbCalories,
        percentage: Math.round(goal.carbRatio * 100)
      },
      fat: {
        grams: Math.round(fatCalories / 9), // 9 calories per gram
        calories: fatCalories,
        percentage: Math.round(goal.fatRatio * 100)
      },
      fiber: Math.round(targetCalories / 100), // ~1g per 100 calories
      water: 2.5 // Base recommendation, adjusted by calculateWaterNeeds
    };
  }

  /**
   * Get balanced nutrition targets (fallback)
   */
  private static getBalancedNutritionTargets(calories: number): NutritionTargets {
    return {
      totalCalories: calories,
      protein: {
        grams: Math.round(calories * 0.25 / 4),
        calories: calories * 0.25,
        percentage: 25
      },
      carbs: {
        grams: Math.round(calories * 0.45 / 4),
        calories: calories * 0.45,
        percentage: 45
      },
      fat: {
        grams: Math.round(calories * 0.30 / 9),
        calories: calories * 0.30,
        percentage: 30
      },
      fiber: Math.round(calories / 100),
      water: 2.5
    };
  }

  /**
   * Generate meal timing recommendations based on profile
   */
  static generateMealTimings(profile: UserHealthProfile, targetCalories: number): MealTiming[] {
    const wakeTime = this.parseTime(profile.wakeUpTime || '07:00');
    const bedTime = this.parseTime(profile.bedTime || '22:00');
    const mealsCount = profile.numberOfMeals || 3;

    const timings: MealTiming[] = [];

    if (mealsCount >= 3) {
      // Breakfast: 1-2 hours after waking
      timings.push({
        mealType: 'breakfast',
        recommendedTime: this.formatTime(this.addHours(wakeTime, 1)),
        timeWindow: `${this.formatTime(this.addHours(wakeTime, 1))}-${this.formatTime(this.addHours(wakeTime, 2.5))}`,
        caloriePercentage: 25,
        macroFocus: ['carbs', 'protein'],
        foodCategories: ['whole grains', 'fruits', 'protein', 'dairy'],
        reasoning: 'Start the day with energy-providing carbs and muscle-supporting protein'
      });

      // Lunch: 5-6 hours after waking
      timings.push({
        mealType: 'lunch',
        recommendedTime: this.formatTime(this.addHours(wakeTime, 5.5)),
        timeWindow: `${this.formatTime(this.addHours(wakeTime, 5))}-${this.formatTime(this.addHours(wakeTime, 7))}`,
        caloriePercentage: 35,
        macroFocus: ['protein', 'carbs', 'fats'],
        foodCategories: ['lean protein', 'vegetables', 'complex carbs', 'healthy fats'],
        reasoning: 'Balanced meal to sustain energy through the afternoon'
      });

      // Dinner: 3-4 hours before bed
      const dinnerTime = this.subtractHours(bedTime, 3.5);
      timings.push({
        mealType: 'dinner',
        recommendedTime: this.formatTime(dinnerTime),
        timeWindow: `${this.formatTime(this.subtractHours(bedTime, 4))}-${this.formatTime(this.subtractHours(bedTime, 2))}`,
        caloriePercentage: 30,
        macroFocus: ['protein', 'vegetables'],
        foodCategories: ['lean protein', 'vegetables', 'limited carbs'],
        reasoning: 'Lighter meal to aid digestion and sleep quality'
      });

      // Add snacks if more than 3 meals
      if (mealsCount > 3) {
        timings.push({
          mealType: 'afternoon_snack',
          recommendedTime: this.formatTime(this.addHours(wakeTime, 8.5)),
          timeWindow: `${this.formatTime(this.addHours(wakeTime, 8))}-${this.formatTime(this.addHours(wakeTime, 9))}`,
          caloriePercentage: 10,
          macroFocus: ['protein'],
          foodCategories: ['nuts', 'fruits', 'yogurt'],
          reasoning: 'Small snack to maintain energy between lunch and dinner'
        });
      }
    }

    return timings;
  }

  /**
   * Generate food timing recommendations for optimal metabolism
   */
  static generateFoodTimingRecommendations(): FoodTimingRecommendation[] {
    return [
      {
        timeOfDay: '06:00-10:00',
        period: 'morning',
        foodCategories: {
          highly_recommended: ['complex carbs', 'protein', 'fruits', 'coffee/tea'],
          recommended: ['healthy fats', 'whole grains', 'dairy'],
          avoid: ['heavy fats', 'processed foods', 'alcohol']
        },
        reasoning: 'Morning cortisol is high, metabolism is active',
        metabolicBenefit: 'Optimal carb utilization and energy production'
      },
      {
        timeOfDay: '10:00-14:00',
        period: 'afternoon',
        foodCategories: {
          highly_recommended: ['lean protein', 'vegetables', 'complex carbs'],
          recommended: ['healthy fats', 'legumes', 'whole grains'],
          avoid: ['simple sugars', 'heavy desserts']
        },
        reasoning: 'Peak metabolic activity period',
        metabolicBenefit: 'Best time for largest meal and complex nutrients'
      },
      {
        timeOfDay: '14:00-18:00',
        period: 'afternoon',
        foodCategories: {
          highly_recommended: ['vegetables', 'lean protein', 'fruits'],
          recommended: ['nuts', 'seeds', 'light carbs'],
          avoid: ['heavy meals', 'excessive fats']
        },
        reasoning: 'Metabolism begins to slow, prepare for evening',
        metabolicBenefit: 'Maintain energy without overwhelming digestion'
      },
      {
        timeOfDay: '18:00-22:00',
        period: 'evening',
        foodCategories: {
          highly_recommended: ['lean protein', 'vegetables', 'herbal tea'],
          recommended: ['light carbs', 'healthy fats in moderation'],
          avoid: ['heavy meals', 'caffeine', 'alcohol', 'excess carbs']
        },
        reasoning: 'Prepare body for rest and recovery',
        metabolicBenefit: 'Support muscle recovery without disrupting sleep'
      }
    ];
  }

  /**
   * Generate personalized shopping recommendations for dashboard
   */
  static generateShoppingRecommendations(
    profile: UserHealthProfile,
    nutritionTargets: NutritionTargets
  ): { focusAreas: { category: string; targetPercentage: number; reasoning: string; }[]; priorityItems: { item: string; reason: string; }[]; } {
    // Calculate macro percentages
    const totalCalories = nutritionTargets.totalCalories;
    const proteinPercentage = Math.round((nutritionTargets.protein.calories / totalCalories) * 100);
    const carbPercentage = Math.round((nutritionTargets.carbs.calories / totalCalories) * 100);
    const fatPercentage = Math.round((nutritionTargets.fat.calories / totalCalories) * 100);

    const focusAreas = [
      {
        category: 'Protein Sources',
        targetPercentage: proteinPercentage,
        reasoning: `Aim for ${nutritionTargets.protein.grams}g of protein daily to support muscle maintenance and satiety.`
      },
      {
        category: 'Complex Carbohydrates',
        targetPercentage: carbPercentage,
        reasoning: `Target ${nutritionTargets.carbs.grams}g of carbs daily for sustained energy from whole grains and vegetables.`
      },
      {
        category: 'Healthy Fats',
        targetPercentage: fatPercentage,
        reasoning: `Include ${nutritionTargets.fat.grams}g of healthy fats daily for hormone production and nutrient absorption.`
      },
      {
        category: 'Fiber & Micronutrients',
        targetPercentage: 5,
        reasoning: `Prioritize fruits and vegetables to reach ${nutritionTargets.fiber}g of fiber daily for digestive health.`
      }
    ];

    const fitnessGoal = typeof profile.fitnessGoal === 'string' ? profile.fitnessGoal : profile.fitnessGoal.id;
    const priorityItems = [];

    // Protein priorities
    if (profile.dietaryRestrictions.includes('vegetarian') || profile.dietaryRestrictions.includes('vegan')) {
      priorityItems.push({
        item: 'Plant-based proteins (lentils, chickpeas, quinoa)',
        reason: 'Complete amino acid profiles for vegetarian/vegan diet'
      });
    } else {
      priorityItems.push({
        item: 'Lean proteins (chicken breast, fish, eggs)',
        reason: 'High biological value protein for muscle maintenance'
      });
    }

    // Carb priorities based on goal
    if (fitnessGoal === 'lose_weight') {
      priorityItems.push({
        item: 'Low-glycemic vegetables (broccoli, spinach, cauliflower)',
        reason: 'High fiber, low calorie density for weight loss'
      });
    } else if (fitnessGoal === 'build_muscle' || fitnessGoal === 'gain_weight') {
      priorityItems.push({
        item: 'Complex carbohydrates (oats, brown rice, sweet potatoes)',
        reason: 'Energy for workouts and muscle growth'
      });
    } else {
      priorityItems.push({
        item: 'Whole grains and starchy vegetables',
        reason: 'Sustained energy for daily activities'
      });
    }

    // Fat priorities
    priorityItems.push({
      item: 'Omega-3 rich foods (salmon, walnuts, flax seeds)',
      reason: 'Anti-inflammatory fats for heart and brain health'
    });

    // Activity-specific priorities
    const activityLevel = typeof profile.activityLevel === 'string' ? profile.activityLevel : profile.activityLevel.id;
    if (activityLevel === 'very_active' || activityLevel === 'extra_active') {
      priorityItems.push({
        item: 'Electrolyte-rich foods (bananas, coconut water)',
        reason: 'Replace minerals lost through intense exercise'
      });
    }

    return { focusAreas, priorityItems };
  }

  /**
   * Generate detailed shopping list (legacy method)
   */
  static generateDetailedShoppingList(
    profile: UserHealthProfile,
    nutritionTargets: NutritionTargets
  ): ShoppingRecommendation[] {
    const recommendations: ShoppingRecommendation[] = [];

    // Protein sources
    recommendations.push({
      category: 'Protein Sources',
      items: [
        {
          name: 'Chicken Breast',
          quantity: '1-2 lbs',
          priority: 'essential',
          healthBenefit: 'Lean protein for muscle maintenance',
          calories: 165,
          macroProfile: { protein: 31, carbs: 0, fat: 3.6 }
        },
        {
          name: 'Salmon',
          quantity: '1 lb',
          priority: 'recommended',
          healthBenefit: 'Omega-3 fatty acids and high-quality protein',
          calories: 208,
          macroProfile: { protein: 22, carbs: 0, fat: 12 }
        },
        {
          name: 'Greek Yogurt',
          quantity: '2-3 containers',
          priority: 'essential',
          healthBenefit: 'Probiotics and casein protein',
          calories: 130,
          macroProfile: { protein: 15, carbs: 9, fat: 4 }
        }
      ],
      reasoning: `Target: ${nutritionTargets.protein.grams}g protein daily`
    });

    // Complex carbohydrates
    recommendations.push({
      category: 'Complex Carbohydrates',
      items: [
        {
          name: 'Brown Rice',
          quantity: '2 lbs',
          priority: 'essential',
          healthBenefit: 'Sustained energy and fiber',
          calories: 216,
          macroProfile: { protein: 5, carbs: 44, fat: 1.8 }
        },
        {
          name: 'Quinoa',
          quantity: '1 lb',
          priority: 'recommended',
          healthBenefit: 'Complete protein and fiber',
          calories: 222,
          macroProfile: { protein: 8, carbs: 39, fat: 3.6 }
        },
        {
          name: 'Sweet Potatoes',
          quantity: '3-4 pieces',
          priority: 'recommended',
          healthBenefit: 'Beta-carotene and complex carbs',
          calories: 112,
          macroProfile: { protein: 2, carbs: 26, fat: 0.1 }
        }
      ],
      reasoning: `Target: ${nutritionTargets.carbs.grams}g carbs daily`
    });

    // Healthy fats
    recommendations.push({
      category: 'Healthy Fats',
      items: [
        {
          name: 'Avocados',
          quantity: '4-5 pieces',
          priority: 'essential',
          healthBenefit: 'Monounsaturated fats and fiber',
          calories: 160,
          macroProfile: { protein: 2, carbs: 9, fat: 15 }
        },
        {
          name: 'Almonds',
          quantity: '1 lb',
          priority: 'recommended',
          healthBenefit: 'Vitamin E and healthy fats',
          calories: 161,
          macroProfile: { protein: 6, carbs: 6, fat: 14 }
        },
        {
          name: 'Olive Oil',
          quantity: '1 bottle',
          priority: 'essential',
          healthBenefit: 'Heart-healthy monounsaturated fats',
          calories: 884,
          macroProfile: { protein: 0, carbs: 0, fat: 100 }
        }
      ],
      reasoning: `Target: ${nutritionTargets.fat.grams}g healthy fats daily`
    });

    // Vegetables and fruits
    recommendations.push({
      category: 'Fruits & Vegetables',
      items: [
        {
          name: 'Spinach',
          quantity: '2-3 bags',
          priority: 'essential',
          healthBenefit: 'Iron, vitamins, and antioxidants',
          calories: 23,
          macroProfile: { protein: 2.9, carbs: 3.6, fat: 0.4 }
        },
        {
          name: 'Blueberries',
          quantity: '2 cups',
          priority: 'recommended',
          healthBenefit: 'Antioxidants and natural sweetness',
          calories: 84,
          macroProfile: { protein: 1, carbs: 21, fat: 0.5 }
        },
        {
          name: 'Broccoli',
          quantity: '2-3 heads',
          priority: 'essential',
          healthBenefit: 'Fiber, vitamins C and K',
          calories: 55,
          macroProfile: { protein: 3, carbs: 11, fat: 0.6 }
        }
      ],
      reasoning: 'Micronutrients, fiber, and antioxidants for optimal health'
    });

    return recommendations;
  }

  /**
   * Calculate overall health score (0-100)
   */
  static calculateHealthScore(profile: UserHealthProfile, metrics: HealthMetrics): number {
    let score = 100;

    // BMI score (30 points max)
    if (metrics.bmiCategory === 'normal') score += 0;
    else if (metrics.bmiCategory === 'overweight') score -= 15;
    else if (metrics.bmiCategory === 'underweight') score -= 20;
    else score -= 30; // obese

    // Activity level score (25 points max)
    const activityScore = ACTIVITY_LEVELS.find(a => a.id === profile.activityLevel.id)?.multiplier || 1.2;
    if (activityScore >= 1.55) score += 0; // very good
    else if (activityScore >= 1.375) score -= 5; // good
    else score -= 15; // sedentary

    // Health conditions impact (20 points max)
    score -= Math.min(profile.healthConditions.length * 10, 20);

    // Age factor (10 points max)
    if (profile.age < 30) score += 0;
    else if (profile.age < 50) score -= 5;
    else score -= 10;

    // Dietary balance (15 points max)
    const goal = FITNESS_GOALS.find(g => g.id === profile.fitnessGoal.id);
    if (goal && goal.id === 'improve_health') score += 5;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Generate health recommendations based on profile and metrics
   */
  static generateHealthRecommendations(
    profile: UserHealthProfile,
    metrics: HealthMetrics
  ): string[] {
    const recommendations: string[] = [];

    // BMI-based recommendations
    if (metrics.bmiCategory === 'overweight' || metrics.bmiCategory === 'obese') {
      recommendations.push('Consider a moderate caloric deficit for healthy weight loss');
      recommendations.push('Increase physical activity gradually');
    } else if (metrics.bmiCategory === 'underweight') {
      recommendations.push('Focus on nutrient-dense, calorie-rich foods');
      recommendations.push('Consider strength training to build muscle mass');
    }

    // Activity level recommendations
    const activityLevel = ACTIVITY_LEVELS.find(a => a.id === profile.activityLevel.id);
    if (activityLevel && activityLevel.multiplier < 1.375) {
      recommendations.push('Aim for at least 150 minutes of moderate exercise per week');
      recommendations.push('Take regular breaks to move throughout the day');
    }

    // Hydration reminder
    recommendations.push(`Drink at least ${metrics.waterNeed}L of water daily`);

    // Sleep hygiene
    const wakeTime = this.parseTime(profile.wakeUpTime || '07:00');
    const bedTime = this.parseTime(profile.bedTime || '22:00');
    const sleepHours = this.calculateSleepHours(wakeTime, bedTime);
    
    if (sleepHours < 7) {
      recommendations.push('Aim for 7-9 hours of quality sleep each night');
    }

    // Meal timing
    recommendations.push('Eat your largest meal when most active (typically lunch)');
    recommendations.push('Stop eating 2-3 hours before bedtime for better sleep');

    return recommendations;
  }

  /**
   * Create complete health profile with calculations
   */
  static createHealthProfile(request: UpdateHealthProfileRequest): HealthProfileResponse {
    try {
      // Find activity level and fitness goal
      const activityLevel = ACTIVITY_LEVELS.find(a => a.id === request.activityLevelId);
      const fitnessGoal = FITNESS_GOALS.find(g => g.id === request.fitnessGoalId);

      if (!activityLevel || !fitnessGoal) {
        return {
          success: false,
          message: 'Invalid activity level or fitness goal'
        };
      }

      // Calculate core metrics
      const bmr = this.calculateBMR(request.weight, request.height, request.age, request.gender);
      const tdee = this.calculateTDEE(bmr, request.activityLevelId);
      const targetCalories = this.calculateTargetCalories(tdee, request.fitnessGoalId);
      const { bmi, category } = this.calculateBMI(request.weight, request.height);
      const idealWeight = this.calculateIdealWeight(request.height);
      const waterNeed = this.calculateWaterNeeds(request.weight, request.activityLevelId);

      // Create profile
      const profile: UserHealthProfile = {
        height: request.height,
        weight: request.weight,
        age: request.age,
        gender: request.gender,
        activityLevel,
        fitnessGoal,
        dietaryRestrictions: request.dietaryRestrictions || [],
        healthConditions: request.healthConditions || [],
        medications: [],
        numberOfMeals: request.mealsPerDay || 3,
        wakeUpTime: request.wakeUpTime || '07:00',
        bedTime: request.bedTime || '22:00',
        bmr,
        tdee,
        targetCalories,
        updatedAt: new Date().toISOString()
      };

      // Calculate health metrics
      const metrics: HealthMetrics = {
        bmi,
        bmiCategory: category as any,
        bmr,
        tdee,
        waterNeed,
        idealWeight,
        healthScore: this.calculateHealthScore(profile, {
          bmi,
          bmiCategory: category as any,
          bmr,
          tdee,
          waterNeed,
          idealWeight,
          healthScore: 0,
          recommendations: []
        }),
        recommendations: []
      };

      metrics.recommendations = this.generateHealthRecommendations(profile, metrics);

      // Calculate nutrition targets
      const nutritionTargets = this.calculateNutritionTargets(targetCalories, request.fitnessGoalId);
      nutritionTargets.water = waterNeed;

      // Generate meal timings
      const mealTimings = this.generateMealTimings(profile, targetCalories);

      return {
        success: true,
        profile,
        metrics,
        nutritionTargets,
        mealTimings,
        message: 'Health profile created successfully'
      };
    } catch (error) {
      console.error('Error creating health profile:', error);
      return {
        success: false,
        message: 'Failed to create health profile'
      };
    }
  }

  // Utility functions
  private static parseTime(timeStr: string): Date {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  }

  private static formatTime(date: Date): string {
    return date.toTimeString().slice(0, 5);
  }

  private static addHours(date: Date, hours: number): Date {
    const newDate = new Date(date);
    newDate.setTime(newDate.getTime() + (hours * 60 * 60 * 1000));
    return newDate;
  }

  private static subtractHours(date: Date, hours: number): Date {
    const newDate = new Date(date);
    newDate.setTime(newDate.getTime() - (hours * 60 * 60 * 1000));
    return newDate;
  }

  private static calculateSleepHours(wakeTime: Date, bedTime: Date): number {
    const wake = wakeTime.getHours() + wakeTime.getMinutes() / 60;
    let bed = bedTime.getHours() + bedTime.getMinutes() / 60;
    
    // Handle bedtime after midnight
    if (bed < wake) {
      bed += 24;
    }
    
    return bed - wake;
  }
}

export default HealthCalculationService;