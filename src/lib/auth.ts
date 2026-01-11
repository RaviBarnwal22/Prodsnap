import { createClient } from './supabase/server'
import { prisma } from './prisma'

export async function getUser() {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
        return null
    }

    const prismaUser = await prisma.user.findUnique({
        where: { authId: user.id }
    })

    if (!prismaUser) {
        // Check if user exists by email and update them
        const existingUserByEmail = await prisma.user.findUnique({
            where: { email: user.email! }
        })

        if (existingUserByEmail) {
            return await prisma.user.update({
                where: { id: existingUserByEmail.id },
                data: { authId: user.id }
            })
        }

        // Create new user if not found
        return await prisma.user.create({
            data: {
                authId: user.id,
                email: user.email!,
                firstName: user.user_metadata?.first_name || null,
                lastName: user.user_metadata?.last_name || null,
                name: user.user_metadata?.full_name || user.email?.split('@')[0],
                role: "STUDENT"
            }
        })
    }

    return prismaUser
}
