import React, { useState, useEffect } from 'react';
import { Clock, Target, TrendingUp, ShoppingBag, ChefHat, Droplets, Info, Calendar, Star } from 'lucide-react';
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
  const [personalizedMealPlan, setPersonalizedMealPlan] = useState<PersonalizedMealPlan | null>(null);
  const [mealTiming, setMealTiming] = useState<MealTimingRecommendation | null>(null);
  const [shoppingRecommendations, setShoppingRecommendations] = useState<ShoppingRecommendations | null>(null);
  const [isGeneratingMeals, setIsGeneratingMeals] = useState(false);
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
    setIsGeneratingMeals(true);
    try {
      console.log('🎯 Starting meal generation with nutritionTargets:', nutritionTargets);
      
      // Create a simplified meal plan for testing
      const targetCaloriesPerMeal = {
        breakfast: Math.round((nutritionTargets?.totalCalories || 2000) * 0.25),
        lunch: Math.round((nutritionTargets?.totalCalories || 2000) * 0.35),
        dinner: Math.round((nutritionTargets?.totalCalories || 2000) * 0.40)
      };
      
      // Simulate async meal generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate meal variations based on language
      const getBreakfastOptions = () => [
        t('dashboard.meals.recipeList.breakfast.avocadoToast'),
        t('dashboard.meals.recipeList.breakfast.greekYogurt'),
        t('dashboard.meals.recipeList.breakfast.oatmeal')
      ];
      
      const getLunchOptions = () => [
        t('dashboard.meals.recipeList.lunch.quinoaSalad'),
        t('dashboard.meals.recipeList.lunch.chickenWrap'),
        t('dashboard.meals.recipeList.lunch.lentilSoup')
      ];
      
      const getDinnerOptions = () => [
        t('dashboard.meals.recipeList.dinner.salmonRice'),
        t('dashboard.meals.recipeList.dinner.stirfry'),
        t('dashboard.meals.recipeList.dinner.chickenBroccoli')
      ];

      const mealPlan: PersonalizedMealPlan = {
        id: `plan-${Date.now()}`,
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
          name: getBreakfastOptions()[Math.floor(Math.random() * 3)],
          description: `${t('dashboard.meals.breakfast')} - ${targetCaloriesPerMeal.breakfast} ${t('dashboard.meals.calories')}`,
          ingredients: [
            "2 eggs", "1/2 cup oats", "1/2 cup berries", "1 banana",
            "1 tbsp almond butter", "1 tsp honey", "1/2 cup milk"
          ],
          instructions: ["Cook eggs to preference", "Prepare oats with milk", "Combine and serve"],
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
          name: getLunchOptions()[Math.floor(Math.random() * 3)],
          description: `${t('dashboard.meals.lunch')} - ${targetCaloriesPerMeal.lunch} ${t('dashboard.meals.calories')}`,
          ingredients: [
            "150g chicken breast", "1 cup quinoa", "2 cups mixed greens",
            "1/2 cucumber", "1/4 cup cherry tomatoes", "1/4 cup feta cheese"
          ],
          instructions: ["Grill chicken", "Cook quinoa", "Combine salad ingredients", "Add dressing"],
          prepTime: 15,
          cookTime: 12,
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
          name: getDinnerOptions()[Math.floor(Math.random() * 3)],
          description: `${t('dashboard.meals.dinner')} - ${targetCaloriesPerMeal.dinner} ${t('dashboard.meals.calories')}`,
          ingredients: [
            "180g salmon fillet", "1 cup broccoli", "1 medium sweet potato",
            "1/2 red bell pepper", "2 tbsp olive oil", "Fresh herbs"
          ],
          instructions: ["Preheat oven to 425°F", "Season salmon", "Roast vegetables", "Cook salmon", "Serve together"],
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
        fitnessGoal: healthProfile.fitnessGoal
      };
      
      console.log('✅ Generated meal plan:', mealPlan);
      setPersonalizedMealPlan(mealPlan);
      
      toast({
        title: "Success!",
        description: "Personalized meal plan generated!"
      });
    } catch (error) {
      console.error('Error generating personalized meals:', error);
      toast({
        title: "Error",
        description: "Failed to generate meal plan. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingMeals(false);
    }
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
          onClick={() => setActiveTab('meals')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'meals'
              ? 'bg-amber-100 text-amber-800 border border-amber-200' 
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <ChefHat className="w-4 h-4" />
          {t('dashboard.tabs.meals')}
        </button>
        <button
          onClick={() => setActiveTab('timing')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'timing'
              ? 'bg-amber-100 text-amber-800 border border-amber-200' 
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Clock className="w-4 h-4" />
          {t('dashboard.tabs.timing')}
        </button>
        <button
          onClick={() => setActiveTab('shopping')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'shopping'
              ? 'bg-amber-100 text-amber-800 border border-amber-200' 
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          {t('dashboard.tabs.shopping')}
        </button>
      </div>

      {/* Tab Content */}
      
      {activeTab === 'meals' && (
        <div className="space-y-6">
          {/* Generate Meals Button */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('dashboard.meals.title')}</h3>
            <p className="text-gray-600 mb-4">
              {t('dashboard.meals.subtitle')}
            </p>
            <button
              onClick={generatePersonalizedMeals}
              disabled={isGeneratingMeals}
              className="bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isGeneratingMeals ? t('dashboard.meals.loading') : t('dashboard.meals.generateButton')}
            </button>
          </div>

          {/* Meal Plans Display */}
          {personalizedMealPlan && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Breakfast */}
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">
                    🌅 {personalizedMealPlan.breakfast.name}
                  </h4>
                  <p className="text-sm text-gray-600 mb-3">
                    {personalizedMealPlan.breakfast.description}
                  </p>
                  <div className="flex justify-between text-sm text-gray-600 mb-3">
                    <span>{personalizedMealPlan.breakfast.nutrition.calories} {t('dashboard.meals.calories')}</span>
                    <span>{personalizedMealPlan.breakfast.nutrition.protein}{t('dashboard.meals.grams')} {t('dashboard.meals.protein')}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Prep: {personalizedMealPlan.breakfast.prepTime}min | 
                    Cook: {personalizedMealPlan.breakfast.cookTime}min
                  </div>
                </div>

                {/* Lunch */}
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">
                    ☀️ {personalizedMealPlan.lunch.name}
                  </h4>
                  <p className="text-sm text-gray-600 mb-3">
                    {personalizedMealPlan.lunch.description}
                  </p>
                  <div className="flex justify-between text-sm text-gray-600 mb-3">
                    <span>{personalizedMealPlan.lunch.nutrition.calories} {t('dashboard.meals.calories')}</span>
                    <span>{personalizedMealPlan.lunch.nutrition.protein}{t('dashboard.meals.grams')} {t('dashboard.meals.protein')}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Prep: {personalizedMealPlan.lunch.prepTime}min | 
                    Cook: {personalizedMealPlan.lunch.cookTime}min
                  </div>
                </div>

                {/* Dinner */}
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">
                    🌙 {personalizedMealPlan.dinner.name}
                  </h4>
                  <p className="text-sm text-gray-600 mb-3">
                    {personalizedMealPlan.dinner.description}
                  </p>
                  <div className="flex justify-between text-sm text-gray-600 mb-3">
                    <span>{personalizedMealPlan.dinner.nutrition.calories} {t('dashboard.meals.calories')}</span>
                    <span>{personalizedMealPlan.dinner.nutrition.protein}{t('dashboard.meals.grams')} {t('dashboard.meals.protein')}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Prep: {personalizedMealPlan.dinner.prepTime}min | 
                    Cook: {personalizedMealPlan.dinner.cookTime}min
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">Daily Nutrition Summary</h4>
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