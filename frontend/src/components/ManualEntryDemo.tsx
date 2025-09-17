import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, CheckCircle } from 'lucide-react';

interface DemoIngredient {
  name: string;
  quantity: number;
  unit: string;
  category: string;
}

const sampleIngredients: DemoIngredient[] = [
  { name: 'Chicken breast', quantity: 2, unit: 'pieces', category: 'Proteins' },
  { name: 'Broccoli', quantity: 1.5, unit: 'cups', category: 'Vegetables' },
  { name: 'Olive oil', quantity: 2, unit: 'tbsp', category: 'Oils & Fats' },
  { name: 'Garlic', quantity: 3, unit: 'cloves', category: 'Spices & Herbs' }
];

export const ManualEntryDemo: React.FC = () => {
  return (
    <Card className="p-6 bg-gradient-to-br from-brand-primary/5 to-success/5 border-brand-primary/20">
      <div className="text-center mb-4">
        <Plus className="mx-auto h-8 w-8 text-brand-primary mb-2" />
        <h3 className="text-lg font-semibold text-primary-dark mb-2">
          Manual Entry Example
        </h3>
        <p className="text-secondary-dark text-sm">
          See how easy it is to add ingredients manually!
        </p>
      </div>
      
      <div className="space-y-3">
        {sampleIngredients.map((ingredient, index) => (
          <div 
            key={index}
            className="flex items-center justify-between p-3 bg-white rounded-lg border border-neutral shadow-professional-sm"
          >
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-success" />
              <span className="font-medium text-primary-dark">
                {ingredient.quantity} {ingredient.unit} {ingredient.name}
              </span>
            </div>
            <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
              {ingredient.category}
            </Badge>
          </div>
        ))}
      </div>
      
      <div className="mt-4 p-3 bg-white/50 rounded-lg border border-brand-primary/30">
        <p className="text-xs text-secondary-dark text-center">
          💡 <strong>Tip:</strong> Press Enter in any field to quickly add ingredients!
        </p>
      </div>
    </Card>
  );
};