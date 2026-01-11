import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const newQuestions = [
    // TECH_ACUMEN
    { title: 'Explain how UPI works to a non-technical stakeholder.', description: 'Break down the technical architecture of UPI in simple terms. Cover the role of NPCI, PSPs, and how real-time settlement happens.', category: 'TECH_ACUMEN', difficulty: 'Medium' },
    { title: 'How would you architect a recommendation system for an e-commerce app?', description: 'Discuss collaborative filtering, content-based approaches, and hybrid models. Consider cold-start problems and real-time personalization.', category: 'TECH_ACUMEN', difficulty: 'Hard' },
    { title: 'What are the trade-offs between SQL and NoSQL databases for a chat application?', description: 'Consider scalability, consistency, real-time requirements, and message ordering. When would you choose one over the other?', category: 'TECH_ACUMEN', difficulty: 'Medium' },
    { title: 'How does caching improve app performance? Explain with examples.', description: 'Discuss CDN caching, in-memory caches like Redis, and browser caching. When should you invalidate cache?', category: 'TECH_ACUMEN', difficulty: 'Easy' },
    { title: 'Explain the concept of API rate limiting and why it matters.', description: 'How would you implement rate limiting for a public API? Discuss token bucket, sliding window, and user-based limits.', category: 'TECH_ACUMEN', difficulty: 'Medium' },
    { title: 'What happens when you type a URL in the browser? Explain the full flow.', description: 'Cover DNS resolution, TCP handshake, TLS, HTTP request/response, and rendering. A classic PM interview question.', category: 'TECH_ACUMEN', difficulty: 'Easy' },

    // GTM
    { title: 'Design a GTM strategy for launching a new fintech app in rural India.', description: 'Consider distribution channels, trust-building, agent networks, and vernacular marketing.', category: 'GTM', difficulty: 'Hard' },
    { title: 'How would you launch a premium subscription tier for Spotify in India?', description: 'Consider pricing localization, bundling strategies, trial periods, and competition from YouTube Music and JioSaavn.', category: 'GTM', difficulty: 'Medium' },
    { title: 'Plan the launch strategy for a new B2B SaaS product targeting Indian SMBs.', description: 'Discuss sales channels, pricing models, onboarding, and customer success.', category: 'GTM', difficulty: 'Hard' },
    { title: 'How would you introduce a new feature to existing users without disrupting their experience?', description: 'Discuss feature flags, A/B testing, gradual rollouts, and user education.', category: 'GTM', difficulty: 'Medium' },
    { title: 'Design a launch plan for a D2C brand entering the Indian market.', description: 'Consider influencer marketing, marketplace vs own website, logistics partnerships, and regional targeting.', category: 'GTM', difficulty: 'Medium' },
    { title: 'How would you position a new AI writing tool against established players like Grammarly?', description: 'Discuss differentiation, target segments, pricing strategy, and messaging.', category: 'GTM', difficulty: 'Hard' },

    // BEHAVIORAL
    { title: 'Tell me about a time you had to convince stakeholders to change direction.', description: 'Use the STAR method. Focus on how you used data, built consensus, and handled resistance.', category: 'BEHAVIORAL', difficulty: 'Medium' },
    { title: 'Describe a situation where you had to make a decision with incomplete information.', description: 'How did you evaluate risks, gather quick insights, and commit to a path forward?', category: 'BEHAVIORAL', difficulty: 'Medium' },
    { title: 'Tell me about a product you shipped that failed. What did you learn?', description: 'Be honest about the failure. Focus on post-mortems, learnings, and how you applied them.', category: 'BEHAVIORAL', difficulty: 'Hard' },
    { title: 'How do you handle disagreements with engineering on technical feasibility?', description: 'Discuss collaboration, understanding constraints, finding creative solutions.', category: 'BEHAVIORAL', difficulty: 'Medium' },
    { title: 'Describe a time you had to prioritize between two equally important features.', description: 'Explain your prioritization framework, stakeholder management, and how you communicated the decision.', category: 'BEHAVIORAL', difficulty: 'Easy' },
    { title: 'Tell me about a time you received critical feedback. How did you respond?', description: 'Focus on growth mindset, specific actions taken, and measurable improvements made.', category: 'BEHAVIORAL', difficulty: 'Easy' },

    // RCA
    { title: 'Daily active users dropped 15% overnight. How would you investigate?', description: 'Walk through your debugging process. Consider technical issues, external factors, seasonality.', category: 'RCA', difficulty: 'Medium' },
    { title: 'Conversion rate on checkout page dropped by 20%. Find the root cause.', description: 'Discuss funnel analysis, segmentation, technical audits, and user research.', category: 'RCA', difficulty: 'Hard' },
    { title: 'App ratings dropped from 4.2 to 3.5 after a release. What went wrong?', description: 'Analyze review sentiment, identify patterns, correlate with release notes.', category: 'RCA', difficulty: 'Medium' },
    { title: 'Customer support tickets increased 3x in the last week. Diagnose the issue.', description: 'Categorize tickets, identify common themes, trace to recent changes.', category: 'RCA', difficulty: 'Medium' },
    { title: 'Payment success rate dropped from 95% to 88%. Investigate and fix.', description: 'Analyze by payment method, bank, time, and user segment.', category: 'RCA', difficulty: 'Hard' },
    { title: 'New user signup completion rate is only 40%. Why are users dropping off?', description: 'Analyze onboarding funnel, identify friction points, run user interviews.', category: 'RCA', difficulty: 'Easy' },

    // GUESTIMATES
    { title: 'Estimate the number of Swiggy orders placed in Bangalore on a Friday evening.', description: 'Break down by population, smartphone penetration, app users, and order frequency.', category: 'GUESTIMATES', difficulty: 'Medium' },
    { title: 'How many WhatsApp messages are sent in India per day?', description: 'Consider active users, message types (text, media, groups), and usage patterns.', category: 'GUESTIMATES', difficulty: 'Easy' },
    { title: 'Estimate the market size for electric scooters in India.', description: 'Use top-down and bottom-up approaches. Consider two-wheeler sales, EV adoption rate.', category: 'GUESTIMATES', difficulty: 'Hard' },
    { title: 'How many Uber drivers are active in Mumbai right now?', description: 'Consider population, ride demand patterns, driver supply, and time of day.', category: 'GUESTIMATES', difficulty: 'Medium' },
    { title: 'Estimate Google annual revenue from India.', description: 'Break down by revenue streams: Search ads, YouTube ads, Cloud, Play Store.', category: 'GUESTIMATES', difficulty: 'Hard' },
    { title: 'How many pizzas does Dominos sell in India per day?', description: 'Consider store count, average orders per store, peak hours, and delivery vs dine-in split.', category: 'GUESTIMATES', difficulty: 'Easy' }
]

async function main() {
    console.log('Adding new practice questions...')
    let added = 0
    for (const q of newQuestions) {
        const existing = await prisma.practiceQuestion.findFirst({ where: { title: q.title } })
        if (!existing) {
            await prisma.practiceQuestion.create({ data: q })
            console.log('Added:', q.title.substring(0, 50) + '...')
            added++
        }
    }
    console.log(`Done! Added ${added} new questions.`)
}

main()
    .then(async () => { await prisma.$disconnect() })
    .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1) })
