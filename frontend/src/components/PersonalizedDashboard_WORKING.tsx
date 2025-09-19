import React, { useState } from 'react';
import { Clock, ShoppingBag, ChefHat, Calendar, Info } from 'lucide-react';
import { UserHealthProfile } from '../types/healthProfile';

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
  const [recipes, setRecipes] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleTabClick = (tab: 'meals' | 'timing' | 'shopping') => {
    console.log('🔄 Switching to tab:', tab);
    setActiveTab(tab);
  };

  const generateMeals = async () => {
    console.log('🍽️ Starting meal generation...');
    setIsGenerating(true);
    
    // Simulate generation delay
    setTimeout(() => {
      const mockRecipes = [
        {
          id: 'breakfast',
          name: 'Protein Power Breakfast',
          description: 'High-protein breakfast to fuel your day',
          ingredients: ['2 eggs', '1 slice whole grain toast', '1/2 avocado', '1 cup spinach'],
          calories: 400,
          protein: 25,
          type: 'Breakfast'
        },
        {
          id: 'lunch', 
          name: 'Balanced Lunch Bowl',
          description: 'Nutritious lunch with lean protein and vegetables',
          ingredients: ['150g chicken breast', '1 cup quinoa', '2 cups mixed vegetables', '1 tbsp olive oil'],
          calories: 550,
          protein: 35,
          type: 'Lunch'
        },
        {
          id: 'dinner',
          name: 'Healthy Dinner Plate',
          description: 'Well-balanced dinner for optimal nutrition',
          ingredients: ['180g salmon fillet', '1 cup broccoli', '1 medium sweet potato'],
          calories: 500,
          protein: 40,
          type: 'Dinner'
        }
      ];
      
      setRecipes(mockRecipes);
      setIsGenerating(false);
      console.log('✅ Meals generated successfully!');
    }, 1500);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Personalized Dashboard</h1>
        <p className="text-gray-600">Your health-focused meal planning assistant</p>
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
          Meals
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
          Timing
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
          Shopping
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'meals' && (
        <div className="space-y-6">
          {/* Generate Button */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Generate Your Meal Plan</h3>
            <p className="text-gray-600 mb-4">
              Create personalized meals based on your health profile and goals
            </p>
            <button
              onClick={generateMeals}
              disabled={isGenerating}
              className="bg-brand-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-professional-md hover:shadow-professional-lg disabled:opacity-50"
            >
              {isGenerating ? '🔄 Generating...' : '🍽️ Generate Meal Plan'}
            </button>
          </div>

          {/* Recipe Display */}
          {recipes.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {recipes.map((recipe) => (
                <div key={recipe.id} className="bg-white rounded-xl p-6 border border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">
                    {recipe.type === 'Breakfast' && '🌅'} 
                    {recipe.type === 'Lunch' && '☀️'} 
                    {recipe.type === 'Dinner' && '🌙'} 
                    {recipe.name}
                  </h4>
                  <p className="text-sm text-gray-600 mb-3">{recipe.description}</p>
                  
                  <div className="mb-3">
                    <h5 className="text-sm font-medium text-gray-700 mb-1">Ingredients:</h5>
                    <ul className="text-xs text-gray-600 space-y-1">
                      {recipe.ingredients.map((ingredient: string, index: number) => (
                        <li key={index}>• {ingredient}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{recipe.calories} calories</span>
                    <span>{recipe.protein}g protein</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {recipes.length > 0 && (
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h4 className="text-lg font-semibold text-gray-800 mb-3">Daily Nutrition Summary</h4>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-600">
                    {recipes.reduce((total, recipe) => total + recipe.calories, 0)}
                  </div>
                  <div className="text-sm text-gray-600">Calories</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {recipes.reduce((total, recipe) => total + recipe.protein, 0)}g
                  </div>
                  <div className="text-sm text-gray-600">Protein</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">150g</div>
                  <div className="text-sm text-gray-600">Carbs</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">67g</div>
                  <div className="text-sm text-gray-600">Fat</div>
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
              Meal Timing Recommendations
            </h3>
            
            <div className="space-y-4">
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <h4 className="text-lg font-semibold text-yellow-800 mb-2">Breakfast</h4>
                <p className="text-yellow-700 text-sm mb-1">Best Time: 7:00 AM - 9:00 AM</p>
                <p className="text-yellow-600 text-sm">Start your day with protein and complex carbs</p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="text-lg font-semibold text-green-800 mb-2">Morning Snack</h4>
                <p className="text-green-700 text-sm mb-1">Best Time: 10:00 AM - 11:00 AM</p>
                <p className="text-green-600 text-sm">Light snack if needed, focus on fruits or nuts</p>
              </div>
              
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <h4 className="text-lg font-semibold text-orange-800 mb-2">Lunch</h4>
                <p className="text-orange-700 text-sm mb-1">Best Time: 12:00 PM - 2:00 PM</p>
                <p className="text-orange-600 text-sm">Balanced meal with lean protein and vegetables</p>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h4 className="text-lg font-semibold text-purple-800 mb-2">Afternoon Snack</h4>
                <p className="text-purple-700 text-sm mb-1">Best Time: 3:00 PM - 4:00 PM</p>
                <p className="text-purple-600 text-sm">Keep energy steady with healthy snacks</p>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="text-lg font-semibold text-blue-800 mb-2">Dinner</h4>
                <p className="text-blue-700 text-sm mb-1">Best Time: 6:00 PM - 8:00 PM</p>
                <p className="text-blue-600 text-sm">Light but nutritious, finish 3 hours before bed</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Info className="w-5 h-5 text-green-600" />
              Timing Tips
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="text-green-600 mt-1">•</span>
                <span className="text-gray-700">Eat every 3-4 hours to maintain stable blood sugar</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-600 mt-1">•</span>
                <span className="text-gray-700">Have your largest meal when you're most active</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-600 mt-1">•</span>
                <span className="text-gray-700">Stop eating 2-3 hours before bedtime for better sleep</span>
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
              Shopping List Generator
            </h3>
            <p className="text-gray-600 mb-6">
              Based on your meal plan and health goals, here are recommended categories to focus on
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Recommended Categories</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div>
                <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                  🥬 Fresh Produce
                </h4>
                <ul className="space-y-2">
                  <li className="text-sm text-gray-600 flex items-center gap-2">
                    <span className="text-green-600">•</span>
                    Leafy greens (spinach, kale)
                  </li>
                  <li className="text-sm text-gray-600 flex items-center gap-2">
                    <span className="text-green-600">•</span>
                    Colorful vegetables
                  </li>
                  <li className="text-sm text-gray-600 flex items-center gap-2">
                    <span className="text-green-600">•</span>
                    Fresh fruits
                  </li>
                  <li className="text-sm text-gray-600 flex items-center gap-2">
                    <span className="text-green-600">•</span>
                    Herbs and aromatics
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
                    Chicken breast
                  </li>
                  <li className="text-sm text-gray-600 flex items-center gap-2">
                    <span className="text-red-600">•</span>
                    Fish and seafood
                  </li>
                  <li className="text-sm text-gray-600 flex items-center gap-2">
                    <span className="text-red-600">•</span>
                    Eggs
                  </li>
                  <li className="text-sm text-gray-600 flex items-center gap-2">
                    <span className="text-red-600">•</span>
                    Plant-based proteins
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
                    Whole grains
                  </li>
                  <li className="text-sm text-gray-600 flex items-center gap-2">
                    <span className="text-amber-600">•</span>
                    Healthy oils
                  </li>
                  <li className="text-sm text-gray-600 flex items-center gap-2">
                    <span className="text-amber-600">•</span>
                    Nuts and seeds
                  </li>
                  <li className="text-sm text-gray-600 flex items-center gap-2">
                    <span className="text-amber-600">•</span>
                    Spices and seasonings
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {nearbyStores.length > 0 && (
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Nearby Stores</h3>
              <p className="text-gray-600">
                {nearbyStores.length} stores found near your location
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};