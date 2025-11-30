import request from 'supertest';
import { app } from '../src/app.js';
import mongoose from 'mongoose';
import {
  setupTestDB,
  teardownTestDB,
  clearTestDB,
  createTestUser,
  createTestVideo,
  createTestComment,
  createTestPlaylist,
  createTestNotification,
  generateTestToken
} from './helpers/testHelpers.js';

// Test results storage
const testResults = {
  passed: [],
  failed: [],
  errors: [],
  summary: {}
};

// Helper to record test result
function recordTest(category, endpoint, method, status, success, error = null) {
  const result = {
    category,
    endpoint,
    method,
    status,
    success,
    error,
    timestamp: new Date().toISOString()
  };

  if (success) {
    testResults.passed.push(result);
  } else {
    testResults.failed.push(result);
    if (error) {
      testResults.errors.push({ ...result, errorDetails: error });
    }
  }
}

describe('VidNest API Comprehensive Testing', () => {
  let testUser, testUser2, testToken, testToken2;
  let testVideo, testComment, testPlaylist, testNotification;

  beforeAll(async () => {
    await setupTestDB();
    console.log('🚀 Starting comprehensive API tests...');
  });

  afterAll(async () => {
    await generateTestReport();
    await teardownTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();
    
    // Create test fixtures
    testUser = await createTestUser({
      username: 'testuser1',
      email: 'test1@example.com'
    });
    testUser2 = await createTestUser({
      username: 'testuser2',
      email: 'test2@example.com'
    });
    
    testToken = generateTestToken(testUser._id);
    testToken2 = generateTestToken(testUser2._id);
    
    testVideo = await createTestVideo(testUser);
    testComment = await createTestComment(testVideo, testUser);
    testPlaylist = await createTestPlaylist(testUser);
    testNotification = await createTestNotification(testUser, testUser2);
  });

  // ==========================================
  // USER ROUTES TESTS
  // ==========================================
  describe('User API', () => {
    test('GET /api/v1/users/current-user - Should get current user', async () => {
      try {
        const res = await request(app)
          .get('/api/v1/users/current-user')
          .set('Authorization', `Bearer ${testToken}`);
        
        recordTest('User', '/api/v1/users/current-user', 'GET', res.status, res.status === 200);
        expect(res.status).toBe(200);
      } catch (error) {
        recordTest('User', '/api/v1/users/current-user', 'GET', 500, false, error.message);
        throw error;
      }
    });

    test('GET /api/v1/users/current-user - Should fail without token', async () => {
      try {
        const res = await request(app)
          .get('/api/v1/users/current-user');
        
        recordTest('User', '/api/v1/users/current-user (no auth)', 'GET', res.status, res.status === 401);
        expect(res.status).toBe(401);
      } catch (error) {
        recordTest('User', '/api/v1/users/current-user (no auth)', 'GET', 500, false, error.message);
      }
    });

    test('GET /api/v1/users/c/:username - Should get channel profile', async () => {
      try {
        const res = await request(app)
          .get(`/api/v1/users/c/${testUser.username}`)
          .set('Authorization', `Bearer ${testToken}`);
        
        recordTest('User', '/api/v1/users/c/:username', 'GET', res.status, res.status === 200);
        expect(res.status).toBe(200);
      } catch (error) {
        recordTest('User', '/api/v1/users/c/:username', 'GET', 500, false, error.message);
        throw error;
      }
    });

    test('GET /api/v1/users/history - Should get watch history', async () => {
      try {
        const res = await request(app)
          .get('/api/v1/users/history')
          .set('Authorization', `Bearer ${testToken}`);
        
        recordTest('User', '/api/v1/users/history', 'GET', res.status, res.status === 200);
        expect(res.status).toBe(200);
      } catch (error) {
        recordTest('User', '/api/v1/users/history', 'GET', 500, false, error.message);
        throw error;
      }
    });
  });

  // ==========================================
  // VIDEO ROUTES TESTS
  // ==========================================
  describe('Video API', () => {
    test('GET /api/v1/videos - Should get all videos', async () => {
      try {
        const res = await request(app).get('/api/v1/videos');
        recordTest('Video', '/api/v1/videos', 'GET', res.status, res.status === 200);
        expect(res.status).toBe(200);
      } catch (error) {
        recordTest('Video', '/api/v1/videos', 'GET', 500, false, error.message);
        throw error;
      }
    });

    test('GET /api/v1/videos/:videoId - Should get video by ID', async () => {
      try {
        const res = await request(app).get(`/api/v1/videos/${testVideo._id}`);
        recordTest('Video', '/api/v1/videos/:videoId', 'GET', res.status, res.status === 200);
        expect(res.status).toBe(200);
      } catch (error) {
        recordTest('Video', '/api/v1/videos/:videoId', 'GET', 500, false, error.message);
        throw error;
      }
    });

    test('GET /api/v1/videos/:videoId - Should fail with invalid ID', async () => {
      try {
        const res = await request(app).get('/api/v1/videos/invalid-id');
        recordTest('Video', '/api/v1/videos/:videoId (invalid)', 'GET', res.status, res.status === 400);
        expect(res.status).toBe(400);
      } catch (error) {
        recordTest('Video', '/api/v1/videos/:videoId (invalid)', 'GET', 500, false, error.message);
      }
    });

    test('PATCH /api/v1/videos/:videoId - Should update video (owner)', async () => {
      try {
        const res = await request(app)
          .patch(`/api/v1/videos/${testVideo._id}`)
          .set('Authorization', `Bearer ${testToken}`)
          .send({ title: 'Updated Title' });
        
        recordTest('Video', '/api/v1/videos/:videoId', 'PATCH', res.status, res.status === 200);
        expect(res.status).toBe(200);
      } catch (error) {
        recordTest('Video', '/api/v1/videos/:videoId', 'PATCH', 500, false, error.message);
        throw error;
      }
    });

    test('PATCH /api/v1/videos/:videoId - Should fail (not owner)', async () => {
      try {
        const res = await request(app)
          .patch(`/api/v1/videos/${testVideo._id}`)
          .set('Authorization', `Bearer ${testToken2}`)
          .send({ title: 'Updated Title' });
        
        recordTest('Video', '/api/v1/videos/:videoId (not owner)', 'PATCH', res.status, res.status === 403);
        expect(res.status).toBe(403);
      } catch (error) {
        recordTest('Video', '/api/v1/videos/:videoId (not owner)', 'PATCH', 500, false, error.message);
      }
    });

    test('DELETE /api/v1/videos/:videoId - Should fail (not owner)', async () => {
      try {
        const res = await request(app)
          .delete(`/api/v1/videos/${testVideo._id}`)
          .set('Authorization', `Bearer ${testToken2}`);
        
        recordTest('Video', '/api/v1/videos/:videoId (not owner)', 'DELETE', res.status, res.status === 403);
        expect(res.status).toBe(403);
      } catch (error) {
        recordTest('Video', '/api/v1/videos/:videoId (not owner)', 'DELETE', 500, false, error.message);
      }
    });
  });

  // ==========================================
  // COMMENT ROUTES TESTS
  // ==========================================
  describe('Comment API', () => {
    test('GET /api/v1/comments/:videoId - Should get video comments', async () => {
      try {
        const res = await request(app).get(`/api/v1/comments/${testVideo._id}`);
        recordTest('Comment', '/api/v1/comments/:videoId', 'GET', res.status, res.status === 200);
        expect(res.status).toBe(200);
      } catch (error) {
        recordTest('Comment', '/api/v1/comments/:videoId', 'GET', 500, false, error.message);
        throw error;
      }
    });

    test('POST /api/v1/comments - Should create comment', async () => {
      try {
        const res = await request(app)
          .post('/api/v1/comments')
          .set('Authorization', `Bearer ${testToken}`)
          .send({
            videoId: testVideo._id.toString(),
            content: 'Test comment'
          });
        
        recordTest('Comment', '/api/v1/comments', 'POST', res.status, res.status === 201);
        expect(res.status).toBe(201);
      } catch (error) {
        recordTest('Comment', '/api/v1/comments', 'POST', 500, false, error.message);
        throw error;
      }
    });

    test('POST /api/v1/comments - Should fail without auth', async () => {
      try {
        const res = await request(app)
          .post('/api/v1/comments')
          .send({
            videoId: testVideo._id.toString(),
            content: 'Test comment'
          });
        
        recordTest('Comment', '/api/v1/comments (no auth)', 'POST', res.status, res.status === 401);
        expect(res.status).toBe(401);
      } catch (error) {
        recordTest('Comment', '/api/v1/comments (no auth)', 'POST', 500, false, error.message);
      }
    });

    test('PATCH /api/v1/comments/:commentId - Should update own comment', async () => {
      try {
        const res = await request(app)
          .patch(`/api/v1/comments/${testComment._id}`)
          .set('Authorization', `Bearer ${testToken}`)
          .send({ content: 'Updated comment' });
        
        recordTest('Comment', '/api/v1/comments/:commentId', 'PATCH', res.status, res.status === 200);
        expect(res.status).toBe(200);
      } catch (error) {
        recordTest('Comment', '/api/v1/comments/:commentId', 'PATCH', 500, false, error.message);
        throw error;
      }
    });

    test('DELETE /api/v1/comments/:commentId - Should fail (not owner)', async () => {
      try {
        const res = await request(app)
          .delete(`/api/v1/comments/${testComment._id}`)
          .set('Authorization', `Bearer ${testToken2}`);
        
        recordTest('Comment', '/api/v1/comments/:commentId (not owner)', 'DELETE', res.status, res.status === 403);
        expect(res.status).toBe(403);
      } catch (error) {
        recordTest('Comment', '/api/v1/comments/:commentId (not owner)', 'DELETE', 500, false, error.message);
      }
    });
  });

  // ==========================================
  // LIKE ROUTES TESTS
  // ==========================================
  describe('Like API', () => {
    test('POST /api/v1/like/video/:videoId - Should toggle video like', async () => {
      try {
        const res = await request(app)
          .post(`/api/v1/like/video/${testVideo._id}`)
          .set('Authorization', `Bearer ${testToken}`);
        
        recordTest('Like', '/api/v1/like/video/:videoId', 'POST', res.status, res.status === 200);
        expect(res.status).toBe(200);
      } catch (error) {
        recordTest('Like', '/api/v1/like/video/:videoId', 'POST', 500, false, error.message);
        throw error;
      }
    });

    test('POST /api/v1/like/comment/:commentId - Should toggle comment like', async () => {
      try {
        const res = await request(app)
          .post(`/api/v1/like/comment/${testComment._id}`)
          .set('Authorization', `Bearer ${testToken}`);
        
        recordTest('Like', '/api/v1/like/comment/:commentId', 'POST', res.status, res.status === 200);
        expect(res.status).toBe(200);
      } catch (error) {
        recordTest('Like', '/api/v1/like/comment/:commentId', 'POST', 500, false, error.message);
        throw error;
      }
    });

    test('GET /api/v1/like/videos - Should get liked videos', async () => {
      try {
        const res = await request(app)
          .get('/api/v1/like/videos')
          .set('Authorization', `Bearer ${testToken}`);
        
        recordTest('Like', '/api/v1/like/videos', 'GET', res.status, res.status === 200);
        expect(res.status).toBe(200);
      } catch (error) {
        recordTest('Like', '/api/v1/like/videos', 'GET', 500, false, error.message);
        throw error;
      }
    });

    test('POST /api/v1/like/video/:videoId - Should fail without auth', async () => {
      try {
        const res = await request(app)
          .post(`/api/v1/like/video/${testVideo._id}`);
        
        recordTest('Like', '/api/v1/like/video/:videoId (no auth)', 'POST', res.status, res.status === 401);
        expect(res.status).toBe(401);
      } catch (error) {
        recordTest('Like', '/api/v1/like/video/:videoId (no auth)', 'POST', 500, false, error.message);
      }
    });
  });

  // ==========================================
  // PLAYLIST ROUTES TESTS
  // ==========================================
  describe('Playlist API', () => {
    test('GET /api/v1/playlists/:playlistId - Should get playlist by ID', async () => {
      try {
        const res = await request(app).get(`/api/v1/playlists/${testPlaylist._id}`);
        recordTest('Playlist', '/api/v1/playlists/:playlistId', 'GET', res.status, res.status === 200);
        expect(res.status).toBe(200);
      } catch (error) {
        recordTest('Playlist', '/api/v1/playlists/:playlistId', 'GET', 500, false, error.message);
        throw error;
      }
    });

    test('POST /api/v1/playlists - Should create playlist', async () => {
      try {
        const res = await request(app)
          .post('/api/v1/playlists')
          .set('Authorization', `Bearer ${testToken}`)
          .send({
            name: 'New Playlist',
            description: 'Test playlist',
            isPublic: true
          });
        
        recordTest('Playlist', '/api/v1/playlists', 'POST', res.status, res.status === 201);
        expect(res.status).toBe(201);
      } catch (error) {
        recordTest('Playlist', '/api/v1/playlists', 'POST', 500, false, error.message);
        throw error;
      }
    });

    test('GET /api/v1/playlists/user/:userId - Should get user playlists', async () => {
      try {
        const res = await request(app)
          .get(`/api/v1/playlists/user/${testUser._id}`)
          .set('Authorization', `Bearer ${testToken}`);
        
        recordTest('Playlist', '/api/v1/playlists/user/:userId', 'GET', res.status, res.status === 200);
        expect(res.status).toBe(200);
      } catch (error) {
        recordTest('Playlist', '/api/v1/playlists/user/:userId', 'GET', 500, false, error.message);
        throw error;
      }
    });

    test('PATCH /api/v1/playlists/:playlistId/add-video - Should add video', async () => {
      try {
        const res = await request(app)
          .patch(`/api/v1/playlists/${testPlaylist._id}/add-video`)
          .set('Authorization', `Bearer ${testToken}`)
          .send({ videoId: testVideo._id.toString() });
        
        recordTest('Playlist', '/api/v1/playlists/:playlistId/add-video', 'PATCH', res.status, res.status === 200);
        expect(res.status).toBe(200);
      } catch (error) {
        recordTest('Playlist', '/api/v1/playlists/:playlistId/add-video', 'PATCH', 500, false, error.message);
        throw error;
      }
    });

    test('DELETE /api/v1/playlists/:playlistId - Should fail (not owner)', async () => {
      try {
        const res = await request(app)
          .delete(`/api/v1/playlists/${testPlaylist._id}`)
          .set('Authorization', `Bearer ${testToken2}`);
        
        recordTest('Playlist', '/api/v1/playlists/:playlistId (not owner)', 'DELETE', res.status, res.status === 403);
        expect(res.status).toBe(403);
      } catch (error) {
        recordTest('Playlist', '/api/v1/playlists/:playlistId (not owner)', 'DELETE', 500, false, error.message);
      }
    });
  });

  // ==========================================
  // SUBSCRIPTION ROUTES TESTS
  // ==========================================
  describe('Subscription API', () => {
    test('POST /api/v1/subscription/c/:channelId - Should toggle subscription', async () => {
      try {
        const res = await request(app)
          .post(`/api/v1/subscription/c/${testUser2._id}`)
          .set('Authorization', `Bearer ${testToken}`);
        
        recordTest('Subscription', '/api/v1/subscription/c/:channelId', 'POST', res.status, res.status === 200);
        expect(res.status).toBe(200);
      } catch (error) {
        recordTest('Subscription', '/api/v1/subscription/c/:channelId', 'POST', 500, false, error.message);
        throw error;
      }
    });

    test('GET /api/v1/subscription/c/:channelId/subscribers - Should get subscribers', async () => {
      try {
        const res = await request(app)
          .get(`/api/v1/subscription/c/${testUser._id}/subscribers`);
        
        recordTest('Subscription', '/api/v1/subscription/c/:channelId/subscribers', 'GET', res.status, res.status === 200);
        expect(res.status).toBe(200);
      } catch (error) {
        recordTest('Subscription', '/api/v1/subscription/c/:channelId/subscribers', 'GET', 500, false, error.message);
        throw error;
      }
    });

    test('GET /api/v1/subscription/subscribed - Should get subscribed channels', async () => {
      try {
        const res = await request(app)
          .get('/api/v1/subscription/subscribed')
          .set('Authorization', `Bearer ${testToken}`);
        
        recordTest('Subscription', '/api/v1/subscription/subscribed', 'GET', res.status, res.status === 200);
        expect(res.status).toBe(200);
      } catch (error) {
        recordTest('Subscription', '/api/v1/subscription/subscribed', 'GET', 500, false, error.message);
        throw error;
      }
    });
  });

  // ==========================================
  // SEARCH ROUTES TESTS
  // ==========================================
  describe('Search API', () => {
    test('GET /api/v1/search - Should search videos', async () => {
      try {
        const res = await request(app).get('/api/v1/search?query=test');
        recordTest('Search', '/api/v1/search', 'GET', res.status, res.status === 200);
        expect(res.status).toBe(200);
      } catch (error) {
        recordTest('Search', '/api/v1/search', 'GET', 500, false, error.message);
        throw error;
      }
    });

    test('GET /api/v1/search - Should search with filters', async () => {
      try {
        const res = await request(app)
          .get('/api/v1/search')
          .query({
            query: 'test',
            category: 'Education',
            sortBy: 'views'
          });
        
        recordTest('Search', '/api/v1/search (with filters)', 'GET', res.status, res.status === 200);
        expect(res.status).toBe(200);
      } catch (error) {
        recordTest('Search', '/api/v1/search (with filters)', 'GET', 500, false, error.message);
        throw error;
      }
    });
  });

  // ==========================================
  // NOTIFICATION ROUTES TESTS
  // ==========================================
  describe('Notification API', () => {
    test('GET /api/v1/notifications - Should get notifications', async () => {
      try {
        const res = await request(app)
          .get('/api/v1/notifications')
          .set('Authorization', `Bearer ${testToken}`);
        
        recordTest('Notification', '/api/v1/notifications', 'GET', res.status, res.status === 200);
        expect(res.status).toBe(200);
      } catch (error) {
        recordTest('Notification', '/api/v1/notifications', 'GET', 500, false, error.message);
        throw error;
      }
    });

    test('PATCH /api/v1/notifications/:notificationId/read - Should mark as read', async () => {
      try {
        const res = await request(app)
          .patch(`/api/v1/notifications/${testNotification._id}/read`)
          .set('Authorization', `Bearer ${testToken}`);
        
        recordTest('Notification', '/api/v1/notifications/:notificationId/read', 'PATCH', res.status, res.status === 200);
        expect(res.status).toBe(200);
      } catch (error) {
        recordTest('Notification', '/api/v1/notifications/:notificationId/read', 'PATCH', 500, false, error.message);
        throw error;
      }
    });

    test('PATCH /api/v1/notifications/read-all - Should mark all as read', async () => {
      try {
        const res = await request(app)
          .patch('/api/v1/notifications/read-all')
          .set('Authorization', `Bearer ${testToken}`);
        
        recordTest('Notification', '/api/v1/notifications/read-all', 'PATCH', res.status, res.status === 200);
        expect(res.status).toBe(200);
      } catch (error) {
        recordTest('Notification', '/api/v1/notifications/read-all', 'PATCH', 500, false, error.message);
        throw error;
      }
    });
  });

  // ==========================================
  // DASHBOARD ROUTES TESTS
  // ==========================================
  describe('Dashboard API', () => {
    test('GET /api/v1/dashboard/stats/:channelId - Should get channel stats', async () => {
      try {
        const res = await request(app)
          .get(`/api/v1/dashboard/stats/${testUser._id}`)
          .set('Authorization', `Bearer ${testToken}`);
        
        recordTest('Dashboard', '/api/v1/dashboard/stats/:channelId', 'GET', res.status, res.status === 200);
        expect(res.status).toBe(200);
      } catch (error) {
        recordTest('Dashboard', '/api/v1/dashboard/stats/:channelId', 'GET', 500, false, error.message);
        throw error;
      }
    });

    test('GET /api/v1/dashboard/videos/:channelId - Should get channel videos', async () => {
      try {
        const res = await request(app)
          .get(`/api/v1/dashboard/videos/${testUser._id}`);
        
        recordTest('Dashboard', '/api/v1/dashboard/videos/:channelId', 'GET', res.status, res.status === 200);
        expect(res.status).toBe(200);
      } catch (error) {
        recordTest('Dashboard', '/api/v1/dashboard/videos/:channelId', 'GET', 500, false, error.message);
        throw error;
      }
    });
  });
});

// Generate comprehensive test report
async function generateTestReport() {
  const fs = await import('fs');
  
  testResults.summary = {
    total: testResults.passed.length + testResults.failed.length,
    passed: testResults.passed.length,
    failed: testResults.failed.length,
    passRate: ((testResults.passed.length / (testResults.passed.length + testResults.failed.length)) * 100).toFixed(2) + '%'
  };

  const report = `# VidNest API Test Report
Generated: ${new Date().toISOString()}

## Executive Summary
- **Total Tests**: ${testResults.summary.total}
- **Passed**: ✅ ${testResults.summary.passed}
- **Failed**: ❌ ${testResults.summary.failed}
- **Pass Rate**: ${testResults.summary.passRate}

## Test Results by Category

${generateCategoryBreakdown()}

## Passed Tests (${testResults.passed.length})
${testResults.passed.map(t => `- ✅ [${t.method}] ${t.endpoint} (${t.status})`).join('\n')}

## Failed Tests (${testResults.failed.length})
${testResults.failed.map(t => `- ❌ [${t.method}] ${t.endpoint} (${t.status})${t.error ? ` - ${t.error}` : ''}`).join('\n')}

## Detailed Error Analysis
${testResults.errors.map(e => `
### ${e.endpoint} (${e.method})
- **Status**: ${e.status}
- **Error**: ${e.errorDetails}
`).join('\n')}

## Recommendations
${generateRecommendations()}
`;

  fs.writeFileSync('API_TEST_REPORT.md', report);
  console.log('\n✅ Test report generated: API_TEST_REPORT.md');
}

function generateCategoryBreakdown() {
  const categories = {};
  
  [...testResults.passed, ...testResults.failed].forEach(test => {
    if (!categories[test.category]) {
      categories[test.category] = { passed: 0, failed: 0 };
    }
    if (test.success) {
      categories[test.category].passed++;
    } else {
      categories[test.category].failed++;
    }
  });

  return Object.entries(categories)
    .map(([cat, stats]) => `### ${cat}\n- Passed: ${stats.passed}\n- Failed: ${stats.failed}`)
    .join('\n\n');
}

function generateRecommendations() {
  const recommendations = [];
  
  if (testResults.failed.length > 0) {
    recommendations.push('- Review and fix failed test cases');
  }
  
  const authErrors = testResults.errors.filter(e => e.status === 401 || e.status === 403);
  if (authErrors.length > 0) {
    recommendations.push(`- ${authErrors.length} authentication/authorization errors detected - review JWT middleware`);
  }
  
  const validationErrors = testResults.errors.filter(e => e.status === 400);
  if (validationErrors.length > 0) {
    recommendations.push(`- ${validationErrors.length} validation errors - ensure input validation is consistent`);
  }
  
  return recommendations.length > 0 ? recommendations.join('\n') : '- All tests passing! ✅';
}
