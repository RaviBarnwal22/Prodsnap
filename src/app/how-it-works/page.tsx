import type { Metadata } from "next"
import Link from "next/link"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { ArrowRight, Target, Users, Heart, Scissors, Lightbulb, Scale } from "lucide-react"

export const dynamic = "force-static"

export const metadata: Metadata = {
    title: "How the AI Scores Your PM Case Answer | Prodsnap",
    description:
        "The exact rubric behind every Prodsnap evaluation: six scored dimensions, a 0 to 5 scale, and the rules that stop a vague answer from being praised. No black box.",
    alternates: { canonical: "/how-it-works" },
    openGraph: {
        type: "article",
        url: "https://prodsnap.in/how-it-works",
        title: "How the AI Scores Your PM Case Answer | Prodsnap",
        description:
            "Six dimensions, a 0 to 5 scale, and the triage rules that decide when an answer earns no praise at all. The full Prodsnap rubric, in the open.",
        images: ["/og-image.png"],
    },
}

const DIMENSIONS = [
    {
        key: "comprehend_goal",
        name: "Comprehend the Goal",
        icon: <Target size={24} />,
        color: "text-violet-600 dark:text-violet-400",
        bg: "bg-violet-50 dark:bg-violet-900/10",
        what: "Whether you pinned down what problem is actually being solved before you started solving it.",
        strong:
            "You restate the business objective in your own words, name the constraint you are optimising under, and ask the interviewer what success looks like before proposing anything.",
    },
    {
        key: "identify_users",
        name: "Identify the Users",
        icon: <Users size={24} />,
        color: "text-blue-600 dark:text-blue-400",
        bg: "bg-blue-50 dark:bg-blue-900/10",
        what: "How deeply you segment the audience, and whether you pick one segment and justify the choice.",
        strong:
            "You name three or four distinct segments, describe what separates them, then commit to one and explain why that segment carries the most upside for this goal.",
    },
    {
        key: "report_needs",
        name: "Report the Needs",
        icon: <Heart size={24} />,
        color: "text-pink-600 dark:text-pink-400",
        bg: "bg-pink-50 dark:bg-pink-900/10",
        what: "Whether the pain points you describe are real, specific and framed from the user's side rather than the company's.",
        strong:
            "You describe a moment in the user's day where the product fails them, not a generic need like convenience or trust.",
    },
    {
        key: "cut_prioritization",
        name: "Cut and Prioritise",
        icon: <Scissors size={24} />,
        color: "text-orange-600 dark:text-orange-400",
        bg: "bg-orange-50 dark:bg-orange-900/10",
        what: "The rigour of your decision logic. Naming a framework is not the same as applying one.",
        strong:
            "You score your own ideas against explicit criteria, then say out loud what you are dropping and what it costs you to drop it.",
    },
    {
        key: "list_solutions",
        name: "List Solutions",
        icon: <Lightbulb size={24} />,
        color: "text-amber-600 dark:text-amber-400",
        bg: "bg-amber-50 dark:bg-amber-900/10",
        what: "Creativity, feasibility and range. One obvious idea scores low even if it is a good idea.",
        strong:
            "You offer a safe bet, a high-ceiling bet and something structurally different, and you can say roughly what each would take to build.",
    },
    {
        key: "evaluate_tradeoffs",
        name: "Evaluate Trade-offs",
        icon: <Scale size={24} />,
        color: "text-emerald-600 dark:text-emerald-400",
        bg: "bg-emerald-50 dark:bg-emerald-900/10",
        what: "Second-order effects, risks, and the counter-metric you would watch to know your fix caused harm somewhere else.",
        strong:
            "You name the metric that would go up if your change worked, and the metric that would quietly go down, and you say which one you would ship against.",
    },
]

const SCALE = [
    { score: 0, label: "Absent", meaning: "The dimension is not addressed at all." },
    { score: 1, label: "Non-answer", meaning: "Mentioned in passing with no reasoning behind it." },
    { score: 2, label: "Named, not developed", meaning: "You said the right word but did not do the work." },
    { score: 3, label: "Partially developed", meaning: "Real thinking, applied only to part of the problem." },
    { score: 4, label: "Solid and specific", meaning: "Clear reasoning tied to this case, with concrete detail." },
    { score: 5, label: "World class", meaning: "The answer a strong hire gives on their best day." },
]

const FAQS = [
    {
        question: "What score is a good score?",
        answer:
            "An overall of 4 is the bar most strong candidates clear in a real loop. A 3 means the thinking is there but it is generic, which is the single most common reason capable people get rejected. Below 3 means the answer did not engage with the case. Very few first attempts land above 4, and that is the point: the gap is the feedback.",
    },
    {
        question: "Why did my answer get no strengths listed?",
        answer:
            "Because it did not earn any. If your overall score is 2 or below, the strengths list is emptied before you ever see it. A tool that praises everything is a tool you stop trusting, so an empty strengths list is a deliberate and correct output for a weak submission, not a bug.",
    },
    {
        question: "Can I get a high score by pasting the question back as my answer?",
        answer:
            "No. Before anything is scored, the submission is triaged. If it is under 25 words, or if more than 60 percent of its words overlap with the question itself, it is treated as a non-answer and every dimension is capped at 1. This rule runs in code, not in the model, so it cannot be talked around.",
    },
    {
        question: "Does the AI just make up a number?",
        answer:
            "The overall score is never an independent impression. It is recomputed in code as the rounded average of the six dimension scores, so the headline number always matches the detail underneath it. Any score the model returns outside the 0 to 5 range is clamped back into it.",
    },
    {
        question: "What happens if the evaluation fails?",
        answer:
            "You are told plainly that it failed. Prodsnap never substitutes a canned result for a real one. If no model responds, every score reads 0 and the feedback says the answer could not be evaluated, so a failure can never be mistaken for a verdict on your thinking.",
    },
    {
        question: "Do I get a model answer as well?",
        answer:
            "Yes, on full practice cases. Alongside the scorecard you get a gold standard solution of roughly 400 to 500 words that walks through the path a strong hire would take, so you can see exactly where your structure diverged. The homepage demo skips this to stay fast.",
    },
]

const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
        "@type": "Question",
        name: f.question,
        acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
}

export default function HowItWorksPage() {
    return (
        <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
            />
            <Header />

            <main className="flex-grow">
                <section className="bg-gradient-to-b from-violet-50 via-blue-50 to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-950 py-20 px-4">
                    <div className="container mx-auto max-w-4xl text-center">
                        <p className="text-xs uppercase tracking-[0.3em] font-black text-violet-600 mb-4">
                            The Rubric, In The Open
                        </p>
                        <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-8 leading-[1.1]">
                            How the AI scores your PM case answer
                        </h1>
                        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl mx-auto">
                            Most interview tools hand you a number and leave you guessing. This page is the
                            whole rubric: the six things every answer is judged on, what each score means,
                            and the rules that stop a vague answer from being flattered.
                        </p>
                    </div>
                </section>

                <section className="py-20 px-4 container mx-auto max-w-6xl">
                    <div className="mb-14 max-w-3xl">
                        <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4">
                            The six dimensions
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                            Every submission is scored on all six, independently. They map to the stages a
                            strong candidate moves through out loud in a real interview loop, which is why a
                            missing stage costs you even when the final recommendation is sensible.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {DIMENSIONS.map((d) => (
                            <div
                                key={d.key}
                                className={`${d.bg} p-8 rounded-3xl border border-gray-100 dark:border-gray-800`}
                            >
                                <div className={`${d.color} mb-4`}>{d.icon}</div>
                                <h3 className="text-xl font-black mb-3">{d.name}</h3>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-5">{d.what}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-500 leading-relaxed border-t border-gray-200 dark:border-gray-800 pt-4">
                                    <span className="font-black uppercase tracking-widest text-[10px] block mb-2">
                                        What a 5 looks like
                                    </span>
                                    {d.strong}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900/40 border-y border-gray-100 dark:border-gray-800">
                    <div className="container mx-auto max-w-4xl">
                        <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4">
                            What each score means
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-10">
                            Each dimension is scored 0 to 5. Your overall score is the rounded average of the
                            six, computed in code rather than judged separately, so the headline number can
                            never disagree with the detail below it.
                        </p>

                        <div className="space-y-3">
                            {SCALE.map((s) => (
                                <div
                                    key={s.score}
                                    className="flex items-start gap-5 bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800"
                                >
                                    <div className="shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 text-white flex items-center justify-center font-black text-lg">
                                        {s.score}
                                    </div>
                                    <div>
                                        <p className="font-black mb-1">{s.label}</p>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                                            {s.meaning}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="py-20 px-4 container mx-auto max-w-4xl">
                    <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4">
                        The rules that stop false praise
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-10">
                        A language model left to its own devices is agreeable. It will find something nice to
                        say about an empty box. These three rules run in code, after the model has answered
                        and before you see anything, so they hold even when the model does not cooperate.
                    </p>

                    <div className="space-y-6">
                        <div className="p-8 rounded-3xl border-2 border-red-100 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/10">
                            <p className="text-[10px] font-black uppercase tracking-widest text-red-600 mb-3">
                                Rule 1
                            </p>
                            <h3 className="text-xl font-black mb-3">Non-answers are capped at 1</h3>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                If a submission runs under 25 words, or if more than 60 percent of its words
                                are lifted straight from the question, every dimension is forced down to 1 or
                                below. Pasting the case back at us is the most common way people test whether
                                a tool is real. This is the answer.
                            </p>
                        </div>

                        <div className="p-8 rounded-3xl border-2 border-amber-100 dark:border-amber-900/30 bg-amber-50/50 dark:bg-amber-900/10">
                            <p className="text-[10px] font-black uppercase tracking-widest text-amber-600 mb-3">
                                Rule 2
                            </p>
                            <h3 className="text-xl font-black mb-3">Vague answers are capped at 3</h3>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                On topic but generic counts as vague: no named segment, no concrete solution,
                                no metric, no prioritisation reasoning, no trade-off. Saying you would use a
                                framework, focus on the user and look at the data, without applying any of it
                                to this case, is the textbook 3.
                            </p>
                        </div>

                        <div className="p-8 rounded-3xl border-2 border-violet-100 dark:border-violet-900/30 bg-violet-50/50 dark:bg-violet-900/10">
                            <p className="text-[10px] font-black uppercase tracking-widest text-violet-600 mb-3">
                                Rule 3
                            </p>
                            <h3 className="text-xl font-black mb-3">Praise has to be earned</h3>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                If your overall lands at 2 or below, the strengths list is emptied before it
                                reaches you. A strength must also point at something you actually wrote, not
                                an ability the answer never demonstrated. An empty strengths list is a correct
                                result, not a missing one.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900/40 border-y border-gray-100 dark:border-gray-800">
                    <div className="container mx-auto max-w-3xl">
                        <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-10">
                            Common questions
                        </h2>
                        <div className="space-y-6">
                            {FAQS.map((f) => (
                                <div
                                    key={f.question}
                                    className="bg-white dark:bg-gray-900 p-7 rounded-3xl border border-gray-100 dark:border-gray-800"
                                >
                                    <h3 className="font-black text-lg mb-3">{f.question}</h3>
                                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{f.answer}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="py-20 px-4">
                    <div className="container mx-auto max-w-3xl text-center">
                        <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-6">
                            See it on your own answer
                        </h2>
                        <p className="text-lg text-gray-600 dark:text-gray-400 mb-10 leading-relaxed">
                            Reading a rubric tells you less than being scored against one. Pick a case and
                            find out where your structure actually breaks.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <Link
                                href="/practice"
                                className="bg-gradient-to-r from-violet-600 to-blue-600 text-white px-8 py-4 rounded-full font-black text-lg hover:shadow-xl hover:shadow-violet-500/30 transition-all inline-flex items-center justify-center gap-2"
                            >
                                Browse the case library <ArrowRight size={20} />
                            </Link>
                            <Link
                                href="/exam"
                                className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-2 border-gray-200 dark:border-gray-800 px-8 py-4 rounded-full font-bold text-lg hover:border-violet-400 dark:hover:border-violet-600 transition-all inline-flex items-center justify-center gap-2"
                            >
                                Take the qualification test
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    )
}
