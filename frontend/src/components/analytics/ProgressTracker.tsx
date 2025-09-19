import React, { useState, useEffect } from 'react';
import { Award, Target, TrendingUp, Calendar, Star, Flame, CheckCircle2, Trophy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ProgressMetrics, NutritionGoalProgress } from '@/types/Analytics';
import { analyticsService } from '@/services/analyticsService';

interface ProgressTrackerProps {
  className?: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  earned: boolean;
  earnedDate?: string;
  progress: number;
  target: number;
  category: 'streak' | 'nutrition' | 'consistency' | 'milestone';
}

const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_entry',
    title: 'Getting Started',
    description: 'Log your first nutrition entry',
    icon: <Star className="h-6 w-6" />,
    earned: false,
    progress: 0,
    target: 1,
    category: 'milestone'
  },
  {
    id: 'week_streak',
    title: 'Week Warrior',
    description: 'Maintain a 7-day logging streak',
    icon: <Flame className="h-6 w-6" />,
    earned: false,
    progress: 0,
    target: 7,
    category: 'streak'
  },
  {
    id: 'month_streak',
    title: 'Monthly Master',
    description: 'Maintain a 30-day logging streak',
    icon: <Trophy className="h-6 w-6" />,
    earned: false,
    progress: 0,
    target: 30,
    category: 'streak'
  },
  {
    id: 'protein_goal_week',
    title: 'Protein Pro',
    description: 'Meet protein goals for 7 consecutive days',
    icon: <CheckCircle2 className="h-6 w-6" />,
    earned: false,
    progress: 0,
    target: 7,
    category: 'nutrition'
  },
  {
    id: 'consistent_logger',
    title: 'Consistency Champion',
    description: 'Log meals for 20 out of 30 days',
    icon: <Calendar className="h-6 w-6" />,
    earned: false,
    progress: 0,
    target: 20,
    category: 'consistency'
  },
  {
    id: 'hundred_entries',
    title: 'Century Club',
    description: 'Log 100 nutrition entries',
    icon: <Award className="h-6 w-6" />,
    earned: false,
    progress: 0,
    target: 100,
    category: 'milestone'
  }
];

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({ className = '' }) => {
  const [progressData, setProgressData] = useState<ProgressMetrics | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>(ACHIEVEMENTS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProgressData();
  }, []);

  const loadProgressData = async () => {
    try {
      setIsLoading(true);
      const result = await analyticsService.getProgressMetrics();
      
      if (result.success && result.progress) {
        setProgressData(result.progress);
        updateAchievements(result.progress);
      }
    } catch (error) {
      console.error('Progress loading error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateAchievements = (progress: ProgressMetrics) => {
    setAchievements(prevAchievements => 
      prevAchievements.map(achievement => {
        let newProgress = 0;
        let earned = false;

        switch (achievement.id) {
          case 'first_entry':
            newProgress = progress.totalEntriesLogged > 0 ? 1 : 0;
            earned = progress.totalEntriesLogged >= 1;
            break;
          case 'week_streak':
            newProgress = Math.min(progress.streakDays, 7);
            earned = progress.streakDays >= 7;
            break;
          case 'month_streak':
            newProgress = Math.min(progress.streakDays, 30);
            earned = progress.streakDays >= 30;
            break;
          case 'protein_goal_week':
            newProgress = progress.streakDays; // Count consecutive days, not percentage
            earned = progress.streakDays >= 7 && progress.proteinGoalAchievement >= 80;
            break;
          case 'consistent_logger':
            const uniqueDays = Math.min(progress.totalEntriesLogged, 30); // Max 30 days
            newProgress = uniqueDays;
            earned = uniqueDays >= 20;
            break;
          case 'hundred_entries':
            newProgress = Math.min(progress.totalEntriesLogged, 100);
            earned = progress.totalEntriesLogged >= 100;
            break;
        }

        return {
          ...achievement,
          progress: newProgress,
          earned: earned || achievement.earned,
          earnedDate: earned && !achievement.earned ? new Date().toISOString() : achievement.earnedDate
        };
      })
    );
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'streak': return 'text-orange-600 bg-orange-100';
      case 'nutrition': return 'text-green-600 bg-green-100';
      case 'consistency': return 'text-blue-600 bg-blue-100';
      case 'milestone': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (isLoading) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!progressData) {
    return (
      <div className={`p-6 ${className} flex flex-col items-center justify-center min-h-[400px]`}>
        <Target className="h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Progress Data</h3>
        <p className="text-gray-500">Start logging meals to track your progress!</p>
      </div>
    );
  }

  const earnedAchievements = achievements.filter(a => a.earned);
  const pendingAchievements = achievements.filter(a => !a.earned);

  const goalProgressData: NutritionGoalProgress[] = [
    {
      nutrient: 'Calories',
      current: Math.round(progressData.calorieGoalAchievement),
      goal: 100,
      percentage: progressData.calorieGoalAchievement,
      status: progressData.calorieGoalAchievement >= 95 ? 'met' : progressData.calorieGoalAchievement >= 80 ? 'under' : 'under',
      trend: 'stable'
    },
    {
      nutrient: 'Protein',
      current: Math.round(progressData.proteinGoalAchievement),
      goal: 100,
      percentage: progressData.proteinGoalAchievement,
      status: progressData.proteinGoalAchievement >= 95 ? 'met' : progressData.proteinGoalAchievement >= 80 ? 'under' : 'under',
      trend: 'up'
    }
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Current Streak</p>
                <p className="text-3xl font-bold text-orange-900">{progressData.streakDays}</p>
                <p className="text-xs text-orange-600">days</p>
              </div>
              <Flame className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Goal Achievement</p>
                <p className="text-3xl font-bold text-green-900">{Math.round(progressData.calorieGoalAchievement)}%</p>
                <p className="text-xs text-green-600">average</p>
              </div>
              <Target className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Entries</p>
                <p className="text-3xl font-bold text-blue-900">{progressData.totalEntriesLogged}</p>
                <p className="text-xs text-blue-600">logged</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Achievements</p>
                <p className="text-3xl font-bold text-purple-900">{earnedAchievements.length}</p>
                <p className="text-xs text-purple-600">earned</p>
              </div>
              <Award className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Goal Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-success" />
            Goal Progress Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {goalProgressData.map((goal, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{goal.nutrient}</span>
                  <Badge 
                    variant={goal.status === 'met' ? 'default' : 'secondary'}
                    className={`text-xs ${
                      goal.status === 'met' ? 'bg-green-100 text-green-800' : 
                      goal.status === 'over' ? 'bg-red-100 text-red-800' : 
                      'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {goal.status === 'met' ? 'Met' : goal.status === 'over' ? 'Over' : 'Under'}
                  </Badge>
                </div>
                <span className="text-sm font-medium">{goal.current}% / {goal.goal}%</span>
              </div>
              <Progress value={goal.percentage} className="h-3" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Weight Progress (if available) */}
      {progressData.currentWeight && progressData.startWeight && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-info" />
              Weight Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="text-sm text-secondary-dark">Starting Weight</p>
                <p className="font-medium">{progressData.startWeight}kg</p>
              </div>
              <div>
                <p className="text-sm text-secondary-dark">Current Weight</p>
                <p className="font-medium">{progressData.currentWeight}kg</p>
              </div>
              <div>
                <p className="text-sm text-secondary-dark">Goal Weight</p>
                <p className="font-medium">{progressData.goalWeight || 'Not set'}kg</p>
              </div>
            </div>
            {progressData.goalWeight && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress to Goal</span>
                  <span>{progressData.weightProgress.toFixed(1)}%</span>
                </div>
                <Progress value={Math.abs(progressData.weightProgress)} className="h-2" />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Achievements Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Earned Achievements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-warning" />
              Earned Achievements ({earnedAchievements.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {earnedAchievements.length === 0 ? (
              <p className="text-sm text-secondary-dark text-center py-4">
                No achievements earned yet. Keep logging to unlock them! 🏆
              </p>
            ) : (
              earnedAchievements.map((achievement) => (
                <div 
                  key={achievement.id} 
                  className="flex items-center gap-3 p-3 bg-success/10 border border-success/20 rounded-lg"
                >
                  <div className="text-success">
                    {achievement.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-success-dark">{achievement.title}</h4>
                    <p className="text-xs text-success">{achievement.description}</p>
                    {achievement.earnedDate && (
                      <p className="text-xs text-success/80 mt-1">
                        Earned {new Date(achievement.earnedDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <Badge variant="secondary" className={getCategoryColor(achievement.category)}>
                    {achievement.category}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Progress Toward Achievements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-info" />
              Next Achievements ({pendingAchievements.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingAchievements.map((achievement) => (
              <div key={achievement.id} className="p-3 border border-gray-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="text-gray-400">
                    {achievement.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium">{achievement.title}</h4>
                      <Badge variant="outline" className={getCategoryColor(achievement.category)}>
                        {achievement.category}
                      </Badge>
                    </div>
                    <p className="text-xs text-secondary-dark mb-2">{achievement.description}</p>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Progress</span>
                        <span>{achievement.progress} / {achievement.target}</span>
                      </div>
                      <Progress 
                        value={(achievement.progress / achievement.target) * 100} 
                        className="h-2"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};