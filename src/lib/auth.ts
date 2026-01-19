
import { createClient } from './supabase/server'
import { prisma } from './prisma'

export async function getUser() {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
        if (error) console.error("[getUser] Supabase error:", error.message)
        return null
    }

    console.log(`[getUser] Found Supabase user: ${user.id} (${user.email})`)

    let prismaUser = await prisma.user.findUnique({
        where: { authId: user.id }
    })

    if (!prismaUser) {
        console.log(`[getUser] Prisma user NOT found by authId. Checking by email...`)
        // Check if user exists by email and update them
        const existingUserByEmail = await prisma.user.findUnique({
            where: { email: user.email! }
        })

        if (existingUserByEmail) {
            console.log(`[getUser] Found existing user by email: ${existingUserByEmail.id}. Syncing authId...`)
            prismaUser = await prisma.user.update({
                where: { id: existingUserByEmail.id },
                data: { authId: user.id }
            })
        } else {
            console.log(`[getUser] Creating NEW user in Prisma...`)
            // Create new user if not found
            try {
                prismaUser = await prisma.user.create({
                    data: {
                        authId: user.id,
                        email: user.email!,
                        firstName: user.user_metadata?.first_name || null,
                        lastName: user.user_metadata?.last_name || null,
                        name: user.user_metadata?.full_name || user.email?.split('@')[0],
                        role: "STUDENT"
                    }
                })
                console.log(`[getUser] Created new user: ${prismaUser.id}`)
            } catch (createError) {
                console.error("[getUser] Failed to create user:", createError)
                // Re-attempt fetch by email in case of race condition
                prismaUser = await prisma.user.findUnique({
                    where: { email: user.email! }
                })
                if (prismaUser) {
                    prismaUser = await prisma.user.update({
                        where: { id: prismaUser.id },
                        data: { authId: user.id }
                    })
                }
            }
        }
    }

    if (prismaUser) {
        console.log(`[getUser] Success: Returning Prisma user ${prismaUser.id}`)
    } else {
        console.error(`[getUser] Critical: Failed to resolve Prisma user for ${user.id}`)
    }

    return prismaUser
}
