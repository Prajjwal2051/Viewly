import { Router } from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import {
    toggleVideoLike,
    toggleCommentLike,
    getLikedComments,
    getLikedVideos,
} from "../controllers/like.controller.js"

const router = Router()

// Like/unlike a video
router.post("/video/:videoId", verifyJWT, toggleVideoLike)

// Like/unlike a comment
router.post("/comment/:commentId", verifyJWT, toggleCommentLike)

// Get all videos liked by current user (the one logged in)
router.get("/videos", verifyJWT, getLikedVideos)

// Get all comments liked by current user
router.get("/comments", verifyJWT, getLikedComments)

// Optionally, if you want liked videos/comments for any user:
router.get("/user/:userId/videos", verifyJWT, getLikedVideos)
router.get("/user/:userId/comments", verifyJWT, getLikedComments)

export default router
