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
import { useTranslation } from '@/contexts/TranslationContext';

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


// Helper function to parse ingredients from natural text
const parseIngredientsFromText = (text: string): Ingredient[] => {
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  const ingredients: Ingredient[] = [];
  
  // Common patterns for ingredient lines
  const patterns = [
    // Pattern: "2 cups flour" or "1 cup milk"
    /^(\d+(?:\.\d+)?)\s+(\w+)\s+(.+)$/,
    // Pattern: "flour - 2 cups" or "milk: 1 cup"
    /^(.+?)\s*[-:]\s*(\d+(?:\.\d+)?)\s+(\w+)$/,
    // Pattern: "• 2 cups flour" or "- 1 cup milk" (bulleted lists)
    /^[•\-*]\s*(\d+(?:\.\d+)?)\s+(\w+)\s+(.+)$/,
    // Pattern: "Flour: 2 cups"
    /^(.+?):\s*(\d+(?:\.\d+)?)\s+(\w+)$/
  ];
  
  // Function to categorize ingredients based on name
  const categorizeIngredient = (name: string): string => {
    const lowerName = name.toLowerCase();
    
    // Protein keywords
    if (/\b(chicken|beef|pork|fish|salmon|tuna|turkey|lamb|egg|tofu|tempeh)\b/.test(lowerName)) {
      return 'Proteins';
    }
    // Vegetable keywords
    if (/\b(onion|garlic|tomato|potato|carrot|celery|pepper|broccoli|spinach|lettuce|cucumber|mushroom)\b/.test(lowerName)) {
      return 'Vegetables';
    }
    // Fruit keywords
    if (/\b(apple|banana|orange|lemon|lime|berry|strawberry|grape|peach|pear|avocado)\b/.test(lowerName)) {
      return 'Fruits';
    }
    // Grain keywords
    if (/\b(flour|rice|pasta|bread|oats|quinoa|barley|wheat)\b/.test(lowerName)) {
      return 'Grains';
    }
    // Dairy keywords
    if (/\b(milk|cheese|butter|yogurt|cream|sour cream)\b/.test(lowerName)) {
      return 'Dairy';
    }
    // Spice/Herb keywords
    if (/\b(salt|pepper|basil|oregano|thyme|rosemary|cumin|paprika|cinnamon|ginger|garlic powder)\b/.test(lowerName)) {
      return 'Spices & Herbs';
    }
    // Oil keywords
    if (/\b(oil|olive oil|coconut oil|butter|margarine)\b/.test(lowerName)) {
      return 'Oils & Fats';
    }
    // Nut keywords
    if (/\b(almond|walnut|pecan|peanut|cashew|seed|sunflower)\b/.test(lowerName)) {
      return 'Nuts & Seeds';
    }
    // Legume keywords
    if (/\b(bean|lentil|chickpea|pea|split pea)\b/.test(lowerName)) {
      return 'Legumes';
    }
    
    return 'Other';
  };
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Skip empty lines or lines that look like headers/titles
    if (!trimmedLine || trimmedLine.length < 3) continue;
    if (/^(ingredients?|shopping list|grocery list)$/i.test(trimmedLine)) continue;
    
    let matched = false;
    
    for (const pattern of patterns) {
      const match = trimmedLine.match(pattern);
      if (match) {
        let quantity: number;
        let unit: string;
        let name: string;
        
        if (pattern.source.includes('^(.+?)\\s*[-:]')) {
          // Pattern where ingredient name comes first
          name = match[1].trim();
          quantity = parseFloat(match[2]);
          unit = match[3].toLowerCase();
        } else {
          // Pattern where quantity comes first
          quantity = parseFloat(match[1]);
          unit = match[2].toLowerCase();
          name = match[3].trim();
        }
        
        // Validate and normalize unit
        const normalizedUnit = MEASUREMENT_UNITS.find(u => 
          u.toLowerCase() === unit || 
          (unit.endsWith('s') && u.toLowerCase() === unit.slice(0, -1))
        ) || unit;
        
        // Clean up ingredient name
        name = name.replace(/^[•\-*]\s*/, '').trim();
        
        if (name && quantity > 0) {
          ingredients.push({
            name: name,
            quantity: quantity,
            unit: normalizedUnit,
            category: categorizeIngredient(name)
          });
          matched = true;
          break;
        }
      }
    }
    
    // If no pattern matched, try to extract just ingredient name
    if (!matched && trimmedLine.length > 2) {
      // Clean line and check if it looks like just an ingredient name
      const cleanName = trimmedLine.replace(/^[•\-*]\s*/, '').trim();
      
      // If it doesn't contain numbers, treat it as ingredient with default quantity
      if (!/\d/.test(cleanName) && cleanName.split(' ').length <= 4) {
        ingredients.push({
          name: cleanName,
          quantity: 1,
          unit: 'pieces',
          category: categorizeIngredient(cleanName)
        });
      }
    }
  }
  
  return ingredients;
};

export const FileUpload: React.FC<FileUploadProps> = ({
  onIngredientsUpload,
  uploadedIngredients,
  onRemoveIngredient
}) => {
  const { t } = useTranslation();
  
  // Manual entry form state
  const [manualIngredient, setManualIngredient] = useState({
    name: '',
    quantity: '',
    unit: 'cups',
    category: 'Other'
  });
  const [isAddingIngredient, setIsAddingIngredient] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{
    isProcessing: boolean;
    message: string;
    type: 'info' | 'success' | 'error' | null;
  }>({ isProcessing: false, message: '', type: null });

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
      if (file.name.endsWith('.txt')) {
        // Handle .txt files
        setUploadStatus({ isProcessing: true, message: t('upload.processingTextFile'), type: 'info' });
        
        const reader = new FileReader();
        reader.onload = () => {
          const text = reader.result as string;
          const ingredients = parseIngredientsFromText(text);
          
          if (ingredients.length > 0) {
            onIngredientsUpload(ingredients);
            setUploadStatus({
              isProcessing: false,
              message: t('upload.successfullyParsed', `Successfully parsed ${ingredients.length} ingredients from text file!`).replace('${count}', ingredients.length.toString()),
              type: 'success'
            });
            setTimeout(() => setUploadStatus({ isProcessing: false, message: '', type: null }), 3000);
          } else {
            setUploadStatus({
              isProcessing: false,
              message: t('upload.noIngredientsFound'),
              type: 'error'
            });
            setTimeout(() => setUploadStatus({ isProcessing: false, message: '', type: null }), 5000);
          }
        };
        
        reader.onerror = () => {
          setUploadStatus({
            isProcessing: false,
            message: t('upload.failedToReadFile'),
            type: 'error'
          });
          setTimeout(() => setUploadStatus({ isProcessing: false, message: '', type: null }), 5000);
        };
        
        reader.readAsText(file);
      } else {
        // Handle CSV and JSON files as before
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
      }
    });
  }, [onIngredientsUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/json': ['.json'],
      'text/plain': ['.txt']
    }
  });

  return (
    <div className="space-y-6">
      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-neutral-50 border border-neutral">
          <TabsTrigger value="upload" className="flex items-center gap-2 text-secondary-dark data-[state=active]:bg-brand-primary data-[state=active]:text-white">
            <Upload className="h-4 w-4" />
            {t('upload.uploadFiles')}
          </TabsTrigger>
          <TabsTrigger value="manual" className="flex items-center gap-2 text-secondary-dark data-[state=active]:bg-brand-primary data-[state=active]:text-white">
            <Edit3 className="h-4 w-4" />
            {t('upload.addManually')}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload" className="mt-6">
          <Card className="p-8 border-dashed border-2 hover:border-brand-primary transition-all duration-300 cursor-pointer bg-neutral-50/30">
            <div {...getRootProps()} className="text-center">
              <input {...getInputProps()} />
              <Upload className="mx-auto h-12 w-12 text-brand-primary mb-4" />
              
              {isDragActive ? (
                <p className="text-lg font-medium text-primary-dark">{t('upload.dropFilesHere')}</p>
              ) : (
                <div>
                  <p className="text-lg font-medium mb-2 text-primary-dark">
                    {t('upload.dragDropInstructions')}
                  </p>
                  <p className="text-secondary-dark">
                    {t('upload.supportedFormats')}
                  </p>
                </div>
              )}
            </div>
          </Card>
          
          {/* Upload Status Message */}
          {uploadStatus.message && (
            <Card className={`mt-4 p-4 border ${
              uploadStatus.type === 'success' ? 'border-success bg-green-50' :
              uploadStatus.type === 'error' ? 'border-error bg-red-50' :
              'border-brand-primary bg-blue-50'
            }`}>
              <div className="flex items-center gap-2">
                {uploadStatus.isProcessing && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand-primary"></div>
                )}
                <p className={`text-sm font-medium ${
                  uploadStatus.type === 'success' ? 'text-green-800' :
                  uploadStatus.type === 'error' ? 'text-red-800' :
                  'text-blue-800'
                }`}>
                  {uploadStatus.message}
                </p>
              </div>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="manual" className="mt-6">
          <Card className="p-6 bg-neutral-50/30 border-neutral">
            <h3 className="text-lg font-semibold mb-4 text-primary-dark flex items-center gap-2">
              <Plus className="h-5 w-5 text-brand-primary" />
              {t('upload.addIngredientManually')}
            </h3>
            
            {isAddingIngredient ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ingredient-name" className="text-secondary-dark font-medium">{t('upload.ingredientName')}</Label>
                    <Input
                      id="ingredient-name"
                      placeholder={t('upload.ingredientNamePlaceholder')}
                      value={manualIngredient.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="border-neutral focus:border-brand-primary"
                      autoFocus
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="ingredient-quantity" className="text-secondary-dark font-medium">{t('upload.quantity')}</Label>
                    <Input
                      id="ingredient-quantity"
                      type="number"
                      placeholder={t('upload.quantityPlaceholder')}
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
                    <Label htmlFor="ingredient-unit" className="text-secondary-dark font-medium">{t('upload.unit')}</Label>
                    <Select value={manualIngredient.unit} onValueChange={(value) => handleInputChange('unit', value)}>
                      <SelectTrigger className="border-neutral focus:border-brand-primary">
                        <SelectValue placeholder={t('upload.selectUnit')} />
                      </SelectTrigger>
                      <SelectContent>
                        {MEASUREMENT_UNITS.map(unit => (
                          <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="ingredient-category" className="text-secondary-dark font-medium">{t('upload.category')}</Label>
                    <Select value={manualIngredient.category} onValueChange={(value) => handleInputChange('category', value)}>
                      <SelectTrigger className="border-neutral focus:border-brand-primary">
                        <SelectValue placeholder={t('upload.selectCategory')} />
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
                    {t('upload.addIngredient')}
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
                    {t('common.cancel')}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Plus className="mx-auto h-8 w-8 text-brand-primary mb-3" />
                <p className="text-secondary-dark mb-4">
                  {t('upload.addIngredientsDescription')}
                </p>
                <Button 
                  onClick={() => setIsAddingIngredient(true)}
                  className="btn-primary shadow-professional-md hover:shadow-professional-lg font-medium"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {t('upload.addFirstIngredient')}
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
            {t('upload.yourIngredients')} ({uploadedIngredients.length})
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
                {t('upload.addAnotherIngredient')}
              </Button>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};