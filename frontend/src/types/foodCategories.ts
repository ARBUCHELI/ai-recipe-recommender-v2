export interface FoodProduct {
  id: string;
  name: string;
  description?: string;
  nutritionInfo?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    fiber?: number;
  };
  isCustom: boolean;
  createdAt: string;
}

export interface FoodCategory {
  id: string;
  name: string;
  icon: string;
  description?: string;
  products: FoodProduct[];
  isCustom: boolean;
  createdAt: string;
}

export type CategoryIcon = 
  | '🍞' // Bakery & Grains
  | '🥩' // Meat & Protein
  | '🥦' // Fruits & Vegetables
  | '🧀' // Dairy & Alternatives
  | '🍫' // Snacks & Sweets
  | '🥤' // Beverages
  | '🥫' // Canned Goods
  | '❄️' // Frozen Foods
  | '🧂' // Condiments & Spices
  | '🏠' // Household Items
  | '💊' // Health & Supplements
  | '🐟' // Seafood
  | '🥜' // Nuts & Seeds
  | '🌿' // Herbs & Spices
  | '🍯'; // Natural Sweeteners

export const PREDEFINED_CATEGORIES: Omit<FoodCategory, 'id' | 'createdAt'>[] = [
  {
    name: 'Bakery & Grains',
    icon: '🍞',
    description: 'Bread, cereals, rice, pasta, and grain-based products',
    products: [
      {
        id: 'whole-wheat-bread',
        name: 'Whole wheat bread',
        description: 'High-fiber bread made from whole wheat flour',
        nutritionInfo: { calories: 69, protein: 4, carbs: 12, fat: 1, fiber: 2 },
        isCustom: false,
        createdAt: new Date().toISOString()
      },
      {
        id: 'croissants',
        name: 'Croissants',
        description: 'Buttery, flaky French pastries',
        nutritionInfo: { calories: 231, protein: 5, carbs: 26, fat: 12, fiber: 1 },
        isCustom: false,
        createdAt: new Date().toISOString()
      },
      {
        id: 'bagels',
        name: 'Bagels',
        description: 'Dense, chewy bread rolls with a hole in the center',
        nutritionInfo: { calories: 289, protein: 11, carbs: 56, fat: 2, fiber: 2 },
        isCustom: false,
        createdAt: new Date().toISOString()
      },
      {
        id: 'oatmeal',
        name: 'Oatmeal',
        description: 'Nutritious breakfast cereal made from oats',
        nutritionInfo: { calories: 68, protein: 2, carbs: 12, fat: 1, fiber: 2 },
        isCustom: false,
        createdAt: new Date().toISOString()
      },
      {
        id: 'basmati-rice',
        name: 'Basmati rice',
        description: 'Aromatic long-grain rice variety',
        nutritionInfo: { calories: 121, protein: 3, carbs: 25, fat: 0, fiber: 0 },
        isCustom: false,
        createdAt: new Date().toISOString()
      }
    ],
    isCustom: false
  },
  {
    name: 'Meat & Protein',
    icon: '🥩',
    description: 'Fresh meats, poultry, fish, and plant-based proteins',
    products: [
      {
        id: 'chicken-breast',
        name: 'Chicken breast',
        description: 'Lean protein source, skinless and boneless',
        nutritionInfo: { calories: 165, protein: 31, carbs: 0, fat: 4, fiber: 0 },
        isCustom: false,
        createdAt: new Date().toISOString()
      },
      {
        id: 'ground-beef',
        name: 'Ground beef',
        description: 'Versatile beef mince for various dishes',
        nutritionInfo: { calories: 250, protein: 26, carbs: 0, fat: 15, fiber: 0 },
        isCustom: false,
        createdAt: new Date().toISOString()
      },
      {
        id: 'pork-chops',
        name: 'Pork chops',
        description: 'Tender cuts from the pork loin',
        nutritionInfo: { calories: 231, protein: 23, carbs: 0, fat: 14, fiber: 0 },
        isCustom: false,
        createdAt: new Date().toISOString()
      },
      {
        id: 'salmon-fillet',
        name: 'Salmon fillet',
        description: 'Rich in omega-3 fatty acids',
        nutritionInfo: { calories: 208, protein: 22, carbs: 0, fat: 12, fiber: 0 },
        isCustom: false,
        createdAt: new Date().toISOString()
      },
      {
        id: 'tofu',
        name: 'Tofu',
        description: 'Plant-based protein made from soybeans',
        nutritionInfo: { calories: 70, protein: 8, carbs: 2, fat: 4, fiber: 1 },
        isCustom: false,
        createdAt: new Date().toISOString()
      }
    ],
    isCustom: false
  },
  {
    name: 'Fruits & Vegetables',
    icon: '🥦',
    description: 'Fresh fruits, vegetables, and leafy greens',
    products: [
      {
        id: 'apples',
        name: 'Apples',
        description: 'Crisp, sweet fruit rich in fiber',
        nutritionInfo: { calories: 52, protein: 0, carbs: 14, fat: 0, fiber: 2 },
        isCustom: false,
        createdAt: new Date().toISOString()
      },
      {
        id: 'bananas',
        name: 'Bananas',
        description: 'Potassium-rich tropical fruit',
        nutritionInfo: { calories: 89, protein: 1, carbs: 23, fat: 0, fiber: 3 },
        isCustom: false,
        createdAt: new Date().toISOString()
      },
      {
        id: 'carrots',
        name: 'Carrots',
        description: 'Orange root vegetable high in beta-carotene',
        nutritionInfo: { calories: 41, protein: 1, carbs: 10, fat: 0, fiber: 3 },
        isCustom: false,
        createdAt: new Date().toISOString()
      },
      {
        id: 'spinach',
        name: 'Spinach',
        description: 'Iron-rich leafy green vegetable',
        nutritionInfo: { calories: 23, protein: 3, carbs: 4, fat: 0, fiber: 2 },
        isCustom: false,
        createdAt: new Date().toISOString()
      },
      {
        id: 'tomatoes',
        name: 'Tomatoes',
        description: 'Juicy red fruit, rich in lycopene',
        nutritionInfo: { calories: 18, protein: 1, carbs: 4, fat: 0, fiber: 1 },
        isCustom: false,
        createdAt: new Date().toISOString()
      }
    ],
    isCustom: false
  },
  {
    name: 'Dairy & Alternatives',
    icon: '🧀',
    description: 'Milk products and plant-based dairy alternatives',
    products: [
      {
        id: 'whole-milk',
        name: 'Whole milk',
        description: 'Rich, creamy milk with natural fat content',
        nutritionInfo: { calories: 42, protein: 3, carbs: 5, fat: 2, fiber: 0 },
        isCustom: false,
        createdAt: new Date().toISOString()
      },
      {
        id: 'yogurt',
        name: 'Yogurt',
        description: 'Probiotic-rich fermented dairy product',
        nutritionInfo: { calories: 59, protein: 10, carbs: 4, fat: 0, fiber: 0 },
        isCustom: false,
        createdAt: new Date().toISOString()
      },
      {
        id: 'cheddar-cheese',
        name: 'Cheddar cheese',
        description: 'Sharp, aged cheese with rich flavor',
        nutritionInfo: { calories: 403, protein: 25, carbs: 1, fat: 33, fiber: 0 },
        isCustom: false,
        createdAt: new Date().toISOString()
      },
      {
        id: 'almond-milk',
        name: 'Almond milk',
        description: 'Plant-based milk alternative made from almonds',
        nutritionInfo: { calories: 15, protein: 1, carbs: 1, fat: 1, fiber: 0 },
        isCustom: false,
        createdAt: new Date().toISOString()
      },
      {
        id: 'butter',
        name: 'Butter',
        description: 'Rich dairy fat for cooking and baking',
        nutritionInfo: { calories: 717, protein: 1, carbs: 0, fat: 81, fiber: 0 },
        isCustom: false,
        createdAt: new Date().toISOString()
      }
    ],
    isCustom: false
  },
  {
    name: 'Snacks & Sweets',
    icon: '🍫',
    description: 'Treats, snacks, and sweet indulgences',
    products: [
      {
        id: 'dark-chocolate',
        name: 'Dark chocolate',
        description: 'Rich chocolate with antioxidants',
        nutritionInfo: { calories: 546, protein: 8, carbs: 46, fat: 31, fiber: 11 },
        isCustom: false,
        createdAt: new Date().toISOString()
      },
      {
        id: 'potato-chips',
        name: 'Potato chips',
        description: 'Crispy fried potato slices',
        nutritionInfo: { calories: 536, protein: 7, carbs: 53, fat: 34, fiber: 5 },
        isCustom: false,
        createdAt: new Date().toISOString()
      },
      {
        id: 'granola-bars',
        name: 'Granola bars',
        description: 'Oat-based energy bars with nuts and fruits',
        nutritionInfo: { calories: 471, protein: 10, carbs: 64, fat: 20, fiber: 7 },
        isCustom: false,
        createdAt: new Date().toISOString()
      },
      {
        id: 'ice-cream',
        name: 'Ice cream',
        description: 'Frozen dairy dessert in various flavors',
        nutritionInfo: { calories: 207, protein: 4, carbs: 24, fat: 11, fiber: 1 },
        isCustom: false,
        createdAt: new Date().toISOString()
      },
      {
        id: 'cookies',
        name: 'Cookies',
        description: 'Sweet baked treats in various flavors',
        nutritionInfo: { calories: 502, protein: 5, carbs: 64, fat: 25, fiber: 2 },
        isCustom: false,
        createdAt: new Date().toISOString()
      }
    ],
    isCustom: false
  },
  {
    name: 'Beverages',
    icon: '🥤',
    description: 'Drinks, juices, and liquid refreshments',
    products: [
      {
        id: 'orange-juice',
        name: 'Orange juice',
        description: 'Fresh citrus juice rich in vitamin C',
        nutritionInfo: { calories: 45, protein: 1, carbs: 10, fat: 0, fiber: 0 },
        isCustom: false,
        createdAt: new Date().toISOString()
      },
      {
        id: 'coffee',
        name: 'Coffee',
        description: 'Energizing brewed beverage',
        nutritionInfo: { calories: 2, protein: 0, carbs: 0, fat: 0, fiber: 0 },
        isCustom: false,
        createdAt: new Date().toISOString()
      },
      {
        id: 'green-tea',
        name: 'Green tea',
        description: 'Antioxidant-rich tea variety',
        nutritionInfo: { calories: 2, protein: 0, carbs: 0, fat: 0, fiber: 0 },
        isCustom: false,
        createdAt: new Date().toISOString()
      },
      {
        id: 'sparkling-water',
        name: 'Sparkling water',
        description: 'Carbonated water for hydration',
        nutritionInfo: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
        isCustom: false,
        createdAt: new Date().toISOString()
      },
      {
        id: 'cola',
        name: 'Cola',
        description: 'Popular carbonated soft drink',
        nutritionInfo: { calories: 42, protein: 0, carbs: 11, fat: 0, fiber: 0 },
        isCustom: false,
        createdAt: new Date().toISOString()
      }
    ],
    isCustom: false
  }
];

export const AVAILABLE_ICONS: { icon: CategoryIcon; label: string }[] = [
  { icon: '🍞', label: 'Bakery & Grains' },
  { icon: '🥩', label: 'Meat & Protein' },
  { icon: '🥦', label: 'Fruits & Vegetables' },
  { icon: '🧀', label: 'Dairy & Alternatives' },
  { icon: '🍫', label: 'Snacks & Sweets' },
  { icon: '🥤', label: 'Beverages' },
  { icon: '🥫', label: 'Canned Goods' },
  { icon: '❄️', label: 'Frozen Foods' },
  { icon: '🧂', label: 'Condiments & Spices' },
  { icon: '🏠', label: 'Household Items' },
  { icon: '💊', label: 'Health & Supplements' },
  { icon: '🐟', label: 'Seafood' },
  { icon: '🥜', label: 'Nuts & Seeds' },
  { icon: '🌿', label: 'Herbs & Spices' },
  { icon: '🍯', label: 'Natural Sweeteners' }
];