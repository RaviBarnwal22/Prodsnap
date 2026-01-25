import { createClient } from './supabase/server'
import { prisma } from './prisma'
import { cache } from 'react'

export const getUser = cache(async () => {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
        return null
    }

    let prismaUser = await prisma.user.findUnique({
        where: { authId: user.id }
    })

    if (!prismaUser) {
        // Check if user exists by email and update them
        const existingUserByEmail = await prisma.user.findUnique({
            where: { email: user.email! }
        })

        if (existingUserByEmail) {
            prismaUser = await prisma.user.update({
                where: { id: existingUserByEmail.id },
                data: { authId: user.id }
            })
        } else {
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
            } catch (createError) {
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

    return prismaUser
})
