// ============================================
// CONTENT SANITIZATION UTILITIES
// ============================================
// Provides sanitization functions to prevent XSS (Cross-Site Scripting) attacks
// Uses DOMPurify to clean user-generated content before display

import DOMPurify from "dompurify"

// ============================================
// SANITIZATION CONFIGURATIONS
// ============================================

/**
 * Configuration for rich text content (allows some HTML tags)
 * Use for: User bios, descriptions that might support formatting
 */
const RICH_TEXT_CONFIG = {
    ALLOWED_TAGS: ["b", "i", "em", "strong", "a", "br", "p", "ul", "ol", "li"],
    ALLOWED_ATTR: ["href", "target", "rel"],
    ALLOW_DATA_ATTR: false,
}

/**
 * Configuration for plain text (strips all HTML)
 * Use for: Titles, names, simple text fields
 */
const PLAIN_TEXT_CONFIG = {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true, // Keep text content, remove tags
}

/**
 * Configuration for links (allows only anchor tags)
 * Use for: User-provided URLs, link fields
 */
const LINK_CONFIG = {
    ALLOWED_TAGS: ["a"],
    ALLOWED_ATTR: ["href", "target", "rel"],
    ALLOW_DATA_ATTR: false,
}

// ============================================
// MAIN SANITIZATION FUNCTIONS
// ============================================

/**
 * Sanitizes HTML content allowing safe HTML tags
 * @param {string} dirty - Unsanitized HTML content
 * @returns {string} Sanitized HTML safe for rendering
 *
 * Use cases:
 * - Video descriptions with formatting
 * - User bios with links
 * - Rich text content
 */
export const sanitizeHtml = (dirty) => {
    if (!dirty || typeof dirty !== "string") return ""

    return DOMPurify.sanitize(dirty, RICH_TEXT_CONFIG)
}

/**
 * Sanitizes content to plain text (strips all HTML)
 * @param {string} dirty - Unsanitized content
 * @returns {string} Plain text without any HTML tags
 *
 * Use cases:
 * - Video titles
 * - User names
 * - Comment text
 * - Tweet content
 * - Any field that shouldn't contain HTML
 */
export const sanitizeText = (dirty) => {
    if (!dirty || typeof dirty !== "string") return ""

    return DOMPurify.sanitize(dirty, PLAIN_TEXT_CONFIG)
}

/**
 * Sanitizes URLs to prevent javascript: and data: URIs
 * @param {string} url - Unsanitized URL
 * @returns {string} Safe URL or empty string if invalid
 *
 * Use cases:
 * - User-provided links
 * - External URLs
 * - Social media links
 */
export const sanitizeUrl = (url) => {
    if (!url || typeof url !== "string") return ""

    // Remove leading/trailing whitespace
    const trimmed = url.trim()

    // Block dangerous protocols
    const dangerousProtocols = ["javascript:", "data:", "vbscript:", "file:"]
    const lower = trimmed.toLowerCase()

    for (const protocol of dangerousProtocols) {
        if (lower.startsWith(protocol)) {
            console.warn("Blocked dangerous URL protocol:", protocol)
            return ""
        }
    }

    // Allow only http, https, mailto, and protocol-relative URLs
    if (
        lower.startsWith("http://") ||
        lower.startsWith("https://") ||
        lower.startsWith("mailto:") ||
        lower.startsWith("//")
    ) {
        return DOMPurify.sanitize(trimmed, LINK_CONFIG)
    }

    // If no protocol, assume https
    return DOMPurify.sanitize(`https://${trimmed}`, LINK_CONFIG)
}

/**
 * Escapes HTML entities for safe display
 * Alternative to DOMPurify for very simple cases
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
export const escapeHtml = (text) => {
    if (!text || typeof text !== "string") return ""

    const div = document.createElement("div")
    div.textContent = text
    return div.innerHTML
}

/**
 * Unescapes HTML entities
 * @param {string} html - Escaped HTML
 * @returns {string} Unescaped text
 */
export const unescapeHtml = (html) => {
    if (!html || typeof html !== "string") return ""

    const div = document.createElement("div")
    div.innerHTML = html
    return div.textContent || ""
}

// ============================================
// SPECIALIZED SANITIZERS
// ============================================

/**
 * Sanitizes video titles
 * @param {string} title - Video title
 * @returns {string} Sanitized title
 */
export const sanitizeVideoTitle = (title) => {
    const sanitized = sanitizeText(title)
    // Limit length for safety
    return sanitized.substring(0, 200)
}

/**
 * Sanitizes video descriptions
 * @param {string} description - Video description
 * @returns {string} Sanitized description
 */
export const sanitizeVideoDescription = (description) => {
    // Allow some formatting in descriptions
    const sanitized = sanitizeHtml(description)
    // Limit length
    return sanitized.substring(0, 5000)
}

/**
 * Sanitizes tweet/post content
 * @param {string} content - Tweet content
 * @returns {string} Sanitized content
 */
export const sanitizeTweetContent = (content) => {
    // Plain text only for tweets
    const sanitized = sanitizeText(content)
    // Respect tweet length limit
    return sanitized.substring(0, 280)
}

/**
 * Sanitizes comment content
 * @param {string} content - Comment text
 * @returns {string} Sanitized comment
 */
export const sanitizeComment = (content) => {
    const sanitized = sanitizeText(content)
    // Limit comment length
    return sanitized.substring(0, 1000)
}

/**
 * Sanitizes user display name
 * @param {string} name - User's full name
 * @returns {string} Sanitized name
 */
export const sanitizeDisplayName = (name) => {
    const sanitized = sanitizeText(name)
    return sanitized.substring(0, 100)
}

/**
 * Sanitizes username (stricter rules)
 * @param {string} username - Username
 * @returns {string} Sanitized username
 */
export const sanitizeUsername = (username) => {
    if (!username || typeof username !== "string") return ""

    // Remove all non-alphanumeric except underscore and hyphen
    return username
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, "")
        .substring(0, 30)
}

/**
 * Sanitizes user bio
 * @param {string} bio - User bio
 * @returns {string} Sanitized bio
 */
export const sanitizeUserBio = (bio) => {
    // Allow some formatting in bio
    const sanitized = sanitizeHtml(bio)
    return sanitized.substring(0, 500)
}

// ============================================
// BATCH SANITIZATION
// ============================================

/**
 * Sanitizes an entire video object
 * @param {Object} video - Video object from API
 * @returns {Object} Video object with sanitized fields
 */
export const sanitizeVideoObject = (video) => {
    if (!video) return null

    return {
        ...video,
        title: sanitizeVideoTitle(video.title || ""),
        description: sanitizeVideoDescription(video.description || ""),
        owner: video.owner
            ? {
                  ...video.owner,
                  username: sanitizeUsername(video.owner.username || ""),
                  fullName: sanitizeDisplayName(video.owner.fullName || ""),
              }
            : video.owner,
    }
}

/**
 * Sanitizes an entire tweet object
 * @param {Object} tweet - Tweet object from API
 * @returns {Object} Tweet object with sanitized fields
 */
export const sanitizeTweetObject = (tweet) => {
    if (!tweet) return null

    return {
        ...tweet,
        content: sanitizeTweetContent(tweet.content || ""),
        owner: tweet.owner
            ? {
                  ...tweet.owner,
                  username: sanitizeUsername(tweet.owner.username || ""),
                  fullName: sanitizeDisplayName(tweet.owner.fullName || ""),
              }
            : tweet.owner,
    }
}

/**
 * Sanitizes an entire comment object
 * @param {Object} comment - Comment object from API
 * @returns {Object} Comment object with sanitized fields
 */
export const sanitizeCommentObject = (comment) => {
    if (!comment) return null

    return {
        ...comment,
        content: sanitizeComment(comment.content || ""),
        owner: comment.owner
            ? {
                  ...comment.owner,
                  username: sanitizeUsername(comment.owner.username || ""),
                  fullName: sanitizeDisplayName(comment.owner.fullName || ""),
              }
            : comment.owner,
    }
}

/**
 * Sanitizes a user profile object
 * @param {Object} user - User object from API
 * @returns {Object} User object with sanitized fields
 */
export const sanitizeUserObject = (user) => {
    if (!user) return null

    return {
        ...user,
        username: sanitizeUsername(user.username || ""),
        fullName: sanitizeDisplayName(user.fullName || ""),
        bio: sanitizeUserBio(user.bio || ""),
    }
}

// ============================================
// VALIDATION HELPERS
// ============================================

/**
 * Checks if content contains potentially dangerous patterns
 * @param {string} content - Content to check
 * @returns {boolean} True if suspicious patterns found
 */
export const containsSuspiciousPatterns = (content) => {
    if (!content || typeof content !== "string") return false

    const suspiciousPatterns = [
        /<script/i,
        /javascript:/i,
        /onerror=/i,
        /onclick=/i,
        /onload=/i,
        /<iframe/i,
        /<embed/i,
        /<object/i,
    ]

    return suspiciousPatterns.some((pattern) => pattern.test(content))
}

/**
 * Logs warning if suspicious content detected
 * @param {string} content - Content to check
 * @param {string} source - Source of content (for logging)
 */
export const warnIfSuspicious = (content, source = "unknown") => {
    if (containsSuspiciousPatterns(content)) {
        console.warn(`⚠️ Suspicious content detected in: ${source}`)
        console.warn("Content preview:", content.substring(0, 100))
    }
}

// ============================================
// REACT HELPERS
// ============================================

/**
 * Creates props for safely rendering HTML with dangerouslySetInnerHTML
 * Only use when you need to render sanitized HTML
 * @param {string} html - Sanitized HTML content
 * @returns {Object} Props object for React component
 */
export const createMarkup = (html) => {
    return { __html: sanitizeHtml(html) }
}

/**
 * Hook-friendly sanitizer that memoizes results
 * Use with useMemo in React components
 * @param {string} content - Content to sanitize
 * @param {Function} sanitizer - Sanitization function to use
 * @returns {string} Sanitized content
 */
export const useSanitized = (content, sanitizer = sanitizeText) => {
    return sanitizer(content)
}
