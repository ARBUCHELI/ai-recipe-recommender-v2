const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration - Allow frontend to access backend
app.use(cors({
  origin: [
    'http://localhost:8080',
    'http://127.0.0.1:8080',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    process.env.FRONTEND_URL || 'http://localhost:8080'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  preflightContinue: false,
  optionsSuccessStatus: 200
}));

// Request debugging middleware
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path} - Origin: ${req.headers.origin}`);
  next();
});

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'AI Recipe Recommender API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    googleOAuth: 'Ready'
  });
});

// Google OAuth endpoint
app.post('/api/auth/google/callback', async (req, res) => {
  try {
    const { idToken } = req.body;
    
    console.log('🔍 Google OAuth callback received');
    
    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: 'Google ID token is required'
      });
    }

    // Verify the ID token with Google's tokeninfo API
    const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
    
    if (!response.ok) {
      console.error('Failed to verify Google ID token:', response.status);
      return res.status(400).json({
        success: false,
        message: 'Invalid Google ID token'
      });
    }

    const payload = await response.json();
    
    // Verify the token is for our client ID
    if (payload.aud !== process.env.GOOGLE_CLIENT_ID) {
      console.error('Google ID token audience mismatch');
      return res.status(400).json({
        success: false,
        message: 'Invalid token audience'
      });
    }

    // Ensure email is verified
    if (!payload.email_verified || payload.email_verified !== 'true') {
      console.error('Google email is not verified');
      return res.status(400).json({
        success: false,
        message: 'Email not verified'
      });
    }

    // Check if token is expired
    if (payload.exp && parseInt(payload.exp) < Math.floor(Date.now() / 1000)) {
      console.error('Google ID token is expired');
      return res.status(400).json({
        success: false,
        message: 'Token expired'
      });
    }

    console.log('✅ Google OAuth verification successful for:', payload.email);

    // For now, return a mock response since we don't have database setup
    // In production, you would save the user to database and generate JWT
    res.status(200).json({
      success: true,
      message: 'Google authentication successful',
      user: {
        id: `google-${payload.sub}`,
        name: payload.name,
        email: payload.email,
        avatarUrl: payload.picture,
        createdAt: new Date().toISOString()
      },
      token: `mock-jwt-token-${Date.now()}` // Replace with real JWT generation
    });
  } catch (error) {
    console.error('Google OAuth error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Mock auth endpoints for testing
app.post('/api/auth/login', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Mock login endpoint',
    note: 'Replace with real authentication'
  });
});

app.post('/api/auth/register', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Mock register endpoint',
    note: 'Replace with real authentication'
  });
});

app.get('/api/auth/me', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Mock me endpoint',
    note: 'Replace with real authentication'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 AI Recipe Recommender API server running on port ${PORT}`);
  console.log(`📱 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:8080'}`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔑 Google Client ID: ${process.env.GOOGLE_CLIENT_ID ? 'Configured' : 'Not configured'}`);
  console.log(`✅ Google OAuth endpoint ready: POST /api/auth/google/callback`);
});

module.exports = app;