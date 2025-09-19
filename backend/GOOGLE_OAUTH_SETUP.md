# Google OAuth Integration Setup Guide

This guide will walk you through setting up Google OAuth authentication for your NutriAgent app backend.

## ✅ What's Already Done

The backend has been fully configured with Google OAuth integration:

### 🗄️ Database Schema
- Updated `User` model with `googleId` field (unique)
- Made `password` field optional for Google OAuth users
- Database has been migrated and synced

### 🔧 Backend Services
- **GoogleOAuthService**: Handles Google ID token verification and user creation/authentication
- **AuthService**: Extended with `googleOAuth()` method
- **AuthController**: Added `googleCallback()` method for handling OAuth flow
- **Routes**: Added `POST /api/auth/google/callback` endpoint

### 📦 Dependencies
- Installed `google-auth-library` for secure ID token verification

## 🚀 Setup Steps

### 1. Create Google OAuth Credentials

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Create or select a project**
3. **Enable Google Identity API**:
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API" and enable it
   - Also enable "Google Identity" if available

4. **Create OAuth 2.0 Credentials**:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client ID"
   - Choose "Web application"
   - Add these **Authorized origins**:
     ```
     http://localhost:3000
     https://yourdomain.com (for production)
     ```
   - **Authorized redirect URIs** (optional, not needed for ID token flow):
     ```
     http://localhost:3000/auth/callback
     https://yourdomain.com/auth/callback
     ```

5. **Save your credentials**:
   - Copy the **Client ID** and **Client Secret**

### 2. Configure Backend Environment Variables

Create a `.env` file in the backend root directory:

```bash
# Copy from .env.example and fill in your values
cp .env.example .env
```

Update your `.env` file:

```env
# Database Configuration
DATABASE_URL="file:./dev.db"

# JWT Configuration (use a secure secret in production)
JWT_SECRET="your-very-secure-jwt-secret-key-here-make-it-long-and-random"
JWT_EXPIRES_IN="7d"

# Google OAuth Configuration
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Server Configuration
PORT=5000
NODE_ENV="development"

# CORS Configuration
FRONTEND_URL="http://localhost:3000"
```

### 3. Configure Frontend Environment Variables

Update your frontend `.env` file with the same Google Client ID:

```env
VITE_API_BASE_URL="http://localhost:5000"
VITE_GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
```

## 🔒 Security Best Practices

### Production Security
1. **Use HTTPS in production** - Google OAuth requires HTTPS for production
2. **Secure JWT Secret** - Use a long, random secret key
3. **Environment Variables** - Never commit `.env` files to version control
4. **CORS Configuration** - Restrict CORS origins to your domain only

### Google Cloud Console Security
1. **Restrict Client ID** - Add only necessary origins and redirect URIs
2. **Enable API restrictions** if needed
3. **Set up monitoring** for OAuth usage

## 🧪 Testing the Integration

### 1. Start the Backend
```bash
cd backend
npm run dev  # or your start command
```

### 2. Start the Frontend
```bash
cd frontend
npm run dev
```

### 3. Test Google OAuth Flow
1. Click "Sign in with Google" button
2. Complete Google authentication
3. Verify user is created in database
4. Check JWT token is received and stored

## 📊 API Endpoints

### Google OAuth Callback
```http
POST /api/auth/google/callback
Content-Type: application/json

{
  "idToken": "google-id-token-from-frontend"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Google authentication successful",
  "user": {
    "id": "user-id",
    "name": "User Name",
    "email": "user@example.com",
    "avatarUrl": "https://profile-pic-url",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "token": "jwt-token"
}
```

## 🔧 How It Works

### Flow Overview
1. **Frontend** initiates Google OAuth using Google Identity Services
2. **Google** returns an ID token to the frontend
3. **Frontend** sends ID token to backend `/api/auth/google/callback`
4. **Backend** verifies ID token with Google using `google-auth-library`
5. **Backend** creates or updates user in database
6. **Backend** generates JWT and returns user data
7. **Frontend** stores JWT and user data

### Account Linking
- If a user already exists with the same email, their account is automatically linked with Google OAuth
- Existing users can seamlessly sign in with Google after setup

## 🐛 Troubleshooting

### Common Issues

1. **"Google Client ID not configured"**
   - Ensure `GOOGLE_CLIENT_ID` is set in both frontend and backend `.env` files

2. **"Invalid Google ID token"**
   - Check that the Client ID matches between frontend and backend
   - Ensure the token is being sent correctly from frontend

3. **CORS errors**
   - Make sure your frontend URL is added to Google Cloud Console authorized origins
   - Check CORS configuration in your backend

4. **Database errors**
   - Run `npx prisma generate` and `npx prisma db push` in backend directory

### Debugging
- Check browser console for frontend errors
- Check backend console for authentication errors
- Use `console.log` statements in GoogleOAuthService for debugging

## 📝 Migration Notes

### From Demo Mode
- The frontend was already set up with demo Google OAuth
- Simply replace the demo Client ID with your real one
- Backend integration handles real authentication now

### Database Migration
- The database schema has been updated automatically
- New fields: `User.googleId` (optional, unique) and `User.password` (now optional)
- Existing users are unaffected

## 🚀 Production Deployment

### Environment Setup
1. Set up production Google OAuth credentials with your production domain
2. Update environment variables for production
3. Ensure HTTPS is configured
4. Update CORS settings for production domain

### Security Checklist
- [ ] HTTPS enabled
- [ ] Secure JWT secret
- [ ] CORS restricted to production domain
- [ ] Google OAuth restricted to production domain
- [ ] Environment variables secured
- [ ] Database secured

## 🎉 You're Done!

Your Google OAuth integration is now complete! Users can now:
- Sign up with Google
- Sign in with existing Google accounts
- Link Google accounts to existing email/password accounts
- Enjoy seamless authentication across your app

The integration maintains backward compatibility with existing email/password authentication while adding the convenience of Google OAuth.