// ============================================
// EMAIL SERVICE
// ============================================
// Handles all email sending functionality using Nodemailer
// Currently configured for password reset emails

import nodemailer from "nodemailer"

/**
 * CREATE EMAIL TRANSPORTER
 * Sets up the email sending configuration
 *
 * Configuration options:
 * - host: SMTP server address (e.g., smtp.gmail.com)
 * - port: SMTP port (587 for TLS, 465 for SSL)
 * - secure: false for port 587, true for port 465
 * - auth: Email credentials from environment variables
 *
 * @returns {Object} Nodemailer transporter instance
 */
const createTransporter = () => {
    return nodemailer.createTransporter({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
    })
}

/**
 * SEND PASSWORD RESET EMAIL
 * Sends an email with password reset link to user
 *
 * Email Features:
 * - Professional HTML template with VidNest branding
 * - Clickable reset button
 * - Plain text link as fallback
 * - 15-minute expiration notice
 * - Security notice if request wasn't made by user
 *
 * @param {string} email - Recipient email address
 * @param {string} resetToken - Unhashed reset token for URL
 * @param {string} userName - User's full name for personalization
 * @returns {Promise<void>}
 * @throws {Error} If email sending fails
 */
export const sendPasswordResetEmail = async (email, resetToken, userName) => {
    const transporter = createTransporter()

    // Construct reset URL with token
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`

    // Log reset URL to console for development/testing
    console.log("\n🔐 ========== PASSWORD RESET REQUEST ==========")
    console.log(`📧 Email: ${email}`)
    console.log(`👤 User: ${userName}`)
    console.log(`🔗 Reset Link: ${resetUrl}`)
    console.log(`⏰ Expires in: 15 minutes`)
    console.log("==============================================\n")

    // Email configuration
    const mailOptions = {
        from: `"VidNest Support" <${process.env.EMAIL_FROM}>`,
        to: email,
        subject: "Password Reset Request - VidNest",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
                <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <!-- Header with VidNest branding -->
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #DC2626; font-size: 28px; margin: 0;">VidNest</h1>
                        <p style="color: #6B7280; margin: 5px 0 0 0;">Your Video Sharing Platform</p>
                    </div>
                    
                    <!-- Main content -->
                    <h2 style="color: #1F2937; margin-bottom: 20px;">Password Reset Request</h2>
                    <p style="color: #4B5563; line-height: 1.6;">Hi <strong>${userName}</strong>,</p>
                    <p style="color: #4B5563; line-height: 1.6;">
                        We received a request to reset your password for your VidNest account. 
                        Click the button below to create a new password:
                    </p>
                    
                    <!-- Reset button -->
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetUrl}" 
                           style="display: inline-block; 
                                  padding: 14px 32px; 
                                  background-color: #DC2626; 
                                  color: white; 
                                  text-decoration: none; 
                                  border-radius: 8px;
                                  font-weight: 600;
                                  font-size: 16px;
                                  box-shadow: 0 4px 6px rgba(220, 38, 38, 0.3);">
                            Reset Your Password
                        </a>
                    </div>
                    
                    <!-- Fallback link -->
                    <div style="background-color: #F3F4F6; padding: 15px; border-radius: 6px; margin: 20px 0;">
                        <p style="color: #6B7280; font-size: 14px; margin: 0 0 10px 0;">
                            Or copy and paste this link into your browser:
                        </p>
                        <p style="color: #DC2626; word-break: break-all; margin: 0; font-size: 13px;">
                            ${resetUrl}
                        </p>
                    </div>
                    
                    <!-- Expiration warning -->
                    <div style="background-color: #FEF2F2; border-left: 4px solid #DC2626; padding: 12px; margin: 20px 0;">
                        <p style="color: #991B1B; margin: 0; font-size: 14px;">
                            <strong>⏰ This link will expire in 15 minutes</strong> for security reasons.
                        </p>
                    </div>
                    
                    <!-- Security notice -->
                    <p style="color: #6B7280; line-height: 1.6; font-size: 14px;">
                        If you didn't request this password reset, please ignore this email. 
                        Your password will remain unchanged.
                    </p>
                    
                    <!-- Footer -->
                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #E5E7EB;">
                    <p style="color: #9CA3AF; font-size: 12px; text-align: center; margin: 0;">
                        © ${new Date().getFullYear()} VidNest. All rights reserved.
                    </p>
                    <p style="color: #9CA3AF; font-size: 12px; text-align: center; margin: 10px 0 0 0;">
                        This is an automated email. Please do not reply.
                    </p>
                </div>
            </div>
        `,
    }

    // Send the email
    await transporter.sendMail(mailOptions)

    console.log(`✅ Password reset email sent to ${email}`)
}
