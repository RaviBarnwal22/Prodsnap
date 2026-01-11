import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function seedPuzzles() {
    console.log('Seeding daily puzzles...')

    // Clear existing puzzles
    await prisma.puzzleAttempt.deleteMany({})
    await prisma.dailyPuzzle.deleteMany({})
    await prisma.userStreak.deleteMany({})

    // Create puzzles for the next 30 days
    const puzzles = [
        {
            question: "Swiggy sees a 10% drop in dinner orders but a 15% rise in lunch orders. What's the most likely cause?",
            context: "Swiggy is India's leading food delivery platform, competing with Zomato.",
            optionA: "Users are switching to Zomato for dinner",
            optionB: "Work-from-office mandates are increasing",
            optionC: "Dinner prices increased significantly",
            optionD: "A new competitor entered the market",
            correctAnswer: "B",
            explanation: "Work-from-office mandates mean more people are ordering lunch at work (convenience) but cooking at home for dinner (cost savings). This behavioral shift explains both metrics moving in opposite directions.",
            category: "USER_BEHAVIOR",
            difficulty: "Medium"
        },
        {
            question: "PhonePe's transaction success rate drops from 99.2% to 97.8%. Which metric should you check FIRST?",
            context: "PhonePe processes billions of UPI transactions monthly in India.",
            optionA: "Bank-wise failure distribution",
            optionB: "User complaints on social media",
            optionC: "Competitor transaction volumes",
            optionD: "App crash reports",
            correctAnswer: "A",
            explanation: "Bank-wise failure distribution reveals if the issue is isolated to specific banks (external) or systemic (internal). This is the fastest way to identify root cause before escalating.",
            category: "METRICS",
            difficulty: "Easy"
        },
        {
            question: "Zomato Gold subscription renewals drop 30% in Tier-2 cities. Best hypothesis?",
            context: "Zomato Gold offers dining discounts and free deliveries for a monthly fee.",
            optionA: "Users found the value proposition weak after trial",
            optionB: "Local restaurants are offering direct discounts",
            optionC: "The subscription price is too high",
            optionD: "Technical issues in the renewal flow",
            correctAnswer: "B",
            explanation: "In Tier-2 cities, restaurant relationships are more personal. Local establishments often offer direct discounts to regulars, making Zomato Gold's middleman value less compelling.",
            category: "STRATEGY",
            difficulty: "Hard"
        },
        {
            question: "Flipkart's cart abandonment rate spikes every Sunday at 8 PM. Why?",
            context: "Flipkart is India's largest e-commerce platform.",
            optionA: "Payment gateway issues",
            optionB: "Users are browsing during IPL matches",
            optionC: "Server capacity problems",
            optionD: "Competitor flash sales",
            correctAnswer: "B",
            explanation: "8 PM Sunday is prime IPL time in India. Users add items to cart during ad breaks but get distracted by the match resuming. This is a behavioral pattern, not a technical issue.",
            category: "USER_BEHAVIOR",
            difficulty: "Medium"
        },
        {
            question: "Ola sees 40% of new users book only one ride and never return. What should you prioritize?",
            context: "Ola is India's leading ride-hailing platform.",
            optionA: "Aggressive discounts for second ride",
            optionB: "Improving first ride experience quality",
            optionC: "Push notifications reminding them to book",
            optionD: "Reducing app load times",
            correctAnswer: "B",
            explanation: "If 40% churn after one ride, the first experience is broken. Discounts won't fix a bad first impression. Focus on driver quality, ETA accuracy, and ride comfort before throwing money at retention.",
            category: "GROWTH",
            difficulty: "Medium"
        },
        {
            question: "CRED's DAU spikes 300% on the 5th of every month. What feature should you enhance?",
            context: "CRED is a credit card bill payment app with rewards.",
            optionA: "Gamification and rewards",
            optionB: "Bill payment reminders",
            optionC: "Credit score tracking",
            optionD: "Referral program",
            correctAnswer: "C",
            explanation: "The 5th is when most credit card bills are due. Users visit to pay bills. Enhancing credit score tracking (which updates post-payment) gives them a reason to engage AFTER paying, extending the session.",
            category: "GROWTH",
            difficulty: "Hard"
        },
        {
            question: "Meesho sellers in rural areas have 50% lower order fulfillment rates. Root cause?",
            context: "Meesho is a social commerce platform targeting Tier-2/3 India.",
            optionA: "Poor internet connectivity",
            optionB: "Lack of packaging materials",
            optionC: "Unreliable pickup schedules",
            optionD: "Language barriers in the app",
            correctAnswer: "C",
            explanation: "Rural sellers often have products ready but logistics partners have inconsistent pickup schedules. The seller waits, the buyer cancels. Fix the last-mile pickup, not the seller experience.",
            category: "STRATEGY",
            difficulty: "Hard"
        },
        {
            question: "Paytm's user retention is highest in which use case?",
            context: "Paytm is a super-app offering payments, banking, and commerce.",
            optionA: "Bill payments",
            optionB: "Money transfers to friends",
            optionC: "Shopping on Paytm Mall",
            optionD: "Booking movie tickets",
            correctAnswer: "A",
            explanation: "Bill payments are recurring and habitual. Users return monthly for electricity, mobile recharge, etc. This creates a sticky loop that one-time use cases like shopping or movies can't match.",
            category: "METRICS",
            difficulty: "Easy"
        },
        {
            question: "Dunzo's order values are 30% lower in evenings vs. afternoons. Best explanation?",
            context: "Dunzo is a hyperlocal delivery app for groceries and essentials.",
            optionA: "Users order emergency items in evenings",
            optionB: "Evening users are more price-sensitive",
            optionC: "Surge pricing reduces basket size",
            optionD: "Limited store inventory in evenings",
            correctAnswer: "A",
            explanation: "Evening orders are often 'forgot to buy' essentials - milk, bread, medicine. Afternoon orders are planned grocery runs. Different user intents = different basket sizes.",
            category: "USER_BEHAVIOR",
            difficulty: "Medium"
        },
        {
            question: "A new fintech app has 80% of users never completing KYC. First fix?",
            context: "KYC (Know Your Customer) is mandatory for financial services in India.",
            optionA: "Reduce KYC steps from 5 to 3",
            optionB: "Add incentives for completing KYC",
            optionC: "Show value proposition before asking for KYC",
            optionD: "Allow partial app access without KYC",
            correctAnswer: "D",
            explanation: "Users don't trust unknown apps with Aadhaar/PAN upfront. Let them explore, see value, then ask for KYC. Partial access builds trust before commitment.",
            category: "GROWTH",
            difficulty: "Medium"
        },
        {
            question: "BigBasket sees 60% of first-time buyers order only fruits. What does this signal?",
            context: "BigBasket is an online grocery delivery platform.",
            optionA: "Users don't trust quality of packed goods",
            optionB: "Fruit prices are most competitive",
            optionC: "New users are testing the platform",
            optionD: "Marketing is over-indexing on fruits",
            correctAnswer: "C",
            explanation: "Fruits are low-risk, visible-quality items. New users test with fruits to evaluate freshness and delivery before trusting the platform with staples like rice or oil.",
            category: "USER_BEHAVIOR",
            difficulty: "Easy"
        },
        {
            question: "Razorpay sees 20% of failed payments retry successfully within 60 seconds. What's happening?",
            context: "Razorpay is a payment gateway used by businesses.",
            optionA: "Users are switching payment methods",
            optionB: "Bank OTP delays are causing initial failures",
            optionC: "Network connectivity issues resolving",
            optionD: "Razorpay's retry logic is working",
            correctAnswer: "B",
            explanation: "Bank OTPs in India often arrive late. Users input old OTP, fail, then retry with the correct one. The 60-second window matches typical OTP delays.",
            category: "METRICS",
            difficulty: "Medium"
        }
    ]

    // Create puzzles with publish dates spread across days
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (let i = 0; i < puzzles.length; i++) {
        const publishDate = new Date(today)
        publishDate.setDate(publishDate.getDate() + i)

        await prisma.dailyPuzzle.create({
            data: {
                ...puzzles[i],
                publishDate
            }
        })
    }

    console.log(`Created ${puzzles.length} daily puzzles`)
    console.log('Puzzle seeding completed!')
}

seedPuzzles()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
