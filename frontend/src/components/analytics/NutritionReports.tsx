import React, { useState, useEffect } from 'react';
import { 
  Calendar, Download, Filter, FileText, 
  TrendingUp, PieChart, BarChart3, 
  ArrowLeft, ArrowRight, Eye, Mail
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  DailyNutritionSummary, 
  WeeklyAnalytics, 
  MonthlyAnalytics,
  NutritionEntry 
} from '@/types/Analytics';
import { analyticsService } from '@/services/analyticsService';

interface NutritionReportsProps {
  className?: string;
}

type ReportPeriod = 'daily' | 'weekly' | 'monthly';

export const NutritionReports: React.FC<NutritionReportsProps> = ({ className = '' }) => {
  const { toast } = useToast();
  const [selectedPeriod, setSelectedPeriod] = useState<ReportPeriod>('daily');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Report data
  const [dailyReport, setDailyReport] = useState<DailyNutritionSummary | null>(null);
  const [weeklyReport, setWeeklyReport] = useState<WeeklyAnalytics | null>(null);
  const [monthlyReport, setMonthlyReport] = useState<MonthlyAnalytics | null>(null);

  useEffect(() => {
    loadReportData();
  }, [selectedPeriod, selectedDate]);

  const loadReportData = async () => {
    try {
      setIsLoading(true);

      switch (selectedPeriod) {
        case 'daily':
          const dailyResult = await analyticsService.getDailySummary(selectedDate);
          if (dailyResult.success) {
            setDailyReport(dailyResult.summary || null);
          }
          break;

        case 'weekly':
          const weekStart = getWeekStartDate(selectedDate);
          const weeklyResult = await analyticsService.getWeeklyAnalytics(weekStart);
          if (weeklyResult.success) {
            setWeeklyReport(weeklyResult.analytics || null);
          }
          break;

        case 'monthly':
          const monthKey = selectedDate.substring(0, 7); // YYYY-MM
          const monthlyResult = await analyticsService.getMonthlyAnalytics(monthKey);
          if (monthlyResult.success) {
            setMonthlyReport(monthlyResult.analytics || null);
          }
          break;
      }
    } catch (error) {
      console.error('Report loading error:', error);
      toast({
        title: "Loading Error",
        description: "Failed to load report data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getWeekStartDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const day = date.getDay();
    const diff = date.getDate() - day;
    const weekStart = new Date(date.setDate(diff));
    return weekStart.toISOString().split('T')[0];
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const current = new Date(selectedDate);
    
    switch (selectedPeriod) {
      case 'daily':
        current.setDate(current.getDate() + (direction === 'next' ? 1 : -1));
        break;
      case 'weekly':
        current.setDate(current.getDate() + (direction === 'next' ? 7 : -7));
        break;
      case 'monthly':
        current.setMonth(current.getMonth() + (direction === 'next' ? 1 : -1));
        break;
    }
    
    setSelectedDate(current.toISOString().split('T')[0]);
  };

  const formatDateRange = (period: ReportPeriod, date: string) => {
    const d = new Date(date);
    
    switch (period) {
      case 'daily':
        return d.toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
      case 'weekly':
        const weekStart = new Date(getWeekStartDate(date));
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        return `${weekStart.toLocaleDateString()} - ${weekEnd.toLocaleDateString()}`;
      case 'monthly':
        return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
      default:
        return date;
    }
  };

  const exportReport = async () => {
    toast({
      title: "Report Export",
      description: "Feature coming soon! You'll be able to export reports as PDF or CSV.",
    });
  };

  const getMealTypeEmoji = (mealType: string) => {
    switch (mealType) {
      case 'breakfast': return '🌅';
      case 'lunch': return '☀️';
      case 'dinner': return '🌙';
      case 'snack': return '🍎';
      case 'drink': return '🥤';
      default: return '🍽️';
    }
  };

  const renderDailyReport = () => {
    if (!dailyReport) {
      return (
        <div className="text-center py-8">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No nutrition data for this day.</p>
          <p className="text-sm text-gray-400 mt-1">Start logging meals to generate reports!</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Daily Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-secondary-dark">Calories</p>
              <p className="text-2xl font-bold text-primary">{dailyReport.totalCalories}</p>
              <p className="text-xs text-secondary-dark">
                Goal: {dailyReport.goals?.calories || 2000}
              </p>
              <Progress 
                value={(dailyReport.totalCalories / (dailyReport.goals?.calories || 2000)) * 100} 
                className="mt-2 h-2" 
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-secondary-dark">Protein</p>
              <p className="text-2xl font-bold text-success">{dailyReport.totalProtein}g</p>
              <p className="text-xs text-secondary-dark">
                Goal: {dailyReport.goals?.protein || 150}g
              </p>
              <Progress 
                value={(dailyReport.totalProtein / (dailyReport.goals?.protein || 150)) * 100} 
                className="mt-2 h-2" 
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-secondary-dark">Carbs</p>
              <p className="text-2xl font-bold text-warning">{dailyReport.totalCarbs}g</p>
              <p className="text-xs text-secondary-dark">
                Goal: {dailyReport.goals?.carbs || 250}g
              </p>
              <Progress 
                value={(dailyReport.totalCarbs / (dailyReport.goals?.carbs || 250)) * 100} 
                className="mt-2 h-2" 
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-secondary-dark">Fat</p>
              <p className="text-2xl font-bold text-error">{dailyReport.totalFat}g</p>
              <p className="text-xs text-secondary-dark">
                Goal: {dailyReport.goals?.fat || 67}g
              </p>
              <Progress 
                value={(dailyReport.totalFat / (dailyReport.goals?.fat || 67)) * 100} 
                className="mt-2 h-2" 
              />
            </CardContent>
          </Card>
        </div>

        {/* Meal Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Meal Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {dailyReport.entries.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No meals logged for this day.</p>
            ) : (
              <div className="space-y-3">
                {dailyReport.entries
                  .sort((a, b) => (a.mealTime || '00:00').localeCompare(b.mealTime || '00:00'))
                  .map((entry, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{getMealTypeEmoji(entry.mealType)}</span>
                        <div>
                          <p className="font-medium">{entry.foodItem}</p>
                          <p className="text-sm text-secondary-dark">
                            {entry.quantity} {entry.unit} • {entry.mealTime}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{entry.nutrition.calories} cal</p>
                        <p className="text-xs text-secondary-dark">
                          P: {entry.nutrition.protein}g • C: {entry.nutrition.carbs}g • F: {entry.nutrition.fat}g
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Additional Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Micronutrients</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Fiber</span>
                <span>{dailyReport.totalFiber.toFixed(1)}g</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Sugar</span>
                <span>{dailyReport.totalSugar.toFixed(1)}g</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Sodium</span>
                <span>{dailyReport.totalSodium.toFixed(0)}mg</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Daily Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Total Meals</span>
                <span>{dailyReport.mealCount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Avg Calories/Meal</span>
                <span>{dailyReport.mealCount > 0 ? Math.round(dailyReport.totalCalories / dailyReport.mealCount) : 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Goal Achievement</span>
                <span>{Math.round((dailyReport.totalCalories / (dailyReport.goals?.calories || 2000)) * 100)}%</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const renderWeeklyReport = () => {
    if (!weeklyReport) {
      return (
        <div className="text-center py-8">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No weekly data available.</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Weekly Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-secondary-dark">Avg Calories/Day</p>
              <p className="text-2xl font-bold text-primary">{Math.round(weeklyReport.averageCalories)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-secondary-dark">Avg Protein/Day</p>
              <p className="text-2xl font-bold text-success">{Math.round(weeklyReport.averageProtein)}g</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-secondary-dark">Total Meals</p>
              <p className="text-2xl font-bold text-info">{weeklyReport.totalMeals}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-secondary-dark">Goal Adherence</p>
              <p className="text-2xl font-bold text-warning">{Math.round(weeklyReport.adherenceToGoals)}%</p>
            </CardContent>
          </Card>
        </div>

        {/* Daily Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {weeklyReport.dailySummaries.map((day, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">
                      {new Date(day.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                    </p>
                    <p className="text-sm text-secondary-dark">{day.mealCount} meals</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{day.totalCalories} cal</p>
                    <p className="text-xs text-secondary-dark">
                      P: {day.totalProtein}g • C: {day.totalCarbs}g • F: {day.totalFat}g
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderMonthlyReport = () => {
    if (!monthlyReport) {
      return (
        <div className="text-center py-8">
          <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No monthly data available.</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Monthly Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-secondary-dark">Total Calories</p>
              <p className="text-2xl font-bold text-primary">{monthlyReport.totalCalories.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-secondary-dark">Daily Average</p>
              <p className="text-2xl font-bold text-success">{Math.round(monthlyReport.averageCaloriesPerDay)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-secondary-dark">Adherence Rate</p>
              <p className="text-2xl font-bold text-warning">{Math.round(monthlyReport.adherenceRate)}%</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-secondary-dark">Weight Change</p>
              <p className="text-2xl font-bold text-info">
                {monthlyReport.weightChange ? `${monthlyReport.weightChange > 0 ? '+' : ''}${monthlyReport.weightChange}kg` : 'N/A'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Top Foods */}
        <Card>
          <CardHeader>
            <CardTitle>Most Consumed Foods</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {monthlyReport.topFoods.slice(0, 5).map((food, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{index + 1}</Badge>
                    <span className="font-medium">{food.food}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{food.frequency} times</p>
                    <p className="text-xs text-secondary-dark">{food.totalCalories} total cal</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-primary-dark">Nutrition Reports</h2>
          <p className="text-secondary-dark">Detailed nutrition analysis and insights</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={exportReport}>
            <Download className="w-4 h-4 mr-1" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Mail className="w-4 h-4 mr-1" />
            Email Report
          </Button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-3">
          <Select value={selectedPeriod} onValueChange={(value: ReportPeriod) => setSelectedPeriod(value)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Daily
                </div>
              </SelectItem>
              <SelectItem value="weekly">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Weekly
                </div>
              </SelectItem>
              <SelectItem value="monthly">
                <div className="flex items-center gap-2">
                  <PieChart className="h-4 w-4" />
                  Monthly
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          
          <div className="text-sm font-medium">
            {formatDateRange(selectedPeriod, selectedDate)}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigateDate('prev')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigateDate('next')}>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Report Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)} Report
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedPeriod === 'daily' && renderDailyReport()}
          {selectedPeriod === 'weekly' && renderWeeklyReport()}
          {selectedPeriod === 'monthly' && renderMonthlyReport()}
        </CardContent>
      </Card>
    </div>
  );
};