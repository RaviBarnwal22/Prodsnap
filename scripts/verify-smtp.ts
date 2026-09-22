/**
 * SMTP connection checker.
 *
 *   npx tsx scripts/verify-smtp.ts                  # verify credentials only
 *   npx tsx scripts/verify-smtp.ts you@example.com  # also send one test email
 *
 * Reads the same SMTP_* vars the app uses, so a pass here means the app can
 * send. It talks to the mail server directly instead of going through
 * `@/lib/email`, so it does not write an EmailLog row or touch the database.
 *
 * Note what this can and cannot tell you: a pass means the server ACCEPTED the
 * message. It does not mean the message reached an inbox — that depends on
 * SPF/DKIM/DMARC alignment for the From domain. Check the destination inbox
 * (including spam) to judge deliverability.
 */
import nodemailer from "nodemailer"
import dotenv from "dotenv"

dotenv.config({ path: ".env.local" })
dotenv.config()

const host = process.env.SMTP_HOST
const port = parseInt(process.env.SMTP_PORT || "587")
const user = process.env.SMTP_USER
const pass = process.env.SMTP_PASSWORD
const sender = process.env.SMTP_SENDER
const replyTo = process.env.SMTP_REPLY_TO

function mask(v?: string) {
    if (!v) return "MISSING"
    return v.length <= 6 ? "***" : `${v.slice(0, 3)}***${v.slice(-2)}`
}

async function main() {
    console.log("SMTP configuration")
    console.log("  host     :", host || "MISSING")
    console.log("  port     :", port)
    console.log("  user     :", mask(user))
    console.log("  password :", pass ? "PRESENT" : "MISSING")
    console.log("  sender   :", sender || "MISSING")
    console.log("  replyTo  :", replyTo || "(not set)")
    console.log()

    if (!host || !user || !pass) {
        console.log("FAIL — host, user and password must all be set.")
        process.exit(1)
    }

    // Gmail rewrites or rejects a From address that is not the authenticated
    // account (or one of its verified aliases), so flag the mismatch early.
    if (host.includes("gmail.com") && sender && user && sender !== user) {
        console.log(`WARNING — sender (${sender}) differs from user (${mask(user)}).`)
        console.log("  Gmail only allows sending as the authenticated account or a verified alias.")
        console.log()
    }

    const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
    })

    try {
        await transporter.verify()
        console.log("PASS — server accepted the credentials.")
    } catch (e) {
        const msg = e instanceof Error ? e.message : String(e)
        console.log("FAIL —", msg)
        if (/username and password not accepted|invalid login|535/i.test(msg)) {
            console.log("  For Gmail this usually means a normal account password was used.")
            console.log("  You need a 16-character App Password, which requires 2-Step Verification.")
        }
        process.exit(1)
    }

    const to = process.argv[2]
    if (!to) {
        console.log("\nNo recipient given — skipping the test send.")
        console.log("Run again with an address to send one test email.")
        return
    }

    try {
        const info = await transporter.sendMail({
            from: `"Prodsnap Team" <${sender}>`,
            ...(replyTo ? { replyTo } : {}),
            to,
            subject: "Prodsnap SMTP test",
            html: `<p>This is a test from <strong>scripts/verify-smtp.ts</strong>.</p>
                   <p>Sent via <code>${host}</code> as <code>${sender}</code>.</p>
                   <p>If this landed in spam rather than the inbox, the transport works
                      but the From domain is not passing authentication.</p>`,
        })
        console.log("\nSENT — message id:", info.messageId)
        console.log("Now check the inbox AND the spam folder. Where it lands is the real result.")
    } catch (e) {
        console.log("\nSEND FAILED —", e instanceof Error ? e.message : String(e))
        process.exit(1)
    }
}

main()
