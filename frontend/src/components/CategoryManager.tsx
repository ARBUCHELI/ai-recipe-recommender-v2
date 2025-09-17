import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Package, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { useFoodCategories } from '@/contexts/FoodCategoryContext';
import { FoodCategory, FoodProduct } from '@/types/foodCategories';
import { AddCategoryModal } from './AddCategoryModal';
import { AddProductModal } from './AddProductModal';

export const CategoryManager: React.FC = () => {
  const { 
    categories, 
    deleteCategory, 
    deleteProduct,
    initializeDefaultCategories,
    clearAllCategories
  } = useFoodCategories();
  
  const [selectedCategory, setSelectedCategory] = useState<FoodCategory | null>(null);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<FoodCategory | null>(null);
  const { toast } = useToast();

  const handleDeleteCategory = (category: FoodCategory) => {
    if (category.isCustom || confirm(`Are you sure you want to delete "${category.name}" and all its products?`)) {
      deleteCategory(category.id);
      toast({
        title: "Category Deleted",
        description: `"${category.name}" has been removed.`,
      });
    }
  };

  const handleDeleteProduct = (categoryId: string, product: FoodProduct) => {
    if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
      deleteProduct(categoryId, product.id);
      toast({
        title: "Product Deleted",
        description: `"${product.name}" has been removed.`,
      });
    }
  };

  const handleResetToDefaults = () => {
    if (confirm('This will replace all categories with the default ones. Are you sure?')) {
      initializeDefaultCategories();
      toast({
        title: "Reset Complete",
        description: "Categories have been reset to defaults.",
      });
    }
  };

  const handleClearAll = () => {
    if (confirm('This will delete ALL categories and products. This action cannot be undone!')) {
      clearAllCategories();
      toast({
        title: "All Categories Cleared",
        description: "All categories and products have been deleted.",
        variant: "destructive"
      });
    }
  };

  const openAddProductModal = (category: FoodCategory) => {
    setSelectedCategory(category);
    setIsAddProductModalOpen(true);
  };

  const openEditCategoryModal = (category: FoodCategory) => {
    setCategoryToEdit(category);
    setIsAddCategoryModalOpen(true);
  };

  const totalProducts = categories.reduce((sum, category) => sum + category.products.length, 0);
  const customCategories = categories.filter(cat => cat.isCustom).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Food Category Management</h2>
          <p className="text-gray-600 mt-1">
            Manage food categories and products for the recipe system
          </p>
          <div className="flex gap-4 mt-2">
            <Badge variant="outline">
              {categories.length} Categories
            </Badge>
            <Badge variant="outline">
              {totalProducts} Products
            </Badge>
            <Badge variant="outline">
              {customCategories} Custom
            </Badge>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleResetToDefaults}
            size="sm"
          >
            Reset to Defaults
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleClearAll}
            size="sm"
          >
            Clear All
          </Button>
          <Button 
            onClick={() => {
              setCategoryToEdit(null);
              setIsAddCategoryModalOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <Card key={category.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{category.icon}</span>
                  <div>
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                    {category.description && (
                      <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                    )}
                  </div>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openEditCategoryModal(category)}>
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit Category
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => openAddProductModal(category)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Product
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDeleteCategory(category)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Category
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary">
                  <Package className="h-3 w-3 mr-1" />
                  {category.products.length}
                </Badge>
                {category.isCustom && (
                  <Badge variant="outline" className="text-blue-600 border-blue-200">
                    Custom
                  </Badge>
                )}
              </div>
            </CardHeader>

            <CardContent>
              {category.products.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-gray-500 text-sm">No products yet</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => openAddProductModal(category)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add First Product
                  </Button>
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {category.products.map((product) => (
                    <div 
                      key={product.id}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {product.name}
                        </p>
                        {product.description && (
                          <p className="text-xs text-gray-600 truncate">
                            {product.description}
                          </p>
                        )}
                        {product.nutritionInfo?.calories && (
                          <p className="text-xs text-gray-500">
                            {product.nutritionInfo.calories} cal
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1 ml-2">
                        {product.isCustom && (
                          <Badge variant="outline" className="text-xs px-1 py-0">
                            Custom
                          </Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteProduct(category.id, product)}
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {/* Empty State */}
        {categories.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Categories</h3>
              <p className="text-gray-600 mb-4">
                Get started by adding your first food category
              </p>
              <Button onClick={() => setIsAddCategoryModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modals */}
      <AddCategoryModal
        isOpen={isAddCategoryModalOpen}
        onClose={() => {
          setIsAddCategoryModalOpen(false);
          setCategoryToEdit(null);
        }}
        categoryToEdit={categoryToEdit}
      />

      <AddProductModal
        isOpen={isAddProductModalOpen}
        onClose={() => {
          setIsAddProductModalOpen(false);
          setSelectedCategory(null);
        }}
        category={selectedCategory}
      />
    </div>
  );
};