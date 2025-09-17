import { 
  UserHealthProfile, 
  MealTimingRecommendation, 
  FoodCategory, 
  ActivityLevel 
} from '../types/HealthProfile';

export class MealTimingService {
  /**
   * Generates personalized meal timing recommendations based on user profile
   */
  public static generateMealTiming(profile: UserHealthProfile): MealTimingRecommendation {
    const { wakeUpTime, bedTime, numberOfMeals, activityLevel, fitnessGoal } = profile;
    
    const wakeTime = this.parseTimeString(wakeUpTime);
    const sleepTime = this.parseTimeString(bedTime);
    
    // Calculate active hours
    const activeHours = this.calculateActiveHours(wakeTime, sleepTime);
    
    // Generate meal times based on number of meals and active hours
    const mealTimes = this.calculateOptimalMealTimes(wakeTime, activeHours, numberOfMeals);
    
    // Generate snack recommendations
    const snackTimes = this.calculateSnackTimes(mealTimes, activeHours, activityLevel);
    
    // Generate food category timing recommendations
    const categoryTiming = this.generateCategoryTiming(wakeTime, sleepTime, activityLevel, fitnessGoal);
    
    // Generate hydration schedule
    const hydrationSchedule = this.generateHydrationSchedule(wakeTime, sleepTime, activityLevel);
    
    return {
      mealTimes,
      snackTimes,
      categoryTiming,
      hydrationSchedule,
      metabolismTips: this.generateMetabolismTips(activityLevel, fitnessGoal),
      fastingWindow: this.calculateOptimalFastingWindow(wakeTime, sleepTime, fitnessGoal)
    };
  }
  
  /**
   * Parses time string (HH:MM) to minutes from midnight
   */
  private static parseTimeString(timeStr: string): number {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  }
  
  /**
   * Formats minutes from midnight back to HH:MM string
   */
  private static formatTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }
  
  /**
   * Calculate total active hours in the day
   */
  private static calculateActiveHours(wakeTime: number, sleepTime: number): number {
    if (sleepTime > wakeTime) {
      return sleepTime - wakeTime;
    }
    // Handle case where sleep time is next day
    return (24 * 60) - wakeTime + sleepTime;
  }
  
  /**
   * Calculate optimal meal times distributed throughout active hours
   */
  private static calculateOptimalMealTimes(wakeTime: number, activeHours: number, numberOfMeals: number): string[] {
    const mealTimes: string[] = [];
    
    if (numberOfMeals === 1) {
      // One meal - typically lunch time
      mealTimes.push(this.formatTime(wakeTime + Math.floor(activeHours / 2)));
    } else if (numberOfMeals === 2) {
      // Two meals - breakfast and dinner
      mealTimes.push(this.formatTime(wakeTime + 60)); // 1 hour after waking
      mealTimes.push(this.formatTime(wakeTime + Math.floor(activeHours * 0.75))); // 3/4 through the day
    } else {
      // Three or more meals - evenly distributed
      const mealInterval = Math.floor(activeHours / numberOfMeals);
      
      for (let i = 0; i < numberOfMeals; i++) {
        const mealTime = wakeTime + (i + 1) * mealInterval - Math.floor(mealInterval / 2);
        mealTimes.push(this.formatTime(mealTime));
      }
    }
    
    return mealTimes;
  }
  
  /**
   * Calculate optimal snack times between meals
   */
  private static calculateSnackTimes(mealTimes: string[], activeHours: number, activityLevel: ActivityLevel): string[] {
    if (mealTimes.length <= 1) return [];
    
    const snackTimes: string[] = [];
    const mealMinutes = mealTimes.map(time => this.parseTimeString(time));
    
    // High activity levels benefit from more frequent eating
    const activityId = typeof activityLevel === 'string' ? activityLevel : activityLevel.id;
    const snacksNeeded = activityId === 'very_active' || activityId === 'extra_active' ? 2 : 1;
    
    // Add snacks between meals if gap is > 4 hours
    for (let i = 0; i < mealMinutes.length - 1; i++) {
      const gap = mealMinutes[i + 1] - mealMinutes[i];
      if (gap > 240) { // 4 hours
        const snackTime = mealMinutes[i] + Math.floor(gap / 2);
        snackTimes.push(this.formatTime(snackTime));
      }
    }
    
    return snackTimes.slice(0, snacksNeeded);
  }
  
  /**
   * Generate food category timing recommendations
   */
  private static generateCategoryTiming(wakeTime: number, sleepTime: number, activityLevel: ActivityLevel, fitnessGoal: string): Record<FoodCategory, { bestTimes: string[]; reasoning: string; }> {
    return {
      carbs: {
        bestTimes: [
          this.formatTime(wakeTime + 30), // Morning for energy
          this.formatTime(wakeTime + Math.floor(this.calculateActiveHours(wakeTime, sleepTime) / 2)) // Mid-day
        ],
        reasoning: "Complex carbohydrates provide sustained energy and are best consumed in the morning and midday when you need fuel for activities."
      },
      proteins: {
        bestTimes: [
          this.formatTime(wakeTime + 60), // Post-morning
          this.formatTime(sleepTime - 180) // 3 hours before bed
        ],
        reasoning: "Protein supports muscle repair and growth. Consume after morning activities and several hours before bed for optimal digestion."
      },
      healthy_fats: {
        bestTimes: [
          this.formatTime(wakeTime + 90), // With breakfast
          this.formatTime(sleepTime - 240) // 4 hours before bed
        ],
        reasoning: "Healthy fats promote satiety and nutrient absorption. Best consumed with meals and avoided close to bedtime."
      },
      vegetables: {
        bestTimes: [
          this.formatTime(wakeTime + 60), // With first meal
          this.formatTime(wakeTime + Math.floor(this.calculateActiveHours(wakeTime, sleepTime) * 0.6)) // Afternoon
        ],
        reasoning: "Vegetables provide essential vitamins and fiber. Consume throughout the day, with raw vegetables better earlier for easier digestion."
      },
      fruits: {
        bestTimes: [
          this.formatTime(wakeTime + 30), // Morning
          this.formatTime(wakeTime + Math.floor(this.calculateActiveHours(wakeTime, sleepTime) * 0.4)) // Mid-afternoon
        ],
        reasoning: "Fruits provide quick energy and vitamins. Best consumed in the morning or as afternoon snacks when you need natural sugar."
      }
    };
  }
  
  /**
   * Generate hydration schedule throughout the day
   */
  private static generateHydrationSchedule(wakeTime: number, sleepTime: number, activityLevel: ActivityLevel): { time: string; amount: string; note: string; }[] {
    const schedule = [];
    const activeHours = this.calculateActiveHours(wakeTime, sleepTime);
    
    // Morning hydration
    schedule.push({
      time: this.formatTime(wakeTime),
      amount: "16-20 oz",
      note: "Rehydrate after sleep to kickstart metabolism"
    });
    
    // Throughout the day - every 2-3 hours
    const intervals = Math.floor(activeHours / 150); // Every 2.5 hours
    for (let i = 1; i <= intervals; i++) {
      const time = wakeTime + (i * 150);
      if (time < sleepTime - 120) { // Stop 2 hours before bed
        const activityId = typeof activityLevel === 'string' ? activityLevel : activityLevel.id;
        schedule.push({
          time: this.formatTime(time),
          amount: activityId === 'very_active' || activityId === 'extra_active' ? "12-16 oz" : "8-12 oz",
          note: "Maintain consistent hydration"
        });
      }
    }
    
    // Pre-bedtime (if not too close to sleep)
    if (activeHours > 360) { // If awake more than 6 hours
      schedule.push({
        time: this.formatTime(sleepTime - 120),
        amount: "6-8 oz",
        note: "Light hydration before bed to avoid sleep disruption"
      });
    }
    
    return schedule;
  }
  
  /**
   * Generate metabolism optimization tips
   */
  private static generateMetabolismTips(activityLevel: ActivityLevel, fitnessGoal: string): string[] {
    const baseTips = [
      "Eat within 1 hour of waking to jumpstart metabolism",
      "Don't skip meals - consistent eating maintains metabolic rate",
      "Include protein with each meal to support muscle maintenance"
    ];
    
    const activityId = typeof activityLevel === 'string' ? activityLevel : activityLevel.id;
    if (activityId === 'very_active' || activityId === 'extra_active') {
      baseTips.push(
        "Consider eating small amounts every 2-3 hours to fuel high activity",
        "Time carbohydrates around workouts for optimal performance"
      );
    }
    
    if (fitnessGoal === 'lose_weight') {
      baseTips.push(
        "Create a consistent eating schedule to regulate hunger hormones",
        "Stop eating 3 hours before bedtime to optimize fat burning during sleep"
      );
    } else if (fitnessGoal === 'gain_muscle') {
      baseTips.push(
        "Eat protein within 2 hours after strength training",
        "Don't let more than 4 hours pass without eating to support muscle growth"
      );
    }
    
    return baseTips;
  }
  
  /**
   * Calculate optimal intermittent fasting window if applicable
   */
  private static calculateOptimalFastingWindow(wakeTime: number, sleepTime: number, fitnessGoal: string): { start: string; end: string; duration: number; recommended: boolean; } | null {
    // Only recommend fasting for weight loss goals
    if (fitnessGoal !== 'lose_weight') {
      return null;
    }
    
    const activeHours = this.calculateActiveHours(wakeTime, sleepTime);
    
    // Recommend 16:8 intermittent fasting
    const fastingHours = 16;
    const eatingWindow = 8;
    
    // Start eating 3 hours after waking, stop 5 hours before sleeping
    const eatingStart = wakeTime + 180; // 3 hours after waking
    const eatingEnd = eatingStart + (eatingWindow * 60); // 8 hour window
    
    return {
      start: this.formatTime(eatingEnd),
      end: this.formatTime(eatingStart),
      duration: fastingHours,
      recommended: activeHours >= 14 // Only recommend if awake long enough
    };
  }
}