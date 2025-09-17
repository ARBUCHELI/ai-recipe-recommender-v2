import React, { useState } from 'react';
import { Clock, Users, ChefHat, Trash2, MoreVertical } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Recipe } from '@/services/recipeService';

interface RecipeCardProps {
  recipe: Recipe;
  uploadedIngredients?: string[];
  onDelete?: (recipeId: string, recipeName: string) => void;
}


export const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe, 
  uploadedIngredients = [],
  onDelete
}) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    if (onDelete) {
      onDelete(recipe.id, recipe.name);
    }
    setShowDeleteDialog(false);
  };

  const handleDeleteCancel = () => {
    setShowDeleteDialog(false);
  };

  const highlightIngredient = (ingredient: string) => {
    const isUploaded = uploadedIngredients.some(uploaded => 
      ingredient.toLowerCase().includes(uploaded.toLowerCase())
    );
    
    return isUploaded ? (
      <span className="bg-brand-primary/20 text-brand-primary font-medium px-1 rounded">
        {ingredient}
      </span>
    ) : ingredient;
  };

  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="shadow-professional-md hover:shadow-professional-lg transition-all duration-300 border-neutral">
      <CardHeader className="bg-brand-primary text-white rounded-t-lg relative p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 pr-4">
            <CardTitle className="text-lg font-bold leading-tight">{recipe.name}</CardTitle>
            {recipe.description && (
              <p className="text-white/90 mt-1 text-sm line-clamp-2">{recipe.description}</p>
            )}
          </div>
          
          {onDelete && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20 h-8 w-8 p-0 flex-shrink-0"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white border-neutral shadow-professional-lg">
                <DropdownMenuItem
                  className="text-error hover:bg-error/10 cursor-pointer"
                  onClick={handleDeleteClick}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Recipe
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        {/* Recipe Metadata */}
        <div className="flex flex-wrap gap-3 mb-4 text-xs">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-brand-primary" />
            <span className="text-secondary-dark font-medium">{(recipe.prepTime || 0) + (recipe.cookTime || 0)} mins</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3 text-brand-primary" />
            <span className="text-secondary-dark font-medium">{recipe.servings || 4} servings</span>
          </div>
          <div className="flex items-center gap-1">
            <ChefHat className="h-3 w-3 text-brand-primary" />
            <span className="capitalize text-secondary-dark font-medium">{recipe.difficulty || 'Easy'}</span>
          </div>
        </div>

        {/* Nutrition Summary */}
        {recipe.nutrition && (
          <div className="flex justify-between items-center mb-4 p-2 bg-neutral-50 rounded-lg">
            <div className="text-center">
              <div className="text-sm font-bold text-error">
                {Math.round((recipe.nutrition.calories || 0) / (recipe.servings || 1))}
              </div>
              <div className="text-xs text-secondary-dark">Cal</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-bold text-brand-primary">
                {Math.round((recipe.nutrition.protein || 0) / (recipe.servings || 1))}g
              </div>
              <div className="text-xs text-secondary-dark">Protein</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-bold text-warning">
                {Math.round((recipe.nutrition.carbs || 0) / (recipe.servings || 1))}g
              </div>
              <div className="text-xs text-secondary-dark">Carbs</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-bold text-success">
                {Math.round((recipe.nutrition.fat || 0) / (recipe.servings || 1))}g
              </div>
              <div className="text-xs text-secondary-dark">Fat</div>
            </div>
          </div>
        )}

        {/* Ingredients Preview */}
        <div className="mb-4">
          <h4 className="font-semibold mb-2 text-sm text-primary-dark">Ingredients ({recipe.ingredients.length})</h4>
          <div className="text-xs text-secondary-dark">
            {isExpanded ? (
              <ul className="space-y-1">
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-brand-primary mt-1 text-xs">•</span>
                    <span>{highlightIngredient(ingredient)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="line-clamp-2">
                {recipe.ingredients.slice(0, 3).join(', ')}
                {recipe.ingredients.length > 3 && ` + ${recipe.ingredients.length - 3} more`}
              </p>
            )}
          </div>
        </div>

        {/* Expand/Collapse Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full text-xs h-8"
        >
          {isExpanded ? 'Show Less' : `Show ${recipe.instructions.length} Steps`}
        </Button>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="mt-4 space-y-4 border-t pt-4">
            <div>
              <h4 className="font-semibold mb-2 text-sm text-primary-dark">Instructions</h4>
              <ol className="space-y-2">
                {recipe.instructions.map((instruction, index) => (
                  <li key={index} className="text-xs flex gap-2">
                    <span className="bg-brand-primary text-white rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                      {index + 1}
                    </span>
                    <span className="leading-relaxed text-secondary-dark">{instruction}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}
      </CardContent>
      
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-white border-neutral shadow-professional-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-primary-dark flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-error" />
              Delete Recipe
            </AlertDialogTitle>
            <AlertDialogDescription className="text-secondary-dark">
              Are you sure you want to delete <strong className="text-primary-dark">"{recipe.name}"</strong>? 
              This action cannot be undone and the recipe will be permanently removed from your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={handleDeleteCancel}
              className="border-neutral text-secondary-dark hover:bg-neutral-50"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-error hover:bg-error/90 text-white font-medium"
            >
              Delete Recipe
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};
