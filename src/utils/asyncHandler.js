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
