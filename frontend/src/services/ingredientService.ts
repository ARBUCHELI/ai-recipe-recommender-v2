const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export interface Ingredient {
  id: string;
  name: string;
  category?: string;
  unit?: string;
}

export interface IngredientResponse {
  success: boolean;
  ingredient?: Ingredient;
  ingredients?: Ingredient[];
  categories?: string[];
  message?: string;
  count?: number;
}

class IngredientService {
  private token: string | null = null;

  constructor() {
    // Load token from localStorage on initialization
    this.token = localStorage.getItem('auth_token');
  }

  private async makeRequest(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<IngredientResponse> {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      console.log('🔗 Making ingredient request to:', url);
      
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

      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Ingredient HTTP Error Response:', response.status, errorText);
        throw new Error(errorText || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Ingredient success response:', data);

      return data;
    } catch (error) {
      console.error('Ingredient service error:', error);
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
   * Get ingredient suggestions
   */
  async getIngredientSuggestions(search?: string, category?: string): Promise<IngredientResponse> {
    const queryParams = new URLSearchParams();
    
    if (search) queryParams.set('search', search);
    if (category) queryParams.set('category', category);

    const endpoint = `/api/ingredients/suggestions?${queryParams.toString()}`;
    return await this.makeRequest(endpoint);
  }

  /**
   * Get all ingredient categories
   */
  async getIngredientCategories(): Promise<IngredientResponse> {
    return await this.makeRequest('/api/ingredients/categories');
  }

  /**
   * Search ingredients
   */
  async searchIngredients(query: string, category?: string, limit: number = 20): Promise<IngredientResponse> {
    const queryParams = new URLSearchParams();
    queryParams.set('q', query);
    if (category) queryParams.set('category', category);
    queryParams.set('limit', limit.toString());

    const endpoint = `/api/ingredients/search?${queryParams.toString()}`;
    return await this.makeRequest(endpoint);
  }

  /**
   * Get ingredient by ID
   */
  async getIngredientById(ingredientId: string): Promise<IngredientResponse> {
    return await this.makeRequest(`/api/ingredients/${ingredientId}`);
  }

  /**
   * Create a new global ingredient
   */
  async createGlobalIngredient(ingredientData: {
    name: string;
    category?: string;
    unit?: string;
  }): Promise<IngredientResponse> {
    return await this.makeRequest('/api/ingredients', {
      method: 'POST',
      body: JSON.stringify(ingredientData),
    });
  }

  /**
   * Seed initial ingredients (development/admin function)
   */
  async seedInitialIngredients(): Promise<IngredientResponse> {
    return await this.makeRequest('/api/ingredients/seed', {
      method: 'POST',
    });
  }

  /**
   * Get ingredient autocomplete suggestions for form inputs
   */
  async getAutocompleteIngredients(query: string, limit: number = 10): Promise<IngredientResponse> {
    if (!query || query.trim().length < 2) {
      return {
        success: true,
        ingredients: [],
        count: 0
      };
    }

    return await this.searchIngredients(query.trim(), undefined, limit);
  }

  /**
   * Get ingredients by category for UI filtering
   */
  async getIngredientsByCategory(category: string): Promise<IngredientResponse> {
    return await this.getIngredientSuggestions(undefined, category);
  }
}

// Export singleton instance
export const ingredientService = new IngredientService();
export type { Ingredient, IngredientResponse };