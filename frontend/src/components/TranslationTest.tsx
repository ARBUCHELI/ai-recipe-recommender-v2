import React from 'react';
import { useTranslation } from '@/contexts/TranslationContext';
import { LanguageSwitcher } from './LanguageSwitcher';

export const TranslationTest: React.FC = () => {
  const { t, currentLanguage } = useTranslation();

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Translation System Test</h1>
          <LanguageSwitcher />
        </div>
        
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded">
            <h2 className="font-semibold mb-2">Current Language: {currentLanguage}</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded">
              <h3 className="font-semibold mb-2">Dashboard Titles:</h3>
              <ul className="space-y-1 text-sm">
                <li><strong>Main:</strong> {t('dashboard.title')}</li>
                <li><strong>Subtitle:</strong> {t('dashboard.subtitle')}</li>
                <li><strong>Meals Tab:</strong> {t('dashboard.tabs.meals')}</li>
                <li><strong>Timing Tab:</strong> {t('dashboard.tabs.timing')}</li>
                <li><strong>Shopping Tab:</strong> {t('dashboard.tabs.shopping')}</li>
              </ul>
            </div>
            
            <div className="bg-gray-50 p-4 rounded">
              <h3 className="font-semibold mb-2">Meals Section:</h3>
              <ul className="space-y-1 text-sm">
                <li><strong>Title:</strong> {t('dashboard.meals.title')}</li>
                <li><strong>Button:</strong> {t('dashboard.meals.generateButton')}</li>
                <li><strong>Breakfast:</strong> {t('dashboard.meals.breakfast')}</li>
                <li><strong>Lunch:</strong> {t('dashboard.meals.lunch')}</li>
                <li><strong>Dinner:</strong> {t('dashboard.meals.dinner')}</li>
              </ul>
            </div>
            
            <div className="bg-gray-50 p-4 rounded">
              <h3 className="font-semibold mb-2">Recipe Examples:</h3>
              <ul className="space-y-1 text-sm">
                <li><strong>Avocado Toast:</strong> {t('dashboard.meals.recipeList.breakfast.avocadoToast')}</li>
                <li><strong>Quinoa Salad:</strong> {t('dashboard.meals.recipeList.lunch.quinoaSalad')}</li>
                <li><strong>Salmon Rice:</strong> {t('dashboard.meals.recipeList.dinner.salmonRice')}</li>
              </ul>
            </div>
            
            <div className="bg-gray-50 p-4 rounded">
              <h3 className="font-semibold mb-2">Shopping Section:</h3>
              <ul className="space-y-1 text-sm">
                <li><strong>Title:</strong> {t('dashboard.shopping.title')}</li>
                <li><strong>Stores:</strong> {t('dashboard.shopping.groceryStores.title')}</li>
                <li><strong>List:</strong> {t('dashboard.shopping.shoppingList.title')}</li>
                <li><strong>Produce:</strong> {t('dashboard.shopping.shoppingList.produce.title')}</li>
              </ul>
            </div>
          </div>
          
          <div className="bg-green-50 p-4 rounded">
            <h3 className="font-semibold mb-2">Sample Shopping Items:</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <strong>Produce:</strong>
                <ul className="mt-1">
                  {t('dashboard.shopping.shoppingList.produce.items').slice(0, 3).map((item, index) => (
                    <li key={index}>• {item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <strong>Proteins:</strong>
                <ul className="mt-1">
                  {t('dashboard.shopping.shoppingList.proteins.items').slice(0, 3).map((item, index) => (
                    <li key={index}>• {item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <strong>Pantry:</strong>
                <ul className="mt-1">
                  {t('dashboard.shopping.shoppingList.pantry.items').slice(0, 3).map((item, index) => (
                    <li key={index}>• {item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};