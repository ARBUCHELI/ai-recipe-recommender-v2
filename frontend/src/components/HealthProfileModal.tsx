import React, { useState } from 'react';
import { User, Activity, Target, Clock, AlertCircle, Calculator, Heart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  ACTIVITY_LEVELS,
  FITNESS_GOALS,
  UpdateHealthProfileRequest,
  HealthProfileResponse,
  UserHealthProfile
} from '../types/HealthProfile';
import { HealthCalculationService } from '@/services/healthCalculationService';

interface HealthProfileModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (profile: UserHealthProfile) => void;
  initialData?: UserHealthProfile;
}

export const HealthProfileModal: React.FC<HealthProfileModalProps> = ({
  open,
  onClose,
  onSubmit,
  initialData
}) => {
  const { toast } = useToast();
  
  // Form state
  const [formData, setFormData] = useState<UpdateHealthProfileRequest>({
    height: initialData?.height || 170,
    weight: initialData?.weight || 70,
    age: initialData?.age || 30,
    gender: initialData?.gender || 'male',
    activityLevelId: (typeof initialData?.activityLevel === 'string' ? initialData.activityLevel : initialData?.activityLevel?.id) || 'moderately_active',
    fitnessGoalId: initialData?.fitnessGoal || 'maintain_weight',
    dietaryRestrictions: initialData?.dietaryRestrictions || [],
    healthConditions: initialData?.healthConditions || [],
    mealsPerDay: initialData?.numberOfMeals || 3,
    wakeUpTime: initialData?.wakeUpTime || '07:00',
    bedTime: initialData?.bedTime || '22:00'
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [dietaryInput, setDietaryInput] = useState('');
  const [healthInput, setHealthInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalSteps = 4;

  // Get selected activity level and fitness goal for display
  const selectedActivityLevel = ACTIVITY_LEVELS.find(level => level.id === formData.activityLevelId);
  const selectedFitnessGoal = FITNESS_GOALS.find(goal => goal.id === formData.fitnessGoalId);

  const handleInputChange = (field: keyof UpdateHealthProfileRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addDietaryRestriction = () => {
    if (dietaryInput.trim()) {
      setFormData(prev => ({
        ...prev,
        dietaryRestrictions: [...prev.dietaryRestrictions || [], dietaryInput.trim()]
      }));
      setDietaryInput('');
    }
  };

  const removeDietaryRestriction = (index: number) => {
    setFormData(prev => ({
      ...prev,
      dietaryRestrictions: prev.dietaryRestrictions?.filter((_, i) => i !== index) || []
    }));
  };

  const addHealthCondition = () => {
    if (healthInput.trim()) {
      setFormData(prev => ({
        ...prev,
        healthConditions: [...prev.healthConditions || [], healthInput.trim()]
      }));
      setHealthInput('');
    }
  };

  const removeHealthCondition = (index: number) => {
    setFormData(prev => ({
      ...prev,
      healthConditions: prev.healthConditions?.filter((_, i) => i !== index) || []
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Validate required fields
      if (!formData.height || !formData.weight || !formData.age) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required fields.",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }

      // Find the actual ActivityLevel object
      const selectedActivityLevel = ACTIVITY_LEVELS.find(level => level.id === formData.activityLevelId);
      if (!selectedActivityLevel) {
        toast({
          title: "Invalid Selection",
          description: "Please select a valid activity level.",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }

      // Create UserHealthProfile object
      const healthProfile: UserHealthProfile = {
        userId: 'current-user', // This would normally come from auth context
        height: formData.height,
        weight: formData.weight,
        age: formData.age,
        gender: formData.gender as 'male' | 'female' | 'other',
        activityLevel: selectedActivityLevel, // Use the full ActivityLevel object
        fitnessGoal: formData.fitnessGoalId,
        dietaryRestrictions: formData.dietaryRestrictions || [],
        healthConditions: formData.healthConditions || [],
        numberOfMeals: formData.mealsPerDay || 3,
        wakeUpTime: formData.wakeUpTime || '07:00',
        bedTime: formData.bedTime || '22:00',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      toast({
        title: "Profile Created!",
        description: "Your personalized health profile has been generated.",
      });
      
      onSubmit(healthProfile);
      onClose();
      setCurrentStep(1); // Reset for next time
    } catch (error) {
      console.error('Error creating health profile:', error);
      toast({
        title: "Profile Creation Failed",
        description: "There was an error creating your health profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <User className="h-12 w-12 text-brand-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Basic Information</h3>
              <p className="text-secondary-dark">Tell us about yourself to get started</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="height">Height (cm) *</Label>
                <Input
                  id="height"
                  type="number"
                  value={formData.height}
                  onChange={(e) => handleInputChange('height', parseInt(e.target.value))}
                  placeholder="170"
                  min="120"
                  max="250"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg) *</Label>
                <Input
                  id="weight"
                  type="number"
                  value={formData.weight}
                  onChange={(e) => handleInputChange('weight', parseInt(e.target.value))}
                  placeholder="70"
                  min="30"
                  max="200"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age">Age *</Label>
                <Input
                  id="age"
                  type="number"
                  value={formData.age}
                  onChange={(e) => handleInputChange('age', parseInt(e.target.value))}
                  placeholder="30"
                  min="13"
                  max="120"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select value={formData.gender} onValueChange={(value: any) => handleInputChange('gender', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Activity className="h-12 w-12 text-success mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Activity Level</h3>
              <p className="text-secondary-dark">How active are you typically?</p>
            </div>

            <div className="space-y-3">
              {ACTIVITY_LEVELS.map((level) => (
                <Card 
                  key={level.id}
                  className={`cursor-pointer transition-all ${
                    formData.activityLevelId === level.id 
                      ? 'border-success bg-success/5 shadow-professional-md' 
                      : 'hover:border-success/50'
                  }`}
                  onClick={() => handleInputChange('activityLevelId', level.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-primary-dark">{level.name}</h4>
                        <p className="text-sm text-secondary-dark mb-2">{level.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {level.examples.map((example, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {example}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-success">
                          {level.multiplier}x
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Target className="h-12 w-12 text-warning mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Fitness Goals</h3>
              <p className="text-secondary-dark">What's your main fitness objective?</p>
            </div>

            <div className="space-y-3">
              {FITNESS_GOALS.map((goal) => (
                <Card 
                  key={goal.id}
                  className={`cursor-pointer transition-all ${
                    formData.fitnessGoalId === goal.id 
                      ? 'border-warning bg-warning/5 shadow-professional-md' 
                      : 'hover:border-warning/50'
                  }`}
                  onClick={() => handleInputChange('fitnessGoalId', goal.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-primary-dark">{goal.name}</h4>
                        <p className="text-sm text-secondary-dark mb-2">{goal.description}</p>
                        <div className="text-xs text-muted-foreground">
                          Protein: {Math.round(goal.proteinRatio * 100)}% | 
                          Carbs: {Math.round(goal.carbRatio * 100)}% | 
                          Fat: {Math.round(goal.fatRatio * 100)}%
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-warning">
                          {goal.calorieAdjustment > 0 ? '+' : ''}{Math.round(goal.calorieAdjustment * 100)}%
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Clock className="h-12 w-12 text-info mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Preferences & Health</h3>
              <p className="text-secondary-dark">Final details for personalization</p>
            </div>

            {/* Schedule */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mealsPerDay">Meals/Day</Label>
                <Select 
                  value={formData.mealsPerDay?.toString()} 
                  onValueChange={(value) => handleInputChange('mealsPerDay', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 meals</SelectItem>
                    <SelectItem value="4">4 meals</SelectItem>
                    <SelectItem value="5">5 meals</SelectItem>
                    <SelectItem value="6">6 meals</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="wakeUpTime">Wake Up</Label>
                <Input
                  id="wakeUpTime"
                  type="time"
                  value={formData.wakeUpTime}
                  onChange={(e) => handleInputChange('wakeUpTime', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bedTime">Bed Time</Label>
                <Input
                  id="bedTime"
                  type="time"
                  value={formData.bedTime}
                  onChange={(e) => handleInputChange('bedTime', e.target.value)}
                />
              </div>
            </div>

            {/* Dietary Restrictions */}
            <div className="space-y-2">
              <Label htmlFor="dietary">Dietary Restrictions (Optional)</Label>
              <div className="flex gap-2">
                <Input
                  id="dietary"
                  value={dietaryInput}
                  onChange={(e) => setDietaryInput(e.target.value)}
                  placeholder="e.g., gluten-free, vegetarian"
                  onKeyPress={(e) => e.key === 'Enter' && addDietaryRestriction()}
                />
                <Button onClick={addDietaryRestriction} variant="outline" size="sm">
                  Add
                </Button>
              </div>
              {formData.dietaryRestrictions && formData.dietaryRestrictions.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {formData.dietaryRestrictions.map((restriction, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="cursor-pointer hover:bg-destructive hover:text-white"
                      onClick={() => removeDietaryRestriction(index)}
                    >
                      {restriction} ✕
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Health Conditions */}
            <div className="space-y-2">
              <Label htmlFor="health">Health Conditions (Optional)</Label>
              <div className="flex gap-2">
                <Input
                  id="health"
                  value={healthInput}
                  onChange={(e) => setHealthInput(e.target.value)}
                  placeholder="e.g., diabetes, hypertension"
                  onKeyPress={(e) => e.key === 'Enter' && addHealthCondition()}
                />
                <Button onClick={addHealthCondition} variant="outline" size="sm">
                  Add
                </Button>
              </div>
              {formData.healthConditions && formData.healthConditions.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {formData.healthConditions.map((condition, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="cursor-pointer hover:bg-destructive hover:text-white"
                      onClick={() => removeHealthCondition(index)}
                    >
                      {condition} ✕
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={(openState) => !openState && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-brand-primary" />
            {initialData ? 'Update Health Profile' : 'Create Health Profile'}
          </DialogTitle>
          <DialogDescription>
            {initialData 
              ? 'Update your health information for better personalized recommendations'
              : 'Create your personalized health profile to get tailored meal plans and nutrition guidance'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress indicator */}
          <div className="flex items-center space-x-2">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div
                key={i}
                className={`flex-1 h-2 rounded-full ${
                  i + 1 <= currentStep ? 'bg-brand-primary' : 'bg-neutral-200'
                }`}
              />
            ))}
          </div>

          <div className="text-center">
            <p className="text-sm text-secondary-dark">
              Step {currentStep} of {totalSteps}
            </p>
          </div>

          {/* Step content */}
          {renderStep()}

          {/* Navigation buttons */}
          <div className="flex justify-between pt-6 border-t border-neutral">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
            >
              Previous
            </Button>

            {currentStep < totalSteps ? (
              <Button
                onClick={() => setCurrentStep(Math.min(totalSteps, currentStep + 1))}
                className="btn-primary"
                disabled={
                  currentStep === 1 && (!formData.height || !formData.weight || !formData.age)
                }
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                className="btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Calculator className="h-4 w-4 mr-2 animate-spin" />
                    Calculating...
                  </>
                ) : (
                  <>
                    <Calculator className="h-4 w-4 mr-2" />
                    Create Profile
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Preview (show on last step) */}
          {currentStep === totalSteps && selectedActivityLevel && selectedFitnessGoal && (
            <div className="p-4 bg-gradient-to-br from-brand-primary/5 to-success/5 rounded-lg border border-brand-primary/20">
              <h4 className="font-semibold text-primary-dark mb-2">Profile Summary</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-secondary-dark">Height:</span> {formData.height}cm
                </div>
                <div>
                  <span className="text-secondary-dark">Weight:</span> {formData.weight}kg
                </div>
                <div>
                  <span className="text-secondary-dark">Activity:</span> {selectedActivityLevel.name}
                </div>
                <div>
                  <span className="text-secondary-dark">Goal:</span> {selectedFitnessGoal.name}
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};