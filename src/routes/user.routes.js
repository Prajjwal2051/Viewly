import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";  // Fixed: Added .js extension

const router= Router()

router.route("/register").post(registerUser)



export default router