# VidNest / Viewly — Deployment & Environment Runbook

**Part of the [VidNest Documentation Series](./README.md)**  
**Author:** Prajjwal ([GitHub](https://github.com/Prajjwal2051))  

---

## 1. Environment Variables Configuration

Create a `.env` file in the project root directory.

```env
# ============================================
# SERVER CONFIGURATION
# ============================================
PORT=8000
NODE_ENV=development

# ============================================
# DATABASE CONFIGURATION
# ============================================
# Note: Replica Set is required for subscription transactions
MONGODB_URI=mongodb://localhost:27017/VidNest?replicaSet=rs0

# ============================================
# CORS & FRONTEND CLIENT CONFIGURATION
# ============================================
CORS_ORIGIN=http://localhost:5173
FRONTEND_URL=http://localhost:5173

# ============================================
# JWT SECURITY SECRETS
# ============================================
# Secrets must be >= 64 characters with high entropy
ACCESS_TOKEN_SECRET=4a8e2b9c7d1f5a3e8b0c2d4f6a8b1c3e5f7a9b0c2d4e6f8a1b3c5d7e9f0a2b4c
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e
REFRESH_TOKEN_EXPIRY=10d

# ============================================
# CLOUDINARY MEDIA STORAGE
# ============================================
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# ============================================
# EMAIL CONFIGURATION (Nodemailer SMTP)
# ============================================
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_gmail_app_password
EMAIL_FROM=noreply@vidnest.com

# ============================================
# REDIS CACHE CONFIGURATION
# ============================================
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
# Or unified URL for managed Redis (Upstash / Redis Cloud):
# REDIS_URL=rediss://default:password@your-redis-host:6379
```

And in `frontend/VideNestFrontEnd/.env`:
```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

---

## 2. Local Development Setup

### Step 1: Start MongoDB with Replica Set Support
MongoDB multi-document transactions (used in `toggleSubscription`) require a replica set. For local development on macOS/Linux:

```bash
# Start mongod with a replica set name
mongod --replSet rs0 --dbpath /path/to/mongodb-data

# In another terminal, initialize the replica set:
mongosh --eval "rs.initiate()"
```

### Step 2: Start Redis Server
```bash
redis-server
# Verify connectivity:
redis-cli ping
# Expected response: PONG
```

### Step 3: Start Backend API
```bash
# In the root repository directory:
npm install
npm run dev
```
The server will boot on `http://localhost:8000` and validate critical environment configurations.

### Step 4: Start Frontend Client
```bash
cd frontend/VideNestFrontEnd
npm install
npm run dev
```
The client will start at `http://localhost:5173`.

---

## 3. Production Deployment Guide

### Backend on Render (`render.yaml`)
The project includes a ready-to-use `render.yaml` blueprint:
```yaml
services:
    - type: web
      name: vidnest-backend
      env: node
      region: oregon
      buildCommand: npm install
      startCommand: npm start
      envVars:
          - key: NODE_ENV
            value: production
          - key: PORT
            value: 10000
```
- Set `NODE_ENV=production`
- Configure `MONGODB_URI` pointing to MongoDB Atlas (which runs as a replica set by default).
- Set `REDIS_URL` pointing to your managed Redis instance (supports `rediss://` for TLS).
- Provide Cloudinary and SMTP credentials in the Render dashboard.

### Frontend on Vercel (`vercel.json`)
The frontend client in `frontend/VideNestFrontEnd` includes a `vercel.json` rewrite configuration for Single Page Applications:
```json
{
    "outputDirectory": "dist",
    "rewrites": [
        {
            "source": "/(.*)",
            "destination": "/"
        }
    ]
}
```
- Set Root Directory to `frontend/VideNestFrontEnd`.
- Set Environment Variable: `VITE_API_BASE_URL=https://your-backend.onrender.com/api/v1`.
- Build Command: `npm run build`.

---

*Return to [Master Documentation Index](./README.md)*
