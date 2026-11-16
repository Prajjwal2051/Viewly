# VidNest / Viewly — Complete API Reference & Endpoint Directory

**Part of the [VidNest Documentation Series](./README.md)**  
**Author:** Prajjwal ([GitHub](https://github.com/Prajjwal2051))  

Base URL: `http://localhost:8000/api/v1` (Development) or your deployed production domain.

---

## 1. User & Authentication Routes (`/api/v1/users`)

| Method | Path | Access | Request Body / Params | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/register` | Public | FormData (`fullName`, `email`, `username`, `password`, `avatar`, optional `coverImage`) | Registers a new user account |
| `POST` | `/login` | Public | JSON (`usernameOrEmail`, `password`) | Authenticates user; returns user data and sets HttpOnly cookies |
| `POST` | `/refresh-token` | Public | Cookies (`refreshToken`) | Exchanges valid refresh token for fresh access and refresh tokens |
| `POST` | `/forgot-password`| Public | JSON (`email`) | Sends a secure password reset link to user's email |
| `POST` | `/reset-password/:token`| Public | JSON (`newPassword`), Param (`token`) | Resets password using verification token from email |
| `POST` | `/logout` | Private | Auth Cookie | Clears cookies, invalidates Redis session, unsets DB token |
| `GET` | `/current-user` | Private | Auth Cookie | Retrieves the authenticated user's profile details |
| `POST` | `/change-password`| Private | JSON (`oldPassword`, `newPassword`) | Validates old password and stores new bcrypt hash |
| `PATCH`| `/update-account` | Private | JSON (`fullName`, `email`) | Updates basic account text information |
| `PATCH`| `/avatar` | Private | FormData (`avatar` file) | Updates user profile picture |
| `PATCH`| `/cover-image` | Private | FormData (`coverImage` file) | Updates channel banner image |
| `GET` | `/c/:username` | Public | Param (`username`) | Retrieves comprehensive channel profile, subscriber counts & stats |
| `GET` | `/watch-history` | Private | Auth Cookie | Returns user's video watch history with video owner details |

---

## 2. Video Routes (`/api/v1/videos`)

| Method | Path | Access | Query / Body / Params | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/` | Public | Query (`page`, `limit`, `category`, `tags`, `search`, `sortBy`, `sortOrder`) | Paginated video catalog with filters |
| `GET` | `/categories` | Public | None | Returns distinct categories from published videos |
| `GET` | `/tags/popular` | Public | Query (`limit`) | Returns frequently used tags across videos |
| `GET` | `/:videoId` | Public | Param (`videoId`) | Fetches video details, populates owner, increments view counts |
| `POST` | `/` | Private | FormData (`video`, `thumbnail`, `title`, `description`, `category`, `tags`) | Uploads video and thumbnail to Cloudinary and saves metadata |
| `PATCH`| `/:videoId` | Private | FormData / JSON (`title`, `description`, optional `thumbnail`) | Updates video metadata (owner only) |
| `DELETE`| `/:videoId` | Private | Param (`videoId`) | Permanently deletes video and destroys Cloudinary assets |

---

## 3. Social Engagement Routes

### 3.1 Comment Routes (`/api/v1/comments`)
| Method | Path | Access | Params / Body | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/:videoId` | Public | Param (`videoId`), Query (`page`, `limit`) | Paginated comments for a video |
| `POST` | `/:videoId` | Private | Param (`videoId`), JSON (`content`) | Posts a new comment to a video |
| `PATCH`| `/c/:commentId` | Private | Param (`commentId`), JSON (`content`) | Updates existing comment (author only) |
| `DELETE`| `/c/:commentId` | Private | Param (`commentId`) | Deletes comment (author only) |

### 3.2 Like Routes (`/api/v1/like`)
| Method | Path | Access | Params | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/video/:videoId` | Private | Param (`videoId`) | Toggles like/unlike on a video |
| `POST` | `/comment/:commentId`| Private | Param (`commentId`) | Toggles like/unlike on a comment |
| `POST` | `/tweet/:tweetId` | Private | Param (`tweetId`) | Toggles like/unlike on a tweet |
| `GET` | `/status/video/:videoId` | Private | Param (`videoId`) | Returns `{ isLiked: boolean }` for a video |
| `GET` | `/status/tweet/:tweetId` | Private | Param (`tweetId`) | Returns `{ isLiked: boolean }` for a tweet |
| `GET` | `/videos` | Private | None | Returns all videos liked by current user |
| `GET` | `/tweets` | Private | None | Returns all tweets liked by current user |
| `GET` | `/comments` | Private | None | Returns all comments liked by current user |

### 3.3 Subscription Routes (`/api/v1/subscription`)
| Method | Path | Access | Params | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/c/:channelId` | Private | Param (`channelId`) | Toggles channel subscription via atomic transaction |
| `GET` | `/c/:channelId` | Public | Param (`channelId`) | Returns list of subscribers for a channel |
| `GET` | `/u/:subscriberId` | Public | Param (`subscriberId`) | Returns channels a user is subscribed to |

---

## 4. Community, Curation & Analytics Routes

### 4.1 Tweet / Post Routes (`/api/v1/tweets`)
| Method | Path | Access | Params / Body | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/` | Public | Query (`page`, `limit`) | Global tweet feed |
| `POST` | `/` | Private | FormData (`content`, optional `image`) | Publishes a new tweet with optional image |
| `PATCH`| `/:tweetId` | Private | Param (`tweetId`), JSON (`content`) | Edits tweet text (author only) |
| `DELETE`| `/:tweetId` | Private | Param (`tweetId`) | Deletes tweet (author only) |
| `GET` | `/user/:userId` | Public | Param (`userId`) | Fetches all tweets published by a user |

### 4.2 Playlist Routes (`/api/v1/playlists`)
| Method | Path | Access | Params / Body | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/` | Private | JSON (`name`, `description`, `isPublic`) | Creates a new playlist |
| `GET` | `/:playlistId` | Public | Param (`playlistId`) | Fetches playlist details and populated video list |
| `PATCH`| `/:playlistId` | Private | Param (`playlistId`), JSON (`name`, `description`) | Updates playlist metadata |
| `DELETE`| `/:playlistId` | Private | Param (`playlistId`) | Deletes playlist (owner only) |
| `PATCH`| `/add/:playlistId/:videoId` | Private | Params (`playlistId`, `videoId`) | Appends a video to a playlist |
| `PATCH`| `/remove/:playlistId/:videoId` | Private | Params (`playlistId`, `videoId`) | Removes a video from a playlist |
| `GET` | `/user/:userId` | Public | Param (`userId`) | Retrieves all public playlists created by a user |

### 4.3 Search Routes (`/api/v1/search`)
| Method | Path | Access | Query Parameters | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/` | Public | `query`, `category`, `startDate`, `endDate`, `minDuration`, `maxDuration`, `sortBy`, `page`, `limit` | Advanced video search with aggregation & Redis caching |

### 4.4 Dashboard Routes (`/api/v1/dashboard`)
| Method | Path | Access | Params / Query | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/stats` | Private | None | Channel statistics (total views, likes, subscribers) |
| `GET` | `/stats/:channelId` | Public | Param (`channelId`) | Public channel overview statistics |
| `GET` | `/videos/:channelId`| Public/Private | Param (`channelId`), Query (`page`, `limit`, `sortBy`, `sortOrder`) | Channel video management catalog |

### 4.5 Notification Routes (`/api/v1/notifications`)
| Method | Path | Access | Params / Query | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/` | Private | Query (`page`, `limit`, `isRead`) | Paginated list of notifications for user |
| `PATCH`| `/:notificationId/read` | Private | Param (`notificationId`) | Marks a specific notification as read |
| `PATCH`| `/read-all` | Private | None | Marks all notifications as read for current user |
| `DELETE`| `/:notificationId` | Private | Param (`notificationId`) | Deletes a notification |

### 4.6 Health Check Route (`/api/v1/health`)
| Method | Path | Access | Response | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/` | Public | `{ statusCode: 200, data: { status: "ok", project: "VidNest", author: "Prajjwal" } }` | Service liveness probe |

---

*Continue to [08. Deployment & Environment Runbook](./08-deployment-and-environment.md)*
