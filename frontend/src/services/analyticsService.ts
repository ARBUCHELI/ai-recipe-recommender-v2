import { 
  NutritionEntry, 
  DailyNutritionSummary, 
  WeeklyAnalytics, 
  MonthlyAnalytics, 
  ProgressMetrics, 
  EatingPattern, 
  AnalyticsInsight,
  UserHealthMetrics,
  AnalyticsFilters,
  AnalyticsDashboardData,
  PieChartData,
  LineChartData,
  BarChartData,
  DailyNutritionGoals
} from '../types/Analytics';

class AnalyticsService {
  private apiBaseUrl = import.meta.env?.VITE_API_URL || 'http://localhost:3001/api';
  private token: string | null = null;

  updateToken(token: string | null) {
    this.token = token;
  }

  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      ...(this.token && { Authorization: `Bearer ${this.token}` })
    };
  }

  // Nutrition Entry Methods
  async addNutritionEntry(entry: Omit<NutritionEntry, 'id' | 'createdAt'>): Promise<{ success: boolean; entry?: NutritionEntry; error?: string }> {
    try {
      console.log('Adding nutrition entry:', entry);
      
      const mockEntry: NutritionEntry = {
        ...entry,
        id: `entry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString()
      };
      
      // Get existing entries
      const existingEntries = this.getStoredEntries();
      console.log('Existing entries before adding:', existingEntries.length, existingEntries);
      
      // Add new entry
      const updatedEntries = [...existingEntries, mockEntry];
      console.log('Updated entries after adding:', updatedEntries.length, updatedEntries);
      
      // Store in localStorage
      localStorage.setItem('nutrition_entries', JSON.stringify(updatedEntries));
      
      // Verify storage
      const verifyStorage = JSON.parse(localStorage.getItem('nutrition_entries') || '[]');
      console.log('Verified storage after save:', verifyStorage.length, verifyStorage);
      
      return { success: true, entry: mockEntry };
    } catch (error) {
      console.error('Error adding nutrition entry:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Failed to add nutrition entry' };
    }
  }

  async updateNutritionEntry(id: string, entry: Partial<NutritionEntry>): Promise<{ success: boolean; entry?: NutritionEntry; error?: string }> {
    try {
      const existingEntries = this.getStoredEntries();
      const index = existingEntries.findIndex(e => e.id === id);
      
      if (index === -1) {
        return { success: false, error: 'Entry not found' };
      }
      
      existingEntries[index] = { ...existingEntries[index], ...entry };
      localStorage.setItem('nutrition_entries', JSON.stringify(existingEntries));
      
      return { success: true, entry: existingEntries[index] };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to update nutrition entry' };
    }
  }

  async deleteNutritionEntry(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const existingEntries = this.getStoredEntries();
      const filteredEntries = existingEntries.filter(e => e.id !== id);
      localStorage.setItem('nutrition_entries', JSON.stringify(filteredEntries));
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to delete nutrition entry' };
    }
  }

  async getNutritionEntries(filters?: AnalyticsFilters): Promise<{ success: boolean; entries?: NutritionEntry[]; error?: string }> {
    try {
      let entries = this.getStoredEntries();
      
      // Apply filters if provided
      if (filters) {
        entries = entries.filter(entry => {
          const entryDate = new Date(entry.date);
          const startDate = new Date(filters.dateRange.start);
          const endDate = new Date(filters.dateRange.end);
          
          if (entryDate < startDate || entryDate > endDate) return false;
          if (filters.mealTypes && !filters.mealTypes.includes(entry.mealType)) return false;
          
          return true;
        });
      }
      
      return { success: true, entries };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch nutrition entries' };
    }
  }

  // Daily Analytics Methods
  async getDailySummary(date: string): Promise<{ success: boolean; summary?: DailyNutritionSummary; error?: string }> {
    try {
      const allEntries = this.getStoredEntries();
      const entries = allEntries.filter(entry => 
        new Date(entry.date).toDateString() === new Date(date).toDateString()
      );
      
      console.log(`Daily summary for ${date}: Found ${entries.length} entries out of ${allEntries.length} total:`, entries);
      
      const summary = this.calculateDailySummary(entries, date);
      console.log('Calculated daily summary:', summary);
      return { success: true, summary };
    } catch (error) {
      console.error('Daily summary error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Failed to get daily summary' };
    }
  }

  // Weekly Analytics Methods
  async getWeeklyAnalytics(weekStart: string): Promise<{ success: boolean; analytics?: WeeklyAnalytics; error?: string }> {
    try {
      const startDate = new Date(weekStart);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6);
      
      const entries = this.getStoredEntries().filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= startDate && entryDate <= endDate;
      });
      
      const analytics = this.calculateWeeklyAnalytics(entries, weekStart, endDate.toISOString().split('T')[0]);
      return { success: true, analytics };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to get weekly analytics' };
    }
  }

  // Monthly Analytics Methods
  async getMonthlyAnalytics(month: string): Promise<{ success: boolean; analytics?: MonthlyAnalytics; error?: string }> {
    try {
      const [year, monthNum] = month.split('-');
      const startDate = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(monthNum), 0);
      
      const entries = this.getStoredEntries().filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= startDate && entryDate <= endDate;
      });
      
      const analytics = this.calculateMonthlyAnalytics(entries, month);
      return { success: true, analytics };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to get monthly analytics' };
    }
  }

  // Progress Tracking Methods
  async getProgressMetrics(): Promise<{ success: boolean; progress?: ProgressMetrics; error?: string }> {
    try {
      const entries = this.getStoredEntries();
      const healthMetrics = this.getStoredHealthMetrics();
      
      const progress = this.calculateProgressMetrics(entries, healthMetrics);
      return { success: true, progress };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to get progress metrics' };
    }
  }

  // Eating Pattern Analysis
  async getEatingPatterns(): Promise<{ success: boolean; patterns?: EatingPattern[]; error?: string }> {
    try {
      const entries = this.getStoredEntries();
      const patterns = this.analyzeEatingPatterns(entries);
      return { success: true, patterns };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to analyze eating patterns' };
    }
  }

  // Insights Generation
  async getAnalyticsInsights(): Promise<{ success: boolean; insights?: AnalyticsInsight[]; error?: string }> {
    try {
      const entries = this.getStoredEntries();
      const insights = this.generateInsights(entries);
      return { success: true, insights };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to generate insights' };
    }
  }

  // Dashboard Data
  async getDashboardData(): Promise<{ success: boolean; data?: AnalyticsDashboardData; error?: string }> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Force fresh data by getting entries again
      const entries = this.getStoredEntries();
      console.log('Dashboard loading with entries:', entries.length, entries);
      
      const [summaryResult, progressResult, insightsResult, patternsResult] = await Promise.all([
        this.getDailySummary(today),
        this.getProgressMetrics(),
        this.getAnalyticsInsights(),
        this.getEatingPatterns()
      ]);
      
      if (!summaryResult.success || !progressResult.success) {
        throw new Error('Failed to fetch dashboard data');
      }
      
      const charts = this.generateChartData();
      console.log('Generated chart data:', charts);
      
      const data: AnalyticsDashboardData = {
        summary: summaryResult.summary!,
        progress: progressResult.progress!,
        insights: insightsResult.insights || [],
        patterns: patternsResult.patterns || [],
        charts
      };
      
      console.log('Dashboard data prepared:', data);
      return { success: true, data };
    } catch (error) {
      console.error('Dashboard data error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Failed to get dashboard data' };
    }
  }

  // Health Metrics Methods
  async addHealthMetrics(metrics: Omit<UserHealthMetrics, 'date'>): Promise<{ success: boolean; error?: string }> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const newMetrics: UserHealthMetrics = { ...metrics, date: today };
      
      const existingMetrics = this.getStoredHealthMetrics();
      const existingIndex = existingMetrics.findIndex(m => m.date === today);
      
      if (existingIndex >= 0) {
        existingMetrics[existingIndex] = { ...existingMetrics[existingIndex], ...newMetrics };
      } else {
        existingMetrics.push(newMetrics);
      }
      
      localStorage.setItem('health_metrics', JSON.stringify(existingMetrics));
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to add health metrics' };
    }
  }

  // Clear all analytics data
  async clearAllData(): Promise<{ success: boolean; error?: string }> {
    try {
      localStorage.removeItem('nutrition_entries');
      localStorage.removeItem('health_metrics');
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to clear data' };
    }
  }

  // Private helper methods
  private roundToDecimal(value: number, decimals: number = 1): number {
    return Math.round((value + Number.EPSILON) * Math.pow(10, decimals)) / Math.pow(10, decimals);
  }

  private getStoredEntries(): NutritionEntry[] {
    try {
      const stored = localStorage.getItem('nutrition_entries');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private getStoredHealthMetrics(): UserHealthMetrics[] {
    try {
      const stored = localStorage.getItem('health_metrics');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private calculateDailySummary(entries: NutritionEntry[], date: string): DailyNutritionSummary {
    console.log(`Calculating daily summary for ${date} with ${entries.length} entries:`, entries);
    
    // Calculate totals by summing all entries
    const totalCalories = entries.reduce((sum, entry) => {
      const calories = Number(entry.nutrition.calories) || 0;
      console.log(`Adding calories: ${sum} + ${calories} = ${sum + calories}`);
      return sum + calories;
    }, 0);
    
    const totalProtein = entries.reduce((sum, entry) => {
      const protein = Number(entry.nutrition.protein) || 0;
      return sum + protein;
    }, 0);
    
    const totalCarbs = entries.reduce((sum, entry) => {
      const carbs = Number(entry.nutrition.carbs) || 0;
      return sum + carbs;
    }, 0);
    
    const totalFat = entries.reduce((sum, entry) => {
      const fat = Number(entry.nutrition.fat) || 0;
      return sum + fat;
    }, 0);
    
    const totalFiber = entries.reduce((sum, entry) => {
      const fiber = Number(entry.nutrition.fiber) || 0;
      return sum + fiber;
    }, 0);
    
    const totalSugar = entries.reduce((sum, entry) => {
      const sugar = Number(entry.nutrition.sugar) || 0;
      return sum + sugar;
    }, 0);
    
    const totalSodium = entries.reduce((sum, entry) => {
      const sodium = Number(entry.nutrition.sodium) || 0;
      return sum + sodium;
    }, 0);
    
    console.log('Calculated totals:', {
      totalCalories,
      totalProtein,
      totalCarbs,
      totalFat,
      totalFiber,
      totalSugar,
      totalSodium
    });
    
    // Mock daily goals - these would come from user profile
    const goals: DailyNutritionGoals = {
      calories: 2000,
      protein: 150,
      carbs: 250,
      fat: 67,
      fiber: 25,
      water: 2.5
    };
    
    const summary = {
      date,
      totalCalories: Math.round(totalCalories),
      totalProtein: this.roundToDecimal(totalProtein),
      totalCarbs: this.roundToDecimal(totalCarbs),
      totalFat: this.roundToDecimal(totalFat),
      totalFiber: this.roundToDecimal(totalFiber),
      totalSugar: this.roundToDecimal(totalSugar),
      totalSodium: Math.round(totalSodium),
      mealCount: entries.length,
      entries,
      goals
    };
    
    console.log('Final daily summary:', summary);
    return summary;
  }

  private calculateWeeklyAnalytics(entries: NutritionEntry[], weekStart: string, weekEnd: string): WeeklyAnalytics {
    const totalCalories = entries.reduce((sum, entry) => sum + entry.nutrition.calories, 0);
    const totalProtein = entries.reduce((sum, entry) => sum + entry.nutrition.protein, 0);
    const totalCarbs = entries.reduce((sum, entry) => sum + entry.nutrition.carbs, 0);
    const totalFat = entries.reduce((sum, entry) => sum + entry.nutrition.fat, 0);
    
    const daysWithEntries = new Set(entries.map(entry => entry.date)).size;
    const averageCalories = daysWithEntries > 0 ? totalCalories / daysWithEntries : 0;
    
    // Generate daily summaries for the week
    const dailySummaries: DailyNutritionSummary[] = [];
    const startDate = new Date(weekStart);
    
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(currentDate.getDate() + i);
      const dateStr = currentDate.toISOString().split('T')[0];
      
      const dayEntries = entries.filter(entry => entry.date === dateStr);
      dailySummaries.push(this.calculateDailySummary(dayEntries, dateStr));
    }
    
    return {
      weekStart,
      weekEnd,
      averageCalories,
      averageProtein: daysWithEntries > 0 ? totalProtein / daysWithEntries : 0,
      averageCarbs: daysWithEntries > 0 ? totalCarbs / daysWithEntries : 0,
      averageFat: daysWithEntries > 0 ? totalFat / daysWithEntries : 0,
      totalMeals: entries.length,
      adherenceToGoals: Math.min(100, (averageCalories / 2000) * 100), // Mock calculation
      dailySummaries
    };
  }

  private calculateMonthlyAnalytics(entries: NutritionEntry[], month: string): MonthlyAnalytics {
    const totalCalories = entries.reduce((sum, entry) => sum + entry.nutrition.calories, 0);
    const daysInMonth = new Date(new Date(month).getFullYear(), new Date(month).getMonth() + 1, 0).getDate();
    const averageCaloriesPerDay = totalCalories / daysInMonth;
    
    // Calculate top foods
    const foodFrequency: { [key: string]: { frequency: number; calories: number } } = {};
    entries.forEach(entry => {
      if (!foodFrequency[entry.foodItem]) {
        foodFrequency[entry.foodItem] = { frequency: 0, calories: 0 };
      }
      foodFrequency[entry.foodItem].frequency++;
      foodFrequency[entry.foodItem].calories += entry.nutrition.calories;
    });
    
    const topFoods = Object.entries(foodFrequency)
      .map(([food, data]) => ({ food, ...data, totalCalories: data.calories }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 5);
    
    return {
      month,
      totalCalories,
      averageCaloriesPerDay,
      adherenceRate: Math.min(100, (averageCaloriesPerDay / 2000) * 100),
      topFoods,
      nutritionTrends: {
        calories: entries.map(entry => ({ date: entry.date, value: entry.nutrition.calories })),
        protein: entries.map(entry => ({ date: entry.date, value: entry.nutrition.protein })),
        carbs: entries.map(entry => ({ date: entry.date, value: entry.nutrition.carbs })),
        fat: entries.map(entry => ({ date: entry.date, value: entry.nutrition.fat }))
      },
      weeklySummaries: [] // Would calculate weekly summaries for the month
    };
  }

  private calculateProgressMetrics(entries: NutritionEntry[], healthMetrics: UserHealthMetrics[]): ProgressMetrics {
    const recentWeight = healthMetrics.slice(-1)[0]?.weight;
    const oldestWeight = healthMetrics[0]?.weight;
    
    // Calculate streak (consecutive days with entries)
    const uniqueDates = [...new Set(entries.map(e => e.date))].sort();
    let streakDays = 0;
    const today = new Date().toISOString().split('T')[0];
    
    // Count backwards from today to find consecutive days
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date();
      checkDate.setDate(checkDate.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      
      if (uniqueDates.includes(dateStr)) {
        streakDays++;
      } else {
        break;
      }
    }
    
    // Calculate real goal achievements based on actual entries
    const totalCalories = entries.reduce((sum, e) => sum + e.nutrition.calories, 0);
    const totalProtein = entries.reduce((sum, e) => sum + e.nutrition.protein, 0);
    const avgCaloriesPerDay = uniqueDates.length > 0 ? totalCalories / uniqueDates.length : 0;
    const avgProteinPerDay = uniqueDates.length > 0 ? totalProtein / uniqueDates.length : 0;
    
    const calorieGoalAchievement = Math.min(100, (avgCaloriesPerDay / 2000) * 100);
    const proteinGoalAchievement = Math.min(100, (avgProteinPerDay / 150) * 100);
    
    return {
      currentWeight: recentWeight,
      startWeight: oldestWeight,
      goalWeight: oldestWeight ? oldestWeight - 5 : undefined,
      weightProgress: recentWeight && oldestWeight ? ((oldestWeight - recentWeight) / 5) * 100 : 0,
      calorieGoalAchievement,
      proteinGoalAchievement,
      streakDays,
      totalEntriesLogged: entries.length,
      averageMealsPerDay: uniqueDates.length > 0 ? entries.length / uniqueDates.length : 0
    };
  }

  private analyzeEatingPatterns(entries: NutritionEntry[]): EatingPattern[] {
    const patterns: EatingPattern[] = [];
    
    // Analyze meal timing pattern
    const mealTimes = entries.filter(e => e.mealTime).map(e => parseInt(e.mealTime!.split(':')[0]));
    const avgBreakfastTime = mealTimes.filter(h => h <= 11).reduce((sum, h) => sum + h, 0) / mealTimes.filter(h => h <= 11).length;
    
    if (avgBreakfastTime > 9) {
      patterns.push({
        id: 'late_breakfast',
        type: 'meal_timing',
        title: 'Late Breakfast Pattern',
        description: 'You tend to eat breakfast later in the day',
        frequency: 0.7,
        trend: 'stable',
        suggestion: 'Consider eating breakfast earlier to boost metabolism',
        impact: 'neutral'
      });
    }
    
    // Analyze nutrition balance
    const avgProteinRatio = entries.reduce((sum, e) => sum + (e.nutrition.protein * 4), 0) / entries.reduce((sum, e) => sum + e.nutrition.calories, 0);
    
    if (avgProteinRatio < 0.2) {
      patterns.push({
        id: 'low_protein',
        type: 'nutrition_balance',
        title: 'Low Protein Intake',
        description: 'Your protein intake is below recommended levels',
        frequency: 0.8,
        trend: 'stable',
        suggestion: 'Add lean proteins like chicken, fish, or legumes to your meals',
        impact: 'negative'
      });
    }
    
    return patterns;
  }

  private generateInsights(entries: NutritionEntry[]): AnalyticsInsight[] {
    const insights: AnalyticsInsight[] = [];
    
    // Achievement insights
    if (entries.length >= 7) {
      insights.push({
        id: 'week_streak',
        type: 'achievement',
        title: '🎉 7-Day Tracking Streak!',
        description: 'Great job maintaining your nutrition tracking for a full week!',
        actionable: false,
        priority: 'low',
        createdAt: new Date().toISOString()
      });
    }
    
    // Suggestion insights
    const avgCalories = entries.reduce((sum, e) => sum + e.nutrition.calories, 0) / entries.length;
    if (avgCalories < 1500) {
      insights.push({
        id: 'low_calories',
        type: 'suggestion',
        title: 'Consider Increasing Caloric Intake',
        description: 'Your average daily calories seem low. This might affect your energy levels.',
        actionable: true,
        actionText: 'Review meal planning',
        priority: 'medium',
        icon: 'AlertCircle',
        createdAt: new Date().toISOString()
      });
    }
    
    return insights;
  }

  private generateChartData() {
    const entries = this.getStoredEntries();
    
    // Macro distribution for pie chart
    const totalProtein = this.roundToDecimal(entries.reduce((sum, e) => sum + e.nutrition.protein, 0) * 4, 0);
    const totalCarbs = this.roundToDecimal(entries.reduce((sum, e) => sum + e.nutrition.carbs, 0) * 4, 0);
    const totalFat = this.roundToDecimal(entries.reduce((sum, e) => sum + e.nutrition.fat, 0) * 9, 0);
    const totalCalories = totalProtein + totalCarbs + totalFat;
    
    // If no data, return empty chart
    if (totalCalories === 0) {
      return {
        macroDistribution: [],
        weeklyTrend: [],
        goalProgress: []
      };
    }
    
    const macroDistribution: PieChartData[] = [
      {
        name: 'Protein',
        value: totalProtein,
        color: '#10B981',
        percentage: Math.round((totalProtein / totalCalories) * 100)
      },
      {
        name: 'Carbs',
        value: totalCarbs,
        color: '#F59E0B',
        percentage: Math.round((totalCarbs / totalCalories) * 100)
      },
      {
        name: 'Fat',
        value: totalFat,
        color: '#EF4444',
        percentage: Math.round((totalFat / totalCalories) * 100)
      }
    ];
    
    // Weekly trend for line chart
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });
    
    const weeklyTrend: LineChartData[] = last7Days.map(date => {
      const dayEntries = entries.filter(e => e.date === date);
      const calories = Math.round(dayEntries.reduce((sum, e) => sum + e.nutrition.calories, 0));
      
      return {
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        calories,
        protein: this.roundToDecimal(dayEntries.reduce((sum, e) => sum + e.nutrition.protein, 0)),
        carbs: this.roundToDecimal(dayEntries.reduce((sum, e) => sum + e.nutrition.carbs, 0))
      };
    });
    
    // Goal progress for bar chart - use actual data from today or zeros
    const today = new Date().toISOString().split('T')[0];
    const todayEntries = entries.filter(e => e.date === today);
    const todayCalories = Math.round(todayEntries.reduce((sum, e) => sum + e.nutrition.calories, 0));
    const todayProtein = this.roundToDecimal(todayEntries.reduce((sum, e) => sum + e.nutrition.protein, 0));
    const todayCarbs = this.roundToDecimal(todayEntries.reduce((sum, e) => sum + e.nutrition.carbs, 0));
    const todayFat = this.roundToDecimal(todayEntries.reduce((sum, e) => sum + e.nutrition.fat, 0));
    
    const goalProgress: BarChartData[] = [
      { label: 'Calories', value: todayCalories, goal: 2000, color: '#3B82F6' },
      { label: 'Protein', value: todayProtein, goal: 150, color: '#10B981' },
      { label: 'Carbs', value: todayCarbs, goal: 250, color: '#F59E0B' },
      { label: 'Fat', value: todayFat, goal: 67, color: '#EF4444' }
    ];
    
    return {
      macroDistribution,
      weeklyTrend,
      goalProgress
    };
  }

  private generateMockData(): NutritionEntry[] {
    // Generate some mock data for testing
    const mockEntries: NutritionEntry[] = [];
    const foods = [
      { name: 'Grilled Chicken Breast', calories: 165, protein: 31, carbs: 0, fat: 4 },
      { name: 'Brown Rice', calories: 112, protein: 3, carbs: 23, fat: 1 },
      { name: 'Greek Yogurt', calories: 100, protein: 17, carbs: 6, fat: 0 },
      { name: 'Avocado Toast', calories: 280, protein: 8, carbs: 30, fat: 16 },
      { name: 'Salmon Fillet', calories: 206, protein: 28, carbs: 0, fat: 12 }
    ];
    
    for (let i = 0; i < 10; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const food = foods[Math.floor(Math.random() * foods.length)];
      
      mockEntries.push({
        id: `mock_${i}`,
        userId: 'user1',
        date: date.toISOString().split('T')[0],
        mealType: ['breakfast', 'lunch', 'dinner', 'snack'][Math.floor(Math.random() * 4)] as any,
        foodItem: food.name,
        quantity: 1,
        unit: 'serving',
        nutrition: {
          calories: food.calories,
          protein: food.protein,
          carbs: food.carbs,
          fat: food.fat,
          fiber: Math.random() * 5,
          sugar: Math.random() * 10,
          sodium: Math.random() * 300,
          calcium: Math.random() * 100,
          iron: Math.random() * 5,
          vitaminC: Math.random() * 20
        },
        mealTime: `${7 + Math.floor(Math.random() * 12)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
        createdAt: new Date().toISOString()
      });
    }
    
    return mockEntries;
  }
}

export const analyticsService = new AnalyticsService();