# Google OAuth Backend Implementation Guide

This guide provides the complete backend implementation needed to support Google OAuth in your NutriAgent application.

## Required Dependencies

Add these to your backend `package.json`:

```bash
npm install googleapis google-auth-library jsonwebtoken bcryptjs
npm install -D @types/jsonwebtoken @types/bcryptjs
```

## Environment Variables

Add these to your backend `.env`:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3001/api/auth/google/callback

# JWT Configuration
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRES_IN=7d
```

## Database Schema Updates

Add these fields to your User model in `prisma/schema.prisma`:

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  avatarUrl String?
  
  // OAuth fields
  googleId  String?  @unique
  provider  String?  @default("email") // "email" | "google"
  
  // Password field - make optional for OAuth users
  password  String?
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@map("users")
}
```

Run the migration:
```bash
npx prisma db push
```

## Backend API Routes

### 1. Google OAuth Callback Route

```typescript
// routes/auth.ts
import express from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

const googleClient = new OAuth2Client({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: process.env.GOOGLE_REDIRECT_URI,
});

// Google OAuth callback endpoint
router.post('/google/callback', async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Authorization code is required',
      });
    }

    // Exchange authorization code for tokens
    const { tokens } = await googleClient.getToken(code);
    googleClient.setCredentials(tokens);

    // Verify and decode the ID token
    const ticket = await googleClient.verifyIdToken({
      idToken: tokens.id_token!,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Google token',
      });
    }

    const { sub: googleId, email, name, picture } = payload;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    // Check if user exists
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { googleId },
        ],
      },
    });

    if (user) {
      // Update existing user
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          googleId,
          name: name || user.name,
          avatarUrl: picture || user.avatarUrl,
          provider: 'google',
        },
      });
    } else {
      // Create new user
      user = await prisma.user.create({
        data: {
          email,
          name: name || 'Google User',
          googleId,
          avatarUrl: picture,
          provider: 'google',
        },
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id,
        email: user.email,
      },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt.toISOString(),
      },
      token,
    });

  } catch (error) {
    console.error('Google OAuth error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication failed',
    });
  }
});

export default router;
```

### 2. Enhanced Authentication Middleware

```typescript
// middleware/auth.ts
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { Request, Response, NextFunction } from 'express';

const prisma = new PrismaClient();

interface AuthRequest extends Request {
  user?: any;
}

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    // Fetch user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(403).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }
};
```

### 3. Enhanced User Registration/Login

Update your existing auth routes to handle both email and Google authentication:

```typescript
// routes/auth.ts (additional routes)

// Enhanced user registration
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists with this email
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists',
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        provider: 'email',
      },
    });

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt.toISOString(),
      },
      token,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
    });
  }
});

// Enhanced user login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check if user registered with Google
    if (user.provider === 'google' && !user.password) {
      return res.status(400).json({
        success: false,
        message: 'This account uses Google sign-in. Please sign in with Google.',
      });
    }

    // Verify password
    if (!user.password || !await bcrypt.compare(password, user.password)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt.toISOString(),
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
    });
  }
});
```

## Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing project
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Configure the OAuth consent screen
6. Set authorized origins:
   - `http://localhost:3000` (frontend)
   - `http://localhost:8080` (frontend dev server)
7. Set authorized redirect URIs:
   - `http://localhost:3001/api/auth/google/callback`
8. Copy the Client ID and Client Secret to your environment variables

## Security Best Practices

1. **Validate tokens server-side**: Always verify Google ID tokens on your backend
2. **Use HTTPS in production**: Set up SSL certificates for production
3. **Secure JWT secrets**: Use strong, random JWT secret keys
4. **Token expiration**: Set appropriate token expiration times
5. **Rate limiting**: Implement rate limiting on auth endpoints
6. **CORS configuration**: Configure CORS properly for your frontend domain

## Testing the Implementation

1. Set up your Google OAuth credentials
2. Add the environment variables
3. Run database migrations
4. Start your backend server
5. Test the Google sign-in flow in your frontend

The frontend Google OAuth integration is now complete and will work with this backend implementation.