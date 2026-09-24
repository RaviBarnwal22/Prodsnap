import Link from "next/link";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { Breadcrumbs } from "./Breadcrumbs";
import { ArrowRight, Sparkles, BookOpen, User, Linkedin, HelpCircle } from "lucide-react";
import { SEOContentPage, SEOPillars } from "@/lib/seo-content";

interface SEODetailPageProps {
  pageData: SEOContentPage;
  pillarId: string;
  categorySlug: string;
}

/**
 * These pages are guides, glossary entries and templates, not cases. The CTA
 * used to tell every one of them "practice this case with real-time feedback",
 * which made no sense on an article the reader cannot practise. Each pillar now
 * states the actual gap between reading the page and being scored on a case.
 */
const PRACTICE_CTA: Record<string, { tag: string; heading: string; body: string; action: string; href: string }> = {
  frameworks: {
    tag: "Framework Practice Drills",
    heading: "Want to practice applying these frameworks to real cases?",
    body: "Frameworks only create value when applied to ambiguous, real-world product dilemmas. Put this methodology to work across realistic case studies with instant AI rubric evaluation.",
    action: "Practice case drills",
    href: "/practice",
  },
  "product-analytics": {
    tag: "Metrics Practice",
    heading: "Want to practice defining metrics on a real product?",
    body: "Reading about North Star metrics is the easy part. Choosing one under ambiguity, and naming the counter-metric you would watch alongside it, is what interviews actually test. Try it on a live case and get scored.",
    action: "Try a metrics case",
    href: "/practice?category=METRICS",
  },
  glossary: {
    tag: "See It In Context",
    heading: "Want to see this concept inside a real interview case?",
    body: "A definition tells you what a term means. A case tells you when to reach for it and what it costs you. Work through a scenario where this idea decides the answer, and get scored on how you apply it.",
    action: "Browse the case library",
    href: "/practice",
  },
  templates: {
    tag: "Practice The Decisions",
    heading: "Want to practice the thinking behind this document?",
    body: "A template gives you the structure. Interviews test the judgment that fills it in: what you cut, what you measure, and which trade-off you are willing to defend. Work a real case and get scored on that reasoning.",
    action: "Practice a case",
    href: "/practice",
  },
  "product-management-interview": {
    tag: "Interactive AI Case Coach",
    heading: "Ready to try this on a real interview case?",
    body: "You have seen the structure. The gap most candidates never close is applying it under time pressure without a worked answer in front of them. Submit your own and get scored the way an interviewer would.",
    action: "Practice live now",
    href: "/practice",
  },
  "ai-product-management": {
    tag: "AI Product Cases",
    heading: "Want to practice this on a real AI product case?",
    body: "AI product questions reward specifics: how you would evaluate the feature, what error rate you would ship at, and what breaks after a model upgrade. Work a case and get scored against exactly that bar.",
    action: "Try an AI product case",
    href: "/practice?category=AI_PRODUCT",
  },
  "product-management": {
    tag: "Interactive AI Case Coach",
    heading: "Want to put this into practice?",
    body: "Reading about the craft builds vocabulary. Interviews test judgment under ambiguity. Work through a real product case and get scored on six dimensions, with a model answer to compare yours against.",
    action: "Try a live case",
    href: "/practice",
  },
}

export function SEODetailPage({ pageData, pillarId, categorySlug }: SEODetailPageProps) {
  const pillar = SEOPillars[pillarId];

  // Author details (Founder E-E-A-T)
  const author = {
    name: "Ravi Barnwal",
    role: "Product Leader & Founder of Prodsnap",
    bio: "Ravi Barnwal is a seasoned product leader with deep experience in building scalable products, running growth engines, and mentoring PMs. He is on a mission to democratize elite PM interview prep.",
    linkedin: "https://www.linkedin.com/in/barnwalravi/",
    avatar: "/ravi-barnwal-headshot.jpg"
  };

  // Structured schemas
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": pageData.title,
    "description": pageData.metaDescription,
    "image": "https://prodsnap.in/og-image.png",
    "author": {
      "@type": "Person",
      "name": author.name,
      "url": author.linkedin
    },
    "publisher": {
      "@type": "Organization",
      "name": "Prodsnap",
      "logo": {
        "@type": "ImageObject",
        "url": "https://prodsnap.in/logo.png"
      }
    },
    "datePublished": "2025-01-01T00:00:00Z",
    "dateModified": new Date().toISOString()
  };

  const faqSchema = pageData.faqs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": pageData.faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  } : null;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col font-sans">
      <Header />

      {/* JSON-LD Schemas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      <main className="flex-grow pt-24 px-4 pb-16">
        <div className="container mx-auto max-w-4xl">
          {/* Breadcrumbs */}
          <Breadcrumbs
            items={[
              { label: pillar.title, href: `/${pillarId}` },
              { label: pageData.h1, href: `/${pillarId}/${categorySlug}` }
            ]}
          />

          {/* Heading */}
          <div className="mb-8">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 border border-violet-100 dark:border-violet-800">
                <Sparkles size={12} />
                {pageData.category || pillar.title}
              </span>
              {pageData.readTime && (
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                  • {pageData.readTime}
                </span>
              )}
              {pageData.difficulty && (
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                  {pageData.difficulty}
                </span>
              )}
              {pageData.companyTags && pageData.companyTags.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 sm:ml-auto">
                  <span className="text-[11px] text-gray-400 font-medium">Asked at:</span>
                  {pageData.companyTags.map((company, i) => (
                    <span key={i} className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200/60 dark:border-gray-700">
                      {company}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-gray-900 dark:text-white leading-[1.1] mb-6">
              {pageData.h1}
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
              {pageData.intro}
            </p>
          </div>

          {/* Grid Layout: Main Content vs Sticky Sidebar */}
          <div className="grid lg:grid-cols-3 gap-10 items-start">
            {/* Left side: Main Content */}
            <div className="lg:col-span-2 space-y-10">
              {/* Dynamic Sections */}
              {pageData.sections.map((section, idx) => (
                <section key={idx} className="prose dark:prose-invert max-w-none">
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-4 border-b pb-2">
                    {section.heading}
                  </h2>
                  <div className="text-gray-600 dark:text-gray-300 space-y-4 leading-relaxed whitespace-pre-line text-sm md:text-base">
                    {section.content}
                  </div>
                </section>
              ))}

              {/* In-article practice CTA, worded per pillar. See PRACTICE_CTA. */}
              {(() => {
                const cta =
                  PRACTICE_CTA[pillarId] ??
                  (pageData.category?.toLowerCase().includes("framework")
                    ? PRACTICE_CTA["frameworks"]
                    : PRACTICE_CTA["product-management"]);

                return (
                  <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-violet-900 via-indigo-900 to-gray-950 text-white border border-violet-500/20 shadow-xl">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-violet-500/20 text-violet-300 border border-violet-400/30">
                          <Sparkles size={13} />
                          {cta.tag}
                        </div>
                        <h3 className="text-xl md:text-2xl font-black">{cta.heading}</h3>
                        <p className="text-sm text-violet-200/80 max-w-xl leading-relaxed">{cta.body}</p>
                      </div>
                      <Link
                        href={pageData.practiceUrl || cta.href}
                        className="shrink-0 px-6 py-3.5 bg-white text-violet-900 hover:bg-violet-50 font-black rounded-xl text-sm transition-all shadow-lg hover:shadow-violet-500/20 flex items-center justify-center gap-2"
                      >
                        {cta.action} <ArrowRight size={16} />
                      </Link>
                    </div>
                  </div>
                );
              })()}

              {/* FAQs */}
              {pageData.faqs.length > 0 && (
                <section className="prose dark:prose-invert max-w-none">
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6 border-b pb-2 flex items-center gap-2">
                    <HelpCircle className="text-violet-600" size={24} />
                    Frequently Asked Questions
                  </h2>
                  <div className="space-y-6">
                    {pageData.faqs.map((faq, idx) => (
                      <div key={idx} className="bg-gray-50 dark:bg-gray-900/50 p-5 rounded-2xl border border-gray-100 dark:border-gray-800">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-2 text-base md:text-lg">
                          {faq.question}
                        </h3>
                        <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Right side: Sticky Sidebar */}
            <aside className="space-y-6 lg:sticky lg:top-24">
              {/* Practice CTA */}
              <div className="bg-gradient-to-br from-violet-600 to-indigo-700 text-white p-6 rounded-3xl shadow-xl shadow-indigo-500/10">
                <h3 className="font-black text-xl mb-3 flex items-center gap-2">
                  <Sparkles size={20} />
                  Simulate PM Interviews
                </h3>
                <p className="text-xs opacity-90 leading-relaxed mb-6">
                  Stop reading static guides. Practice product sense, execution, and strategy frameworks interactively with our AI-powered coach.
                </p>
                <Link
                  href={pageData.practiceUrl || "/practice"}
                  className="w-full text-center py-3 bg-white text-violet-600 font-black rounded-xl text-sm hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                >
                  Start Practice Free <ArrowRight size={16} />
                </Link>
              </div>

              {/* Author Info (E-E-A-T) */}
              <div className="bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-850 p-5 rounded-3xl">
                <h4 className="font-bold text-xs uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-1.5">
                  <User size={14} />
                  Verified Author
                </h4>
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={author.avatar}
                    alt={author.name}
                    className="w-12 h-12 rounded-full object-cover border border-violet-100"
                  />
                  <div>
                    <h5 className="font-bold text-sm text-gray-900 dark:text-white">{author.name}</h5>
                    <p className="text-[10px] text-gray-500">{author.role}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-4">
                  {author.bio}
                </p>
                <a
                  href={author.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:underline font-semibold"
                >
                  <Linkedin size={14} />
                  Connect on LinkedIn
                </a>
              </div>

              {/* Contextual Internal Links */}
              {pageData.relatedSlugs.length > 0 && (
                <div className="bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-850 p-5 rounded-3xl">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-1.5">
                    <BookOpen size={14} />
                    Related Resources
                  </h4>
                  <ul className="space-y-3">
                    {pageData.relatedSlugs.map((relSlug, idx) => {
                      // A related entry may be a bare slug (same pillar) or a
                      // "pillar/slug" path for cross-pillar linking. Rendering a
                      // cross-pillar slug under the current pillar would 404.
                      const isCrossPillar = relSlug.includes("/");
                      const href = isCrossPillar ? `/${relSlug}` : `/${pillarId}/${relSlug}`;
                      const label = (isCrossPillar ? relSlug.split("/").pop() || relSlug : relSlug)
                        .split("-")
                        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(" ");

                      return (
                        <li key={idx}>
                          <Link
                            href={href}
                            className="text-xs font-semibold text-gray-700 dark:text-gray-300 hover:text-violet-600 dark:hover:text-violet-400 transition-colors flex items-center gap-1 group"
                          >
                            <span className="text-violet-600 group-hover:translate-x-0.5 transition-transform">→</span>
                            <span className="truncate max-w-[200px]">
                              {label}
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
