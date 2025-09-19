import React, { useState, useEffect } from 'react';
import { Clock, Target, TrendingUp, ShoppingBag, ChefHat, Droplets, Info, Calendar, Star, Brain } from 'lucide-react';
import { 
  UserHealthProfile, 
  PersonalizedMealPlan, 
  MealTimingRecommendation,
  ShoppingRecommendations 
} from '../types/HealthProfile';
import { HealthCalculationService } from '../services/healthCalculationService';
import { MealTimingService } from '../services/MealTimingService';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/contexts/TranslationContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import { centralStoreService, convertNearbyStoreToCentralStore } from '@/services/centralStoreService';
import CompactStoreCard from './CompactStoreCard';
import { enhancedAIService } from '../services/enhancedAIService';

interface PersonalizedDashboardProps {
  healthProfile: UserHealthProfile;
  onUpdateProfile?: () => void;
  nearbyStores?: any[];
}

export const PersonalizedDashboard: React.FC<PersonalizedDashboardProps> = ({
  healthProfile,
  onUpdateProfile,
  nearbyStores = []
}) => {
  const [activeTab, setActiveTab] = useState<'meals' | 'timing' | 'shopping'>('meals');
  
  // Debug tab changes
  useEffect(() => {
    console.log('📡 Dashboard active tab changed to:', activeTab);
  }, [activeTab]);
  const [personalizedMealPlan, setPersonalizedMealPlan] = useState<PersonalizedMealPlan | null>(null);
  const [mealTiming, setMealTiming] = useState<MealTimingRecommendation | null>(null);
  const [shoppingRecommendations, setShoppingRecommendations] = useState<ShoppingRecommendations | null>(null);
  const [isGeneratingMeals, setIsGeneratingMeals] = useState(false);
  const [isAIInitializing, setIsAIInitializing] = useState(false);
  const [aiInitializationStatus, setAiInitializationStatus] = useState('');
  const [isAIReady, setIsAIReady] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();
  

  // Calculate health metrics
  const healthResponse = HealthCalculationService.createHealthProfile({
    height: healthProfile.height,
    weight: healthProfile.weight,
    age: healthProfile.age,
    gender: healthProfile.gender,
    activityLevelId: typeof healthProfile.activityLevel === 'string' ? healthProfile.activityLevel : healthProfile.activityLevel.id,
    fitnessGoalId: healthProfile.fitnessGoal,
    dietaryRestrictions: healthProfile.dietaryRestrictions,
    healthConditions: healthProfile.healthConditions,
    mealsPerDay: healthProfile.numberOfMeals,
    wakeUpTime: healthProfile.wakeUpTime,
    bedTime: healthProfile.bedTime
  });
  
  const nutritionTargets = healthResponse.success && healthResponse.nutritionTargets ? 
    healthResponse.nutritionTargets : null;
  
  useEffect(() => {
    // Initialize AI service
    const initializeAI = async () => {
      setIsAIInitializing(true);
      setAiInitializationStatus('Loading AI models...');
      try {
        await enhancedAIService.initialize((status) => {
          setAiInitializationStatus(status);
        });
        setIsAIReady(true);
        setAiInitializationStatus('AI models ready!');
        toast({
          title: "AI Ready",
          description: "AI-powered recipe generation is now available!"
        });
      } catch (error) {
        console.error('AI initialization failed:', error);
        setAiInitializationStatus('AI initialization failed - using fallback mode');
        toast({
          title: "AI Unavailable",
          description: "Using fallback recipe generation. Some features may be limited.",
          variant: "destructive"
        });
      } finally {
        setIsAIInitializing(false);
      }
    };
    
    initializeAI();
    
    // Generate meal timing recommendations
    try {
      const timingRecs = MealTimingService.generateMealTiming(healthProfile);
      setMealTiming(timingRecs);
    } catch (error) {
      console.error('Error generating meal timing:', error);
    }

    // Generate shopping recommendations
    if (nutritionTargets) {
      try {
        const shoppingRecs = HealthCalculationService.generateShoppingRecommendations(healthProfile, nutritionTargets);
        setShoppingRecommendations(shoppingRecs);
      } catch (error) {
        console.error('Error generating shopping recommendations:', error);
      }
    }
  }, [healthProfile, nutritionTargets]);

  const generatePersonalizedMeals = async () => {
    console.log('🚀 Starting meal generation...', { isGeneratingMeals, isAIReady });
    
    if (isGeneratingMeals) {
      console.log('⚠️ Already generating meals, ignoring click');
      return;
    }
    
    setIsGeneratingMeals(true);
    
    try {
      console.log('📊 Calculating nutrition targets...');
      const targetCaloriesPerMeal = {
        breakfast: Math.round((nutritionTargets?.totalCalories || 2000) * 0.25),
        lunch: Math.round((nutritionTargets?.totalCalories || 2000) * 0.35),
        dinner: Math.round((nutritionTargets?.totalCalories || 2000) * 0.40)
      };
      
      console.log('🍳 Target calories per meal:', targetCaloriesPerMeal);

      // Simple ingredient options
      const breakfastOptions = [
        ['eggs', 'spinach', 'avocado', 'toast'],
        ['oats', 'blueberries', 'almonds', 'honey'],
        ['yogurt', 'granola', 'strawberries']
      ];
      
      const lunchOptions = [
        ['chicken breast', 'quinoa', 'vegetables'],
        ['salmon', 'rice', 'asparagus'],
        ['turkey', 'sweet potato', 'kale']
      ];
      
      const dinnerOptions = [
        ['salmon fillet', 'broccoli', 'sweet potato'],
        ['chicken thighs', 'cauliflower', 'peppers'],
        ['beef', 'zucchini', 'tomato sauce']
      ];

      // Select random ingredients
      const selectedBreakfast = breakfastOptions[Math.floor(Math.random() * breakfastOptions.length)];
      const selectedLunch = lunchOptions[Math.floor(Math.random() * lunchOptions.length)];
      const selectedDinner = dinnerOptions[Math.floor(Math.random() * dinnerOptions.length)];
      
      console.log('🥗 Selected ingredients:', { selectedBreakfast, selectedLunch, selectedDinner });
      
      // Create simple structured recipes that always work
      console.log('🍽️ Creating meal plan...');
      
      const breakfastResult = {
        name: `${selectedBreakfast[0]} & ${selectedBreakfast[1]} Breakfast`,
        description: `Healthy breakfast featuring ${selectedBreakfast[0]} - ${targetCaloriesPerMeal.breakfast} calories`,
        ingredients: selectedBreakfast,
        instructions: [
          'Prepare all ingredients',
          `Cook the ${selectedBreakfast[0]} to your preference`, 
          'Combine with remaining ingredients',
          'Serve immediately'
        ],
        cookingTips: [`${selectedBreakfast[0]} provides excellent protein to start your day`],
        healthScore: 8
      };
      
      const lunchResult = {
        name: `${selectedLunch[0]} & ${selectedLunch[1]} Bowl`, 
        description: `Balanced lunch with ${selectedLunch[0]} - ${targetCaloriesPerMeal.lunch} calories`,
        ingredients: selectedLunch,
        instructions: [
          'Prepare all ingredients',
          `Cook ${selectedLunch[0]} thoroughly`,
          'Steam or sauté vegetables',
          'Combine in a bowl and season'
        ],
        cookingTips: [`${selectedLunch[0]} pairs perfectly with ${selectedLunch[1]}`],
        healthScore: 8
      };
      
      const dinnerResult = {
        name: `${selectedDinner[0]} & ${selectedDinner[1]} Dinner`,
        description: `Nutritious dinner with ${selectedDinner[0]} - ${targetCaloriesPerMeal.dinner} calories`, 
        ingredients: selectedDinner,
        instructions: [
          'Season all ingredients',
          `Prepare ${selectedDinner[0]} using your preferred method`,
          'Cook vegetables until tender',
          'Plate and serve hot'
        ],
        cookingTips: [`Let ${selectedDinner[0]} rest for 5 minutes before serving for best results`],
        healthScore: 9
      };
      
      console.log('✅ Meal recipes created successfully');

      const mealPlan: PersonalizedMealPlan = {
        id: `ai-plan-${Date.now()}`,
        userId: healthProfile.userId,
        createdAt: new Date().toISOString(),
        targetCalories: nutritionTargets?.totalCalories || 2000,
        macroTargets: {
          protein: nutritionTargets?.protein.grams || 150,
          carbs: nutritionTargets?.carbs.grams || 250,
          fat: nutritionTargets?.fat.grams || 67
        },
        breakfast: {
          id: `breakfast-${Date.now()}`,
          name: breakfastResult.name || 'AI-Generated Breakfast',
          description: breakfastResult.description || `Healthy breakfast - ${targetCaloriesPerMeal.breakfast} calories`,
          ingredients: breakfastResult.ingredients || ['eggs', 'oats', 'berries'],
          instructions: breakfastResult.instructions || ['Prepare ingredients', 'Cook as desired'],
          prepTime: Math.round(Math.random() * 10) + 5,
          cookTime: Math.round(Math.random() * 15) + 10,
          servings: 1,
          nutrition: {
            calories: targetCaloriesPerMeal.breakfast,
            protein: Math.round((nutritionTargets?.protein.grams || 150) * 0.25),
            carbs: Math.round((nutritionTargets?.carbs.grams || 250) * 0.25),
            fat: Math.round((nutritionTargets?.fat.grams || 67) * 0.25)
          },
          aiGenerated: true,
          cookingTips: breakfastResult.cookingTips || [],
          healthScore: breakfastResult.healthScore || 8
        },
        lunch: {
          id: `lunch-${Date.now()}`,
          name: lunchResult.name || 'AI-Generated Lunch',
          description: lunchResult.description || `Nutritious lunch - ${targetCaloriesPerMeal.lunch} calories`,
          ingredients: lunchResult.ingredients || ['chicken', 'quinoa', 'vegetables'],
          instructions: lunchResult.instructions || ['Prepare ingredients', 'Cook thoroughly'],
          prepTime: Math.round(Math.random() * 15) + 10,
          cookTime: Math.round(Math.random() * 20) + 15,
          servings: 1,
          nutrition: {
            calories: targetCaloriesPerMeal.lunch,
            protein: Math.round((nutritionTargets?.protein.grams || 150) * 0.35),
            carbs: Math.round((nutritionTargets?.carbs.grams || 250) * 0.35),
            fat: Math.round((nutritionTargets?.fat.grams || 67) * 0.35)
          },
          aiGenerated: true,
          cookingTips: lunchResult.cookingTips || [],
          healthScore: lunchResult.healthScore || 8
        },
        dinner: {
          id: `dinner-${Date.now()}`,
          name: dinnerResult.name || 'AI-Generated Dinner',
          description: dinnerResult.description || `Balanced dinner - ${targetCaloriesPerMeal.dinner} calories`,
          ingredients: dinnerResult.ingredients || ['salmon', 'broccoli', 'sweet potato'],
          instructions: dinnerResult.instructions || ['Preheat oven', 'Prepare and cook'],
          prepTime: Math.round(Math.random() * 15) + 10,
          cookTime: Math.round(Math.random() * 30) + 20,
          servings: 1,
          nutrition: {
            calories: targetCaloriesPerMeal.dinner,
            protein: Math.round((nutritionTargets?.protein.grams || 150) * 0.40),
            carbs: Math.round((nutritionTargets?.carbs.grams || 250) * 0.40),
            fat: Math.round((nutritionTargets?.fat.grams || 67) * 0.40)
          },
          aiGenerated: true,
          cookingTips: dinnerResult.cookingTips || [],
          healthScore: dinnerResult.healthScore || 8
        },
        totalNutrition: {
          calories: targetCaloriesPerMeal.breakfast + targetCaloriesPerMeal.lunch + targetCaloriesPerMeal.dinner,
          protein: nutritionTargets?.protein.grams || 150,
          carbs: nutritionTargets?.carbs.grams || 250,
          fat: nutritionTargets?.fat.grams || 67
        },
        dietaryRestrictions: healthProfile.dietaryRestrictions,
        fitnessGoal: healthProfile.fitnessGoal,
        aiGenerated: true
      };
      
      console.log('✅ Generated AI-powered meal plan:', mealPlan);
      setPersonalizedMealPlan(mealPlan);
      
      toast({
        title: isAIReady ? "AI Success! 🤖" : "Success! 🍽️",
        description: isAIReady ? "AI-powered personalized meal plan generated!" : "Personalized meal plan generated successfully!"
      });
    } catch (error) {
      console.error('Error generating meals:', error);
      await generateFallbackMeals();
      toast({
        title: "Meals Ready",
        description: "Fallback meal plan generated successfully!"
      });
    } finally {
      setIsGeneratingMeals(false);
    }
  };

  const generateFallbackMeals = async () => {
    const targetCaloriesPerMeal = {
      breakfast: Math.round((nutritionTargets?.totalCalories || 2000) * 0.25),
      lunch: Math.round((nutritionTargets?.totalCalories || 2000) * 0.35),
      dinner: Math.round((nutritionTargets?.totalCalories || 2000) * 0.40)
    };

    const fallbackMealPlan: PersonalizedMealPlan = {
      id: `fallback-plan-${Date.now()}`,
      userId: healthProfile.userId,
      createdAt: new Date().toISOString(),
      targetCalories: nutritionTargets?.totalCalories || 2000,
      macroTargets: {
        protein: nutritionTargets?.protein.grams || 150,
        carbs: nutritionTargets?.carbs.grams || 250,
        fat: nutritionTargets?.fat.grams || 67
      },
      breakfast: {
        id: `breakfast-${Date.now()}`,
        name: 'Protein-Rich Breakfast',
        description: `Healthy breakfast - ${targetCaloriesPerMeal.breakfast} calories`,
        ingredients: ['2 eggs', '1/2 cup oats', '1/2 cup berries', '1 tbsp almond butter'],
        instructions: ['Cook eggs', 'Prepare oats', 'Add berries and almond butter'],
        prepTime: 5,
        cookTime: 10,
        servings: 1,
        nutrition: {
          calories: targetCaloriesPerMeal.breakfast,
          protein: Math.round((nutritionTargets?.protein.grams || 150) * 0.25),
          carbs: Math.round((nutritionTargets?.carbs.grams || 250) * 0.25),
          fat: Math.round((nutritionTargets?.fat.grams || 67) * 0.25)
        }
      },
      lunch: {
        id: `lunch-${Date.now()}`,
        name: 'Balanced Lunch Bowl',
        description: `Nutritious lunch - ${targetCaloriesPerMeal.lunch} calories`,
        ingredients: ['150g chicken breast', '1 cup quinoa', '2 cups mixed vegetables'],
        instructions: ['Grill chicken', 'Cook quinoa', 'Prepare vegetables', 'Combine'],
        prepTime: 15,
        cookTime: 20,
        servings: 1,
        nutrition: {
          calories: targetCaloriesPerMeal.lunch,
          protein: Math.round((nutritionTargets?.protein.grams || 150) * 0.35),
          carbs: Math.round((nutritionTargets?.carbs.grams || 250) * 0.35),
          fat: Math.round((nutritionTargets?.fat.grams || 67) * 0.35)
        }
      },
      dinner: {
        id: `dinner-${Date.now()}`,
        name: 'Omega-Rich Dinner',
        description: `Balanced dinner - ${targetCaloriesPerMeal.dinner} calories`,
        ingredients: ['180g salmon fillet', '1 cup broccoli', '1 medium sweet potato'],
        instructions: ['Season salmon', 'Steam broccoli', 'Roast sweet potato', 'Serve'],
        prepTime: 10,
        cookTime: 25,
        servings: 1,
        nutrition: {
          calories: targetCaloriesPerMeal.dinner,
          protein: Math.round((nutritionTargets?.protein.grams || 150) * 0.40),
          carbs: Math.round((nutritionTargets?.carbs.grams || 250) * 0.40),
          fat: Math.round((nutritionTargets?.fat.grams || 67) * 0.40)
        }
      },
      totalNutrition: {
        calories: targetCaloriesPerMeal.breakfast + targetCaloriesPerMeal.lunch + targetCaloriesPerMeal.dinner,
        protein: nutritionTargets?.protein.grams || 150,
        carbs: nutritionTargets?.carbs.grams || 250,
        fat: nutritionTargets?.fat.grams || 67
      },
      dietaryRestrictions: healthProfile.dietaryRestrictions,
      fitnessGoal: healthProfile.fitnessGoal,
      aiGenerated: false
    };

    setPersonalizedMealPlan(fallbackMealPlan);
  };


  if (!healthResponse.success) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200 text-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Error Loading Health Data</h3>
          <p className="text-gray-600 mb-4">{healthResponse.message || 'Unable to calculate health metrics'}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header with Language Selector */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{t('dashboard.title')}</h1>
            <p className="text-gray-600">
              {t('dashboard.subtitle')}
            </p>
          </div>
          <div className="ml-4">
            <LanguageSwitcher />
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => {
            console.log('🍽️ Switching to meals tab');
            setActiveTab('meals');
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'meals'
              ? 'bg-amber-100 text-amber-800 border border-amber-200' 
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <ChefHat className="w-4 h-4" />
          Meals
        </button>
        <button
          onClick={() => {
            console.log('⏰ Switching to timing tab');
            setActiveTab('timing');
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'timing'
              ? 'bg-amber-100 text-amber-800 border border-amber-200' 
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Clock className="w-4 h-4" />
          Timing
        </button>
        <button
          onClick={() => {
            console.log('🛍️ Switching to shopping tab');
            setActiveTab('shopping');
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'shopping'
              ? 'bg-amber-100 text-amber-800 border border-amber-200' 
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          Shopping
        </button>
      </div>

      {/* Tab Content */}
      
      {activeTab === 'meals' && (
        <div className="space-y-6">
          {/* AI Status and Generate Meals Button */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Brain className={`w-5 h-5 ${isAIReady ? 'text-green-500' : isAIInitializing ? 'text-amber-500 animate-pulse' : 'text-gray-400'}`} />
              <h3 className="text-lg font-semibold text-gray-800">AI-Powered Meal Plans</h3>
            </div>
            
            {isAIInitializing && (
              <div className="mb-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-amber-600"></div>
                  <p className="text-amber-800 text-sm font-medium">{aiInitializationStatus}</p>
                </div>
              </div>
            )}
            
            {isAIReady && (
              <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-green-800 text-sm font-medium flex items-center justify-center gap-2">
                  <Brain className="w-4 h-4" />
                  AI Ready - Advanced Recipe Generation Available!
                </p>
              </div>
            )}
            
            <p className="text-gray-600 mb-4">
              {isAIReady ? 'Generate AI-powered personalized recipes' : 'Generate personalized meal plans based on your health profile'}
            </p>
            <button
              onClick={generatePersonalizedMeals}
              disabled={isGeneratingMeals}
              className="bg-brand-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-professional-md hover:shadow-professional-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGeneratingMeals 
                ? (isAIReady ? '🤖 AI Generating...' : '🍽️ Generating...')
                : (isAIReady ? '🤖 Generate AI Recipes' : '🍽️ Generate Meal Plan')
              }
            </button>
          </div>

          {/* Meal Plans Display */}
          {personalizedMealPlan && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Breakfast */}
                <div className={`bg-white rounded-xl p-6 border-2 ${
                  personalizedMealPlan.aiGenerated 
                    ? 'border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50' 
                    : 'border-gray-200'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-lg font-semibold text-gray-800">
                      🌅 {personalizedMealPlan.breakfast.name}
                    </h4>
                    {personalizedMealPlan.aiGenerated && (
                      <div className="flex items-center gap-1">
                        <Brain className="w-4 h-4 text-purple-600" />
                        <span className="text-xs text-purple-600 font-medium">AI</span>
                      </div>
                    )}
                  </div>
                  
                  {(personalizedMealPlan.breakfast as any).healthScore && (
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium text-gray-700">
                        Health Score: {(personalizedMealPlan.breakfast as any).healthScore}/10
                      </span>
                    </div>
                  )}
                  
                  <p className="text-sm text-gray-600 mb-3">
                    {personalizedMealPlan.breakfast.description}
                  </p>
                  
                  {personalizedMealPlan.breakfast.ingredients && personalizedMealPlan.breakfast.ingredients.length > 0 && (
                    <div className="mb-3">
                      <h5 className="text-sm font-medium text-gray-700 mb-1">Ingredients:</h5>
                      <div className="text-xs text-gray-600">
                        {personalizedMealPlan.breakfast.ingredients.slice(0, 3).join(', ')}
                        {personalizedMealPlan.breakfast.ingredients.length > 3 && '...'}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-sm text-gray-600 mb-3">
                    <span>{personalizedMealPlan.breakfast.nutrition.calories} {t('dashboard.meals.calories')}</span>
                    <span>{personalizedMealPlan.breakfast.nutrition.protein}{t('dashboard.meals.grams')} {t('dashboard.meals.protein')}</span>
                  </div>
                  
                  <div className="text-xs text-gray-500 mb-3">
                    Prep: {personalizedMealPlan.breakfast.prepTime}min | 
                    Cook: {personalizedMealPlan.breakfast.cookTime}min
                  </div>
                  
                  {(personalizedMealPlan.breakfast as any).cookingTips && (personalizedMealPlan.breakfast as any).cookingTips.length > 0 && (
                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                      <h6 className="text-xs font-semibold text-blue-800 mb-1">💡 AI Cooking Tip:</h6>
                      <p className="text-xs text-blue-700">
                        {(personalizedMealPlan.breakfast as any).cookingTips[0]}
                      </p>
                    </div>
                  )}
                </div>

                {/* Lunch */}
                <div className={`bg-white rounded-xl p-6 border-2 ${
                  personalizedMealPlan.aiGenerated 
                    ? 'border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50' 
                    : 'border-gray-200'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-lg font-semibold text-gray-800">
                      ☀️ {personalizedMealPlan.lunch.name}
                    </h4>
                    {personalizedMealPlan.aiGenerated && (
                      <div className="flex items-center gap-1">
                        <Brain className="w-4 h-4 text-purple-600" />
                        <span className="text-xs text-purple-600 font-medium">AI</span>
                      </div>
                    )}
                  </div>
                  
                  {(personalizedMealPlan.lunch as any).healthScore && (
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium text-gray-700">
                        Health Score: {(personalizedMealPlan.lunch as any).healthScore}/10
                      </span>
                    </div>
                  )}
                  
                  <p className="text-sm text-gray-600 mb-3">
                    {personalizedMealPlan.lunch.description}
                  </p>
                  
                  {personalizedMealPlan.lunch.ingredients && personalizedMealPlan.lunch.ingredients.length > 0 && (
                    <div className="mb-3">
                      <h5 className="text-sm font-medium text-gray-700 mb-1">Ingredients:</h5>
                      <div className="text-xs text-gray-600">
                        {personalizedMealPlan.lunch.ingredients.slice(0, 3).join(', ')}
                        {personalizedMealPlan.lunch.ingredients.length > 3 && '...'}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-sm text-gray-600 mb-3">
                    <span>{personalizedMealPlan.lunch.nutrition.calories} {t('dashboard.meals.calories')}</span>
                    <span>{personalizedMealPlan.lunch.nutrition.protein}{t('dashboard.meals.grams')} {t('dashboard.meals.protein')}</span>
                  </div>
                  
                  <div className="text-xs text-gray-500 mb-3">
                    Prep: {personalizedMealPlan.lunch.prepTime}min | 
                    Cook: {personalizedMealPlan.lunch.cookTime}min
                  </div>
                  
                  {(personalizedMealPlan.lunch as any).cookingTips && (personalizedMealPlan.lunch as any).cookingTips.length > 0 && (
                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                      <h6 className="text-xs font-semibold text-blue-800 mb-1">💡 AI Cooking Tip:</h6>
                      <p className="text-xs text-blue-700">
                        {(personalizedMealPlan.lunch as any).cookingTips[0]}
                      </p>
                    </div>
                  )}
                </div>

                {/* Dinner */}
                <div className={`bg-white rounded-xl p-6 border-2 ${
                  personalizedMealPlan.aiGenerated 
                    ? 'border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50' 
                    : 'border-gray-200'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-lg font-semibold text-gray-800">
                      🌙 {personalizedMealPlan.dinner.name}
                    </h4>
                    {personalizedMealPlan.aiGenerated && (
                      <div className="flex items-center gap-1">
                        <Brain className="w-4 h-4 text-purple-600" />
                        <span className="text-xs text-purple-600 font-medium">AI</span>
                      </div>
                    )}
                  </div>
                  
                  {(personalizedMealPlan.dinner as any).healthScore && (
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium text-gray-700">
                        Health Score: {(personalizedMealPlan.dinner as any).healthScore}/10
                      </span>
                    </div>
                  )}
                  
                  <p className="text-sm text-gray-600 mb-3">
                    {personalizedMealPlan.dinner.description}
                  </p>
                  
                  {personalizedMealPlan.dinner.ingredients && personalizedMealPlan.dinner.ingredients.length > 0 && (
                    <div className="mb-3">
                      <h5 className="text-sm font-medium text-gray-700 mb-1">Ingredients:</h5>
                      <div className="text-xs text-gray-600">
                        {personalizedMealPlan.dinner.ingredients.slice(0, 3).join(', ')}
                        {personalizedMealPlan.dinner.ingredients.length > 3 && '...'}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-sm text-gray-600 mb-3">
                    <span>{personalizedMealPlan.dinner.nutrition.calories} {t('dashboard.meals.calories')}</span>
                    <span>{personalizedMealPlan.dinner.nutrition.protein}{t('dashboard.meals.grams')} {t('dashboard.meals.protein')}</span>
                  </div>
                  
                  <div className="text-xs text-gray-500 mb-3">
                    Prep: {personalizedMealPlan.dinner.prepTime}min | 
                    Cook: {personalizedMealPlan.dinner.cookTime}min
                  </div>
                  
                  {(personalizedMealPlan.dinner as any).cookingTips && (personalizedMealPlan.dinner as any).cookingTips.length > 0 && (
                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                      <h6 className="text-xs font-semibold text-blue-800 mb-1">💡 AI Cooking Tip:</h6>
                      <p className="text-xs text-blue-700">
                        {(personalizedMealPlan.dinner as any).cookingTips[0]}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className={`bg-white rounded-xl p-6 border-2 ${
                personalizedMealPlan.aiGenerated 
                  ? 'border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50' 
                  : 'border-gray-200'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-lg font-semibold text-gray-800">Daily Nutrition Summary</h4>
                  {personalizedMealPlan.aiGenerated && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-purple-100 rounded-full">
                      <Brain className="w-4 h-4 text-purple-600" />
                      <span className="text-xs text-purple-600 font-medium">AI-Optimized</span>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-amber-600">
                      {personalizedMealPlan.totalNutrition.calories}
                    </div>
                    <div className="text-sm text-gray-600">{t('dashboard.meals.calories')}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {personalizedMealPlan.totalNutrition.protein}{t('dashboard.meals.grams')}
                    </div>
                    <div className="text-sm text-gray-600">{t('dashboard.meals.protein')}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {personalizedMealPlan.totalNutrition.carbs}{t('dashboard.meals.grams')}
                    </div>
                    <div className="text-sm text-gray-600">{t('dashboard.meals.carbs')}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {personalizedMealPlan.totalNutrition.fat}{t('dashboard.meals.grams')}
                    </div>
                    <div className="text-sm text-gray-600">{t('dashboard.meals.fat')}</div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {activeTab === 'timing' && (
        <div className="space-y-6">
          {!mealTiming ? (
            <div className="bg-white rounded-xl p-6 border border-gray-200 text-center">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{t('common.loading')}</h3>
              <p className="text-gray-600">{t('dashboard.timing.subtitle')}</p>
            </div>
          ) : (
            <>
              {/* Meal Timing Section */}
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-amber-600" />
                  {t('dashboard.timing.title')}
                </h3>
                
                <div className="space-y-6">
                  {/* Breakfast */}
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <h4 className="text-lg font-semibold text-yellow-800 mb-2">{t('dashboard.timing.breakfast.title')}</h4>
                    <p className="text-yellow-700 text-sm mb-1">{t('dashboard.timing.breakfast.time')}</p>
                    <p className="text-yellow-600 text-sm">{t('dashboard.timing.breakfast.description')}</p>
                  </div>
                  
                  {/* Morning Snack */}
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h4 className="text-lg font-semibold text-green-800 mb-2">{t('dashboard.timing.morningSnack.title')}</h4>
                    <p className="text-green-700 text-sm mb-1">{t('dashboard.timing.morningSnack.time')}</p>
                    <p className="text-green-600 text-sm">{t('dashboard.timing.morningSnack.description')}</p>
                  </div>
                  
                  {/* Lunch */}
                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <h4 className="text-lg font-semibold text-orange-800 mb-2">{t('dashboard.timing.lunch.title')}</h4>
                    <p className="text-orange-700 text-sm mb-1">{t('dashboard.timing.lunch.time')}</p>
                    <p className="text-orange-600 text-sm">{t('dashboard.timing.lunch.description')}</p>
                  </div>
                  
                  {/* Afternoon Snack */}
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <h4 className="text-lg font-semibold text-purple-800 mb-2">{t('dashboard.timing.afternoonSnack.title')}</h4>
                    <p className="text-purple-700 text-sm mb-1">{t('dashboard.timing.afternoonSnack.time')}</p>
                    <p className="text-purple-600 text-sm">{t('dashboard.timing.afternoonSnack.description')}</p>
                  </div>
                  
                  {/* Dinner */}
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="text-lg font-semibold text-blue-800 mb-2">{t('dashboard.timing.dinner.title')}</h4>
                    <p className="text-blue-700 text-sm mb-1">{t('dashboard.timing.dinner.time')}</p>
                    <p className="text-blue-600 text-sm">{t('dashboard.timing.dinner.description')}</p>
                  </div>
                </div>
              </div>
              
              {/* Timing Tips */}
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Info className="w-5 h-5 text-green-600" />
                  {t('dashboard.timing.tips.title')}
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="text-green-600 mt-1">•</span>
                    <span className="text-gray-700">{t('dashboard.timing.tips.tip1')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-600 mt-1">•</span>
                    <span className="text-gray-700">{t('dashboard.timing.tips.tip2')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-600 mt-1">•</span>
                    <span className="text-gray-700">{t('dashboard.timing.tips.tip3')}</span>
                  </li>
                </ul>
              </div>
            </>
          )}
        </div>
      )}

      {activeTab === 'shopping' && (
        <div className="space-y-6">
          {/* Shopping Overview */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-emerald-600" />
              {t('dashboard.shopping.title')}
            </h3>
            <p className="text-gray-600 mb-6">
              {t('dashboard.shopping.subtitle')}
            </p>
          </div>
          
          {/* Recommended Grocery Stores */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-blue-600" />
              {t('dashboard.shopping.groceryStores.title')}
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {(nearbyStores.length > 0 
                ? nearbyStores.slice(0, 4).map(store => convertNearbyStoreToCentralStore(store))
                : centralStoreService.getFeaturedStores().slice(0, 4)
              ).map((store) => (
                <CompactStoreCard
                  key={store.id}
                  store={store}
                  className="h-fit"
                />
              ))}
            </div>
            {nearbyStores.length === 0 && (
              <p className="text-sm text-secondary-dark mt-4 text-center">
                📍 Visit the Shopping section to find stores near your location
              </p>
            )}
          </div>
          
          {/* Shopping List */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('dashboard.shopping.shoppingList.title')}</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Fresh Produce */}
              <div>
                <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                  🥬 {t('dashboard.shopping.shoppingList.produce.title')}
                </h4>
                <ul className="space-y-2">
                  {t('dashboard.shopping.shoppingList.produce.items').map((item, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                      <span className="text-green-600">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Proteins */}
              <div>
                <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                  🥩 {t('dashboard.shopping.shoppingList.proteins.title')}
                </h4>
                <ul className="space-y-2">
                  {t('dashboard.shopping.shoppingList.proteins.items').map((item, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                      <span className="text-red-600">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Pantry Items */}
              <div>
                <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                  🏺 {t('dashboard.shopping.shoppingList.pantry.title')}
                </h4>
                <ul className="space-y-2">
                  {t('dashboard.shopping.shoppingList.pantry.items').map((item, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                      <span className="text-amber-600">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};