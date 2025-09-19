// Quick test to verify Google OAuth service is working
const { GoogleOAuthService } = require('./dist/services/googleOAuthService');

async function testGoogleOAuth() {
  try {
    console.log('🧪 Testing Google OAuth Service...');
    
    // Check if Google Client ID is configured
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.error('❌ GOOGLE_CLIENT_ID is not configured');
      process.exit(1);
    }
    
    console.log('✅ Google Client ID configured:', clientId.substring(0, 20) + '...');
    
    // Try to initialize the service
    const googleService = new GoogleOAuthService();
    console.log('✅ GoogleOAuthService initialized successfully');
    
    // Test with an invalid token (should fail gracefully)
    const result = await googleService.verifyIdToken('invalid-token');
    if (result === null) {
      console.log('✅ Invalid token handling works correctly');
    }
    
    console.log('🎉 Google OAuth service is ready for use!');
    console.log('📝 Next steps:');
    console.log('  1. Start the backend: npm run dev');
    console.log('  2. Start the frontend: npm run dev');
    console.log('  3. Test Google Sign-In in the browser');
    
  } catch (error) {
    console.error('❌ Error testing Google OAuth:', error.message);
    process.exit(1);
  }
}

// Load environment variables
require('dotenv').config();

testGoogleOAuth();