# VidNest / Viewly — Caching & Performance Architecture

**Part of the [VidNest Documentation Series](./README.md)**  
**Author:** Prajjwal ([GitHub](https://github.com/Prajjwal2051))  

---

## 1. Redis Caching Overview

VidNest integrates an in-memory Redis layer (via `ioredis` v5.10.0) to achieve sub-millisecond read response times, reduce database pressure on MongoDB, support high-frequency view and like counting, and implement distributed rate limiting.

### Caching Roles
1. **Read-Through Query Caching**: Common queries (individual videos, video lists, user playlists, global tweets, channel stats) are cached with bounded TTLs.
2. **Session Acceleration**: Decoded JWT tokens map to cached User documents in `session:<userId>:<token>`, avoiding a MongoDB lookup on every authorized request.
3. **Atomic Counters**: Video views utilize Redis atomic increments (`INCR`) to manage view count spikes.
4. **Rate Limiting Store**: `rate-limit-redis` maintains distributed sliding-window counters across API clusters.

---

## 2. Cache Namespace Directory

| Namespace Pattern | Default TTL | Description |
| :--- | :--- | :--- |
| `video:<videoId>` | 300 s (5 min) | Cached video document with populated owner metadata |
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

## 3. Cache Invalidation Matrix

To maintain data integrity without stale data, write operations actively invalidate relevant keys using direct deletion (`deleteCache`) or pattern scanning (`deleteCachePattern`):

| Controller Mutation | Triggering Action | Keys Invalidated | Invalidation Method |
| :--- | :--- | :--- | :--- |
| `video.controller.js` | `updateVideo` | `video:<videoId>`, `videos:list:*`, `dashboard:*:<ownerId>:*` | `deleteCache` & `deleteCachePattern` |
| `video.controller.js` | `deleteVideo` | `video:<videoId>`, `videos:list:*`, `dashboard:*:<ownerId>:*` | `deleteCache` & `deleteCachePattern` |
| `like.controller.js` | `toggleVideoLike` | `likes:status:video:<id>:<userId>`, `likes:videos:<userId>:*` | `deleteCache` & `deleteCachePattern` |
| `like.controller.js` | `toggleTweetLike` | `likes:status:tweet:<id>:<userId>`, `likes:tweets:<userId>:*` | `deleteCache` & `deleteCachePattern` |
| `subscription.controller.js` | `toggleSubscription` | `subscriptions:subscribers:<channelId>:*`, `subscriptions:channels:<userId>:*`, `dashboard:stats:<channelId>` | `deleteCachePattern` & `deleteCache` |
| `tweet.controller.js` | `createTweet` | `tweets:feed`, `tweets:user:<userId>*` | `deleteCache` & `deleteCachePattern` |
| `tweet.controller.js` | `updateTweet` | `tweet:<tweetId>`, `tweets:user:<ownerId>*`, `tweets:feed` | `deleteCache` & `deleteCachePattern` |
| `tweet.controller.js` | `deleteTweet` | `tweet:<tweetId>`, `tweets:user:<ownerId>*`, `tweets:feed` | `deleteCache` & `deleteCachePattern` |
| `playlist.controller.js` | `createPlayList` | `playlists:user:<ownerId>:*` | `deleteCachePattern` |
| `playlist.controller.js` | `addVideoToPlaylist` | `playlist:<playlistId>`, `playlists:user:<ownerId>:*` | `deleteCache` & `deleteCachePattern` |
| `playlist.controller.js` | `removeVideoFromPlaylist` | `playlist:<playlistId>`, `playlists:user:<ownerId>:*` | `deleteCache` & `deleteCachePattern` |
| `playlist.controller.js` | `deletePlaylist` | `playlist:<playlistId>`, `playlists:user:<ownerId>:*` | `deleteCache` & `deleteCachePattern` |
| `notification.controller.js` | `markAsRead` | `notifications:<userId>:*` | `deleteCachePattern` |
| `notification.controller.js` | `markAllAsRead` | `notifications:<userId>:*` | `deleteCachePattern` |
| `auth.middleware.js` | `logout` | `session:<userId>:<token>` | `deleteCache` |
| `auth.middleware.js` | `logoutAllDevices` | `session:<userId>:*` | `deleteCachePattern` |

---

## 4. Redis Client Configuration & Connection Resilience

The Redis subsystem (`src/db/redis.js`) implements automated reconnection logic, non-blocking error handling, and environment-driven TLS support:

```javascript
const sharedConfig = {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
        // Exponential backoff capped at 2 seconds
        return Math.min(times * 50, 2000)
    },
    enableReadyCheck: true,
    connectTimeout: 10000,
}
```

> [!NOTE]
> If Redis becomes unavailable, read-through queries gracefully fail open (catch block logs error and queries MongoDB directly). Redis failures do not crash user requests.

---

*Continue to [05. Detailed User Flows](./05-user-flows.md)*
