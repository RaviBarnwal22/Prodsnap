import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🚀 Starting Test Data Cleanup...')

    // 1. Delete Mentorship Feedback first (due to foreign key)
    const feedbackDeleted = await prisma.mentorshipFeedback.deleteMany({})
    console.log(`✅ Deleted ${feedbackDeleted.count} mentorship feedback entries.`)

    // 2. Delete Mentorship Bookings (This clears the ~10MB of images)
    const bookingsDeleted = await prisma.mentorshipBooking.deleteMany({})
    console.log(`✅ Deleted ${bookingsDeleted.count} mentorship bookings.`)

    // 3. Delete Subscription Requests
    const subRequestsDeleted = await prisma.subscriptionRequest.deleteMany({})
    console.log(`✅ Deleted ${subRequestsDeleted.count} subscription requests.`)

    console.log('\n✨ Database is now clean and ready for launch!')
}

main()
    .catch((e) => {
        console.error('❌ Error during cleanup:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
