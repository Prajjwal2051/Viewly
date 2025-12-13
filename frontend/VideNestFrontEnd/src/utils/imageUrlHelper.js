/**
 * OPTIMIZED CLOUDINARY URL GENERATOR
 *
 * Automatically injects resizing and optimization parameters into Cloudinary URLs
 * to ensure we only download the size we need, saving massive bandwidth.
 *
 * @param {string} url - The original Cloudinary URL
 * @param {Object} options - Resizing options
 * @param {number} options.width - Target width
 * @param {number} options.height - Target height (optional)
 * @returns {string} - Optimized URL
 */
export const getOptimizedUrl = (url, { width, height } = {}) => {
    if (!url) return ""
    if (!url.includes("cloudinary.com")) return url // Skip non-Cloudinary URLs

    // If already optimized (has params), maybe we skip or strictly replace?
    // For now, simple injection after /upload/

    // Cloudinary URL format: .../upload/{params}/v{version}/{public_id}...
    const splitUrl = url.split("/upload/")
    if (splitUrl.length < 2) return url

    const [baseUrl, rest] = splitUrl

    let params = [`c_limit`] // Use limit to keep aspect ratio and not upscale

    if (width) params.push(`w_${width}`)
    if (height) params.push(`h_${height}`)

    // Add quality auto and format auto if they aren't default (they are usually default in our backend upload)
    // But re-asserting them here ensures they are applied on delivery
    params.push("q_auto")
    params.push("f_auto")

    const paramsString = params.join(",")

    // Check if "rest" already has params (doesn't start with v or has slashes)
    // Actually, backend upload returns URL like .../upload/v1234/id.jpg

    return `${baseUrl}/upload/${paramsString}/${rest}`
}
