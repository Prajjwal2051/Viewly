# VidNest Frontend Development Guide

**A Complete Step-by-Step Tutorial for Building a React Frontend for Your Video Platform**

---

## 📋 Table of Contents

1. [Backend Analysis & API Overview](#1-backend-analysis--api-overview)
2. [Frontend Architecture & Tech Stack](#2-frontend-architecture--tech-stack)
3. [Project Structure](#3-project-structure)
4. [Step-by-Step Implementation Plan](#4-step-by-step-implementation-plan)
5. [Learning Objectives](#5-learning-objectives)

---

## 1. Backend Analysis & API Overview

### 🎯 Core Resources & Endpoints

After analyzing your backend, here's what we're working with:

#### **1.1 Authentication & Users** (`/api/v1/users`)

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/register` | POST | Public | Register new user (with avatar & cover image upload) |
| `/login` | POST | Public | Login user, returns access & refresh tokens |
| `/logout` | POST | Private | Logout user, clears tokens |
| `/refresh-token` | POST | Public | Get new access token using refresh token |
| `/current-user` | GET | Private | Get currently logged-in user profile |
| `/change-password` | POST | Private | Change user password |
| `/update-account` | PATCH | Private | Update user details (fullName, email) |
| `/update-avatar` | PATCH | Private | Update profile picture |
| `/update-cover` | PATCH | Private | Update cover image |
| `/c/:username` | GET | Public | Get user's channel profile (videos, subscribers, stats) |
| `/watch-history` | GET | Private | Get user's video watch history |

**Data Model (User):**
```javascript
{
  _id: ObjectId,
  username: String,
  email: String,
  fullName: String,
  password: String (hashed),
  avatar: String (URL),
  coverimage: String (URL),
  watchHistory: [VideoId],
  subscribersCount: Number,
  subscribedToCount: Number,
  createdAt: Date,
  updatedAt: Date
}
```

---

#### **1.2 Videos** (`/api/v1/videos`)

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/` | GET | Public | Get all videos with filters (pagination, search, category, tags) |
| `/:videoId` | GET | Public | Get single video by ID, increments view count |
| `/` | POST | Private | Upload new video (with video file & thumbnail) |
| `/:videoId` | PATCH | Private | Update video metadata (title, description, thumbnail) |
| `/:videoId` | DELETE | Private | Delete video (owner only) |

**Data Model (Video):**
```javascript
{
  _id: ObjectId,
  videoFile: String (URL),
  thumbNail: String (URL),
  title: String,
  description: String,
  duration: Number (seconds),
  views: Number,
  likes: Number,
  dislikes: Number,
  isPublished: Boolean,
  tags: String,
  category: String,
  owner: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

---

#### **1.3 Comments** (`/api/v1/comments`)

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/:videoId` | GET | Public | Get all comments for a video (paginated) |
| `/` | POST | Private | Add comment to a video |
| `/:commentId` | PATCH | Private | Update own comment |
| `/:commentId` | DELETE | Private | Delete own comment |

---

#### **1.4 Likes** (`/api/v1/likes`)

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/video/:videoId` | POST | Private | Toggle like on a video |
| `/comment/:commentId` | POST | Private | Toggle like on a comment |
| `/videos` | GET | Private | Get all videos liked by current user |
| `/comments` | GET | Private | Get all comments liked by current user |

---

#### **1.5 Playlists** (`/api/v1/playlists`)

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/` | POST | Private | Create new playlist |
| `/user/:userId` | GET | Private | Get all playlists of a user |
| `/:playlistId` | GET | Public | Get playlist by ID with all videos |
| `/:playlistId` | PATCH | Private | Update playlist (name, description, privacy) |
| `/:playlistId` | DELETE | Private | Delete playlist |
| `/add/:playlistId/:videoId` | PATCH | Private | Add video to playlist |
| `/remove/:playlistId/:videoId` | PATCH | Private | Remove video from playlist |

---

#### **1.6 Subscriptions** (`/api/v1/subscriptions`)

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/c/:channelId` | POST | Private | Toggle subscription to a channel |
| `/c/:channelId/subscribers` | GET | Public | Get all subscribers of a channel |
| `/subscribed` | GET | Private | Get all channels current user subscribes to |

---

#### **1.7 Notifications** (`/api/v1/notifications`)

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/` | GET | Private | Get all notifications (paginated, filterable by isRead) |
| `/read-all` | PATCH | Private | Mark all notifications as read |
| `/:notificationId/read` | PATCH | Private | Mark single notification as read |
| `/:notificationId` | DELETE | Private | Delete a notification |

---

#### **1.8 Dashboard** (`/api/v1/dashboard`)

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/stats/:channelId` | GET | Private | Get channel analytics (views, likes, subscribers, growth) |
| `/videos/:channelId` | GET | Public | Get all videos of a channel (with sorting & pagination) |

---

#### **1.9 Search** (`/api/v1/search`)

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/` | GET | Public | Search videos with advanced filters (query, category, date range, duration, sorting) |

---

### 🔐 Authentication Mechanism

Your backend uses **JWT-based authentication** with the following flow:

1. **Login** → Backend returns `accessToken` and `refreshToken`
2. **Tokens stored** → Backend sets `refreshToken` in HTTP-only cookie
3. **Protected requests** → Frontend sends `accessToken` in `Authorization: Bearer <token>` header
4. **Token refresh** → When `accessToken` expires, use `/refresh-token` endpoint to get new one
5. **Logout** → Call `/logout` to clear tokens

**Key Points:**
- `accessToken` expires in **1 day** (from your `.env`)
- `refreshToken` expires in **10 days**
- Backend uses `verifyJWT` middleware to protect routes
- Backend sends cookies with `credentials: true` (CORS enabled)

---

### 📤 Response Format

**Success Response (ApiResponse):**
```javascript
{
  statusCode: 200,
  data: { /* actual data */ },
  message: "Success",
  success: true
}
```

**Error Response (ApiError):**
```javascript
{
  statusCode: 400,
  data: null,
  message: "Error description",
  success: false,
  errors: []
}
```

---

## 2. Frontend Architecture & Tech Stack

### 🛠️ Recommended Tech Stack

After analyzing your backend's complexity and requirements, here's my recommended stack:

#### **Core Framework**
- **React 18** with **Vite**
  
  **Why Vite over Create React App?**
  - ⚡ **Much faster** dev server (Hot Module Replacement in milliseconds)
  - 📦 Smaller bundle sizes with better tree-shaking
  - ⚙️ Modern build tool (uses ESBuild + Rollup)
  - 🔮 Better developer experience (instant server start)
  - 📈 CRA is deprecated/unmaintained, Vite is the modern standard

---

#### **Routing**
- **React Router v6**
  
  **Why?**
  - Industry standard for React routing
  - Declarative routing with nested routes
  - Perfect for protected routes (authentication)
  - URL parameter handling (`useParams`, `useSearchParams`)
  - Programmatic navigation with `useNavigate`

---

#### **State Management**
- **Redux Toolkit + RTK Query**
  
  **Why Redux Toolkit over Zustand/Context API?**
  
  **For this project specifically:**
  - ✅ You have **complex global state** (user, auth, notifications, playlists)
  - ✅ Multiple components need **same data** (user profile in navbar, sidebar, comments)
  - ✅ Need **server state caching** (videos shouldn't re-fetch every navigation)
  - ✅ **RTK Query** eliminates 90% of API boilerplate (auto-caching, loading states, refetching)
  - ✅ Time-travel debugging with Redux DevTools
  - ✅ Better for learning production-grade state management
  
  **When Zustand is better:**
  - Small apps with minimal global state
  - Quick prototypes
  - When you prefer simpler API over powerful features

  **RTK Query Benefits for Your Video Platform:**
  ```javascript
  // Traditional approach (50+ lines):
  // - useState for data, loading, error
  // - useEffect to fetch
  // - Handle caching manually
  // - Refetch logic on mount
  
  // RTK Query (5 lines):
  const { data, isLoading, error } = useGetVideosQuery({ page: 1, limit: 10 })
  // ✅ Auto-caching, ✅ Auto-refetching, ✅ Loading states, ✅ Error handling
  ```

---

#### **Styling**
- **Tailwind CSS**
  
  **Why Tailwind over CSS Modules/MUI?**
  - 🎨 Utility-first = faster development
  - 📱 Built-in responsive design (`md:`, `lg:` breakpoints)
  - 🌙 Easy dark mode (`dark:` variant)
  - 🚀 No CSS file switching, everything in JSX
  - 💪 Consistent design system out of the box
  - 🎯 This is a video platform = custom UI, not generic MUI components
  
  **When MUI is better:**
  - Enterprise apps needing pre-built complex components (DataGrid, Autocomplete)
  - When design system is already Material Design
  - Teams unfamiliar with CSS

---

#### **HTTP Client**
- **Axios**
  
  **Why Axios over Fetch?**
  - 🔄 Interceptors (automatically attach JWT tokens to requests)
  - 🎯 Better error handling
  - 🍪 Automatic cookie handling
  - 📊 Request/response transformation
  - ⏱️ Built-in timeout support
  - 🔁 Easy request cancellation

---

#### **Form Handling**
- **React Hook Form**
  
  **Why?**
  - 🚀 Better performance (uncontrolled components)
  - ✅ Built-in validation
  - 📝 Less boilerplate than manual state
  - 🎯 Perfect for your registration/login forms with file uploads

---

#### **Additional Libraries**
- **date-fns** - Date formatting (video upload times, "2 hours ago")
- **react-hot-toast** - Notifications (success/error messages)
- **react-icons** - Icons (like, subscribe, menu icons)
- **video.js** or **react-player** - Video player component
- **react-infinite-scroll-component** - Infinite scrolling for video feeds

---

## 3. Project Structure

### 📁 Folder Architecture (Feature-Based)

This structure follows **"Feature-First"** organization, where related components, hooks, and logic are grouped together:

```
frontend/
├── public/
│   └── vite.svg
├── src/
│   ├── main.jsx                    # App entry point
│   ├── App.jsx                     # Root component with routes
│   │
│   ├── api/                        # 🌐 Backend communication layer
│   │   ├── client.js               # Axios instance with interceptors
│   │   ├── authApi.js              # Auth endpoints (login, register, logout)
│   │   ├── videoApi.js             # Video CRUD operations
│   │   ├── commentApi.js           # Comment operations
│   │   ├── playlistApi.js          # Playlist management
│   │   ├── subscriptionApi.js      # Subscribe/unsubscribe
│   │   ├── likeApi.js              # Like/unlike operations
│   │   ├── notificationApi.js      # Notification fetching
│   │   ├── dashboardApi.js         # Channel analytics
│   │   └── searchApi.js            # Search functionality
│   │
│   ├── store/                      # 🏪 Redux Toolkit setup
│   │   ├── index.js                # Configure store, combine slices
│   │   ├── slices/                 # Redux slices
│   │   │   ├── authSlice.js        # User, tokens, isAuthenticated
│   │   │   ├── notificationSlice.js # Notification count, unread badge
│   │   │   └── uiSlice.js          # Theme, sidebar open/closed, modals
│   │   └── api/                    # RTK Query API slices
│   │       ├── videoApi.js         # Auto-generated hooks for videos
│   │       ├── playlistApi.js      # Auto-caching for playlists
│   │       └── ...                 # Other API slices
│   │
│   ├── features/                   # 🎯 Feature modules (domain logic)
│   │   ├── auth/                   # Authentication feature
│   │   │   ├── components/         # Login, Register, ForgotPassword
│   │   │   ├── hooks/              # useAuth, useLogin, useRegister
│   │   │   ├── pages/              # LoginPage, RegisterPage
│   │   │   └── utils/              # Auth helpers, token storage
│   │   │
│   │   ├── video/                  # Video feature
│   │   │   ├── components/         # VideoCard, VideoPlayer, VideoGrid
│   │   │   ├── hooks/              # useVideoUpload, useVideoLike
│   │   │   ├── pages/              # VideoDetailPage, UploadVideoPage
│   │   │   └── utils/              # Video formatters (duration, views)
│   │   │
│   │   ├── channel/                # Channel/User profile feature
│   │   │   ├── components/         # ChannelHeader, ChannelTabs, SubscribeButton
│   │   │   ├── hooks/              # useChannelStats, useSubscription
│   │   │   ├── pages/              # ChannelPage
│   │   │   └── utils/              # Channel helpers
│   │   │
│   │   ├── playlist/               # Playlist feature
│   │   │   ├── components/         # PlaylistCard, PlaylistModal, AddToPlaylistButton
│   │   │   ├── hooks/              # useCreatePlaylist, useAddToPlaylist
│   │   │   ├── pages/              # PlaylistDetailPage, MyPlaylistsPage
│   │   │   └── utils/              # Playlist helpers
│   │   │
│   │   ├── notification/           # Notification feature
│   │   │   ├── components/         # NotificationDropdown, NotificationItem
│   │   │   ├── hooks/              # useNotifications, useMarkAsRead
│   │   │   └── pages/              # NotificationsPage
│   │   │
│   │   ├── dashboard/              # Creator dashboard feature
│   │   │   ├── components/         # StatsCard, VideoTable, AnalyticsChart
│   │   │   ├── hooks/              # useChannelStats
│   │   │   └── pages/              # DashboardPage
│   │   │
│   │   └── search/                 # Search feature
│   │       ├── components/         # SearchBar, SearchFilters, SearchResults
│   │       ├── hooks/              # useSearch
│   │       └── pages/              # SearchPage
│   │
│   ├── components/                 # 🧩 Shared/reusable components
│   │   ├── ui/                     # Generic UI components
│   │   │   ├── Button.jsx          # Reusable button with variants
│   │   │   ├── Input.jsx           # Form input component
│   │   │   ├── Modal.jsx           # Modal/dialog component
│   │   │   ├── Avatar.jsx          # User avatar component
│   │   │   ├── Skeleton.jsx        # Loading skeleton
│   │   │   ├── Dropdown.jsx        # Dropdown menu
│   │   │   └── Badge.jsx           # Notification badge
│   │   │
│   │   ├── layout/                 # Layout components
│   │   │   ├── Navbar.jsx          # Top navigation bar
│   │   │   ├── Sidebar.jsx         # Left sidebar (Home, Trending, Subscriptions)
│   │   │   ├── Footer.jsx          # Footer
│   │   │   └── MainLayout.jsx      # Wraps Navbar + Sidebar + children
│   │   │
│   │   └── common/                 # Common components
│   │       ├── ProtectedRoute.jsx  # Route guard for auth
│   │       ├── ErrorBoundary.jsx   # Error boundary wrapper
│   │       └── LoadingSpinner.jsx  # Global loading indicator
│   │
│   ├── hooks/                      # 🪝 Global custom hooks
│   │   ├── useAuth.js              # Access auth state (user, logout)
│   │   ├── useDebounce.js          # Debounce input values (search)
│   │   ├── useInfiniteScroll.js    # Infinite scroll pagination
│   │   ├── useLocalStorage.js      # Persist state to localStorage
│   │   └── useMediaQuery.js        # Responsive design hook
│   │
│   ├── utils/                      # 🛠️ Helper functions
│   │   ├── formatters.js           # Format dates, numbers (1.2M views, 3 days ago)
│   │   ├── validators.js           # Form validation rules
│   │   ├── constants.js            # App constants (API_BASE_URL, routes)
│   │   └── helpers.js              # General utility functions
│   │
│   ├── pages/                      # 📄 Top-level route pages
│   │   ├── HomePage.jsx            # Landing page with video feed
│   │   ├── NotFoundPage.jsx        # 404 page
│   │   └── ...                     # Other standalone pages
│   │
│   └── styles/                     # 🎨 Global styles
│       ├── index.css               # Global CSS, Tailwind imports
│       └── tailwind.config.js      # Tailwind configuration
│
├── .env                            # Environment variables (VITE_API_URL)
├── .env.example                    # Example env file for team
├── vite.config.js                  # Vite configuration
├── package.json                    # Dependencies
├── tailwind.config.js              # Tailwind config
└── README.md                       # Frontend documentation
```

---

### 📂 Why This Structure?

#### **Feature-Based Organization**
- ✅ **Scalability**: Each feature is self-contained
- ✅ **Discoverability**: All video-related code is in `features/video/`
- ✅ **Team collaboration**: Multiple devs can work on different features
- ✅ **Code reuse**: Shared components in `components/ui/`

#### **API Layer Separation**
- ✅ Backend calls isolated from UI logic
- ✅ Easy to mock for testing
- ✅ Single source of truth for endpoint definitions

#### **Redux Slices vs RTK Query**
- **Redux Slices** (`authSlice`): For **client-side state** (current user, UI state)
- **RTK Query** (`videoApi`): For **server state** (videos, playlists from backend)

---

## 4. Step-by-Step Implementation Plan

### 🚀 Build Order (Complete Learning Path)

I'll guide you through **10 major steps**, teaching concepts before code at each stage.

---

### **STEP 1: Project Setup & Dependencies**

**What you'll learn:**
- How to create a Vite React project
- Understanding `package.json` and dependencies
- Configuring Tailwind CSS
- Environment variables in Vite

**Tasks:**
1. Create Vite project
2. Install all dependencies
3. Configure Tailwind
4. Set up `.env` file with backend URL
5. Create folder structure

**Concepts:**
- Dev dependencies vs production dependencies
- How Vite's dev server works
- Why environment variables start with `VITE_` prefix
- PostCSS and Tailwind compilation

---

### **STEP 2: Base App Structure & Routing**

**What you'll learn:**
- React Router v6 basics
- Layout components and nested routes
- Navigation with `Link` and `useNavigate`
- Route parameters with `useParams`
- Query parameters with `useSearchParams`

**Tasks:**
1. Create `App.jsx` with route definitions
2. Build `MainLayout` (Navbar + Sidebar + Outlet)
3. Build `AuthLayout` (for login/register)
4. Create placeholder pages (Home, Login, Register, VideoDetail)
5. Implement navigation between pages

**Concepts:**
- `<BrowserRouter>` vs `<HashRouter>`
- `<Routes>` and `<Route>` components
- `<Outlet>` for nested routes
- How URL changes trigger component re-renders
- Difference between `Link` (declarative) and `useNavigate` (programmatic)

---

### **STEP 3: API Layer & Axios Configuration**

**What you'll learn:**
- Creating an Axios instance with base configuration
- Request/response interceptors
- How to attach JWT tokens automatically
- Error handling globally
- API function organization

**Tasks:**
1. Create `api/client.js` (Axios instance)
2. Add request interceptor to attach tokens
3. Add response interceptor for error handling
4. Create `api/authApi.js` with login/register/logout functions
5. Test API connection with console logs

**Concepts:**
- How interceptors work (middleware for HTTP)
- Where to store tokens (localStorage vs cookies)
- CORS and `credentials: true`
- Promise-based HTTP flow
- Error response shapes

**Backend Connection:**
```
Frontend Axios → http://localhost:8000/api/v1/users/login → Backend Express
Frontend stores tokens → Future requests include Authorization header
```

---

### **STEP 4: Redux Toolkit Setup**

**What you'll learn:**
- How Redux works (store, slices, reducers, actions)
- Redux Toolkit simplifies Redux (no boilerplate)
- `configureStore` vs legacy `createStore`
- `createSlice` for state management
- Using `useSelector` and `useDispatch` hooks

**Tasks:**
1. Create `store/index.js` (configure store)
2. Create `store/slices/authSlice.js` (user state)
3. Create `store/slices/uiSlice.js` (theme, sidebar state)
4. Wrap `App.jsx` with `<Provider store={store}>`
5. Test by dispatching actions in console

**Concepts:**
- **Store**: Single source of truth for app state
- **Slice**: A piece of state + reducers to modify it
- **Action**: Object describing what happened (`{ type: 'auth/login', payload: user }`)
- **Reducer**: Pure function that updates state based on action
- **Selector**: Function to read state from store (`state => state.auth.user`)
- **Dispatch**: Function to send actions to store

**Data Flow:**
```
Component → dispatch(action) → Reducer updates store → useSelector re-renders component
```

---

### **STEP 5: Authentication Flow (Login/Register)**

**What you'll learn:**
- Form handling with React Hook Form
- File uploads in forms (avatar, cover image)
- Async thunks for API calls
- Storing tokens securely
- Protected routes implementation
- Redirecting after login

**Tasks:**
1. Build `LoginPage` with form (email/username, password)
2. Build `RegisterPage` with form (username, email, password, avatar, coverImage)
3. Create `authApi.js` functions (login, register, logout)
4. Create `ProtectedRoute` component (redirects if not logged in)
5. Handle login success (store tokens, update Redux state, redirect to home)
6. Test full auth flow

**Concepts:**
- Controlled vs uncontrolled components
- `FormData` for file uploads
- How JWT tokens work (header.payload.signature)
- Token expiration and refresh flow
- `useEffect` for checking auth on mount
- Private routes vs public routes

**Backend Connection:**
```
Register Form → POST /api/v1/users/register (with FormData) → Backend saves user + files to Cloudinary → Returns user + tokens
Login Form → POST /api/v1/users/login → Backend validates credentials → Returns accessToken + refreshToken (in cookie)
Protected Route → Checks localStorage for accessToken → If not found, redirect to /login
API Request → Axios interceptor adds "Authorization: Bearer <token>" header
```

---

### **STEP 6: Home Page & Video Feed**

**What you'll learn:**
- RTK Query for data fetching (auto-caching, loading states)
- Infinite scrolling and pagination
- Grid layouts with Tailwind
- Optimistic UI updates
- Video card component design

**Tasks:**
1. Create `api/videoApi.js` (RTK Query API slice)
2. Build `VideoCard` component (thumbnail, title, views, channel)
3. Build `HomePage` that fetches videos
4. Implement pagination (load more button or infinite scroll)
5. Add loading skeletons
6. Handle empty states (no videos found)

**Concepts:**
- **RTK Query hooks**: `useGetVideosQuery({ page: 1 })`
- **Auto-generated hooks**: `useGetVideosQuery`, `useCreateVideoMutation`
- **Cache management**: Data persists between navigations
- **Refetching**: `refetch()` function
- **Loading states**: `isLoading`, `isFetching`, `isSuccess`, `isError`
- **Grid layout**: `grid grid-cols-1 md:grid-cols-3 gap-4`

**Backend Connection:**
```
HomePage mounts → useGetVideosQuery() → GET /api/v1/videos?page=1&limit=10
Backend returns: { statusCode: 200, data: { videos: [...], pagination: {...} } }
RTK Query caches response → Re-renders component with data
User navigates away and back → RTK Query uses cached data (no re-fetch)
```

---

### **STEP 7: Video Detail Page**

**What you'll learn:**
- Fetching single resource by ID
- Video player integration
- Comment section (CRUD operations)
- Like/dislike functionality
- Coordinating multiple API calls in one page

**Tasks:**
1. Build `VideoDetailPage` (uses `useParams` to get videoId)
2. Integrate video player (react-player or video.js)
3. Build `CommentSection` component
4. Build `CommentForm` (add comment)
5. Build `CommentItem` (edit/delete own comments)
6. Implement like/dislike buttons
7. Show related videos sidebar

**Concepts:**
- **Route parameters**: `useParams()` to get `:videoId` from URL
- **Multiple queries**: `useGetVideoByIdQuery(videoId)` + `useGetCommentsQuery(videoId)`
- **Mutations**: `useAddCommentMutation()`, `useDeleteCommentMutation()`
- **Optimistic updates**: Update UI before backend confirms
- **Invalidating tags**: RTK Query refetches related data after mutation

**Backend Connection:**
```
URL: /videos/abc123 → useParams() extracts videoId = "abc123"
useGetVideoByIdQuery("abc123") → GET /api/v1/videos/abc123 → Backend increments views, returns video
useGetCommentsQuery("abc123") → GET /api/v1/comments/abc123?page=1 → Returns comments
User clicks like → POST /api/v1/likes/video/abc123 → Backend toggles like → RTK Query refetches video
User adds comment → POST /api/v1/comments (body: { videoId, content }) → RTK Query invalidates comments tag → Auto-refetches comments
```

---

### **STEP 8: Channel Page & Subscriptions**

**What you'll learn:**
- Dynamic routes (channel by username)
- Tabs component for switching views
- Subscription logic (subscribe/unsubscribe)
- Channel statistics display
- Fetching user-specific data

**Tasks:**
1. Build `ChannelPage` (uses `useParams` to get username)
2. Build `ChannelHeader` (banner, avatar, name, subscriber count)
3. Build `SubscribeButton` (toggle subscription)
4. Build tabs (Videos, Playlists, About)
5. Fetch channel videos and playlists
6. Show subscriber count and video stats

**Concepts:**
- **Nested data**: Channel → Videos → Comments
- **Conditional rendering**: Show "Edit Channel" button only to owner
- **State synchronization**: Subscribe button updates subscriber count
- **Tab state**: URL query params (`?tab=videos`) vs local state

**Backend Connection:**
```
URL: /channel/johndoe → useParams() extracts username = "johndoe"
useGetChannelProfileQuery("johndoe") → GET /api/v1/users/c/johndoe → Returns channel info + videos
User clicks subscribe → POST /api/v1/subscriptions/c/<channelId> → Backend toggles subscription
RTK Query invalidates channel tag → Refetches channel data → Subscriber count updates
```

---

### **STEP 9: Playlists & Dashboard**

**What you'll learn:**
- CRUD operations for playlists
- Drag-and-drop reordering (optional)
- Modal dialogs for create/edit
- Dashboard analytics with charts
- Permission-based UI (owner-only features)

**Tasks:**
1. Build `MyPlaylistsPage` (list user's playlists)
2. Build `CreatePlaylistModal` (form to create playlist)
3. Build `PlaylistDetailPage` (show playlist videos)
4. Build `AddToPlaylistButton` (add video to playlist from video page)
5. Build `DashboardPage` (creator analytics)
6. Build `StatsCard` components (total views, likes, subscribers)

**Concepts:**
- **Modal state**: Open/close state, passing data to modal
- **Forms in modals**: Controlled components with validation
- **Nested mutations**: Create playlist → Add video to playlist
- **Charts**: Use libraries like Chart.js or Recharts
- **Conditional features**: Show dashboard link only to channel owners

**Backend Connection:**
```
User clicks "Create Playlist" → Modal opens with form
User submits → POST /api/v1/playlists (body: { name, description, isPrivate })
Backend creates playlist → Returns playlist object
RTK Query adds to cache → UI shows new playlist
User clicks "Add to Playlist" on video → PATCH /api/v1/playlists/add/<playlistId>/<videoId>
Backend adds video to playlist.videos array → Returns updated playlist
```

---

### **STEP 10: Notifications & Search**

**What you'll learn:**
- Real-time notification badge updates
- Dropdown menus with animations
- Debounced search input
- Search filters (category, date range, duration)
- URL state management for search

**Tasks:**
1. Build `NotificationDropdown` in Navbar
2. Fetch notifications and show unread count badge
3. Mark as read on click
4. Build `SearchPage` with filters
5. Build `SearchBar` component (autocomplete optional)
6. Debounce search input to avoid excessive API calls
7. Sync search state with URL query params

**Concepts:**
- **Polling**: Fetch notifications every 30 seconds (or use WebSockets)
- **Debouncing**: Delay API call until user stops typing (300ms)
- **URL as state**: Search query, filters in URL (`?q=react&category=tech`)
- **Dropdown positioning**: Absolute positioning, z-index
- **Badge component**: Show unread count with red circle

**Backend Connection:**
```
Navbar mounts → useGetNotificationsQuery({ isRead: false }) → GET /api/v1/notifications?isRead=false
Backend returns unread notifications → Badge shows count
User clicks notification → PATCH /api/v1/notifications/<id>/read → Backend marks as read
RTK Query refetches → Badge count decreases

SearchBar: User types "react" → Debounced after 300ms → GET /api/v1/search?query=react
User adds filter → GET /api/v1/search?query=react&category=tech&sortBy=views
Backend returns filtered videos → SearchResults component renders
```

---

### **STEP 11: Polish & Optimization**

**What you'll learn:**
- Code splitting and lazy loading
- Error boundaries for graceful error handling
- Loading skeletons for better UX
- Memoization to prevent unnecessary re-renders
- Performance profiling with React DevTools

**Tasks:**
1. Lazy load routes with `React.lazy()`
2. Add `Suspense` fallbacks for lazy routes
3. Implement `ErrorBoundary` component
4. Add loading skeletons for all data fetching
5. Optimize components with `React.memo`, `useMemo`, `useCallback`
6. Add animations with Tailwind transitions
7. Test on slow network (DevTools throttling)

**Concepts:**
- **Code splitting**: Split bundle into chunks, load on demand
- **Lazy loading**: `const HomePage = React.lazy(() => import('./HomePage'))`
- **Suspense**: Show fallback while lazy component loads
- **Error boundaries**: Catch errors in component tree
- **Memoization**: Cache expensive calculations
- **Performance**: Avoiding prop drilling, using selectors wisely

---

## 5. Learning Objectives

By the end of this tutorial, you will understand:

### **JavaScript Concepts**
- ✅ ES6+ features (arrow functions, destructuring, spread operator, modules)
- ✅ Promises and async/await
- ✅ Array methods (map, filter, reduce, find)
- ✅ Object manipulation (spread, destructuring)
- ✅ Closures and scope
- ✅ Event handling and callbacks
- ✅ HTTP requests and REST APIs

### **React Concepts**
- ✅ Component architecture (functional components, composition)
- ✅ Props and state management
- ✅ Hooks (`useState`, `useEffect`, `useContext`, `useReducer`, `useRef`, `useMemo`, `useCallback`)
- ✅ Custom hooks for reusable logic
- ✅ Conditional rendering and list rendering
- ✅ Forms and controlled components
- ✅ File uploads in React
- ✅ Component lifecycle and side effects
- ✅ Context API vs Redux
- ✅ Performance optimization

### **React Router**
- ✅ Client-side routing
- ✅ Route parameters and query strings
- ✅ Nested routes and layouts
- ✅ Protected routes and redirects
- ✅ Programmatic navigation

### **Redux Toolkit**
- ✅ Store, slices, reducers, actions
- ✅ `useSelector` and `useDispatch` hooks
- ✅ Async logic with thunks
- ✅ RTK Query for server state
- ✅ Cache invalidation and refetching
- ✅ Optimistic updates

### **Full-Stack Integration**
- ✅ How frontend connects to backend (REST APIs)
- ✅ Authentication flow (JWT tokens)
- ✅ Token storage and refresh
- ✅ CORS and credentials
- ✅ Request/response interceptors
- ✅ Error handling across layers
- ✅ File uploads (multipart/form-data)
- ✅ Pagination and infinite scroll
- ✅ Real-time updates (polling or WebSockets)

### **Best Practices**
- ✅ Project structure and organization
- ✅ Component composition vs inheritance
- ✅ Separation of concerns (UI vs logic vs API)
- ✅ DRY principle (Don't Repeat Yourself)
- ✅ Error boundaries and loading states
- ✅ Accessibility basics (semantic HTML, ARIA)
- ✅ Responsive design with Tailwind
- ✅ Code splitting and lazy loading
- ✅ Performance monitoring

---

## 📚 Next Steps

After reading this guide, **STOP HERE** and confirm:

1. ✅ Do you understand the backend structure (resources, endpoints, auth mechanism)?
2. ✅ Do you agree with the proposed tech stack (Vite, Redux Toolkit, Tailwind)?
3. ✅ Does the folder structure make sense to you?
4. ✅ Are you ready to start **STEP 1: Project Setup**?

Once you say **"OK"** or **"Let's start STEP 1"**, I will:
1. Give you exact terminal commands to create the project
2. Explain each dependency as we install it
3. Guide you through folder creation
4. Set up Tailwind and environment variables
5. Create a "Hello World" React app to verify setup

**Remember:** We go step-by-step, waiting for your confirmation before moving forward. This is a learning journey, not a race! 🚀

---

## 🎯 Practice Tasks (Before We Start)

To prepare, try answering these conceptually (no code yet):

1. **Why is Vite faster than Create React App?**
2. **What's the difference between `useState` (local state) and Redux (global state)?**
3. **When would you use RTK Query vs a simple Axios call?**
4. **Where should tokens be stored: localStorage, sessionStorage, or cookies? Why?**
5. **What happens when a user refreshes the page? How do you restore their login state?**

Think about these, and we'll revisit them as we build! 💡

---

**Ready? Type "OK" to begin STEP 1!** 🚀
