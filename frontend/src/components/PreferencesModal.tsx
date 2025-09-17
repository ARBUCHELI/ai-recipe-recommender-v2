import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Heart, 
  Utensils, 
  Clock, 
  Bell, 
  Globe, 
  Shield,
  Save,
  ChefHat,
  Leaf,
  Users,
  Timer
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/services/authService';

interface PreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UserPreferences {
  // Dietary Restrictions
  dietaryRestrictions: string[];
  allergies: string[];
  
  // Cuisine Preferences
  favoriteCuisines: string[];
  dislikedCuisines: string[];
  
  // Cooking Settings
  cookingSkillLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  preferredMealTypes: string[];
  maxCookingTime: number;
  servingSize: number;
  
  // Notifications
  emailNotifications: boolean;
  pushNotifications: boolean;
  weeklyRecipeEmails: boolean;
  recipeRecommendations: boolean;
  
  // Display Settings
  units: 'metric' | 'imperial';
  language: 'en' | 'es' | 'fr';
  theme: 'light' | 'dark' | 'system';
}

const defaultPreferences: UserPreferences = {
  dietaryRestrictions: [],
  allergies: [],
  favoriteCuisines: [],
  dislikedCuisines: [],
  cookingSkillLevel: 'intermediate',
  preferredMealTypes: [],
  maxCookingTime: 45,
  servingSize: 4,
  emailNotifications: true,
  pushNotifications: true,
  weeklyRecipeEmails: true,
  recipeRecommendations: true,
  units: 'metric',
  language: 'en',
  theme: 'system',
};

const dietaryOptions = [
  'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Keto', 'Paleo',
  'Low-Carb', 'High-Protein', 'Mediterranean', 'Pescatarian'
];

const allergyOptions = [
  'Nuts', 'Peanuts', 'Shellfish', 'Fish', 'Eggs', 'Milk', 'Soy', 'Wheat', 'Sesame'
];

const cuisineOptions = [
  'Italian', 'Mexican', 'Chinese', 'Japanese', 'Indian', 'Thai', 'French',
  'Mediterranean', 'American', 'Greek', 'Korean', 'Vietnamese', 'Spanish'
];

const mealTypeOptions = [
  'Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert', 'Appetizer', 'Side Dish'
];

export const PreferencesModal: React.FC<PreferencesModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Load user preferences on mount
  useEffect(() => {
    if (isOpen) {
      const loadPreferences = async () => {
        try {
          const response = await authService.getPreferences();
          if (response.success && response.preferences) {
            setPreferences({ ...defaultPreferences, ...response.preferences });
          } else {
            // Fallback to localStorage
            const savedPreferences = localStorage.getItem('userPreferences');
            if (savedPreferences) {
              setPreferences({ ...defaultPreferences, ...JSON.parse(savedPreferences) });
            }
          }
        } catch (error) {
          // Fallback to localStorage on error
          const savedPreferences = localStorage.getItem('userPreferences');
          if (savedPreferences) {
            try {
              setPreferences({ ...defaultPreferences, ...JSON.parse(savedPreferences) });
            } catch (parseError) {
              console.error('Failed to parse saved preferences:', parseError);
            }
          }
        }
      };
      
      loadPreferences();
    }
  }, [isOpen]);

  // Track changes
  useEffect(() => {
    const savedPreferences = localStorage.getItem('userPreferences');
    const currentPreferences = JSON.stringify(preferences);
    const originalPreferences = savedPreferences || JSON.stringify(defaultPreferences);
    setHasChanges(currentPreferences !== originalPreferences);
  }, [preferences]);

  const handleArrayToggle = (
    array: string[], 
    value: string, 
    field: keyof Pick<UserPreferences, 'dietaryRestrictions' | 'allergies' | 'favoriteCuisines' | 'dislikedCuisines' | 'preferredMealTypes'>
  ) => {
    const newArray = array.includes(value)
      ? array.filter(item => item !== value)
      : [...array, value];
    
    setPreferences(prev => ({
      ...prev,
      [field]: newArray
    }));
  };

  const handleSavePreferences = async () => {
    setIsLoading(true);
    try {
      const response = await authService.updatePreferences(preferences);
      
      if (response.success) {
        // Also save to localStorage as a backup
        localStorage.setItem('userPreferences', JSON.stringify(preferences));
        
        toast({
          title: "Preferences Saved! 🎉",
          description: "Your preferences have been updated successfully.",
        });
        
        setHasChanges(false);
      } else {
        toast({
          title: "Save Failed",
          description: response.message || "Failed to save preferences",
          variant: "destructive"
        });
      }
      
    } catch (error) {
      // Fallback to localStorage if API fails
      localStorage.setItem('userPreferences', JSON.stringify(preferences));
      
      toast({
        title: "Preferences Saved Locally",
        description: "Saved to local storage. Will sync when online.",
        variant: "default"
      });
      
      setHasChanges(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-background border border-border shadow-elegant">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <Settings className="h-6 w-6 text-primary" />
            <span>Preferences</span>
          </DialogTitle>
          <DialogDescription>
            Customize your cooking and recipe recommendations experience
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="dietary" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dietary">Dietary</TabsTrigger>
            <TabsTrigger value="cuisine">Cuisine</TabsTrigger>
            <TabsTrigger value="cooking">Cooking</TabsTrigger>
            <TabsTrigger value="notifications">Settings</TabsTrigger>
          </TabsList>

          {/* Dietary Preferences Tab */}
          <TabsContent value="dietary" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Leaf className="h-5 w-5 text-green-600" />
                  <span>Dietary Restrictions</span>
                </CardTitle>
                <CardDescription>
                  Select any dietary restrictions you follow
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {dietaryOptions.map((option) => (
                    <div key={option} className="flex items-center space-x-2">
                      <Checkbox
                        id={`dietary-${option}`}
                        checked={preferences.dietaryRestrictions.includes(option)}
                        onCheckedChange={() => 
                          handleArrayToggle(preferences.dietaryRestrictions, option, 'dietaryRestrictions')
                        }
                      />
                      <Label htmlFor={`dietary-${option}`} className="text-sm font-normal">
                        {option}
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-red-600" />
                  <span>Allergies</span>
                </CardTitle>
                <CardDescription>
                  Select any food allergies you have
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {allergyOptions.map((option) => (
                    <div key={option} className="flex items-center space-x-2">
                      <Checkbox
                        id={`allergy-${option}`}
                        checked={preferences.allergies.includes(option)}
                        onCheckedChange={() => 
                          handleArrayToggle(preferences.allergies, option, 'allergies')
                        }
                      />
                      <Label htmlFor={`allergy-${option}`} className="text-sm font-normal">
                        {option}
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cuisine Preferences Tab */}
          <TabsContent value="cuisine" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  <span>Favorite Cuisines</span>
                </CardTitle>
                <CardDescription>
                  Choose your favorite types of cuisine
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {cuisineOptions.map((cuisine) => (
                    <div key={cuisine} className="flex items-center space-x-2">
                      <Checkbox
                        id={`favorite-${cuisine}`}
                        checked={preferences.favoriteCuisines.includes(cuisine)}
                        onCheckedChange={() => 
                          handleArrayToggle(preferences.favoriteCuisines, cuisine, 'favoriteCuisines')
                        }
                      />
                      <Label htmlFor={`favorite-${cuisine}`} className="text-sm font-normal">
                        {cuisine}
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="h-5 w-5 text-gray-600" />
                  <span>Cuisines to Avoid</span>
                </CardTitle>
                <CardDescription>
                  Select cuisines you prefer not to see in recommendations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {cuisineOptions.map((cuisine) => (
                    <div key={cuisine} className="flex items-center space-x-2">
                      <Checkbox
                        id={`dislike-${cuisine}`}
                        checked={preferences.dislikedCuisines.includes(cuisine)}
                        onCheckedChange={() => 
                          handleArrayToggle(preferences.dislikedCuisines, cuisine, 'dislikedCuisines')
                        }
                      />
                      <Label htmlFor={`dislike-${cuisine}`} className="text-sm font-normal">
                        {cuisine}
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cooking Preferences Tab */}
          <TabsContent value="cooking" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ChefHat className="h-5 w-5 text-orange-600" />
                  <span>Cooking Settings</span>
                </CardTitle>
                <CardDescription>
                  Tell us about your cooking experience and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="skill-level">Cooking Skill Level</Label>
                    <Select
                      value={preferences.cookingSkillLevel}
                      onValueChange={(value) => 
                        setPreferences(prev => ({ ...prev, cookingSkillLevel: value as any }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                        <SelectItem value="expert">Expert</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="max-time">Maximum Cooking Time</Label>
                    <Select
                      value={preferences.maxCookingTime.toString()}
                      onValueChange={(value) => 
                        setPreferences(prev => ({ ...prev, maxCookingTime: parseInt(value) }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="45">45 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="90">1.5 hours</SelectItem>
                        <SelectItem value="120">2+ hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="serving-size">Default Serving Size</Label>
                    <Select
                      value={preferences.servingSize.toString()}
                      onValueChange={(value) => 
                        setPreferences(prev => ({ ...prev, servingSize: parseInt(value) }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 person</SelectItem>
                        <SelectItem value="2">2 people</SelectItem>
                        <SelectItem value="4">4 people</SelectItem>
                        <SelectItem value="6">6 people</SelectItem>
                        <SelectItem value="8">8+ people</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                <div>
                  <Label className="text-base font-medium mb-4 block">Preferred Meal Types</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {mealTypeOptions.map((mealType) => (
                      <div key={mealType} className="flex items-center space-x-2">
                        <Checkbox
                          id={`meal-${mealType}`}
                          checked={preferences.preferredMealTypes.includes(mealType)}
                          onCheckedChange={() => 
                            handleArrayToggle(preferences.preferredMealTypes, mealType, 'preferredMealTypes')
                          }
                        />
                        <Label htmlFor={`meal-${mealType}`} className="text-sm font-normal">
                          {mealType}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications & Settings Tab */}
          <TabsContent value="notifications" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="h-5 w-5 text-blue-600" />
                  <span>Notifications</span>
                </CardTitle>
                <CardDescription>
                  Control how and when you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                    <div className="text-sm text-muted-foreground">
                      Receive email updates about your account
                    </div>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={preferences.emailNotifications}
                    onCheckedChange={(checked) => 
                      setPreferences(prev => ({ ...prev, emailNotifications: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="push-notifications">Push Notifications</Label>
                    <div className="text-sm text-muted-foreground">
                      Receive browser notifications
                    </div>
                  </div>
                  <Switch
                    id="push-notifications"
                    checked={preferences.pushNotifications}
                    onCheckedChange={(checked) => 
                      setPreferences(prev => ({ ...prev, pushNotifications: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="weekly-emails">Weekly Recipe Emails</Label>
                    <div className="text-sm text-muted-foreground">
                      Get personalized recipe recommendations weekly
                    </div>
                  </div>
                  <Switch
                    id="weekly-emails"
                    checked={preferences.weeklyRecipeEmails}
                    onCheckedChange={(checked) => 
                      setPreferences(prev => ({ ...prev, weeklyRecipeEmails: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="recipe-recommendations">Recipe Recommendations</Label>
                    <div className="text-sm text-muted-foreground">
                      Show personalized recipe suggestions
                    </div>
                  </div>
                  <Switch
                    id="recipe-recommendations"
                    checked={preferences.recipeRecommendations}
                    onCheckedChange={(checked) => 
                      setPreferences(prev => ({ ...prev, recipeRecommendations: checked }))
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Display Settings</CardTitle>
                <CardDescription>
                  Customize how information is displayed
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="units">Measurement Units</Label>
                    <Select
                      value={preferences.units}
                      onValueChange={(value) => 
                        setPreferences(prev => ({ ...prev, units: value as any }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="metric">Metric (kg, L, °C)</SelectItem>
                        <SelectItem value="imperial">Imperial (lb, fl oz, °F)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select
                      value={preferences.language}
                      onValueChange={(value) => 
                        setPreferences(prev => ({ ...prev, language: value as any }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                        <SelectItem value="fr">Français</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="theme">Theme</Label>
                    <Select
                      value={preferences.theme}
                      onValueChange={(value) => 
                        setPreferences(prev => ({ ...prev, theme: value as any }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex items-center justify-between pt-4">
          <div className="text-sm text-muted-foreground">
            {hasChanges ? (
              <Badge variant="secondary" className="animate-pulse">
                Unsaved changes
              </Badge>
            ) : (
              <span>All changes saved</span>
            )}
          </div>
          
          <div className="flex space-x-3">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button 
              onClick={handleSavePreferences}
              disabled={!hasChanges || isLoading}
              className={hasChanges ? "animate-pulse" : ""}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Save className="h-4 w-4" />
                  <span>Save Preferences</span>
                </div>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};