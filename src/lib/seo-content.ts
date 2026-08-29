export interface SEOPillarCategory {
  id: string;
  title: string;
  description: string;
  iconName: string;
  colorClass: string;
}

export interface SEOContentPage {
  slug: string;
  title: string;
  metaDescription: string;
  h1: string;
  intro: string;
  sections: {
    heading: string;
    content: string; // Keep content extremely rich and detailed
  }[];
  faqs: {
    question: string;
    answer: string;
  }[];
  relatedSlugs: string[]; // for contextual internal linking
}

export const SEOPillars: Record<string, SEOPillarCategory> = {
  "product-management": {
    id: "product-management",
    title: "Product Management Essentials",
    description: "Master the foundational processes, roadmaps, discovery cycles, and strategic frameworks that define top-tier Product Management.",
    iconName: "Sparkles",
    colorClass: "from-violet-500 to-purple-600",
  },
  "frameworks": {
    id: "frameworks",
    title: "PM Frameworks Library",
    description: "Deep dives into RICE, ICE, MoSCoW, Kano, and other core prioritization and strategic models with practical templates.",
    iconName: "Target",
    colorClass: "from-blue-500 to-cyan-600",
  },
  "product-analytics": {
    id: "product-analytics",
    title: "Product Analytics & Metrics",
    description: "Learn how to define activation, measure retention, scale engagement, and align your team around a true North Star Metric.",
    iconName: "BarChart3",
    colorClass: "from-orange-500 to-pink-600",
  },
  "product-management-interview": {
    id: "product-management-interview",
    title: "PM Interview Prep Hub",
    description: "Frameworks, step-by-step case structures, and answers for Product Sense, Strategy, and Execution interview rounds.",
    iconName: "Users",
    colorClass: "from-emerald-500 to-green-600",
  },
  "templates": {
    id: "templates",
    title: "Product Document Templates",
    description: "Downloadable and referenceable PRDs, roadmaps, user stories, and product discovery guides built by expert PMs.",
    iconName: "BookOpen",
    colorClass: "from-cyan-500 to-blue-600",
  },
  "glossary": {
    id: "glossary",
    title: "Product Management Glossary",
    description: "Clear definitions and practical product management context for industry terms like MVP, PMF, Churn, and more.",
    iconName: "Activity",
    colorClass: "from-indigo-500 to-violet-600",
  }
};

export const SEOContentData: Record<string, Record<string, SEOContentPage>> = {
  "product-management": {
    "what-is-product-management": {
      slug: "what-is-product-management",
      title: "What is Product Management? Role, Skills & Lifecycle Guide | Prodsnap",
      metaDescription: "Understand the core role of a Product Manager, from defining strategy to execution. Learn the lifecycle stages and skills required for modern PMs.",
      h1: "What is Product Management? The Ultimate Beginner's Guide",
      intro: "Product Management is an organizational lifecycle function within a company dealing with the planning, forecasting, and production or marketing of a product at all stages of the product lifecycle. A Product Manager (PM) sits at the intersection of business, technology, and user experience (UX) to guide a product from concept to launch and beyond.",
      sections: [
        {
          heading: "The Core Role of a Product Manager",
          content: "A Product Manager's primary responsibility is to define the 'why', 'what', and 'when' of the product that the engineering team builds. Unlike project managers who focus on 'how' and 'when' a specific project gets delivered, product managers focus on maximizing the business value and solving actual customer pain points. They are advocates for the customer, translators for the engineers, and strategists for the business stakeholders."
        },
        {
          heading: "Essential Product Management Lifecycle Stages",
          content: "1. **Discovery & Ideation**: Uncovering customer problems, analyzing market trends, and defining goals.\n2. **Strategy & Definition**: Creating the product roadmap, defining requirements (PRDs), and setting success metrics.\n3. **Design & Planning**: Collaborating with UX/UI designers on mockups, and writing comprehensive user stories.\n4. **Development & Testing**: Partnering with engineering to build the product using Agile methodologies.\n5. **Launch & Go-to-Market (GTM)**: Working with product marketing to launch the product to customers.\n6. **Analysis & Iteration**: Monitoring usage data, gathering feedback, and planning updates."
        },
        {
          heading: "Key Skills Every Modern PM Needs",
          content: "To be successful, a Product Manager must possess a blend of hard and soft skills:\n- **Strategic Thinking**: Ability to define product strategy, roadmap, and align features to business objectives.\n- **Data Literacy**: Competency in analyzing product analytics, KPIs, and user metrics (like DAU, retention, and churn).\n- **User Empathy**: Ability to conduct user research, customer interviews, and synthesize feedback into design inputs.\n- **Technical Acumen**: Understanding system architecture, APIs, and technical constraints to communicate effectively with engineering teams."
        }
      ],
      faqs: [
        {
          question: "What is the difference between a Product Manager and a Project Manager?",
          answer: "A Product Manager is responsible for the overall success of the product, determining its strategy, features, and roadmaps ('why' and 'what'). A Project Manager focuses on execution, timelines, resource allocation, and project delivery ('how' and 'when')."
        },
        {
          question: "Do you need a computer science degree to become a PM?",
          answer: "No. While technical acumen is highly valuable for communicating with engineers, successful PMs come from diverse backgrounds including business, marketing, design, analytics, and humanities."
        }
      ],
      relatedSlugs: ["product-manager-roadmap", "product-strategy", "product-discovery"]
    },
    "product-manager-roadmap": {
      slug: "product-manager-roadmap",
      title: "Product Manager Roadmap: How to Become a PM | Prodsnap",
      metaDescription: "A step-by-step career roadmap to break into Product Management. Learn key skills, certifications, resume strategies, and interview prep guides.",
      h1: "Product Manager Career Roadmap: Aspiring to Leader",
      intro: "Breaking into Product Management or advancing to a leadership role requires a clear roadmap of skills, experiences, and strategic networking. This career roadmap guides you from an entry-level associate PM (APM) up to a Chief Product Officer (CPO).",
      sections: [
        {
          heading: "1. The Entry-Level: Associate Product Manager (APM)",
          content: "APM roles are designed for recent graduates or early career switchers. As an APM, you focus heavily on execution: writing clear user stories, managing the sprint backlog, running daily standups, and analyzing user feedback under the mentorship of a Senior PM."
        },
        {
          heading: "2. The Growth Stage: Product Manager (PM) & Senior PM",
          content: "As you progress to a full PM and then Senior PM, your scope expands. You are no longer just executing; you are defining the product strategy, building the 6-to-12 month roadmap, setting the North Star Metric, and negotiating priorities with executive leadership using quantitative prioritization models like RICE or Kano."
        },
        {
          heading: "3. Leadership: Group Product Manager (GPM), Director & VP of Product",
          content: "In leadership roles, your primary responsibility shifts from managing products to managing people and portfolios. Directors and VPs of Product focus on organizational design, scaling product operations, building high-performing PM teams, and translating high-level business goals into product portfolios."
        }
      ],
      faqs: [
        {
          question: "How long does it take to become a Senior Product Manager?",
          answer: "Typically, it takes 3 to 6 years of solid product experience to move into a Senior PM role, depending on the scale of the company and the complexity of products managed."
        },
        {
          question: "What are the best certifications for Product Managers?",
          answer: "Certifications like Pragmatic Institute, Product School, and Scrum Alliance (CSPO) are widely recognized. However, building real projects and showing outcomes is always valued higher by hiring teams."
        }
      ],
      relatedSlugs: ["what-is-product-management", "product-strategy"]
    },
    "product-strategy": {
      slug: "product-strategy",
      title: "Product Strategy: Definition, Frameworks & Examples | Prodsnap",
      metaDescription: "Learn how to build a winning product strategy. Explore strategic frameworks, vision alignment, roadmap creation, and industry-proven examples.",
      h1: "Building a Winning Product Strategy: A Practical Guide",
      intro: "Product strategy is the foundational blueprint that aligns a product's vision with the company's business goals. It defines who the product is for, what problem it solves, how it differentiates from competitors, and how it will succeed in the market.",
      sections: [
        {
          heading: "The Three Pillars of Product Strategy",
          content: "1. **Market Vision**: The aspirational state of your product in 3-5 years. What impact will it have on the world?\n2. **Target Audience & Value Proposition**: The specific customer segments you serve and the key value they receive.\n3. **Business Model & Success Metrics**: How the product generates value for the business (revenue, engagement) and the key metrics used to track performance."
        },
        {
          heading: "How to Build a Strategic Product Roadmap",
          content: "A strategic roadmap connects your high-level strategy to your day-to-day feature execution. Focus on outcomes rather than outputs. Instead of listing features with fixed release dates, list strategic themes (e.g., 'Reduce user onboarding friction') and tie them directly to target metrics (e.g., 'Increase Day-7 retention by 10%')."
        }
      ],
      faqs: [
        {
          question: "What is the difference between product strategy and a product roadmap?",
          answer: "Product strategy defines the direction, goals, and logic of the product (the 'why'). The product roadmap is a visual communication tool that maps out how that strategy will be realized over time (the 'what' and 'when')."
        }
      ],
      relatedSlugs: ["what-is-product-management", "product-discovery", "product-prioritization"]
    },
    "product-discovery": {
      slug: "product-discovery",
      title: "Product Discovery: Process, Frameworks & Best Practices | Prodsnap",
      metaDescription: "Master the product discovery phase. Learn how to conduct customer research, validate ideas, define problem statements, and run structured discovery.",
      h1: "Product Discovery: Solving the Right Problems for Your Users",
      intro: "Product discovery is the iterative process of defining what product features or solutions to build. The goal of discovery is to reduce risk—ensuring that you don't spend valuable engineering hours building something that users do not want, cannot use, or does not support your business goals.",
      sections: [
        {
          heading: "The Dual-Track Agile Framework",
          content: "Modern product teams utilize **Dual-Track Agile** to run Discovery and Delivery concurrently:\n- **Discovery Track**: Focuses on validating user needs, testing prototypes, and drafting specifications. The output is a backlog of validated, build-ready features.\n- **Delivery Track**: Focuses on coding, testing, and shipping the validated features. The output is functional software in production."
        },
        {
          heading: "Key Discovery Activities & Deliverables",
          content: "- **Customer Interviews**: Talking directly to users to understand pain points, daily workflows, and frustrations.\n- **Prototype Testing**: Creating low-fidelity wireframes or interactive mockups to test usability and interest before coding.\n- **Opportunity Solution Trees**: A framework for mapping high-level metrics to customer problems and validating potential solutions."
        }
      ],
      faqs: [
        {
          question: "How long should a product discovery cycle take?",
          answer: "Discovery is continuous, but specific discovery cycles for new complex features typically range from 2 to 4 weeks depending on risk and ambiguity."
        }
      ],
      relatedSlugs: ["what-is-product-management", "product-strategy", "product-prioritization"]
    },
    "product-prioritization": {
      slug: "product-prioritization",
      title: "Product Prioritization Guide: Frameworks & Best Practices | Prodsnap",
      metaDescription: "Learn how to prioritize your product backlog effectively. Compare prioritization frameworks like RICE, Kano, and MoSCoW for data-driven decisions.",
      h1: "Product Prioritization: Navigating Backlog Demands",
      intro: "Product prioritization is the process of deciding which features, bugs, or initiatives to build first. In a world of limited engineering resources and infinite ideas, a PM's ability to prioritize objectively is critical to driving business outcomes and customer value.",
      sections: [
        {
          heading: "Why Intuitive Prioritization Fails",
          content: "Many PM teams prioritize based on the 'HiPPO' (Highest Paid Person's Opinion) or 'whoever yells loudest'. This leads to feature bloat, delayed launches, and wasted developer hours. Successful product teams rely on quantitative models that measure impact against engineering effort."
        },
        {
          heading: "Top Prioritization Frameworks Compared",
          content: "- **RICE (Reach, Impact, Confidence, Effort)**: Best for data-driven teams prioritizing roadmap features.\n- **MoSCoW (Must, Should, Could, Won't)**: Excellent for defining scope for MVP launches and fixed-deadline releases.\n- **Kano Model**: Great for classifying features based on how much they delight customers vs. fulfill basic expectations."
        }
      ],
      faqs: [
        {
          question: "How often should you reprioritize the product backlog?",
          answer: "While minor backlog grooming happens weekly during sprints, major roadmap prioritization reviews should occur quarterly to align with business planning."
        }
      ],
      relatedSlugs: ["what-is-product-management", "product-strategy", "product-discovery"]
    }
  },
  "frameworks": {
    "rice": {
      slug: "rice",
      title: "RICE Prioritization Framework: Formula, Example & Template | Prodsnap",
      metaDescription: "Learn the RICE prioritization framework. Calculate Reach, Impact, Confidence, and Effort with formulas, examples, and practical guidance.",
      h1: "The RICE Prioritization Framework: A Complete PM Guide",
      intro: "The RICE prioritization framework is a quantitative scoring system developed by Intercom to help product managers evaluate and prioritize features, projects, or ideas based on four factors: Reach, Impact, Confidence, and Effort.",
      sections: [
        {
          heading: "The RICE Formula",
          content: "The RICE score is calculated using the following formula:\n\nReach x Impact x Confidence / Effort = RICE Score\n\nWhere:\n- Reach: Number of users affected in a given timeframe (e.g., users per quarter).\n- Impact: The qualitative value a feature adds (Scored from 0.25 to 3).\n- Confidence: How sure you are about your Reach and Impact estimates (Percentage: 50%, 80%, or 100%).\n- Effort: The total person-months required to complete the project."
        },
        {
          heading: "RICE Scoring Guide & Weights",
          content: "Impact Scale (Intercom Standard):\n- 3: Massive Impact\n- 2: High Impact\n- 1: Medium Impact\n- 0.5: Low Impact\n- 0.25: Minimal Impact\n\nConfidence Scale:\n- 100%: High Confidence (backed by user interviews and analytics).\n- 80%: Medium Confidence (backed by some data and heuristics).\n- 50%: Low Confidence (speculative, based on hunch)."
        },
        {
          heading: "RICE Priority Example Scenario",
          content: "Imagine prioritizing two features:\n1. Feature A (New User Dashboard):\n   - Reach: 10,000 users/month\n   - Impact: 2 (High)\n   - Confidence: 80% (0.8)\n   - Effort: 4 person-months\n   - RICE Score = (10,000 * 2 * 0.8) / 4 = 4,000\n\n2. Feature B (Integration with Slack):\n   - Reach: 2,000 users/month\n   - Impact: 3 (Massive)\n   - Confidence: 100% (1.0)\n   - Effort: 1 person-month\n   - RICE Score = (2,000 * 3 * 1.0) / 1 = 6,000\n\nOutcome: Despite having lower Reach, Feature B has a higher RICE score because it requires much less Effort and has high Confidence."
        }
      ],
      faqs: [
        {
          question: "Can Effort be measured in days instead of person-months?",
          answer: "Yes, you can use person-days or story points, provided you use the exact same unit across all compared initiatives."
        }
      ],
      relatedSlugs: ["ice", "moscow", "kano-model"]
    },
    "ice": {
      slug: "ice",
      title: "ICE Prioritization Framework: Formula & Growth Examples | Prodsnap",
      metaDescription: "Master the ICE prioritization framework. Learn how Impact, Confidence, and Ease can help growth teams run fast experiments and prioritize sprints.",
      h1: "The ICE Prioritization Framework: Optimized for Growth Teams",
      intro: "The ICE prioritization framework is a streamlined prioritization model popularized by Sean Ellis for growth hacking and rapid experimentation. It evaluates ideas based on three criteria: Impact, Confidence, and Ease.",
      sections: [
        {
          heading: "The ICE Scoring Formula",
          content: "The ICE score is calculated as follows:\n\nImpact x Confidence x Ease = ICE Score\n\nAlternatively, using the average model:\n\nImpact + Confidence + Ease = ICE Score\n\nNote: Every factor is scored on a scale from 1 to 10. Higher numbers mean higher priority."
        },
        {
          heading: "ICE Scoring Factors",
          content: "- Impact: How much does this project impact our target metric if successful? (1 = no impact, 10 = massive change).\n- Confidence: How sure are we that the experiment will succeed? (1 = complete guess, 10 = proven by pilot data).\n- Ease: How simple is this to build and launch? (1 = massive architectural rework, 10 = simple copy change)."
        }
      ],
      faqs: [
        {
          question: "What is the difference between RICE and ICE?",
          answer: "RICE is a more objective, quantitative model used for core product roadmaps, measuring Reach explicitly. ICE is a simpler, subjective model used by growth and marketing teams for fast-paced experiment planning."
        }
      ],
      relatedSlugs: ["rice", "moscow", "kano-model"]
    },
    "moscow": {
      slug: "moscow",
      title: "MoSCoW Prioritization Framework: Guide & Examples | Prodsnap",
      metaDescription: "Learn how to use the MoSCoW prioritization model. Define Must-Have, Should-Have, Could-Have, and Won't-Have requirements for MVPs.",
      h1: "The MoSCoW Prioritization Framework: Essential Guide",
      intro: "The MoSCoW method is a prioritization technique used in product management, business analysis, and software development to reach a common understanding with stakeholders on the importance of delivery requirements.",
      sections: [
        {
          heading: "Understanding the MoSCoW Categories",
          content: "- Must-Have (M): Non-negotiable requirements. If left out, the product cannot function or cannot legally launch.\n- Should-Have (S): Important but not vital requirements. The product is usable without them, but they add high value.\n- Could-Have (C): Nice-to-have features that can be added if time permits. Often referred to as 'delighters'.\n- Won't-Have (W): Features agreed upon not to be included in this specific release window or sprint."
        },
        {
          heading: "How to Apply MoSCoW to an MVP Launch",
          content: "When launching an MVP (Minimum Viable Product), focus strictly on the Must-Haves. Ensure that 'Must-Haves' do not exceed 60% of your total development capacity, leaving 40% contingency budget for 'Should-Haves' and 'Could-Haves' in case of project delays."
        }
      ],
      faqs: [
        {
          question: "How do you handle disagreement over a 'Must-Have'?",
          answer: "Ask stakeholders: 'If we launch without this feature, will the product fail entirely?' If the answer is no, it is a Should-Have, not a Must-Have."
        }
      ],
      relatedSlugs: ["rice", "ice", "kano-model"]
    },
    "kano-model": {
      slug: "kano-model",
      title: "Kano Model Prioritization: Delighters & Basic Needs | Prodsnap",
      metaDescription: "Understand the Kano Model for feature prioritization. Learn how to categorize features into Must-Be, Performance, and Delighters.",
      h1: "The Kano Model: Prioritizing for Customer Delight",
      intro: "The Kano Model is a product development and customer satisfaction theory developed in the 1980s by Professor Noriaki Kano, which classifies customer preferences into five categories of features.",
      sections: [
        {
          heading: "The Five Kano Feature Categories",
          content: "1. Must-Be / Basic Needs: Features that customers expect as standard. If missing, they cause massive dissatisfaction, but their presence doesn't increase satisfaction.\n2. One-Dimensional / Performance: Features that directly increase satisfaction the more you add (e.g., battery life, page speed).\n3. Attractive / Delighters: Unexpected features that delight users. If absent, users do not mind, but if present, they drive high satisfaction.\n4. Indifferent: Features that users do not care about either way.\n5. Reverse: Features that actually cause dissatisfaction if present."
        }
      ],
      faqs: [
        {
          question: "How do you classify a feature under the Kano Model?",
          answer: "You run a survey asking users two questions: 1. 'How do you feel if this feature is present?' and 2. 'How do you feel if this feature is absent?' Based on the combination of answers, you categorize the feature."
        }
      ],
      relatedSlugs: ["rice", "ice", "moscow"]
    },
    "jtbd": {
      slug: "jtbd",
      title: "Jobs-to-be-Done (JTBD) Framework: Guide & Examples | Prodsnap",
      metaDescription: "Learn the Jobs-to-be-Done framework. Discover customer problems, write job stories, and design customer-centric products.",
      h1: "The Jobs-to-be-Done (JTBD) Framework: Mapping User Intent",
      intro: "Jobs-to-be-Done (JTBD) is a framework for understanding customer behavior. It suggests that customers do not buy products; they 'hire' them to get a specific job done in their lives.",
      sections: [
        {
          heading: "The Job Story Formula",
          content: "In JTBD, user needs are expressed as Job Stories instead of traditional User Stories:\n\nWhen [Situation], I want to [Motivation], So I can [Expected Outcome]\n\nExample: 'When I am commuting to work, I want to grab a quick, non-messy breakfast, so I can stay full until my mid-day meeting.'"
        }
      ],
      faqs: [
        {
          question: "How does JTBD differ from User Personas?",
          answer: "User personas focus on demographic attributes (e.g., '30-year-old manager'). JTBD focuses on context and motivation (e.g., 'When I need to share files securely with clients')."
        }
      ],
      relatedSlugs: ["rice", "kano-model"]
    }
  },
  "product-analytics": {
    "product-metrics": {
      slug: "product-metrics",
      title: "Product Metrics Guide: KPIs & Frameworks for PMs | Prodsnap",
      metaDescription: "Learn the essential product metrics every PM should track. Explore engagement, retention, churn, conversion rates, and acquisition metrics.",
      h1: "Product Metrics: The Pulse of Product Health",
      intro: "Product metrics are quantitative measurements that allow product managers to evaluate how users interact with a product, and whether those interactions translate to business value and growth.",
      sections: [
        {
          heading: "The AARRR Pirate Metrics Framework",
          content: "A widely-used framework for tracking the customer lifecycle is the AARRR framework:\n- Acquisition: Where are our users coming from? (Sign-ups, traffic).\n- Activation: Do users have a good first experience? (Aha! moment execution).\n- Retention: Do users return to the product over time? (Cohort analysis, repeat logins).\n- Referral: Do users invite others? (Viral coefficients).\n- Revenue: How do we monetize user engagement? (MRR, LTV, conversion rate)."
        },
        {
          heading: "Essential Engagement Metrics",
          content: "- DAU/MAU Ratio: The stickiness metric. Daily Active Users divided by Monthly Active Users. A ratio of 20% means users log in 6 days a month.\n- LTV (Customer Lifetime Value): Total revenue a customer generates before churning."
        }
      ],
      faqs: [
        {
          question: "What is a good retention rate for mobile SaaS?",
          answer: "For consumer apps, a Day-30 retention of 20%+ is considered good. For B2B SaaS, Day-30 retention should typically be 40%+."
        }
      ],
      relatedSlugs: ["north-star-metric"]
    },
    "north-star-metric": {
      slug: "north-star-metric",
      title: "North Star Metric: Definition, Framework & Examples | Prodsnap",
      metaDescription: "Learn how to define a North Star Metric for your product. Explore real-world examples from Spotify, Airbnb, Zoom, and WhatsApp.",
      h1: "The North Star Metric: Driving Alignment and Growth",
      intro: "The North Star Metric (NSM) is the single key metric that best captures the core value your product delivers to its customers. It serves as the primary compass aligning all product development teams toward long-term business success.",
      sections: [
        {
          heading: "Real-world North Star Metric Examples",
          content: "- Spotify: Time spent listening to music (captures user satisfaction and ad/subscription value).\n- Airbnb: Nights booked (captures supply and demand match value).\n- WhatsApp: Number of messages sent (captures daily communication frequency)."
        },
        {
          heading: "Three Requirements for a Valid North Star Metric",
          content: "1. Measures Value Delivery: It should grow when users get real value, not just when you capture revenue.\n2. Predicts Retention: Growth in this metric must statistically correlate with long-term retention.\n3. Actionable: Product development teams must be able to directly influence this metric through their initiatives."
        }
      ],
      faqs: [
        {
          question: "Should our North Star Metric be Revenue?",
          answer: "No. Revenue is a lagging indicator. The NSM should focus on value delivery (a leading indicator), which subsequently drives revenue growth naturally."
        }
      ],
      relatedSlugs: ["product-metrics"]
    }
  },
  "product-management-interview": {
    "product-sense": {
      slug: "product-sense",
      title: "Product Sense Interview: Frameworks & Case Strategy | Prodsnap",
      metaDescription: "Master the Product Sense PM interview round. Learn step-by-step frameworks like CIRCLES to design products and identify target users.",
      h1: "Product Sense: Designing Products and Solving Ambiguity",
      intro: "The Product Sense interview round (often called Product Design) evaluates your ability to conceptualize new products, design features, navigate deep ambiguity, and put user needs at the center of technical decisions.",
      sections: [
        {
          heading: "The CIRCLES Framework for Product Design",
          content: "Use the CIRCLES framework to structure your product sense answers:\n- Comprehend Situation: Ask clarifying questions, state the constraints, and define the primary goal.\n- Identify Customer: Segment target user groups and choose a single persona to focus on.\n- Report Needs: List the selected persona's pain points and requirements.\n- Cut Prioritization: Choose the highest-value user need based on impact vs. frequency.\n- List Solutions: Brainstorm 3 distinct, creative solutions to solve that pain point.\n- Evaluate Trade-offs: Analyze pros, cons, technical feasibility, and risks for your solutions.\n- Summarize: Recommend one solution, explain why, and define success metrics."
        }
      ],
      faqs: [
        {
          question: "How long should a product sense case response take?",
          answer: "In a real interview, you should aim to run through a complete product design case in 30 to 45 minutes, spending about 10-15 minutes on user identification and brainstorming."
        }
      ],
      relatedSlugs: ["product-strategy", "product-execution"]
    },
    "product-strategy": {
      slug: "product-strategy",
      title: "Product Strategy PM Interview: Frameworks & Cases | Prodsnap",
      metaDescription: "Prepare for the Product Strategy interview round. Learn how to answer questions on market entry, acquisitions, monetization, and growth.",
      h1: "Product Strategy: Answering Big-Picture PM Questions",
      intro: "The Product Strategy interview round assesses your business acumen, long-term foresight, market awareness, and ability to make high-stakes product decisions for tech giants.",
      sections: [
        {
          heading: "Common Strategy Case Patterns",
          content: "- Market Entry: 'Should company X launch product Y?' (Analyze market size, competitors, customer acquisition costs, and strategic fit).\n- Acquisitions & Partnerships: 'Why did company A buy company B?' (Analyze horizontal vs. vertical integration, technology leverage, and market expansion).\n- Monetization Shifts: 'How should we monetize tool Z?' (Compare subscription, ad-supported, premium, and freemium models)."
        }
      ],
      faqs: [
        {
          question: "What framework is best for product strategy cases?",
          answer: "You should combine SWOT analysis, Porter's Five Forces, and market-sizing calculations to back your recommendations with quantitative logic."
        }
      ],
      relatedSlugs: ["product-sense", "product-execution"]
    },
    "product-execution": {
      slug: "product-execution",
      title: "Product Execution PM Interview: Metrics & Diagnoses | Prodsnap",
      metaDescription: "Master the Product Execution PM interview round. Learn how to define metrics, prioritize backlogs, and debug metric drops.",
      h1: "Product Execution: Metrics, Trade-offs, and Diagnoses",
      intro: "The Product Execution round tests your analytical rigor, execution priorities, metric definitions, and ability to handle technical trade-offs on a day-to-day basis.",
      sections: [
        {
          heading: "Solving the Metric Drop Case",
          content: "A common question type is: 'Our metric X dropped by 10% last week. How do you find out why?'\n- 1. Validate the Data: Is it a bug in tracking, or is the drop real?\n- 2. Segment the Drop: Is it on specific OS, region, user cohort, or acquisition source?\n- 3. Internal Factors: Did we release a new version? Did servers experience downtime?\n- 4. External Factors: Is there a competitor promotion? Are there seasonal patterns (e.g., holidays)?"
        }
      ],
      faqs: [
        {
          question: "How do you define success metrics for a new feature?",
          answer: "Define metrics using a funnel approach: 1. Awareness, 2. Adoption (rate), 3. Frequency/Engagement, and 4. Retention impact."
        }
      ],
      relatedSlugs: ["product-sense", "product-strategy"]
    }
  },
  "templates": {
    "product-requirements-document": {
      slug: "product-requirements-document",
      title: "PRD Template: Free Google Doc & Markdown Guide | Prodsnap",
      metaDescription: "Download a free, comprehensive Product Requirements Document (PRD) template. Learn how to write clear requirements, user stories, and specs.",
      h1: "The Perfect Product Requirements Document (PRD) Template",
      intro: "A Product Requirements Document (PRD) is a foundational specification written by product managers to describe the features, requirements, goals, and success metrics of a product feature before coding starts.",
      sections: [
        {
          heading: "The Core Structure of a PRD",
          content: "1. Header Info: Owner, Target Release Date, Status (Draft, Approved, In Dev), Epic Link.\n2. Background & Objectives: Why are we building this? What user pain points are we solving?\n3. User Personas: Which target segments will use this feature?\n4. Functional Requirements: A detailed list of requirements mapped to user stories.\n5. Out of Scope: What are we explicitly NOT building in this release phase?\n6. Key Metrics: How will we measure success? (e.g. Click-through rate, retention)."
        }
      ],
      faqs: [
        {
          question: "Who writes and reviews the PRD?",
          answer: "The Product Manager writes the PRD. It is reviewed and revised in collaboration with UX designers, QA testers, and Engineering leads before implementation."
        }
      ],
      relatedSlugs: ["product-roadmap", "user-stories", "product-discovery"]
    },
    "product-roadmap": {
      slug: "product-roadmap",
      title: "Product Roadmap Template: Agile Roadmap Guide | Prodsnap",
      metaDescription: "Download a free agile product roadmap template. Learn how to map strategy to themes, prioritize releases, and communicate with stakeholders.",
      h1: "Product Roadmap Template: Agile and Outcome-Based",
      intro: "An outcome-based product roadmap focuses on strategic problems to solve rather than static lists of features. It aligns stakeholders around business goals.",
      sections: [
        {
          heading: "Designing a Theme-based Roadmap",
          content: "Avoid specific timelines on long-term initiatives. Instead, organize your roadmap into three buckets:\n- Now: Currently in development or active testing.\n- Next: Validated in discovery and scheduled for design/sprint planning next.\n- Later: High-level opportunities we plan to explore in the future."
        }
      ],
      faqs: [
        {
          question: "What tools are best for product roadmapping?",
          answer: "Tools like Jira Product Discovery, Productboard, and ProductPlan are industry standards. For early-stage startups, a clean Notion page or Google Sheet is sufficient."
        }
      ],
      relatedSlugs: ["product-requirements-document", "user-stories", "product-discovery"]
    },
    "user-stories": {
      slug: "user-stories",
      title: "User Story Template: Format, Acceptance Criteria & Guide | Prodsnap",
      metaDescription: "Learn how to write user stories. Download a free user story template with acceptance criteria examples using the Given-When-Then format.",
      h1: "Writing High-Quality User Stories: A Practical Guide",
      intro: "A User Story is an informal, general explanation of a software feature written from the perspective of the end-user. It helps bridge the gap between business objectives and technical tasks.",
      sections: [
        {
          heading: "The Standard User Story Format",
          content: "As a [Type of User], I want [Goal], So that [Benefit/Reason]\n\nExample: 'As a returning subscriber, I want to view my saved articles on the homepage, so I can resume reading quickly without searching.'"
        },
        {
          heading: "Writing Clear Acceptance Criteria",
          content: "Acceptance criteria define the exact boundaries of a user story and determine when it is 'done'. Use the Given-When-Then format:\n- Given: A specific pre-condition.\n- When: The user performs an action.\n- Then: The expected system outcome.\n\nExample: 'Given a subscriber is logged in, When they open the homepage, Then they should see a list of their 3 most recently opened articles with progress bars.'"
        }
      ],
      faqs: [
        {
          question: "What is the INVEST criteria for user stories?",
          answer: "INVEST stands for: Independent, Negotiable, Valuable, Estimable, Small, and Testable. It represents the quality standards for a well-written user story."
        }
      ],
      relatedSlugs: ["product-requirements-document", "product-roadmap", "product-discovery"]
    },
    "product-discovery": {
      slug: "product-discovery",
      title: "Product Discovery Template: Validation & Interview Guide | Prodsnap",
      metaDescription: "Download a free product discovery template. Plan user interviews, design research studies, and validate user needs before coding.",
      h1: "Product Discovery Template: Risk and Validation",
      intro: "This template guides your product discovery phases, helping you validate customer needs, test design prototypes, and reduce technical/delivery risk.",
      sections: [
        {
          heading: "Mapping Discovery Risks",
          content: "Evaluate discovery ideas across four risks (Marty Cagan's framework):\n1. Value Risk: Will users buy or choose to use this?\n2. Usability Risk: Can users figure out how to use this?\n3. Feasibility Risk: Can our engineers build this with our current tech stack?\n4. Business Viability Risk: Does this solution work for our sales, marketing, and legal constraints?"
        }
      ],
      faqs: [
        {
          question: "How do you measure a successful discovery phase?",
          answer: "Success is measured by the number of invalidated ideas weeded out early (saving time) and the confidence score of the features passed to delivery."
        }
      ],
      relatedSlugs: ["product-requirements-document", "product-roadmap", "user-stories"]
    }
  },
  "glossary": {
    "mvp": {
      slug: "mvp",
      title: "What is a Minimum Viable Product (MVP)? PM Definition | Prodsnap",
      metaDescription: "Learn the definition of a Minimum Viable Product (MVP). Discover strategies, types of MVPs, and real-world startup examples.",
      h1: "What is a Minimum Viable Product (MVP)?",
      intro: "A Minimum Viable Product (MVP) is a version of a new product which allows a development team to collect the maximum amount of validated learning about customers with the least effort.",
      sections: [
        {
          heading: "Why Build an MVP?",
          content: "The goal of an MVP is to avoid wasting engineering resources building products that users don't want. By releasing a bare-bones version to early adopters, you can quickly prove or disprove your core business hypotheses before scaling."
        }
      ],
      faqs: [
        {
          question: "Is an MVP the same as a prototype?",
          answer: "No. A prototype is a design mockup used to test usability internally or in focus groups. An MVP is a functional product released to the public market to capture real transactions or usage data."
        }
      ],
      relatedSlugs: ["product-market-fit", "north-star-metric"]
    },
    "product-market-fit": {
      slug: "product-market-fit",
      title: "What is Product-Market Fit (PMF)? Definition & Signs | Prodsnap",
      metaDescription: "Understand Product-Market Fit (PMF). Learn how to measure PMF using the Sean Ellis survey method, retention cohorts, and market signals.",
      h1: "Product-Market Fit (PMF): The Ultimate Goal",
      intro: "Product-Market Fit (PMF) describes a scenario in which a company's target customers are buying, using, and recommending the product in numbers large enough to sustain that product's growth and profitability.",
      sections: [
        {
          heading: "How to Measure Product-Market Fit",
          content: "- The Sean Ellis Survey: Ask users: 'How would you feel if you could no longer use the product?' If 40% or more answer 'Very disappointed', you have achieved product-market fit.\n- Retention Cohort Flatline: A stable, horizontal flatline in cohort retention charts after a certain period of time (e.g. at 20-30% retention on Day 30)."
        }
      ],
      faqs: [
        {
          question: "Can Product-Market Fit be lost?",
          answer: "Yes. Due to market shifts, technological advancements, or competitors introducing better solutions, companies can lose PMF if they stop iterating."
        }
      ],
      relatedSlugs: ["mvp", "north-star-metric"]
    },
    "north-star-metric": {
      slug: "north-star-metric",
      title: "What is a North Star Metric? Glossary Definition | Prodsnap",
      metaDescription: "Clear PM definition of the North Star Metric (NSM). Learn why it is critical for team alignment and long-term customer value.",
      h1: "North Star Metric: Core Glossary Definition",
      intro: "A North Star Metric is the key measure of customer value delivery. It is the single metric that best predicts long-term retention and sustainable product growth.",
      sections: [
        {
          heading: "Why It Matters for Product Teams",
          content: "In large companies, product development teams can easily pull in opposite directions. The North Star Metric acts as a unifying metric that connects different team efforts (acquisition, activation, feature engagement) to overall customer value."
        }
      ],
      faqs: [
        {
          question: "How is the North Star Metric different from a KPI?",
          answer: "A KPI (Key Performance Indicator) can track any business outcome (like bounce rate or support tickets). The North Star Metric is the single, overarching metric that guides product strategy and value definition."
        }
      ],
      relatedSlugs: ["mvp", "product-market-fit"]
    }
  }
};
