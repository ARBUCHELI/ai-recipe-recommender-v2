const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
import { googleOAuthService } from './googleOAuthService';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: User;
  token?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

export interface ProfileUpdateData {
  name: string;
  email: string;
}

export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
}

export interface UserPreferences {
  dietaryRestrictions: string[];
  allergies: string[];
  favoriteCuisines: string[];
  dislikedCuisines: string[];
  cookingSkillLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  preferredMealTypes: string[];
  maxCookingTime: number;
  servingSize: number;
  emailNotifications: boolean;
  pushNotifications: boolean;
  weeklyRecipeEmails: boolean;
  recipeRecommendations: boolean;
  units: 'metric' | 'imperial';
  language: 'en' | 'es' | 'fr';
  theme: 'light' | 'dark' | 'system';
}

class AuthService {
  private token: string | null = null;

  constructor() {
    // Load token from localStorage on initialization
    this.token = localStorage.getItem('auth_token');
  }

  private async makeRequest(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<AuthResponse> {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      console.log('🔗 Making request to:', url);
      console.log('📡 API_BASE_URL:', API_BASE_URL);
      
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

      console.log('⚙️ Request config:', config);

      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ HTTP Error Response:', response.status, errorText);
        throw new Error(errorText || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Success response:', data);

      return data;
    } catch (error) {
      console.error('Auth service error:', error);
      console.error('Error type:', typeof error);
      console.error('Error name:', error instanceof Error ? error.name : 'Unknown');
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Network error occurred',
      };
    }
  }

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response = await this.makeRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.success && response.token) {
      this.setToken(response.token);
    }

    return response;
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await this.makeRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.success && response.token) {
      this.setToken(response.token);
    }

    return response;
  }

  async getCurrentUser(): Promise<AuthResponse> {
    if (!this.token) {
      return {
        success: false,
        message: 'No authentication token found',
      };
    }

    return await this.makeRequest('/api/auth/me');
  }

  logout(): void {
    this.token = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
  }

  private setToken(token: string): void {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  getToken(): string | null {
    return this.token;
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  // Utility method to check if token is expired (basic check)
  isTokenExpired(): boolean {
    if (!this.token) return true;

    try {
      const payload = JSON.parse(atob(this.token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      return true;
    }
  }

  async updateProfile(profileData: ProfileUpdateData): Promise<AuthResponse> {
    return await this.makeRequest('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async changePassword(passwordData: PasswordChangeData): Promise<AuthResponse> {
    return await this.makeRequest('/api/auth/password', {
      method: 'PUT',
      body: JSON.stringify(passwordData),
    });
  }

  async updatePreferences(preferences: UserPreferences): Promise<AuthResponse> {
    return await this.makeRequest('/api/auth/preferences', {
      method: 'PUT',
      body: JSON.stringify(preferences),
    });
  }

  async getPreferences(): Promise<AuthResponse & { preferences?: UserPreferences }> {
    return await this.makeRequest('/api/auth/preferences');
  }

  async uploadAvatar(file: File): Promise<AuthResponse & { avatarUrl?: string }> {
    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const url = `${API_BASE_URL}/api/auth/avatar`;
      console.log('🖼️ Uploading avatar to:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          ...(this.token && { Authorization: `Bearer ${this.token}` }),
        },
        body: formData,
        mode: 'cors',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Avatar upload failed:', response.status, errorText);
        throw new Error(errorText || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Avatar upload success:', data);
      return data;
    } catch (error) {
      console.error('Avatar upload error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Avatar upload failed',
      };
    }
  }

  async deleteAvatar(): Promise<AuthResponse> {
    return await this.makeRequest('/api/auth/avatar', {
      method: 'DELETE',
    });
  }

  /**
   * Sign in with Google OAuth
   */
  async loginWithGoogle(): Promise<AuthResponse> {
    try {
      const response = await googleOAuthService.signInWithGoogle();
      
      if (response.success && response.token) {
        this.setToken(response.token);
        return {
          success: true,
          user: response.user,
          token: response.token,
        };
      } else {
        return {
          success: false,
          message: response.message || 'Google authentication failed',
        };
      }
    } catch (error) {
      console.error('Google login error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Google authentication failed',
      };
    }
  }

  /**
   * Enhanced logout that also signs out from Google
   */
  async logoutWithGoogle(): Promise<void> {
    try {
      await googleOAuthService.signOut();
    } catch (error) {
      console.error('Google sign out error:', error);
    }
    
    // Call regular logout
    this.logout();
  }
}

// Export singleton instance
export const authService = new AuthService();