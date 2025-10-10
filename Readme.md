# 🎬 VidNest

A modern video sharing platform backend built with Node.js and Express.js, featuring comprehensive user management, authentication, and video handling capabilities.

## ✨ Features

### 🔐 Authentication & Security
- **User Registration & Login**: Secure authentication with JWT tokens
- **Token Management**: Access tokens (short-lived) and refresh tokens (long-lived)
- **Password Security**: Bcrypt hashing with configurable salt rounds
- **HTTP-Only Cookies**: XSS protection for token storage
- **Session Management**: Secure logout with token invalidation

### 👤 User Management
- **Profile Management**: Update name, email, avatar, and cover images
- **Password Change**: Secure password updates with old password verification
- **Channel Profiles**: Public channel pages with subscriber statistics
- **Watch History**: Track and retrieve user's video viewing history

### 📁 File Handling
- **Image Uploads**: Profile avatars and cover images
- **Cloud Storage**: Cloudinary integration for media storage
- **Multer Middleware**: Efficient multipart/form-data handling
- **Temporary Storage**: Local temp folder before cloud upload

### 🎯 Advanced Features
- **MongoDB Aggregation**: Efficient data fetching with nested pipelines
- **Subscription System**: Channel subscriptions and follower counts
- **User Analytics**: Subscriber counts and channel statistics
- **Watch History Tracking**: Complete video history with owner details

## 🚀 Tech Stack

### Core Technologies
- **Runtime**: Node.js (ES6 Modules)
- **Framework**: Express.js v5.1.0
- **Database**: MongoDB v8.19.0 with Mongoose ODM
- **Language**: JavaScript (ES6+)

### Authentication & Security
- **JWT**: jsonwebtoken v9.0.2 (Access & Refresh tokens)
- **Password Hashing**: bcrypt v6.0.0
- **Cookie Handling**: cookie-parser v1.4.7
- **CORS**: cors v2.8.5

### File Management
- **File Upload**: Multer v2.0.2 (multipart/form-data)
- **Cloud Storage**: Cloudinary v2.7.0 (images & videos)
- **Temporary Storage**: Local file system

### Database Features
- **Aggregation**: mongoose-aggregate-paginate-v2 v1.1.4
- **Models**: User, Video, Subscription schemas
- **Indexes**: Optimized queries for username and email

### Development Tools
- **Hot Reload**: nodemon v3.1.10
- **Code Formatting**: Prettier v3.6.2
- **Environment**: dotenv v17.2.3

## 📁 Project Structure

```
VidNest/
├── src/
│   ├── app.js                      # Express app configuration (CORS, cookies, routes)
│   ├── index.js                    # Server entry point with DB connection
│   ├── constants.js                # Application constants (DB_NAME)
│   │
│   ├── controllers/
│   │   └── user.controller.js      # User management controllers
│   │
│   ├── db/
│   │   └── db_connection.js        # MongoDB connection configuration
│   │
│   ├── middlewares/
│   │   ├── auth.middleware.js      # JWT verification middleware
│   │   └── multer.middleware.js    # File upload middleware
│   │
│   ├── models/
│   │   ├── user.model.js           # User schema (auth, profile, watch history)
│   │   ├── video.model.js          # Video schema
│   │   └── subscription.model.js   # Subscription schema (channel follows)
│   │
│   ├── routes/
│   │   └── user.routes.js          # User API routes
│   │
│   └── utils/
│       ├── ApiError.js             # Custom error class
│       ├── ApiResponse.js          # Standardized API response
│       ├── asyncHandler.js         # Async error wrapper
│       └── cloudnary.js            # Cloudinary upload utility
│
├── public/
│   └── temp/                       # Temporary file storage before cloud upload
│
├── .env                            # Environment variables (not in git)
├── .gitignore                      # Git ignore rules
├── package.json                    # Dependencies and scripts
└── README.md                       # Project documentation
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

### Base URL
```
http://localhost:8000/api/v1
```

### 🔓 Public Routes (No Authentication Required)

#### User Authentication
```http
POST   /users/register          # Create new user account
POST   /users/login             # Authenticate and get tokens
POST   /users/refresh-token     # Get new access token using refresh token
```

#### Channel Information
```http
GET    /users/c/:username       # Get channel profile with subscriber stats
```

### 🔒 Protected Routes (Authentication Required)

#### Session Management
```http
POST   /users/logout            # Clear tokens and end session
```

#### User Profile
```http
GET    /users/current-user      # Get authenticated user's profile
POST   /users/change-password   # Change user password
PATCH  /users/update-account    # Update fullName and email
```

#### File Uploads
```http
PATCH  /users/avatar             # Update profile picture (multipart/form-data)
PATCH  /users/cover-image        # Update cover image (multipart/form-data)
```

#### User Activity
```http
GET    /users/watch-history     # Get user's video watch history
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

## 🎓 Learning Resources

This project demonstrates:
- **RESTful API Design**: Following REST principles
- **JWT Authentication**: Access and refresh token patterns
- **MongoDB Aggregation**: Complex queries with nested pipelines
- **File Upload**: Multer + Cloudinary integration
- **Middleware Patterns**: Authentication and error handling
- **ES6 Modules**: Modern JavaScript with import/export
- **Async/Await**: Clean asynchronous code
- **Security Best Practices**: Password hashing, HTTP-only cookies

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

### How to Contribute
1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes** (follow the existing code style)
4. **Test your changes** thoroughly
5. **Commit your changes**
   ```bash
   git commit -m 'Add some amazing feature'
   ```
6. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

### Contribution Guidelines
- Follow the existing code structure and naming conventions
- Add comprehensive comments for new features
- Update README if adding new endpoints or features
- Ensure all environment variables are documented
- Test API endpoints before submitting PR

## 📝 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Author

**Prajjwal**
- GitHub: [@Prajjwal2051](https://github.com/Prajjwal2051)
- Project: [VidNest](https://github.com/Prajjwal2051/VidNest)

## 🎯 Roadmap

### Phase 1: Core Features (In Progress)
- [x] User authentication and authorization
- [x] Profile management (avatar, cover image)
- [x] Channel profiles with subscriber stats
- [x] Watch history tracking
- [x] JWT token management
- [x] File upload with Cloudinary

### Phase 2: Video Management (Upcoming)
- [ ] Video upload and processing
- [ ] Video streaming
- [ ] Video metadata (title, description, tags)
- [ ] Video thumbnails
- [ ] Video privacy settings

### Phase 3: Social Features (Planned)
- [ ] Comments system
- [ ] Like/Dislike functionality
- [ ] Subscription/Unsubscription
- [ ] Notifications
- [ ] User playlists

### Phase 4: Advanced Features (Future)
- [ ] Real-time notifications with WebSockets
- [ ] Live streaming functionality
- [ ] Advanced video analytics
- [ ] Video transcription and captions
- [ ] Multi-language support
- [ ] Video recommendations algorithm
- [ ] Mobile application (React Native)

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

## �🐛 Bug Reports & Feature Requests

Found a bug or want to request a feature? Please open an issue on our [GitHub Issues](https://github.com/Prajjwal2051/VidNest/issues) page.

### Reporting a Bug
Include:
- Description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Environment (OS, Node version, etc.)

## 💡 Support

If you find this project helpful:
- ⭐ **Star** the repository
- 🐛 **Report** bugs and issues
- 💡 **Suggest** new features
- 🤝 **Contribute** code improvements

## 📧 Contact

For questions or collaboration:
- GitHub: [@Prajjwal2051](https://github.com/Prajjwal2051)
- Project: [VidNest Repository](https://github.com/Prajjwal2051/VidNest)

---

<div align="center">

**Built with ❤️ by [Prajjwal](https://github.com/Prajjwal2051)**

*A comprehensive video platform backend demonstrating modern Node.js development practices*

[![GitHub Stars](https://img.shields.io/github/stars/Prajjwal2051/VidNest?style=social)](https://github.com/Prajjwal2051/VidNest/stargazers)
[![GitHub Forks](https://img.shields.io/github/forks/Prajjwal2051/VidNest?style=social)](https://github.com/Prajjwal2051/VidNest/network/members)
[![GitHub Issues](https://img.shields.io/github/issues/Prajjwal2051/VidNest)](https://github.com/Prajjwal2051/VidNest/issues)

</div>