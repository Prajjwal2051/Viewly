// ============================================================
// Copyright (c) 2026 Prajjwal (github.com/Prajjwal2051)
// Project : VidNest — Video Sharing Platform
// License : Proprietary — All Rights Reserved
// Unauthorized copying, modification, or distribution of this
// file, via any medium, is strictly prohibited.
// ============================================================
/**
 * ASYNC HANDLER WRAPPER
 * Wraps async route handlers to automatically catch errors
 * This prevents unhandled promise rejections that would crash the app
 */
const asyncHandler = (requestHandler) => {
    return (req, res, next) => {  // ← FIXED: Added 'return' statement
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err))
    }
}

export { asyncHandler }


// const asyncHandler=(fn)=> async (req,res,next)=>{
//     try {
//         await fn(req,res,next)
//     } catch (error) {
//         // console.log("error",error)
//         res.status(error.code || 500).json({
//             sucess:false,
//             message:error.message
//         })
//     }
// }
