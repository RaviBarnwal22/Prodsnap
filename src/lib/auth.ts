import { createClient } from './supabase/server'
import { prisma } from './prisma'

export async function getUser() {
    let user;
    try {
        const supabase = await createClient()
        const { data: { user: authUser }, error } = await supabase.auth.getUser()

        if (error || !authUser) {
            if (error) console.error("[getUser] Supabase error:", error.message)
            return null
        }
        user = authUser
    } catch (e) {
        console.error("[getUser] Exception:", e)
        return null
    }

    if (!user) return null

    // 2. Sync / Update in Prisma
    try {
        // Try to update lastLoginAt if user exists
        const prismaUser = await prisma.user.update({
            where: { email: user.email! },
            data: {
                lastLoginAt: new Date(),
                authId: user.id // Ensure authId is synced
            }
        })
        return prismaUser
    } catch (e) {
        // If update fails, user might not exist or field might be different
        // Re-check schema: lastLoginAt exists according to my view_file (line 20)

        const existing = await prisma.user.findUnique({
            where: { email: user.email! }
        })

        if (existing) {
            // Already tried update and failed, maybe return existing or try a simpler update
            return existing
        }

        // Create if doesn't exist
        try {
            return await prisma.user.create({
                data: {
                    email: user.email!,
                    authId: user.id,
                    name: user.user_metadata?.name || user.email?.split('@')[0],
                    firstName: user.user_metadata?.first_name || null,
                    lastName: user.user_metadata?.last_name || null,
                    lastLoginAt: new Date(),
                    role: "STUDENT"
                }
            })
        } catch (createError) {
            console.error("[getUser] Double Failure:", createError)
            return null
        }
    }
}
