const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export interface GoogleOAuthResponse {
  success: boolean;
  message?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
    createdAt: string;
  };
  token?: string;
}

class GoogleOAuthService {
  private static instance: GoogleOAuthService;

  public static getInstance(): GoogleOAuthService {
    if (!GoogleOAuthService.instance) {
      GoogleOAuthService.instance = new GoogleOAuthService();
    }
    return GoogleOAuthService.instance;
  }

  /**
   * Initialize Google OAuth by loading the Google Identity Services script
   */
  async initializeGoogleOAuth(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if Google Identity Services is already loaded
      if (window.google) {
        resolve();
        return;
      }

      // Create and load the Google Identity Services script
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        if (window.google) {
          resolve();
        } else {
          reject(new Error('Google Identity Services failed to load'));
        }
      };

      script.onerror = () => {
        reject(new Error('Failed to load Google Identity Services script'));
      };

      document.head.appendChild(script);
    });
  }

  /**
   * Initiate Google OAuth sign-in flow
   */
  async signInWithGoogle(): Promise<GoogleOAuthResponse> {
    try {
      if (!GOOGLE_CLIENT_ID) {
        console.warn('Google Client ID is not configured. Please add VITE_GOOGLE_CLIENT_ID to your .env file.');
        return {
          success: false,
          message: 'Google Sign-In is not configured. Please contact the administrator.',
        };
      }

      await this.initializeGoogleOAuth();

      return new Promise((resolve, reject) => {
        if (!window.google?.accounts?.id) {
          reject(new Error('Google ID Services not available'));
          return;
        }

        // Create a temporary div for the Google Sign-In button
        const tempDiv = document.createElement('div');
        tempDiv.style.position = 'fixed';
        tempDiv.style.top = '-1000px';
        tempDiv.style.left = '-1000px';
        tempDiv.style.visibility = 'hidden';
        document.body.appendChild(tempDiv);

        // Initialize Google ID Services
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: async (response: any) => {
            try {
              // Clean up the temporary div
              document.body.removeChild(tempDiv);
              
              if (response.error) {
                reject(new Error(response.error_description || response.error));
                return;
              }

              // Send the ID token to the backend for verification
              const authResult = await this.verifyIdTokenWithBackend(response.credential);
              resolve(authResult);
            } catch (error) {
              reject(error);
            }
          },
        });

        // Skip One Tap for development - go directly to popup flow
        try {
          window.google.accounts.id.renderButton(tempDiv, {
            theme: 'outline',
            size: 'large',
            text: 'signin_with',
            width: '250'
          });
          
          // Automatically trigger the popup
          setTimeout(() => {
            const button = tempDiv.querySelector('div[role="button"]') as HTMLElement;
            if (button) {
              button.click();
            } else {
              document.body.removeChild(tempDiv);
              reject(new Error('Google Sign-In button could not be rendered'));
            }
          }, 100);
        } catch (error) {
          document.body.removeChild(tempDiv);
          reject(new Error('Failed to initialize Google Sign-In'));
        }
      });
    } catch (error) {
      console.error('Google OAuth error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Google OAuth failed',
      };
    }
  }

  /**
   * Verify ID token with backend
   */
  private async verifyIdTokenWithBackend(idToken: string): Promise<GoogleOAuthResponse> {
    try {
      console.log('🔄 Verifying Google ID token with backend...');
      
      const response = await fetch(`${API_BASE_URL}/api/auth/google/callback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          idToken: idToken,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Google authentication successful:', data);
      return data;
    } catch (error) {
      console.error('ID token verification error:', error);
      
      // Check if it's a network/connection error
      if (error instanceof Error && (error.message.includes('fetch') || error.message.includes('NetworkError'))) {
        return {
          success: false,
          message: 'Unable to connect to authentication server. Please ensure the backend is running.',
        };
      }
      
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Authentication failed. Please try again.',
      };
    }
  }

  /**
   * Sign out from Google OAuth
   */
  async signOut(): Promise<void> {
    try {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.disableAutoSelect();
      }
    } catch (error) {
      console.error('Google sign out error:', error);
    }
  }

}

// Google Identity Services types
declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          initialize: (config: any) => void;
          prompt: (callback?: (notification: any) => void) => void;
          renderButton: (parent: HTMLElement, options: any) => void;
          disableAutoSelect: () => void;
        };
        oauth2?: {
          initCodeClient: (config: any) => {
            requestCode: () => void;
          };
        };
      };
    };
  }
}

export const googleOAuthService = GoogleOAuthService.getInstance();