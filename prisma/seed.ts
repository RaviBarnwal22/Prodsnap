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
    await prisma.userActivity.deleteMany({})
    await prisma.puzzleAttempt.deleteMany({})
    await prisma.userStreak.deleteMany({})
    await prisma.subscription.deleteMany({})
    await prisma.categoryAttempt.deleteMany({})
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
            {
                title: "How would you grow Netflix's user base in Southeast Asia?",
                description: "Consider pricing sensitivity, local content needs, mobile-first behavior, and competition from regional players.",
                category: "GROWTH_RETENTION",
                difficulty: "Hard"
            },
            {
                title: "Increase daily active creators on TikTok.",
                description: "Most users consume but don't create. Design features and incentives to convert lurkers into active creators.",
                category: "GROWTH_RETENTION",
                difficulty: "Medium"
            },
            {
                title: "Reduce early churn for LinkedIn Premium subscribers.",
                description: "Users cancel after the first month. How do you demonstrate value early and drive habit formation?",
                category: "GROWTH_RETENTION",
                difficulty: "Medium"
            },
            {
                title: "Design a viral loop for Dropbox's file-sharing feature.",
                description: "How can the core product experience naturally encourage users to invite others? Think about network effects.",
                category: "GROWTH_RETENTION",
                difficulty: "Medium"
            },
            {
                title: "Increase merchant retention on Amazon Marketplace.",
                description: "Small sellers often quit after poor initial sales. How do you support them and improve their success rate?",
                category: "GROWTH_RETENTION",
                difficulty: "Hard"
            },
            {
                title: "Re-activate dormant users for Spotify.",
                description: "Users who haven't opened the app in 90 days. Design a win-back strategy across email, push, and in-app.",
                category: "GROWTH_RETENTION",
                difficulty: "Medium"
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
            {
                title: "Launch Tesla's electric vehicles in India.",
                description: "Address charging infrastructure, import duties, price positioning vs luxury cars, and building trust in EV technology.",
                category: "GTM",
                difficulty: "Hard"
            },
            {
                title: "How would you launch Amazon's same-day delivery in a new city?",
                description: "Plan logistics network, warehouse placement, demand forecasting, and initial marketing to drive adoption.",
                category: "GTM",
                difficulty: "Medium"
            },
            {
                title: "Design the GTM for Meta's WhatsApp Business API in Europe.",
                description: "Target SMBs with limited tech resources. Consider GDPR compliance, pricing, and partner channels.",
                category: "GTM",
                difficulty: "Hard"
            },
            {
                title: "Launch Shopify's point-of-sale system to offline retailers in India.",
                description: "Bridge digital-physical gap, handle cash transactions, train shop owners, and compete with local alternatives.",
                category: "GTM",
                difficulty: "Medium"
            },
            {
                title: "How would Microsoft Teams enter the education market against Google Classroom?",
                description: "Late mover advantage, freemium vs paid, institutional sales, and teacher/student onboarding.",
                category: "GTM",
                difficulty: "Medium"
            },
            {
                title: "Launch Adobe Creative Cloud's student plan in Tier-2 Indian cities.",
                description: "Price sensitivity, piracy competition, language support, and partnership with design institutes.",
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
            {
                title: "Describe a time when you had to work with a difficult stakeholder at Amazon/Google/Meta.",
                description: "How did you build alignment despite conflicting priorities? Use STAR format with specific examples.",
                category: "BEHAVIORAL",
                difficulty: "Medium"
            },
            {
                title: "Tell me about a time you launched a feature that required cross-functional buy-in from 5+ teams.",
                description: "How did you manage dependencies, timelines, and communication? What would you do differently?",
                category: "BEHAVIORAL",
                difficulty: "Hard"
            },
            {
                title: "Share an example of when you had to make a trade-off between user experience and business metrics.",
                description: "How did you evaluate the decision? What framework did you use? What was the result?",
                category: "BEHAVIORAL",
                difficulty: "Hard"
            },
            {
                title: "Describe a time when you missed a deadline or failed to meet expectations.",
                description: "Focus on ownership, communication with stakeholders, and how you recovered and rebuilt trust.",
                category: "BEHAVIORAL",
                difficulty: "Medium"
            },
            {
                title: "Tell me about the most innovative product idea you've championed.",
                description: "How did you validate it? What resistance did you face? How did you measure success?",
                category: "BEHAVIORAL",
                difficulty: "Medium"
            },
            {
                title: "Describe a situation where data contradicted your intuition. What did you do?",
                description: "How do you balance gut feel with data? Give a specific example where you pivoted based on insights.",
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
            },

            // ============================================
            // NEW ADDITIONS (GLOBAL & DIVERSE CASES)
            // ============================================

            // --- STRATEGY & MARKET ENTRY ---
            {
                title: "Should Netflix enter the live sports market?",
                description: "Analyze the strategic fit, cost of rights, user acquisition potential, and technical requirements. Is it worth the investment?",
                category: "STRATEGY",
                difficulty: "Hard"
            },
            {
                title: "Should Google launch a ride-sharing service to compete with Uber?",
                description: "Evaluate Google's assets (Maps, Waymo), market saturation, and potential synergies vs regulatory risks.",
                category: "STRATEGY",
                difficulty: "Hard"
            },
            {
                title: "Evaluate whether Airbnb should offer long-term rentals (1 year+).",
                description: "Consider the shift in remote work, impact on housing markets, and differences in host/guest needs for long stays.",
                category: "STRATEGY",
                difficulty: "Medium"
            },
            {
                title: "Should Apple launch a search engine?",
                description: "Analyze the 'Buy vs Build' decision, privacy positioning, revenue impact from Google default deal, and ecosystem lock-in.",
                category: "STRATEGY",
                difficulty: "Hard"
            },
            {
                title: "Strategy for a US fintech app entering the European market.",
                description: "Discuss regulatory fragmentation (GDPR, banking licenses), cultural differences in finance, and local competitors.",
                category: "GTM",
                difficulty: "Hard"
            },
            {
                title: "Should Uber Eats acquire a grocery delivery startup?",
                description: "Analyze the 'Superapp' strategy, operational synergies, profit margins in grocery vs food, and competitive landscape.",
                category: "STRATEGY",
                difficulty: "Medium"
            },
            {
                title: "Evaluate the threat of TikTok to YouTube's dominance.",
                description: "Compare user demographics, content consumption patterns, creator economy, and ad revenue models.",
                category: "STRATEGY",
                difficulty: "Medium"
            },
            {
                title: "Should Amazon launch a high-end luxury fashion vertical?",
                description: "Discuss brand perception gaps, logistics for high-value items, and the need for a distinct user experience.",
                category: "STRATEGY",
                difficulty: "Medium"
            },

            // --- GLOBAL PRODUCT DESIGN ---
            {
                title: "Design a feature for Spotify to improve social sharing.",
                description: "Users want to share music but often leave the app. How can you make sharing seamless and engaging within Spotify?",
                category: "CONSUMER_PRODUCT_DESIGN",
                difficulty: "Medium"
            },
            {
                title: "Design a smart home app for elderly users living alone.",
                description: "Focus on safety, voice accessibility, simplified UI, and emergency protocols. Consider physical limitations.",
                category: "CONSUMER_PRODUCT_DESIGN",
                difficulty: "Medium"
            },
            {
                title: "Improve the 'Save for Later' experience on Amazon.",
                description: "Turn a static list into an active purchase driver. Consider price alerts, bundling, and reminders.",
                category: "CONSUMER_PRODUCT_DESIGN",
                difficulty: "Easy"
            },
            {
                title: "Design a travel itinerary planner for Airbnb.",
                description: "Move beyond booking homes to planning experiences. Integrate map views, time slots, and group collaboration.",
                category: "CONSUMER_PRODUCT_DESIGN",
                difficulty: "Medium"
            },
            {
                title: "Create a gamified feature for Duolingo to boost weekend usage.",
                description: "Weekend drop-off is common. Design a mechanic (leagues, streak freeze quests, team challenges) to retain users.",
                category: "CONSUMER_PRODUCT_DESIGN",
                difficulty: "Easy"
            },
            {
                title: "Design a mental health feature for Instagram.",
                description: "Address the negative impact of social media. Consider usage limits, 'take a break' nudges, or positive content filters.",
                category: "CONSUMER_PRODUCT_DESIGN",
                difficulty: "Hard"
            },
            {
                title: "Improve the notification system for Slack to reduce noise.",
                description: "Information overload is a pain point. Design smart summaries, priority inbox, or better default settings.",
                category: "CONSUMER_PRODUCT_DESIGN",
                difficulty: "Medium"
            },
            {
                title: "Design a product to help remote teams build culture.",
                description: "Remote work can feel isolating. Create a digital watercooler or team-bonding experience for distributed companies.",
                category: "CONSUMER_PRODUCT_DESIGN",
                difficulty: "Medium"
            },
            {
                title: "Create a sustainable shopping feature for a fashion e-commerce app.",
                description: "Help users make eco-friendly choices. Consider carbon footprint tracking, second-hand resale, or material transparency.",
                category: "CONSUMER_PRODUCT_DESIGN",
                difficulty: "Medium"
            },
            {
                title: "Design an AR feature for Google Maps to help tourists.",
                description: "Enhance the walking navigation experience with history overlays, menu translations, or landmark tagging.",
                category: "CONSUMER_PRODUCT_DESIGN",
                difficulty: "Hash"
            },

            // --- ANALYTICS & RCA (GLOBAL CONTEXT) ---
            {
                title: "YouTube usage is up, but ad revenue is down. Why?",
                description: "Investigate shifts in viewer geography, rise of AdBlockers, content safety issues, or lower CPM on Shorts.",
                category: "RCA",
                difficulty: "Hard"
            },
            {
                title: "Daily active users on Twitter/X increased, but posting decreased. Investigate.",
                description: "Analyze the 'lurker' phenomenon. Is it a content consumption shift or fear of toxicity? Check feature usage.",
                category: "RCA",
                difficulty: "Medium"
            },
            {
                title: "Success metrics for a new collaborative feature in Google Docs.",
                description: "Define adoption, retention, and latency metrics. How do you measure 'collaborative friction'?",
                category: "METRICS",
                difficulty: "Medium"
            },
            {
                title: "Key metrics for a B2B SaaS churn prediction model.",
                description: "Identify leading indicators of churn: login frequency, feature usage drops, support ticket volume, and contract renewals.",
                category: "METRICS",
                difficulty: "Hard"
            },
            {
                title: "Measuring the success of Instagram Reels vs. TikTok.",
                description: "Compare watch time, creation rate, shareability, and retention impact. How do you define 'viral'?",
                category: "METRICS",
                difficulty: "Medium"
            },
            {
                title: "LinkedIn job applications are up, but hires are down. Diagnose.",
                description: "Investigate application quality, resume parsing issues, employer responsiveness, or fake job postings.",
                category: "RCA",
                difficulty: "Medium"
            },
            {
                title: "Define success for Facebook Marketplace.",
                description: "Track liquidity (listing to sold ratio), scams reported, user trust, and local engagement.",
                category: "METRICS",
                difficulty: "Medium"
            },
            {
                title: "Metrics to track the health of the Airbnb host ecosystem.",
                description: "Measure occupancy rates, host churn, Superhost retention, and earnings per listing.",
                category: "METRICS",
                difficulty: "Medium"
            },
            {
                title: "Cart abandonment rate increased on an e-commerce site. RCA.",
                description: "Check for technical errors, new shipping costs, complex checkout flow, or payment gateway failures.",
                category: "RCA",
                difficulty: "Easy"
            },
            {
                title: "Zoom's average meeting length decreased by 10%. Good or bad?",
                description: "Context matters. Could be efficiency (good) or product fatigue/competitor usage (bad). Segment by user type.",
                category: "METRICS",
                difficulty: "Medium"
            },

            // --- TECHNICAL ACUMEN (SYSTEM DESIGN) ---
            {
                title: "How does end-to-end encryption work in WhatsApp?",
                description: "Explain public/private keys in simple terms. Why can't WhatsApp read your messages?",
                category: "TECH_ACUMEN",
                difficulty: "Medium"
            },
            {
                title: "Explain the difference between HTTP and HTTPS to a non-tech person.",
                description: "Use an analogy (like a sealed envelope vs a postcard). Explain SSL/TLS certificates.",
                category: "TECH_ACUMEN",
                difficulty: "Easy"
            },
            {
                title: "How would you design the 'Trending Now' algorithm for Twitter?",
                description: "Discuss volume vs velocity of tweets, location filtering, and spam detection mechanisms.",
                category: "TECH_ACUMEN",
                difficulty: "Hard"
            },
            {
                title: "Explain machine learning bias to a client.",
                description: "How does training data affect output? Give examples like facial recognition or hiring algorithms.",
                category: "TECH_ACUMEN",
                difficulty: "Medium"
            },
            {
                title: "How does Google Search indexing work?",
                description: "Explain crawling (spiders), indexing, and ranking (PageRank signals) simply.",
                category: "TECH_ACUMEN",
                difficulty: "Medium"
            },
            {
                title: "Trade-offs between native apps vs. Progressive Web Apps (PWA).",
                description: "Compare performance, access to device features, development cost, and install friction.",
                category: "TECH_ACUMEN",
                difficulty: "Medium"
            },
            {
                title: "Explain the concept of availability vs consistency (CAP Theorem).",
                description: "In a distributed system, you can't have it all. When would you choose one over the other (e.g., Banking vs Social Feed)?",
                category: "TECH_ACUMEN",
                difficulty: "Hard"
            },
            {
                title: "How does a load balancer work?",
                description: "Analogy of a traffic cop distributing cars to different lanes. Why is it needed for scaling?",
                category: "TECH_ACUMEN",
                difficulty: "Easy"
            },
            {
                title: "Basics of Blockchain technology for a supply chain PM.",
                description: "Explain the decentralized ledger, immutability, and smart contracts for tracking goods.",
                category: "TECH_ACUMEN",
                difficulty: "Medium"
            },
            {
                title: "What is an API and how does it enable partnerships?",
                description: "Analogy of a waiter in a restaurant. How does it allow two different software systems to talk?",
                category: "TECH_ACUMEN",
                difficulty: "Easy"
            },

            // --- GLOBAL GUESTIMATES ---
            {
                title: "Estimate the number of commercial flights in the air right now globally.",
                description: "Consider time zones, major hubs, average flight duration, and peak travel times.",
                category: "GUESTIMATES",
                difficulty: "Hard"
            },
            {
                title: "How many tennis balls can fit in a Boeing 747?",
                description: "Volume estimation challenge. Estimate volume of plane fuselage vs volume of a ball (packing efficiency).",
                category: "GUESTIMATES",
                difficulty: "Hard"
            },
            {
                title: "Estimate the daily revenue of a Starbucks in New York City.",
                description: "Footfall, conversion rate, average order value, peak vs non-peak hours.",
                category: "GUESTIMATES",
                difficulty: "Medium"
            },
            {
                title: "How many smartphones are sold in the US annually?",
                description: "Population, replacement cycle (2-3 years), market penetration.",
                category: "GUESTIMATES",
                difficulty: "Medium"
            },
            {
                title: "Number of daily subway riders in Tokyo.",
                description: "Population, commuter percentage, public transport reliance vs cars.",
                category: "GUESTIMATES",
                difficulty: "Medium"
            },
            {
                title: "Estimate the market size of pet food in the UK.",
                description: "Household penetration of pets, average spend per pet per month.",
                category: "GUESTIMATES",
                difficulty: "Medium"
            },
            {
                title: "Amount of storage required to host all of Spotify's music.",
                description: "Number of songs, average size per song (bitrate), compression factors.",
                category: "GUESTIMATES",
                difficulty: "Hard"
            },

            // --- ETHICS & POLICY ---
            {
                title: "How should a social media platform handle political misinformation?",
                description: "Discuss freedom of speech vs safety, fact-checking labels, and algorithmic demotion.",
                category: "BEHAVIORAL",
                difficulty: "Hard"
            },
            {
                title: "Should AI art generators pay royalties to artists?",
                description: "Debate copyright, fair use, and the economics of generative AI.",
                category: "STRATEGY",
                difficulty: "Hard"
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
