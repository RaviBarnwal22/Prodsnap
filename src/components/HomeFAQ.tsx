import Link from "next/link"

/**
 * Homepage FAQ.
 *
 * The visible copy and the FAQPage structured data are generated from this one
 * array on purpose: marking up an answer a visitor cannot actually read is a
 * structured-data violation, and keeping two copies in sync by hand is how that
 * happens. Edit the copy here and both stay correct.
 *
 * Every claim below is checked against the code — pricing comes from
 * `@/lib/constants` (SUBSCRIPTION_PRICE = 199, packages from ₹499, each
 * carrying one bonus month of AI access). Don't add an answer that promises
 * something the product doesn't do.
 */
const FAQS: { q: string; a: string }[] = [
    {
        q: "How does Prodsnap's AI feedback work?",
        a: "You answer a real product management case in your own words, the same way you would in an interview. The AI then evaluates your structure, product sense, choice of metrics and the trade-offs you made, and returns written feedback within seconds. It shows you what a strong answer would have covered and where yours fell short.",
    },
    {
        q: "Is Prodsnap free to try?",
        a: "Yes. You get a set number of free case attempts before a subscription is needed, so you can judge the quality of the feedback before paying anything. Full access is ₹199 per month.",
    },
    {
        q: "What kinds of PM cases can I practise?",
        a: "Product sense and design, root cause analysis, metrics and analytics, product strategy and execution. Cases are drawn from real scenarios at Indian and global tech companies, so you practise on the kind of problem you will actually be asked about.",
    },
    {
        q: "How is this different from a mock interview with a person?",
        a: "It is instant and repeatable. There is nothing to schedule and no waiting, and you can attempt the same case again once you have seen where your reasoning broke down. Use it to build volume and fix patterns. A human mock is still better for reading your delivery and presence, which is what the 1:1 mentorship sessions are for.",
    },
    {
        q: "Do you offer 1:1 mentorship as well?",
        a: "Yes. Packages start at ₹499 and cover career strategy, a full mock PM interview with written feedback, and a line-by-line resume rewrite. Every package also includes a free month of AI case practice on Prodsnap.",
    },
    {
        q: "Who is behind Prodsnap?",
        a: "Prodsnap is built by Ravi Barnwal, a working product leader who has shipped and scaled products and mentors PMs through interviews, resumes and career decisions. The case content and evaluation rubrics come from that practice, not from a generic question bank.",
    },
]

const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map(({ q, a }) => ({
        "@type": "Question",
        name: q,
        acceptedAnswer: { "@type": "Answer", text: a },
    })),
}

export function HomeFAQ() {
    return (
        <section
            className="py-20 md:py-24 px-4 bg-gray-50/60 dark:bg-gray-900/40 border-b border-gray-100 dark:border-gray-800"
            aria-labelledby="faq-heading"
        >
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />
            <div className="container mx-auto max-w-3xl">
                <div className="text-center mb-12">
                    <span className="text-xs font-bold text-violet-600 dark:text-violet-400 uppercase tracking-widest bg-violet-100 dark:bg-violet-900/30 px-3 py-1 rounded-full inline-block mb-3">
                        Questions
                    </span>
                    <h2
                        id="faq-heading"
                        className="text-3xl md:text-4xl font-black tracking-tight text-gray-900 dark:text-white"
                    >
                        Frequently Asked Questions
                    </h2>
                </div>

                <div className="space-y-3">
                    {FAQS.map(({ q, a }) => (
                        <details
                            key={q}
                            className="group bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
                        >
                            <summary className="cursor-pointer list-none px-6 py-5 flex items-center justify-between gap-4 font-bold text-gray-900 dark:text-white hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
                                <span>{q}</span>
                                <span
                                    className="shrink-0 text-violet-600 text-xl leading-none transition-transform group-open:rotate-45"
                                    aria-hidden="true"
                                >
                                    +
                                </span>
                            </summary>
                            <p className="px-6 pb-5 -mt-1 text-gray-600 dark:text-gray-300 leading-relaxed">
                                {a}
                            </p>
                        </details>
                    ))}
                </div>

                <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-10">
                    Still deciding?{" "}
                    <Link href="/practice" className="text-violet-600 font-bold hover:underline">
                        Try a case
                    </Link>{" "}
                    or{" "}
                    <Link href="/mentorship" className="text-violet-600 font-bold hover:underline">
                        book a 1:1 session
                    </Link>
                    .
                </p>
            </div>
        </section>
    )
}
