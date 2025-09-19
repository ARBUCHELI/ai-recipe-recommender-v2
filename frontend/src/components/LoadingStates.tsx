import React from 'react';
import { Loader2, ChefHat, Sparkles, ShoppingCart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface LoadingStateProps {
  type: 'meal-generation' | 'recipe-analysis' | 'shopping-list' | 'general';
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ type, message }) => {
  const getLoadingConfig = () => {
    switch (type) {
      case 'meal-generation':
        return {
          icon: ChefHat,
          title: 'Generating Your Personalized Meals',
          subtitle: 'Our AI is crafting the perfect recipes for your goals...',
          color: 'text-green-600',
          bgColor: 'bg-green-50'
        };
      case 'recipe-analysis':
        return {
          icon: Sparkles,
          title: 'Analyzing Recipe',
          subtitle: 'Calculating nutrition and optimizing for your profile...',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50'
        };
      case 'shopping-list':
        return {
          icon: ShoppingCart,
          title: 'Creating Smart Shopping List',
          subtitle: 'Finding the best prices and optimizing quantities...',
          color: 'text-orange-600',
          bgColor: 'bg-orange-50'
        };
      default:
        return {
          icon: Loader2,
          title: 'Loading',
          subtitle: message || 'Please wait...',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50'
        };
    }
  };

  const { icon: Icon, title, subtitle, color, bgColor } = getLoadingConfig();

  return (
    <Card className={`${bgColor} border-none shadow-lg`}>
      <CardContent className="p-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="relative">
            <Icon className={`h-12 w-12 ${color} animate-pulse`} />
            <Loader2 className="h-6 w-6 text-gray-400 animate-spin absolute -top-1 -right-1" />
          </div>
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-600">{subtitle}</p>
        <div className="mt-4">
          <div className="bg-gray-200 rounded-full h-2">
            <div className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full animate-pulse" 
                 style={{ width: '60%' }}></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Skeleton loading components for different sections
export const RecipeCardSkeleton: React.FC = () => (
  <Card className="animate-pulse">
    <CardContent className="p-4">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 rounded"></div>
        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
      </div>
    </CardContent>
  </Card>
);

export const NutritionChartSkeleton: React.FC = () => (
  <Card className="animate-pulse">
    <CardContent className="p-6">
      <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
      <div className="h-32 bg-gray-200 rounded mb-4"></div>
      <div className="flex justify-between">
        <div className="h-4 bg-gray-200 rounded w-16"></div>
        <div className="h-4 bg-gray-200 rounded w-16"></div>
        <div className="h-4 bg-gray-200 rounded w-16"></div>
      </div>
    </CardContent>
  </Card>
);