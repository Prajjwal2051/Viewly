import { Router } from "express"
import {
    createTweet,
    deleteTweet,
    getUserTweets,
    getAllTweets,
    getTweetById,
    updateTweet,
} from "../controllers/tweet.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { upload } from "../middlewares/multer.middleware.js"

const router = Router()

// ============================================
// PUBLIC ROUTES
// ============================================

router.route("/").get(getAllTweets)
router.route("/:tweetId").get(getTweetById)
router.route("/user/:userId").get(getUserTweets)

// ============================================
// PROTECTED ROUTES
// ============================================

// Apply verifyJWT to all routes defined AFTER this line
router.use(verifyJWT)

router.route("/").post(upload.single("image"), createTweet)
router.route("/:tweetId").patch(updateTweet).delete(deleteTweet)

export default router
