export interface NutritionEntry {
  id: string;
  userId: string;
  date: string; // ISO date string
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'drink';
  foodItem: string;
  quantity: number;
  unit: string; // 'grams', 'cups', 'pieces', etc.
  nutrition: {
    calories: number;
    protein: number; // grams
    carbs: number; // grams
    fat: number; // grams
    fiber: number; // grams
    sugar: number; // grams
    sodium: number; // mg
    calcium: number; // mg
    iron: number; // mg
    vitaminC: number; // mg
  };
  mealTime?: string; // HH:MM format
  notes?: string;
  createdAt: string;
}

export interface DailyNutritionSummary {
  date: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalFiber: number;
  totalSugar: number;
  totalSodium: number;
  mealCount: number;
  entries: NutritionEntry[];
  goals?: DailyNutritionGoals;
}

export interface DailyNutritionGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  water: number; // liters
}

export interface WeeklyAnalytics {
  weekStart: string; // ISO date
  weekEnd: string;
  averageCalories: number;
  averageProtein: number;
  averageCarbs: number;
  averageFat: number;
  totalMeals: number;
  adherenceToGoals: number; // percentage
  dailySummaries: DailyNutritionSummary[];
}

export interface MonthlyAnalytics {
  month: string; // YYYY-MM
  totalCalories: number;
  averageCaloriesPerDay: number;
  adherenceRate: number;
  weightChange?: number;
  topFoods: Array<{
    food: string;
    frequency: number;
    totalCalories: number;
  }>;
  nutritionTrends: {
    calories: ChartDataPoint[];
    protein: ChartDataPoint[];
    carbs: ChartDataPoint[];
    fat: ChartDataPoint[];
  };
  weeklySummaries: WeeklyAnalytics[];
}

export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface ProgressMetrics {
  currentWeight?: number;
  startWeight?: number;
  goalWeight?: number;
  weightProgress: number; // percentage toward goal
  calorieGoalAchievement: number; // percentage of days goals met
  proteinGoalAchievement: number;
  streakDays: number; // consecutive days with entries
  totalEntriesLogged: number;
  averageMealsPerDay: number;
}

export interface EatingPattern {
  id: string;
  type: 'meal_timing' | 'food_preference' | 'nutrition_balance' | 'portion_size';
  title: string;
  description: string;
  frequency: number; // how often this pattern occurs
  trend: 'improving' | 'stable' | 'declining';
  suggestion: string;
  impact: 'positive' | 'neutral' | 'negative';
}

export interface AnalyticsInsight {
  id: string;
  type: 'achievement' | 'suggestion' | 'warning' | 'trend';
  title: string;
  description: string;
  actionable: boolean;
  actionText?: string;
  priority: 'low' | 'medium' | 'high';
  icon?: string;
  createdAt: string;
}

export interface UserHealthMetrics {
  date: string;
  weight?: number;
  energyLevel?: number; // 1-10 scale
  sleepQuality?: number; // 1-10 scale
  exerciseMinutes?: number;
  mood?: number; // 1-10 scale
  hydration?: number; // glasses of water
  notes?: string;
}

export interface AnalyticsFilters {
  dateRange: {
    start: string;
    end: string;
  };
  mealTypes?: Array<'breakfast' | 'lunch' | 'dinner' | 'snack' | 'drink'>;
  nutritionFocus?: 'calories' | 'protein' | 'carbs' | 'fat' | 'all';
  viewType: 'daily' | 'weekly' | 'monthly';
}

export interface NutritionGoalProgress {
  nutrient: string;
  current: number;
  goal: number;
  percentage: number;
  status: 'under' | 'met' | 'over';
  trend: 'up' | 'down' | 'stable';
}

// Chart-specific interfaces
export interface PieChartData {
  name: string;
  value: number;
  color: string;
  percentage: number;
}

export interface LineChartData {
  date: string;
  [key: string]: string | number; // flexible for multiple nutrients
}

export interface BarChartData {
  label: string;
  value: number;
  goal?: number;
  color?: string;
}

export interface AnalyticsDashboardData {
  summary: DailyNutritionSummary;
  progress: ProgressMetrics;
  insights: AnalyticsInsight[];
  patterns: EatingPattern[];
  charts: {
    macroDistribution: PieChartData[];
    weeklyTrend: LineChartData[];
    goalProgress: BarChartData[];
  };
}