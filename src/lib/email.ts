import nodemailer from 'nodemailer'
import { prisma } from './prisma'

// Create transporter using SMTP
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
    }
})

// Debugging logs to verify env vars are present
console.log('[Email] Transporter initialized with:', {
    host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
    user: process.env.SMTP_USER ? 'PRESENT' : 'MISSING',
    pass: process.env.SMTP_PASSWORD ? 'PRESENT' : 'MISSING',
    sender: process.env.SMTP_SENDER || 'support@prodsnap.in'
})

interface EmailOptions {
    to: string
    subject: string
    html: string
    type?: string
    bookingId?: string
}

export async function sendEmail({ to, subject, html, type = "general", bookingId }: EmailOptions) {
    try {
        const senderName = "Prodsnap Support"
        const senderEmail = process.env.SMTP_SENDER || 'support@prodsnap.in'

        console.log(`[Email] Attempting to send email to: ${to} | Subject: ${subject}`)

        const info = await transporter.sendMail({
            from: `"${senderName}" <${senderEmail}>`,
            to,
            subject,
            html
        })
        console.log('[Email] SUCCESS:', info.messageId)

        // Log to DB for usage tracking
        try {
            await prisma.emailLog.create({
                data: {
                    type,
                    recipient: to,
                    subject,
                    status: 'success',
                    bookingId: bookingId || null
                }
            });
        } catch (logErr) {
            console.error('[Email Log] DB failed:', logErr);
        }

        return { success: true, messageId: info.messageId }
    } catch (error) {
        console.error('[Email] FAILED to send email:', error)

        // Log failure to DB
        try {
            await prisma.emailLog.create({
                data: {
                    type,
                    recipient: to,
                    subject,
                    status: 'error',
                    errorMessage: error instanceof Error ? error.message : String(error),
                    bookingId: bookingId || null
                }
            });
        } catch (logErr) {
            console.error('[Email Log Fail] DB failed:', logErr);
        }

        return { success: false, error }
    }
}

// Send notification to admin when a new payment request is submitted
export async function sendPaymentNotification(data: {
    name: string
    email: string
    phone: string
    amount: number
}) {
    const adminEmail = process.env.SMTP_SENDER || 'support@prodsnap.in'

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
                .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 12px 12px; }
                .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
                .label { font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 1px; }
                .value { font-size: 18px; font-weight: bold; color: #333; margin-top: 5px; }
                .amount { font-size: 28px; color: #667eea; font-weight: bold; }
                .cta { display: inline-block; background: #667eea; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 20px; }
                .footer { text-align: center; margin-top: 30px; color: #999; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1 style="margin: 0;">💰 New Payment Request!</h1>
                    <p style="margin: 10px 0 0 0; opacity: 0.9;">Someone just submitted a subscription payment</p>
                </div>
                <div class="content">
                    <div class="info-box">
                        <div class="label">Customer Name</div>
                        <div class="value">${data.name}</div>
                    </div>
                    <div class="info-box">
                        <div class="label">Email Address</div>
                        <div class="value">${data.email}</div>
                    </div>
                    <div class="info-box">
                        <div class="label">Phone Number</div>
                        <div class="value">${data.phone}</div>
                    </div>
                    <div class="info-box">
                        <div class="label">Amount Paid</div>
                        <div class="amount">₹${data.amount}</div>
                    </div>
                    
                    <p style="margin-top: 30px; color: #666;">
                        Please log in to the admin panel to review the payment screenshot and approve/reject this request.
                    </p>
                    
                    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://prodsnap-gamma.vercel.app'}/admin" class="cta">
                        Open Admin Panel →
                    </a>
                </div>
                <div class="footer">
                    <p>This is an automated notification from Prodsnap</p>
                </div>
            </div>
        </body>
        </html>
    `

    return sendEmail({
        to: adminEmail,
        subject: `💰 New Payment Request from ${data.name} - ₹${data.amount}`,
        html,
        type: 'payment'
    })
}

// Send confirmation email to user after payment submission
export async function sendPaymentConfirmationToUser(data: {
    name: string
    email: string
    amount: number
}) {
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
                .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 12px 12px; }
                .status-box { background: #fff3cd; border: 1px solid #ffc107; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
                .status-icon { font-size: 40px; margin-bottom: 10px; }
                .info-box { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #667eea; }
                .footer { text-align: center; margin-top: 30px; color: #999; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1 style="margin: 0;">📧 Payment Received!</h1>
                    <p style="margin: 10px 0 0 0; opacity: 0.9;">Thank you for your subscription, ${data.name}!</p>
                </div>
                <div class="content">
                    <div class="status-box">
                        <div class="status-icon">⏳</div>
                        <h2 style="margin: 0; color: #856404;">Awaiting Approval</h2>
                        <p style="margin: 10px 0 0 0; color: #856404;">Your payment of ₹${data.amount} is being verified by our team.</p>
                    </div>
                    
                    <div class="info-box">
                        <strong>What's next?</strong>
                        <p style="margin: 5px 0 0 0;">Our admin will review your payment screenshot and activate your premium access within 24 hours.</p>
                    </div>
                    
                    <div class="info-box">
                        <strong>Need help?</strong>
                        <p style="margin: 5px 0 0 0;">Contact us at info.prodsnap@gmail.com if you have any questions.</p>
                    </div>
                </div>
                <div class="footer">
                    <p>Thank you for choosing Prodsnap!</p>
                    <p>© Prodsnap - Master PM Interviews with AI Feedback</p>
                </div>
            </div>
        </body>
        </html>
    `

    return sendEmail({
        to: data.email,
        subject: `⏳ Payment Received - Awaiting Approval | Prodsnap`,
        html,
        type: 'payment_confirmation'
    })
}

// Send congratulations email when admin approves the subscription
export async function sendApprovalNotification(data: {
    name: string
    email: string
    endDate: Date
}) {
    const formattedDate = new Intl.DateTimeFormat('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }).format(data.endDate)

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 40px; border-radius: 12px 12px 0 0; text-align: center; }
                .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 12px 12px; }
                .success-box { background: #d4edda; border: 1px solid #28a745; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
                .success-icon { font-size: 50px; margin-bottom: 10px; }
                .feature-list { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
                .feature { padding: 10px 0; border-bottom: 1px solid #eee; display: flex; align-items: center; }
                .feature:last-child { border-bottom: none; }
                .check { color: #28a745; margin-right: 10px; font-size: 18px; }
                .cta { display: inline-block; background: #10b981; color: white; padding: 15px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 20px; }
                .validity { background: #e8f5e9; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0; }
                .footer { text-align: center; margin-top: 30px; color: #999; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1 style="margin: 0; font-size: 28px;">🎉 Congratulations!</h1>
                    <p style="margin: 10px 0 0 0; font-size: 18px;">You're now a Premium Member!</p>
                </div>
                <div class="content">
                    <div class="success-box">
                        <div class="success-icon">🚀</div>
                        <h2 style="margin: 0; color: #155724;">Premium Access Activated!</h2>
                        <p style="margin: 10px 0 0 0; color: #155724;">Welcome to the Prodsnap Premium family, ${data.name}!</p>
                    </div>
                    
                    <div class="validity">
                        <strong>📅 Valid Until:</strong> ${formattedDate}
                    </div>
                    
                    <div class="feature-list">
                        <h3 style="margin-top: 0;">You now have access to:</h3>
                        <div class="feature"><span class="check">✓</span> Unlimited case practice across all categories</div>
                        <div class="feature"><span class="check">✓</span> AI-powered instant feedback on every answer</div>
                        <div class="feature"><span class="check">✓</span> Access to premium expert solutions</div>
                        <div class="feature"><span class="check">✓</span> Priority access to new content & features</div>
                    </div>
                    
                    <div style="text-align: center;">
                        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://prodsnap-gamma.vercel.app'}/practice" class="cta">
                            Start Practicing Now →
                        </a>
                    </div>
                </div>
                <div class="footer">
                    <p>Thank you for trusting Prodsnap!</p>
                    <p>Questions? Contact us at info.prodsnap@gmail.com</p>
                    <p>© Prodsnap - Master PM Interviews with AI Feedback</p>
                </div>
            </div>
        </body>
        </html>
    `

    return sendEmail({
        to: data.email,
        subject: `🎉 Congratulations! Your Premium Access is Activated | Prodsnap`,
        html,
        type: 'approval'
    })
}

// Send mentorship booking confirmation to user
export async function sendMentorshipBookingConfirmation(data: {
    name: string
    email: string
    serviceType: string
    amount: number
}) {
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 40px; border-radius: 12px 12px 0 0; text-align: center; }
                .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 12px 12px; }
                .success-box { background: #d4edda; border: 1px solid #28a745; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
                .info-box { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #10b981; }
                .footer { text-align: center; margin-top: 30px; color: #999; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1 style="margin: 0;">🎉 Session Booked!</h1>
                    <p style="margin: 10px 0 0 0; opacity: 0.9;">Congratulations ${data.name}!</p>
                </div>
                <div class="content">
                    <div class="success-box">
                        <h2 style="margin: 0; color: #155724;">Your mentorship session is confirmed!</h2>
                    </div>
                    
                    <div class="info-box">
                        <strong>📋 Session Type:</strong> ${data.serviceType}
                    </div>
                    
                    <div class="info-box">
                        <strong>💰 Amount Paid:</strong> ₹${data.amount}
                    </div>
                    
                    <div class="info-box">
                        <strong>📞 What's Next?</strong>
                        <p style="margin: 5px 0 0 0;">Our mentor will reach out to you shortly on your registered phone number to schedule the session.</p>
                    </div>
                </div>
                <div class="footer">
                    <p>Thank you for choosing Prodsnap Mentorship!</p>
                    <p>Questions? Contact us at info.prodsnap@gmail.com</p>
                </div>
            </div>
        </body>
        </html>
    `

    return sendEmail({
        to: data.email,
        subject: `🎉 Session Booked! ${data.serviceType} Confirmed | Prodsnap`,
        html,
        type: 'mentorship'
    })
}

// Send mentorship payment notification to admin
export async function sendMentorshipPaymentNotification(data: {
    name: string
    email: string
    phone: string
    serviceType: string
    amount: number
}) {
    const adminEmail = process.env.SMTP_SENDER || 'support@prodsnap.in'

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
                .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 12px 12px; }
                .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b; }
                .label { font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 1px; }
                .value { font-size: 18px; font-weight: bold; color: #333; margin-top: 5px; }
                .amount { font-size: 28px; color: #f59e0b; font-weight: bold; }
                .cta { display: inline-block; background: #f59e0b; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 20px; }
                .footer { text-align: center; margin-top: 30px; color: #999; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1 style="margin: 0;">📚 New Mentorship Booking!</h1>
                    <p style="margin: 10px 0 0 0; opacity: 0.9;">Someone just booked a mentorship session</p>
                </div>
                <div class="content">
                    <div class="info-box">
                        <div class="label">Customer Name</div>
                        <div class="value">${data.name}</div>
                    </div>
                    <div class="info-box">
                        <div class="label">Email Address</div>
                        <div class="value">${data.email}</div>
                    </div>
                    <div class="info-box">
                        <div class="label">Phone Number</div>
                        <div class="value">${data.phone}</div>
                    </div>
                    <div class="info-box">
                        <div class="label">Session Type</div>
                        <div class="value">${data.serviceType}</div>
                    </div>
                    <div class="info-box">
                        <div class="label">Amount Paid</div>
                        <div class="amount">₹${data.amount}</div>
                    </div>
                    
                    <p style="margin-top: 30px; color: #666;">
                        Please review the payment and reach out to the customer to schedule the session.
                    </p>
                    
                    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://prodsnap-gamma.vercel.app'}/admin" class="cta">
                        Open Admin Panel →
                    </a>
                </div>
                <div class="footer">
                    <p>This is an automated notification from Prodsnap</p>
                </div>
            </div>
        </body>
        </html>
    `

    return sendEmail({
        to: adminEmail,
        subject: `📚 New Mentorship Booking from ${data.name} - ${data.serviceType} (₹${data.amount})`,
        html,
        type: 'mentorship_notification'
    })
}

// Send feedback request email after session completion
export async function sendFeedbackRequestEmail(data: {
    name: string
    email: string
    bookingId: string
    serviceType: string
}) {
    const feedbackUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://prodsnap-gamma.vercel.app'}/feedback/${data.bookingId}`

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; padding: 40px; border-radius: 12px 12px 0 0; text-align: center; }
                .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 12px 12px; }
                .stars { font-size: 40px; text-align: center; margin: 20px 0; }
                .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
                .cta { display: inline-block; background: #8b5cf6; color: white; padding: 15px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; }
                .footer { text-align: center; margin-top: 30px; color: #999; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1 style="margin: 0;">✨ How was your session?</h1>
                    <p style="margin: 10px 0 0 0; opacity: 0.9;">We'd love to hear your feedback, ${data.name}!</p>
                </div>
                <div class="content">
                    <div class="stars">⭐⭐⭐⭐⭐</div>
                    
                    <div class="info-box">
                        <p style="margin: 0; font-size: 18px;">Your <strong>${data.serviceType}</strong> session has been completed!</p>
                        <p style="margin: 10px 0 0 0; color: #666;">Please take a moment to share your experience.</p>
                    </div>
                    
                    <div style="text-align: center; margin-top: 30px;">
                        <a href="${feedbackUrl}" class="cta">
                            Share Your Feedback →
                        </a>
                    </div>
                    
                    <p style="margin-top: 30px; color: #666; text-align: center; font-size: 14px;">
                        Your feedback helps us improve and helps other learners make informed decisions.
                    </p>
                </div>
                <div class="footer">
                    <p>Thank you for choosing Prodsnap Mentorship!</p>
                </div>
            </div>
        </body>
        </html>
    `

    return sendEmail({
        to: data.email,
        subject: `✨ Share Your Feedback - ${data.serviceType} Session | Prodsnap`,
        html,
        type: 'feedback_request'
    })
}

// Send scheduled session details to user
export async function sendMentorshipScheduledEmail(data: {
    name: string
    email: string
    serviceType: string
    scheduledAt: Date
    meetingLink: string
}) {
    const date = data.scheduledAt.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    const time = data.scheduledAt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })

    // Google Calendar Link generator
    // Format: YYYYMMDDTHHmmssZ (UTC)
    // We'll use the date as is, usually UTC in Prisma
    const start = data.scheduledAt.toISOString().replace(/-|:|\.\d\d\d/g, "")
    const endDate = new Date(data.scheduledAt.getTime() + 60 * 60 * 1000) // 1 hour session
    const end = endDate.toISOString().replace(/-|:|\.\d\d\d/g, "")

    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(data.serviceType + " with Ravi Barnwal")}&dates=${start}/${end}&details=${encodeURIComponent("Join meeting: " + data.meetingLink)}&location=${encodeURIComponent(data.meetingLink)}`

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; padding: 40px; border-radius: 12px 12px 0 0; text-align: center; }
                .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 12px 12px; }
                .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #8b5cf6; }
                .cta { display: inline-block; background: #8b5cf6; color: white; padding: 15px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; }
                .footer { text-align: center; margin-top: 30px; color: #999; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1 style="margin: 0;">📅 Session Confirmed!</h1>
                    <p style="margin: 10px 0 0 0; opacity: 0.9;">Your mentorship session is scheduled.</p>
                </div>
                <div class="content">
                    <p>Hi <strong>${data.name}</strong>,</p>
                    <p>Great news! Your <strong>${data.serviceType}</strong> session has been approved and scheduled.</p>
                    
                    <div class="info-box">
                        <p style="margin: 5px 0;"><strong>📅 Date:</strong> ${date}</p>
                        <p style="margin: 5px 0;"><strong>⏰ Time:</strong> ${time}</p>
                        <p style="margin: 5px 0;"><strong>📍 Link:</strong> <a href="${data.meetingLink}">${data.meetingLink}</a></p>
                    </div>

                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${googleCalendarUrl}" class="cta" style="background: #4285F4;">Add to Google Calendar</a>
                    </div>
                    
                    <p style="margin-top: 20px; font-size: 14px; color: #666;">
                        Please join the meeting link 5 minutes before the scheduled time. If you need to reschedule, please reply to this email.
                    </p>
                </div>
                <div class="footer">
                    <p>Prodsnap Mentorship Team</p>
                </div>
            </div>
        </body>
        </html>
    `

    return sendEmail({
        to: data.email,
        subject: `📅 Scheduled: ${data.serviceType} with Ravi Barnwal - ${date}`,
        html,
        type: 'mentorship_scheduled'
    })
}

// Send contact form notification to admin
export async function sendContactFormNotification(data: {
    name: string
    email: string
    message: string
}) {
    const adminEmail = process.env.SMTP_SENDER || 'support@prodsnap.in'

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
                .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 12px 12px; }
                .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6; }
                .label { font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px; }
                .value { font-size: 16px; font-weight: 500; color: #333; margin-bottom: 15px; }
                .message-box { background: #e0f2fe; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6; }
                .message-text { font-size: 15px; color: #1e40af; line-height: 1.8; white-space: pre-wrap; }
                .cta { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 20px; }
                .footer { text-align: center; margin-top: 30px; color: #999; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1 style="margin: 0;">📬 New Contact Form Submission!</h1>
                    <p style="margin: 10px 0 0 0; opacity: 0.9;">Someone reached out via the contact form</p>
                </div>
                <div class="content">
                    <div class="info-box">
                        <div class="label">Full Name</div>
                        <div class="value">${data.name}</div>
                        
                        <div class="label">Email Address</div>
                        <div class="value">${data.email}</div>
                    </div>
                    
                    <div class="message-box">
                        <div class="label" style="color: #1e40af;">Message</div>
                        <div class="message-text">${data.message}</div>
                    </div>
                    
                    <p style="margin-top: 30px; color: #666;">
                        Please respond to this inquiry at your earliest convenience. You can reply directly to <strong>${data.email}</strong>.
                    </p>
                    
                    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://prodsnap-gamma.vercel.app'}/admin" class="cta">
                        View in Admin Panel →
                    </a>
                </div>
                <div class="footer">
                    <p>This is an automated notification from Prodsnap Contact Form</p>
                </div>
            </div>
        </body>
        </html>
    `

    return sendEmail({
        to: adminEmail,
        subject: `📬 New Contact Form Submission from ${data.name}`,
        html,
        type: 'contact_form'
    })
}
// Send reply to support inquiry
export async function sendSupportReply(data: {
    name: string
    email: string
    originalMessage: string
    replyMessage: string
}) {
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; }
                .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb; border-top: none; }
                .reply-box { background: white; padding: 25px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #3b82f6; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
                .original-message { background: #f1f5f9; padding: 20px; border-radius: 8px; font-size: 14px; color: #64748b; margin-top: 20px; }
                .label { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; margin-bottom: 8px; }
                .footer { text-align: center; margin-top: 30px; color: #94a3b8; font-size: 12px; }
                .signature { margin-top: 20px; font-weight: 600; color: #1e40af; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h2 style="margin: 0;">Support Response from Prodsnap</h2>
                </div>
                <div class="content">
                    <p>Hi <strong>${data.name}</strong>,</p>
                    <p>Thank you for reaching out to Prodsnap. Here is the response to your inquiry:</p>
                    
                    <div class="reply-box">
                        <div class="label">Our Response</div>
                        <div style="white-space: pre-wrap; color: #1e293b; font-size: 16px;">${data.replyMessage}</div>
                    </div>

                    <div class="signature">
                        Best regards,<br>
                        The Prodsnap Team
                    </div>

                    <div class="original-message">
                        <div class="label">Your Original Message</div>
                        <div style="font-style: italic;">"${data.originalMessage}"</div>
                    </div>
                </div>
                <div class="footer">
                    <p>© Prodsnap - Master PM Interviews with AI Feedback</p>
                    <p>If you have further questions, feel free to reply to this email.</p>
                </div>
            </div>
        </body>
        </html>
    `

    return sendEmail({
        to: data.email,
        subject: `Re: Your Inquiry on Prodsnap - Response from Support`,
        html,
        type: 'support_reply'
    })
}

// Send rejection notification to user
export async function sendRejectionNotification(data: {
    name: string
    email: string
    reason: string
    type: 'subscription' | 'mentorship'
}) {
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 40px; border-radius: 12px 12px 0 0; text-align: center; }
                .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 12px 12px; }
                .alert-box { background: #fee2e2; border: 1px solid #ef4444; padding: 20px; border-radius: 8px; margin: 20px 0; }
                .reason-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444; }
                .info-box { background: #dbeafe; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #3b82f6; }
                .cta { display: inline-block; background: #3b82f6; color: white; padding: 15px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 20px; }
                .footer { text-align: center; margin-top: 30px; color: #999; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1 style="margin: 0;">Payment Request Update</h1>
                    <p style="margin: 10px 0 0 0; opacity: 0.9;">Regarding your ${data.type === 'subscription' ? 'Premium Subscription' : 'Mentorship Booking'} request</p>
                </div>
                <div class="content">
                    <p>Hi <strong>${data.name}</strong>,</p>
                    
                    <div class="alert-box">
                        <p style="margin: 0; color: #991b1b; font-weight: 600;">Unfortunately, we were unable to verify your payment at this time.</p>
                    </div>
                    
                    <div class="reason-box">
                        <strong style="color: #ef4444;">Reason:</strong>
                        <p style="margin: 10px 0 0 0; color: #374151;">${data.reason}</p>
                    </div>
                    
                    <div class="info-box">
                        <strong style="color: #1e40af;">What can you do?</strong>
                        <ul style="margin: 10px 0 0 0; padding-left: 20px; color: #1e40af;">
                            <li>Double-check your payment screenshot and resubmit</li>
                            <li>Ensure the payment amount matches the ${data.type === 'subscription' ? 'subscription' : 'service'} price</li>
                            <li>Make sure the screenshot is clear and readable</li>
                            <li>Contact us if you believe this was an error</li>
                        </ul>
                    </div>
                    
                    <div style="text-align: center;">
                        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://prodsnap-gamma.vercel.app'}/${data.type === 'subscription' ? 'practice' : 'mentorship'}" class="cta">
                            Try Again →
                        </a>
                    </div>
                    
                    <p style="margin-top: 30px; color: #666; font-size: 14px;">
                        If you have any questions or need assistance, please reply to this email or contact us at info.prodsnap@gmail.com
                    </p>
                </div>
                <div class="footer">
                    <p>Thank you for your understanding</p>
                    <p>© Prodsnap - Master PM Interviews with AI Feedback</p>
                </div>
            </div>
        </body>
        </html>
    `

    return sendEmail({
        to: data.email,
        subject: `Payment Request Update - ${data.type === 'subscription' ? 'Premium Subscription' : 'Mentorship Booking'} | Prodsnap`,
        html,
        type: 'rejection'
    })
}
