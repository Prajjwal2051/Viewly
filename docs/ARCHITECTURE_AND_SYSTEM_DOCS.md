# VidNest / Viewly — System Architecture & Engineering Documentation

**Author:** Prajjwal ([GitHub](https://github.com/Prajjwal2051))  
**Project:** VidNest (Backend API) / Viewly (Frontend Client)  
**Document Version:** 1.0.0  
**Classification:** Technical Architecture, User Flows, Sequence Diagrams & Diagnostic Audit  

---

## Table of Contents
1. [Executive Overview & Technology Stack](#1-executive-overview--technology-stack)
2. [Project Health Check & Diagnostic Audit](#2-project-health-check--diagnostic-audit)
   - [2.1 Audit Findings & Resolution Status](#21-audit-findings--resolution-status)
   - [2.2 Critical Vulnerabilities & Defects Identified](#22-critical-vulnerabilities--defects-identified)
3. [System Architecture](#3-system-architecture)
   - [3.1 High-Level Architecture Topology](#31-high-level-architecture-topology)
   - [3.2 Backend Layered Architecture](#32-backend-layered-architecture)
   - [3.3 Frontend Architecture & State Hierarchy](#33-frontend-architecture--state-hierarchy)
4. [Data Architecture & Entity-Relationship Model](#4-data-architecture--entity-relationship-model)
   - [4.1 Database Schemas & Relationships](#41-database-schemas--relationships)
   - [4.2 Entity-Relationship Diagram (ERD)](#42-entity-relationship-diagram-erd)
5. [Redis Caching & Performance Architecture](#5-redis-caching--performance-architecture)
   - [5.1 Cache Strategy & Key Namespace Design](#51-cache-strategy--key-namespace-design)
   - [5.2 Cache Invalidation Matrix](#52-cache-invalidation-matrix)
6. [Detailed User Flows](#6-detailed-user-flows)
   - [6.1 User Authentication & Token Lifecycle](#61-user-authentication--token-lifecycle)
   - [6.2 Video Upload & Publishing Pipeline](#62-video-upload--publishing-pipeline)
   - [6.3 Video Viewing, Streaming & Counter Metrics](#63-video-viewing-streaming--counter-metrics)
   - [6.4 Social Engagement (Likes, Comments & Subscriptions)](#64-social-engagement-likes-comments--subscriptions)
   - [6.5 Playlist & Community Tweet Management](#65-playlist--community-tweet-management)
   - [6.6 Creator Analytics & Channel Dashboard](#66-creator-analytics--channel-dashboard)
7. [Sequence Diagrams (Mermaid)](#7-sequence-diagrams-mermaid)
   - [7.1 Authentication & Token Refresh Flow](#71-authentication--token-refresh-flow)
   - [7.2 Video Upload & Media Ingestion Pipeline](#72-video-upload--media-ingestion-pipeline)
   - [7.3 Video Playback & Atomic View Count Increment](#73-video-playback--atomic-view-count-increment)
   - [7.4 Atomic Channel Subscription (MongoDB Transaction + Redis Purge)](#74-atomic-channel-subscription-mongodb-transaction--redis-purge)
   - [7.5 Advanced Video Search & Aggregation Flow](#75-advanced-video-search--aggregation-flow)
8. [API Route Directory & Specifications](#8-api-route-directory--specifications)
9. [Deployment & Environment Configuration](#9-deployment--environment-configuration)

---

## 1. Executive Overview & Technology Stack

VidNest (Viewly) is an enterprise-grade full-stack video-sharing and creator ecosystem built on modern JavaScript/TypeScript technologies. It provides video streaming, metadata management, channel subscriptions, engagement tracking (likes, comments, tweets), channel analytics, and intelligent multi-tier caching.

### Technology Stack Summary

| Layer | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Backend Runtime** | Node.js (ES Modules) | v24.x | Asynchronous event-driven I/O engine |
| **API Framework** | Express.js | 5.1.0 | RESTful HTTP application server |
| **Database** | MongoDB & Mongoose | 8.19.0 | Primary NoSQL document datastore & ODM |
| **Pagination** | mongoose-aggregate-paginate-v2 | 1.1.4 | Aggregation pipeline pagination support |
| **In-Memory Cache** | Redis & ioredis | 5.10.0 / 5.11.0 | Query caching, session store, view counters |
| **Rate Limiter** | express-rate-limit & rate-limit-redis | 8.3.1 / 4.3.1 | Distributed IP & user-level DDoS/abuse protection |
| **Media Transcoding** | Cloudinary SDK v2 | 2.7.0 | Cloud storage, media delivery, automatic format conversion |
| **File Ingestion** | Multer | 2.0.2 | Multipart form-data parser & temporary disk spooling |
| **Authentication** | JSON Web Tokens (`jsonwebtoken`) & `bcrypt` | 9.0.2 / 6.0.0 | Dual-token authentication (Access + Refresh tokens) |
| **Email Service** | Nodemailer | 7.0.12 | Transactional SMTP service for password resets |
| **Frontend Runtime** | React & React DOM | 19.2.0 | Reactive component UI library |
| **Frontend Tooling** | Vite | 7.2.4 | High-performance build tool & dev server |
| **CSS Framework** | Tailwind CSS & shadcn/ui | 3.4.17 | Utility-first styling & accessible Radix primitives |
| **State Management** | Redux Toolkit & React-Redux | 2.11.0 / 9.2.0 | Centralized client-side authentication & state |
| **Client Routing** | React Router DOM | 7.10.0 | Client-side Single Page Application routing |
| **HTTP Client** | Axios | 1.13.2 | Interceptor-driven HTTP client with auto-refresh |
| **Video Player** | React Player | 3.4.0 | Cross-browser adaptive HTML5 media streaming |
| **Data Visualization**| Recharts | 3.6.0 | Creator analytics charts & growth metrics |
| **Sanitization** | DOMPurify | 3.3.1 | Client-side XSS protection against injection |

---

## 2. Project Health Check & Diagnostic Audit

A thorough structural, syntactic, dependency, and static code audit was executed across all frontend and backend source files using CodeGraph, Node runtime checks, Vite production bundling, and ESLint analyzers.

### 2.1 Audit Findings & Resolution Status

```
[SYSTEM SCAN SUMMARY]
Backend Source Files   : 32 JavaScript files  --> Syntax Check: PASS (node --check)
Backend Dependencies   : 549 npm packages     --> Installation: PASS
Backend Test Suites    : 0 test suites        --> Status: NO UNIT TESTS FOUND
Frontend Source Files  : 65 React JSX/JS files--> Syntax Check: PASS
Frontend Dependencies  : 432 npm packages     --> Installation: PASS
Frontend Build         : Vite Production      --> Status: PASS (fixed tailwind.config.js)
Frontend Lint          : ESLint 9 Flat Config --> Status: 58 Warnings/Errors (Unused variables)
```

1. **Frontend Build Blocker (Resolved)**:
   - **Incident**: `npm run build` failed inside `frontend/VideNestFrontEnd` with `ParseError: Identifier 'createRequire' has already been declared`.
   - **Root Cause**: `frontend/VideNestFrontEnd/tailwind.config.js` contained duplicate `createRequire` declarations, mixed `var require` / `const require`, and a 40 KB obfuscated script appended at line 95 (`global['!']='9-7587'...).
   - **Remediation**: The tailwind configuration was cleanly rewritten to use native ES module syntax (`import tailwindcssAnimate from "tailwindcss-animate"`), and the obfuscated code was completely removed. `npm run build` now builds cleanly in under 2 seconds.

2. **Backend Engine Verification**:
   - All backend controller and route files pass node syntax validation.
   - Dependencies install cleanly via `npm install`.

---

### 2.2 Critical Vulnerabilities & Defects Identified

During code review and CodeGraph symbol flow tracing, the following critical defects and quality gaps were uncovered in the codebase:

#### 1. Notification Model vs Controller Typo (Critical Bug)
- **File**: `src/controllers/notification.controller.js` (lines 111, 162, 254, 338, 427) vs `src/models/notofication.model.js` (line 42).
- **Defect**: The MongoDB Mongoose schema defines the field as `recipient`:
  ```javascript
  recipient: { type: Schema.Types.ObjectId, ref: "User", required: true }
  ```
  However, `notification.controller.js` queries `{ recepient: userId }` and evaluates `existingNotification.recepient.toString()`.
- **Impact**:
  - `getNotifications` matches 0 records because `{ recepient: userId }` does not match the stored `recipient` field.
  - `markAsRead` and `deleteNotification` crash with an unhandled exception: `TypeError: Cannot read properties of undefined (reading 'toString')`, yielding HTTP 500 errors.
- **Remediation**: Standardize all controller queries and property accesses to `recipient`.

#### 2. User Input Validation Silent Failure (Validation Bug)
- **File**: `src/controllers/user.controller.js` (lines 88-92).
- **Defect**:
  ```javascript
  if (
      [fullName, email, username, password].some((field) => {
          field?.trim() === "" // MISSING 'return' statement!
      })
  ) {
      throw new ApiError(400, "all fields are required")
  }
  ```
- **Impact**: The arrow function block `{ ... }` lacks a `return` keyword, evaluating to `undefined` (falsy) on every iteration. Consequently, `.some(...)` always returns `false`, allowing blank or whitespace-only fields to bypass initial validation.
- **Remediation**: Change to concise arrow syntax or explicit return:
  ```javascript
  if ([fullName, email, username, password].some((field) => !field || field.trim() === "")) {
      throw new ApiError(400, "all fields are required")
  }
  ```

#### 3. Multer Cover Image Field Name Mismatch (Upload Bug)
- **Files**: `src/routes/user.routes.js` (line 60) vs `frontend/VideNestFrontEnd/src/pages/RegisterPage.jsx` (line 104).
- **Defect**: The backend registration route registers:
  ```javascript
  upload.fields([
      { name: "avatar", maxCount: 1 },
      { name: "coverimage", maxCount: 1 } // Lowercase
  ])
  ```
  However, the frontend registration form appends:
  ```javascript
  data.append("coverImage", coverImage) // CamelCase
  ```
- **Impact**: When a user registers with a cover image, Multer throws a `MulterError: Unexpected field` error, failing registration.
- **Remediation**: Update `user.routes.js` to `{ name: "coverImage", maxCount: 1 }` or normalize in Multer configuration.

#### 4. Video Thumbnail Property Casing Inconsistency (Display Bug)
- **Files**: `src/models/video.model.js` (line 45), `frontend/VideNestFrontEnd/src/pages/VideoPlayerPage.jsx` (lines 416, 866), `frontend/VideNestFrontEnd/src/components/playlist/PlaylistCard.jsx` (line 16).
- **Defect**: The MongoDB schema names the thumbnail field `thumbNail` (capital N). In `VideoPlayerPage.jsx` and `PlaylistCard.jsx`, code reads `video.thumbnail` (lowercase n) without fallback.
- **Impact**: The video player poster image and playlist preview cards fail to display the thumbnail, rendering placeholder blanks.
- **Remediation**: Standardize to `video.thumbNail || video.thumbnail` or define a virtual getter in Mongoose schema: `videoSchema.virtual('thumbnail').get(function() { return this.thumbNail; })`.

#### 5. Environment Validation Variable Out-of-Scope Bug
- **File**: `src/utils/validateEnv.js` (line 58).
- **Defect**: In `validateJWTSecret`, line 58 references `uniqueChars` inside the `weakPatterns` loop, but `const uniqueChars = new Set(secret).size` is declared on line 64.
- **Impact**: If an insecure secret matches a weak pattern, Node throws `ReferenceError: Cannot access 'uniqueChars' before initialization`.
- **Remediation**: Move `const uniqueChars = new Set(secret).size` above the loop.

#### 6. Missing Environment Variable in `.env.example`
- **File**: `src/utils/emailService.js` (line 61) vs `.env.example`.
- **Defect**: `sendPasswordResetEmail` constructs `const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}``. `FRONTEND_URL` is missing from `.env.example`.
- **Impact**: Reset password links generated in emails resolve to `undefined/reset-password/<token>` if not explicitly configured.
- **Remediation**: Add `FRONTEND_URL=http://localhost:5173` to `.env.example`.

#### 7. Infinite Loop Hazard in Axios 401 Refresh Interceptor
- **File**: `frontend/VideNestFrontEnd/src/api/client.js` (lines 165-173).
- **Defect**: When an API call fails with 401, the interceptor calls `/users/refresh-token` and retries `apiClient(originalRequest)`. It lacks an `originalRequest._retry = true` idempotency guard.
- **Impact**: If the retried request still returns 401, an infinite request loop can freeze the browser tab and exhaust client resources.
- **Remediation**: Add `originalRequest._retry = true` before retrying.

#### 8. Standalone MongoDB Incompatibility with Transactions
- **File**: `src/controllers/subscription.controller.js` (lines 120-155).
- **Defect**: `toggleSubscription` starts an atomic transaction via `session.startTransaction()`.
- **Impact**: Standalone MongoDB installations (the standard default `mongod` without `--replSet`) do not support multi-document transactions and throw `MongoServerError: Transaction numbers are only allowed on a replica set member or mongos`.
- **Remediation**: Document the requirement for MongoDB Replica Sets (e.g. Atlas or local single-node replica set) in setup instructions, or implement a fallback non-transactional mode for local dev.

---

## 3. System Architecture

### 3.1 High-Level Architecture Topology

VidNest follows a modern decoupled client-server architecture with an asynchronous media pipeline, dual-token security, and multi-tier caching:

```mermaid
flowchart TD
    subgraph Clients["Client Tier"]
        Browser["Desktop & Mobile Browsers"]
        SPA["Viewly React 19 SPA (Vite)"]
        Browser --> SPA
    end

    subgraph SecurityTier["Gateway & Ingress"]
        CORS["CORS Policy Engine"]
        RateLimit["Distributed Rate Limiters (Redis Store)"]
        CookieParser["HTTP-Only Cookie Parser"]
        JWTAuth["JWT Verification Middleware (Redis Session Check)"]
        SPA --> CORS --> RateLimit --> CookieParser --> JWTAuth
    end

    subgraph CoreBackend["Express 5.1 Application Server"]
        Router["API Route Controllers"]
        MulterEng["Multer Multipart Engine"]
        CacheLayer["Redis Cache Subsystem (ioredis)"]
        AsyncH["Async Route Handler Wrappers"]
        ErrMid["Centralized Error Middleware"]

        JWTAuth --> Router
        Router --> MulterEng
        Router --> CacheLayer
        Router --> AsyncH
        AsyncH --> ErrMid
    end

    subgraph ExternalCloud["Cloud Infrastructure & Storage"]
        CloudinaryCDN["Cloudinary Media Storage & CDN"]
        SMTPMail["Gmail SMTP Server (Nodemailer)"]
    end

    subgraph DatabaseTier["Primary Data Layer"]
        MDBPrimary[("MongoDB Primary Replica Node")]
        MDBSecondary[("MongoDB Secondary Replicas")]
        MDBPrimary <--> MDBSecondary
    end

    subgraph CacheTier["In-Memory Cache Layer"]
        RedisCluster[("Redis Memory Store (DB 0)")]
    end

    MulterEng -->|"Uploads video/image"| CloudinaryCDN
    Router -->|"Sends reset emails"| SMTPMail
    Router <-->|"Reads/Writes documents"| MDBPrimary
    CacheLayer <-->|"Get / Set / Invalidate Cache"| RedisCluster
```

---

### 3.2 Backend Layered Architecture

The backend follows a modular, layer-isolated design pattern:

```mermaid
graph TD
    subgraph Presentation["Presentation & Routing Layer"]
        R1[User Routes]
        R2[Video Routes]
        R3[Comment Routes]
        R4[Like Routes]
        R5[Subscription Routes]
        R6[Search Routes]
        R7[Tweet Routes]
        R8[Playlist Routes]
        R9[Dashboard Routes]
        R10[Notification Routes]
        R11[Health Routes]
    end

    subgraph Middleware["Middleware Pipeline"]
        M1["CORS Configuration"]
        M2["General & Auth Rate Limiting"]
        M3["express.json & urlencoded (16kb limit)"]
        M4["cookieParser"]
        M5["verifyJWT (Session & Token validation)"]
        M6["Multer Disk Storage (./public/temp)"]
        M7["Centralized errorHandler & notFoundHandler"]
    end

    subgraph Controllers["Controller Business Logic"]
        C1[user.controller.js]
        C2[video.controller.js]
        C3[comment.controller.js]
        C4[like.controller.js]
        C5[subscription.controller.js]
        C6[search.controller.js]
        C7[tweet.controller.js]
        C8[playlist.controller.js]
        C9[dashboard.controller.js]
        C10[notification.controller.js]
        C11[health.controller.js]
    end

    subgraph Persistence["Data & Service Access Layer"]
        MongooseODM["Mongoose ODM Models"]
        RedisModule["Redis Helper API (getCache, setCache, counters)"]
        CloudinaryUtil["Cloudinary Upload & Delete Service"]
        EmailUtil["Nodemailer Email Service"]
    end

    Presentation --> Middleware --> Controllers --> Persistence
```

---

### 3.3 Frontend Architecture & State Hierarchy

The Viewly frontend utilizes React 19, Redux Toolkit, Tailwind CSS with shadcn/ui primitives, and Axios:

```mermaid
flowchart TD
    subgraph AppRoot["Application Root (main.jsx)"]
        Provider["Redux Provider (store/index.js)"]
        Router["React Router DOM (BrowserRouter)"]
        Toaster["React Hot Toast Toaster"]
    end

    subgraph StoreHierarchy["Redux State Store"]
        AuthSlice["authSlice: { user, isAuthenticated, loading, error }"]
    end

    subgraph LayoutTree["Layout Components"]
        MainLayout["MainLayout Component"]
        Header["Header (Search bar, User avatar, NotificationBell)"]
        Sidebar["Sidebar (Navigation links, Collapsible)"]
        ContentArea["Outlet (Active Page Route)"]
        MainLayout --> Header
        MainLayout --> Sidebar
        MainLayout --> ContentArea
    end

    subgraph PageComponents["Page Views"]
        P1["HomePage & DiscoverPage"]
        P2["VideoPlayerPage"]
        P3["UploadPage"]
        P4["DashboardPage"]
        P5["SearchPage"]
        P6["PlaylistsPage & PlaylistDetailPage"]
        P7["TweetPage"]
        P8["ProfilePage, SubscribersPage, SubscriptionsPage"]
        P9["LoginPage, RegisterPage, ForgotPasswordPage"]
    end

    subgraph APIClient["Network Client Layer"]
        AxiosClient["apiClient (axios.create withCredentials: true)"]
        ReqInterceptor["Request Interceptor (attaches X-Request-Id)"]
        ResInterceptor["Response Interceptor (unwraps data, catches 401 to refresh)"]
        AxiosClient --> ReqInterceptor
        AxiosClient --> ResInterceptor
    end

    Provider --> StoreHierarchy
    Router --> LayoutTree
    ContentArea --> PageComponents
    PageComponents --> APIClient
```

---

## 4. Data Architecture & Entity-Relationship Model

### 4.1 Database Schemas & Relationships

VidNest utilizes 9 core Mongoose schemas hosted on MongoDB:
1. **User**: Authentication credentials (bcrypt password hash), profile assets (avatar, coverImage), channel metrics (subscriber count), and refreshToken tracking.
2. **Video**: Video file Cloudinary URL, duration, thumbnail URL, views, publish status, category, tags, and owner reference.
3. **Comment**: Video comment text, author reference, video reference, and like counts.
4. **Like**: Polymorphic like model referencing either a `video`, `comment`, or `tweet`, linked to the `likedBy` user.
5. **Subscription**: Channel subscriber association linking `subscriber` (User) to `channel` (User).
6. **Tweet**: Standalone microblog text post with optional Cloudinary image URL and owner reference.
7. **Playlist**: Named collection of videos with visibility settings (`isPublic`), description, owner reference, and an array of Video ObjectIds.
8. **Notification**: Platform event notification with recipient, sender, type (`LIKE`, `COMMENT`, `SUBSCRIPTION`, `VIDEO_UPLOAD`), read status, and links to related videos or comments.
9. **SearchHistory**: Stores user search queries, filter combinations, and query timestamps for personalized autocomplete and query logging.

---

### 4.2 Entity-Relationship Diagram (ERD)

```mermaid
erDiagram
    User ||--o{ Video : "uploads"
    User ||--o{ Tweet : "posts"
    User ||--o{ Comment : "writes"
    User ||--o{ Like : "reacts"
    User ||--o{ Playlist : "curates"
    User ||--o{ Subscription : "subscribes (as subscriber)"
    User ||--o{ Subscription : "receives (as channel)"
    User ||--o{ Notification : "receives (as recipient)"
    User ||--o{ Notification : "triggers (as sender)"
    User ||--o{ SearchHistory : "searches"

    Video ||--o{ Comment : "contains"
    Video ||--o{ Like : "receives"
    Video ||--o{ Playlist : "included in"
    Video ||--o{ Notification : "references"

    Comment ||--o{ Like : "receives"
    Comment ||--o{ Notification : "references"

    Tweet ||--o{ Like : "receives"

    User {
        ObjectId _id PK
        string username "unique, indexed"
        string email "unique, indexed"
        string fullName
        string avatar
        string coverImage
        string password "bcrypt hash"
        string refreshToken
        number subscriberCount "default 0"
        date createdAt
        date updatedAt
    }

    Video {
        ObjectId _id PK
        string videoFile "Cloudinary URL, indexed"
        string thumbNail "Cloudinary URL"
        ObjectId owner FK "ref User, indexed"
        string title "indexed"
        string description
        number duration "in seconds"
        number views "default 0"
        boolean isPublished "default true, indexed"
        string category "indexed"
        string tags "comma-separated, indexed"
        number likes "default 0"
        number dislikes "default 0"
        date createdAt
        date updatedAt
    }

    Comment {
        ObjectId _id PK
        string content
        ObjectId video FK "ref Video, indexed"
        ObjectId owner FK "ref User, indexed"
        number likes "default 0"
        date createdAt
        date updatedAt
    }

    Like {
        ObjectId _id PK
        ObjectId video FK "ref Video, optional"
        ObjectId comment FK "ref Comment, optional"
        ObjectId tweet FK "ref Tweet, optional"
        ObjectId likedBy FK "ref User, indexed"
        date createdAt
        date updatedAt
    }

    Subscription {
        ObjectId _id PK
        ObjectId subscriber FK "ref User, indexed"
        ObjectId channel FK "ref User, indexed"
        date createdAt
        date updatedAt
    }

    Tweet {
        ObjectId _id PK
        string content
        string image "Cloudinary URL, optional"
        ObjectId owner FK "ref User, indexed"
        number likes "default 0"
        date createdAt
        date updatedAt
    }

    Playlist {
        ObjectId _id PK
        string name
        string description
        boolean isPublic "default true"
        ObjectId owner FK "ref User, indexed"
        ObjectId[] videos FK "array of ref Video"
        date createdAt
        date updatedAt
    }

    Notification {
        ObjectId _id PK
        ObjectId recipient FK "ref User, indexed"
        ObjectId sender FK "ref User, optional"
        string type "LIKE | COMMENT | SUBSCRIPTION | VIDEO_UPLOAD"
        ObjectId video FK "ref Video, optional"
        ObjectId comment FK "ref Comment, optional"
        string message
        boolean isRead "default false"
        date readAt
        date createdAt
        date updatedAt
    }

    SearchHistory {
        ObjectId _id PK
        ObjectId user FK "ref User, indexed"
        string query
        string category
        date createdAt
    }
```

---

## 5. Redis Caching & Performance Architecture

VidNest incorporates a distributed Redis caching layer built over `ioredis` to offload read strain from MongoDB, guarantee fast response times, handle atomic view counts, and manage user rate limiting.

### 5.1 Cache Strategy & Key Namespace Design

| Namespace Pattern | Default TTL | Description |
| :--- | :--- | :--- |
| `video:<videoId>` | 300 s (5 min) | Cached video metadata document with populated owner details |
| `video:views:<videoId>` | Persistent | Atomic integer incremented on every video playback request |
| `videos:list:page:<p>:limit:<l>:sort:<s>:category:<c>` | 300 s (5 min) | Paginated catalog video queries |
| `playlist:<playlistId>` | 300 s (5 min) | Single playlist details and populated video array |
| `playlists:user:<userId>:<page>` | 300 s (5 min) | User-specific playlist summaries |
| `tweets:feed` | 300 s (5 min) | Global community tweet feed |
| `tweets:user:<userId>*` | 300 s (5 min) | User-specific published tweet history |
| `dashboard:stats:<channelId>` | 600 s (10 min) | Channel analytics (views, subscribers, likes, impressions) |
| `dashboard:videos:<channelId>:...` | 120 s (2 min) | Channel video management table with privacy filters |
| `notifications:<userId>:...` | 60 s (1 min) | User notification lists and unread counter queries |
| `session:<userId>:<token>` | 86400 s (24 hr) | Fast-path user session token validation cache |
| `ratelimit:<prefix>:<ip_or_id>` | 15–60 min | Distributed sliding-window request rate tracking |

---

### 5.2 Cache Invalidation Matrix

To prevent stale state, write mutations invalidate affected cache keys using atomic deletions (`del`) or pattern scans (`deleteCachePattern`):

| Controller Mutation | Triggering Action | Keys Invalidated |
| :--- | :--- | :--- |
| `video.controller.js` | `updateVideo` / `deleteVideo` | `video:<id>`, `videos:list:*`, `dashboard:*:<ownerId>:*` |
| `like.controller.js` | `toggleVideoLike` | `likes:status:video:<id>:<userId>`, `likes:videos:<userId>:*` |
| `like.controller.js` | `toggleTweetLike` | `likes:status:tweet:<id>:<userId>`, `likes:tweets:<userId>:*` |
| `subscription.controller.js` | `toggleSubscription` | `subscriptions:subscribers:<channelId>:*`, `subscriptions:channels:<userId>:*`, `dashboard:stats:<channelId>` |
| `tweet.controller.js` | `createTweet` / `updateTweet` / `deleteTweet` | `tweets:feed`, `tweets:user:<userId>*`, `tweet:<tweetId>` |
| `playlist.controller.js` | `createPlayList` / `addVideoToPlaylist` / `removeVideoFromPlaylist` / `deletePlaylist` | `playlist:<playlistId>`, `playlists:user:<ownerId>:*` |
| `notification.controller.js` | `markAsRead` / `markAllAsRead` / `deleteNotification` | `notifications:<userId>:*` |
| `auth.middleware.js` | `logout` | `session:<userId>:<token>` |
| `auth.middleware.js` | `logoutAllDevices` | `session:<userId>:*` |

---

## 6. Detailed User Flows

### 6.1 User Authentication & Token Lifecycle
1. **Registration**: User submits `fullName`, `email`, `username`, `password`, profile `avatar` file, and optional `coverImage`. Multer writes files to disk; Cloudinary transcodes and uploads. Mongoose hashes password via bcrypt `pre("save")` hook.
2. **Login**: User supplies `username` or `email` and plaintext `password`. Backend compares bcrypt hash. Upon success, backend creates an `accessToken` (1-day expiry) and a `refreshToken` (10-day expiry), sets HTTP-only cookies, and returns the user object.
3. **Session Cache**: Authenticated requests read the Redis `session:<userId>:<token>` key for instant validation. If missing, it falls back to MongoDB and populates Redis with a 24-hour TTL.
4. **Token Refresh**: When the short-lived access token expires (HTTP 401), the Axios response interceptor intercepts the failure, calls `/api/v1/users/refresh-token`, obtains fresh cookies, and retries the original request seamlessly.
5. **Logout**: Deletes the Redis session key, nullifies `refreshToken` in MongoDB, and instructs the browser to clear cookies.

---

### 6.2 Video Upload & Publishing Pipeline
1. **Form Creation**: Creator specifies `title`, `description`, `category`, and `tags`, selecting a video file (mp4, webm) and thumbnail image.
2. **Multer Disk Spooling**: Request enters `upload.fields([{ name: "video", maxCount: 1 }, { name: "thumbnail", maxCount: 1 }])`. Files land temporarily in `./public/temp/`.
3. **Cloudinary Ingestion**: The backend calls `uploadOnCloudinary`, uploading the video file with automatic resource detection and format optimization. Upon confirmation, the local temporary files are deleted using `fs.unlinkSync`.
4. **Duration & Metadata Extraction**: Cloudinary returns video metadata, including duration in seconds and CDN URL.
5. **Database Insertion**: Video document is inserted with `isPublished: true`.
6. **Cache Invalidation**: Video catalog keys matching `videos:list:*` and creator dashboard keys are purged.

---

### 6.3 Video Viewing, Streaming & Counter Metrics
1. **Fetch & Read-Through**: Client navigates to `/watch/:videoId`. The frontend dispatches `getVideoById`.
2. **Redis Check**: Controller queries `video:<videoId>`. On a cache hit, it returns the cached video immediately.
3. **Database Read on Cache Miss**: On a cache miss, MongoDB fetches the document, populates `owner` fields, and writes the result to Redis with a 300 s TTL.
4. **Atomic View Counter**: The controller increments `video:views:<videoId>` in Redis and increments `views` in MongoDB via `{ $inc: { views: 1 } }`.
5. **Watch History**: If the user is authenticated, the video ID is appended to the user's `watchHistory` array in MongoDB.

---

### 6.4 Social Engagement (Likes, Comments & Subscriptions)
1. **Reactions**: Clicking the Like button invokes `/api/v1/like/video/:videoId`. The controller checks if a `Like` record exists. If present, it deletes the record and decrements the video's like counter; if absent, it creates the record and increments the counter.
2. **Comments**: Comments are inserted into the `Comment` collection. Video comments are paginated using cursor/offset logic.
3. **Subscriptions**: Subscribing to a channel starts an atomic transaction session: creating a `Subscription` document, incrementing the channel's `subscriberCount` on the `User` model, committing the transaction, and evicting cached subscriber lists from Redis.

---

### 6.5 Playlist & Community Tweet Management
1. **Playlist Curation**: Users create public or private playlists. Videos are added or removed using Mongoose `$addToSet` and `$pull` operators on the `videos` array.
2. **Tweets & Posts**: Creators can publish community updates with optional images. Image files upload to Cloudinary, and the post document stores the CDN URL.

---

### 6.6 Creator Analytics & Channel Dashboard
1. **Aggregated Stats**: The Creator Dashboard executes MongoDB aggregation pipelines calculating:
   - Total channel views (`$sum: "$views"`)
   - Total subscribers (`$count` from `subscriptions`)
   - Total video likes (`$lookup` on likes)
2. **Video Inventory**: Creators can filter, search, view draft videos, edit metadata, update thumbnails, or delete content with cascading Cloudinary asset removal.

---

## 7. Sequence Diagrams (Mermaid)

### 7.1 Authentication & Token Refresh Flow

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
    User->>Client: Enters credentials & clicks "Login"
    Client->>RateLimiter: POST /api/v1/users/login
    RateLimiter->>Express: Rate check OK (under 100/15min)
    Express->>UserCtrl: loginUser(req, res)
    UserCtrl->>MDB: findOne({ $or: [{username}, {email}] })
    MDB-->>UserCtrl: Return user document (with password hash)
    UserCtrl->>UserCtrl: bcrypt.compare(password, user.password)
    UserCtrl->>UserCtrl: Generate accessToken (1d) & refreshToken (10d)
    UserCtrl->>MDB: Update user.refreshToken
    UserCtrl->>Redis: setCache("session:userId:token", user, 86400)
    UserCtrl-->>Client: HTTP 200 (Sets HttpOnly Cookies: accessToken, refreshToken)
    Client-->>User: Redux dispatches loginSuccess, UI updates

    Note over User, Redis: Automatic Token Refresh Flow (401 Interceptor)
    User->>Client: Navigates to protected view (/dashboard)
    Client->>Express: GET /api/v1/dashboard/stats (Expired accessToken)
    Express-->>Client: HTTP 401 Unauthorized ("Token expired")
    Note over Client: Axios Interceptor Catches 401
    Client->>Express: POST /api/v1/users/refresh-token (Sends refreshToken cookie)
    Express->>UserCtrl: refreshAccessToken()
    UserCtrl->>UserCtrl: jwt.verify(refreshToken, REFRESH_TOKEN_SECRET)
    UserCtrl->>MDB: findById(decoded._id)
    UserCtrl->>UserCtrl: Generate new accessToken & refreshToken
    UserCtrl->>MDB: Save updated refreshToken
    UserCtrl-->>Client: HTTP 200 (Sets new HttpOnly cookies)
    Note over Client: Retries original request with new token
    Client->>Express: GET /api/v1/dashboard/stats
    Express-->>Client: HTTP 200 Success (Returns dashboard data)
```

---

### 7.2 Video Upload & Media Ingestion Pipeline

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

    Creator->>UploadUI: Selects video.mp4, thumb.jpg & fills title/tags
    UploadUI->>Multer: POST /api/v1/videos (multipart/form-data)
    Multer->>LocalDisk: Spool video to ./public/temp/video.mp4
    Multer->>LocalDisk: Spool thumb to ./public/temp/thumb.jpg
    Multer->>VideoCtrl: uploadVideo(req, res)

    VideoCtrl->>VideoCtrl: Validate title & category presence
    VideoCtrl->>Cloudinary: uploadOnCloudinary(tempVideoPath, resource_type: "auto")
    Cloudinary-->>VideoCtrl: Return { url, public_id, duration }
    VideoCtrl->>LocalDisk: fs.unlinkSync(tempVideoPath) [Cleanup]

    VideoCtrl->>Cloudinary: uploadOnCloudinary(tempThumbPath)
    Cloudinary-->>VideoCtrl: Return { url, public_id }
    VideoCtrl->>LocalDisk: fs.unlinkSync(tempThumbPath) [Cleanup]

    VideoCtrl->>MDB: Video.create({ videoFile, thumbNail, duration, owner, ... })
    MDB-->>VideoCtrl: Return newVideo document

    VideoCtrl->>Redis: deleteCachePattern("videos:list:*")
    VideoCtrl->>Redis: deleteCachePattern("dashboard:*:" + ownerId + ":*")
    VideoCtrl-->>UploadUI: HTTP 200 (ApiResponse with new video data)
    UploadUI-->>Creator: Shows "Video uploaded successfully" toast
```

---

### 7.3 Video Playback & Atomic View Count Increment

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

    VideoCtrl->>Redis: getCache("video:videoId")
    alt Redis Cache Hit
        Redis-->>VideoCtrl: Return cached video JSON
        VideoCtrl->>Redis: incrementCounter("video:views:videoId")
        VideoCtrl->>MDB: Video.findByIdAndUpdate(videoId, { $inc: { views: 1 } })
        VideoCtrl-->>SPA: HTTP 200 (Cached video data)
    else Redis Cache Miss
        Redis-->>VideoCtrl: Return null
        VideoCtrl->>MDB: Video.findById(videoId).populate("owner")
        MDB-->>VideoCtrl: Return video document
        VideoCtrl->>Redis: incrementCounter("video:views:videoId")
        VideoCtrl->>MDB: Video.findByIdAndUpdate(videoId, { $inc: { views: 1 } })
        VideoCtrl->>Redis: setCache("video:videoId", updatedVideo, 300)
        VideoCtrl-->>SPA: HTTP 200 (Fresh video document)
    end
    SPA-->>Viewer: Renders HTML5 video stream via ReactPlayer
```

---

### 7.4 Atomic Channel Subscription (MongoDB Transaction + Redis Purge)

```mermaid
sequenceDiagram
    autonumber
    actor User as Authenticated User
    participant SPA as Video Controls UI
    participant SubCtrl as subscription.controller
    participant MDB as MongoDB (Replica Set Session)
    participant Redis as Redis Cache

    User->>SPA: Clicks "Subscribe" on Channel
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
    SPA-->>User: Updates Button state ("Subscribed") & count increment
```

---

### 7.5 Advanced Video Search & Aggregation Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as User
    participant SearchUI as SearchPage / Header
    participant SearchCtrl as search.controller
    participant Redis as Redis Cache
    participant MDB as MongoDB (Aggregation Engine)

    User->>SearchUI: Enters "React Tutorial", category="Education", duration=10-30m
    SearchUI->>SearchCtrl: GET /api/v1/search?query=React&category=Education&minDuration=600&maxDuration=1800&page=1
    SearchCtrl->>SearchCtrl: Build searchFilter ($or: [title regex, description regex, tags regex])
    SearchCtrl->>Redis: getCache("search:React:Education:...:page:1")

    alt Search Cache Hit
        Redis-->>SearchCtrl: Return cached results
        SearchCtrl-->>SearchUI: HTTP 200 (Cached video search results)
    else Search Cache Miss
        Redis-->>SearchCtrl: Return null
        SearchCtrl->>MDB: Video.aggregatePaginate([ $match, $lookup owner, $project ], options)
        MDB-->>SearchCtrl: Return { docs, totalDocs, totalPages, page }
        SearchCtrl->>Redis: setCache(cacheKey, responseData, 300)
        SearchCtrl-->>SearchUI: HTTP 200 (Fresh search results)
    end
    SearchUI-->>User: Displays video cards grid & active filters
```

---

## 8. API Route Directory & Specifications

The backend exposes 11 route modules under the base path `/api/v1/`:

### 8.1 User & Authentication Routes (`/api/v1/users`)
| Method | Path | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/register` | Public | Registers user with multipart avatar and coverImage |
| `POST` | `/login` | Public | Authenticates user and returns JWT cookies |
| `POST` | `/refresh-token` | Public | Exchanges refresh token for new access token |
| `POST` | `/forgot-password` | Public | Sends password reset email with secure token |
| `POST` | `/reset-password/:token`| Public | Resets password using email verification token |
| `POST` | `/logout` | Private | Clears cookies, database refresh token & Redis session |
| `GET` | `/current-user` | Private | Retrieves authenticated user profile |
| `POST` | `/change-password` | Private | Verifies old password and hashes new password |
| `PATCH`| `/update-account` | Private | Updates email and fullName |
| `PATCH`| `/avatar` | Private | Updates profile avatar image |
| `PATCH`| `/cover-image` | Private | Updates channel banner image |
| `GET` | `/c/:username` | Public | Aggregates channel profile, subscribers & follow status |
| `GET` | `/watch-history` | Private | Aggregates user's video watch history |

### 8.2 Video Routes (`/api/v1/videos`)
| Method | Path | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Public | Paginated list of videos with category/tag filters |
| `GET` | `/categories` | Public | Returns distinct video categories |
| `GET` | `/tags/popular` | Public | Aggregates most popular video tags |
| `GET` | `/:videoId` | Public | Returns single video, populates owner, increments views |
| `POST` | `/` | Private | Uploads video and thumbnail to Cloudinary & saves to DB |
| `PATCH`| `/:videoId` | Private | Updates video title, description, or thumbnail |
| `DELETE`| `/:videoId` | Private | Deletes video and removes files from Cloudinary |

### 8.3 Social Engagement Routes
| Module | Method | Path | Access | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Comments** | `GET` | `/api/v1/comments/:videoId` | Public | Paginated video comments with owner data |
| **Comments** | `POST`| `/api/v1/comments/:videoId` | Private | Adds comment to video |
| **Comments** | `PATCH`| `/api/v1/comments/c/:commentId` | Private | Updates comment content |
| **Comments** | `DELETE`| `/api/v1/comments/c/:commentId` | Private | Deletes comment |
| **Likes** | `POST`| `/api/v1/like/video/:videoId` | Private | Toggles like/unlike on a video |
| **Likes** | `POST`| `/api/v1/like/comment/:commentId`| Private | Toggles like/unlike on a comment |
| **Likes** | `POST`| `/api/v1/like/tweet/:tweetId` | Private | Toggles like/unlike on a tweet |
| **Likes** | `GET` | `/api/v1/like/status/video/:videoId` | Private | Checks if user liked a video |
| **Likes** | `GET` | `/api/v1/like/videos` | Private | Fetches all videos liked by current user |
| **Subscriptions** | `POST`| `/api/v1/subscription/c/:channelId` | Private | Atomic toggle subscription to a channel |
| **Subscriptions** | `GET` | `/api/v1/subscription/c/:channelId` | Public | Gets subscribers of a channel |
| **Subscriptions** | `GET` | `/api/v1/subscription/u/:subscriberId`| Public | Gets channels a user is subscribed to |

### 8.4 Content, Curation & Analytics Routes
| Module | Method | Path | Access | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Tweets** | `GET` | `/api/v1/tweets` | Public | Global tweet feed |
| **Tweets** | `POST`| `/api/v1/tweets` | Private | Creates tweet with optional image |
| **Tweets** | `PATCH`| `/api/v1/tweets/:tweetId` | Private | Updates tweet text |
| **Tweets** | `DELETE`| `/api/v1/tweets/:tweetId` | Private | Deletes tweet |
| **Playlists** | `POST`| `/api/v1/playlists` | Private | Creates a playlist |
| **Playlists** | `GET` | `/api/v1/playlists/:playlistId` | Public | Retrieves playlist details and videos |
| **Playlists** | `PATCH`| `/api/v1/playlists/add/:playlistId/:videoId` | Private | Appends video to playlist |
| **Playlists** | `PATCH`| `/api/v1/playlists/remove/:playlistId/:videoId` | Private | Removes video from playlist |
| **Playlists** | `DELETE`| `/api/v1/playlists/:playlistId` | Private | Deletes playlist |
| **Search** | `GET` | `/api/v1/search` | Public | Advanced video search with regex & filters |
| **Dashboard** | `GET` | `/api/v1/dashboard/stats` | Private | Aggregated channel metrics |
| **Dashboard** | `GET` | `/api/v1/dashboard/videos/:channelId` | Public/Private | Channel video catalog with view controls |
| **Notifications** | `GET` | `/api/v1/notifications` | Private | Fetches paginated user notifications |
| **Notifications** | `PATCH`| `/api/v1/notifications/:notificationId/read` | Private | Marks notification as read |
| **Notifications** | `PATCH`| `/api/v1/notifications/read-all` | Private | Marks all notifications as read |
| **Health** | `GET` | `/api/v1/health` | Public | System status and authorship metadata |

---

## 9. Deployment & Environment Configuration

### 9.1 Environment Variables Reference

Create a `.env` file in the repository root:

```env
# Server Configuration
PORT=8000
NODE_ENV=development

# Database Configuration (Replica Set required for transactions)
MONGODB_URI=mongodb://localhost:27017/VidNest?replicaSet=rs0

# CORS & Client Configuration
CORS_ORIGIN=http://localhost:5173
FRONTEND_URL=http://localhost:5173

# JWT Configuration (Must be >= 64 characters with high entropy)
ACCESS_TOKEN_SECRET=4a8e2b9c7d1f5a3e8b0c2d4f6a8b1c3e5f7a9b0c2d4e6f8a1b3c5d7e9f0a2b4c
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e
REFRESH_TOKEN_EXPIRY=10d

# Cloudinary Storage Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email Configuration (Nodemailer SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_gmail_app_password
EMAIL_FROM=noreply@vidnest.com

# Redis In-Memory Store Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
# Or unified URL:
# REDIS_URL=redis://default:password@localhost:6379
```

And inside `frontend/VideNestFrontEnd/.env`:
```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

### 9.2 Running Locally

1. **Start MongoDB with Replica Set** (Required for subscription transactions):
   ```bash
   mongod --replSet rs0 --dbpath /path/to/data
   # In mongo shell:
   rs.initiate()
   ```

2. **Start Redis Server**:
   ```bash
   redis-server
   ```

3. **Install Dependencies & Start Backend**:
   ```bash
   npm install
   npm run dev
   ```

4. **Install Dependencies & Start Frontend**:
   ```bash
   cd frontend/VideNestFrontEnd
   npm install
   npm run dev
   ```
