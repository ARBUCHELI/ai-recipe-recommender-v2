import React, { useState, useEffect } from 'react';
import { Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useFoodCategories } from '@/contexts/FoodCategoryContext';
import { FoodCategory } from '@/types/foodCategories';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: FoodCategory | null;
}

interface NutritionInfo {
  calories?: string;
  protein?: string;
  carbs?: string;
  fat?: string;
  fiber?: string;
}

export const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
  category
}) => {
  const { addProductToCategory } = useFoodCategories();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  
  const [nutritionInfo, setNutritionInfo] = useState<NutritionInfo>({
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    fiber: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens/closes or category changes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        description: ''
      });
      setNutritionInfo({
        calories: '',
        protein: '',
        carbs: '',
        fat: '',
        fiber: ''
      });
    }
  }, [isOpen, category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Product name is required.",
        variant: "destructive"
      });
      return;
    }

    if (!category) {
      toast({
        title: "Error",
        description: "No category selected.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Convert nutrition strings to numbers, filtering out empty values
      const processedNutritionInfo: any = {};
      Object.entries(nutritionInfo).forEach(([key, value]) => {
        if (value && value.trim() !== '') {
          const numValue = parseFloat(value.trim());
          if (!isNaN(numValue) && numValue >= 0) {
            processedNutritionInfo[key] = numValue;
          }
        }
      });

      addProductToCategory(category.id, {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        nutritionInfo: Object.keys(processedNutritionInfo).length > 0 
          ? processedNutritionInfo 
          : undefined,
        isCustom: true
      });
      
      toast({
        title: "Product Added",
        description: `"${formData.name}" has been added to ${category.name}.`,
      });
      
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add product. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNutritionChange = (field: keyof NutritionInfo, value: string) => {
    // Only allow numbers and decimal points
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setNutritionInfo(prev => ({ ...prev, [field]: value }));
    }
  };

  if (!category) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Add Product to {category.icon} {category.name}
          </DialogTitle>
          <DialogDescription>
            Add a new food product to the {category.name} category.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="productName">Product Name *</Label>
              <Input
                id="productName"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g., Organic Chicken Breast"
                maxLength={100}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="productDescription">Description (Optional)</Label>
              <Textarea
                id="productDescription"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Brief description of the product..."
                rows={2}
                maxLength={300}
              />
            </div>
          </div>

          <Separator />

          {/* Nutrition Information */}
          <div className="space-y-4">
            <div>
              <Label className="text-base font-medium">Nutrition Information (Per 100g)</Label>
              <p className="text-sm text-gray-600 mt-1">All fields are optional</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="calories">Calories</Label>
                <div className="relative">
                  <Input
                    id="calories"
                    value={nutritionInfo.calories}
                    onChange={(e) => handleNutritionChange('calories', e.target.value)}
                    placeholder="0"
                    type="text"
                    inputMode="decimal"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                    kcal
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="protein">Protein</Label>
                <div className="relative">
                  <Input
                    id="protein"
                    value={nutritionInfo.protein}
                    onChange={(e) => handleNutritionChange('protein', e.target.value)}
                    placeholder="0"
                    type="text"
                    inputMode="decimal"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                    g
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="carbs">Carbohydrates</Label>
                <div className="relative">
                  <Input
                    id="carbs"
                    value={nutritionInfo.carbs}
                    onChange={(e) => handleNutritionChange('carbs', e.target.value)}
                    placeholder="0"
                    type="text"
                    inputMode="decimal"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                    g
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fat">Fat</Label>
                <div className="relative">
                  <Input
                    id="fat"
                    value={nutritionInfo.fat}
                    onChange={(e) => handleNutritionChange('fat', e.target.value)}
                    placeholder="0"
                    type="text"
                    inputMode="decimal"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                    g
                  </span>
                </div>
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="fiber">Fiber</Label>
                <div className="relative">
                  <Input
                    id="fiber"
                    value={nutritionInfo.fiber}
                    onChange={(e) => handleNutritionChange('fiber', e.target.value)}
                    placeholder="0"
                    type="text"
                    inputMode="decimal"
                    className="max-w-xs"
                  />
                  <span className="absolute left-20 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                    g
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Preview */}
          {formData.name && (
            <>
              <Separator />
              <div className="border rounded-md p-3 bg-gray-50">
                <Label className="text-sm font-medium">Preview:</Label>
                <div className="mt-2">
                  <p className="font-medium">{formData.name}</p>
                  {formData.description && (
                    <p className="text-sm text-gray-600 mt-1">{formData.description}</p>
                  )}
                  {nutritionInfo.calories && (
                    <p className="text-sm text-gray-500 mt-1">
                      {nutritionInfo.calories} calories per 100g
                    </p>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !formData.name.trim()}>
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Adding...' : 'Add Product'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};