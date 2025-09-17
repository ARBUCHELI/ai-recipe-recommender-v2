import React, { useState, useEffect } from 'react';
import { Clock, Target, TrendingUp, ShoppingBag, ChefHat, Droplets, Info, Calendar } from 'lucide-react';
import { 
  UserHealthProfile, 
  PersonalizedMealPlan, 
  MealTimingRecommendation,
  ShoppingRecommendations 
} from '../types/HealthProfile';
import { HealthCalculationService } from '../services/healthCalculationService';
import { MealTimingService } from '../services/MealTimingService';
import { AIService } from '../services/aiService';
import { useToast } from '@/hooks/use-toast';
import { HealthDebugTest } from './HealthDebugTest';

interface PersonalizedDashboardProps {
  healthProfile: UserHealthProfile;
  onUpdateProfile?: () => void;
}

export const PersonalizedDashboard: React.FC<PersonalizedDashboardProps> = ({
  healthProfile,
  onUpdateProfile
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'meals' | 'timing' | 'shopping'>('overview');
  
  // Debug logging for activeTab changes
  useEffect(() => {
    console.log(`🎯 Active tab changed to: ${activeTab}`);
  }, [activeTab]);
  const [personalizedMealPlan, setPersonalizedMealPlan] = useState<PersonalizedMealPlan | null>(null);
  const [mealTiming, setMealTiming] = useState<MealTimingRecommendation | null>(null);
  const [shoppingRecommendations, setShoppingRecommendations] = useState<ShoppingRecommendations | null>(null);
  const [isGeneratingMeals, setIsGeneratingMeals] = useState(false);
  const { toast } = useToast();

  // Calculate health metrics on component mount
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
    console.log('🔄 PersonalizedDashboard useEffect triggered');
    console.log('📊 Health profile:', healthProfile);
    console.log('🎯 Nutrition targets:', nutritionTargets);
    
    // Generate meal timing recommendations
    try {
      console.log('⏰ Generating meal timing recommendations...');
      const timingRecs = MealTimingService.generateMealTiming(healthProfile);
      console.log('✅ Meal timing generated:', timingRecs);
      setMealTiming(timingRecs);
    } catch (error) {
      console.error('❌ Error generating meal timing:', error);
    }

    // Generate shopping recommendations (only if nutritionTargets are available)
    if (nutritionTargets) {
      try {
        console.log('🛒 Generating shopping recommendations...');
        const shoppingRecs = HealthCalculationService.generateShoppingRecommendations(healthProfile, nutritionTargets);
        console.log('✅ Shopping recommendations generated:', shoppingRecs);
        setShoppingRecommendations(shoppingRecs);
      } catch (error) {
        console.error('❌ Error generating shopping recommendations:', error);
      }
    } else {
      console.log('⚠️ No nutrition targets available for shopping recommendations');
    }
  }, [healthProfile, nutritionTargets]);

  const generatePersonalizedMeals = async () => {
    setIsGeneratingMeals(true);
    try {
      const aiService = AIService.getInstance();
      const mealPlan = await aiService.generatePersonalizedMealPlans(healthProfile, false);
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

  const TabButton: React.FC<{ id: string; label: string; icon: React.ReactNode; isActive: boolean }> = 
    ({ id, label, icon, isActive }) => {
      const handleClick = () => {
        console.log(`🔘 Tab button clicked: ${id}`);
        console.log(`📍 Current active tab: ${activeTab}`);
        setActiveTab(id as any);
        console.log(`✅ Tab should be set to: ${id}`);
      };
      
      return (
        <button
          onClick={handleClick}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            isActive 
              ? 'bg-amber-100 text-amber-800 border border-amber-200' 
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          {icon}
          {label}
        </button>
      );
    };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Debug Test Component - REMOVE THIS IN PRODUCTION */}
      <HealthDebugTest />
      
      {/* Current State Debug */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-bold text-yellow-800 mb-2">Current Dashboard State Debug</h3>
        <div className="text-sm space-y-1">
          <div>Health Response Success: {healthResponse.success ? '✅' : '❌'}</div>
          <div>Meal Timing: {mealTiming ? '✅' : '❌'}</div>
          <div>Shopping Recommendations: {shoppingRecommendations ? '✅' : '❌'}</div>
          <div>Personalized Meal Plan: {personalizedMealPlan ? '✅' : '❌'}</div>
          <div>Active Tab: {activeTab}</div>
          <details className="mt-2">
            <summary className="cursor-pointer font-medium">View Raw Data</summary>
            <pre className="text-xs mt-2 bg-white p-2 rounded border overflow-auto max-h-32">
              {JSON.stringify({ mealTiming, shoppingRecommendations, personalizedMealPlan }, null, 1)}
            </pre>
          </details>
        </div>
      </div>
      
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Your Personalized Health Dashboard</h1>
        <p className="text-gray-600">
          Tailored recommendations based on your health profile and goals
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <TabButton 
          id="overview" 
          label="Overview" 
          icon={<Target className="w-4 h-4" />}
          isActive={activeTab === 'overview'}
        />
        <TabButton 
          id="meals" 
          label="Meal Plans" 
          icon={<ChefHat className="w-4 h-4" />}
          isActive={activeTab === 'meals'}
        />
        <TabButton 
          id="timing" 
          label="Meal Timing" 
          icon={<Clock className="w-4 h-4" />}
          isActive={activeTab === 'timing'}
        />
        <TabButton 
          id="shopping" 
          label="Shopping" 
          icon={<ShoppingBag className="w-4 h-4" />}
          isActive={activeTab === 'shopping'}
        />
      </div>

      {/* Tab Content */}
      {console.log('🔍 Rendering tab content. Active tab:', activeTab)}
      
      {!healthResponse.success ? (
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
      ) : (
        <div>
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Health Metrics */}
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                  Health Metrics
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">BMI</span>
                    <span className="font-medium">{healthResponse.metrics?.bmi?.toFixed(1) || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Category</span>
                    <span className={`font-medium px-2 py-1 rounded text-sm capitalize ${
                      healthResponse.metrics?.bmiCategory === 'normal' ? 'bg-green-100 text-green-800' :
                      healthResponse.metrics?.bmiCategory === 'underweight' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {healthResponse.metrics?.bmiCategory || 'Unknown'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">BMR</span>
                    <span className="font-medium">{Math.round(healthResponse.metrics?.bmr || 0)} cal/day</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">TDEE</span>
                    <span className="font-medium">{Math.round(healthResponse.metrics?.tdee || 0)} cal/day</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Water Needs</span>
                    <span className="font-medium">{healthResponse.metrics?.waterNeed || 0}L/day</span>
                  </div>
                </div>
              </div>

              {/* Nutrition Targets */}
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-amber-600" />
                  Daily Targets
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Calories</span>
                    <span className="font-medium text-lg text-amber-600">
                      {nutritionTargets?.totalCalories || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Protein</span>
                    <span className="font-medium">{nutritionTargets?.protein?.grams || 0}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Carbs</span>
                    <span className="font-medium">{nutritionTargets?.carbs?.grams || 0}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fat</span>
                    <span className="font-medium">{nutritionTargets?.fat?.grams || 0}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fiber</span>
                    <span className="font-medium">{nutritionTargets?.fiber || 0}g</span>
                  </div>
                </div>
              </div>

              {/* Health Score */}
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Health Score</h3>
                <div className="text-center">
                  <div className="text-4xl font-bold text-emerald-600 mb-2">
                    {healthResponse.metrics?.healthScore || 0}/100
                  </div>
                  <div className="text-sm text-gray-600 mb-4">
                    {(healthResponse.metrics?.healthScore || 0) >= 80 ? 'Excellent' :
                     (healthResponse.metrics?.healthScore || 0) >= 70 ? 'Good' :
                     (healthResponse.metrics?.healthScore || 0) >= 60 ? 'Fair' : 'Needs Improvement'}
                  </div>
                  <div className="space-y-2">
                    {(healthResponse.metrics?.recommendations || []).slice(0, 3).map((rec, index) => (
                      <div key={index} className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                        {rec}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MEALS TAB */}
          {activeTab === 'meals' && (
            <div className="space-y-6">
              {console.log('🍽️ Rendering meals tab')}
              {/* Generate Meals Button */}
              <div className="bg-white rounded-xl p-6 border border-gray-200 text-center">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">AI-Generated Meal Plans</h3>
                <p className="text-gray-600 mb-4">
                  Get personalized breakfast, lunch, and dinner recipes tailored to your calorie targets and dietary preferences.
                </p>
                <button
                  onClick={generatePersonalizedMeals}
                  disabled={isGeneratingMeals}
                  className="bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isGeneratingMeals ? 'Generating...' : 'Generate Personalized Meals'}
                </button>
              </div>

              {/* Meal Plans Display */}
              {personalizedMealPlan && (
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
                      <span>{personalizedMealPlan.breakfast.nutrition.calories} cal</span>
                      <span>{personalizedMealPlan.breakfast.nutrition.protein}g protein</span>
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
                      <span>{personalizedMealPlan.lunch.nutrition.calories} cal</span>
                      <span>{personalizedMealPlan.lunch.nutrition.protein}g protein</span>
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
                      <span>{personalizedMealPlan.dinner.nutrition.calories} cal</span>
                      <span>{personalizedMealPlan.dinner.nutrition.protein}g protein</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Prep: {personalizedMealPlan.dinner.prepTime}min | 
                      Cook: {personalizedMealPlan.dinner.cookTime}min
                    </div>
                  </div>
                </div>
              )}

              {personalizedMealPlan && (
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">Daily Nutrition Summary</h4>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-amber-600">
                        {personalizedMealPlan.totalNutrition.calories}
                      </div>
                      <div className="text-sm text-gray-600">Total Calories</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {personalizedMealPlan.totalNutrition.protein}g
                      </div>
                      <div className="text-sm text-gray-600">Protein</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {personalizedMealPlan.totalNutrition.carbs}g
                      </div>
                      <div className="text-sm text-gray-600">Carbs</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {personalizedMealPlan.totalNutrition.fat}g
                      </div>
                      <div className="text-sm text-gray-600">Fat</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TIMING TAB */}
          {activeTab === 'timing' && (
            <div className="space-y-6">
              {console.log('⏰ Rendering timing tab')}
          {!mealTiming ? (
            <div className="bg-white rounded-xl p-6 border border-gray-200 text-center">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Generating Meal Timing...</h3>
              <p className="text-gray-600">Please wait while we calculate your optimal meal times.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Meal Times */}
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-amber-600" />
                  Optimal Meal Times
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {mealTiming.mealTimes.map((time, index) => (
                    <div key={index} className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                      <div className="text-xl font-bold text-amber-800">
                        {time}
                      </div>
                      <div className="text-sm text-amber-600">
                        Meal {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
                {mealTiming.snackTimes.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-700 mb-2">Snack Times:</h4>
                    <div className="flex gap-2 flex-wrap">
                      {mealTiming.snackTimes.map((time, index) => (
                        <span key={index} className="bg-gray-100 px-3 py-1 rounded text-sm">
                          {time}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Food Category Timing */}
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Food Category Timing</h3>
                <div className="space-y-4">
                  {Object.entries(mealTiming.categoryTiming).map(([category, timing]) => (
                    <div key={category} className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-700 capitalize mb-2">
                        {category.replace('_', ' ')}
                      </h4>
                      <div className="flex gap-2 mb-2">
                        {timing.bestTimes.map((time, index) => (
                          <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                            {time}
                          </span>
                        ))}
                      </div>
                      <p className="text-sm text-gray-600">{timing.reasoning}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hydration Schedule */}
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Droplets className="w-5 h-5 text-blue-600" />
                  Hydration Schedule
                </h3>
                <div className="space-y-2">
                  {mealTiming.hydrationSchedule.map((hydration, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-blue-600">{hydration.time}</span>
                        <span className="text-sm text-gray-600">{hydration.amount}</span>
                      </div>
                      <span className="text-xs text-gray-500">{hydration.note}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Metabolism Tips */}
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Info className="w-5 h-5 text-green-600" />
                  Metabolism Tips
                </h3>
                <ul className="space-y-2">
                  {mealTiming.metabolismTips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">•</span>
                      <span className="text-gray-700">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Fasting Window */}
              {mealTiming.fastingWindow && (
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Intermittent Fasting Window
                  </h3>
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-purple-800">
                        {mealTiming.fastingWindow.duration}-Hour Fast
                      </span>
                      <span className="text-sm text-purple-600">
                        {mealTiming.fastingWindow.start} - {mealTiming.fastingWindow.end}
                      </span>
                    </div>
                    <p className="text-sm text-purple-700">
                      {mealTiming.fastingWindow.recommended 
                        ? 'Recommended for your weight loss goal'
                        : 'Optional based on your schedule'
                      }
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
          )}

          {activeTab === 'shopping' && (
        <div className="space-y-6">
          {console.log('🛒 Rendering shopping tab')}
          {!shoppingRecommendations ? (
            <div className="bg-white rounded-xl p-6 border border-gray-200 text-center">
              <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Generating Shopping Recommendations...</h3>
              <p className="text-gray-600">Please wait while we create your personalized shopping list.</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-emerald-600" />
                Shopping Recommendations
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Focus Areas */}
                <div>
                  <h4 className="font-medium text-gray-700 mb-3">Focus Areas</h4>
                  <div className="space-y-3">
                    {shoppingRecommendations.focusAreas.map((area, index) => (
                      <div key={index} className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                        <div className="font-medium text-emerald-800 mb-1">
                          {area.category}
                        </div>
                        <div className="text-sm text-emerald-700 mb-2">
                          Target: {area.targetPercentage}% of calories
                        </div>
                        <p className="text-sm text-emerald-600">{area.reasoning}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Priority Items */}
                <div>
                  <h4 className="font-medium text-gray-700 mb-3">Priority Items</h4>
                  <div className="space-y-2">
                    {shoppingRecommendations.priorityItems.map((item, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded border">
                        <div className="font-medium text-gray-800">{item.item}</div>
                        <div className="text-sm text-gray-600">{item.reason}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
          )}
        </div>
      )}
    </div>
  );
};