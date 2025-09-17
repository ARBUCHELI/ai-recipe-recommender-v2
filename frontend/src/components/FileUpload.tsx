import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, X, Plus, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Papa from 'papaparse';

interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
  category: string;
}

interface FileUploadProps {
  onIngredientsUpload: (ingredients: Ingredient[]) => void;
  uploadedIngredients: Ingredient[];
  onRemoveIngredient: (index: number) => void;
}

// Predefined ingredient categories
const INGREDIENT_CATEGORIES = [
  'Proteins',
  'Vegetables',
  'Fruits',
  'Grains',
  'Dairy',
  'Spices & Herbs',
  'Oils & Fats',
  'Nuts & Seeds',
  'Legumes',
  'Beverages',
  'Other'
];

// Common measurement units
const MEASUREMENT_UNITS = [
  'cups',
  'tbsp',
  'tsp',
  'oz',
  'lbs',
  'g',
  'kg',
  'ml',
  'l',
  'pieces',
  'cloves',
  'slices',
  'whole'
];

export const FileUpload: React.FC<FileUploadProps> = ({
  onIngredientsUpload,
  uploadedIngredients,
  onRemoveIngredient
}) => {
  // Manual entry form state
  const [manualIngredient, setManualIngredient] = useState({
    name: '',
    quantity: '',
    unit: 'cups',
    category: 'Other'
  });
  const [isAddingIngredient, setIsAddingIngredient] = useState(false);

  // Handle manual ingredient form submission
  const handleAddManualIngredient = () => {
    if (!manualIngredient.name.trim() || !manualIngredient.quantity.trim()) {
      return; // Don't add empty ingredients
    }

    const newIngredient: Ingredient = {
      name: manualIngredient.name.trim(),
      quantity: parseFloat(manualIngredient.quantity) || 0,
      unit: manualIngredient.unit,
      category: manualIngredient.category
    };

    onIngredientsUpload([newIngredient]);
    
    // Reset form
    setManualIngredient({
      name: '',
      quantity: '',
      unit: 'cups',
      category: 'Other'
    });
    
    setIsAddingIngredient(false);
  };

  // Handle form input changes
  const handleInputChange = (field: string, value: string) => {
    setManualIngredient(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle form submission on Enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddManualIngredient();
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        const content = reader.result as string;
        
        if (file.name.endsWith('.csv')) {
          Papa.parse(content, {
            header: true,
            complete: (results) => {
              const ingredients = results.data as Ingredient[];
              onIngredientsUpload(ingredients.filter(ing => ing.name));
            }
          });
        } else if (file.name.endsWith('.json')) {
          try {
            const data = JSON.parse(content);
            const ingredients = data.ingredients || data;
            onIngredientsUpload(Array.isArray(ingredients) ? ingredients : [ingredients]);
          } catch (error) {
            console.error('Error parsing JSON:', error);
          }
        }
      };
      
      reader.readAsText(file);
    });
  }, [onIngredientsUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/json': ['.json']
    }
  });

  return (
    <div className="space-y-6">
      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-neutral-50 border border-neutral">
          <TabsTrigger value="upload" className="flex items-center gap-2 text-secondary-dark data-[state=active]:bg-brand-primary data-[state=active]:text-white">
            <Upload className="h-4 w-4" />
            Upload Files
          </TabsTrigger>
          <TabsTrigger value="manual" className="flex items-center gap-2 text-secondary-dark data-[state=active]:bg-brand-primary data-[state=active]:text-white">
            <Edit3 className="h-4 w-4" />
            Add Manually
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload" className="mt-6">
          <Card className="p-8 border-dashed border-2 hover:border-brand-primary transition-all duration-300 cursor-pointer bg-neutral-50/30">
            <div {...getRootProps()} className="text-center">
              <input {...getInputProps()} />
              <Upload className="mx-auto h-12 w-12 text-brand-primary mb-4" />
              
              {isDragActive ? (
                <p className="text-lg font-medium text-primary-dark">Drop the files here...</p>
              ) : (
                <div>
                  <p className="text-lg font-medium mb-2 text-primary-dark">
                    Drag & drop ingredient files here, or click to select
                  </p>
                  <p className="text-secondary-dark">
                    Supports CSV and JSON files
                  </p>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="manual" className="mt-6">
          <Card className="p-6 bg-neutral-50/30 border-neutral">
            <h3 className="text-lg font-semibold mb-4 text-primary-dark flex items-center gap-2">
              <Plus className="h-5 w-5 text-brand-primary" />
              Add Ingredient Manually
            </h3>
            
            {isAddingIngredient ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ingredient-name" className="text-secondary-dark font-medium">Ingredient Name</Label>
                    <Input
                      id="ingredient-name"
                      placeholder="e.g., Chicken breast"
                      value={manualIngredient.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="border-neutral focus:border-brand-primary"
                      autoFocus
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="ingredient-quantity" className="text-secondary-dark font-medium">Quantity</Label>
                    <Input
                      id="ingredient-quantity"
                      type="number"
                      placeholder="e.g., 2"
                      value={manualIngredient.quantity}
                      onChange={(e) => handleInputChange('quantity', e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="border-neutral focus:border-brand-primary"
                      min="0"
                      step="0.1"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ingredient-unit" className="text-secondary-dark font-medium">Unit</Label>
                    <Select value={manualIngredient.unit} onValueChange={(value) => handleInputChange('unit', value)}>
                      <SelectTrigger className="border-neutral focus:border-brand-primary">
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        {MEASUREMENT_UNITS.map(unit => (
                          <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="ingredient-category" className="text-secondary-dark font-medium">Category</Label>
                    <Select value={manualIngredient.category} onValueChange={(value) => handleInputChange('category', value)}>
                      <SelectTrigger className="border-neutral focus:border-brand-primary">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {INGREDIENT_CATEGORIES.map(category => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <Button 
                    onClick={handleAddManualIngredient}
                    className="btn-primary shadow-professional-md hover:shadow-professional-lg font-medium"
                    disabled={!manualIngredient.name.trim() || !manualIngredient.quantity.trim()}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Ingredient
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsAddingIngredient(false);
                      setManualIngredient({
                        name: '',
                        quantity: '',
                        unit: 'cups',
                        category: 'Other'
                      });
                    }}
                    className="border-neutral text-secondary-dark hover:bg-neutral-50"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Plus className="mx-auto h-8 w-8 text-brand-primary mb-3" />
                <p className="text-secondary-dark mb-4">
                  Add ingredients one by one with precise measurements
                </p>
                <Button 
                  onClick={() => setIsAddingIngredient(true)}
                  className="btn-primary shadow-professional-md hover:shadow-professional-lg font-medium"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Ingredient
                </Button>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      {uploadedIngredients.length > 0 && (
        <Card className="p-6 border-neutral shadow-professional-md bg-white">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-primary-dark">
            <FileText className="h-5 w-5 text-success" />
            Your Ingredients ({uploadedIngredients.length})
          </h3>
          
          <div className="space-y-2">
            {uploadedIngredients.map((ingredient, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg border border-neutral hover:border-brand-primary/30 transition-colors"
              >
                <span className="font-medium text-primary-dark">
                  {ingredient.quantity} {ingredient.unit} {ingredient.name}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white px-2 py-1 bg-success rounded font-medium shadow-professional-sm">
                    {ingredient.category}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveIngredient(index)}
                    className="text-error hover:bg-error/10 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          
          {!isAddingIngredient && (
            <div className="mt-4 pt-4 border-t border-neutral">
              <Button 
                onClick={() => setIsAddingIngredient(true)}
                variant="outline"
                className="btn-secondary text-white hover:bg-secondary/90 border-secondary"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Another Ingredient
              </Button>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};