# 🎬 VidNest

> **⚠️ IMPORTANT NOTICE**: This is a personal learning project. **DO NOT COPY OR PLAGIARIZE** this code for academic submissions, portfolios, or commercial use. Build your own version to truly understand the concepts.

A full-stack video sharing platform (YouTube clone) built with Node.js, Express.js, MongoDB, and React. Features include authentication, video upload/streaming, comments, likes, playlists, subscriptions, and a responsive frontend.

## ✨ Features

### 🎥 **Video Management**
- Upload videos with thumbnails to Cloudinary
- Stream videos with metadata (title, description, category, tags)
- View count tracking and video analytics
- Filter and search videos by category, tags, date, duration
- Video privacy controls (public/private)

### 👤 **User & Channel System**
- JWT-based authentication (access + refresh tokens)
- User profiles with avatar and cover image
- Channel pages with subscriber statistics
- Watch history tracking
- Password change and profile updates

### 💬 **Social Features**
- Comment on videos with nested replies
- Like/unlike videos and comments
- Subscribe/unsubscribe to channels
- Real-time notification system
- Tweet-like posts with images

### 📂 **Content Organization**
- Create and manage playlists
- Add/remove videos from playlists
- Public and private playlist support
- Dashboard with channel analytics

### 🔒 **Security**
- Bcrypt password hashing
- HTTP-only cookies for tokens
- JWT verification middleware
- CORS configuration
- Input validation and sanitization

## 🚀 Tech Stack

### **Backend**
| Technology | Purpose |
|------------|---------|
| **Node.js + Express.js** | REST API server |
| **MongoDB + Mongoose** | Database with aggregation pipelines |
| **JWT** | Authentication (access + refresh tokens) |
| **Bcrypt** | Password hashing |
| **Multer** | File upload handling |
| **Cloudinary** | Video and image storage |
| **Cookie-parser** | HTTP-only cookie management |

### **Frontend**
| Technology | Purpose |
|------------|---------|
| **React 19** | UI library |
| **Vite** | Build tool |
| **Redux Toolkit** | State management |
| **React Router v7** | Client-side routing |
| **Tailwind CSS v4** | Styling |
| **Axios** | HTTP requests |
| **React Hook Form** | Form handling |
| **Lucide React** | Icons |

### **DevOps & Tools**
- **Nodemon** - Development hot reload
- **Prettier** - Code formatting
- **Jest + Supertest** - API testing
- **dotenv** - Environment variables

## 📁 Project Structure

```
VidNest/
├── src/                                    # Backend source code
│   ├── controllers/                        # Business logic
│   │   ├── user.controller.js              # Auth, profile, watch history
│   │   ├── video.controller.js             # Upload, CRUD, streaming
│   │   ├── comment.controller.js           # Comments with replies
│   │   ├── like.controller.js              # Like/unlike videos & comments
│   │   ├── playlist.controller.js          # Playlist management
│   │   ├── subscription.controller.js      # Subscribe/unsubscribe
│   │   ├── tweet.controller.js             # Social posts
│   │   ├── notification.controller.js      # User notifications
│   │   ├── dashboard.controller.js         # Channel analytics
│   │   └── search.controller.js            # Advanced video search
│   │
│   ├── models/                             # MongoDB schemas
│   │   ├── user.model.js                   # User + auth
│   │   ├── video.model.js                  # Video metadata
│   │   ├── comment.model.js                # Comments
│   │   ├── like.model.js                   # Likes
│   │   ├── playlist.model.js               # Playlists
│   │   ├── subscription.model.js           # Subscriptions
│   │   ├── tweet.model.js                  # Tweets
│   │   └── notification.model.js           # Notifications
│   │
│   ├── routes/                             # API endpoints
│   ├── middlewares/                        # Auth & file upload
│   ├── utils/                              # Helper functions
│   ├── db/                                 # Database connection
│   ├── app.js                              # Express setup
│   └── index.js                            # Server entry point
│
├── frontend/VideNestFrontEnd/              # React frontend
│   ├── src/
│   │   ├── components/                     # Reusable UI components
│   │   ├── pages/                          # Route pages
│   │   ├── store/                          # Redux state management
│   │   ├── api/                            # API client & endpoints
│   │   └── utils/                          # Frontend utilities
│   │
├── public/temp/                            # Temporary file uploads
├── .env                                    # Environment variables
└── package.json                            # Dependencies
```

## 🛠️ Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas cluster)
- Cloudinary account (for media storage)

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/Prajjwal2051/VidNest.git
   cd VidNest
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory with the following variables:
   
   ```env
   # SERVER CONFIGURATION
   PORT=8000

   # DATABASE CONFIGURATION
   MONGODB_URI=mongodb://localhost:27017
   # Or for MongoDB Atlas:
   # MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net

   # CORS CONFIGURATION
   CORS_ORIGIN=*
   # For production, replace * with your frontend URL:
   # CORS_ORIGIN=http://localhost:3000

   # CLOUDINARY CONFIGURATION (for file uploads)
   CLOUD_NAME=your_cloudinary_cloud_name
   API_KEY_CLOUDNARY=your_cloudinary_api_key
   API_SECRET_CLOUDNARY=your_cloudinary_api_secret

   # JWT TOKEN CONFIGURATION
   ACCESS_TOKEN_SECRET=your_access_token_secret_key_here
   ACCESS_TOKEN_EXPIRY=1d

   REFRESH_TOKEN_SECRET=your_refresh_token_secret_key_here
   REFRESH_TOKEN_EXPIRY=10d
   ```

4. **Create required directories**
   ```bash
   mkdir -p public/temp
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Server will be running at**
   ```
   http://localhost:8000
   ```

### Generating JWT Secrets
For security, generate strong random strings for JWT secrets:
```bash
# Using OpenSSL
openssl rand -base64 32
```

## 🔧 Usage

### Testing the API

Use tools like **Postman**, **Thunder Client**, or **cURL** to test the endpoints.

#### Authentication Flow
1. **Register** a new user account
2. **Login** to receive access and refresh tokens
3. Use the **access token** in cookies or Authorization header
4. **Refresh** the token when it expires
5. **Logout** to clear session

#### File Uploads
When uploading files (avatar/cover image):
- Use `multipart/form-data` content type
- Field name must match exactly: `avatar` or `coverImage`
- Supported formats: JPG, PNG, GIF, etc.

### For Developers

#### Project Architecture
- **Controllers**: Business logic for user operations
- **Models**: MongoDB schemas with Mongoose
- **Routes**: API endpoint definitions
- **Middlewares**: Authentication and file upload handling
- **Utils**: Helper functions and error handling

#### Key Files to Understand
- `src/controllers/user.controller.js` - All user-related logic
- `src/models/user.model.js` - User schema with password hashing
- `src/middlewares/auth.middleware.js` - JWT verification
- `src/routes/user.routes.js` - API endpoint definitions

## 🌐 API Endpoints

**Base URL:** `http://localhost:8000/api/v1`

### **Authentication** 🔐
```
POST   /users/register           # Register new user (+ avatar upload)
POST   /users/login              # Login and get tokens
POST   /users/logout             # Logout (requires auth)
POST   /users/refresh-token      # Refresh access token
```

### **User Management** 👤
```
GET    /users/current-user       # Get authenticated user
GET    /users/c/:username        # Get channel profile (public)
GET    /users/watch-history      # Get watch history
POST   /users/change-password    # Change password
PATCH  /users/update-account     # Update profile details
PATCH  /users/avatar             # Update avatar image
PATCH  /users/cover-image        # Update cover image
```

### **Videos** 🎥
```
GET    /videos                   # Get all videos (with filters)
GET    /videos/:videoId          # Get video by ID
POST   /videos                   # Upload video (+ thumbnail)
PATCH  /videos/:videoId          # Update video
DELETE /videos/:videoId          # Delete video
```

### **Comments** 💬
```
GET    /comments/:videoId        # Get video comments
POST   /comments                 # Add comment
PATCH  /comments/:commentId      # Update comment
DELETE /comments/:commentId      # Delete comment
```

### **Likes** ❤️
```
POST   /likes/toggle/v/:videoId     # Toggle video like
POST   /likes/toggle/c/:commentId   # Toggle comment like
GET    /likes/videos                # Get liked videos
GET    /likes/comments              # Get liked comments
```

### **Playlists** 📂
```
GET    /playlists                    # Get user playlists
GET    /playlists/:playlistId       # Get playlist details
POST   /playlists                   # Create playlist
PATCH  /playlists/:playlistId       # Update playlist
DELETE /playlists/:playlistId       # Delete playlist
POST   /playlists/:playlistId/video/:videoId   # Add video to playlist
DELETE /playlists/:playlistId/video/:videoId   # Remove video from playlist
```

### **Subscriptions** 🔔
```
POST   /subscriptions/c/:channelId            # Toggle subscription
GET    /subscriptions/c/:channelId/subscribers # Get channel subscribers
GET    /subscriptions/subscribed               # Get subscribed channels
```

### **Search** 🔍
```
GET    /search?query=...&category=...&sortBy=...  # Advanced video search
```

### **Dashboard** 📊
```
GET    /dashboard/stats/:channelId   # Get channel statistics
```

### **Notifications** 🔔
```
GET    /notifications               # Get user notifications
PATCH  /notifications/:id/read      # Mark notification as read
PATCH  /notifications/mark-all-read # Mark all as read
DELETE /notifications/:id           # Delete notification
```

### **Tweets** 🐦
```
GET    /tweets                  # Get all tweets
GET    /tweets/:tweetId         # Get tweet by ID
GET    /tweets/user/:userId     # Get user tweets
POST   /tweets                  # Create tweet (+ image)
PATCH  /tweets/:tweetId         # Update tweet
DELETE /tweets/:tweetId         # Delete tweet
```

### 📋 Request/Response Examples

<details>
<summary><b>Register User</b></summary>

**Request:**
```http
POST /api/v1/users/register
Content-Type: multipart/form-data

Fields:
- fullName: "John Doe"
- email: "john@example.com"
- username: "johndoe"
- password: "securePassword123"
- avatar: [file]
- coverimage: [file] (optional)
```

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "_id": "...",
    "fullName": "John Doe",
    "email": "john@example.com",
    "username": "johndoe",
    "avatar": "https://cloudinary.com/...",
    "coverimage": "https://cloudinary.com/..."
  },
  "message": "user registered successfully",
  "success": true
}
```
</details>

<details>
<summary><b>Login User</b></summary>

**Request:**
```http
POST /api/v1/users/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "user": {
      "_id": "...",
      "fullName": "John Doe",
      "email": "john@example.com",
      "username": "johndoe"
    },
    "acessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "User logged in successfully",
  "success": true
}
```

**Cookies Set:**
- `acessToken` (httpOnly, secure)
- `refreshToken` (httpOnly, secure)
</details>

<details>
<summary><b>Get Channel Profile</b></summary>

**Request:**
```http
GET /api/v1/users/c/johndoe
```

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "fullName": "John Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "avatar": "https://cloudinary.com/...",
    "coverimage": "https://cloudinary.com/...",
    "subscribersCount": 1250,
    "channelsSubscribedToCount": 45,
    "isSubscribed": false
  },
  "message": "User channel fetched successfully",
  "success": true
}
```
</details>

## 🎓 Key Learning Concepts

This project demonstrates:

### **Backend Architecture**
- RESTful API design with Express.js
- JWT authentication (access + refresh token pattern)
- MongoDB aggregation pipelines for complex queries
- File upload handling (Multer → local → Cloudinary)
- Custom error handling with ApiError class
- Async/await with try-catch wrappers
- Middleware chaining (auth, file upload, validation)

### **Database Design**
- Schema design with Mongoose
- Model relationships (one-to-many, many-to-many)
- Indexes for query optimization
- Aggregation pipelines with $lookup, $match, $project
- Pagination with mongoose-aggregate-paginate-v2

### **Security Practices**
- Password hashing with bcrypt
- JWT token generation and verification
- HTTP-only cookies for token storage
- CORS configuration
- Input validation and sanitization
- Protected routes with middleware

### **Frontend Development**
- Component-based architecture with React
- State management with Redux Toolkit
- Client-side routing with React Router
- Form handling with React Hook Form
- API integration with Axios interceptors
- Responsive design with Tailwind CSS
- Toast notifications for user feedback

## ⚠️ Academic Integrity Warning

**THIS PROJECT IS FOR EDUCATIONAL REFERENCE ONLY**

🚫 **DO NOT:**
- Copy this code for college/university assignments
- Submit this as your own work in any academic setting
- Use this for job portfolio without significant modifications
- Plagiarize any part of this codebase

✅ **INSTEAD:**
- Use it as a **learning reference** to understand concepts
- Build your **own version** from scratch
- Learn the **architecture and patterns** used here
- Create something **unique** with your own implementation

**Copying code is cheating yourself of learning. Build it yourself to truly understand!**

---

## 🤝 Contributing

This is a personal learning project, but suggestions and feedback are welcome:
- Report bugs via GitHub Issues
- Suggest features or improvements
- Share what you learned from this project
- Build your own version and share your experience!

## 📝 License & Usage

This project is licensed under the **ISC License** for educational purposes only.

**Usage Terms:**
- ✅ Study the code to learn
- ✅ Use as reference for your own projects
- ✅ Learn from the architecture and patterns
- ❌ Do not copy for academic submissions
- ❌ Do not plagiarize for portfolios
- ❌ Do not use commercially without permission

**If you found this helpful, please:**
- ⭐ Star the repository
- 🍴 Fork and build your own version
- 📢 Share what you learned
- 🐛 Report issues to help improve it

## 🙋‍♂️ Author

**Prajjwal**
- GitHub: [@Prajjwal2051](https://github.com/Prajjwal2051)
- Project: [VidNest](https://github.com/Prajjwal2051/VidNest)

## 🎯 Features Status

### ✅ Completed Features
- [x] User authentication (register, login, logout, refresh token)
- [x] User profile management (avatar, cover image, password change)
- [x] Video upload, update, delete with Cloudinary
- [x] Video streaming with metadata
- [x] Advanced video search with filters
- [x] Comments system with CRUD operations
- [x] Like/unlike videos and comments
- [x] Subscribe/unsubscribe to channels
- [x] User playlists (create, update, delete, add/remove videos)
- [x] Notification system
- [x] Watch history tracking
- [x] Channel dashboard with analytics
- [x] Tweet-like posts with images
- [x] Frontend UI with React + Redux + Tailwind

### 🚧 Potential Improvements
- [ ] Real-time notifications with WebSockets
- [ ] Video recommendations algorithm
- [ ] Live streaming capability
- [ ] Video transcription/captions
- [ ] Advanced analytics dashboard
- [ ] Mobile responsive enhancements
- [ ] Progressive Web App (PWA)
- [ ] Video quality selection
- [ ] Comment replies (nested comments)
- [ ] Direct messaging between users

## � Common Issues & Solutions

<details>
<summary><b>MongoDB Connection Error</b></summary>

**Problem:** `MongoServerError: Invalid namespace`

**Solution:** Ensure `MONGODB_URI` doesn't have trailing slash
```env
# ❌ Wrong
MONGODB_URI=mongodb://localhost:27017/

# ✅ Correct
MONGODB_URI=mongodb://localhost:27017
```
</details>

<details>
<summary><b>Multer Error: Unexpected field</b></summary>

**Problem:** `MulterError: Unexpected field`

**Solution:** Field names must match exactly in Postman/frontend
- For registration: `avatar`, `coverimage` (lowercase)
- For avatar update: `avatar`
- For cover update: `coverImage`
</details>

<details>
<summary><b>JWT Verification Failed</b></summary>

**Problem:** `Invalid access token`

**Solution:** 
- Check token is sent in cookies or Authorization header
- Verify `ACCESS_TOKEN_SECRET` matches between token generation and verification
- Token might be expired, use refresh token endpoint
</details>

## 💡 What I Learned Building This

Building VidNest taught me:
1. **Full-stack architecture** - Connecting frontend and backend
2. **JWT authentication** - Secure token-based auth flow
3. **MongoDB aggregations** - Complex data queries and relationships
4. **File uploads** - Multer + Cloudinary integration
5. **Redux state management** - Managing global app state
6. **API design** - RESTful endpoints and proper HTTP methods
7. **Error handling** - Graceful error responses and validation
8. **React patterns** - Component composition and reusability
9. **Debugging** - Console logging and testing strategies
10. **Project structure** - Organizing large codebases

## 🐛 Known Issues

- Video processing might take time for large files
- Notification real-time updates require page refresh
- Mobile UI needs further optimization
- Some edge cases in pagination

**Feel free to report bugs via GitHub Issues**

## 📧 Contact

For questions or collaboration:
- GitHub: [@Prajjwal2051](https://github.com/Prajjwal2051)
- Project: [VidNest Repository](https://github.com/Prajjwal2051/VidNest)

---

<div align="center">

### 🎓 Built as a Learning Project

**Developer:** [Prajjwal](https://github.com/Prajjwal2051)

*A full-stack video sharing platform demonstrating modern web development practices*

**⚠️ Remember: Don't copy, build your own! Learning happens through doing, not copying.**

[![GitHub Stars](https://img.shields.io/github/stars/Prajjwal2051/VidNest?style=social)](https://github.com/Prajjwal2051/VidNest/stargazers)
[![GitHub Forks](https://img.shields.io/github/forks/Prajjwal2051/VidNest?style=social)](https://github.com/Prajjwal2051/VidNest/network/members)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

</div>