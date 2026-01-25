import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('--- Database Usage Check ---')

    const subRequestsCount = await prisma.subscriptionRequest.count()
    const mentorshipBookingsCount = await prisma.mentorshipBooking.count()
    const submissionsCount = await prisma.practiceSubmission.count()
    const usersCount = await prisma.user.count()

    console.log(`- Subscription Requests: ${subRequestsCount}`)
    console.log(`- Mentorship Bookings: ${mentorshipBookingsCount}`)
    console.log(`- Practice Submissions: ${submissionsCount}`)
    console.log(`- Total Users: ${usersCount}`)

    // Estimate size of paymentProof fields (assuming average base64 is 2MB)
    const totalImageEntries = subRequestsCount + mentorshipBookingsCount
    const estimatedImageSizeMB = (totalImageEntries * 2).toFixed(2)

    console.log(`\nEstimated image data in DB: ~${estimatedImageSizeMB} MB`)
    console.log('\n(Free Supabase DB limit is 500MB)')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
