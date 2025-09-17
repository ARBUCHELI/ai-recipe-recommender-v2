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
import { useToast } from '@/hooks/use-toast';
import { useFoodCategories } from '@/contexts/FoodCategoryContext';
import { FoodCategory, CategoryIcon, AVAILABLE_ICONS } from '@/types/foodCategories';

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryToEdit?: FoodCategory | null;
}

export const AddCategoryModal: React.FC<AddCategoryModalProps> = ({
  isOpen,
  onClose,
  categoryToEdit
}) => {
  const { addCategory, updateCategory } = useFoodCategories();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '🍞' as CategoryIcon
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens/closes or category changes
  useEffect(() => {
    if (isOpen) {
      if (categoryToEdit) {
        setFormData({
          name: categoryToEdit.name,
          description: categoryToEdit.description || '',
          icon: categoryToEdit.icon as CategoryIcon
        });
      } else {
        setFormData({
          name: '',
          description: '',
          icon: '🍞'
        });
      }
    }
  }, [isOpen, categoryToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Category name is required.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      if (categoryToEdit) {
        // Update existing category
        updateCategory(categoryToEdit.id, {
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          icon: formData.icon
        });
        
        toast({
          title: "Category Updated",
          description: `"${formData.name}" has been updated successfully.`,
        });
      } else {
        // Add new category
        addCategory({
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          icon: formData.icon,
          products: [],
          isCustom: true
        });
        
        toast({
          title: "Category Added",
          description: `"${formData.name}" has been created successfully.`,
        });
      }
      
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save category. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {categoryToEdit ? 'Edit Category' : 'Add New Category'}
          </DialogTitle>
          <DialogDescription>
            {categoryToEdit 
              ? 'Update the category details below.' 
              : 'Create a new food category with an icon and description.'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Icon Selection */}
          <div className="space-y-2">
            <Label htmlFor="icon">Category Icon</Label>
            <div className="grid grid-cols-5 gap-2 p-3 border rounded-md max-h-40 overflow-y-auto">
              {AVAILABLE_ICONS.map(({ icon, label }) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => handleInputChange('icon', icon)}
                  className={`p-2 text-2xl rounded-md border transition-colors hover:bg-gray-100 ${
                    formData.icon === icon 
                      ? 'bg-blue-100 border-blue-500' 
                      : 'border-gray-200'
                  }`}
                  title={label}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Name Input */}
          <div className="space-y-2">
            <Label htmlFor="name">Category Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="e.g., Fresh Produce"
              maxLength={50}
              required
            />
          </div>

          {/* Description Input */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Brief description of this category..."
              rows={3}
              maxLength={200}
            />
          </div>

          {/* Preview */}
          <div className="border rounded-md p-3 bg-gray-50">
            <Label className="text-sm font-medium">Preview:</Label>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-2xl">{formData.icon}</span>
              <div>
                <p className="font-medium">{formData.name || 'Category Name'}</p>
                {formData.description && (
                  <p className="text-sm text-gray-600">{formData.description}</p>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !formData.name.trim()}>
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting 
                ? 'Saving...' 
                : categoryToEdit ? 'Update Category' : 'Add Category'
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};