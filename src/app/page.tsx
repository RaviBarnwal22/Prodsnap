import Link from "next/link"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { ArrowRight, Users, Sparkles, BookOpen, Star, Quote } from "lucide-react"

export default function Home() {
  // Professional headshots from Unsplash (diverse, professional-looking people)
  const testimonialPeople = [
    {
      img: "/shivam.png",
      name: "Shivam",
      role: "",
      quote: "The diverse product sense cases are incredibly relevant and thought-provoking.",
      linkedin: "https://www.linkedin.com/in/barnwal3008/"
    },
    {
      img: "/shweta.jpg",
      name: "Shweta",
      role: "",
      quote: "The AI feedback is incredibly accurate!"
    }
  ]

  // Floating avatars for background decoration
  const floatingAvatars = [
    { img: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=80&h=80&fit=crop&crop=face", pos: "top-20 left-[10%]", delay: "0s", size: "w-14 h-14" },
    { img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&h=80&fit=crop&crop=face", pos: "top-32 right-[15%]", delay: "1s", size: "w-12 h-12" },
    { img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&h=80&fit=crop&crop=face", pos: "top-48 left-[5%]", delay: "2s", size: "w-10 h-10" },
    { img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=80&h=80&fit=crop&crop=face", pos: "top-16 right-[8%]", delay: "0.5s", size: "w-11 h-11" },
    { img: "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=80&h=80&fit=crop&crop=face", pos: "top-60 right-[5%]", delay: "1.5s", size: "w-9 h-9" },
    { img: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&h=80&fit=crop&crop=face", pos: "top-72 left-[12%]", delay: "2.5s", size: "w-10 h-10" },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950">
      <Header />

      <main className="flex-grow">
        {/* Hero Section with Real Person Image */}
        <section className="bg-gradient-to-b from-violet-50 via-blue-50 to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-950 py-16 md:py-24 px-4 relative overflow-hidden">
          {/* Animated gradient orbs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-300/30 dark:bg-purple-900/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -top-20 -right-40 w-80 h-80 bg-blue-300/30 dark:bg-blue-900/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-pink-300/20 dark:bg-pink-900/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
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
                  The only platform that evaluates your product sensing questions using the CIRCLES framework and instant Gemini-powered feedback.
                </p>
                <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
                  <Link href="/practice" className="bg-gradient-to-r from-violet-600 to-blue-600 text-white px-10 py-4 rounded-full font-black text-lg hover:shadow-xl hover:shadow-violet-500/30 transition-all flex items-center justify-center gap-2 group">
                    Start Practicing <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                  {/* <Link href="/prodsense" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-10 py-4 rounded-full font-black text-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition border border-gray-200 dark:border-gray-700 shadow-lg">
                    Explore Prodsense
                  </Link> */}
                </div>
              </div>

              {/* Right Side - Hero Image with People */}
              <div className="relative hidden lg:block">
                {/* Main hero image - professional working */}
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-blue-500 rounded-3xl blur-2xl opacity-20 scale-105"></div>
                  <img
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&h=700&fit=crop"
                    alt="Product Manager"
                    className="relative rounded-3xl shadow-2xl w-full max-w-md mx-auto object-cover border-4 border-white"
                  />

                  {/* Floating testimonial cards */}
                  <div className="absolute -left-12 top-20 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 max-w-xs animate-float">
                    <div className="flex items-center gap-3 mb-2">
                      <img src={testimonialPeople[0].img} alt="" className="w-10 h-10 rounded-full" />
                      <div>
                        {/* @ts-ignore */}
                        {testimonialPeople[0].linkedin ? (
                          <a
                            /* @ts-ignore */
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
                      <img src={testimonialPeople[1].img} alt="" className="w-10 h-10 rounded-full" />
                      <div>
                        <p className="font-bold text-sm">{testimonialPeople[1].name}</p>
                        <p className="text-xs text-violet-600">{testimonialPeople[1].role}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">&ldquo;{testimonialPeople[1].quote}&rdquo;</p>
                  </div>

                  {/* Stats floating card */}
                  <div className="absolute -left-4 bottom-8 bg-gradient-to-r from-violet-600 to-blue-600 text-white p-4 rounded-2xl shadow-xl animate-float" style={{ animationDelay: '2s' }}>
                    <p className="text-3xl font-black">95%</p>
                    <p className="text-sm opacity-80">Success Rate</p>
                  </div>
                </div>

                {/* Small floating avatars */}
                {floatingAvatars.slice(0, 3).map((avatar, i) => (
                  <div
                    key={i}
                    className={`absolute ${i === 0 ? 'top-0 right-0' : i === 1 ? 'bottom-0 right-20' : 'top-40 -left-8'} ${avatar.size} rounded-full overflow-hidden border-2 border-white shadow-lg animate-float`}
                    style={{ animationDelay: avatar.delay }}
                  >
                    <img src={avatar.img} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Application Features Strip */}
        <section className="py-8 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 overflow-hidden">
          <div className="flex animate-marquee whitespace-nowrap">
            {[
              { icon: "🎯", text: "CIRCLES Framework Evaluation" },
              { icon: "🤖", text: "Gemini-Powered AI Feedback" },
              { icon: "📝", text: "100+ Product Sense Questions" },
              { icon: "🎤", text: "Voice & Text Submissions" },
              { icon: "📊", text: "Detailed Scoring & Analysis" },
              { icon: "💡", text: "Expert-Curated Solutions" },
              { icon: "🚀", text: "Unlimited Practice Sessions" },
              { icon: "📱", text: "Mobile-Friendly Interface" },
              { icon: "🎯", text: "CIRCLES Framework Evaluation" },
              { icon: "🤖", text: "Gemini-Powered AI Feedback" },
              { icon: "📝", text: "100+ Product Sense Questions" },
              { icon: "🎤", text: "Voice & Text Submissions" },
              { icon: "📊", text: "Detailed Scoring & Analysis" },
              { icon: "💡", text: "Expert-Curated Solutions" },
              { icon: "🚀", text: "Unlimited Practice Sessions" },
              { icon: "📱", text: "Mobile-Friendly Interface" },
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 mx-8 text-white">
                <span className="text-2xl">{feature.icon}</span>
                <p className="text-sm font-semibold tracking-wide">{feature.text}</p>
                <span className="mx-4 text-white/30">•</span>
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
          <div className="grid md:grid-cols-3 gap-12 max-w-6xl mx-auto">
            <div className="group bg-gradient-to-br from-violet-50 to-white dark:from-gray-900 dark:to-gray-900 p-8 rounded-3xl border border-violet-100 dark:border-gray-800 hover:shadow-xl hover:shadow-violet-500/10 transition-all">
              <div className="bg-gradient-to-br from-violet-500 to-purple-600 text-white w-16 h-16 flex items-center justify-center rounded-2xl mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <Sparkles size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-4">Practice Engine</h3>
              <p className="text-gray-500 dark:text-gray-400 leading-relaxed font-medium mb-4">Real-time feedback on your verbal and written answers using the industry-standard CIRCLES framework.</p>
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

        {/* Featured Testimonial Section */}
        <section className="py-24 px-4 bg-gray-50 dark:bg-gray-900/50 relative overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
              backgroundSize: '40px 40px'
            }}></div>
          </div>

          <div className="container mx-auto max-w-6xl relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-xs uppercase tracking-[0.3em] font-black text-violet-600 mb-4">Success Stories</h2>
              <h3 className="text-4xl font-black tracking-tight">Real People, Real Results</h3>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {testimonialPeople.slice(0, 6).map((person, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow group">
                  <div className="flex items-center gap-4 mb-4">
                    <img src={person.img} alt={person.name} className="w-14 h-14 rounded-full border-2 border-violet-200 group-hover:scale-110 transition-transform" />
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">{person.name}</p>
                      <p className="text-sm text-violet-600 font-medium">{person.role}</p>
                    </div>
                  </div>
                  <div className="flex text-yellow-400 mb-3">
                    {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 italic">&ldquo;{person.quote}&rdquo;</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="py-24 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-white/10 rounded-full blur-2xl"></div>
          </div>

          <div className="container mx-auto px-4 text-center max-w-3xl relative z-10">
            <h2 className="text-4xl font-black mb-6 text-white">Stay Ahead of the Curve</h2>
            <p className="text-lg text-white/80 mb-10 font-medium">
              We release new case studies and interview guides every Tuesday. Join our mailing list to never miss a deep dive.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <input type="email" placeholder="Enter your email" className="px-6 py-4 rounded-full border-2 border-white/20 bg-white/10 backdrop-blur-sm flex-grow focus:ring-2 focus:ring-white/50 outline-none text-white placeholder:text-white/60 font-medium" />
              <button className="bg-white text-purple-600 px-8 py-4 rounded-full font-black hover:bg-white/90 transition shadow-lg">
                Subscribe
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

