# 🚀 NutriAgent AI - Render Deployment Guide

## 📋 Prerequisites

1. **GitHub Repository**: Push your code to a GitHub repository
2. **Render Account**: Create a free account at [render.com](https://render.com)
3. **Google OAuth Credentials**: Set up Google OAuth in Google Cloud Console

## 🗄️ Step 1: Create PostgreSQL Database

1. Go to Render Dashboard → **New** → **PostgreSQL**
2. Configure database:
   - **Name**: `nutriagent-ai-db`
   - **Database**: `nutriagent_ai`
   - **User**: `nutriagent_user`
   - **Region**: `Oregon (US West)`
   - **Plan**: `Free`
3. Click **Create Database**
4. **Important**: Copy the **Internal Database URL** for the backend service

## 🖥️ Step 2: Deploy Backend API Service

1. Go to Render Dashboard → **New** → **Web Service**
2. Connect your GitHub repository
3. Configure service:
   - **Name**: `nutriagent-ai-backend`
   - **Region**: `Oregon (US West)`
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: 
     ```bash
     npm install && npm run build && npx prisma db push
     ```
   - **Start Command**: `npm start`
   - **Plan**: `Free`

### Environment Variables for Backend:
```bash
NODE_ENV=production
PORT=10000
DATABASE_URL=<paste-internal-database-url-here>
JWT_SECRET=<generate-a-secure-random-string>
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://nutriagent-ai-frontend.onrender.com
MAX_FILE_SIZE=5242880
UPLOAD_DIR=uploads
GOOGLE_CLIENT_ID=<your-google-oauth-client-id>
GOOGLE_CLIENT_SECRET=<your-google-oauth-client-secret>
```

4. Click **Create Web Service**

## 📱 Step 3: Deploy Frontend Static Site

1. Go to Render Dashboard → **New** → **Static Site**
2. Connect your GitHub repository
3. Configure site:
   - **Name**: `nutriagent-ai-frontend`
   - **Region**: `Oregon (US West)`
   - **Branch**: `main`
   - **Root Directory**: `frontend`
   - **Build Command**: `yarn build`
   - **Publish Directory**: `dist`

### Environment Variables for Frontend:
```bash
VITE_API_BASE_URL=https://nutriagent-ai-backend.onrender.com
VITE_GOOGLE_CLIENT_ID=<your-google-oauth-client-id>
VITE_APP_NAME=NutriAgent AI
VITE_APP_VERSION=1.0.0
VITE_APP_ENVIRONMENT=production
NODE_ENV=production
```

4. Click **Create Static Site**

## 🔗 Step 4: Link Services

1. **Backend Service**: 
   - Go to **Environment** tab
   - Update `FRONTEND_URL` to your actual frontend URL: `https://nutriagent-ai-frontend.onrender.com`
   
2. **Frontend Service**:
   - Go to **Environment** tab  
   - Update `VITE_API_BASE_URL` to your actual backend URL: `https://nutriagent-ai-backend.onrender.com`

3. **Redeploy both services** after updating URLs

## 🔐 Step 5: Configure Google OAuth

### In Google Cloud Console:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable **Google+ API** and **Google OAuth2 API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure OAuth consent screen
6. Add authorized origins:
   ```
   https://nutriagent-ai-frontend.onrender.com
   https://nutriagent-ai-backend.onrender.com
   ```
7. Add authorized redirect URIs:
   ```
   https://nutriagent-ai-frontend.onrender.com/auth/callback
   https://nutriagent-ai-backend.onrender.com/api/auth/google/callback
   ```

### Update Environment Variables:
- Add `GOOGLE_CLIENT_ID` to both frontend and backend
- Add `GOOGLE_CLIENT_SECRET` to backend only

## 🔧 Step 6: Database Setup

The database will be automatically set up when the backend first deploys due to the Prisma migration in the build command.

### Manual Setup (if needed):
1. Connect to your backend service via Render Shell
2. Run migrations manually:
   ```bash
   npx prisma migrate deploy
   npx prisma db seed  # if you have seed data
   ```

## ✅ Step 7: Verify Deployment

### Check Backend Health:
- Visit: `https://nutriagent-ai-backend.onrender.com/api/health`
- Should return: `{"status": "healthy", "service": "nutriagent-ai-backend"}`

### Check Frontend:
- Visit: `https://nutriagent-ai-frontend.onrender.com`
- Should load the NutriAgent AI application

### Test API Connection:
- Try logging in/registering from the frontend
- Check that API calls are working in browser developer tools

## 🚨 Troubleshooting

### Backend Issues:
1. **Build Failures**: Check build logs in Render dashboard
2. **Database Connection**: Verify `DATABASE_URL` is correctly set
3. **CORS Errors**: Ensure frontend URL is correctly set in `FRONTEND_URL`

### Frontend Issues:  
1. **API Connection**: Verify `VITE_API_BASE_URL` points to backend
2. **Routing Issues**: Ensure `_redirects` file is in `public` folder
3. **Build Size**: Check if any chunks are too large

### Common Fixes:
```bash
# Clear Render cache and rebuild
# In Render dashboard: Manual Deploy → Clear Cache → Deploy

# Check environment variables
# Make sure all required env vars are set correctly

# Database connection issues
# Verify DATABASE_URL includes correct credentials and host
```

## 📊 Performance Optimization

### Backend:
- Enable gzip compression (already configured)
- Use rate limiting (already configured)
- Monitor memory usage on free tier (512MB limit)

### Frontend:
- Code splitting is configured in `vite.config.ts`
- Static assets are cached with proper headers
- Bundle size is optimized for fast loading

## 💰 Cost Considerations

### Free Tier Limits:
- **PostgreSQL**: 1GB storage, 1 month retention
- **Web Service**: 750 hours/month, sleeps after 15min inactivity
- **Static Site**: 100GB bandwidth/month, custom domains available

### Upgrade Recommendations:
- **Starter Plan ($7/month)**: For always-on backend service
- **PostgreSQL Starter ($7/month)**: For persistent database with backups

## 🔄 Continuous Deployment

Both services are configured for automatic deployment:
- **Auto-deploy**: Enabled on main branch
- **Build Hooks**: Available for manual triggering
- **GitHub Integration**: Deploys on every push to main branch

## 📞 Support & Monitoring

### Monitoring:
- **Logs**: Available in Render dashboard for each service
- **Metrics**: Basic performance metrics in dashboard
- **Uptime**: Monitor via Render status or external tools

### Health Checks:
- Backend: `/api/health` endpoint configured
- Database: Connection pooling and error handling
- Frontend: Static files served with proper caching

---

## 🎉 Deployment Complete!

Your NutriAgent AI application is now live on Render with:
- ✅ Full-stack deployment (Frontend + Backend + Database)
- ✅ Production-optimized builds
- ✅ Automatic HTTPS certificates
- ✅ Continuous deployment from GitHub
- ✅ PostgreSQL database with migrations
- ✅ Environment-based configuration
- ✅ Security headers and CORS configuration

**Frontend URL**: `https://nutriagent-ai-frontend.onrender.com`  
**Backend API**: `https://nutriagent-ai-backend.onrender.com`

Your AI-powered nutrition platform is ready for users! 🚀