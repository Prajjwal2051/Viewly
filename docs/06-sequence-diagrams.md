# VidNest / Viewly — Mermaid Sequence Diagrams

**Part of the [VidNest Documentation Series](./README.md)**  
**Author:** Prajjwal ([GitHub](https://github.com/Prajjwal2051))  

This document contains full sequence diagrams modeling the critical interactions between client components, Express middleware, controllers, MongoDB, Redis, and external cloud services.

---

## 1. Dual-Token Authentication & Refresh Rotation

Illustrates user login, JWT cookie generation, Redis session storage, and transparent token refresh via Axios interceptors on HTTP 401.

```mermaid
sequenceDiagram
    autonumber
    actor User as User Browser
    participant Client as Viewly SPA (Axios)
    participant RateLimiter as Redis Rate Limiter
    participant Express as Express App (user.routes)
    participant UserCtrl as user.controller
    participant MDB as MongoDB (User Collection)
    participant Redis as Redis Cache

    Note over User, Redis: User Login Flow
    User->>Client: Enters credentials and clicks Login
    Client->>RateLimiter: POST /api/v1/users/login
    RateLimiter->>Express: Rate check OK (under 100 per 15min)
    Express->>UserCtrl: loginUser(req, res)
    UserCtrl->>MDB: findOne with username or email
    MDB-->>UserCtrl: Return user document (with password hash)
    UserCtrl->>UserCtrl: Compare password with bcrypt
    UserCtrl->>UserCtrl: Generate accessToken (1d) and refreshToken (10d)
    UserCtrl->>MDB: Update user.refreshToken
    UserCtrl->>Redis: setCache session:userId:token (TTL 24h)
    UserCtrl-->>Client: HTTP 200 (Sets HttpOnly Cookies: accessToken, refreshToken)
    Client-->>User: Redux dispatches loginSuccess, UI updates

    Note over User, Redis: Automatic Token Refresh Flow (401 Interceptor)
    User->>Client: Navigates to protected view (/dashboard)
    Client->>Express: GET /api/v1/dashboard/stats (Expired accessToken)
    Express-->>Client: HTTP 401 Unauthorized (Token expired)
    Note over Client: Axios Interceptor Catches 401
    Client->>Express: POST /api/v1/users/refresh-token (Sends refreshToken cookie)
    Express->>UserCtrl: refreshAccessToken()
    UserCtrl->>UserCtrl: Verify refreshToken with JWT secret
    UserCtrl->>MDB: findById(decoded._id)
    UserCtrl->>UserCtrl: Generate fresh accessToken and refreshToken
    UserCtrl->>MDB: Save updated refreshToken
    UserCtrl-->>Client: HTTP 200 (Sets new HttpOnly cookies)
    Note over Client: Retries original request with new token
    Client->>Express: GET /api/v1/dashboard/stats
    Express-->>Client: HTTP 200 Success (Returns dashboard data)
```

---

## 2. Video Upload & Media Ingestion Pipeline

Illustrates multipart file ingestion, Multer disk spooling, Cloudinary upload, duration calculation, and database persistence.

```mermaid
sequenceDiagram
    autonumber
    actor Creator as Creator / Client
    participant UploadUI as UploadPage (React)
    participant Multer as Multer Middleware
    participant LocalDisk as Server FS (./public/temp)
    participant VideoCtrl as video.controller
    participant Cloudinary as Cloudinary Cloud API
    participant MDB as MongoDB
    participant Redis as Redis Cache

    Creator->>UploadUI: Selects video.mp4, thumb.jpg and enters title
    UploadUI->>Multer: POST /api/v1/videos (multipart/form-data)
    Multer->>LocalDisk: Spool video to ./public/temp/video.mp4
    Multer->>LocalDisk: Spool thumb to ./public/temp/thumb.jpg
    Multer->>VideoCtrl: uploadVideo(req, res)

    VideoCtrl->>VideoCtrl: Validate title and category presence
    VideoCtrl->>Cloudinary: uploadOnCloudinary(tempVideoPath, resource_type: auto)
    Cloudinary-->>VideoCtrl: Return url, public_id, duration
    VideoCtrl->>LocalDisk: fs.unlinkSync(tempVideoPath) [Cleanup]

    VideoCtrl->>Cloudinary: uploadOnCloudinary(tempThumbPath)
    Cloudinary-->>VideoCtrl: Return url, public_id
    VideoCtrl->>LocalDisk: fs.unlinkSync(tempThumbPath) [Cleanup]

    VideoCtrl->>MDB: Video.create(videoFile, thumbNail, duration, owner, ...)
    MDB-->>VideoCtrl: Return newVideo document

    VideoCtrl->>Redis: Invalidate videos:list:*
    VideoCtrl->>Redis: Invalidate dashboard:*:ownerId:*
    VideoCtrl-->>UploadUI: HTTP 200 (ApiResponse with new video data)
    UploadUI-->>Creator: Shows "Video uploaded successfully" toast
```

---

## 3. Video Playback & Atomic View Count Increment

Illustrates Redis read-through caching for video playback and atomic view count increments across Redis and MongoDB.

```mermaid
sequenceDiagram
    autonumber
    actor Viewer as Viewer
    participant SPA as Viewly Player View
    participant Express as Express (video.routes)
    participant VideoCtrl as video.controller
    participant Redis as Redis Cache
    participant MDB as MongoDB (Video & User)

    Viewer->>SPA: Opens /watch/:videoId
    SPA->>Express: GET /api/v1/videos/:videoId
    Express->>VideoCtrl: getVideoById()

    VideoCtrl->>Redis: getCache(video:videoId)
    alt Redis Cache Hit
        Redis-->>VideoCtrl: Return cached video JSON
        VideoCtrl->>Redis: incrementCounter(video:views:videoId)
        VideoCtrl->>MDB: Video.findByIdAndUpdate views + 1
        VideoCtrl-->>SPA: HTTP 200 (Cached video data)
    else Redis Cache Miss
        Redis-->>VideoCtrl: Return null
        VideoCtrl->>MDB: Video.findById(videoId).populate(owner)
        MDB-->>VideoCtrl: Return video document
        VideoCtrl->>Redis: incrementCounter(video:views:videoId)
        VideoCtrl->>MDB: Video.findByIdAndUpdate views + 1
        VideoCtrl->>Redis: setCache(video:videoId, updatedVideo, 300)
        VideoCtrl-->>SPA: HTTP 200 (Fresh video document)
    end
    SPA-->>Viewer: Renders HTML5 video stream via ReactPlayer
```

---

## 4. Atomic Channel Subscription (MongoDB Transaction + Redis Purge)

Illustrates atomic follow/unfollow operations using MongoDB replica set transactions and cache invalidation.

```mermaid
sequenceDiagram
    autonumber
    actor User as Authenticated User
    participant SPA as Video Controls UI
    participant SubCtrl as subscription.controller
    participant MDB as MongoDB (Replica Set Session)
    participant Redis as Redis Cache

    User->>SPA: Clicks Subscribe on Channel
    SPA->>SubCtrl: POST /api/v1/subscription/c/:channelId
    SubCtrl->>SubCtrl: Validate channelId != userId (No self-subscription)
    SubCtrl->>MDB: Check if subscription document exists
    SubCtrl->>MDB: Start transaction session (startSession & startTransaction)

    alt Unsubscribe Action (Existing Subscription)
        SubCtrl->>MDB: Delete subscription document (session)
        SubCtrl->>MDB: Decrement channel subscriberCount by 1 (session)
        SubCtrl->>MDB: Commit transaction (session.commitTransaction)
        SubCtrl->>Redis: Invalidate subscriptions:subscribers:channelId:*
        SubCtrl->>Redis: Invalidate subscriptions:channels:userId:*
        SubCtrl->>Redis: Invalidate dashboard:stats:channelId
        SubCtrl-->>SPA: HTTP 200 (isSubscribed: false)
    else Subscribe Action (New Subscription)
        SubCtrl->>MDB: Create subscription document (session)
        SubCtrl->>MDB: Increment channel subscriberCount by 1 (session)
        SubCtrl->>MDB: Commit transaction (session.commitTransaction)
        SubCtrl->>Redis: Invalidate subscriptions:subscribers:channelId:*
        SubCtrl->>Redis: Invalidate subscriptions:channels:userId:*
        SubCtrl->>Redis: Invalidate dashboard:stats:channelId
        SubCtrl-->>SPA: HTTP 200 (isSubscribed: true)
    end
    SPA-->>User: Updates Button state (Subscribed) and increments counter
```

---

## 5. Advanced Video Search & Aggregation Pipeline

Illustrates multi-parameter video searching with text regex matching, duration ranges, sorting, and Redis caching.

```mermaid
sequenceDiagram
    autonumber
    actor User as User
    participant SearchUI as SearchPage / Header
    participant SearchCtrl as search.controller
    participant Redis as Redis Cache
    participant MDB as MongoDB (Aggregation Engine)

    User->>SearchUI: Enters "React Tutorial", category=Education, duration=10-30m
    SearchUI->>SearchCtrl: GET /api/v1/search?query=React&category=Education&minDuration=600&maxDuration=1800&page=1
    SearchCtrl->>SearchCtrl: Build searchFilter ($or: title regex, description regex, tags regex)
    SearchCtrl->>Redis: getCache(search:React:Education:...:page:1)

    alt Search Cache Hit
        Redis-->>SearchCtrl: Return cached results
        SearchCtrl-->>SearchUI: HTTP 200 (Cached video search results)
    else Search Cache Miss
        Redis-->>SearchCtrl: Return null
        SearchCtrl->>MDB: Video.aggregatePaginate([match, lookup owner, project], options)
        MDB-->>SearchCtrl: Return docs, totalDocs, totalPages, page
        SearchCtrl->>Redis: setCache(cacheKey, responseData, 300)
        SearchCtrl-->>SearchUI: HTTP 200 (Fresh search results)
    end
    SearchUI-->>User: Displays video cards grid and active filters
```

---

*Continue to [07. Complete API Reference](./07-api-reference.md)*
