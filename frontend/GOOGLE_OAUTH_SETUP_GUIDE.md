# Google OAuth Setup Guide - Complete Implementation

This guide will walk you through getting real Google OAuth credentials and implementing the backend for your NutriAgent application.

## 🔑 Step 1: Get Google OAuth Credentials (FREE)

### **1.1 Go to Google Cloud Console**
1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account
3. Accept terms if this is your first time

### **1.2 Create or Select a Project**
1. Click the project dropdown (top-left, next to "Google Cloud")
2. Click **"NEW PROJECT"**
3. Enter project name: `nutriagent-oauth` (or your preferred name)
4. Click **"CREATE"**
5. Wait for project creation, then select it

### **1.3 Enable Google+ API**
1. In the search bar, type **"Google+ API"** 
2. Click on **"Google+ API"** result
3. Click **"ENABLE"** button
4. Wait for it to enable

### **1.4 Configure OAuth Consent Screen**
1. Go to **"APIs & Services"** → **"OAuth consent screen"**
2. Select **"External"** (unless you have Google Workspace)
3. Click **"CREATE"**

**Fill out the form:**
- **App name**: `NutriAgent`
- **User support email**: Your email
- **App logo**: Upload your app icon (optional)
- **App domain**: Leave blank for now
- **Developer contact**: Your email
4. Click **"SAVE AND CONTINUE"**
5. **Scopes page**: Click **"SAVE AND CONTINUE"** (no changes needed)
6. **Test users page**: Click **"SAVE AND CONTINUE"**
7. **Summary page**: Click **"BACK TO DASHBOARD"**

### **1.5 Create OAuth 2.0 Credentials**
1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"+ CREATE CREDENTIALS"** → **"OAuth 2.0 Client ID"**
3. Select **"Web application"**
4. **Name**: `NutriAgent Web Client`

**Configure URLs:**

**Authorized JavaScript origins:**
```
http://localhost:3000
http://localhost:8080
```

**Authorized redirect URIs:**
```
http://localhost:3001/api/auth/google/callback
```

5. Click **"CREATE"**

### **1.6 Copy Your Credentials**
You'll see a modal with:
- **Client ID**: `123456789012-abcdefghijklmnop.apps.googleusercontent.com`
- **Client Secret**: `GOCSPX-abcdefghijk_lmnopqrst`

**✅ SAVE THESE - you'll need them in the next steps!**

## 🖥️ Step 2: Update Frontend Configuration

### **2.1 Update Your .env File**
Replace the demo client ID with your real one:

```env
# Replace this line in your .env file
VITE_GOOGLE_CLIENT_ID=your-real-client-id.apps.googleusercontent.com
```

Example:
```env
VITE_GOOGLE_CLIENT_ID=123456789012-abcdefghijklmnop.apps.googleusercontent.com
```

## 🔧 Step 3: Backend Implementation

### **3.1 Do You Have a Backend Server?**

**If YES** - I'll help you add Google OAuth to it
**If NO** - I'll help you create a simple Express.js backend

**Which applies to you?** Let me know and I'll provide the specific implementation.

### **3.2 Backend Dependencies**
Your backend will need these packages:
```bash
npm install googleapis google-auth-library jsonwebtoken bcryptjs cors express
npm install -D @types/jsonwebtoken @types/bcryptjs @types/cors
```

### **3.3 Backend Environment Variables**
Your backend `.env` should have:
```env
# Google OAuth (use the credentials from Step 1.6)
GOOGLE_CLIENT_ID=your-real-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-real-client-secret

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# Database (if using one)
DATABASE_URL=your-database-connection-string
```

## 🛠️ Step 4: Backend Code Implementation

I already created the complete backend implementation in `GOOGLE_OAUTH_BACKEND_GUIDE.md`, but here's a quick overview:

### **4.1 Main Auth Route**
```javascript
// POST /api/auth/google/callback
app.post('/api/auth/google/callback', async (req, res) => {
  // 1. Get authorization code from frontend
  // 2. Exchange code for Google tokens
  // 3. Verify Google ID token
  // 4. Create/update user in database
  // 5. Generate JWT token
  // 6. Return user data and JWT
});
```

### **4.2 Database Schema**
Add these fields to your User model:
```sql
-- If using PostgreSQL/MySQL
ALTER TABLE users ADD COLUMN google_id VARCHAR(255) UNIQUE;
ALTER TABLE users ADD COLUMN provider VARCHAR(50) DEFAULT 'email';
ALTER TABLE users ALTER COLUMN password DROP NOT NULL; -- Make optional
```

## 🔐 Step 5: Security Configuration

### **5.1 CORS Setup**
Your backend needs to allow requests from your frontend:
```javascript
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:8080'],
  credentials: true
}));
```

### **5.2 Environment Security**
- ✅ **Never commit** `.env` files
- ✅ **Client ID** is safe to expose (goes in frontend)
- ❌ **Client Secret** must stay private (backend only)
- ✅ **Use strong JWT secrets** (generate random 64-character strings)

## 🧪 Step 6: Testing Real Implementation

### **6.1 Start Your Backend**
```bash
cd your-backend-directory
npm run dev  # or node server.js
```

### **6.2 Update Frontend .env**
Replace demo client ID with real one

### **6.3 Test Flow**
1. Click **"Continue with Google"**
2. Google popup opens (real Google login)
3. Sign in with your Google account
4. Popup closes, you're logged into your app
5. User data is saved in your database

## 📊 Step 7: Production Configuration

### **7.1 Add Production URLs**
In Google Cloud Console, add your production URLs:

**Authorized JavaScript origins:**
```
https://your-domain.com
```

**Authorized redirect URIs:**
```
https://your-api-domain.com/api/auth/google/callback
```

### **7.2 Environment Variables**
Update production environment with:
- Real Google Client ID/Secret
- Production JWT secret
- Production database URL
- HTTPS URLs

## ❓ What I Need to Help You

To provide specific implementation help, let me know:

1. **Do you have a backend server already?**
   - If yes: What technology? (Node.js/Express, Python/Flask, etc.)
   - If no: I can help create a simple Express.js backend

2. **Do you have a database?**
   - If yes: What type? (PostgreSQL, MySQL, SQLite, MongoDB)
   - If no: I can help set up a simple database

3. **Your Google credentials** (once you get them):
   - ✅ Share the **Client ID** (it's safe to share)
   - ❌ Don't share the **Client Secret** (I'll show you where to put it)

## 🚀 Next Steps

1. **Get Google credentials** (Steps 1.1-1.6 above)
2. **Update frontend** `.env` with real Client ID
3. **Let me know your backend situation** - I'll provide specific code
4. **Test the real flow** with actual Google authentication

The demo is working great, so the real implementation will be very smooth! Let me know what your backend setup looks like and I'll give you the exact code to implement.