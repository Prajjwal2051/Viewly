import { Router } from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import {
    addComment,
    deleteComment,
    getAllComment,
    getTweetComments,
    updateComment,
} from "../controllers/comment.controller.js"

const router = Router()

// GET /api/v1/comments/:videoId - public - get paginated comments for a specific video
router.get("/:videoId", getAllComment)

// GET /api/v1/comments/t/:tweetId - public - get paginated comments for a specific tweet
router.get("/t/:tweetId", getTweetComments)

// POST /api/v1/comments - private - add a new comment to a video
router.post("/", verifyJWT, addComment)

// PATCH /api/v1/comments/:commentId - private - update user's own comment
router.patch("/:commentId", verifyJWT, updateComment)

// DELETE /api/v1/comments/:commentId - private - delete user's own comment
router.delete("/:commentId", verifyJWT, deleteComment)

export default router
