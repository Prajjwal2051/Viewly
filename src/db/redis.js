// ============================================
// DEPENDENCIES
// ============================================
import Redis from "ioredis"
import { ApiError } from "../utils/ApiError.js"

// ============================================
// REDIS CONFIGURATION
// ============================================

/**
 * Redis client configuration object.
 * In production, set REDIS_URL (e.g. from Render Redis or Upstash).
 * Locally, falls back to REDIS_HOST/REDIS_PORT or localhost:6379.
 */
const sharedConfig = {
    // Retry strategy: exponential backoff, capped at 2000ms per attempt
    retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000)
        return delay
    },
    maxRetriesPerRequest: null, // null = never throw MaxRetriesPerRequestError; queued commands simply wait for the connection to recover
    enableReadyCheck: false, // skip the INFO check on connect so an offline Redis doesn't block startup
    lazyConnect: false, // connect immediately on startup; commands are queued (enableOfflineQueue defaults to true) until the connection is ready
}

// ============================================
// REDIS CLIENT
// ============================================

/**
 * Singleton ioredis client instance.
 * If REDIS_URL is set (production), ioredis parses it automatically (supports rediss:// for TLS).
 * Otherwise falls back to host/port/password env vars for local development.
 */
const redisClient = process.env.REDIS_URL
    ? new Redis(process.env.REDIS_URL, sharedConfig)
    : new Redis({
        host: process.env.REDIS_HOST || "localhost",
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
        db: 0,
        ...sharedConfig,
    })

// ============================================
// EVENT HANDLERS
// ============================================

// Fired when the TCP connection is established
redisClient.on("connect", () => {
    console.log("redis is connected")
})

// Fired when the server is ready to accept commands
redisClient.on("ready", () => {
    console.log("redis client is ready to use")
})

// Fired on any connection or command error
redisClient.on("error", (err) => {
    console.log("redis client error: ", err)
})

// Fired when the connection is closed
redisClient.on("close", () => {
    console.log("redis connection closed")
})

// Fired when the client is attempting to reconnect
redisClient.on("reconnecting", () => {
    console.log("redis is reconnecting")
})

// ============================================
// CACHE HELPER FUNCTIONS
// ============================================

/**
 * Retrieve a cached value by key.
 *
 * @param {string} key - The Redis key to look up
 * @returns {any|null} Parsed JSON value, or null if key does not exist
 * @throws {ApiError} 500 if the Redis operation fails
 */
export const getCache = async (key) => {
    try {
        const data = await redisClient.get(key)
        console.log("cache retrieved successfully")
        return data ? JSON.parse(data) : null
    } catch (error) {
        // Redis failure is non-fatal — the request will proceed without a cache hit
        console.log("[Redis] getCache failed:", error.message)
        return null
    }
}

/**
 * Store a value in the cache with an optional TTL.
 *
 * @param {string} key        - The Redis key to store the value under
 * @param {any}    value      - The value to cache (will be JSON-serialised)
 * @param {number} ttlSeconds - Time-to-live in seconds (default: 300s / 5 min)
 * @throws {ApiError} 500 if the Redis operation fails
 */
export const setCache = async (key, value, ttlSeconds = 300) => {
    try {
        const StringValue = JSON.stringify(value)
        if (ttlSeconds) {
            // setex atomically sets the value and its expiry
            await redisClient.setex(key, ttlSeconds, StringValue)
        } else {
            // persist without expiry when ttlSeconds is 0 / falsy
            await redisClient.set(key, StringValue)
        }
        console.log("cache set successfully")
    } catch (error) {
        // Redis failure is non-fatal — the response is still returned correctly
        console.log("[Redis] setCache failed:", error.message)
    }
}
/**
 * Delete one or more cache keys.
 *
 * Accepts a single key string or an array of key strings.
 * Silently skips if the resulting array is empty.
 *
 * @param {string|string[]} keys - Key or list of keys to delete
 * @returns {boolean} true on success
 * @throws {ApiError} 500 if the Redis operation fails
 */
export const deleteCache = async (keys) => {
    try {
        const keysArray = Array.isArray(keys) ? keys : [keys]
        if (keysArray.length > 0) {
            await redisClient.del(...keysArray)
            console.log("cache deleted successfully")
        }

        return true
    } catch (error) {
        console.log("[Redis] deleteCache failed:", error.message)
        return false
    }
}

/**
 * Delete all cache keys matching a glob pattern.
 *
 * Useful for bulk invalidation, e.g. deleteCachePattern("user:123:*").
 * NOTE: KEYS is O(N) — avoid on large production datasets; prefer SCAN instead.
 *
 * @param {string} pattern - Glob pattern to match Redis keys
 * @returns {number} Number of keys deleted
 * @throws {ApiError} 500 if the Redis operation fails
 */
export const deleteCachePattern = async (pattern) => {
    try {
        const keys = await redisClient.keys(pattern)
        if (keys.length > 0) { // Fix: was `keys > 0` (array comparison), corrected to `keys.length > 0`
            await redisClient.del(...keys)
            console.log("cache pattern deleted")
        }
        return keys.length
    } catch (error) {
        console.log("[Redis] deleteCachePattern failed:", error.message)
        return 0
    }
}

// ============================================
// ATOMIC COUNTER OPERATIONS
// ============================================

/**
 * Atomically increment a numeric counter stored in Redis.
 *
 * Creates the key with value `amount` if it does not yet exist.
 *
 * @param {string} key    - The Redis key holding the counter
 * @param {number} amount - Amount to increment by (default: 1)
 * @returns {number} New counter value after increment
 * @throws {ApiError} 500 if the Redis operation fails
 */
export const incrementCounter = async (key, amount = 1) => {
    try {
        return await redisClient.incrby(key, amount)
    } catch (error) {
        console.log(`[Redis] incrementCounter failed for ${key}:`, error.message)
        return null
    }
}

/**
 * Atomically decrement a numeric counter stored in Redis.
 *
 * Creates the key with value `-amount` if it does not yet exist.
 *
 * @param {string} key    - The Redis key holding the counter
 * @param {number} amount - Amount to decrement by (default: 1)
 * @returns {number} New counter value after decrement
 * @throws {ApiError} 500 if the Redis operation fails
 */
export const decrementCounter = async (key, amount = 1) => {
    try {
        return await redisClient.decrby(key, amount)
    } catch (error) {
        console.log(`[Redis] decrementCounter failed for ${key}:`, error.message)
        return null
    }
}

/**
 * Read the current value of a numeric counter.
 *
 * Returns 0 when the key does not exist.
 *
 * @param {string} key - The Redis key holding the counter
 * @returns {number} Current counter value (parsed integer)
 * @throws {ApiError} 500 if the Redis operation fails
 */
export const getCounter = async (key) => {
    try {
        const value = await redisClient.get(key)
        return value ? parseInt(value, 10) : 0
    } catch (error) {
        console.log(`[Redis] getCounter failed for ${key}:`, error.message)
        return 0
    }
}

// ============================================
// KEY UTILS
// ============================================

/**
 * Check whether a Redis key exists.
 *
 * @param {string} key - The Redis key to check
 * @returns {number} 1 if the key exists, 0 otherwise
 * @throws {ApiError} 500 if the Redis operation fails
 */
export const exists = async (key) => {
    try {
        return await redisClient.exists(key)
    } catch (error) {
        console.log(`error in checking the existence of ${key}: `, error)
        throw new ApiError(500, `error in checking the existence of ${key}`, error)
    }
}

/**
 * Set or update the TTL (time-to-live) for an existing key.
 *
 * @param {string} key        - The Redis key to update
 * @param {number} ttlSeconds - Expiry duration in seconds
 * @returns {number} 1 if the timeout was set, 0 if the key does not exist
 * @throws {ApiError} 500 if the Redis operation fails
 */
export const setExpiry = async (key, ttlSeconds) => {
    try {
        return await redisClient.expire(key, ttlSeconds)
    } catch (error) {
        console.error(`Error setting expiry for ${key}:`, error)
        throw new ApiError(500, `error in setting the expiry of ${key}`, error)
    }
}

// ============================================
// LIFECYCLE
// ============================================

/**
 * Gracefully shut down the Redis connection.
 *
 * Sends QUIT to the server and waits for acknowledgement before
 * closing the TCP socket. Should be called on process exit.
 *
 * @returns {Promise<void>}
 */
export const closeRedis = async () => {
    try {
        await redisClient.quit()
        console.log("✅ Redis connection closed gracefully")
    } catch (error) {
        console.error("Error closing Redis connection:", error)
    }
}

// ============================================
// EXPORTS
// ============================================

// All cache helper functions are also exported as named exports above (export const …)
// so consumers can use either:
//   import { getCache, setCache } from "../db/redis.js"          ← named (preferred)
//   import redisUtils from "../db/redis.js"; redisUtils.getCache  ← default
export default {
    getCache,
    setCache,
    deleteCache,
    deleteCachePattern,
    incrementCounter,
    decrementCounter,
    getCounter,
    exists,
    setExpiry,
    client: redisClient,
}


