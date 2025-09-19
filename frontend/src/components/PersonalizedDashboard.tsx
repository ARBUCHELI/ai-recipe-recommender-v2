import React, { useState, useEffect } from 'react';
import { Clock, ShoppingBag, ChefHat, Calendar, Info, Brain } from 'lucide-react';
import { UserHealthProfile } from '../types/healthProfile';
import { enhancedAIService } from '../services/enhancedAIService';
import { HealthCalculationService } from '../services/healthCalculationService';
import { useToast } from '@/hooks/use-toast';
import CompactStoreCard from './CompactStoreCard';
import { convertNearbyStoreToCentralStore } from '../services/centralStoreService';
import { NearbyStore } from '../services/overpassService';
import { useTranslation } from '@/contexts/TranslationContext';

interface PersonalizedDashboardProps {
  healthProfile: UserHealthProfile;
  onUpdateProfile?: () => void;
  nearbyStores?: NearbyStore[];
}

export const PersonalizedDashboard: React.FC<PersonalizedDashboardProps> = ({
  healthProfile,
  onUpdateProfile,
  nearbyStores = []
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'meals' | 'timing' | 'shopping'>('meals');
  const [recipes, setRecipes] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAIReady, setIsAIReady] = useState(false);
  const [aiStatus, setAiStatus] = useState(t('dashboard.initializingAI'));
  const { toast } = useToast();
  
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

  // Initialize AI service on component mount
  useEffect(() => {
    const initializeAI = async () => {
      console.log('🤖 Starting AI initialization...');
      setAiStatus(t('dashboard.loadingAIModels'));
      
      try {
        await enhancedAIService.initialize((status) => {
          console.log('📊 AI Status:', status);
          setAiStatus(status);
        });
        
        setIsAIReady(true);
        setAiStatus(t('dashboard.aiReady'));
        console.log('✅ AI initialization successful');
        
        toast({
          title: t('dashboard.aiReady'),
          description: t('dashboard.advancedRecipeGeneration')
        });
      } catch (error) {
        console.error('❌ AI initialization failed:', error);
        setAiStatus(t('dashboard.aiUnavailable'));
        setIsAIReady(false);
      }
    };
    
    initializeAI();
  }, [toast]);

  const handleTabClick = (tab: 'meals' | 'timing' | 'shopping') => {
    console.log('🔄 Switching to tab:', tab);
    setActiveTab(tab);
  };

  const generateMeals = async () => {
    console.log('🍽️ Starting meal generation...', { isAIReady, isGenerating });
    
    if (isGenerating) {
      console.log('⚠️ Already generating, ignoring click');
      return;
    }
    
    setIsGenerating(true);
    
    try {
      const targetCaloriesPerMeal = {
        breakfast: Math.round((nutritionTargets?.totalCalories || 2000) * 0.25),
        lunch: Math.round((nutritionTargets?.totalCalories || 2000) * 0.35),
        dinner: Math.round((nutritionTargets?.totalCalories || 2000) * 0.40)
      };
      
      console.log('📊 Target calories per meal:', targetCaloriesPerMeal);
      
      // Ingredient options for variety
      const breakfastOptions = [
        ['eggs', 'spinach', 'avocado', 'toast'],
        ['oats', 'blueberries', 'almonds', 'honey'],
        ['yogurt', 'granola', 'strawberries', 'chia seeds']
      ];
      
      const lunchOptions = [
        ['chicken breast', 'quinoa', 'vegetables', 'olive oil'],
        ['salmon', 'rice', 'asparagus', 'lemon'],
        ['turkey', 'sweet potato', 'kale', 'feta']
      ];
      
      const dinnerOptions = [
        ['salmon fillet', 'broccoli', 'sweet potato', 'herbs'],
        ['chicken thighs', 'cauliflower', 'peppers', 'garlic'],
        ['beef', 'zucchini', 'tomato sauce', 'basil']
      ];
      
      // Select random ingredients
      const selectedBreakfast = breakfastOptions[Math.floor(Math.random() * breakfastOptions.length)];
      const selectedLunch = lunchOptions[Math.floor(Math.random() * lunchOptions.length)];
      const selectedDinner = dinnerOptions[Math.floor(Math.random() * dinnerOptions.length)];
      
      console.log('🥗 Selected ingredients:', { selectedBreakfast, selectedLunch, selectedDinner });
      
      let generatedRecipes = [];
      
      if (isAIReady) {
        console.log('🤖 Using AI generation');
        
        try {
          // User context for AI
          const userContext = {
            dietaryRestrictions: healthProfile.dietaryRestrictions || [],
            fitnessGoal: healthProfile.fitnessGoal || 'maintain_weight',
            healthConditions: healthProfile.healthConditions || [],
            targetCalories: nutritionTargets?.totalCalories || 2000,
            targetProtein: nutritionTargets?.protein.grams || 150
          };
          
          // Generate breakfast with AI
          const breakfastResult = await enhancedAIService.generateSimpleRecipe(
            selectedBreakfast,
            targetCaloriesPerMeal.breakfast,
            { ...userContext, mealType: 'breakfast' },
            'breakfast'
          );
          
          await new Promise(resolve => setTimeout(resolve, 200)); // Small delay
          
          // Generate lunch with AI
          const lunchResult = await enhancedAIService.generateSimpleRecipe(
            selectedLunch,
            targetCaloriesPerMeal.lunch,
            { ...userContext, mealType: 'lunch' },
            'lunch'
          );
          
          await new Promise(resolve => setTimeout(resolve, 200)); // Small delay
          
          // Generate dinner with AI
          const dinnerResult = await enhancedAIService.generateSimpleRecipe(
            selectedDinner,
            targetCaloriesPerMeal.dinner,
            { ...userContext, mealType: 'dinner' },
            'dinner'
          );
          
          console.log('✅ AI generation successful');
          
          generatedRecipes = [
            {
              id: 'breakfast',
              name: breakfastResult.name || 'AI Breakfast',
              description: breakfastResult.description || 'AI-generated breakfast',
              ingredients: breakfastResult.ingredients || selectedBreakfast,
              calories: targetCaloriesPerMeal.breakfast,
              protein: Math.round(targetCaloriesPerMeal.breakfast * 0.25 / 4), // ~25% protein
              type: 'Breakfast',
              aiGenerated: true
            },
            {
              id: 'lunch',
              name: lunchResult.name || 'AI Lunch',
              description: lunchResult.description || 'AI-generated lunch',
              ingredients: lunchResult.ingredients || selectedLunch,
              calories: targetCaloriesPerMeal.lunch,
              protein: Math.round(targetCaloriesPerMeal.lunch * 0.3 / 4), // ~30% protein
              type: 'Lunch',
              aiGenerated: true
            },
            {
              id: 'dinner',
              name: dinnerResult.name || 'AI Dinner',
              description: dinnerResult.description || 'AI-generated dinner',
              ingredients: dinnerResult.ingredients || selectedDinner,
              calories: targetCaloriesPerMeal.dinner,
              protein: Math.round(targetCaloriesPerMeal.dinner * 0.35 / 4), // ~35% protein
              type: 'Dinner',
              aiGenerated: true
            }
          ];
          
          toast({
            title: `${t('dashboard.aiSuccess')} 🤖`,
            description: t('dashboard.aiMealPlanGenerated')
          });
          
        } catch (aiError) {
          console.warn('⚠️ AI generation failed, using fallback:', aiError);
          throw aiError; // Fall through to fallback
        }
      } else {
        throw new Error('AI not ready'); // Fall through to fallback
      }
      
      setRecipes(generatedRecipes);
      
    } catch (error) {
      console.log('🔄 Using fallback recipe generation');
      
      // Fallback to structured recipes
      const fallbackRecipes = [
        {
          id: 'breakfast',
          name: t('dashboard.healthyBreakfast'),
          description: t('dashboard.nutritiousStart'),
          ingredients: ['2 eggs', 'spinach', 'avocado', 'whole grain toast'],
          calories: Math.round((nutritionTargets?.totalCalories || 2000) * 0.25),
          protein: 25,
          type: 'Breakfast',
          aiGenerated: false
        },
        {
          id: 'lunch',
          name: t('dashboard.balancedLunch'),
          description: t('dashboard.wellRoundedMeal'),
          ingredients: ['chicken breast', 'quinoa', 'mixed vegetables', 'olive oil'],
          calories: Math.round((nutritionTargets?.totalCalories || 2000) * 0.35),
          protein: 35,
          type: 'Lunch',
          aiGenerated: false
        },
        {
          id: 'dinner',
          name: t('dashboard.nutritiousDinner'),
          description: t('dashboard.perfectEnd'),
          ingredients: ['salmon fillet', 'broccoli', 'sweet potato'],
          calories: Math.round((nutritionTargets?.totalCalories || 2000) * 0.40),
          protein: 40,
          type: 'Dinner',
          aiGenerated: false
        }
      ];
      
      setRecipes(fallbackRecipes);
      
      toast({
        title: t('dashboard.mealsGenerated'),
        description: isAIReady ? t('dashboard.fallbackAfterError') : t('dashboard.aiNotReady')
      });
    } finally {
      setIsGenerating(false);
      console.log('✅ Meal generation completed');
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">{t('dashboard.title')}</h1>
        <p className="text-gray-600">{t('dashboard.subtitle')}</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => handleTabClick('meals')}
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
          onClick={() => handleTabClick('timing')}
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
          onClick={() => handleTabClick('shopping')}
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
          {/* AI Status and Generate Button */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Brain className={`w-5 h-5 ${isAIReady ? 'text-green-500' : 'text-amber-500 animate-pulse'}`} />
              <h3 className="text-lg font-semibold text-gray-800">
                {isAIReady ? t('dashboard.aiPoweredMealPlans') : t('dashboard.mealPlanGenerator')}
              </h3>
            </div>
            
            {!isAIReady && (
              <div className="mb-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-amber-800 text-sm font-medium">{aiStatus}</p>
              </div>
            )}
            
            {isAIReady && (
              <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-green-800 text-sm font-medium flex items-center justify-center gap-2">
                  <Brain className="w-4 h-4" />
                  {t('dashboard.aiReadyAdvanced')}
                </p>
              </div>
            )}
            
            <p className="text-gray-600 mb-4">
              {isAIReady ? t('dashboard.generateAIPowered') : t('dashboard.createPersonalized')}
            </p>
            <button
              onClick={generateMeals}
              disabled={isGenerating}
              className="bg-brand-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-professional-md hover:shadow-professional-lg disabled:opacity-50"
            >
              {isGenerating 
                ? (isAIReady ? `🤖 ${t('dashboard.aiGenerating')}` : `🔄 ${t('dashboard.generating')}`) 
                : (isAIReady ? `🤖 ${t('dashboard.generateAIRecipes')}` : `🍽️ ${t('dashboard.generateMealPlan')}`)}
            </button>
          </div>

          {/* Recipe Display */}
          {recipes.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {recipes.map((recipe) => (
                <div key={recipe.id} className={`bg-white rounded-xl p-6 border-2 ${
                  recipe.aiGenerated ? 'border-green-200 bg-gradient-to-br from-green-50 to-blue-50' : 'border-gray-200'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-lg font-semibold text-gray-800">
                      {recipe.type === 'Breakfast' && '🌅'} 
                      {recipe.type === 'Lunch' && '☀️'} 
                      {recipe.type === 'Dinner' && '🌙'} 
                      {recipe.name}
                    </h4>
                    {recipe.aiGenerated && (
                      <div className="flex items-center gap-1">
                        <Brain className="w-4 h-4 text-green-600" />
                        <span className="text-xs text-green-600 font-medium">AI</span>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{recipe.description}</p>
                  
                  <div className="mb-3">
                    <h5 className="text-sm font-medium text-gray-700 mb-1">{t('dashboard.ingredients')}:</h5>
                    <ul className="text-xs text-gray-600 space-y-1">
                      {recipe.ingredients.map((ingredient: string, index: number) => (
                        <li key={index}>• {ingredient}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{recipe.calories} {t('dashboard.meals.calories')}</span>
                    <span>{recipe.protein}g {t('dashboard.meals.protein')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {recipes.length > 0 && (
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h4 className="text-lg font-semibold text-gray-800 mb-3">{t('dashboard.dailyNutritionSummary')}</h4>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-600">
                    {recipes.reduce((total, recipe) => total + recipe.calories, 0)}
                  </div>
                  <div className="text-sm text-gray-600">{t('dashboard.meals.calories')}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {recipes.reduce((total, recipe) => total + recipe.protein, 0)}g
                  </div>
                  <div className="text-sm text-gray-600">{t('dashboard.meals.protein')}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">150g</div>
                  <div className="text-sm text-gray-600">{t('dashboard.meals.carbs')}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">67g</div>
                  <div className="text-sm text-gray-600">{t('dashboard.meals.fat')}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'timing' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-600" />
              {t('dashboard.timing.title')}
            </h3>
            
            <div className="space-y-4">
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <h4 className="text-lg font-semibold text-yellow-800 mb-2">{t('dashboard.timing.breakfast.title')}</h4>
                <p className="text-yellow-700 text-sm mb-1">{t('dashboard.timing.breakfast.time')}</p>
                <p className="text-yellow-600 text-sm">{t('dashboard.timing.breakfast.description')}</p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="text-lg font-semibold text-green-800 mb-2">{t('dashboard.timing.morningSnack.title')}</h4>
                <p className="text-green-700 text-sm mb-1">{t('dashboard.timing.morningSnack.time')}</p>
                <p className="text-green-600 text-sm">{t('dashboard.timing.morningSnack.description')}</p>
              </div>
              
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <h4 className="text-lg font-semibold text-orange-800 mb-2">{t('dashboard.timing.lunch.title')}</h4>
                <p className="text-orange-700 text-sm mb-1">{t('dashboard.timing.lunch.time')}</p>
                <p className="text-orange-600 text-sm">{t('dashboard.timing.lunch.description')}</p>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h4 className="text-lg font-semibold text-purple-800 mb-2">{t('dashboard.timing.afternoonSnack.title')}</h4>
                <p className="text-purple-700 text-sm mb-1">{t('dashboard.timing.afternoonSnack.time')}</p>
                <p className="text-purple-600 text-sm">{t('dashboard.timing.afternoonSnack.description')}</p>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="text-lg font-semibold text-blue-800 mb-2">{t('dashboard.timing.dinner.title')}</h4>
                <p className="text-blue-700 text-sm mb-1">{t('dashboard.timing.dinner.time')}</p>
                <p className="text-blue-600 text-sm">{t('dashboard.timing.dinner.description')}</p>
              </div>
            </div>
          </div>
          
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
        </div>
      )}

      {activeTab === 'shopping' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-emerald-600" />
              {t('dashboard.shopping.title')}
            </h3>
            <p className="text-gray-600 mb-6">
              {t('dashboard.shopping.subtitle')}
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('dashboard.shopping.recommendedCategories')}</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div>
                <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                  🥬 Fresh Produce
                </h4>
                <ul className="space-y-2">
                  <li className="text-sm text-gray-600 flex items-center gap-2">
                    <span className="text-green-600">•</span>
                    {t('dashboard.shopping.produce.leafyGreens')}
                  </li>
                  <li className="text-sm text-gray-600 flex items-center gap-2">
                    <span className="text-green-600">•</span>
                    {t('dashboard.shopping.produce.colorfulVegetables')}
                  </li>
                  <li className="text-sm text-gray-600 flex items-center gap-2">
                    <span className="text-green-600">•</span>
                    {t('dashboard.shopping.produce.freshFruits')}
                  </li>
                  <li className="text-sm text-gray-600 flex items-center gap-2">
                    <span className="text-green-600">•</span>
                    {t('dashboard.shopping.produce.herbs')}
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                  🥩 Lean Proteins
                </h4>
                <ul className="space-y-2">
                  <li className="text-sm text-gray-600 flex items-center gap-2">
                    <span className="text-red-600">•</span>
                    {t('dashboard.shopping.proteins.chickenBreast')}
                  </li>
                  <li className="text-sm text-gray-600 flex items-center gap-2">
                    <span className="text-red-600">•</span>
                    {t('dashboard.shopping.proteins.fishSeafood')}
                  </li>
                  <li className="text-sm text-gray-600 flex items-center gap-2">
                    <span className="text-red-600">•</span>
                    {t('dashboard.shopping.proteins.eggs')}
                  </li>
                  <li className="text-sm text-gray-600 flex items-center gap-2">
                    <span className="text-red-600">•</span>
                    {t('dashboard.shopping.proteins.plantBased')}
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                  🏺 Pantry Staples
                </h4>
                <ul className="space-y-2">
                  <li className="text-sm text-gray-600 flex items-center gap-2">
                    <span className="text-amber-600">•</span>
                    {t('dashboard.shopping.pantry.wholeGrains')}
                  </li>
                  <li className="text-sm text-gray-600 flex items-center gap-2">
                    <span className="text-amber-600">•</span>
                    {t('dashboard.shopping.pantry.healthyOils')}
                  </li>
                  <li className="text-sm text-gray-600 flex items-center gap-2">
                    <span className="text-amber-600">•</span>
                    {t('dashboard.shopping.pantry.nutsSeeds')}
                  </li>
                  <li className="text-sm text-gray-600 flex items-center gap-2">
                    <span className="text-amber-600">•</span>
                    {t('dashboard.shopping.pantry.spicesSeasonings')}
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {nearbyStores.length > 0 && (
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('dashboard.shopping.nearbyStores')}</h3>
              <p className="text-gray-600 mb-6">
                {t('dashboard.shopping.storesFound').replace('${count}', nearbyStores.length.toString())}
              </p>
              
              {/* Store Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {nearbyStores.map((store) => (
                  <CompactStoreCard
                    key={store.id}
                    store={convertNearbyStoreToCentralStore(store)}
                    onGetDirections={(centralStore) => {
                      console.log('🧭 Getting directions to store from dashboard:', centralStore.name);
                      // Open directions in new tab/app
                      if (centralStore.location) {
                        const directionsUrl = `https://www.google.com/maps/dir//${centralStore.location.lat},${centralStore.location.lng}`;
                        window.open(directionsUrl, '_blank');
                      }
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};