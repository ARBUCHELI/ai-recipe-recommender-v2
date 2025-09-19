import React from 'react';
import { ShoppingCart, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
//import { Recipe } from '@/services/aiService';
import { Recipe } from '@/services/realAiService';
import { useTranslation } from '@/contexts/TranslationContext';

interface ShoppingListProps {
  recipes: Recipe[];
  categories: Record<string, string[]>;
}

interface ShoppingItem {
  name: string;
  category: string;
  checked: boolean;
}

export const ShoppingList: React.FC<ShoppingListProps> = ({ 
  recipes, 
  categories 
}) => {
  const { t } = useTranslation();
  const [checkedItems, setCheckedItems] = React.useState<Record<string, boolean>>({});

  // Extract unique ingredients from all recipes
  const extractIngredients = (): ShoppingItem[] => {
    const ingredientMap = new Map<string, ShoppingItem>();
    
    recipes.forEach(recipe => {
      recipe.ingredients.forEach(ingredient => {
        const cleanName = ingredient.toLowerCase().trim();
        const category = categorizeIngredient(ingredient, categories);
        
        if (!ingredientMap.has(cleanName)) {
          ingredientMap.set(cleanName, {
            name: ingredient,
            category,
            checked: checkedItems[cleanName] || false
          });
        }
      });
    });
    
    return Array.from(ingredientMap.values()).sort((a, b) => 
      a.category.localeCompare(b.category) || a.name.localeCompare(b.name)
    );
  };

  const categorizeIngredient = (ingredient: string, categories: Record<string, string[]>): string => {
    const lowerIngredient = ingredient.toLowerCase();
    
    for (const [category, items] of Object.entries(categories)) {
      if (items.some(item => lowerIngredient.includes(item.toLowerCase()))) {
        return category;
      }
    }
    
    return t('shoppingList.other');
  };

  const handleItemCheck = (itemName: string, checked: boolean) => {
    setCheckedItems(prev => ({
      ...prev,
      [itemName.toLowerCase().trim()]: checked
    }));
  };

  const shoppingItems = extractIngredients();
  const groupedItems = shoppingItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, ShoppingItem[]>);

  const totalItems = shoppingItems.length;
  const checkedCount = shoppingItems.filter(item => 
    checkedItems[item.name.toLowerCase().trim()]
  ).length;

  return (
    <Card className="shadow-soft animate-fade-in">
      <CardHeader className="gradient-secondary text-secondary-foreground">
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          {t('shoppingList.title')}
          <span className="text-sm font-normal">
            ({checkedCount}/{totalItems} {t('shoppingList.items')})
          </span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="space-y-6">
          {Object.entries(groupedItems).map(([category, items]) => (
            <div key={category}>
              <div className="flex items-center gap-2 mb-3">
                <Package className="h-4 w-4 text-accent" />
                <h4 className="font-medium text-foreground">{category}</h4>
                <span className="text-sm text-muted-foreground">
                  ({items.length} {t('shoppingList.items')})
                </span>
              </div>
              
              <div className="space-y-2 ml-6">
                {items.map((item, index) => {
                  const itemKey = item.name.toLowerCase().trim();
                  const isChecked = checkedItems[itemKey] || false;
                  
                  return (
                    <div key={index} className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted transition-smooth">
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={(checked) => 
                          handleItemCheck(item.name, checked === true)
                        }
                      />
                      <span 
                        className={`text-sm ${
                          isChecked 
                            ? 'line-through text-muted-foreground' 
                            : 'text-foreground'
                        }`}
                      >
                        {item.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          
          {totalItems === 0 && (
            <p className="text-center text-muted-foreground py-8">
              {t('shoppingList.noRecipes')}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};