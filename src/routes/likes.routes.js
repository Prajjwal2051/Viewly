import { Router } from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { likeLimiter } from "../middlewares/rate-limiter.middleware.js"
import {
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike,
    getLikedComments,
    getLikedVideos,
    getLikedTweets,
    getIsVideoLiked,
    getIsTweetLiked,
} from "../controllers/like.controller.js"

const router = Router()

// Like/unlike a video (rate limited)
router.post("/video/:videoId", verifyJWT, likeLimiter, toggleVideoLike)

// Check if video is liked
router.get("/status/video/:videoId", verifyJWT, getIsVideoLiked)

// Like/unlike a comment (rate limited)
router.post("/comment/:commentId", verifyJWT, likeLimiter, toggleCommentLike)

// Like/unlike a tweet (rate limited)
router.post("/tweet/:tweetId", verifyJWT, likeLimiter, toggleTweetLike)

// Check if tweet is liked
router.get("/status/tweet/:tweetId", verifyJWT, getIsTweetLiked)

// Get all videos liked by current user (the one logged in)
router.get("/videos", verifyJWT, getLikedVideos)

// Get all tweets liked by current user
router.get("/tweets", verifyJWT, getLikedTweets)

// Get all comments liked by current user
router.get("/comments", verifyJWT, getLikedComments)

// Optionally, if you want liked videos/comments for any user:
router.get("/user/:userId/videos", verifyJWT, getLikedVideos)
router.get("/user/:userId/comments", verifyJWT, getLikedComments)

export default router
