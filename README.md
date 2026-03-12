<div align="center">

# 🎬 VidNest - Professional Video Sharing Platform

[![React](https://img.shields.io/badge/React-19.2.0-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.1.0-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.19.0-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Redis](https://img.shields.io/badge/Redis-ioredis_5.10-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)
[![License](https://img.shields.io/badge/License-Proprietary-red?style=for-the-badge)](LICENSE)

### 🚀 A Production-Grade Video Sharing Platform Built with MERN Stack

_Upload, Stream, Engage, and Build Your Community_

[Features](#-features) • [Tech Stack](#-tech-stack) • [Architecture](#-system-architecture) • [Getting Started](#-getting-started) • [API Docs](#-api-documentation)

---

</div>

## 📌 Project Overview

**VidNest** is a full-featured, enterprise-grade video sharing platform similar to YouTube, built from the ground up using modern web technologies. This project demonstrates advanced full-stack development practices with a production-ready backend architecture, comprehensive API design, real-time notifications, and a polished React frontend.

### 🎯 Core Capabilities

- **Complete Video Platform**: Upload, stream, edit, and manage video content with cloud storage
- **Social Features**: Comments, likes, subscriptions, and real-time notifications
- **Content Organization**: Custom playlists, watch history, and content discovery
- **Creator Dashboard**: Analytics, video management, and channel statistics
- **Photo Posts (Tweets)**: Share images with captions alongside video content
- **Advanced Search**: Filter and discover content with sophisticated search algorithms
- **Security First**: JWT authentication, bcrypt password hashing, rate limiting, and CORS protection

---

## 📋 Table of Contents

- [Features](#-features)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [API Documentation](#-api-documentation)
- [Authentication & Security](#-authentication--security)
- [License & Contact](#-license--contact)

---

## ✨ Features

### 🎬 **Video Management**

- Multi-file upload with Multer middleware
- Cloud storage via Cloudinary CDN
- Responsive video player with React Player
- Watch history tracking and view count analytics
- Like/dislike system with real-time updates
- Video management dashboard with analytics

### 👤 **User Authentication & Authorization**

- JWT-based token authentication (access + refresh tokens)
- HTTP-only secure cookies for token storage
- Bcrypt password hashing
- Email verification and password reset
- Customizable user profiles and channel pages

### 📱 **Social Features**

- Comment system on videos and tweets
- Like/unlike videos, tweets, and comments
- Subscribe/unsubscribe to channels
- Real-time notifications system
- User activity feed

### 📢 **Notifications System**

- Real-time notifications for likes, comments, and subscriptions
- Unread notification badge counter
- Mark as read/delete functionality
- Notification history with pagination

### 🎭 **Photo Posts (Tweets)**

- Upload photos with captions
- Like and comment on tweets
- User tweet feed and detail pages

### 📚 **Playlist Management**

- Create and manage custom playlists
- Add/remove videos from playlists
- Public/private playlist settings

### 📊 **Creator Dashboard**

- Channel analytics and statistics
- Video and content management
- Comment management

### 🔍 **Advanced Search**

- Full-text search across videos
- Filter and sort options
- Optimized MongoDB text indexes

### ⚡ **Performance & Caching (Redis)**

- Redis-backed response caching across all major endpoints
- Cache-first JWT session validation — eliminates the MongoDB round trip on every authenticated request
- Cached resources: channel profiles (5 min), watch history (2 min), search results (5 min), dashboard stats (10 min), playlists, tweets, comments, subscriptions, and like statuses
- Smart cache invalidation — keys are automatically purged on any write/update operation
- Atomic Redis counters for real-time view and like counts
- Distributed rate limiting via Redis (persists across server restarts and scales horizontally)

### 🎨 **User Interface**

- Responsive design with Tailwind CSS
- Dark theme interface
- Toast notifications
- Loading states and skeleton screens
- Form validation

---

## 🏗 System Architecture

### **High-Level Architecture**

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT (Browser)                        │
│  React 19 + Vite + Tailwind CSS + Redux Toolkit             │
└────────────┬────────────────────────────────────────────────┘
             │ HTTP/HTTPS
             │
┌────────────▼────────────────────────────────────────────────┐
│                   API GATEWAY LAYER                         │
│  Express.js + CORS + Redis Rate Limiting + Cookie Parser    │
└────────────┬────────────────────────────────────────────────┘
             │
     ┌───────┴───────┐
     │               │
┌────▼─────┐  ┌──────▼─────┐
│  Auth    │  │ Business   │
│  Layer   │  │  Logic     │
│  JWT +   │  │ Controllers│
│  Redis   │  │  + Cache   │
│  Session │  │  (Redis)   │
└────┬─────┘  └─────┬──────┘
     │               │
     └───────┬───────┘
             │
     ┌───────┴────────┐
     │                │
┌────▼─────┐  ┌───────▼─────┐
│  Redis   │  │ Data Access │
│  Cache   │  │ Layer       │
│  Layer   │  │ Mongoose +  │
└────┬─────┘  │ Aggregation │
     │        └──────┬──────┘
     │               │
     └───────┬───────┘
             │
     ┌───────┴────────┬─────────────┐
     │                │             │
┌────▼─────┐  ┌──────▼──────┐ ┌─────▼───┐
│ MongoDB  │  │ Cloudinary  │ │ Email   │
│ Database │  │ CDN Storage │ │ Service │
└──────────┘  └─────────────┘ └─────────┘
```

---

## 🛠 Tech Stack

### **Frontend Technologies**

| Technology          | Version | Purpose                   |
| ------------------- | ------- | ------------------------- |
| **React**           | 19.2.0  | Core UI library           |
| **Vite**            | 7.2.4   | Build tool and dev server |
| **Redux Toolkit**   | 2.11.0  | State management          |
| **React Router**    | 7.10.0  | Client-side routing       |
| **Axios**           | 1.13.2  | HTTP client               |
| **Tailwind CSS**    | 3.4.17  | CSS framework             |
| **Lucide React**    | 0.556.0 | Icon library              |
| **React Hot Toast** | 2.6.0   | Toast notifications       |
| **React Hook Form** | 7.68.0  | Form validation           |
| **React Player**    | 3.4.0   | Video player              |
| **Recharts**        | 3.6.0   | Data visualization        |

### **Backend Technologies**

| Technology           | Version | Purpose                       |
| -------------------- | ------- | ----------------------------- |
| **Node.js**          | 18+     | JavaScript runtime            |
| **Express.js**       | 5.1.0   | Web framework                 |
| **MongoDB**          | 8.19.0  | NoSQL database                |
| **Mongoose**         | 8.19.0  | MongoDB ODM                   |
| **Redis (ioredis)**  | 5.10.0  | Caching & session store       |
| **rate-limit-redis** | 4.3.1   | Distributed rate limiting     |
| **JWT**              | 9.0.2   | Authentication                |
| **Bcrypt**           | 6.0.0   | Password hashing              |
| **Multer**           | 2.0.2   | File upload handling          |
| **Cloudinary**       | 2.7.0   | Cloud media storage           |
| **Nodemailer**       | 7.0.12  | Email service                 |
| **CORS**             | 2.8.5   | Cross-Origin Resource Sharing |

---

## 🚀 Getting Started

### **Prerequisites**

- **Node.js** (v18.0.0 or higher)
- **MongoDB** (v6.0+) - Local or MongoDB Atlas
- **Redis** (v6.0+) - Local, [Render Redis](https://render.com/docs/redis), or [Upstash](https://upstash.com/)
- **Git**
- **Cloudinary Account** (free tier)
- **Gmail Account** (for email service)

### **Installation & Setup**

#### **Step 1: Clone the Repository**

```bash
git clone https://github.com/Prajjwal2051/VidNest.git
cd VidNest
```

#### **Step 2: Backend Setup**

```bash
# Install backend dependencies
npm install

# Create environment variables file
cp .env.example .env
```

**Configure `.env` file:**

```env
# Server Configuration
PORT=8000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/VidNest

# CORS Configuration
CORS_ORIGIN=http://localhost:5173

# JWT Secrets (Generate random strings)
ACCESS_TOKEN_SECRET=your_super_secret_access_token_here_min_32_chars
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_super_secret_refresh_token_here_min_32_chars
REFRESH_TOKEN_EXPIRY=10d

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email Configuration (Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password
EMAIL_FROM=noreply@vidnest.com

# Redis Configuration
# Option A — Local Redis (development)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
# Option B — Managed Redis (production): set REDIS_URL to override host/port
# REDIS_URL=rediss://:your_password@your-host:6380
```

**Generate Secure Secrets:**

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

#### **Step 3: Frontend Setup**

```bash
cd frontend/VideNestFrontEnd
npm install

# Create frontend environment file
echo 'VITE_API_BASE_URL=http://localhost:8000/api/v1' > .env
```

#### **Step 4: Start the Application**

```bash
# Terminal 1: Start Redis (required before backend)
redis-server
# Redis runs on localhost:6379 by default

# Terminal 2: Start Backend (from project root)
npm run dev
# Backend runs on http://localhost:8000

# Terminal 3: Start Frontend (from frontend/VideNestFrontEnd)
cd frontend/VideNestFrontEnd
npm run dev
# Frontend runs on http://localhost:5173
```

#### **Step 5: Access the Application**

- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:8000/api/v1](http://localhost:8000/api/v1)
- **Health Check**: [http://localhost:8000/api/v1/users/health](http://localhost:8000/api/v1/users/health)

---

## 📁 Project Structure

```
VidNest/
│
├── 📂 src/                          # Backend source code
│   ├── 📂 controllers/              # Request handlers
│   ├── 📂 models/                   # MongoDB Schemas
│   ├── 📂 routes/                   # API route definitions
│   ├── 📂 middlewares/              # Custom middleware
│   │   ├── auth.middleware.js       # JWT auth with Redis session cache
│   │   └── rate-limiter.middleware.js  # Redis-backed distributed rate limiting
│   ├── 📂 utils/                    # Helper functions
│   ├── 📂 db/                       # Database connections
│   │   ├── db_connection.js         # MongoDB connection
│   │   └── redis.js                 # Redis client & cache helpers
│   ├── app.js                       # Express app configuration
│   ├── index.js                     # Server entry point
│   └── constants.js                 # App constants
│
├── 📂 frontend/VideNestFrontEnd/   # React frontend
│   ├── 📂 src/
│   │   ├── 📂 api/                  # API client functions
│   │   ├── 📂 components/           # React components
│   │   ├── 📂 pages/                # Route pages (22 pages)
│   │   ├── 📂 store/                # Redux state management
│   │   ├── 📂 context/              # React Context
│   │   ├── 📂 hooks/                # Custom React hooks
│   │   └── App.jsx                  # Root component
│   └── package.json                 # Frontend dependencies
│
├── 📂 public/                       # Static files
├── .env.example                     # Environment template
├── package.json                     # Backend dependencies
├── REDIS_README.md                  # Redis implementation details
└── README.md                        # Documentation
```

---

## 🔐 Authentication & Security

### **Authentication Flow**

```
1. User Login (email + password)
2. Backend verifies credentials with bcrypt
3. Generate JWT tokens (access + refresh)
4. Set HTTP-only cookies (secure, sameSite)
5. Client authenticated with tokens
```

### **Security Features**

- **Password Security**: Bcrypt hashing with 10 salt rounds
- **JWT Authentication**: Access + refresh token pattern
- **HTTP-Only Cookies**: Protection against XSS attacks
- **CORS Protection**: Strict origin validation
- **Distributed Rate Limiting**: Redis-backed limits per IP / user — persists across restarts and scales across instances (general: 1000 req/15 min, auth: 100 req/15 min, upload: 1000 req/hr)
- **Input Validation**: MongoDB injection prevention
- **File Upload Security**: Type and size validation

### **Protected Route Middleware**

```javascript
// verifyJWT middleware — Redis session cache first, MongoDB fallback
export const verifyJWT = asyncHandler(async (req, res, next) => {
    const token =
        req.cookies?.accessToken ||
        req.header("Authorization")?.replace("Bearer ", "")

    if (!token) {
        throw new ApiError(401, "Unauthorized request")
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

    // Cache-first: check Redis before hitting MongoDB
    const sessionKey = `session:${decodedToken._id}:${token}`
    let user = await getCache(sessionKey)

    if (!user) {
        user = await User.findById(decodedToken?._id).select(
            "-password -refreshToken"
        )
        if (!user) throw new ApiError(401, "Invalid access token")
        await setCache(sessionKey, user, 86400) // cache for 1 day
    }

    req.user = user
    next()
})
```

---

## 📚 API Documentation

### **API Base URL**

```
Development: http://localhost:8000/api/v1
Production: https://your-domain.com/api/v1
```

### **Complete API Endpoints**

#### **🔐 Authentication & User Management**

```http
POST /api/v1/users/register          # Register new user
POST /api/v1/users/login             # User login
POST /api/v1/users/logout            # Logout
POST /api/v1/users/refresh-token     # Refresh access token
POST /api/v1/users/forgot-password   # Request password reset
POST /api/v1/users/reset-password/:token  # Reset password
GET  /api/v1/users/current-user      # Get current user
POST /api/v1/users/change-password   # Change password
PATCH /api/v1/users/update-account   # Update account details
PATCH /api/v1/users/avatar           # Update avatar
PATCH /api/v1/users/cover-image      # Update cover image
GET  /api/v1/users/c/:username       # Get channel profile
GET  /api/v1/users/watch-history     # Get watch history
```

#### **🎬 Video Management**

```http
GET    /api/v1/videos                # Get all videos (paginated)
GET    /api/v1/videos/:videoId       # Get video by ID
POST   /api/v1/videos                # Upload video
PATCH  /api/v1/videos/:videoId       # Update video
DELETE /api/v1/videos/:videoId       # Delete video
PATCH  /api/v1/videos/toggle/publish/:videoId  # Toggle publish status
PATCH  /api/v1/videos/:videoId/view  # Increment view count
```

#### **💬 Comments**

```http
GET    /api/v1/comments/:videoId     # Get video comments
GET    /api/v1/comments/t/:tweetId   # Get tweet comments
GET    /api/v1/comments/user/me      # Get user's comments
POST   /api/v1/comments              # Add comment
PATCH  /api/v1/comments/:commentId   # Update comment
DELETE /api/v1/comments/:commentId   # Delete comment
```

#### **❤️ Likes**

```http
POST /api/v1/like/video/:videoId     # Toggle video like
POST /api/v1/like/comment/:commentId # Toggle comment like
POST /api/v1/like/tweet/:tweetId     # Toggle tweet like
GET  /api/v1/like/status/video/:videoId  # Get like status
GET  /api/v1/like/videos             # Get liked videos
GET  /api/v1/like/tweets             # Get liked tweets
GET  /api/v1/like/comments           # Get liked comments
```

#### **👥 Subscriptions**

```http
POST /api/v1/subscription/c/:channelId  # Toggle subscription
GET  /api/v1/subscription/c/:channelId/subscribers  # Get subscribers
GET  /api/v1/subscription/u/:userId/subscribed  # Get subscribed channels
```

#### **🔔 Notifications**

```http
GET    /api/v1/notifications         # Get all notifications
PATCH  /api/v1/notifications/:notificationId/read  # Mark as read
PATCH  /api/v1/notifications/read-all  # Mark all as read
DELETE /api/v1/notifications/:notificationId  # Delete notification
```

#### **📚 Playlists**

```http
POST   /api/v1/playlists             # Create playlist
GET    /api/v1/playlists/user/:userId  # Get user playlists
GET    /api/v1/playlists/:playlistId # Get playlist by ID
PATCH  /api/v1/playlists/:playlistId # Update playlist
DELETE /api/v1/playlists/:playlistId # Delete playlist
PATCH  /api/v1/playlists/add/:playlistId/:videoId  # Add video
PATCH  /api/v1/playlists/remove/:playlistId/:videoId  # Remove video
```

#### **📸 Tweets**

```http
GET    /api/v1/tweets                # Get all tweets
GET    /api/v1/tweets/:tweetId       # Get tweet by ID
GET    /api/v1/tweets/user/:userId   # Get user tweets
POST   /api/v1/tweets                # Create tweet
PATCH  /api/v1/tweets/:tweetId       # Update tweet
DELETE /api/v1/tweets/:tweetId       # Delete tweet
```

#### **📊 Dashboard & Analytics**

```http
GET /api/v1/dashboard/stats/:channelId  # Get channel statistics
GET /api/v1/dashboard/videos/:channelId # Get channel videos
```

#### **🔍 Search**

```http
GET /api/v1/search?query=keyword     # Search videos
```

### **Standard Response Format**

**Success Response:**

```json
{
  "statusCode": 200,
  "data": { ... },
  "message": "Operation successful",
  "success": true
}
```

**Error Response:**

```json
{
    "statusCode": 400,
    "data": null,
    "message": "Error message",
    "success": false,
    "errors": []
}
```

---

## 📄 License & Copyright

### **Copyright Notice**

```
Copyright © 2026 Prajjwal. All Rights Reserved.

VidNest - Video Sharing Platform

UNAUTHORIZED USE, REPRODUCTION, OR DISTRIBUTION IS STRICTLY PROHIBITED.

For licensing inquiries, please contact the author.
```

---

## 📞 Contact & Support

### **Author**

**Prajjwal** - Full-Stack Developer | MERN Stack Specialist

### **Links**

- **GitHub**: [@Prajjwal2051](https://github.com/Prajjwal2051)
- **Repository**: [github.com/Prajjwal2051/VidNest](https://github.com/Prajjwal2051/VidNest)

---

## 🔐 Security Disclosure

If you discover a security vulnerability, email the author directly.
**Do not create public GitHub issues for security vulnerabilities.**

---

<div align="center">

## ⭐ Show Your Support

- ⭐ **Star this repository** on GitHub
- 🔗 **Share** with fellow developers
- 💬 **Provide feedback** through issues

---

**Built with ❤️ by Prajjwal using React, Node.js, Express, MongoDB, and Redis**

_Last Updated: March 2026_

</div>
