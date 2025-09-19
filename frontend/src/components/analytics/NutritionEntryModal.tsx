import React, { useState } from 'react';
import { Plus, Clock, Edit3, Search, Calculator } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { NutritionEntry } from '@/types/Analytics';
import { analyticsService } from '@/services/analyticsService';
import { useAuth } from '@/contexts/AuthContext';

interface NutritionEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEntryAdded?: (entry: NutritionEntry) => void;
  initialData?: Partial<NutritionEntry>;
}

interface FoodSuggestion {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  commonUnits: string[];
}

// Common food database for suggestions
const FOOD_DATABASE: FoodSuggestion[] = [
  // Proteins
  { name: 'Grilled Chicken Breast', calories: 165, protein: 31, carbs: 0, fat: 4, commonUnits: ['100g', 'piece', 'serving'] },
  { name: 'Salmon Fillet', calories: 206, protein: 28, carbs: 0, fat: 12, commonUnits: ['100g', 'fillet', 'serving'] },
  { name: 'Tuna (canned)', calories: 116, protein: 26, carbs: 0, fat: 1, commonUnits: ['100g', 'can', 'serving'] },
  { name: 'Beef Steak', calories: 250, protein: 26, carbs: 0, fat: 15, commonUnits: ['100g', 'piece', 'serving'] },
  { name: 'Pork Chop', calories: 231, protein: 23, carbs: 0, fat: 14, commonUnits: ['100g', 'piece', 'serving'] },
  { name: 'Turkey Breast', calories: 135, protein: 30, carbs: 0, fat: 1, commonUnits: ['100g', 'slice', 'serving'] },
  { name: 'Eggs (2 large)', calories: 140, protein: 12, carbs: 1, fat: 10, commonUnits: ['2 large', '1 large', 'piece'] },
  { name: 'Tofu', calories: 76, protein: 8, carbs: 2, fat: 5, commonUnits: ['100g', 'cube', 'serving'] },
  
  // Dairy
  { name: 'Milk (whole)', calories: 61, protein: 3, carbs: 5, fat: 3, commonUnits: ['100ml', 'cup', 'glass'] },
  { name: 'Milk (skim)', calories: 34, protein: 3, carbs: 5, fat: 0, commonUnits: ['100ml', 'cup', 'glass'] },
  { name: 'Greek Yogurt', calories: 100, protein: 17, carbs: 6, fat: 0, commonUnits: ['100g', 'cup', 'container'] },
  { name: 'Regular Yogurt', calories: 59, protein: 3, carbs: 7, fat: 3, commonUnits: ['100g', 'cup', 'container'] },
  { name: 'Cheddar Cheese', calories: 403, protein: 25, carbs: 1, fat: 33, commonUnits: ['100g', 'slice', 'oz'] },
  { name: 'Mozzarella Cheese', calories: 280, protein: 28, carbs: 3, fat: 17, commonUnits: ['100g', 'slice', 'oz'] },
  { name: 'Cottage Cheese', calories: 98, protein: 11, carbs: 4, fat: 4, commonUnits: ['100g', 'cup', 'serving'] },
  { name: 'Butter', calories: 717, protein: 1, carbs: 0, fat: 81, commonUnits: ['100g', 'tbsp', 'pat'] },
  
  // Grains & Bread
  { name: 'White Bread', calories: 265, protein: 9, carbs: 49, fat: 3, commonUnits: ['100g', 'slice', 'piece'] },
  { name: 'Whole Wheat Bread', calories: 247, protein: 13, carbs: 41, fat: 4, commonUnits: ['100g', 'slice', 'piece'] },
  { name: 'Sourdough Bread', calories: 289, protein: 12, carbs: 56, fat: 2, commonUnits: ['100g', 'slice', 'piece'] },
  { name: 'Bagel', calories: 277, protein: 11, carbs: 53, fat: 2, commonUnits: ['1 whole', 'half', 'piece'] },
  { name: 'English Muffin', calories: 234, protein: 8, carbs: 46, fat: 2, commonUnits: ['1 whole', 'half', 'piece'] },
  { name: 'Brown Rice', calories: 112, protein: 3, carbs: 23, fat: 1, commonUnits: ['100g', 'cup', 'serving'] },
  { name: 'White Rice', calories: 130, protein: 3, carbs: 28, fat: 0, commonUnits: ['100g', 'cup', 'serving'] },
  { name: 'Quinoa', calories: 120, protein: 4, carbs: 22, fat: 2, commonUnits: ['100g', 'cup', 'serving'] },
  { name: 'Oatmeal', calories: 68, protein: 2, carbs: 12, fat: 1, commonUnits: ['100g', 'cup', 'serving'] },
  { name: 'Pasta (cooked)', calories: 131, protein: 5, carbs: 25, fat: 1, commonUnits: ['100g', 'cup', 'serving'] },
  
  // Fruits
  { name: 'Apple', calories: 52, protein: 0, carbs: 14, fat: 0, commonUnits: ['1 medium', '100g', 'piece'] },
  { name: 'Banana', calories: 89, protein: 1, carbs: 23, fat: 0, commonUnits: ['1 medium', '100g', 'piece'] },
  { name: 'Orange', calories: 47, protein: 1, carbs: 12, fat: 0, commonUnits: ['1 medium', '100g', 'piece'] },
  { name: 'Strawberries', calories: 32, protein: 1, carbs: 8, fat: 0, commonUnits: ['100g', 'cup', 'serving'] },
  { name: 'Blueberries', calories: 57, protein: 1, carbs: 14, fat: 0, commonUnits: ['100g', 'cup', 'serving'] },
  { name: 'Grapes', calories: 62, protein: 1, carbs: 16, fat: 0, commonUnits: ['100g', 'cup', 'serving'] },
  { name: 'Watermelon', calories: 30, protein: 1, carbs: 8, fat: 0, commonUnits: ['100g', 'cup', 'slice'] },
  { name: 'Pineapple', calories: 50, protein: 1, carbs: 13, fat: 0, commonUnits: ['100g', 'cup', 'slice'] },
  
  // Vegetables
  { name: 'Broccoli', calories: 34, protein: 3, carbs: 7, fat: 0, commonUnits: ['100g', 'cup', 'serving'] },
  { name: 'Spinach', calories: 23, protein: 3, carbs: 4, fat: 0, commonUnits: ['100g', 'cup', 'serving'] },
  { name: 'Carrots', calories: 41, protein: 1, carbs: 10, fat: 0, commonUnits: ['100g', 'cup', 'piece'] },
  { name: 'Tomatoes', calories: 18, protein: 1, carbs: 4, fat: 0, commonUnits: ['100g', 'cup', 'piece'] },
  { name: 'Bell Peppers', calories: 31, protein: 1, carbs: 7, fat: 0, commonUnits: ['100g', 'cup', 'piece'] },
  { name: 'Cucumber', calories: 16, protein: 1, carbs: 4, fat: 0, commonUnits: ['100g', 'cup', 'piece'] },
  { name: 'Lettuce', calories: 15, protein: 1, carbs: 3, fat: 0, commonUnits: ['100g', 'cup', 'serving'] },
  { name: 'Sweet Potato', calories: 86, protein: 2, carbs: 20, fat: 0, commonUnits: ['100g', '1 medium', 'cup'] },
  { name: 'Regular Potato', calories: 77, protein: 2, carbs: 17, fat: 0, commonUnits: ['100g', '1 medium', 'cup'] },
  { name: 'Avocado', calories: 160, protein: 2, carbs: 9, fat: 15, commonUnits: ['1 whole', '100g', 'half'] },
  
  // Nuts & Seeds
  { name: 'Almonds', calories: 576, protein: 21, carbs: 22, fat: 49, commonUnits: ['100g', '1 oz', 'handful'] },
  { name: 'Walnuts', calories: 654, protein: 15, carbs: 14, fat: 65, commonUnits: ['100g', '1 oz', 'handful'] },
  { name: 'Peanuts', calories: 567, protein: 26, carbs: 16, fat: 49, commonUnits: ['100g', '1 oz', 'handful'] },
  { name: 'Cashews', calories: 553, protein: 18, carbs: 30, fat: 44, commonUnits: ['100g', '1 oz', 'handful'] },
  { name: 'Sunflower Seeds', calories: 584, protein: 21, carbs: 20, fat: 51, commonUnits: ['100g', '1 oz', 'handful'] },
  { name: 'Peanut Butter', calories: 588, protein: 25, carbs: 20, fat: 50, commonUnits: ['100g', 'tbsp', 'serving'] },
  
  // Condiments & Spreads
  { name: 'Grape Jelly', calories: 278, protein: 0, carbs: 73, fat: 0, commonUnits: ['100g', 'tbsp', 'serving'] },
  { name: 'Strawberry Jam', calories: 249, protein: 0, carbs: 65, fat: 0, commonUnits: ['100g', 'tbsp', 'serving'] },
  { name: 'Honey', calories: 304, protein: 0, carbs: 82, fat: 0, commonUnits: ['100g', 'tbsp', 'tsp'] },
  { name: 'Maple Syrup', calories: 260, protein: 0, carbs: 67, fat: 0, commonUnits: ['100g', 'tbsp', 'serving'] },
  { name: 'Olive Oil', calories: 884, protein: 0, carbs: 0, fat: 100, commonUnits: ['100ml', 'tbsp', 'tsp'] },
  { name: 'Mayonnaise', calories: 680, protein: 1, carbs: 1, fat: 75, commonUnits: ['100g', 'tbsp', 'serving'] },
  { name: 'Ketchup', calories: 112, protein: 2, carbs: 27, fat: 0, commonUnits: ['100g', 'tbsp', 'packet'] },
  { name: 'Mustard', calories: 66, protein: 4, carbs: 6, fat: 4, commonUnits: ['100g', 'tbsp', 'tsp'] },
  
  // Beverages
  { name: 'Orange Juice', calories: 45, protein: 1, carbs: 10, fat: 0, commonUnits: ['100ml', 'cup', 'glass'] },
  { name: 'Apple Juice', calories: 46, protein: 0, carbs: 11, fat: 0, commonUnits: ['100ml', 'cup', 'glass'] },
  { name: 'Coffee (black)', calories: 2, protein: 0, carbs: 0, fat: 0, commonUnits: ['100ml', 'cup', 'serving'] },
  { name: 'Tea (green)', calories: 1, protein: 0, carbs: 0, fat: 0, commonUnits: ['100ml', 'cup', 'serving'] },
  { name: 'Soda (cola)', calories: 42, protein: 0, carbs: 11, fat: 0, commonUnits: ['100ml', 'can', 'glass'] },
  { name: 'Beer', calories: 43, protein: 0, carbs: 4, fat: 0, commonUnits: ['100ml', 'bottle', 'glass'] },
  { name: 'Wine (red)', calories: 85, protein: 0, carbs: 3, fat: 0, commonUnits: ['100ml', 'glass', 'serving'] },
  
  // Snacks
  { name: 'Potato Chips', calories: 536, protein: 7, carbs: 53, fat: 34, commonUnits: ['100g', 'bag', 'serving'] },
  { name: 'Popcorn', calories: 387, protein: 12, carbs: 78, fat: 5, commonUnits: ['100g', 'cup', 'serving'] },
  { name: 'Dark Chocolate', calories: 546, protein: 5, carbs: 61, fat: 31, commonUnits: ['100g', 'square', 'piece'] },
  { name: 'Milk Chocolate', calories: 535, protein: 8, carbs: 59, fat: 30, commonUnits: ['100g', 'square', 'piece'] },
  { name: 'Cookies (chocolate chip)', calories: 488, protein: 5, carbs: 68, fat: 21, commonUnits: ['100g', 'piece', 'serving'] },
  { name: 'Ice Cream (vanilla)', calories: 207, protein: 4, carbs: 24, fat: 11, commonUnits: ['100g', 'scoop', 'cup'] },
  
  // Legumes
  { name: 'Black Beans', calories: 132, protein: 9, carbs: 23, fat: 1, commonUnits: ['100g', 'cup', 'serving'] },
  { name: 'Chickpeas', calories: 164, protein: 8, carbs: 27, fat: 3, commonUnits: ['100g', 'cup', 'serving'] },
  { name: 'Lentils', calories: 116, protein: 9, carbs: 20, fat: 0, commonUnits: ['100g', 'cup', 'serving'] },
  { name: 'Kidney Beans', calories: 127, protein: 9, carbs: 23, fat: 1, commonUnits: ['100g', 'cup', 'serving'] },
];

export const NutritionEntryModal: React.FC<NutritionEntryModalProps> = ({
  isOpen,
  onClose,
  onEntryAdded,
  initialData
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedFood, setSelectedFood] = useState<FoodSuggestion | null>(null);
  
  const [formData, setFormData] = useState({
    foodItem: initialData?.foodItem || '',
    quantity: initialData?.quantity || 1,
    unit: initialData?.unit || 'serving',
    mealType: initialData?.mealType || 'breakfast' as const,
    mealTime: initialData?.mealTime || new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
    notes: initialData?.notes || '',
    nutrition: initialData?.nutrition || {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0,
      calcium: 0,
      iron: 0,
      vitaminC: 0
    }
  });

  const filteredFoods = FOOD_DATABASE.filter(food =>
    food.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFoodSearch = (query: string) => {
    setSearchQuery(query);
    setFormData(prev => ({ ...prev, foodItem: query }));
    setShowSuggestions(query.length > 0);
  };

  const selectFood = (food: FoodSuggestion) => {
    setSelectedFood(food);
    setFormData(prev => ({
      ...prev,
      foodItem: food.name,
      unit: food.commonUnits[0],
      nutrition: {
        ...prev.nutrition,
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat,
        fiber: Math.round(Math.random() * 5), // Mock data
        sugar: Math.round(Math.random() * 10),
        sodium: Math.round(Math.random() * 300),
        calcium: Math.round(Math.random() * 100),
        iron: Math.round(Math.random() * 5),
        vitaminC: Math.round(Math.random() * 20)
      }
    }));
    setSearchQuery('');
    setShowSuggestions(false);
  };

  const updateNutritionByQuantity = (newQuantity: number) => {
    if (selectedFood && newQuantity > 0) {
      const multiplier = newQuantity;
      setFormData(prev => ({
        ...prev,
        quantity: newQuantity,
        nutrition: {
          calories: Math.round(selectedFood.calories * multiplier),
          protein: Math.round(selectedFood.protein * multiplier * 10) / 10,
          carbs: Math.round(selectedFood.carbs * multiplier * 10) / 10,
          fat: Math.round(selectedFood.fat * multiplier * 10) / 10,
          fiber: Math.round(selectedFood.calories * 0.05 * multiplier * 10) / 10,
          sugar: Math.round(selectedFood.carbs * 0.6 * multiplier * 10) / 10,
          sodium: Math.round(selectedFood.calories * 0.5 * multiplier),
          calcium: Math.round(selectedFood.calories * 0.1 * multiplier),
          iron: Math.round(selectedFood.protein * 0.1 * multiplier * 10) / 10,
          vitaminC: Math.round(selectedFood.calories * 0.1 * multiplier)
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, quantity: newQuantity }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to log nutrition entries.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.foodItem.trim()) {
      toast({
        title: "Food Item Required",
        description: "Please enter a food item.",
        variant: "destructive"
      });
      return;
    }

    if (formData.quantity <= 0) {
      toast({
        title: "Invalid Quantity",
        description: "Quantity must be greater than 0.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const entryData = {
        userId: user.id,
        date: new Date().toISOString().split('T')[0],
        foodItem: formData.foodItem.trim(),
        quantity: formData.quantity,
        unit: formData.unit,
        mealType: formData.mealType,
        mealTime: formData.mealTime,
        nutrition: formData.nutrition,
        notes: formData.notes.trim() || undefined
      };

      const result = await analyticsService.addNutritionEntry(entryData);

      if (result.success && result.entry) {
        toast({
          title: "Entry Added! 🎉",
          description: `${formData.foodItem} has been logged successfully.`
        });

        if (onEntryAdded) {
          onEntryAdded(result.entry);
        }

        // Reset form
        setFormData({
          foodItem: '',
          quantity: 1,
          unit: 'serving',
          mealType: 'breakfast',
          mealTime: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
          notes: '',
          nutrition: {
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
            fiber: 0,
            sugar: 0,
            sodium: 0,
            calcium: 0,
            iron: 0,
            vitaminC: 0
          }
        });
        setSelectedFood(null);
        onClose();
      } else {
        throw new Error(result.error || 'Failed to add nutrition entry');
      }
    } catch (error) {
      console.error('Error adding nutrition entry:', error);
      toast({
        title: "Entry Failed",
        description: error instanceof Error ? error.message : "Failed to add nutrition entry",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getMealTypeIcon = (mealType: string) => {
    switch (mealType) {
      case 'breakfast': return '🌅';
      case 'lunch': return '☀️';
      case 'dinner': return '🌙';
      case 'snack': return '🍎';
      case 'drink': return '🥤';
      default: return '🍽️';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-primary-dark flex items-center gap-2">
            <Plus className="w-5 h-5 text-success" />
            Log Nutrition Entry
          </DialogTitle>
          <p className="text-sm text-secondary-dark">
            Track your meals and nutrition for better health insights
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Food Search */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Search Food Item *</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                value={searchQuery || formData.foodItem}
                onChange={(e) => handleFoodSearch(e.target.value)}
                onFocus={() => setShowSuggestions(searchQuery.length > 0)}
                placeholder="Type to search for foods..."
                className="pl-10 border-neutral focus:border-brand-primary"
              />
              
              {showSuggestions && filteredFoods.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                  {filteredFoods.map((food, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => selectFood(food)}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 flex justify-between items-center"
                    >
                      <span className="font-medium">{food.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {food.calories} cal
                      </Badge>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quantity and Unit */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity" className="text-sm font-medium">
                Quantity *
              </Label>
              <Input
                id="quantity"
                type="number"
                step="0.1"
                min="0.1"
                value={formData.quantity.toString()}
                onChange={(e) => {
                  const newQuantity = parseFloat(e.target.value) || 1;
                  setFormData(prev => ({ ...prev, quantity: newQuantity }));
                  updateNutritionByQuantity(newQuantity);
                }}
                onBlur={(e) => {
                  const newQuantity = parseFloat(e.target.value) || 1;
                  updateNutritionByQuantity(newQuantity);
                }}
                className="border-neutral focus:border-brand-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit" className="text-sm font-medium">
                Unit
              </Label>
              <Select value={formData.unit} onValueChange={(value) => setFormData(prev => ({ ...prev, unit: value }))}>
                <SelectTrigger className="border-neutral focus:border-brand-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {selectedFood ? selectedFood.commonUnits.map(unit => (
                    <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                  )) : (
                    <>
                      <SelectItem value="serving">serving</SelectItem>
                      <SelectItem value="grams">grams</SelectItem>
                      <SelectItem value="cup">cup</SelectItem>
                      <SelectItem value="piece">piece</SelectItem>
                      <SelectItem value="oz">oz</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Meal Type and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Meal Type *</Label>
              <Select value={formData.mealType} onValueChange={(value: any) => setFormData(prev => ({ ...prev, mealType: value }))}>
                <SelectTrigger className="border-neutral focus:border-brand-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="breakfast">
                    <span className="flex items-center gap-2">
                      🌅 Breakfast
                    </span>
                  </SelectItem>
                  <SelectItem value="lunch">
                    <span className="flex items-center gap-2">
                      ☀️ Lunch
                    </span>
                  </SelectItem>
                  <SelectItem value="dinner">
                    <span className="flex items-center gap-2">
                      🌙 Dinner
                    </span>
                  </SelectItem>
                  <SelectItem value="snack">
                    <span className="flex items-center gap-2">
                      🍎 Snack
                    </span>
                  </SelectItem>
                  <SelectItem value="drink">
                    <span className="flex items-center gap-2">
                      🥤 Drink
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="mealTime" className="text-sm font-medium">
                Time
              </Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="mealTime"
                  type="time"
                  value={formData.mealTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, mealTime: e.target.value }))}
                  className="pl-10 border-neutral focus:border-brand-primary"
                />
              </div>
            </div>
          </div>

          {/* Nutrition Preview */}
          {(formData.nutrition.calories > 0) && (
            <Card className="border-success/20 bg-success/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Calculator className="h-4 w-4 text-success" />
                  Nutrition Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-secondary-dark">Calories:</span>
                  <span className="font-medium">{formData.nutrition.calories}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary-dark">Protein:</span>
                  <span className="font-medium">{formData.nutrition.protein}g</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary-dark">Carbs:</span>
                  <span className="font-medium">{formData.nutrition.carbs}g</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary-dark">Fat:</span>
                  <span className="font-medium">{formData.nutrition.fat}g</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Manual Nutrition Entry */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Edit3 className="h-4 w-4 text-warning" />
              <Label className="text-sm font-medium">
                Manual Nutrition Entry (Optional)
              </Label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="calories" className="text-xs">Calories</Label>
                <Input
                  id="calories"
                  type="number"
                  min="0"
                  value={formData.nutrition.calories || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    nutrition: { ...prev.nutrition, calories: parseInt(e.target.value) || 0 }
                  }))}
                  className="text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="protein" className="text-xs">Protein (g)</Label>
                <Input
                  id="protein"
                  type="number"
                  min="0"
                  value={formData.nutrition.protein || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    nutrition: { ...prev.nutrition, protein: parseFloat(e.target.value) || 0 }
                  }))}
                  className="text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="carbs" className="text-xs">Carbs (g)</Label>
                <Input
                  id="carbs"
                  type="number"
                  min="0"
                  value={formData.nutrition.carbs || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    nutrition: { ...prev.nutrition, carbs: parseFloat(e.target.value) || 0 }
                  }))}
                  className="text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="fat" className="text-xs">Fat (g)</Label>
                <Input
                  id="fat"
                  type="number"
                  min="0"
                  value={formData.nutrition.fat || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    nutrition: { ...prev.nutrition, fat: parseFloat(e.target.value) || 0 }
                  }))}
                  className="text-sm"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium">
              Notes (Optional)
            </Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Any additional notes about this meal..."
              rows={2}
              className="border-neutral focus:border-brand-primary resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="btn-primary flex-1"
              disabled={isSubmitting || !formData.foodItem.trim() || formData.quantity <= 0}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-1" />
                  Add Entry
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};