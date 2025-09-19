import React, { createContext, useContext, useEffect, useReducer, ReactNode } from 'react';
import { authService, User } from '@/services/authService';
import { recipeService } from '@/services/recipeService';
import { ingredientService } from '@/services/ingredientService';
import { analyticsService } from '@/services/analyticsService';
import { LocalStorageService } from '@/utils/localStorage';
import { useToast } from '@/hooks/use-toast';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: User }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'CLEAR_ERROR' };

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
  refreshUser: () => Promise<void>;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'AUTH_ERROR':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'AUTH_LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const { toast } = useToast();

  // Check authentication status on app load
  useEffect(() => {
    const initializeAuth = async () => {
      if (authService.isAuthenticated() && !authService.isTokenExpired()) {
        try {
          dispatch({ type: 'AUTH_START' });
          const response = await authService.getCurrentUser();
          
          if (response.success && response.user) {
            dispatch({ type: 'AUTH_SUCCESS', payload: response.user });
            // Set user context for all services
            LocalStorageService.setCurrentUser(response.user.id);
            recipeService.updateToken(authService.getToken());
            ingredientService.updateToken(authService.getToken());
            analyticsService.updateToken(authService.getToken());
          } else {
            authService.logout();
            LocalStorageService.clearUserData();
            dispatch({ type: 'AUTH_LOGOUT' });
          }
        } catch (error) {
          authService.logout();
          dispatch({ type: 'AUTH_LOGOUT' });
        }
      } else {
        authService.logout();
        LocalStorageService.clearUserData();
        dispatch({ type: 'AUTH_LOGOUT' });
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      dispatch({ type: 'AUTH_START' });
      
      const response = await authService.login({ email, password });
      
      if (response.success && response.user) {
        dispatch({ type: 'AUTH_SUCCESS', payload: response.user });
        
        // Set user context for all services
        LocalStorageService.setCurrentUser(response.user.id);
        recipeService.updateToken(authService.getToken());
        ingredientService.updateToken(authService.getToken());
        analyticsService.updateToken(authService.getToken());
        
        toast({
          title: "Welcome back! 👋",
          description: `Hello ${response.user.name}, you're successfully signed in.`,
        });
        
        return true;
      } else {
        dispatch({ type: 'AUTH_ERROR', payload: response.message || 'Login failed' });
        
        toast({
          title: "Sign In Failed",
          description: response.message || 'Please check your credentials and try again.',
          variant: "destructive"
        });
        
        return false;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unexpected error occurred';
      dispatch({ type: 'AUTH_ERROR', payload: message });
      
      toast({
        title: "Sign In Error",
        description: message,
        variant: "destructive"
      });
      
      return false;
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      dispatch({ type: 'AUTH_START' });
      
      const response = await authService.register({ name, email, password });
      
      if (response.success && response.user) {
        dispatch({ type: 'AUTH_SUCCESS', payload: response.user });
        
        // Set user context for all services
        LocalStorageService.setCurrentUser(response.user.id);
        recipeService.updateToken(authService.getToken());
        ingredientService.updateToken(authService.getToken());
        analyticsService.updateToken(authService.getToken());
        
        toast({
          title: "Welcome to NutriAgent! 🎉",
          description: `Hi ${response.user.name}! Your account has been created successfully.`,
        });
        
        return true;
      } else {
        dispatch({ type: 'AUTH_ERROR', payload: response.message || 'Registration failed' });
        
        toast({
          title: "Registration Failed",
          description: response.message || 'Please check your information and try again.',
          variant: "destructive"
        });
        
        return false;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unexpected error occurred';
      dispatch({ type: 'AUTH_ERROR', payload: message });
      
      toast({
        title: "Registration Error",
        description: message,
        variant: "destructive"
      });
      
      return false;
    }
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    try {
      dispatch({ type: 'AUTH_START' });
      
      const response = await authService.loginWithGoogle();
      
      if (response.success && response.user) {
        dispatch({ type: 'AUTH_SUCCESS', payload: response.user });
        
        // Set user context for all services
        LocalStorageService.setCurrentUser(response.user.id);
        recipeService.updateToken(authService.getToken());
        ingredientService.updateToken(authService.getToken());
        analyticsService.updateToken(authService.getToken());
        
        toast({
          title: "Welcome! 🎉",
          description: `Hello ${response.user.name}, you're successfully signed in with Google.`,
        });
        
        return true;
      } else {
        dispatch({ type: 'AUTH_ERROR', payload: response.message || 'Google login failed' });
        
        toast({
          title: "Google Sign In Failed",
          description: response.message || 'Please try again.',
          variant: "destructive"
        });
        
        return false;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Google sign in failed';
      dispatch({ type: 'AUTH_ERROR', payload: message });
      
      toast({
        title: "Google Sign In Error",
        description: message,
        variant: "destructive"
      });
      
      return false;
    }
  };

  const logout = () => {
    const currentUserId = state.user?.id;
    
    authService.logout();
    
    // Clear user-specific data
    if (currentUserId) {
      LocalStorageService.clearUserData(currentUserId);
    }
    
    // Reset service tokens
    recipeService.updateToken(null);
    ingredientService.updateToken(null);
    analyticsService.updateToken(null);
    
    dispatch({ type: 'AUTH_LOGOUT' });
    
    toast({
      title: "Signed Out",
      description: "You've been successfully signed out. See you soon!",
    });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const refreshUser = async () => {
    if (authService.isAuthenticated()) {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        const response = await authService.getCurrentUser();
        
        if (response.success && response.user) {
          dispatch({ type: 'AUTH_SUCCESS', payload: response.user });
          // Update services with current user context
          LocalStorageService.setCurrentUser(response.user.id);
          recipeService.updateToken(authService.getToken());
          ingredientService.updateToken(authService.getToken());
          analyticsService.updateToken(authService.getToken());
        } else {
          logout();
        }
      } catch (error) {
        logout();
      }
    }
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    loginWithGoogle,
    logout,
    clearError,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};