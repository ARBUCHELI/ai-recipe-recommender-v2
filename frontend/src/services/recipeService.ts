const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export interface Recipe {
  id: string;
  name: string;
  description?: string;
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  difficulty?: string;
  cuisine?: string;
  ingredients: any[]; // JSON array of ingredients
  instructions: any[]; // JSON array of instructions
  nutrition?: any; // JSON object for nutrition data
  tags?: string[];
  isPublic?: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  images?: any[];
}

export interface CreateRecipeData {
  name: string;
  description?: string;
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  difficulty?: string;
  cuisine?: string;
  ingredients: any[];
  instructions: any[];
  nutrition?: any;
  tags?: string[];
  isPublic?: boolean;
}

export interface RecipeResponse {
  success: boolean;
  recipe?: Recipe;
  recipes?: Recipe[];
  message?: string;
  count?: number;
  page?: number;
  limit?: number;
}

export interface RecipeFilters {
  search?: string;
  tags?: string[];
  difficulty?: string;
  cuisine?: string;
  page?: number;
  limit?: number;
}

class RecipeService {
  private token: string | null = null;

  constructor() {
    // Load token from localStorage on initialization
    this.token = localStorage.getItem('auth_token');
  }

  private async makeRequest(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<RecipeResponse> {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      console.log('🔗 Making recipe request to:', url);
      
      const config: RequestInit = {
        mode: 'cors',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(this.token && { Authorization: `Bearer ${this.token}` }),
          ...options.headers,
        },
        ...options,
      };

      console.log('⚙️ Recipe request config:', config);

      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Recipe HTTP Error Response:', response.status, errorText);
        throw new Error(errorText || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Recipe success response:', data);

      return data;
    } catch (error) {
      console.error('Recipe service error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Network error occurred',
      };
    }
  }

  // Update token when it changes
  updateToken(token: string | null) {
    this.token = token;
  }

  /**
   * Get all user recipes with optional filtering
   */
  async getUserRecipes(filters: RecipeFilters = {}): Promise<RecipeResponse> {
    const queryParams = new URLSearchParams();
    
    if (filters.page) queryParams.set('page', filters.page.toString());
    if (filters.limit) queryParams.set('limit', filters.limit.toString());
    if (filters.search) queryParams.set('search', filters.search);
    if (filters.tags && filters.tags.length > 0) queryParams.set('tags', filters.tags.join(','));
    if (filters.difficulty) queryParams.set('difficulty', filters.difficulty);
    if (filters.cuisine) queryParams.set('cuisine', filters.cuisine);

    const endpoint = `/api/recipes?${queryParams.toString()}`;
    return await this.makeRequest(endpoint);
  }

  /**
   * Get a specific recipe by ID
   */
  async getRecipeById(recipeId: string): Promise<RecipeResponse> {
    return await this.makeRequest(`/api/recipes/${recipeId}`);
  }

  /**
   * Create a new recipe
   */
  async createRecipe(recipeData: CreateRecipeData): Promise<RecipeResponse> {
    return await this.makeRequest('/api/recipes', {
      method: 'POST',
      body: JSON.stringify(recipeData),
    });
  }

  /**
   * Update an existing recipe
   */
  async updateRecipe(recipeId: string, recipeData: Partial<CreateRecipeData>): Promise<RecipeResponse> {
    return await this.makeRequest(`/api/recipes/${recipeId}`, {
      method: 'PUT',
      body: JSON.stringify(recipeData),
    });
  }

  /**
   * Delete a recipe
   */
  async deleteRecipe(recipeId: string): Promise<RecipeResponse> {
    return await this.makeRequest(`/api/recipes/${recipeId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Get public recipes for discovery
   */
  async getPublicRecipes(filters: RecipeFilters = {}): Promise<RecipeResponse> {
    const queryParams = new URLSearchParams();
    
    if (filters.page) queryParams.set('page', filters.page.toString());
    if (filters.limit) queryParams.set('limit', filters.limit.toString());
    if (filters.search) queryParams.set('search', filters.search);
    if (filters.tags && filters.tags.length > 0) queryParams.set('tags', filters.tags.join(','));
    if (filters.difficulty) queryParams.set('difficulty', filters.difficulty);
    if (filters.cuisine) queryParams.set('cuisine', filters.cuisine);

    const endpoint = `/api/recipes/public?${queryParams.toString()}`;
    return await this.makeRequest(endpoint);
  }

  /**
   * Get user recipe statistics
   */
  async getUserRecipeStats(): Promise<RecipeResponse & { stats?: any }> {
    return await this.makeRequest('/api/recipes/stats');
  }

  /**
   * Search recipes (combined user and public)
   */
  async searchRecipes(query: string, includePublic: boolean = false): Promise<RecipeResponse> {
    const userRecipes = await this.getUserRecipes({ search: query, limit: 50 });
    
    if (!includePublic) {
      return userRecipes;
    }

    // If including public recipes, also fetch them
    const publicRecipes = await this.getPublicRecipes({ search: query, limit: 50 });
    
    if (userRecipes.success && publicRecipes.success) {
      return {
        success: true,
        recipes: [...(userRecipes.recipes || []), ...(publicRecipes.recipes || [])],
        count: (userRecipes.count || 0) + (publicRecipes.count || 0)
      };
    }

    return userRecipes.success ? userRecipes : publicRecipes;
  }

  /**
   * Get recipes by tags
   */
  async getRecipesByTags(tags: string[], includePublic: boolean = false): Promise<RecipeResponse> {
    const userRecipes = await this.getUserRecipes({ tags, limit: 50 });
    
    if (!includePublic) {
      return userRecipes;
    }

    const publicRecipes = await this.getPublicRecipes({ tags, limit: 50 });
    
    if (userRecipes.success && publicRecipes.success) {
      return {
        success: true,
        recipes: [...(userRecipes.recipes || []), ...(publicRecipes.recipes || [])],
        count: (userRecipes.count || 0) + (publicRecipes.count || 0)
      };
    }

    return userRecipes.success ? userRecipes : publicRecipes;
  }

  /**
   * Toggle recipe public/private status
   */
  async toggleRecipeVisibility(recipeId: string, isPublic: boolean): Promise<RecipeResponse> {
    return await this.updateRecipe(recipeId, { isPublic });
  }
}

// Export singleton instance
export const recipeService = new RecipeService();
export type { Recipe, CreateRecipeData, RecipeResponse, RecipeFilters };