# VidNest / Viewly — End-to-End User Interaction Flows

**Part of the [VidNest Documentation Series](./README.md)**  
**Author:** Prajjwal ([GitHub](https://github.com/Prajjwal2051))  

---

## 1. User Authentication & Session Lifecycle

```
[Register Form] ──> [Upload Avatar & Banner] ──> [Hash Password] ──> [Create User Doc]
                                                                            │
[Login Credentials] ──> [Verify Hash] ──> [Issue Access & Refresh Tokens] ──┘
                              │
                    [Set HttpOnly Cookies] ──> [Cache Session in Redis (24h)]
                              │
                    [Token Expiration (401)] ──> [Axios Interceptor Catches]
                              │
                    [Silent Token Refresh] ──> [Retry Original Request]
```

### Flow Details
1. **Registration**: User provides `fullName`, `email`, `username`, `password`, and profile image (`avatar`). Multer writes files to disk at `./public/temp/`. Cloudinary uploads the assets. The password is encrypted with `bcrypt` (10 salt rounds).
2. **Login**: User signs in with username/email and password. Upon verification, the backend issues:
   - `accessToken`: Short-lived (1 day), carried in HTTP-only cookie or Authorization header.
   - `refreshToken`: Long-lived (10 days), stored in HTTP-only cookie and hashed in the User document.
3. **Session Verification**: The `verifyJWT` middleware checks Redis (`session:<userId>:<token>`). If cached, authentication completes in under 2ms without hitting MongoDB.
4. **Silent Refresh**: When the access token expires, the client's Axios response interceptor intercepts the HTTP 401 response, calls `/api/v1/users/refresh-token`, obtains new cookies, and retries the original request seamlessly.
5. **Logout**: Invalidates the Redis session key, nullifies `refreshToken` in MongoDB, and triggers client cookie clearing.

---

## 2. Video Ingestion & Publishing Pipeline

```
[Select MP4 & Thumbnail] ──> [Multer Disk Spool (./public/temp)]
                                     │
                    [Validate Title & Category]
                                     │
                    [Cloudinary Auto-Transcoding & Upload]
                                     │
                    [Extract Duration & Cloud CDN URL] ──> [Unlink Local Temp Files]
                                     │
                    [Insert Video Document in MongoDB]
                                     │
                    [Purge Redis Caches (videos:list:*, dashboard:*)]
```

### Flow Details
1. **File Selection**: The creator selects a video file (mp4, webm up to 50MB) and custom thumbnail image (jpg, png up to 2MB).
2. **Multipart Ingestion**: Multer streams files into `./public/temp/`.
3. **Cloudinary Pipeline**: The server uploads the video with automatic format detection (`fetch_format: auto`, `quality: auto`). Cloudinary transcodes the stream and computes duration.
4. **Cleanup**: Upon confirmation of the Cloudinary upload, local disk files are deleted via `fs.unlinkSync`.
5. **Persistence & Cache Eviction**: A new `Video` document is saved in MongoDB. The controller invalidates `videos:list:*` and creator dashboard cache keys in Redis.

---

## 3. Video Playback & View Metrics

```
[User Navigates to /watch/:id] ──> [Check Redis Cache: video:<id>]
                                             │
                       ┌─────────────────────┴─────────────────────┐
                       ▼                                           ▼
                 [Cache Hit]                                 [Cache Miss]
                       │                                           │
             [Return Cached JSON]                        [Read from MongoDB]
                       │                                           │
                       │                                 [Cache in Redis (5 min)]
                       └─────────────────────┬─────────────────────┘
                                             ▼
                             [Atomic INCR in Redis Views]
                                             ▼
                             [Atomic $inc in MongoDB Views]
                                             ▼
                             [Stream Video via ReactPlayer]
```

### Flow Details
1. **Read-Through Cache**: When a user opens a video player page, the backend checks `video:<videoId>` in Redis.
2. **Database Fallback**: If missed, MongoDB finds the video by ID, populates channel owner details, and sets the Redis cache with a 300 s TTL.
3. **Dual View Increment**: The video's view counter is atomically incremented in Redis (`video:views:<videoId>`) and updated in MongoDB via `{ $inc: { views: 1 } }`.
4. **Watch History Tracking**: If the viewer is authenticated, the video ID is added to the user's `watchHistory` array in MongoDB.

---

## 4. Social Engagement (Likes, Comments & Subscriptions)

### 4.1 Like / Reaction Toggle
- Invokes `/api/v1/like/video/:videoId` (or comment/tweet).
- Checks if a `Like` record exists for `{ entityId, likedBy: userId }`.
- If found: Deletes the like record, decrements the entity's like counter (`$inc: -1`), and purges the like status cache.
- If not found: Creates a new `Like` document, increments the entity's like counter (`$inc: +1`), and purges the like status cache.

### 4.2 Comments & Threading
- Comments are created via `POST /api/v1/comments/:videoId`.
- Paginated comment retrieval uses MongoDB aggregation with populated author avatars and like counts.

### 4.3 Atomic Subscriptions
- Uses MongoDB sessions and transactions (`session.startTransaction()`).
- Atomically creates/removes the `Subscription` document and increments/decrements the channel creator's `subscriberCount` on the `User` model.
- Invalidates Redis subscriber caches and channel statistics.

---

## 5. Creator Analytics & Channel Dashboard

```
[Creator Opens Dashboard] ──> [Query Channel Metrics]
                                      │
            ┌─────────────────────────┼─────────────────────────┐
            ▼                         ▼                         ▼
   [Sum Total Views]        [Count Total Likes]      [Count Total Subscribers]
            │                         │                         │
            └─────────────────────────┼─────────────────────────┘
                                      ▼
                        [Compile Growth Time-Series]
                                      ▼
                       [Cache in Redis (10 min TTL)]
                                      ▼
                     [Render Charts via Recharts in UI]
```

---

*Continue to [06. Sequence Diagrams (Mermaid)](./06-sequence-diagrams.md)*
