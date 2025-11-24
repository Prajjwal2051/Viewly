
import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
} from "../controllers/subscription.controller.js"

const router = Router()


router.route("/c/:channelId")
    .post(verifyJWT, toggleSubscription)

router.route("/c/:channelId/subscribers")
    .get(getUserChannelSubscribers)

router.route("/subscribed")
    .get(verifyJWT, getSubscribedChannels)


export default router