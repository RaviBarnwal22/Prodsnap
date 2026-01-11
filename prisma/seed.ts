import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    console.log('Seeding data...')

    // Clean up existing data
    await prisma.practiceSubmission.deleteMany({})
    await prisma.review.deleteMany({})
    await prisma.booking.deleteMany({})
    await prisma.service.deleteMany({})
    await prisma.expertProfile.deleteMany({})
    await prisma.user.deleteMany({})
    await prisma.practiceQuestion.deleteMany({})

    await prisma.practiceQuestion.createMany({
        data: [
            // ============================================
            // CATEGORY 1: CONSUMER PRODUCT DESIGN
            // ============================================
            {
                title: "Design a budgeting app for middle-class Indian families.",
                description: "Consider joint family dynamics, multiple income sources, irregular expenses, and financial literacy levels. Think about how to make budgeting accessible and culturally relevant.",
                category: "CONSUMER_PRODUCT_DESIGN",
                difficulty: "Medium",
                solutionText: "Use the CIRCLES framework: 1. Clarify Goal: Help families save 15% more monthly. 2. Identify Users: The 'Family CFO' (usually mom/dad), 'Working Youth', 'Retired Parents'. 3. Report Needs: Tracking cash expenses, joint visibility, goal-based savings. 4. Cut/Prioritize: Focus on Auto-magic SMS tracking first. 5. List Solutions: WhatsApp-based logging, shared wallets, gold-investment linked savings.",
                sampleAnswer: "I would start by defining the primary goal: to improve financial resilience for middle-income Indian families by increasing their savings rate. In many Indian homes, expenses are managed by a single 'CFO', but spending happens across the family. My solution, 'PaisaSync', would feature: 1. SMS-based automated tracking (since UPI is huge), 2. A 'Shared Family Pot' where members can contribute to specific goals like 'Sister's Marriage' or 'New Fridge', and 3. A vernacular-first interface with voice assistance for elders."
            },
            {
                title: "Improve the food discovery experience for first-time Zomato users.",
                description: "How would you help new users find restaurants they'll love? Consider personalization, local preferences, and reducing decision fatigue.",
                category: "CONSUMER_PRODUCT_DESIGN",
                difficulty: "Easy",
                solutionText: "Focus on onboarding and trust. Solutions: 1. Onboarding quiz for taste profile. 2. 'Popular in your society' social proof. 3. Influencer-led collections. 4. Better visual hierarchy for ratings and safety.",
                sampleAnswer: "Zomato's discovery for new users can be overwhelming. I'll focus on 'Taste Profiling' during the first 30 seconds. By asking simple questions like 'Sweet or Spicy?' or 'South Indian vs Chinese?', we can create a 'For You' shelf immediately. Additionally, implementing 'Building-wise Popular' restaurants leverages the high social trust in Indian apartment complexes, significantly reducing decision fatigue for a new user who is unsure about local quality."
            },
            {
                title: "Design a habit-building app for working professionals in India.",
                description: "Consider the unique work culture, commute times, and lifestyle patterns of Indian professionals. Focus on motivation and streak mechanics.",
                category: "CONSUMER_PRODUCT_DESIGN",
                difficulty: "Medium"
            },
            {
                title: "Redesign the search experience on Flipkart mobile.",
                description: "How would you improve product discovery, handle vernacular queries, and optimize for conversion? Consider the diversity of users and products.",
                category: "CONSUMER_PRODUCT_DESIGN",
                difficulty: "Hard"
            },
            {
                title: "Design a fitness product for users in Tier-2 cities.",
                description: "Consider limited gym access, price sensitivity, and cultural factors around fitness. How do you make fitness accessible for this segment?",
                category: "CONSUMER_PRODUCT_DESIGN",
                difficulty: "Hard"
            },
            {
                title: "Improve onboarding for a vernacular learning app.",
                description: "How would you onboard users who are learning in Hindi, Tamil, or other regional languages? Consider literacy levels and comfort with technology.",
                category: "CONSUMER_PRODUCT_DESIGN",
                difficulty: "Medium"
            },
            {
                title: "Design a daily planning app for college students.",
                description: "Consider class schedules, assignment deadlines, social activities, and the chaos of college life. How do you make planning actually stick?",
                category: "CONSUMER_PRODUCT_DESIGN",
                difficulty: "Easy"
            },
            {
                title: "Design a digital product for street vendors in India.",
                description: "Focus on affordability, offline-first usage, simple UI, and payments. Consider trust, language, and onboarding challenges.",
                category: "CONSUMER_PRODUCT_DESIGN",
                difficulty: "Hard"
            },
            {
                title: "Redesign IRCTC ticket booking experience.",
                description: "Prioritize reliability, queue transparency, mobile-first UX, and error recovery. Consider the massive scale and diverse user base.",
                category: "CONSUMER_PRODUCT_DESIGN",
                difficulty: "Hard"
            },
            {
                title: "Design a product for farmers to track crop prices.",
                description: "Consider offline access, vernacular language support, and integration with local mandis. Think about rural India constraints.",
                category: "CONSUMER_PRODUCT_DESIGN",
                difficulty: "Hard"
            },

            // ============================================
            // CATEGORY 2: METRICS & SUCCESS MEASUREMENT
            // ============================================
            {
                title: "How would you define success for a digital wallet in India?",
                description: "Consider transaction volume, user activation, merchant adoption, and trust metrics. What's the North Star for a UPI-based wallet?",
                category: "METRICS",
                difficulty: "Medium"
            },
            {
                title: "What metrics would you track for an online learning platform?",
                description: "Consider course completion, engagement, learning outcomes, and retention. How do you measure if users are actually learning?",
                category: "METRICS",
                difficulty: "Easy"
            },
            {
                title: "How do you measure engagement in a content app?",
                description: "Define meaningful engagement beyond DAU/MAU. Consider time spent, content diversity, and user satisfaction.",
                category: "METRICS",
                difficulty: "Easy"
            },
            {
                title: "Define the North Star metric for a ride-hailing app.",
                description: "What single metric best captures value for riders, drivers, and the platform? How do you balance supply and demand health?",
                category: "METRICS",
                difficulty: "Medium"
            },
            {
                title: "How would you evaluate success of a referral program?",
                description: "Consider K-factor, quality of referred users, cost per acquisition, and long-term value. What makes a referral program truly successful?",
                category: "METRICS",
                difficulty: "Medium"
            },
            {
                title: "Measure effectiveness of a product onboarding flow.",
                description: "What metrics indicate successful onboarding? Consider activation rates, time-to-value, and early retention.",
                category: "METRICS",
                difficulty: "Easy"
            },
            {
                title: "What KPIs matter most for a job search platform?",
                description: "Consider both job seeker and employer success. How do you measure if users are finding the right opportunities?",
                category: "METRICS",
                difficulty: "Medium"
            },
            {
                title: "How would you measure trust in a marketplace?",
                description: "Trust is critical for marketplaces. What metrics capture buyer confidence, seller reliability, and transaction safety?",
                category: "METRICS",
                difficulty: "Hard"
            },
            {
                title: "Define success for a subscription-based OTT app.",
                description: "Beyond subscriber count, what metrics indicate a healthy streaming business? Consider engagement, churn, and content performance.",
                category: "METRICS",
                difficulty: "Medium"
            },
            {
                title: "How would you measure success for UPI apps?",
                description: "Define north star as successful transactions, supported by DAU, failure rate, and retention in India's payments ecosystem.",
                category: "METRICS",
                difficulty: "Easy"
            },

            // ============================================
            // CATEGORY 3: GROWTH & RETENTION
            // ============================================
            {
                title: "Increase repeat usage for a food delivery app.",
                description: "Users order once but don't return. How would you drive habit formation and increase order frequency?",
                category: "GROWTH_RETENTION",
                difficulty: "Medium"
            },
            {
                title: "Reduce churn in a language learning platform.",
                description: "Users sign up but drop off after a week. How do you keep them engaged for the long term?",
                category: "GROWTH_RETENTION",
                difficulty: "Medium"
            },
            {
                title: "Improve retention for a personal finance app.",
                description: "Users check their balance once and forget the app. How do you make it a daily habit?",
                category: "GROWTH_RETENTION",
                difficulty: "Medium"
            },
            {
                title: "Launch a new feature for Swiggy to increase order frequency.",
                description: "Use subscription benefits, personalized nudges, and time-based incentives. Think about user behavior patterns.",
                category: "GROWTH_RETENTION",
                difficulty: "Hard"
            },
            {
                title: "Improve onboarding for first-time users on Paytm.",
                description: "Reduce cognitive load, guided flows, contextual tooltips, and early value discovery for new fintech users.",
                category: "GROWTH_RETENTION",
                difficulty: "Medium"
            },
            {
                title: "Design a referral strategy for a hyperlocal services app.",
                description: "How would you leverage word-of-mouth in neighborhoods? Consider trust, incentives, and local communities.",
                category: "GROWTH_RETENTION",
                difficulty: "Hard"
            },

            // ============================================
            // CATEGORY 4: TECH ACUMEN
            // ============================================
            {
                title: "Explain how UPI works to a non-technical stakeholder.",
                description: "Break down the technical architecture of UPI in simple terms. Cover the role of NPCI, PSPs, and how real-time settlement happens.",
                category: "TECH_ACUMEN",
                difficulty: "Medium"
            },
            {
                title: "How would you architect a recommendation system for an e-commerce app?",
                description: "Discuss collaborative filtering, content-based approaches, and hybrid models. Consider cold-start problems and real-time personalization.",
                category: "TECH_ACUMEN",
                difficulty: "Hard"
            },
            {
                title: "What are the trade-offs between SQL and NoSQL databases for a chat application?",
                description: "Consider scalability, consistency, real-time requirements, and message ordering. When would you choose one over the other?",
                category: "TECH_ACUMEN",
                difficulty: "Medium"
            },
            {
                title: "How does caching improve app performance? Explain with examples.",
                description: "Discuss CDN caching, in-memory caches like Redis, and browser caching. When should you invalidate cache?",
                category: "TECH_ACUMEN",
                difficulty: "Easy"
            },
            {
                title: "Explain the concept of API rate limiting and why it matters.",
                description: "How would you implement rate limiting for a public API? Discuss token bucket, sliding window, and user-based limits.",
                category: "TECH_ACUMEN",
                difficulty: "Medium"
            },
            {
                title: "What happens when you type a URL in the browser? Explain the full flow.",
                description: "Cover DNS resolution, TCP handshake, TLS, HTTP request/response, and rendering. A classic PM interview question.",
                category: "TECH_ACUMEN",
                difficulty: "Easy"
            },

            // ============================================
            // CATEGORY 5: GO-TO-MARKET (GTM)
            // ============================================
            {
                title: "Design a GTM strategy for launching a new fintech app in rural India.",
                description: "Consider distribution channels, trust-building, agent networks, and vernacular marketing. How do you reach users with limited digital literacy?",
                category: "GTM",
                difficulty: "Hard"
            },
            {
                title: "How would you launch a premium subscription tier for Spotify in India?",
                description: "Consider pricing localization, bundling strategies, trial periods, and competition from YouTube Music and JioSaavn.",
                category: "GTM",
                difficulty: "Medium"
            },
            {
                title: "Plan the launch strategy for a new B2B SaaS product targeting Indian SMBs.",
                description: "Discuss sales channels, pricing models, onboarding, and customer success. Consider the unique challenges of the Indian SMB market.",
                category: "GTM",
                difficulty: "Hard"
            },
            {
                title: "How would you introduce a new feature to existing users without disrupting their experience?",
                description: "Discuss feature flags, A/B testing, gradual rollouts, and user education. Balance innovation with stability.",
                category: "GTM",
                difficulty: "Medium"
            },
            {
                title: "Design a launch plan for a D2C brand entering the Indian market.",
                description: "Consider influencer marketing, marketplace vs own website, logistics partnerships, and regional targeting.",
                category: "GTM",
                difficulty: "Medium"
            },
            {
                title: "How would you position a new AI writing tool against established players like Grammarly?",
                description: "Discuss differentiation, target segments, pricing strategy, and messaging. Consider the India-specific context.",
                category: "GTM",
                difficulty: "Hard"
            },

            // ============================================
            // CATEGORY 6: BEHAVIORAL
            // ============================================
            {
                title: "Tell me about a time you had to convince stakeholders to change direction.",
                description: "Use the STAR method. Focus on how you used data, built consensus, and handled resistance.",
                category: "BEHAVIORAL",
                difficulty: "Medium"
            },
            {
                title: "Describe a situation where you had to make a decision with incomplete information.",
                description: "How did you evaluate risks, gather quick insights, and commit to a path forward? What was the outcome?",
                category: "BEHAVIORAL",
                difficulty: "Medium"
            },
            {
                title: "Tell me about a product you shipped that failed. What did you learn?",
                description: "Be honest about the failure. Focus on post-mortems, learnings, and how you applied them to future work.",
                category: "BEHAVIORAL",
                difficulty: "Hard"
            },
            {
                title: "How do you handle disagreements with engineering on technical feasibility?",
                description: "Discuss collaboration, understanding constraints, finding creative solutions, and maintaining relationships.",
                category: "BEHAVIORAL",
                difficulty: "Medium"
            },
            {
                title: "Describe a time you had to prioritize between two equally important features.",
                description: "Explain your prioritization framework, stakeholder management, and how you communicated the decision.",
                category: "BEHAVIORAL",
                difficulty: "Easy"
            },
            {
                title: "Tell me about a time you received critical feedback. How did you respond?",
                description: "Focus on growth mindset, specific actions taken, and measurable improvements made.",
                category: "BEHAVIORAL",
                difficulty: "Easy"
            },

            // ============================================
            // CATEGORY 7: ROOT CAUSE ANALYSIS (RCA)
            // ============================================
            {
                title: "Daily active users dropped 15% overnight. How would you investigate?",
                description: "Walk through your debugging process. Consider technical issues, external factors, seasonality, and data quality.",
                category: "RCA",
                difficulty: "Medium"
            },
            {
                title: "Conversion rate on checkout page dropped by 20%. Find the root cause.",
                description: "Discuss funnel analysis, segmentation, technical audits, and user research. How do you prioritize hypotheses?",
                category: "RCA",
                difficulty: "Hard"
            },
            {
                title: "App ratings dropped from 4.2 to 3.5 after a release. What went wrong?",
                description: "Analyze review sentiment, identify patterns, correlate with release notes, and plan remediation.",
                category: "RCA",
                difficulty: "Medium"
            },
            {
                title: "Customer support tickets increased 3x in the last week. Diagnose the issue.",
                description: "Categorize tickets, identify common themes, trace to recent changes, and propose fixes.",
                category: "RCA",
                difficulty: "Medium"
            },
            {
                title: "Payment success rate dropped from 95% to 88%. Investigate and fix.",
                description: "Analyze by payment method, bank, time, and user segment. Coordinate with payment gateway and engineering.",
                category: "RCA",
                difficulty: "Hard"
            },
            {
                title: "New user signup completion rate is only 40%. Why are users dropping off?",
                description: "Analyze onboarding funnel, identify friction points, run user interviews, and propose solutions.",
                category: "RCA",
                difficulty: "Easy"
            },

            // ============================================
            // CATEGORY 8: GUESTIMATES
            // ============================================
            {
                title: "Estimate the number of Swiggy orders placed in Bangalore on a Friday evening.",
                description: "Break down by population, smartphone penetration, app users, and order frequency. Show your assumptions clearly.",
                category: "GUESTIMATES",
                difficulty: "Medium"
            },
            {
                title: "How many WhatsApp messages are sent in India per day?",
                description: "Consider active users, message types (text, media, groups), and usage patterns across demographics.",
                category: "GUESTIMATES",
                difficulty: "Easy"
            },
            {
                title: "Estimate the market size for electric scooters in India.",
                description: "Use top-down and bottom-up approaches. Consider two-wheeler sales, EV adoption rate, and price points.",
                category: "GUESTIMATES",
                difficulty: "Hard"
            },
            {
                title: "How many Uber drivers are active in Mumbai right now?",
                description: "Consider population, ride demand patterns, driver supply, and time of day assumptions.",
                category: "GUESTIMATES",
                difficulty: "Medium"
            },
            {
                title: "Estimate Google's annual revenue from India.",
                description: "Break down by revenue streams: Search ads, YouTube ads, Cloud, Play Store. Use market data and assumptions.",
                category: "GUESTIMATES",
                difficulty: "Hard"
            },
            {
                title: "How many pizzas does Domino's sell in India per day?",
                description: "Consider store count, average orders per store, peak hours, and delivery vs dine-in split.",
                category: "GUESTIMATES",
                difficulty: "Easy"
            }
        ]
    })

    const mentor1 = await prisma.user.create({
        data: {
            email: "sarah@example.com",
            firstName: "Sarah",
            lastName: "Chen",
            role: "EXPERT",
            expertProfile: {
                create: {
                    company: "Google",
                    role: "Senior PM",
                    experienceYears: 8,
                    hourlyRateINR: 8000,
                    skills: "Product Strategy, AI/ML, Infrastructure",
                    isVerified: true
                }
            }
        }
    })

    const mentor2 = await prisma.user.create({
        data: {
            email: "marcus@example.com",
            firstName: "Marcus",
            lastName: "Johnson",
            role: "EXPERT",
            expertProfile: {
                create: {
                    company: "Meta",
                    role: "Product Lead",
                    experienceYears: 12,
                    hourlyRateINR: 12000,
                    skills: "Growth, Social Media, Monetization",
                    isVerified: true
                }
            }
        }
    })

    const testUser = await prisma.user.create({
        data: {
            email: "john.doe@example.com",
            firstName: "John",
            lastName: "Doe",
            name: "John Doe",
            role: "STUDENT"
        }
    })

    // Create Admin user
    // Note: The actual password is set in Supabase Auth (test092)
    // This creates the local Prisma record that will be linked when admin logs in
    const adminUser = await prisma.user.create({
        data: {
            email: "ravibarnwal89@gmail.com",
            firstName: "Ravi",
            lastName: "Barnwal",
            name: "Ravi Barnwal",
            role: "ADMIN"
        }
    })

    console.log('Admin user created:', adminUser.email)
    console.log('Seeding completed.')
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
