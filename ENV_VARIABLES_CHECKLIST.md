# 🔧 Environment Variables Checklist for Render Deployment

## 🗄️ Database Environment Variables

### PostgreSQL Database (Created first):
- **Service Name**: `nutriagent-ai-db`
- **Database Name**: `nutriagent_ai`
- **User**: `nutriagent_user`
- **Plan**: Free
- **Auto-generates**: Internal and External Database URLs

---

## 🖥️ Backend Service Environment Variables

| Variable Name | Value | Required | Notes |
|---------------|-------|----------|--------|
| `NODE_ENV` | `production` | ✅ | Runtime environment |
| `PORT` | `10000` | ✅ | Render requires port 10000 |
| `DATABASE_URL` | `<from-database-service>` | ✅ | Auto-linked when database is connected |
| `JWT_SECRET` | `<generate-secure-string>` | ✅ | Use Render's "Generate Value" feature |
| `JWT_EXPIRES_IN` | `7d` | ✅ | Token expiration time |
| `FRONTEND_URL` | `https://nutriagent-ai-frontend.onrender.com` | ✅ | CORS configuration |
| `MAX_FILE_SIZE` | `5242880` | ✅ | 5MB file upload limit |
| `UPLOAD_DIR` | `uploads` | ✅ | Directory for file uploads |
| `GOOGLE_CLIENT_ID` | `<from-google-console>` | ⚠️ | Required for OAuth |
| `GOOGLE_CLIENT_SECRET` | `<from-google-console>` | ⚠️ | Required for OAuth |

### 🔐 To Generate JWT_SECRET:
```bash
# Option 1: Use Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Option 2: Use OpenSSL
openssl rand -hex 64

# Option 3: Use Render's "Generate Value" button
```

---

## 📱 Frontend Service Environment Variables

| Variable Name | Value | Required | Notes |
|---------------|-------|----------|--------|
| `VITE_API_BASE_URL` | `https://nutriagent-ai-backend.onrender.com` | ✅ | Backend API endpoint |
| `VITE_GOOGLE_CLIENT_ID` | `<from-google-console>` | ⚠️ | Same as backend OAuth |
| `VITE_APP_NAME` | `NutriAgent AI` | ✅ | Application name |
| `VITE_APP_VERSION` | `1.0.0` | ✅ | Version number |
| `VITE_APP_ENVIRONMENT` | `production` | ✅ | Environment flag |
| `NODE_ENV` | `production` | ✅ | Build environment |

---

## 🔐 Google OAuth Setup Required

### Steps to Get Google OAuth Credentials:

1. **Go to [Google Cloud Console](https://console.cloud.google.com/)**

2. **Create or Select Project**

3. **Enable APIs**:
   - Google+ API
   - Google OAuth2 API

4. **Create OAuth 2.0 Credentials**:
   - Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
   - Application type: **Web application**

5. **Configure OAuth Consent Screen**:
   - Add app name: `NutriAgent AI`
   - Add authorized domains: `onrender.com`

6. **Set Authorized Origins**:
   ```
   https://nutriagent-ai-frontend.onrender.com
   https://nutriagent-ai-backend.onrender.com
   ```

7. **Set Authorized Redirect URIs**:
   ```
   https://nutriagent-ai-frontend.onrender.com/auth/callback
   https://nutriagent-ai-backend.onrender.com/api/auth/google/callback
   ```

8. **Copy Credentials**:
   - `Client ID` → Use for both frontend and backend
   - `Client Secret` → Use for backend only

---

## ✅ Pre-Deployment Checklist

### Before Starting Deployment:

- [ ] **GitHub Repository**: Code pushed to GitHub
- [ ] **Render Account**: Free account created
- [ ] **Google Cloud Project**: OAuth credentials ready
- [ ] **Environment Variables**: All values prepared

### Required Values to Prepare:

1. **GitHub Repository URL**: `https://github.com/your-username/your-repo-name`
2. **Google OAuth Client ID**: `123456789012-abcdefghijklmnopqrstuvwxyz123456.apps.googleusercontent.com`
3. **Google OAuth Client Secret**: `GOCSPX-AbCdEfGhIjKlMnOpQrStUvWxYz12`
4. **JWT Secret**: 64-character random string

---

## 🚀 Deployment Order

**Follow this exact order for successful deployment:**

1. **Create PostgreSQL Database** first
2. **Deploy Backend Service** (link to database)
3. **Deploy Frontend Static Site** (link to backend)
4. **Update Cross-References** (URLs in both services)
5. **Test and Verify** all connections

---

## 🔧 Quick Copy-Paste Values

### Backend Environment Variables (Fill in your values):
```bash
NODE_ENV=production
PORT=10000
DATABASE_URL=<paste-from-render-database>
JWT_SECRET=<generate-64-char-string>
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://nutriagent-ai-frontend.onrender.com
MAX_FILE_SIZE=5242880
UPLOAD_DIR=uploads
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
```

### Frontend Environment Variables (Fill in your values):
```bash
VITE_API_BASE_URL=https://nutriagent-ai-backend.onrender.com
VITE_GOOGLE_CLIENT_ID=<your-google-client-id>
VITE_APP_NAME=NutriAgent AI
VITE_APP_VERSION=1.0.0
VITE_APP_ENVIRONMENT=production
NODE_ENV=production
```

---

## 🚨 Common Issues & Solutions

### Issue: Build Fails
**Solution**: Check that all dependencies are in `dependencies`, not `devDependencies`

### Issue: Database Connection Fails
**Solution**: Ensure `DATABASE_URL` is the **Internal Database URL** from Render

### Issue: CORS Errors
**Solution**: Verify `FRONTEND_URL` in backend matches actual frontend URL

### Issue: OAuth Not Working
**Solution**: Double-check authorized origins and redirect URIs in Google Console

---

**Next Step**: Follow the detailed deployment guide in `RENDER_DEPLOYMENT_GUIDE.md` 🚀