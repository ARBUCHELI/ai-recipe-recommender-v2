import React, { useState, useEffect } from 'react';
import { Loader2, Sparkles, Calendar, RefreshCw, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

import { Navigation, TabType } from '@/components/Navigation';
import { HomePage } from '@/components/HomePage';
import { FileUpload } from '@/components/FileUpload';
import { RecipeCard } from '@/components/RecipeCard';
import { ShoppingList } from '@/components/ShoppingList';
import { NearbyStores } from '@/components/NearbyStores';
import { AdminPanel } from '@/components/AdminPanel';
import { PDFExport } from '@/components/PDFExport';
import { Footer } from '@/components/Footer';
import { HealthProfileModal } from '@/components/HealthProfileModal';
import { PersonalizedDashboard } from '@/components/PersonalizedDashboard';
import { ReviewsPage } from '@/components/reviews/ReviewsPage';
import { FeaturedReviews } from '@/components/reviews/FeaturedReviews';
import { AnalyticsTab } from '@/components/analytics/AnalyticsTab';
import { useTranslation } from '@/contexts/TranslationContext';

import { AIService, Recipe, Ingredient } from '@/services/aiService';
import { enhancedAIService } from '@/services/enhancedAIService';
import { recipeService } from '@/services/recipeService';
import { ingredientService } from '@/services/ingredientService';
import { LocalStorageService } from '@/utils/localStorage';
import { useAuth } from '@/contexts/AuthContext';
import { UserHealthProfile } from '@/types/healthProfile';

const Index = () => {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [uploadedIngredients, setUploadedIngredients] = useState<Ingredient[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingRecipes, setIsLoadingRecipes] = useState(false);
  const [categories, setCategories] = useState(LocalStorageService.getCategories());
  const [showHealthProfileModal, setShowHealthProfileModal] = useState(false);
  
  // Debug modal state changes
  useEffect(() => {
    console.log('📺 Health Profile Modal state changed:', showHealthProfileModal);
  }, [showHealthProfileModal]);
  const [healthProfile, setHealthProfile] = useState<UserHealthProfile | null>(null);
  const [nearbyStores, setNearbyStores] = useState<any[]>([]);
  
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const aiService = AIService.getInstance();

  // Load user-specific data when user changes
  useEffect(() => {
    if (isAuthenticated && user) {
      loadUserRecipes();
      loadIngredientCategories();
    } else {
      // Clear recipes when user logs out
      setRecipes([]);
      setUploadedIngredients([]);
    }
  }, [isAuthenticated, user]);

  const loadUserRecipes = async () => {
    console.log('🔄 Loading user recipes...');
    console.log('📊 Authentication status in loadUserRecipes:', isAuthenticated);
    
    if (!isAuthenticated) {
      console.log('❌ Cannot load recipes - user not authenticated');
      return;
    }
    
    setIsLoadingRecipes(true);
    try {
      console.log('📡 Making request to recipeService.getUserRecipes...');
      const result = await recipeService.getUserRecipes({ limit: 50 });
      console.log('📥 Received result from recipeService:', result);
      
      if (result.success && result.recipes) {
        console.log(`✅ Successfully loaded ${result.recipes.length} recipes:`, result.recipes);
        setRecipes(result.recipes);
      } else {
        console.error('❌ Failed to load recipes:', result.message);
      }
    } catch (error) {
      console.error('❌ Error loading recipes:', error);
    } finally {
      setIsLoadingRecipes(false);
      console.log('✅ loadUserRecipes completed');
    }
  };

  const loadIngredientCategories = async () => {
    try {
      const result = await ingredientService.getIngredientCategories();
      if (result.success && result.categories) {
        const categoryObject = result.categories.reduce((acc, category) => {
          acc[category] = []; // We'll populate these as needed
          return acc;
        }, {} as { [key: string]: string[] });
        setCategories(categoryObject);
        LocalStorageService.saveGlobalCategories(categoryObject);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleIngredientsUpload = (ingredients: Ingredient[]) => {
    setUploadedIngredients(prev => [...prev, ...ingredients]);
    toast({
      title: "Ingredients Uploaded",
      description: `Added ${ingredients.length} ingredients to your list.`
    });
  };

  const handleRemoveIngredient = (index: number) => {
    setUploadedIngredients(prev => prev.filter((_, i) => i !== index));
  };

  const generateSingleRecipe = async () => {
    console.log('🚀 Starting recipe generation...');
    console.log('📊 Authentication status:', isAuthenticated);
    console.log('🥕 Uploaded ingredients:', uploadedIngredients);
    
    if (!isAuthenticated) {
      console.log('❌ User not authenticated');
      toast({
        title: "Please Sign In",
        description: "You need to be signed in to generate recipes.",
        variant: "destructive"
      });
      return;
    }

    if (uploadedIngredients.length === 0) {
      console.log('❌ No ingredients uploaded');
      toast({
        title: "No Ingredients",
        description: "Please upload some ingredients first.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      console.log('🔄 Generating recipe with ingredients:', uploadedIngredients);
      
      // Generate recipe with auto-save enabled
      const recipe = await aiService.generateRecipe(uploadedIngredients, true);
      console.log('✅ Recipe generated:', recipe);
      
      console.log('🔄 Refreshing recipes list...');
      // Refresh the recipes list to show the saved recipe
      await loadUserRecipes();
      console.log('✅ Recipes list refreshed');
      
      toast({
        title: "Recipe Generated & Saved!",
        description: `Created "${recipe.name}" and saved it to your account.`
      });
      
      // Auto-switch to recipes tab
      console.log('🔄 Switching to recipes tab');
      setActiveTab('recipes');
    } catch (error) {
      console.error('❌ Recipe generation error:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate recipe. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
      console.log('✅ Recipe generation process completed');
    }
  };

  const generateMealPlan = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Please Sign In",
        description: "You need to be signed in to generate meal plans.",
        variant: "destructive"
      });
      return;
    }

    if (uploadedIngredients.length === 0) {
      toast({
        title: "No Ingredients",
        description: "Please upload some ingredients first.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      console.log('🍲 Starting AI-powered 3-day meal plan generation with ingredients:', uploadedIngredients);
      
      // Initialize AI service if needed
      console.log('🤖 Initializing Enhanced AI Service...');
      try {
        await enhancedAIService.initialize((status) => {
          console.log('🔄 AI Status:', status);
        });
        console.log('✅ Enhanced AI Service initialized successfully!');
      } catch (initError) {
        console.error('❌ Enhanced AI initialization failed:', initError);
        throw new Error(`AI Initialization failed: ${initError.message}`);
      }
      
      // Create different ingredient combinations for variety
      const baseIngredients = uploadedIngredients.map(ing => ing.name);
      
      // Generate 3 different recipes with varying ingredients and contexts
      const recipes: Recipe[] = [];
      
      for (let day = 0; day < 3; day++) {
        // Create variety by shuffling ingredients and adding different contexts
        const shuffledIngredients = [...baseIngredients].sort(() => Math.random() - 0.5);
        const primaryIngredients = shuffledIngredients.slice(0, Math.min(4, shuffledIngredients.length));
        
        // Create unique context for each day
        const userContext = {
          day: day + 1,
          creativity: 0.7 + (day * 0.1), // Increasing creativity each day
          cuisineHint: ['mediterranean', 'asian', 'american', 'mexican', 'italian'][day % 5],
          cookingStyle: ['grilled', 'roasted', 'sautéed', 'steamed', 'baked'][day % 5],
          mealComplexity: ['simple', 'moderate', 'elaborate'][day % 3],
          timestamp: Date.now() + (day * 1000) // Unique timestamp for each
        };
        
        console.log(`🍴 Generating Day ${day + 1} recipe with ingredients:`, primaryIngredients, 'context:', userContext);
        
        // Generate AI recipe with variety
        const aiResult = await enhancedAIService.generateSimpleRecipe(
          primaryIngredients,
          450 + (day * 50), // Vary calories: 450, 500, 550
          userContext,
          'main-course'
        );
        
        // Convert AI result to Recipe format and save
        const recipe: Recipe = {
          id: `day-${day + 1}-recipe-${Date.now()}-${day}`,
          name: `Day ${day + 1}: ${aiResult.name}`,
          description: aiResult.description,
          ingredients: aiResult.ingredients,
          instructions: aiResult.instructions,
          prepTime: 15 + (day * 5),
          cookTime: 20 + (day * 10),
          servings: 2 + day, // Vary servings: 2, 3, 4
          nutrition: {
            calories: 450 + (day * 50),
            protein: 25 + (day * 5),
            carbs: 35 + (day * 8),
            fat: 15 + (day * 3)
          }
        };
        
        console.log(`✅ Generated Day ${day + 1} recipe:`, recipe.name);
        
        // Save each recipe to the database
        try {
          const saveResult = await aiService.saveGeneratedRecipe(recipe);
          if (saveResult.success && saveResult.savedRecipe) {
            recipes.push(saveResult.savedRecipe);
            console.log(`💾 Saved Day ${day + 1} recipe to database`);
          } else {
            recipes.push(recipe); // Use the generated recipe if save fails
            console.warn(`⚠️ Failed to save Day ${day + 1} recipe, keeping in memory:`, saveResult.message);
          }
        } catch (error) {
          recipes.push(recipe); // Use the generated recipe if save fails
          console.error(`❌ Error saving Day ${day + 1} recipe:`, error);
        }
        
        // Small delay between generations for variety
        if (day < 2) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      // Refresh the recipes list to show the saved recipes
      await loadUserRecipes();
      
      toast({
        title: "AI Success! 🧠",
        description: `Created a diverse 3-day meal plan with ${recipes.length} unique AI-generated recipes!`
      });
      
      console.log('✅ AI-powered 3-day meal plan completed:', recipes.map(r => r.name));
      
      // Auto-switch to recipes tab
      setActiveTab('recipes');
    } catch (error) {
      console.error('❌ AI meal plan generation failed:', error);
      
      // Fallback to the original method if AI fails
      console.log('🔄 AI failed, using fallback meal plan generation...');
      try {
        const fallbackPlan = await aiService.generateMealPlan(uploadedIngredients, 3, true);
        await loadUserRecipes();
        
        toast({
          title: "Fallback Plan Generated",
          description: `AI temporarily unavailable. Created a 3-day meal plan with ${fallbackPlan.recipes.length} recipes using fallback method.`,
          variant: "destructive"
        });
        
        setActiveTab('recipes');
      } catch (fallbackError) {
        console.error('❌ Fallback meal plan generation also failed:', fallbackError);
        toast({
          title: "Generation Failed",
          description: "Failed to generate meal plan. Please try again.",
          variant: "destructive"
        });
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const clearAllRecipes = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Please Sign In",
        description: "You need to be signed in to manage recipes.",
        variant: "destructive"
      });
      return;
    }

    // For now, just refresh the list (user would need to delete recipes individually)
    // In a full implementation, you might add a "delete all" endpoint
    await loadUserRecipes();
    toast({
      title: "Recipes Refreshed",
      description: "Recipe list has been refreshed from your account."
    });
  };

  const handleDeleteRecipe = async (recipeId: string, recipeName: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Please Sign In",
        description: "You need to be signed in to delete recipes.",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log(`🗑️ Deleting recipe: ${recipeName} (ID: ${recipeId})`);
      const result = await recipeService.deleteRecipe(recipeId);
      
      if (result.success) {
        console.log('✅ Recipe deleted successfully');
        
        // Remove the recipe from local state immediately for better UX
        setRecipes(prev => prev.filter(recipe => recipe.id !== recipeId));
        
        toast({
          title: "Recipe Deleted",
          description: `"${recipeName}" has been permanently deleted.`
        });
      } else {
        console.error('❌ Failed to delete recipe:', result.message);
        toast({
          title: "Delete Failed",
          description: result.message || "Failed to delete recipe. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('❌ Error deleting recipe:', error);
      toast({
        title: "Delete Failed",
        description: "An error occurred while deleting the recipe. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleHealthProfileSubmit = (profile: UserHealthProfile) => {
    console.log('💪 Health profile submitted:', profile);
    console.log('💾 Setting health profile in state...');
    setHealthProfile(profile);
    console.log('❌ Closing health profile modal...');
    setShowHealthProfileModal(false);
    
    console.log('✅ Showing success toast...');
    toast({
      title: "Health Profile Saved!",
      description: "Your personalized health recommendations are now available."
    });
    console.log('✅ Health profile submission completed successfully!');
  };

  const openHealthProfileModal = () => {
    console.log('🩺 Health profile modal button clicked!');
    console.log('📊 Current authentication status:', isAuthenticated);
    console.log('👤 Current user:', user);
    
    if (!isAuthenticated) {
      console.log('❌ User not authenticated, showing sign-in message');
      toast({
        title: "Please Sign In",
        description: "You need to be signed in to create a health profile.",
        variant: "destructive"
      });
      return;
    }
    
    console.log('✅ Opening health profile modal...');
    setShowHealthProfileModal(true);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomePage onGetStarted={() => setActiveTab('upload')} onViewReviews={() => setActiveTab('reviews')} />;

      case 'upload':
        return (
          <div className="space-y-8">
            <FileUpload
              onIngredientsUpload={handleIngredientsUpload}
              uploadedIngredients={uploadedIngredients}
              onRemoveIngredient={handleRemoveIngredient}
            />
            
            {uploadedIngredients.length > 0 && (
              <Card className="p-6 shadow-soft animate-slide-up">
                <h3 className="text-lg font-semibold mb-4">{t('recipes.generateRecipesHeader')}</h3>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <Button
                    onClick={generateSingleRecipe}
                    disabled={isGenerating}
                    className="btn-primary flex-1 h-12 sm:h-10 text-white font-semibold shadow-professional-md hover:shadow-professional-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGenerating ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4 mr-2" />
                    )}
                    {t('recipes.generateRecipe')}
                  </Button>
                  
                  <Button
                    onClick={generateMealPlan}
                    disabled={isGenerating}
                    className="btn-success flex-1 h-12 sm:h-10 text-white font-semibold shadow-professional-md hover:shadow-professional-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGenerating ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Calendar className="h-4 w-4 mr-2" />
                    )}
                    <span className="hidden xs:inline">{t('recipes.generate3DayPlan')}</span>
                    <span className="xs:hidden">{t('recipes.generate3DayPlan')}</span>
                  </Button>
                </div>
              </Card>
            )}
          </div>
        );

      case 'recipes':
        console.log('🍽️ Rendering recipes tab. Current state:', {
          isAuthenticated,
          recipesCount: recipes.length,
          isLoadingRecipes,
          recipes
        });
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">
                {isAuthenticated ? `${t('recipes.yourRecipes')} (${recipes.length})` : t('recipes.yourRecipes')}
              </h2>
              <div className="flex gap-2">
                {isAuthenticated && (
                  <Button 
                    variant="outline" 
                    onClick={loadUserRecipes}
                    disabled={isLoadingRecipes}
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className={`h-4 w-4 ${isLoadingRecipes ? 'animate-spin' : ''}`} />
                    {t('common.refresh')}
                  </Button>
                )}
                {recipes.length > 0 && (
                  <Button variant="outline" onClick={clearAllRecipes}>
                    {t('recipes.refreshAll')}
                  </Button>
                )}
              </div>
            </div>
            
            {!isAuthenticated ? (
              <Card className="p-12 text-center">
                <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">
                  Please Sign In
                </h3>
                <p className="text-muted-foreground">
                  Sign in to view and manage your saved recipes.
                </p>
              </Card>
            ) : isLoadingRecipes ? (
              <Card className="p-12 text-center">
                <Loader2 className="h-12 w-12 text-primary mx-auto mb-4 animate-spin" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">
                  Loading Recipes...
                </h3>
                <p className="text-muted-foreground">
                  Fetching your saved recipes from your account.
                </p>
              </Card>
            ) : recipes.length === 0 ? (
              <Card className="p-12 text-center">
                <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">
                  No recipes yet
                </h3>
                <p className="text-muted-foreground">
                  Upload some ingredients and generate your first recipe!
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                {recipes.map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    uploadedIngredients={uploadedIngredients.map(ing => ing.name)}
                    onDelete={handleDeleteRecipe}
                  />
                ))}
              </div>
            )}
          </div>
        );

      case 'shopping':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground">{t('shoppingList.title')}</h2>
            <ShoppingList recipes={recipes} categories={categories} />
            
            {/* Nearby Stores Section */}
            <div className="mt-8 pt-6 border-t border-border">
              <h2 className="text-2xl font-bold text-foreground mb-4">{t('nearbyStores.title')}</h2>
              <NearbyStores onStoresFound={setNearbyStores} />
            </div>
          </div>
        );

      case 'health':
        return (
          <div className="space-y-6">
            {!isAuthenticated ? (
              <Card className="p-12 text-center">
                <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">
                  Please Sign In
                </h3>
                <p className="text-muted-foreground">
                  Sign in to create your health profile and get personalized nutrition recommendations.
                </p>
              </Card>
            ) : !healthProfile ? (
              <Card className="p-12 text-center">
                <Heart className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-4">
                  Create Your Health Profile
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Get personalized meal plans, calorie recommendations, and nutrition guidance based on your health goals and lifestyle.
                </p>
                <Button 
                  onClick={openHealthProfileModal}
                  className="btn-primary text-white font-semibold px-8 py-3 shadow-professional-md hover:shadow-professional-lg transition-all duration-300"
                >
                  <Heart className="h-4 w-4 mr-2" />
                  Set Up Health Profile
                </Button>
              </Card>
            ) : (
              <PersonalizedDashboard 
                healthProfile={healthProfile}
                onUpdateProfile={() => setShowHealthProfileModal(true)}
                nearbyStores={nearbyStores}
              />
            )}
          </div>
        );

      case 'reviews':
        return (
          <div className="space-y-6">
            <ReviewsPage onBack={() => setActiveTab('home')} />
          </div>
        );

      case 'analytics':
        return <AnalyticsTab />;

      case 'admin':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground">{t('admin.title')}</h2>
            <AdminPanel />
          </div>
        );

      case 'export':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground">{t('export.title')}</h2>
            <PDFExport recipes={recipes} categories={categories} />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        recipeCount={recipes.length}
      />
      
      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-10">
        <div className="min-h-[calc(100vh-10rem)]">
          {renderTabContent()}
        </div>
      </main>
      
      <Footer />
      
      {/* Health Profile Modal */}
      <HealthProfileModal 
        open={showHealthProfileModal}
        onClose={() => {
          console.log('💫 Closing health profile modal via onClose...');
          setShowHealthProfileModal(false);
        }}
        onSubmit={handleHealthProfileSubmit}
        initialData={healthProfile || undefined}
      />
    </div>
  );
};

export default Index;
