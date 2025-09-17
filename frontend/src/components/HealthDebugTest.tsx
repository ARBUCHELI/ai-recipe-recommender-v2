import React, { useState } from 'react';
import { MealTimingService } from '../services/MealTimingService';
import { HealthCalculationService } from '../services/healthCalculationService';
import { ACTIVITY_LEVELS } from '../types/HealthProfile';

export const HealthDebugTest: React.FC = () => {
  const [testResults, setTestResults] = useState<any>(null);

  const runTest = () => {
    console.log('🧪 Running health profile test...');
    
    // Create a simple test profile
    const testProfile = {
      userId: 'test-user',
      height: 175,
      weight: 70,
      age: 30,
      gender: 'male' as const,
      activityLevel: ACTIVITY_LEVELS.find(level => level.id === 'moderately_active')!,
      fitnessGoal: 'maintain_weight',
      dietaryRestrictions: [],
      healthConditions: [],
      numberOfMeals: 3,
      wakeUpTime: '07:00',
      bedTime: '22:00',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    console.log('📊 Test profile created:', testProfile);

    try {
      // Test meal timing generation
      console.log('⏰ Testing meal timing generation...');
      const mealTiming = MealTimingService.generateMealTiming(testProfile);
      console.log('✅ Meal timing result:', mealTiming);

      // Test health calculation
      console.log('🧮 Testing health calculation...');
      const healthResponse = HealthCalculationService.createHealthProfile({
        height: testProfile.height,
        weight: testProfile.weight,
        age: testProfile.age,
        gender: testProfile.gender,
        activityLevelId: testProfile.activityLevel.id,
        fitnessGoalId: testProfile.fitnessGoal,
        dietaryRestrictions: testProfile.dietaryRestrictions,
        healthConditions: testProfile.healthConditions,
        mealsPerDay: testProfile.numberOfMeals,
        wakeUpTime: testProfile.wakeUpTime,
        bedTime: testProfile.bedTime
      });
      console.log('✅ Health response result:', healthResponse);

      // Test shopping recommendations if nutrition targets are available
      if (healthResponse.success && healthResponse.nutritionTargets) {
        console.log('🛒 Testing shopping recommendations...');
        const shoppingRecs = HealthCalculationService.generateShoppingRecommendations(
          testProfile, 
          healthResponse.nutritionTargets
        );
        console.log('✅ Shopping recommendations result:', shoppingRecs);

        setTestResults({
          profile: testProfile,
          mealTiming,
          healthResponse,
          shoppingRecs,
          success: true
        });
      } else {
        setTestResults({
          profile: testProfile,
          mealTiming,
          healthResponse,
          error: 'Health response failed or no nutrition targets'
        });
      }

    } catch (error) {
      console.error('❌ Test failed:', error);
      setTestResults({
        profile: testProfile,
        error: error.message,
        success: false
      });
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg border border-gray-200 m-4">
      <h2 className="text-xl font-bold mb-4">Health Profile Debug Test</h2>
      
      <button
        onClick={runTest}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mb-4"
      >
        Run Test
      </button>

      {testResults && (
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded">
            <h3 className="font-semibold mb-2">Test Results:</h3>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(testResults, null, 2)}
            </pre>
          </div>

          {testResults.success && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 bg-green-50 border border-green-200 rounded">
                <h4 className="font-semibold text-green-800">Meal Times</h4>
                <p className="text-sm">
                  {testResults.mealTiming?.mealTimes?.length || 0} meal times generated
                </p>
              </div>
              
              <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                <h4 className="font-semibold text-blue-800">Health Metrics</h4>
                <p className="text-sm">
                  BMI: {testResults.healthResponse?.metrics?.bmi?.toFixed(1)}
                </p>
              </div>
              
              <div className="p-3 bg-purple-50 border border-purple-200 rounded">
                <h4 className="font-semibold text-purple-800">Shopping Items</h4>
                <p className="text-sm">
                  {testResults.shoppingRecs?.priorityItems?.length || 0} priority items
                </p>
              </div>
            </div>
          )}

          {testResults.error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded">
              <h4 className="font-semibold text-red-800">Error:</h4>
              <p className="text-sm text-red-700">{testResults.error}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};