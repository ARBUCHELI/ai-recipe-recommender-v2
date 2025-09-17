import React, { useState } from 'react';
import { Settings, Plus, Trash2, Save, Package2, ShoppingCart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Categories, LocalStorageService } from '@/utils/localStorage';
import { useToast } from '@/hooks/use-toast';
import { CategoryManager } from './CategoryManager';
import { FoodCategoryProvider } from '@/contexts/FoodCategoryContext';

export const AdminPanel: React.FC = () => {
  const [categories, setCategories] = useState<Categories>(LocalStorageService.getCategories());
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newItems, setNewItems] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const handleAddCategory = () => {
    if (newCategoryName.trim() && !categories[newCategoryName]) {
      setCategories(prev => ({
        ...prev,
        [newCategoryName]: []
      }));
      setNewCategoryName('');
      toast({
        title: "Category Added",
        description: `"${newCategoryName}" category has been created.`
      });
    }
  };

  const handleDeleteCategory = (categoryName: string) => {
    const newCategories = { ...categories };
    delete newCategories[categoryName];
    setCategories(newCategories);
    toast({
      title: "Category Deleted",
      description: `"${categoryName}" category has been removed.`
    });
  };

  const handleAddItem = (categoryName: string) => {
    const newItem = newItems[categoryName]?.trim();
    if (newItem && !categories[categoryName].includes(newItem)) {
      setCategories(prev => ({
        ...prev,
        [categoryName]: [...prev[categoryName], newItem]
      }));
      setNewItems(prev => ({
        ...prev,
        [categoryName]: ''
      }));
      toast({
        title: "Item Added",
        description: `"${newItem}" added to ${categoryName}.`
      });
    }
  };

  const handleDeleteItem = (categoryName: string, itemIndex: number) => {
    setCategories(prev => ({
      ...prev,
      [categoryName]: prev[categoryName].filter((_, index) => index !== itemIndex)
    }));
  };

  const handleSave = () => {
    LocalStorageService.saveCategories(categories);
    toast({
      title: "Settings Saved",
      description: "Category settings have been saved successfully."
    });
  };

  return (
    <Card className="shadow-soft animate-fade-in">
      <CardHeader className="gradient-accent text-accent-foreground">
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Admin Panel - Food & Category Management
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6">
        <Tabs defaultValue="categories" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="categories" className="flex items-center gap-2">
              <Package2 className="h-4 w-4" />
              Food Categories
            </TabsTrigger>
            <TabsTrigger value="shopping" className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Shopping Lists
            </TabsTrigger>
          </TabsList>

          <TabsContent value="categories" className="mt-6">
            <FoodCategoryProvider>
              <CategoryManager />
            </FoodCategoryProvider>
          </TabsContent>

          <TabsContent value="shopping" className="mt-6 space-y-6">
            <div className="flex gap-3">
              <Input
                placeholder="New category name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
              />
              <Button onClick={handleAddCategory} disabled={!newCategoryName.trim()}>
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </div>

            <div className="space-y-4">
              {Object.entries(categories).map(([categoryName, items]) => (
                <Card key={categoryName} className="border">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{categoryName}</h4>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteCategory(categoryName)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add new item"
                        value={newItems[categoryName] || ''}
                        onChange={(e) => setNewItems(prev => ({
                          ...prev,
                          [categoryName]: e.target.value
                        }))}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddItem(categoryName)}
                      />
                      <Button
                        size="sm"
                        onClick={() => handleAddItem(categoryName)}
                        disabled={!newItems[categoryName]?.trim()}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {items.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-1 bg-muted px-2 py-1 rounded text-sm"
                        >
                          <span>{item}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteItem(categoryName, index)}
                            className="h-4 w-4 p-0"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex justify-end">
              <Button onClick={handleSave} className="gradient-primary">
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};