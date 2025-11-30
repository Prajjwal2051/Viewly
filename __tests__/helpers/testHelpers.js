import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { User } from '../src/models/user.model.js';
import { Video } from '../src/models/video.model.js';
import { Comment } from '../src/models/comment.model.js';
import { Playlist } from '../src/models/playlist.model.js';
import { Notification } from '../src/models/notofication.model.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

let mongoServer;

// Setup MongoDB Memory Server
export const setupTestDB = async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  await mongoose.connect(mongoUri);
  console.log('✅ Test database connected');
};

// Cleanup test database
export const teardownTestDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
  console.log('✅ Test database disconnected');
};

// Clear all collections
export const clearTestDB = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
};

// Create test user
export const createTestUser = async (overrides = {}) => {
  const defaultUser = {
    username: `testuser_${Date.now()}`,
    email: `test_${Date.now()}@example.com`,
    fullName: 'Test User',
    password: await bcrypt.hash('Test@123', 10),
    avatar: 'https://example.com/avatar.jpg',
    coverimage: 'https://example.com/cover.jpg',
    ...overrides
  };

  const user = await User.create(defaultUser);
  return user;
};

// Generate JWT token
export const generateTestToken = (userId) => {
  return jwt.sign(
    { _id: userId },
    process.env.ACCESS_TOKEN_SECRET || 'test-secret-key',
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '1d' }
  );
};

// Create test video
export const createTestVideo = async (owner, overrides = {}) => {
  const defaultVideo = {
    videoFile: `https://example.com/video_${Date.now()}.mp4`,
    thumbNail: 'https://example.com/thumb.jpg',
    owner: owner._id,
    title: `Test Video ${Date.now()}`,
    description: 'Test video description',
    duration: 120,
    isPublished: true,
    category: 'Education',
    tags: 'test,video',
    ...overrides
  };

  const video = await Video.create(defaultVideo);
  return video;
};

// Create test comment
export const createTestComment = async (video, owner, overrides = {}) => {
  const defaultComment = {
    content: `Test comment ${Date.now()}`,
    video: video._id,
    owner: owner._id,
    ...overrides
  };

  const comment = await Comment.create(defaultComment);
  return comment;
};

// Create test playlist
export const createTestPlaylist = async (owner, overrides = {}) => {
  const defaultPlaylist = {
    name: `Test Playlist ${Date.now()}`,
    description: 'Test playlist description',
    owner: owner._id,
    videos: [],
    isPublic: true,
    ...overrides
  };

  const playlist = await Playlist.create(defaultPlaylist);
  return playlist;
};

// Create test notification
export const createTestNotification = async (recipient, sender, overrides = {}) => {
  const defaultNotification = {
    recipient: recipient._id,
    sender: sender._id,
    type: 'LIKE',
    message: 'Test notification',
    isRead: false,
    ...overrides
  };

  const notification = await Notification.create(defaultNotification);
  return notification;
};

// Mock Cloudinary
export const mockCloudinary = () => {
  return {
    uploadOnCloudinary: jest.fn().mockResolvedValue({
      url: 'https://cloudinary.com/test-file.jpg',
      public_id: 'test-public-id'
    }),
    deleteFromCloudinary: jest.fn().mockResolvedValue(true)
  };
};
