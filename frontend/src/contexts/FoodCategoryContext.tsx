import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { FoodCategory, FoodProduct, PREDEFINED_CATEGORIES } from '@/types/foodCategories';

interface FoodCategoryContextType {
  categories: FoodCategory[];
  addCategory: (category: Omit<FoodCategory, 'id' | 'createdAt'>) => void;
  updateCategory: (id: string, updates: Partial<FoodCategory>) => void;
  deleteCategory: (id: string) => void;
  addProductToCategory: (categoryId: string, product: Omit<FoodProduct, 'id' | 'createdAt'>) => void;
  updateProduct: (categoryId: string, productId: string, updates: Partial<FoodProduct>) => void;
  deleteProduct: (categoryId: string, productId: string) => void;
  getCategoryById: (id: string) => FoodCategory | undefined;
  getProductById: (categoryId: string, productId: string) => FoodProduct | undefined;
  initializeDefaultCategories: () => void;
  clearAllCategories: () => void;
  exportCategories: () => string;
  importCategories: (jsonData: string) => boolean;
}

const FoodCategoryContext = createContext<FoodCategoryContextType | undefined>(undefined);

interface FoodCategoryProviderProps {
  children: ReactNode;
}

const STORAGE_KEY = 'food-categories';

export const FoodCategoryProvider: React.FC<FoodCategoryProviderProps> = ({ children }) => {
  const [categories, setCategories] = useState<FoodCategory[]>([]);

  // Load categories from localStorage on mount
  useEffect(() => {
    const savedCategories = localStorage.getItem(STORAGE_KEY);
    if (savedCategories) {
      try {
        const parsedCategories = JSON.parse(savedCategories);
        setCategories(parsedCategories);
      } catch (error) {
        console.error('Error parsing saved categories:', error);
        initializeDefaultCategories();
      }
    } else {
      initializeDefaultCategories();
    }
  }, []);

  // Save categories to localStorage whenever categories change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
  }, [categories]);

  const generateId = () => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const initializeDefaultCategories = () => {
    const defaultCategories: FoodCategory[] = PREDEFINED_CATEGORIES.map(category => ({
      ...category,
      id: generateId(),
      createdAt: new Date().toISOString()
    }));
    setCategories(defaultCategories);
  };

  const addCategory = (categoryData: Omit<FoodCategory, 'id' | 'createdAt'>) => {
    const newCategory: FoodCategory = {
      ...categoryData,
      id: generateId(),
      createdAt: new Date().toISOString()
    };
    setCategories(prev => [...prev, newCategory]);
  };

  const updateCategory = (id: string, updates: Partial<FoodCategory>) => {
    setCategories(prev => prev.map(category => 
      category.id === id ? { ...category, ...updates } : category
    ));
  };

  const deleteCategory = (id: string) => {
    setCategories(prev => prev.filter(category => category.id !== id));
  };

  const addProductToCategory = (categoryId: string, productData: Omit<FoodProduct, 'id' | 'createdAt'>) => {
    const newProduct: FoodProduct = {
      ...productData,
      id: generateId(),
      createdAt: new Date().toISOString()
    };

    setCategories(prev => prev.map(category => 
      category.id === categoryId
        ? { ...category, products: [...category.products, newProduct] }
        : category
    ));
  };

  const updateProduct = (categoryId: string, productId: string, updates: Partial<FoodProduct>) => {
    setCategories(prev => prev.map(category => 
      category.id === categoryId
        ? {
            ...category,
            products: category.products.map(product =>
              product.id === productId ? { ...product, ...updates } : product
            )
          }
        : category
    ));
  };

  const deleteProduct = (categoryId: string, productId: string) => {
    setCategories(prev => prev.map(category => 
      category.id === categoryId
        ? {
            ...category,
            products: category.products.filter(product => product.id !== productId)
          }
        : category
    ));
  };

  const getCategoryById = (id: string): FoodCategory | undefined => {
    return categories.find(category => category.id === id);
  };

  const getProductById = (categoryId: string, productId: string): FoodProduct | undefined => {
    const category = getCategoryById(categoryId);
    return category?.products.find(product => product.id === productId);
  };

  const clearAllCategories = () => {
    setCategories([]);
  };

  const exportCategories = (): string => {
    return JSON.stringify(categories, null, 2);
  };

  const importCategories = (jsonData: string): boolean => {
    try {
      const importedCategories = JSON.parse(jsonData);
      // Basic validation
      if (Array.isArray(importedCategories)) {
        setCategories(importedCategories);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error importing categories:', error);
      return false;
    }
  };

  const value: FoodCategoryContextType = {
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    addProductToCategory,
    updateProduct,
    deleteProduct,
    getCategoryById,
    getProductById,
    initializeDefaultCategories,
    clearAllCategories,
    exportCategories,
    importCategories
  };

  return (
    <FoodCategoryContext.Provider value={value}>
      {children}
    </FoodCategoryContext.Provider>
  );
};

export const useFoodCategories = (): FoodCategoryContextType => {
  const context = useContext(FoodCategoryContext);
  if (context === undefined) {
    throw new Error('useFoodCategories must be used within a FoodCategoryProvider');
  }
  return context;
};