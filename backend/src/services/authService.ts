import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { GoogleOAuthService } from './googleOAuthService';

const prisma = new PrismaClient();
const googleOAuthService = new GoogleOAuthService();

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface AuthResponse {
  success: boolean;
  user?: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
    createdAt: Date;
  };
  token?: string;
  message?: string;
}

export class AuthService {
  private generateToken(userId: string, email: string): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not defined');
    }

    return jwt.sign(
      { id: userId, email },
      secret as jwt.Secret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions
    );
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const { name, email, password } = data;

      // Validation
      if (!name || !email || !password) {
        return {
          success: false,
          message: 'Name, email, and password are required'
        };
      }

      if (password.length < 6) {
        return {
          success: false,
          message: 'Password must be at least 6 characters long'
        };
      }

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        return {
          success: false,
          message: 'User with this email already exists'
        };
      }

      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create user
      const user = await prisma.user.create({
        data: {
          name,
          email: email.toLowerCase(),
          password: hashedPassword
        },
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
          createdAt: true
        }
      });

      // Generate token
      const token = this.generateToken(user.id, user.email);

      return {
        success: true,
        user,
        token
      };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: 'An error occurred during registration'
      };
    }
  }

  async login(data: LoginData): Promise<AuthResponse> {
    try {
      const { email, password } = data;

      // Validation
      if (!email || !password) {
        return {
          success: false,
          message: 'Email and password are required'
        };
      }

      // Find user
      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() }
      });

      if (!user) {
        return {
          success: false,
          message: 'Invalid email or password'
        };
      }

      // Check if user has a password (some users might only have Google OAuth)
      if (!user.password) {
        return {
          success: false,
          message: 'Please sign in with Google or reset your password'
        };
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return {
          success: false,
          message: 'Invalid email or password'
        };
      }

      // Generate token
      const token = this.generateToken(user.id, user.email);

      return {
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          avatarUrl: user.avatarUrl,
          createdAt: user.createdAt
        },
        token
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'An error occurred during login'
      };
    }
  }

  async getCurrentUser(userId: string): Promise<AuthResponse> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
          createdAt: true
        }
      });

      if (!user) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      return {
        success: true,
        user
      };
    } catch (error) {
      console.error('Get current user error:', error);
      return {
        success: false,
        message: 'An error occurred while fetching user data'
      };
    }
  }

  async googleOAuth(idToken: string): Promise<AuthResponse> {
    try {
      // Use Google OAuth service to authenticate
      const googleResult = await googleOAuthService.authenticateWithGoogle(idToken);
      
      if (!googleResult.success || !googleResult.user) {
        return {
          success: false,
          message: googleResult.message || 'Google authentication failed'
        };
      }

      // Generate JWT token for the authenticated user
      const token = this.generateToken(googleResult.user.id, googleResult.user.email);

      return {
        success: true,
        user: googleResult.user,
        token
      };
    } catch (error) {
      console.error('Google OAuth error:', error);
      return {
        success: false,
        message: 'An error occurred during Google authentication'
      };
    }
  }
}
