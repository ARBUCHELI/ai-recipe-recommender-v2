import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, Area, AreaChart
} from 'recharts';
import { 
  Activity, TrendingUp, Target, Calendar, 
  Plus, Filter, Download, RefreshCw, Award,
  AlertTriangle, CheckCircle, Info, Zap, Trash2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { AnalyticsDashboardData, AnalyticsFilters } from '@/types/Analytics';
import { analyticsService } from '@/services/analyticsService';
import { NutritionEntryModal } from './NutritionEntryModal';

interface AnalyticsDashboardProps {
  className?: string;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ className = '' }) => {
  const { toast } = useToast();
  const [dashboardData, setDashboardData] = useState<AnalyticsDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, [selectedPeriod]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      console.log('Loading dashboard data...');
      
      // Clear any cached data first
      setDashboardData(null);
      
      const result = await analyticsService.getDashboardData();
      console.log('Dashboard data result:', result);
      
      if (result.success && result.data) {
        setDashboardData(result.data);
        console.log('Dashboard data set:', result.data);
      } else {
        throw new Error(result.error || 'Failed to load dashboard data');
      }
    } catch (error) {
      console.error('Dashboard loading error:', error);
      toast({
        title: "Loading Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
    toast({
      title: "Dashboard Refreshed",
      description: "Your analytics data has been updated"
    });
  };

  const handleResetData = async () => {
    if (!confirm('Are you sure you want to reset ALL analytics data? This action cannot be undone.')) {
      return;
    }
    
    setRefreshing(true);
    try {
      const result = await analyticsService.clearAllData();
      if (result.success) {
        // Force reload the dashboard data
        await loadDashboardData();
        toast({
          title: "Data Reset Complete",
          description: "All analytics data has been cleared. You can start fresh now!"
        });
      } else {
        throw new Error(result.error || 'Failed to reset data');
      }
    } catch (error) {
      toast({
        title: "Reset Failed",
        description: "Failed to reset analytics data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setRefreshing(false);
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'achievement': return <Award className="h-4 w-4 text-success" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'suggestion': return <Info className="h-4 w-4 text-info" />;
      default: return <CheckCircle className="h-4 w-4 text-primary" />;
    }
  };

  const getInsightBgColor = (type: string) => {
    switch (type) {
      case 'achievement': return 'bg-success/10 border-success/20';
      case 'warning': return 'bg-warning/10 border-warning/20';
      case 'suggestion': return 'bg-info/10 border-info/20';
      default: return 'bg-primary/10 border-primary/20';
    }
  };

  if (isLoading) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse h-64">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-48 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className={`p-6 ${className} flex flex-col items-center justify-center min-h-[400px]`}>
        <div className="text-center">
          <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Analytics Data</h3>
          <p className="text-gray-500 mb-4">Start logging your meals to see your nutrition analytics.</p>
          <Button onClick={() => setShowEntryModal(true)} className="btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            Add First Entry
          </Button>
        </div>
      </div>
    );
  }

  const { summary, progress, insights, patterns, charts } = dashboardData;

  return (
    <div className={`p-6 space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-primary-dark">Nutrition Analytics</h2>
          <p className="text-secondary-dark">Track your nutrition journey with detailed insights</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedPeriod} onValueChange={(value: any) => setSelectedPeriod(value)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`w-4 h-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleResetData} disabled={refreshing}>
            <Trash2 className="w-4 h-4 mr-1 text-red-500" />
            Reset Data
          </Button>
          <Button onClick={() => setShowEntryModal(true)} className="btn-primary">
            <Plus className="w-4 h-4 mr-1" />
            Add Entry
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Today's Calories</p>
                <p className="text-2xl font-bold text-blue-900">
                  {summary.totalCalories}
                  <span className="text-sm font-normal text-blue-600">
                    /{summary.goals?.calories || 2000}
                  </span>
                </p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
            <Progress 
              value={(summary.totalCalories / (summary.goals?.calories || 2000)) * 100} 
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Protein</p>
                <p className="text-2xl font-bold text-green-900">
                  {summary.totalProtein}g
                  <span className="text-sm font-normal text-green-600">
                    /{summary.goals?.protein || 150}g
                  </span>
                </p>
              </div>
              <Zap className="h-8 w-8 text-green-600" />
            </div>
            <Progress 
              value={(summary.totalProtein / (summary.goals?.protein || 150)) * 100} 
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Streak Days</p>
                <p className="text-2xl font-bold text-orange-900">{progress.streakDays}</p>
              </div>
              <Target className="h-8 w-8 text-orange-600" />
            </div>
            <div className="mt-2">
              <Badge variant="secondary" className="text-orange-700 bg-orange-200">
                Keep it up! 🔥
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Total Entries</p>
                <p className="text-2xl font-bold text-purple-900">{progress.totalEntriesLogged}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
            <p className="text-xs text-purple-600 mt-2">
              Avg {progress.averageMealsPerDay.toFixed(1)} meals/day
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <Tabs defaultValue="trends" className="space-y-6">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Daily/Weekly Nutrition Trend */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-success" />
                  {selectedPeriod === 'daily' ? 'Last 7 Days' : 'Weekly'} Nutrition Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={charts.weeklyTrend}>
                    <defs>
                      <linearGradient id="caloriesGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px'
                      }} 
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="calories"
                      stroke="#3B82F6"
                      fillOpacity={1}
                      fill="url(#caloriesGradient)"
                      name="Calories"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="protein" 
                      stroke="#10B981" 
                      strokeWidth={2}
                      name="Protein (g)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Macro Distribution Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-warning" />
                  Macronutrient Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={charts.macroDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {charts.macroDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value, name) => [`${value} cal (${charts.macroDistribution.find(d => d.name === name)?.percentage}%)`, name]}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Nutrition Balance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-info" />
                  Nutrition Balance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {charts.macroDistribution.map((macro, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{macro.name}</span>
                      <span className="text-secondary-dark">{macro.percentage}%</span>
                    </div>
                    <Progress value={macro.percentage} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="goals" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Goal Progress Bar Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-success" />
                  Daily Goal Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={charts.goalProgress}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="goal" fill="#E5E7EB" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Progress Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-warning" />
                  Achievement Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-success/10 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-success-dark">Calorie Goal Achievement</p>
                    <p className="text-xs text-success">Last 7 days average</p>
                  </div>
                  <div className="text-lg font-bold text-success">{progress.calorieGoalAchievement}%</div>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-info/10 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-info-dark">Protein Goal Achievement</p>
                    <p className="text-xs text-info">Last 7 days average</p>
                  </div>
                  <div className="text-lg font-bold text-info">{progress.proteinGoalAchievement}%</div>
                </div>

                {progress.currentWeight && (
                  <div className="flex justify-between items-center p-3 bg-warning/10 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-warning-dark">Weight Progress</p>
                      <p className="text-xs text-warning">Current: {progress.currentWeight}kg</p>
                    </div>
                    <div className="text-lg font-bold text-warning">{progress.weightProgress.toFixed(1)}%</div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Insights & Patterns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-warning" />
              AI Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {insights.length === 0 ? (
              <p className="text-sm text-secondary-dark">No insights available yet. Keep logging meals!</p>
            ) : (
              insights.slice(0, 3).map((insight, index) => (
                <div 
                  key={index} 
                  className={`p-3 rounded-lg border ${getInsightBgColor(insight.type)}`}
                >
                  <div className="flex items-start gap-3">
                    {getInsightIcon(insight.type)}
                    <div className="flex-1">
                      <h4 className="text-sm font-medium">{insight.title}</h4>
                      <p className="text-xs text-secondary-dark mt-1">{insight.description}</p>
                      {insight.actionable && insight.actionText && (
                        <Button variant="ghost" size="sm" className="mt-2 h-6 text-xs">
                          {insight.actionText}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Eating Patterns */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-info" />
              Eating Patterns
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {patterns.length === 0 ? (
              <p className="text-sm text-secondary-dark">Analyzing your eating patterns...</p>
            ) : (
              patterns.slice(0, 3).map((pattern, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg border">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium">{pattern.title}</h4>
                      <p className="text-xs text-secondary-dark mt-1">{pattern.description}</p>
                      <p className="text-xs text-info mt-2">{pattern.suggestion}</p>
                    </div>
                    <Badge 
                      variant={pattern.impact === 'positive' ? 'default' : pattern.impact === 'negative' ? 'destructive' : 'secondary'}
                      className="text-xs"
                    >
                      {pattern.trend}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Nutrition Entry Modal */}
      <NutritionEntryModal
        isOpen={showEntryModal}
        onClose={() => setShowEntryModal(false)}
        onEntryAdded={async (entry) => {
          console.log('Entry added, refreshing dashboard...', entry);
          await loadDashboardData();
          setShowEntryModal(false);
        }}
      />
    </div>
  );
};