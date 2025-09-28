# 🎬 VidNest

A modern video sharing platform built with Node.js and Express.js, similar to YouTube. Upload, share, and discover amazing videos in a seamless streaming experience.

## ✨ Features

- 🎥 **Video Upload & Streaming**: Upload and stream videos in multiple formats
- 👤 **User Authentication**: Secure user registration and login system
- 📱 **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- 🔍 **Video Search**: Find videos with advanced search functionality
- 💬 **Comments System**: Engage with videos through comments
- 👍 **Like/Dislike**: Rate videos and show appreciation
- 📊 **Analytics**: Track video views and user engagement
- 🎯 **Recommendations**: Personalized video suggestions
- 📂 **Playlists**: Create and manage custom video playlists
- 🔐 **Privacy Controls**: Public, unlisted, and private video options

## 🚀 Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB (assumed based on project structure)
- **Authentication**: JWT tokens
- **File Storage**: Local storage / Cloud storage
- **Video Processing**: FFmpeg (for video optimization)

## 📁 Project Structure

```
VidNest/
├── src/
│   ├── app.js              # Main application file
│   ├── index.js            # Server entry point
│   ├── constants.js        # Application constants
│   ├── controllers/        # Route controllers
│   ├── db/
│   │   └── db_connection.js # Database configuration
│   ├── middlewares/        # Custom middleware functions
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   └── utils/
│       └── asyncHandler.js # Async error handler
├── public/
│   └── temp/              # Temporary file storage
├── package.json
└── README.md
```

## 🛠️ Installation

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
   Create a `.env` file in the root directory:
   ```env
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/vidnest
   JWT_SECRET=your_jwt_secret_here
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 🔧 Usage

### For Users
1. **Sign up** for a new account or **login** to existing account
2. **Upload videos** using the upload interface
3. **Browse** and **watch** videos from other creators
4. **Like**, **comment**, and **subscribe** to channels
5. **Create playlists** to organize your favorite videos

### For Developers
- Check the `/src/routes/` directory for API endpoints
- Models are defined in `/src/models/`
- Controllers handle the business logic in `/src/controllers/`
- Middleware functions are in `/src/middlewares/`

## 🌐 API Endpoints

```
POST   /api/auth/register     # User registration
POST   /api/auth/login        # User login
GET    /api/videos            # Get all videos
POST   /api/videos            # Upload video
GET    /api/videos/:id        # Get specific video
PUT    /api/videos/:id        # Update video
DELETE /api/videos/:id        # Delete video
POST   /api/videos/:id/like   # Like/unlike video
POST   /api/videos/:id/comment # Add comment
```

## 🤝 Contributing

We welcome contributions to VidNest! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Commit your changes**
   ```bash
   git commit -m 'Add some amazing feature'
   ```
5. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
6. **Open a Pull Request**

## 📝 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Author

**Prajjwal**
- GitHub: [@Prajjwal2051](https://github.com/Prajjwal2051)
- Project: [VidNest](https://github.com/Prajjwal2051/VidNest)

## 🎯 Roadmap

- [ ] Real-time notifications
- [ ] Live streaming functionality
- [ ] Advanced video analytics
- [ ] Mobile application
- [ ] Video transcription and captions
- [ ] Multi-language support
- [ ] Advanced video filters and effects

## 🐛 Bug Reports & Feature Requests

Found a bug or want to request a feature? Please open an issue on our [GitHub Issues](https://github.com/Prajjwal2051/VidNest/issues) page.

## 💡 Support

If you find this project helpful, please give it a ⭐ on GitHub!

---

*Built with ❤️ by Prajjwal*