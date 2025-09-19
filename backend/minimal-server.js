const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env file
try {
  const envFile = fs.readFileSync('.env', 'utf8');
  const envLines = envFile.split('\n');
  envLines.forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      const value = valueParts.join('=').replace(/"/g, '');
      process.env[key.trim()] = value.trim();
    }
  });
} catch (error) {
  console.log('No .env file found, using system environment variables');
}

const PORT = process.env.PORT || 3001;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

// Helper function to parse JSON body
function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(error);
      }
    });
  });
}

// Helper function to send JSON response
function sendJsonResponse(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(JSON.stringify(data));
}

// Create HTTP server
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const method = req.method;
  const pathname = parsedUrl.pathname;

  console.log(`📨 ${method} ${pathname} - Origin: ${req.headers.origin}`);

  // Handle CORS preflight requests
  if (method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    res.end();
    return;
  }

  // Health check endpoint
  if (pathname === '/health' && method === 'GET') {
    sendJsonResponse(res, 200, {
      status: 'OK',
      message: 'AI Recipe Recommender API is running',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      googleOAuth: 'Ready',
      googleClientId: GOOGLE_CLIENT_ID ? 'Configured' : 'Not configured'
    });
    return;
  }

  // Google OAuth callback endpoint
  if (pathname === '/api/auth/google/callback' && method === 'POST') {
    try {
      const body = await parseJsonBody(req);
      const { idToken } = body;

      console.log('🔍 Google OAuth callback received');

      if (!idToken) {
        sendJsonResponse(res, 400, {
          success: false,
          message: 'Google ID token is required'
        });
        return;
      }

      // Verify the ID token with Google's tokeninfo API
      const tokeninfoUrl = `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`;
      
      // Use Node.js built-in fetch (available in Node 18+)
      const response = await fetch(tokeninfoUrl);

      if (!response.ok) {
        console.error('Failed to verify Google ID token:', response.status);
        sendJsonResponse(res, 400, {
          success: false,
          message: 'Invalid Google ID token'
        });
        return;
      }

      const payload = await response.json();

      // Verify the token is for our client ID
      if (payload.aud !== GOOGLE_CLIENT_ID) {
        console.error('Google ID token audience mismatch');
        console.error('Expected:', GOOGLE_CLIENT_ID);
        console.error('Received:', payload.aud);
        sendJsonResponse(res, 400, {
          success: false,
          message: 'Invalid token audience'
        });
        return;
      }

      // Ensure email is verified
      if (!payload.email_verified || payload.email_verified !== 'true') {
        console.error('Google email is not verified');
        sendJsonResponse(res, 400, {
          success: false,
          message: 'Email not verified'
        });
        return;
      }

      // Check if token is expired
      if (payload.exp && parseInt(payload.exp) < Math.floor(Date.now() / 1000)) {
        console.error('Google ID token is expired');
        sendJsonResponse(res, 400, {
          success: false,
          message: 'Token expired'
        });
        return;
      }

      console.log('✅ Google OAuth verification successful for:', payload.email);

      // Return successful response with user data
      sendJsonResponse(res, 200, {
        success: true,
        message: 'Google authentication successful',
        user: {
          id: `google-${payload.sub}`,
          name: payload.name,
          email: payload.email,
          avatarUrl: payload.picture,
          createdAt: new Date().toISOString()
        },
        token: `mock-jwt-token-${Date.now()}` // In production, generate real JWT
      });

    } catch (error) {
      console.error('Google OAuth error:', error);
      sendJsonResponse(res, 500, {
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
    return;
  }

  // Mock auth endpoints for compatibility
  if (pathname === '/api/auth/login' && method === 'POST') {
    sendJsonResponse(res, 200, {
      success: true,
      message: 'Mock login endpoint - replace with real authentication'
    });
    return;
  }

  if (pathname === '/api/auth/register' && method === 'POST') {
    sendJsonResponse(res, 200, {
      success: true,
      message: 'Mock register endpoint - replace with real authentication'
    });
    return;
  }

  if (pathname === '/api/auth/me' && method === 'GET') {
    sendJsonResponse(res, 200, {
      success: true,
      message: 'Mock me endpoint - replace with real authentication'
    });
    return;
  }

  // 404 for all other routes
  sendJsonResponse(res, 404, {
    success: false,
    message: 'Endpoint not found'
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`🚀 AI Recipe Recommender API server running on port ${PORT}`);
  console.log(`📱 Frontend URL: http://localhost:8080`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔑 Google Client ID: ${GOOGLE_CLIENT_ID ? 'Configured' : 'Not configured'}`);
  console.log(`✅ Google OAuth endpoint ready: POST /api/auth/google/callback`);
  console.log(`🔍 Health check: http://localhost:${PORT}/health`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  server.close(() => {
    console.log('✅ Server shut down gracefully');
    process.exit(0);
  });
});