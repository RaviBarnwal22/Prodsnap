import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    const email = "Ayushrajj.231@gmail.com"
    console.log(`Checking user: ${email}`)

    const user = await prisma.user.findUnique({
        where: { email }
    })

    if (!user) {
        console.log(`User ${email} not found in database. Creating user record...`)
        const newUser = await prisma.user.create({
            data: {
                email,
                role: 'ADMIN',
                name: 'Ayush Raj',
                firstName: 'Ayush',
                lastName: 'Raj'
            }
        })
        console.log(`Successfully created admin user: ${newUser.email}`)
    } else {
        console.log(`User found. Updating role to ADMIN...`)
        const updatedUser = await prisma.user.update({
            where: { email },
            data: { role: 'ADMIN' }
        })
        console.log(`Successfully updated user ${updatedUser.email} to role: ${updatedUser.role}`)
    }
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
