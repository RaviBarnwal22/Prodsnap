import { createClient } from './supabase/server'
import { prisma } from './prisma'
import { cache } from 'react'

// Cache getUser per-request to avoid redundant DB hits and Supabase calls
export const getUser = cache(async function getUser() {
    let authUser;
    try {
        const supabase = await createClient()
        const { data: { user }, error } = await supabase.auth.getUser()

        if (error || !user) {
            // "Auth session missing!" is expected for guests - don't log it as an error
            if (error && error.message !== "Auth session missing!") {
                console.error("[getUser] Supabase error:", error.message)
            }
            return null
        }
        authUser = user
    } catch (e) {
        console.error("[getUser] Exception:", e)
        return null
    }

    if (!authUser) return null

    // 2. Sync / Update in Prisma
    try {
        // Find user first to check if we actually need an update
        const existing = await prisma.user.findUnique({
            where: { email: authUser.email! }
        })

        if (!existing) {
            // Create if doesn't exist
            return await prisma.user.create({
                data: {
                    email: authUser.email!,
                    authId: authUser.id,
                    name: authUser.user_metadata?.name || authUser.email?.split('@')[0],
                    firstName: authUser.user_metadata?.first_name || null,
                    lastName: authUser.user_metadata?.last_name || null,
                    lastLoginAt: new Date(),
                    role: "STUDENT"
                }
            })
        }

        // COOLDOWN: Only update lastLoginAt if it's more than 5 minutes old to save DB writes
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
        if (!existing.lastLoginAt || existing.lastLoginAt < fiveMinutesAgo) {
            try {
                return await prisma.user.update({
                    where: { email: authUser.email! },
                    data: {
                        lastLoginAt: new Date(),
                        authId: authUser.id // Ensure authId matches
                    }
                })
            } catch (updateError) {
                console.error("[getUser] Background update failed:", updateError)
                return existing
            }
        }

        return existing
    } catch (e) {
        console.error("[getUser] Sync Error:", e)
        return null
    }
})
