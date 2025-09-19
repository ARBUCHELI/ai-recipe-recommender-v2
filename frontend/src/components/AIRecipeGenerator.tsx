import React, { useState } from 'react';
import { ChefHat, Sparkles, Plus, X, Clock, Users, TrendingUp, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { LoadingState } from '@/components/LoadingStates';
import { useToast } from '@/hooks/use-toast';
import EnhancedAIService, { Recipe, Ingredient, NutritionAnalysis } from '@/services/enhancedAIService';
import { useTranslation } from '@/contexts/TranslationContext';

interface AIRecipeGeneratorProps {
  onRecipeGenerated?: (recipe: Recipe) => void;
}

export const AIRecipeGenerator: React.FC<AIRecipeGeneratorProps> = ({ onRecipeGenerated }) => {
  const { t } = useTranslation();
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [newIngredient, setNewIngredient] = useState({ name: '', quantity: 1, unit: 'cup' });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedRecipe, setGeneratedRecipe] = useState<Recipe | null>(null);
  const [nutritionAnalysis, setNutritionAnalysis] = useState<NutritionAnalysis | null>(null);
  const [cookingTips, setCookingTips] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [initializationProgress, setInitializationProgress] = useState(0);
  const [isInitializing, setIsInitializing] = useState(false);
  
  const { toast } = useToast();
  const aiService = EnhancedAIService.getInstance();

  const addIngredient = () => {
    if (newIngredient.name.trim()) {
      const ingredient: Ingredient = {
        ...newIngredient,
        category: 'other' // We could enhance this with category detection
      };
      setIngredients([...ingredients, ingredient]);
      setNewIngredient({ name: '', quantity: 1, unit: 'cup' });
    }
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const generateRecipe = async () => {
    if (ingredients.length === 0) {
      toast({
        title: t('recipes.noIngredients'),
        description: t('recipes.addIngredientsPrompt'),
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    setIsInitializing(true);
    setInitializationProgress(0);

    try {
      // Simulate initialization progress
      const progressInterval = setInterval(() => {
        setInitializationProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 15;
        });
      }, 500);

      // Initialize AI if needed
      await aiService.initialize();
      clearInterval(progressInterval);
      setInitializationProgress(100);
      setIsInitializing(false);

      toast({
        title: t('recipes.aiModelsLoaded'),
        description: t('recipes.generatingRecipe'),
      });

      // Generate recipe with AI
      const recipe = await aiService.generateRecipe(ingredients);
      setGeneratedRecipe(recipe);

      // Generate nutrition analysis
      setIsAnalyzing(true);
      const nutrition = await aiService.analyzeNutrition(ingredients);
      setNutritionAnalysis(nutrition);

      // Generate cooking tips
      const tips = await aiService.generateCookingTips(recipe);
      setCookingTips(tips);
      setIsAnalyzing(false);

      // Call parent callback if provided
      onRecipeGenerated?.(recipe);

      toast({
        title: t('recipes.recipeGenerated'),
        description: t('recipes.recipeCreated').replace('${recipeName}', recipe.name),
      });

    } catch (error) {
      console.error('Error generating recipe:', error);
      toast({
        title: t('recipes.generationFailed'),
        description: t('recipes.tryAgain'),
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
      setIsInitializing(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <div className="p-2 bg-blue-100 rounded-full">
              <Sparkles className="h-6 w-6 text-blue-600" />
            </div>
            {t('recipes.realAIRecipeGenerator')}
            <Badge className="bg-blue-100 text-blue-800">{t('recipes.poweredByHuggingFace')}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="border-blue-200 bg-blue-50">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>{t('recipes.realAIIntegration')}:</strong> {t('recipes.aiDescription')}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Ingredient Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            {t('recipes.addYourIngredients')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder={t('recipes.ingredientPlaceholder')}
              value={newIngredient.name}
              onChange={(e) => setNewIngredient({ ...newIngredient, name: e.target.value })}
              onKeyPress={(e) => e.key === 'Enter' && addIngredient()}
              className="flex-1"
            />
            <Input
              type="number"
              placeholder={t('recipes.qtyPlaceholder')}
              value={newIngredient.quantity}
              onChange={(e) => setNewIngredient({ ...newIngredient, quantity: Number(e.target.value) })}
              className="w-20"
              min="1"
            />
            <select
              value={newIngredient.unit}
              onChange={(e) => setNewIngredient({ ...newIngredient, unit: e.target.value })}
              className="px-3 py-2 border rounded-md bg-white"
            >
              <option value="cup">{t('common.units.cup')}</option>
              <option value="tbsp">{t('common.units.tbsp')}</option>
              <option value="tsp">{t('common.units.tsp')}</option>
              <option value="g">{t('common.units.g')}</option>
              <option value="oz">{t('common.units.oz')}</option>
              <option value="piece">{t('common.units.piece')}</option>
              <option value="lb">{t('common.units.lb')}</option>
            </select>
            <Button onClick={addIngredient} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {ingredients.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {ingredients.map((ingredient, index) => (
                <Badge key={index} variant="secondary" className="px-3 py-1">
                  {ingredient.quantity} {ingredient.unit} {ingredient.name}
                  <X 
                    className="h-3 w-3 ml-2 cursor-pointer" 
                    onClick={() => removeIngredient(index)}
                  />
                </Badge>
              ))}
            </div>
          )}

          <Button 
            onClick={generateRecipe} 
            disabled={isGenerating || ingredients.length === 0}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <ChefHat className="h-5 w-5 mr-2 animate-spin" />
                {t('recipes.generatingWithAI')}
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5 mr-2" />
                {t('recipes.generateRecipeWithAI')} ({ingredients.length} {t('recipes.ingredients')})
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Loading States */}
      {isInitializing && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <ChefHat className="h-12 w-12 text-blue-600 animate-pulse mx-auto" />
              <h3 className="text-lg font-semibold">{t('recipes.loadingAIModels')}</h3>
              <p className="text-gray-600">
                {t('recipes.initializingTransformers')}
              </p>
              <Progress value={initializationProgress} className="w-full" />
              <p className="text-sm text-gray-500">
                {initializationProgress.toFixed(0)}% - {t('recipes.loadingNeuralNetworks')}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {isGenerating && !isInitializing && (
        <LoadingState type="meal-generation" />
      )}

      {/* Generated Recipe */}
      {generatedRecipe && (
        <div className="space-y-6">
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl text-green-800 flex items-center gap-2">
                  <ChefHat className="h-6 w-6" />
                  {generatedRecipe.name}
                </CardTitle>
                <div className="flex gap-2">
                  <Badge className={getDifficultyColor(generatedRecipe.difficulty || 'medium')}>
                    {generatedRecipe.difficulty || 'Medium'}
                  </Badge>
                  <Badge variant="outline" className="bg-white">
                    {generatedRecipe.cuisine || 'International'}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-gray-700">{generatedRecipe.description}</p>

              {/* Recipe Info */}
              <div className="flex gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span>Prep: {generatedRecipe.prepTime}m</span>
                </div>
                <div className="flex items-center gap-2">
                  <ChefHat className="h-4 w-4 text-gray-500" />
                  <span>Cook: {generatedRecipe.cookTime}m</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span>Serves: {generatedRecipe.servings}</span>
                </div>
              </div>

              {/* Tags */}
              {generatedRecipe.tags && (
                <div className="flex flex-wrap gap-2">
                  {generatedRecipe.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Ingredients */}
              <div>
                <h4 className="font-semibold mb-3">{t('recipes.ingredientsLabel')}:</h4>
                <ul className="space-y-2">
                  {generatedRecipe.ingredients.map((ingredient, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                      <span>{ingredient}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Instructions */}
              <div>
                <h4 className="font-semibold mb-3">{t('recipes.instructionsLabel')}:</h4>
                <ol className="space-y-3">
                  {generatedRecipe.instructions.map((instruction, index) => (
                    <li key={index} className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-600 text-white text-sm font-medium flex items-center justify-center">
                        {index + 1}
                      </span>
                      <span>{instruction}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </CardContent>
          </Card>

          {/* Nutrition Analysis */}
          {nutritionAnalysis && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  {t('recipes.aiNutritionAnalysis')}
                  {!isAnalyzing && (
                    <Badge className={`${getHealthScoreColor(nutritionAnalysis.healthScore)} bg-transparent`}>
                      {t('recipes.healthScore')}: {nutritionAnalysis.healthScore}/100
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isAnalyzing ? (
                  <div className="text-center py-6">
                    <TrendingUp className="h-8 w-8 text-blue-600 animate-pulse mx-auto mb-2" />
                    <p>{t('recipes.analyzingNutrition')}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{nutritionAnalysis.totalCalories}</div>
                        <div className="text-sm text-gray-600">{t('recipes.calories')}</div>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{nutritionAnalysis.macros.protein}g</div>
                        <div className="text-sm text-gray-600">{t('recipes.protein')}</div>
                      </div>
                      <div className="p-4 bg-yellow-50 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-600">{nutritionAnalysis.macros.carbs}g</div>
                        <div className="text-sm text-gray-600">{t('recipes.carbs')}</div>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">{nutritionAnalysis.macros.fat}g</div>
                        <div className="text-sm text-gray-600">{t('recipes.fat')}</div>
                      </div>
                    </div>

                    {nutritionAnalysis.recommendations.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-3">{t('recipes.aiHealthRecommendations')}:</h4>
                        <ul className="space-y-2">
                          {nutritionAnalysis.recommendations.map((rec, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <Info className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                              <span className="text-sm text-gray-700">{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Cooking Tips */}
          {cookingTips.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ChefHat className="h-5 w-5" />
                  {t('recipes.aiCookingTips')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {cookingTips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Sparkles className="h-4 w-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">{tip}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default AIRecipeGenerator;