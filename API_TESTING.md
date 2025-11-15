# 🧪 VidNest API Testing Guide

Complete guide for testing all video API endpoints using **Postman**, **Thunder Client**, or **cURL**.

---

## 📋 Prerequisites

1. **Start your server:**
   ```bash
   npm run dev
   ```

2. **Base URL:** `http://localhost:8000`

3. **Authentication Required:** Most endpoints need a JWT token
   - First register/login via user endpoints
   - Copy the `accessToken` from response
   - Use it in Authorization header

---

## 🔐 Step 0: Get Authentication Token

### Register User
```http
POST http://localhost:8000/api/v1/users/register
Content-Type: multipart/form-data

Fields:
- fullName: John Doe
- username: johndoe
- email: john@example.com
- password: password123
- avatar: [select image file]
- coverImage: [select image file] (optional)
```

### Login User
```http
POST http://localhost:8000/api/v1/users/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "user": {...},
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "..."
  }
}
```

**Copy the `accessToken` - you'll need it for protected routes!**

---

## 🎬 Video API Endpoints Testing

### 1. Upload Video (Protected) ✅

**Endpoint:** `POST /api/v1/videos`

**Headers:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: multipart/form-data
```

**Body (form-data):**
```
video: [select video file - .mp4, .mov, etc.]
thumbnail: [select image file - .jpg, .png]
title: My First Video Tutorial
description: This is an amazing tutorial about Node.js
category: Education
tags: nodejs, javascript, tutorial
```

**Postman Steps:**
1. Select `POST` method
2. URL: `http://localhost:8000/api/v1/videos`
3. Go to **Authorization** tab
   - Type: `Bearer Token`
   - Token: `[paste your accessToken]`
4. Go to **Body** tab
   - Select `form-data`
   - Add fields as shown above
   - For `video` and `thumbnail`, select "File" type and choose files
5. Click **Send**

**Expected Response (201):**
```json
{
  "statusCode": 201,
  "data": {
    "_id": "674d1234567890abcdef1234",
    "videoFile": "https://res.cloudinary.com/...",
    "thumbNail": "https://res.cloudinary.com/...",
    "title": "My First Video Tutorial",
    "description": "This is an amazing tutorial about Node.js",
    "duration": 125.5,
    "category": "Education",
    "tags": "nodejs, javascript, tutorial",
    "views": 0,
    "likes": 0,
    "dislikes": 0,
    "isPublished": true,
    "owner": {
      "_id": "...",
      "username": "johndoe",
      "fullName": "John Doe",
      "avatar": "..."
    },
    "createdAt": "2025-11-15T10:30:00.000Z",
    "updatedAt": "2025-11-15T10:30:00.000Z"
  },
  "message": "Video uploaded successfully",
  "success": true
}
```

**Copy the video `_id` from response for next tests!**

---

### 2. Get All Videos (Public) ✅

**Endpoint:** `GET /api/v1/videos`

**Headers:** None required (public endpoint)

**Query Parameters (all optional):**
```
page: 1
limit: 10
category: Education
tags: nodejs
search: tutorial
sortBy: views
sortOrder: desc
owner: [userId]
```

**Example URLs:**

```http
# Get first page (default 10 videos)
GET http://localhost:8000/api/v1/videos

# Get videos with pagination
GET http://localhost:8000/api/v1/videos?page=2&limit=5

# Filter by category
GET http://localhost:8000/api/v1/videos?category=Education

# Search in title and description
GET http://localhost:8000/api/v1/videos?search=nodejs

# Filter by tags
GET http://localhost:8000/api/v1/videos?tags=javascript

# Sort by views (most viewed first)
GET http://localhost:8000/api/v1/videos?sortBy=views&sortOrder=desc

# Combine multiple filters
GET http://localhost:8000/api/v1/videos?category=Education&sortBy=createdAt&sortOrder=desc&page=1&limit=20
```

**Expected Response (200):**
```json
{
  "statusCode": 200,
  "data": {
    "videos": [
      {
        "_id": "...",
        "videoFile": "...",
        "thumbNail": "...",
        "title": "...",
        "description": "...",
        "duration": 125.5,
        "views": 0,
        "likes": 0,
        "category": "Education",
        "owner": {
          "_id": "...",
          "username": "johndoe",
          "fullName": "John Doe",
          "avatar": "..."
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalVideos": 45,
      "videosPerPage": 10,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  },
  "message": "Successfully retrieved 10 videos",
  "success": true
}
```

---

### 3. Get Video By ID (Public) ✅

**Endpoint:** `GET /api/v1/videos/:videoId`

**Headers:** None required for public videos

**Example:**
```http
GET http://localhost:8000/api/v1/videos/674d1234567890abcdef1234
```

**Expected Response (200):**
```json
{
  "statusCode": 200,
  "data": {
    "_id": "674d1234567890abcdef1234",
    "videoFile": "https://res.cloudinary.com/...",
    "thumbNail": "https://res.cloudinary.com/...",
    "title": "My First Video Tutorial",
    "description": "This is an amazing tutorial about Node.js",
    "duration": 125.5,
    "views": 1,  // ⬆️ Incremented automatically!
    "likes": 0,
    "dislikes": 0,
    "category": "Education",
    "tags": "nodejs, javascript, tutorial",
    "owner": {
      "_id": "...",
      "username": "johndoe",
      "fullName": "John Doe",
      "avatar": "..."
    },
    "createdAt": "2025-11-15T10:30:00.000Z",
    "updatedAt": "2025-11-15T10:30:00.000Z"
  },
  "message": "Video fetched successfully",
  "success": true
}
```

**Note:** Views count increments with each request!

---

### 4. Update Video (Protected - Owner Only) ✅

**Endpoint:** `PATCH /api/v1/videos/:videoId`

**Headers:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: multipart/form-data
```

**Body (form-data) - All fields optional:**
```
title: Updated Video Title
description: Updated description with more details
thumbnail: [select new image file] (optional)
```

**Example:**
```http
PATCH http://localhost:8000/api/v1/videos/674d1234567890abcdef1234
Authorization: Bearer YOUR_ACCESS_TOKEN

Body (form-data):
- title: Advanced Node.js Tutorial
- description: Updated with more advanced concepts
- thumbnail: [new-thumbnail.jpg]
```

**Expected Response (200):**
```json
{
  "statusCode": 200,
  "data": {
    "_id": "674d1234567890abcdef1234",
    "title": "Advanced Node.js Tutorial",  // ✅ Updated
    "description": "Updated with more advanced concepts",  // ✅ Updated
    "thumbNail": "https://res.cloudinary.com/.../new-thumbnail.jpg",  // ✅ Updated
    "videoFile": "...",  // Unchanged
    "duration": 125.5,
    "views": 1,
    "owner": {...}
  },
  "message": "Video updated successfully",
  "success": true
}
```

**Error Cases:**

❌ **Not the owner (403):**
```json
{
  "statusCode": 403,
  "message": "You are not authorized to update this video",
  "success": false
}
```

❌ **Invalid video ID (400):**
```json
{
  "statusCode": 400,
  "message": "Invalid video ID",
  "success": false
}
```

❌ **Video not found (404):**
```json
{
  "statusCode": 404,
  "message": "Video not found",
  "success": false
}
```

---

### 5. Delete Video (Protected - Owner Only) ✅

**Endpoint:** `DELETE /api/v1/videos/:videoId`

**Headers:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Example:**
```http
DELETE http://localhost:8000/api/v1/videos/674d1234567890abcdef1234
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Expected Response (200):**
```json
{
  "statusCode": 200,
  "data": {},
  "message": "Video deleted successfully",
  "success": true
}
```

**What happens:**
1. ✅ Video file deleted from Cloudinary
2. ✅ Thumbnail deleted from Cloudinary
3. ✅ Video document deleted from MongoDB

**Error Cases:**

❌ **Not the owner (403):**
```json
{
  "statusCode": 403,
  "message": "You are not authorized to delete this video",
  "success": false
}
```

---

## 🧪 Testing Scenarios

### Scenario 1: Complete Video Lifecycle
1. ✅ Register/Login user → Get token
2. ✅ Upload video → Get video ID
3. ✅ Get all videos → See your video in list
4. ✅ Get video by ID → Views increment
5. ✅ Update video → Change title/thumbnail
6. ✅ Delete video → Video removed

### Scenario 2: Pagination Testing
1. Upload 25 videos
2. Test: `?limit=10` → Should get 10 videos
3. Test: `?page=2&limit=10` → Should get videos 11-20
4. Verify `pagination.totalPages` is correct

### Scenario 3: Authorization Testing
1. User A uploads video
2. User B tries to update User A's video → Should get 403
3. User B tries to delete User A's video → Should get 403

### Scenario 4: Search & Filter Testing
```http
# Upload videos with different categories
POST /api/v1/videos (category: "Education", tags: "nodejs")
POST /api/v1/videos (category: "Entertainment", tags: "music")
POST /api/v1/videos (category: "Education", tags: "python")

# Test filters
GET /api/v1/videos?category=Education
GET /api/v1/videos?tags=nodejs
GET /api/v1/videos?search=python
```

### Scenario 5: Edge Cases
```http
# Invalid video ID
GET /api/v1/videos/invalid-id → 400 Bad Request

# Non-existent video
GET /api/v1/videos/674d1234567890abcdef9999 → 404 Not Found

# Update without token
PATCH /api/v1/videos/674d... (no auth header) → 401 Unauthorized

# Empty update
PATCH /api/v1/videos/674d... (no fields) → 400 Bad Request
```

---

## 🛠️ Postman Collection Setup

### Create Collection: "VidNest API"

**Environment Variables:**
```
baseUrl: http://localhost:8000
accessToken: [paste after login]
videoId: [paste after upload]
```

**Use in requests:**
```
URL: {{baseUrl}}/api/v1/videos
Authorization: Bearer {{accessToken}}
```

---

## 🐛 Common Issues & Solutions

### Issue 1: "accessToken is required"
**Solution:** Add Authorization header with Bearer token

### Issue 2: "Thumbnail upload failed"
**Solution:** 
- Check Cloudinary credentials in `.env`
- Ensure file size is within limits
- Check file format (jpg, png, gif)

### Issue 3: "Invalid video ID"
**Solution:** Ensure you're using the correct MongoDB ObjectId format

### Issue 4: Views not incrementing
**Solution:** This is normal - each GET request increments views

### Issue 5: Can't delete/update video
**Solution:** Ensure you're logged in as the video owner

---

## 📊 Success Criteria

✅ Upload video successfully with both files  
✅ Get all videos with pagination  
✅ Search and filter work correctly  
✅ Get single video increments views  
✅ Update only works for owner  
✅ Delete removes from both Cloudinary and DB  
✅ Authorization properly blocks non-owners  
✅ Error messages are clear and helpful  

---

## 🎯 Next Steps

After testing all endpoints successfully:
1. Test with large video files (check upload limits)
2. Test concurrent requests (multiple users)
3. Test with invalid data (security testing)
4. Monitor Cloudinary storage usage
5. Check database for orphaned records

Happy Testing! 🚀
