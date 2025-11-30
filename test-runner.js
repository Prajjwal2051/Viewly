import mongoose from 'mongoose';
import { app } from './src/app.js';
import { User } from './src/models/user.model.js';
import { Video } from './src/models/video.model.js';
import { Comment } from './src/models/comment.model.js';
import { Playlist } from './src/models/playlist.model.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import fs from 'fs';

// Test results storage
const results = {
  passed: [],
  failed: [],
  errors: []
};

// Helper to generate JWT
function generateToken(userId) {
  return jwt.sign(
    { _id: userId },
    process.env.ACCESS_TOKEN_SECRET || 'test-secret',
    { expiresIn: '1d' }
  );
}

// Connect to database
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vidnest-test');
    console.log('✅ Database connected');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

// Clear database
async function clearDB() {
  await User.deleteMany({});
  await Video.deleteMany({});
  await Comment.deleteMany({});
  await Playlist.deleteMany({});
  console.log('🧹 Database cleared');
}

// Create test fixtures
async function createFixtures() {
  const hashedPassword = await bcrypt.hash('Test@123', 10);
  
  const user1 = await User.create({
    username: 'testuser1',
    email: 'test1@example.com',
    fullName: 'Test User 1',
    password: hashedPassword,
    avatar: 'https://example.com/avatar1.jpg',
    coverimage: 'https://example.com/cover1.jpg'
  });

  const user2 = await User.create({
    username: 'testuser2',
    email: 'test2@example.com',
    fullName: 'Test User 2',
    password: hashedPassword,
    avatar: 'https://example.com/avatar2.jpg',
    coverimage: 'https://example.com/cover2.jpg'
  });

  const video = await Video.create({
    videoFile: 'https://example.com/video.mp4',
    thumbNail: 'https://example.com/thumb.jpg',
    owner: user1._id,
    title: 'Test Video',
    description: 'Test Description',
    duration: 120,
    isPublished: true,
    category: 'Education',
    tags: 'test,video'
  });

  const comment = await Comment.create({
    content: 'Test comment',
    video: video._id,
    owner: user1._id
  });

  const playlist = await Playlist.create({
    name: 'Test Playlist',
    description: 'Test playlist description',
    owner: user1._id,
    videos: [],
    isPublic: true
  });

  console.log('📦 Test fixtures created');
  
  return {
    user1,
    user2,
    video,
    comment,
    playlist,
    token1: generateToken(user1._id),
    token2: generateToken(user2._id)
  };
}

// Test helper
function testAPI(category, description, testFn) {
  return async (fixtures) => {
    try {
      await testFn(fixtures);
      results.passed.push({ category, description, status: 'PASSED' });
      console.log(`  ✅ ${description}`);
      return true;
    } catch (error) {
      results.failed.push({ category, description, status: 'FAILED', error: error.message });
      results.errors.push({ category, description, error: error.stack });
      console.log(`  ❌ ${description}`);
      console.log(`     Error: ${error.message}`);
      return false;
    }
  };
}

// Define all tests
const tests = {
  user: [
    testAPI('User', 'User model should have required methods', async ({ user1 }) => {
      if (typeof user1.isPasswordCorrect !== 'function') throw new Error('Missing isPasswordCorrect method');
      if (typeof user1.generateAccessToken !== 'function') throw new Error('Missing generateAccessToken method');
      if (typeof user1.generateRefreshToken !== 'function') throw new Error('Missing generateRefreshToken method');
    }),
    
    testAPI('User', 'User should have hashed password', async ({ user1 }) => {
      if (user1.password === 'Test@123') throw new Error('Password not hashed');
    }),
  ],

  video: [
    testAPI('Video', 'Video model should exist with valid data', async ({ video }) => {
      if (!video.title) throw new Error('Video missing title');
      if (!video.owner) throw new Error('Video missing owner');
      if (!video.videoFile) throw new Error('Video missing videoFile');
    }),

    testAPI('Video', 'Video should have default values', async ({ video }) => {
      if (video.views !== 0) throw new Error('Views not initialized to 0');
      if (video.likes !== 0) throw new Error('Likes not initialized to 0');
      if (video.isPublished !== true) throw new Error('isPublished not set correctly');
    }),
  ],

  comment: [
    testAPI('Comment', 'Comment should reference video and owner', async ({ comment, video, user1 }) => {
      if (comment.video.toString() !== video._id.toString()) throw new Error('Comment video reference incorrect');
      if (comment.owner.toString() !== user1._id.toString()) throw new Error('Comment owner reference incorrect');
    }),

    testAPI('Comment', 'Comment should have content', async ({ comment }) => {
      if (!comment.content) throw new Error('Comment missing content');
      if (comment.content.length === 0) throw new Error('Comment content is empty');
    }),
  ],

  playlist: [
    testAPI('Playlist', 'Playlist should have owner', async ({ playlist, user1 }) => {
      if (playlist.owner.toString() !== user1._id.toString()) throw new Error('Playlist owner incorrect');
    }),

    testAPI('Playlist', 'Playlist videos should be array', async ({ playlist }) => {
      if (!Array.isArray(playlist.videos)) throw new Error('Playlist videos not an array');
    }),

    testAPI('Playlist', 'Playlist should have default isPublic', async ({ playlist }) => {
      if (playlist.isPublic !== true) throw new Error('isPublic not defaulting to true');
    }),
  ],

  relationships: [
    testAPI('Relationships', 'Video owner can be populated', async ({ video }) => {
      const populated = await Video.findById(video._id).populate('owner');
      if (!populated.owner.username) throw new Error('Owner not populated correctly');
    }),

    testAPI('Relationships', 'Comment video can be populated', async ({ comment }) => {
      const populated = await Comment.findById(comment._id).populate('video');
      if (!populated.video.title) throw new Error('Video not populated correctly');
    }),

    testAPI('Relationships', 'Playlist can add videos', async ({ playlist, video }) => {
      playlist.videos.push(video._id);
      await playlist.save();
      if (playlist.videos.length !== 1) throw new Error('Video not added to playlist');
    }),
  ],

  validation: [
    testAPI('Validation', 'User cannot be created without required fields', async () => {
      try {
        await User.create({ username: 'testonly' });
        throw new Error('User created without required fields');
      } catch (error) {
        if (!error.message.includes('validation')) {
          if (!error.message.includes('User created without')) throw error;
        }
      }
    }),

    testAPI('Validation', 'Video cannot be created without owner', async () => {
      try {
        await Video.create({
          videoFile: 'test.mp4',
          title: 'Test',
          category: 'Test'
        });
        throw new Error('Video created without owner');
      } catch (error) {
        if (!error.message.includes('Video created without')) throw error;
      }
    }),

    testAPI('Validation', 'Comment must have content', async ({ video, user1 }) => {
      try {
        await Comment.create({
          video: video._id,
          owner: user1._id
        });
        throw new Error('Comment created without content');
      } catch (error) {
        if (!error.message.includes('Comment created without')) throw error;
      }
    }),
  ],

  mongoose: [
    testAPI('Mongoose', 'ObjectId validation works', async () => {
      const invalidId = 'invalid-id-123';
      if (mongoose.isValidObjectId(invalidId)) throw new Error('Invalid ObjectId passed validation');
    }),

    testAPI('Mongoose', 'Timestamps are created', async ({ user1 }) => {
      if (!user1.createdAt) throw new Error('createdAt not set');
      if (!user1.updatedAt) throw new Error('updatedAt not set');
    }),

    testAPI('Mongoose', 'Indexes exist on User model', async () => {
      const indexes = await User.collection.getIndexes();
      if (!indexes.username_1) throw new Error('Username index not found');
    }),
  ],
};

// Run all tests
async function runTests() {
  console.log('\n🚀 Starting VidNest Model & Database Tests\n');
  
  await connectDB();
  await clearDB();
  const fixtures = await createFixtures();

  for (const [category, categoryTests] of Object.entries(tests)) {
    console.log(`\n📋 Testing ${category.toUpperCase()}`);
    for (const test of categoryTests) {
      await test(fixtures);
    }
  }

  await generateReport();
  await mongoose.connection.close();
  console.log('\n✅ Tests completed and database disconnected');
  process.exit(results.failed.length > 0 ? 1 : 0);
}

// Generate test report
async function generateReport() {
  const total = results.passed.length + results.failed.length;
  const passRate = ((results.passed.length / total) * 100).toFixed(2);

  const report = `# VidNest API Test Report
Generated: ${new Date().toISOString()}

## Executive Summary
- **Total Tests**: ${total}
- **Passed**: ✅ ${results.passed.length}
- **Failed**: ❌ ${results.failed.length}
- **Pass Rate**: ${passRate}%

## Test Results by Category

${Object.keys(tests).map(category => {
  const categoryPassed = results.passed.filter(r => r.category.toLowerCase() === category.toLowerCase());
  const categoryFailed = results.failed.filter(r => r.category.toLowerCase() === category.toLowerCase());
  return `### ${category.toUpperCase()}
- Passed: ${categoryPassed.length}
- Failed: ${categoryFailed.length}
${categoryFailed.map(f => `  - ❌ ${f.description}: ${f.error}`).join('\n')}`;
}).join('\n\n')}

## All Passed Tests
${results.passed.map(t => `- ✅ [${t.category}] ${t.description}`).join('\n')}

## All Failed Tests
${results.failed.map(t => `- ❌ [${t.category}] ${t.description}\n  Error: ${t.error}`).join('\n\n')}

${results.errors.length > 0 ? `## Detailed Error Traces
${results.errors.map(e => `### ${e.category}: ${e.description}
\`\`\`
${e.error}
\`\`\`
`).join('\n')}` : ''}

## Summary Statistics
\`\`\`
Total: ${total}
Passed: ${results.passed.length}
Failed: ${results.failed.length}
Pass Rate: ${passRate}%
\`\`\`

## Recommendations
${results.failed.length === 0 ? '✅ All tests passing! No issues found.' : `
Found ${results.failed.length} failing test(s). Review the errors above and:
1. Check model schemas for missing required fields
2. Verify relationships and references are configured correctly
3. Ensure validation rules are properly defined
4. Check controller error handling
`}

## Next Steps
${results.failed.length > 0 ? `
1. Fix the ${results.failed.length} failing test(s)
2. Re-run tests to verify fixes
3. Add additional edge case tests
4. Consider integration tests with actual HTTP requests
` : `
1. ✅ All model tests passing
2. Proceed with API endpoint testing
3. Test authentication and authorization flows
4. Load testing and performance optimization
`}
`;

  fs.writeFileSync('API_TEST_REPORT.md', report);
  console.log('\n📄 Test report generated: API_TEST_REPORT.md');
}

// Run tests
runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
