export const dynamic = 'force-dynamic'
import Link from "next/link"
import Image from "next/image"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { ArrowRight, Users, Sparkles, BookOpen } from "lucide-react"
import { getUser } from "@/lib/auth"

export default async function Home() {
  // Single getUser call — result passed to Header to avoid a second Supabase+DB round trip
  const user = await getUser()

  const testimonialPeople = [
    {
      img: "/shivam.jpg",
      name: "Shivam",
      role: "Product Lead",
      quote: "The diverse product sense cases are incredibly relevant and thought-provoking.",
      linkedin: "https://www.linkedin.com/in/barnwal3008/"
    },
    {
      img: "/shweta.jpg",
      name: "Shweta",
      role: "Consultant",
      quote: "The AI feedback is incredibly accurate!"
    }
  ]

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950">
      <Header user={user} />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-violet-50 via-blue-50 to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-950 py-16 md:py-24 px-4 relative overflow-hidden">
          {/* Static gradient orbs — no animate-pulse on first paint (deferred via CSS animation-delay) */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
            <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-300/30 dark:bg-purple-900/20 rounded-full blur-3xl" style={{ animation: 'pulse 4s ease-in-out 1s infinite' }}></div>
            <div className="absolute -top-20 -right-40 w-80 h-80 bg-blue-300/30 dark:bg-blue-900/20 rounded-full blur-3xl" style={{ animation: 'pulse 4s ease-in-out 2s infinite' }}></div>
          </div>

          <div className="container mx-auto max-w-7xl relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Side - Text Content */}
              <div className="text-center lg:text-left">
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight mb-8 text-gray-900 dark:text-white leading-[1.1]">
                  Master Product Management <br className="hidden md:block" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-500">With AI-Guided Precision</span>
                </h1>
                <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-xl mb-10 leading-relaxed font-medium lg:mx-0 mx-auto">
                  The only platform that evaluates your product sensing questions using adaptive case frameworks and instant Gemini-powered feedback.
                </p>
                <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
                  <Link href="/practice" className="bg-gradient-to-r from-violet-600 to-blue-600 text-white px-12 py-5 rounded-full font-black text-xl hover:shadow-xl hover:shadow-violet-500/30 transition-all flex items-center justify-center gap-2 group">
                    Start Practice with AI Simulation <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>

              {/* Right Side - Hero Image */}
              <div className="relative hidden lg:block">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-blue-500 rounded-3xl blur-2xl opacity-20 scale-105" aria-hidden="true"></div>
                  <div className="relative w-full max-w-md mx-auto aspect-[4/5] overflow-hidden rounded-3xl shadow-2xl border-4 border-white">
                    {/* LCP image — priority:true, fetchpriority high, explicit dimensions for zero CLS */}
                    <Image
                      src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&h=750&fit=crop"
                      alt="Product Manager practicing with Prodsnap"
                      fill
                      className="object-cover"
                      priority
                      sizes="(max-width: 1024px) 0px, 448px"
                    />
                  </div>

                  {/* Testimonial cards — deferred animation start */}
                  <div className="absolute -left-12 top-20 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 max-w-xs animate-float">
                    <div className="flex items-center gap-3 mb-2">
                      <Image src={testimonialPeople[0].img} alt="" width={40} height={40} className="rounded-full" loading="lazy" />
                      <div>
                        {testimonialPeople[0].linkedin ? (
                          <a
                            href={testimonialPeople[0].linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-bold text-sm hover:text-violet-600 transition-colors flex items-center gap-1"
                          >
                            {testimonialPeople[0].name}
                            <span className="text-[10px] text-blue-500">in</span>
                          </a>
                        ) : (
                          <p className="font-bold text-sm">{testimonialPeople[0].name}</p>
                        )}
                        <p className="text-xs text-violet-600">{testimonialPeople[0].role}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">&ldquo;{testimonialPeople[0].quote}&rdquo;</p>
                  </div>

                  <div className="absolute -right-8 bottom-32 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 max-w-xs animate-float" style={{ animationDelay: '1s' }}>
                    <div className="flex items-center gap-3 mb-2">
                      <Image src={testimonialPeople[1].img} alt="" width={40} height={40} className="rounded-full" loading="lazy" />
                      <div>
                        <p className="font-bold text-sm">{testimonialPeople[1].name}</p>
                        <p className="text-xs text-violet-600">{testimonialPeople[1].role}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">&ldquo;{testimonialPeople[1].quote}&rdquo;</p>
                  </div>

                  {/* Stats card */}
                  <div className="absolute -left-4 bottom-8 bg-gradient-to-r from-violet-600 to-blue-600 text-white p-4 rounded-2xl shadow-xl animate-float" style={{ animationDelay: '2s' }}>
                    <p className="text-3xl font-black">95%</p>
                    <p className="text-sm opacity-80">Success Rate</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Marquee Strip */}
        <section className="py-3 md:py-6 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 overflow-hidden" aria-label="Platform features">
          <div className="flex animate-marquee whitespace-nowrap" aria-hidden="true">
            {[
              { icon: "🎯", text: "Custom Framework Evaluation" },
              { icon: "🤖", text: "Gemini-Powered AI Feedback" },
              { icon: "📝", text: "100+ Product Sense Questions" },
              { icon: "🎤", text: "Voice & Text Submissions" },
              { icon: "📊", text: "Detailed Scoring & Analysis" },
              { icon: "💡", text: "Expert-Curated Solutions" },
              { icon: "🚀", text: "Unlimited Practice Sessions" },
              { icon: "📱", text: "Mobile-Friendly Interface" },
            ].concat([
              { icon: "🎯", text: "Custom Framework Evaluation" },
              { icon: "🤖", text: "Gemini-Powered AI Feedback" },
              { icon: "📝", text: "100+ Product Sense Questions" },
              { icon: "🎤", text: "Voice & Text Submissions" },
              { icon: "📊", text: "Detailed Scoring & Analysis" },
              { icon: "💡", text: "Expert-Curated Solutions" },
              { icon: "🚀", text: "Unlimited Practice Sessions" },
              { icon: "📱", text: "Mobile-Friendly Interface" },
            ]).map((feature, i) => (
              <div key={i} className="flex items-center gap-2 md:gap-3 mx-4 md:mx-8 text-white">
                <span className="text-xl md:text-2xl">{feature.icon}</span>
                <p className="text-[10px] md:text-sm font-semibold tracking-wide uppercase">{feature.text}</p>
                <span className="mx-2 md:mx-4 text-white/30">•</span>
              </div>
            ))}
          </div>
        </section>

        {/* Core Pillars */}
        <section className="py-24 px-4 container mx-auto border-b border-gray-100 dark:border-gray-800">
          <div className="text-center mb-16">
            <h2 className="text-xs uppercase tracking-[0.3em] font-black text-violet-600 mb-4">The Ecosystem</h2>
            <h3 className="text-4xl font-black tracking-tight">Everything you need to <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-blue-600">scale</span>.</h3>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="group bg-gradient-to-br from-violet-50 to-white dark:from-gray-900 dark:to-gray-900 p-8 rounded-3xl border border-violet-100 dark:border-gray-800 hover:shadow-xl hover:shadow-violet-500/10 transition-all">
              <div className="bg-gradient-to-br from-violet-500 to-purple-600 text-white w-16 h-16 flex items-center justify-center rounded-2xl mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <Sparkles size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-4">Practice Engine</h3>
              <p className="text-gray-500 dark:text-gray-400 leading-relaxed font-medium mb-4">Real-time feedback on your verbal and written answers using industry-standard frameworks.</p>
              <Link href="/practice" className="inline-flex items-center gap-2 text-violet-600 font-bold hover:underline group-hover:gap-3 transition-all">Launch engine <ArrowRight size={16} /></Link>
            </div>

            <div className="group bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-900 p-8 rounded-3xl border border-blue-100 dark:border-gray-800 hover:shadow-xl hover:shadow-blue-500/10 transition-all">
              <div className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white w-16 h-16 flex items-center justify-center rounded-2xl mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <BookOpen size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-4">Knowledge & Blogs</h3>
              <p className="text-gray-500 dark:text-gray-400 leading-relaxed font-medium mb-4">Explore insightful articles, PM frameworks, and interview guides curated by industry experts.</p>
              <Link href="/blog" className="inline-flex items-center gap-2 text-blue-600 font-bold hover:underline group-hover:gap-3 transition-all">Read blogs <ArrowRight size={16} /></Link>
            </div>

            <div className="group bg-gradient-to-br from-emerald-50 to-white dark:from-gray-900 dark:to-gray-900 p-8 rounded-3xl border border-emerald-100 dark:border-gray-800 hover:shadow-xl hover:shadow-emerald-500/10 transition-all">
              <div className="bg-gradient-to-br from-emerald-500 to-green-600 text-white w-16 h-16 flex items-center justify-center rounded-2xl mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <Users size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-4">Community</h3>
              <p className="text-gray-500 dark:text-gray-400 leading-relaxed font-medium mb-4">Join our WhatsApp community for PM openings, exclusive materials, peer learning, and expert guidance.</p>
              <Link href="/community" className="inline-flex items-center gap-2 text-emerald-600 font-bold hover:underline group-hover:gap-3 transition-all">Join community <ArrowRight size={16} /></Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
