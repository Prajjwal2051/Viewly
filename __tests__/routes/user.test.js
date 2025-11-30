import request from 'supertest';
import { app } from '../../src/app.js';
import {
  setupTestDB,
  teardownTestDB,
  clearTestDB,
  createTestUser,
  generateTestToken
} from '../helpers/testHelpers.js';

describe('User API Tests', () => {
  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();
  });

  describe('POST /api/v1/users/register', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/v1/users/register')
        .field('username', 'newuser')
        .field('email', 'newuser@example.com')
        .field('fullName', 'New User')
        .field('password', 'Password@123')
        .attach('avatar', Buffer.from('fake-image'), 'avatar.jpg');

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user).toHaveProperty('username', 'newuser');
    });

    it('should fail without required fields', async () => {
      const response = await request(app)
        .post('/api/v1/users/register')
        .field('username', 'newuser');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should fail with duplicate username', async () => {
      await createTestUser({ username: 'existinguser', email: 'existing@example.com' });

      const response = await request(app)
        .post('/api/v1/users/register')
        .field('username', 'existinguser')
        .field('email', 'new@example.com')
        .field('fullName', 'New User')
        .field('password', 'Password@123')
        .attach('avatar', Buffer.from('fake-image'), 'avatar.jpg');

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
    });

    it('should fail without avatar', async () => {
      const response = await request(app)
        .post('/api/v1/users/register')
        .field('username', 'newuser')
        .field('email', 'newuser@example.com')
        .field('fullName', 'New User')
        .field('password', 'Password@123');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/users/login', () => {
    it('should login successfully with valid credentials', async () => {
      const user = await createTestUser({
        username: 'testuser',
        email: 'test@example.com',
        password: await require('bcrypt').hash('Test@123', 10)
      });

      const response = await request(app)
        .post('/api/v1/users/login')
        .send({
          email: 'test@example.com',
          password: 'Test@123'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
    });

    it('should fail with invalid credentials', async () => {
      await createTestUser({ email: 'test@example.com' });

      const response = await request(app)
        .post('/api/v1/users/login')
        .send({
          email: 'test@example.com',
          password: 'WrongPassword@123'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should fail without email', async () => {
      const response = await request(app)
        .post('/api/v1/users/login')
        .send({
          password: 'Test@123'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should fail without password', async () => {
      const response = await request(app)
        .post('/api/v1/users/login')
        .send({
          email: 'test@example.com'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/users/logout', () => {
    it('should logout successfully with valid token', async () => {
      const user = await createTestUser();
      const token = generateTestToken(user._id);

      const response = await request(app)
        .post('/api/v1/users/logout')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should fail without token', async () => {
      const response = await request(app)
        .post('/api/v1/users/logout');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should fail with invalid token', async () => {
      const response = await request(app)
        .post('/api/v1/users/logout')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/users/current-user', () => {
    it('should get current user with valid token', async () => {
      const user = await createTestUser();
      const token = generateTestToken(user._id);

      const response = await request(app)
        .get('/api/v1/users/current-user')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data.username).toBe(user.username);
    });

    it('should fail without token', async () => {
      const response = await request(app)
        .get('/api/v1/users/current-user');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PATCH /api/v1/users/change-password', () => {
    it('should change password successfully', async () => {
      const user = await createTestUser();
      const token = generateTestToken(user._id);

      const response = await request(app)
        .patch('/api/v1/users/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          oldPassword: 'Test@123',
          newPassword: 'NewPassword@123'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should fail with incorrect old password', async () => {
      const user = await createTestUser();
      const token = generateTestToken(user._id);

      const response = await request(app)
        .patch('/api/v1/users/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          oldPassword: 'WrongPassword@123',
          newPassword: 'NewPassword@123'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .patch('/api/v1/users/change-password')
        .send({
          oldPassword: 'Test@123',
          newPassword: 'NewPassword@123'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/users/c/:username', () => {
    it('should get user channel profile', async () => {
      const user = await createTestUser({ username: 'channeluser' });
      const viewer = await createTestUser();
      const token = generateTestToken(viewer._id);

      const response = await request(app)
        .get('/api/v1/users/c/channeluser')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('username', 'channeluser');
    });

    it('should fail with non-existent username', async () => {
      const user = await createTestUser();
      const token = generateTestToken(user._id);

      const response = await request(app)
        .get('/api/v1/users/c/nonexistentuser')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/users/history', () => {
    it('should get watch history', async () => {
      const user = await createTestUser();
      const token = generateTestToken(user._id);

      const response = await request(app)
        .get('/api/v1/users/history')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('watchHistory');
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .get('/api/v1/users/history');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
});
