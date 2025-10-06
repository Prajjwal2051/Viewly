import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";  // Fixed: Added .js extension
import { upload } from "../middlewares/multer.middleware.js";


const router= Router()

router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },
        {
            name:"coverimage",
            maxCount:1
        }
    ]),
    registerUser

)



export default router