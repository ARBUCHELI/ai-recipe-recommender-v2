interface UserMemory {
  preferences: {
    dietaryRestrictions: string[];
    favoriteIngredients: string[];
    dislikedIngredients: string[];
  };
  history: {
    recipes: string[];
    mealPlans: string[];
    personalizedPlans: string[];
  };
}

interface Categories {
  [category: string]: string[];
}

const DEFAULT_USER_MEMORY: UserMemory = {
  preferences: {
    dietaryRestrictions: [],
    favoriteIngredients: [],
    dislikedIngredients: []
  },
  history: {
    recipes: [],
    mealPlans: [],
    personalizedPlans: []
  }
};

const DEFAULT_CATEGORIES: Categories = {
  "Produce": ["tomato", "onion", "garlic", "carrot", "potato", "bell pepper", "cucumber", "lettuce", "spinach", "broccoli"],
  "Meat & Seafood": ["chicken", "beef", "pork", "fish", "salmon", "shrimp", "turkey", "lamb"],
  "Dairy": ["milk", "cheese", "yogurt", "butter", "cream", "eggs"],
  "Pantry": ["rice", "pasta", "flour", "sugar", "salt", "pepper", "oil", "vinegar", "herbs", "spices"],
  "Frozen": ["frozen vegetables", "frozen fruits", "ice cream"],
  "Bakery": ["bread", "bagels", "rolls", "croissants"],
  "Other": []
};

export class LocalStorageService {
  private static readonly USER_MEMORY_PREFIX = 'user_memory_';
  private static readonly CATEGORIES_PREFIX = 'categories_';
  private static readonly GLOBAL_CATEGORIES_KEY = 'global_categories';
  private static currentUserId: string | null = null;

  /**
   * Set the current user ID for user-specific storage
   */
  static setCurrentUser(userId: string | null): void {
    this.currentUserId = userId;
    console.log('📱 LocalStorage: Setting current user:', userId);
  }

  /**
   * Get user-specific key
   */
  private static getUserKey(baseKey: string): string {
    if (!this.currentUserId) {
      console.warn('⚠️ No current user set for LocalStorage. Using anonymous key.');
      return `${baseKey}anonymous`;
    }
    return `${baseKey}${this.currentUserId}`;
  }

  /**
   * Clear all user-specific data (called on logout)
   */
  static clearUserData(userId?: string): void {
    const userIdToClear = userId || this.currentUserId;
    if (!userIdToClear) return;

    console.log('🧹 Clearing user data for:', userIdToClear);
    
    // Clear user-specific keys
    const userMemoryKey = `${this.USER_MEMORY_PREFIX}${userIdToClear}`;
    const userCategoriesKey = `${this.CATEGORIES_PREFIX}${userIdToClear}`;
    
    localStorage.removeItem(userMemoryKey);
    localStorage.removeItem(userCategoriesKey);
    
    // Clear any other user-specific keys that might exist
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (
        key.includes(`_${userIdToClear}_`) || 
        key.endsWith(`_${userIdToClear}`)
      )) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => {
      console.log('🗑️ Removing user-specific key:', key);
      localStorage.removeItem(key);
    });

    // Reset current user if we're clearing the current user's data
    if (userIdToClear === this.currentUserId) {
      this.currentUserId = null;
    }
  }

  /**
   * Clear all data for all users (admin/development function)
   */
  static clearAllData(): void {
    console.log('🧹 Clearing all LocalStorage data');
    localStorage.clear();
    this.currentUserId = null;
  }

  static getUserMemory(): UserMemory {
    try {
      const key = this.getUserKey(this.USER_MEMORY_PREFIX);
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : DEFAULT_USER_MEMORY;
    } catch (error) {
      console.error('Error loading user memory:', error);
      return DEFAULT_USER_MEMORY;
    }
  }

  static saveUserMemory(memory: UserMemory): void {
    try {
      const key = this.getUserKey(this.USER_MEMORY_PREFIX);
      localStorage.setItem(key, JSON.stringify(memory));
      console.log('💾 Saved user memory for user:', this.currentUserId);
    } catch (error) {
      console.error('Error saving user memory:', error);
    }
  }

  static getCategories(): Categories {
    try {
      // Try to get user-specific categories first
      const userKey = this.getUserKey(this.CATEGORIES_PREFIX);
      const userStored = localStorage.getItem(userKey);
      
      if (userStored) {
        return JSON.parse(userStored);
      }
      
      // Fall back to global categories
      const globalStored = localStorage.getItem(this.GLOBAL_CATEGORIES_KEY);
      return globalStored ? JSON.parse(globalStored) : DEFAULT_CATEGORIES;
    } catch (error) {
      console.error('Error loading categories:', error);
      return DEFAULT_CATEGORIES;
    }
  }

  static saveCategories(categories: Categories): void {
    try {
      const key = this.getUserKey(this.CATEGORIES_PREFIX);
      localStorage.setItem(key, JSON.stringify(categories));
      console.log('💾 Saved categories for user:', this.currentUserId);
    } catch (error) {
      console.error('Error saving categories:', error);
    }
  }

  /**
   * Save global categories (shared across all users)
   */
  static saveGlobalCategories(categories: Categories): void {
    try {
      localStorage.setItem(this.GLOBAL_CATEGORIES_KEY, JSON.stringify(categories));
      console.log('💾 Saved global categories');
    } catch (error) {
      console.error('Error saving global categories:', error);
    }
  }

  static addRecipeToHistory(recipeId: string): void {
    if (!this.currentUserId) {
      console.warn('⚠️ Cannot add recipe to history: No user logged in');
      return;
    }
    
    const memory = this.getUserMemory();
    memory.history.recipes.unshift(recipeId);
    // Keep only last 50 recipes
    memory.history.recipes = memory.history.recipes.slice(0, 50);
    this.saveUserMemory(memory);
  }

  static addMealPlanToHistory(mealPlanId: string): void {
    if (!this.currentUserId) {
      console.warn('⚠️ Cannot add meal plan to history: No user logged in');
      return;
    }
    
    const memory = this.getUserMemory();
    memory.history.mealPlans.unshift(mealPlanId);
    // Keep only last 20 meal plans
    memory.history.mealPlans = memory.history.mealPlans.slice(0, 20);
    this.saveUserMemory(memory);
  }

  static addPersonalizedPlanToHistory(personalizedPlanId: string): void {
    if (!this.currentUserId) {
      console.warn('⚠️ Cannot add personalized plan to history: No user logged in');
      return;
    }
    
    const memory = this.getUserMemory();
    memory.history.personalizedPlans.unshift(personalizedPlanId);
    // Keep only last 15 personalized plans
    memory.history.personalizedPlans = memory.history.personalizedPlans.slice(0, 15);
    this.saveUserMemory(memory);
  }

  static updatePreferences(preferences: Partial<UserMemory['preferences']>): void {
    if (!this.currentUserId) {
      console.warn('⚠️ Cannot update preferences: No user logged in');
      return;
    }
    
    const memory = this.getUserMemory();
    memory.preferences = { ...memory.preferences, ...preferences };
    this.saveUserMemory(memory);
  }

  /**
   * Get debug information about stored data
   */
  static getDebugInfo(): { [key: string]: any } {
    const info: { [key: string]: any } = {
      currentUserId: this.currentUserId,
      totalKeys: localStorage.length,
      userSpecificKeys: [],
      globalKeys: []
    };

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        if (this.currentUserId && (key.includes(this.currentUserId) || key.includes(`_${this.currentUserId}`))) {
          info.userSpecificKeys.push(key);
        } else {
          info.globalKeys.push(key);
        }
      }
    }

    return info;
  }
}

export type { UserMemory, Categories };
