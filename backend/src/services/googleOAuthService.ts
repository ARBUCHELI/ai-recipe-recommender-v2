import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
// Use the global fetch in Node.js 18+, otherwise we'd need node-fetch

const prisma = new PrismaClient();

interface GoogleTokenPayload {
  sub: string; // Google user ID
  email: string;
  name: string;
  picture?: string;
  email_verified: boolean;
  iss: string;
  aud: string;
}

interface GoogleOAuthResponse {
  success: boolean;
  user?: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
    createdAt: Date;
  };
  isNewUser?: boolean;
  message?: string;
}

export class GoogleOAuthService {
  private clientId: string;

  constructor() {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      throw new Error('GOOGLE_CLIENT_ID is not defined in environment variables');
    }
    this.clientId = clientId;
  }

  /**
   * Verify Google ID token and extract user information
   * Uses Google's tokeninfo API for validation
   */
  async verifyIdToken(idToken: string): Promise<GoogleTokenPayload | null> {
    try {
      // Use Google's tokeninfo API to validate the token
      const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
      
      if (!response.ok) {
        console.error('Failed to verify Google ID token:', response.status);
        return null;
      }

      const payload = await response.json();
      
      // Verify the token is for our client ID
      if (payload.aud !== this.clientId) {
        console.error('Google ID token audience mismatch');
        return null;
      }

      // Ensure email is verified
      if (!payload.email_verified || payload.email_verified !== 'true') {
        console.error('Google email is not verified');
        return null;
      }

      // Check if token is expired
      if (payload.exp && parseInt(payload.exp) < Math.floor(Date.now() / 1000)) {
        console.error('Google ID token is expired');
        return null;
      }

      return {
        sub: payload.sub,
        email: payload.email,
        name: payload.name || payload.email,
        picture: payload.picture,
        email_verified: payload.email_verified === 'true',
        iss: payload.iss,
        aud: payload.aud
      };
    } catch (error) {
      console.error('Error verifying Google ID token:', error);
      return null;
    }
  }

  /**
   * Authenticate or create user with Google OAuth
   */
  async authenticateWithGoogle(idToken: string): Promise<GoogleOAuthResponse> {
    try {
      // Verify the ID token
      const googleUser = await this.verifyIdToken(idToken);
      if (!googleUser) {
        return {
          success: false,
          message: 'Invalid Google ID token',
        };
      }

      // Check if user exists with this Google ID
      let user = await prisma.user.findUnique({
        where: { googleId: googleUser.sub },
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
          createdAt: true,
        },
      });

      let isNewUser = false;

      if (!user) {
        // Check if user exists with this email (for account linking)
        const existingUser = await prisma.user.findUnique({
          where: { email: googleUser.email.toLowerCase() },
        });

        if (existingUser) {
          // Link Google account to existing user
          user = await prisma.user.update({
            where: { id: existingUser.id },
            data: {
              googleId: googleUser.sub,
              // Update avatar if user doesn't have one and Google provides one
              avatarUrl: existingUser.avatarUrl || googleUser.picture || null,
            },
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
              createdAt: true,
            },
          });
        } else {
          // Create new user with Google OAuth
          user = await prisma.user.create({
            data: {
              name: googleUser.name,
              email: googleUser.email.toLowerCase(),
              googleId: googleUser.sub,
              avatarUrl: googleUser.picture || null,
              // No password needed for Google OAuth users
            },
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
              createdAt: true,
            },
          });
          isNewUser = true;
        }
      }

      return {
        success: true,
        user,
        isNewUser,
      };
    } catch (error) {
      console.error('Google OAuth authentication error:', error);
      return {
        success: false,
        message: 'An error occurred during Google authentication',
      };
    }
  }

  /**
   * Update user avatar from Google profile picture
   */
  async updateUserAvatarFromGoogle(userId: string, googleId: string): Promise<boolean> {
    try {
      // This would typically be called periodically to update user avatars
      // For now, we'll just return true as avatar is updated during authentication
      return true;
    } catch (error) {
      console.error('Error updating user avatar from Google:', error);
      return false;
    }
  }
}