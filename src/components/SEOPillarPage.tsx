import Link from "next/link";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { Breadcrumbs } from "./Breadcrumbs";
import { ArrowRight, Sparkles, BookOpen } from "lucide-react";
import { SEOPillars, SEOContentData } from "@/lib/seo-content";

interface SEOPillarPageProps {
  pillarId: string;
}

export function SEOPillarPage({ pillarId }: SEOPillarPageProps) {
  const pillar = SEOPillars[pillarId];
  const pages = Object.values(SEOContentData[pillarId] || {});

  // Generate WebPage Schema.org
  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": pillar.title,
    "description": pillar.description,
    "publisher": {
      "@type": "Organization",
      "name": "Prodsnap",
      "logo": {
        "@type": "ImageObject",
        "url": "https://prodsnap.in/logo.png"
      }
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col font-sans">
      <Header />

      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />

      <main className="flex-grow pt-24 px-4 pb-16">
        <div className="container mx-auto max-w-5xl">
          {/* Breadcrumbs */}
          <Breadcrumbs items={[{ label: pillar.title, href: `/${pillarId}` }]} />

          {/* Heading */}
          <div className="mb-12 text-center lg:text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 mb-4 border border-violet-100 dark:border-violet-800">
              <BookOpen size={12} />
              Topical Guide
            </span>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight text-gray-900 dark:text-white leading-[1.1] mb-6">
              {pillar.title}
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl leading-relaxed">
              {pillar.description}
            </p>
          </div>

          {/* Articles list */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {pages.map((page, idx) => (
              <Link
                key={idx}
                href={`/${pillarId}/${page.slug}`}
                className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 rounded-3xl hover:shadow-xl transition-all duration-300 flex flex-col group"
              >
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-violet-600 transition-colors">
                  {page.h1.replace("?", "")}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-6 flex-grow">
                  {page.metaDescription}
                </p>
                <div className="inline-flex items-center gap-2 text-xs font-bold text-violet-600 uppercase tracking-widest mt-auto group-hover:gap-3 transition-all">
                  Read Guide <ArrowRight size={14} />
                </div>
              </Link>
            ))}
          </div>

          {/* CTA Box */}
          <div className="bg-gradient-to-r from-violet-600 to-blue-600 rounded-[2.5rem] p-8 md:p-12 text-center text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <div className="relative z-10 max-w-2xl mx-auto">
              <h3 className="text-2xl md:text-4xl font-black mb-4">Put Theory Into Practice</h3>
              <p className="text-sm md:text-base opacity-90 mb-8">
                Master PM frameworks interactively. Answer actual cases using Voice or Text inputs and receive instant grading with actionable weaknesses and strengths.
              </p>
              <Link
                href="/practice"
                className="inline-block bg-white text-violet-600 px-8 py-3.5 rounded-full font-black text-sm hover:bg-gray-50 hover:scale-105 transition-all shadow-xl"
              >
                Start AI Practice Now
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
