import Link from "next/link"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { ArrowRight, Users, Sparkles, BookOpen, Star, Quote } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirectedFrom=/')
  }


  // Professional headshots from Unsplash (diverse, professional-looking people)
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
        <section className="bg-white dark:bg-[#050505] py-16 md:py-24 px-4 relative overflow-hidden">
          {/* Animated gradient orbs - Gen Z Style */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#ccff00]/20 rounded-full blur-[100px] animate-pulse"></div>
            <div className="absolute top-20 right-0 w-80 h-80 bg-[#ff00cc]/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>

          <div className="container mx-auto max-w-7xl relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Side - Text Content */}
              <div className="text-center lg:text-left">


                <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter mb-8 text-black dark:text-white leading-[1.0] uppercase italic">
                  Master Product Management <br className="hidden md:block" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ccff00] via-[#ff00cc] to-[#7c3aed]">With AI-Guided Precision</span>
                </h1>
                <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 max-w-xl mb-10 leading-relaxed font-bold lg:mx-0 mx-auto">
                  The only platform that evaluates your product sensing questions using adaptive case frameworks and instant Gemini-powered feedback.
                </p>
                <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
                  <Link href="/practice" className="bg-[#ccff00] text-black border-2 border-black dark:border-white px-12 py-5 rounded-none skew-x-[-12deg] font-black text-xl hover:shadow-[8px_8px_0px_0px_rgba(255,0,204,1)] hover:-translate-y-1 transition-all flex items-center justify-center gap-2 group">
                    <span className="skew-x-[12deg] flex items-center gap-2">Start Practice with AI Simulation <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" /></span>
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
        <section className="py-4 bg-black border-y-2 border-white overflow-hidden rotate-[-1deg] scale-105 z-20 relative shadow-[0_10px_40px_rgba(255,0,204,0.3)]">
          <div className="flex animate-marquee whitespace-nowrap">
            {[
              { icon: "🎯", text: "Custom Framework Evaluation" },
              { icon: "🤖", text: "Gemini-Powered AI Feedback" },
              { icon: "📝", text: "100+ Product Sense Questions" },
              { icon: "🎤", text: "Voice & Text Submissions" },
              { icon: "📊", text: "Detailed Scoring & Analysis" },
              { icon: "💡", text: "Expert-Curated Solutions" },
              { icon: "🚀", text: "Unlimited Practice Sessions" },
              { icon: "📱", text: "Mobile-Friendly Interface" },
              { icon: "🎯", text: "Custom Framework Evaluation" },
              { icon: "🤖", text: "Gemini-Powered AI Feedback" },
              { icon: "📝", text: "100+ Product Sense Questions" },
              { icon: "🎤", text: "Voice & Text Submissions" },
              { icon: "📊", text: "Detailed Scoring & Analysis" },
              { icon: "💡", text: "Expert-Curated Solutions" },
              { icon: "🚀", text: "Unlimited Practice Sessions" },
              { icon: "📱", text: "Mobile-Friendly Interface" },
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-6 mx-8 text-[#ccff00]">
                <span className="text-3xl">{feature.icon}</span>
                <p className="text-xl font-black uppercase tracking-widest italic">{feature.text}</p>
                <span className="mx-4 text-white">•</span>
              </div>
            ))}
          </div>
        </section>

        {/* Core Pillars */}
        <section className="py-24 px-4 container mx-auto border-b border-gray-100 dark:border-gray-800">
          <div className="text-center mb-16">
            <h2 className="text-sm uppercase tracking-[0.3em] font-black text-[#ff00cc] mb-4 bg-black inline-block text-white px-2 py-1 rotate-2">The Ecosystem</h2>
            <h3 className="text-5xl font-black tracking-tighter text-black dark:text-white uppercase">Everything you need to <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-[#ccff00] to-[#00ff99]">scale</span>.</h3>
          </div>
          <div className="grid md:grid-cols-3 gap-12 max-w-6xl mx-auto">
            <div className="group bg-white dark:bg-[#111] p-8 border-2 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all">
              <div className="bg-[#ccff00] text-black w-16 h-16 flex items-center justify-center border-2 border-black mb-6 group-hover:rotate-12 transition-transform shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <Sparkles size={32} />
              </div>
              <h3 className="text-2xl font-black uppercase mb-4 text-black dark:text-white">Practice Engine</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed font-bold mb-4">Real-time feedback on your verbal and written answers using industry-standard frameworks.</p>
              <Link href="/practice" className="inline-flex items-center gap-2 text-black dark:text-white font-black uppercase bg-[#ccff00] px-4 py-2 border-2 border-black hover:bg-[#b3ff00] transition-colors">Launch engine <ArrowRight size={16} /></Link>
            </div>
            <div className="group bg-white dark:bg-[#111] p-8 border-2 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all">
              <div className="bg-[#00ffff] text-black w-16 h-16 flex items-center justify-center border-2 border-black mb-6 group-hover:-rotate-12 transition-transform shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <BookOpen size={32} />
              </div>
              <h3 className="text-2xl font-black uppercase mb-4 text-black dark:text-white">Knowledge & Blogs</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed font-bold mb-4">Explore insightful articles, PM frameworks, and interview guides curated by industry experts.</p>
              <Link href="/blog" className="inline-flex items-center gap-2 text-black dark:text-white font-black uppercase bg-[#00ffff] px-4 py-2 border-2 border-black hover:bg-[#00eefe] transition-colors">Read blogs <ArrowRight size={16} /></Link>
            </div>
            <div className="group bg-white dark:bg-[#111] p-8 border-2 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all">
              <div className="bg-[#ff00cc] text-black w-16 h-16 flex items-center justify-center border-2 border-black mb-6 group-hover:rotate-12 transition-transform shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <Users size={32} />
              </div>
              <h3 className="text-2xl font-black uppercase mb-4 text-black dark:text-white">Community</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed font-bold mb-4">Join our WhatsApp community for PM openings, exclusive materials, peer learning, and expert guidance.</p>
              <Link href="/community" className="inline-flex items-center gap-2 text-black dark:text-white font-black uppercase bg-[#ff00cc] px-4 py-2 border-2 border-black hover:bg-[#e600b8] transition-colors">Join community <ArrowRight size={16} /></Link>
            </div>
          </div>
        </section>

        {/* Featured Testimonial Section */}
        <section className="py-24 px-4 bg-[#f0f0f0] dark:bg-[#0a0a0a] relative overflow-hidden border-t-2 border-black dark:border-white">
          {/* Background pattern - Gen Z Grid */}
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute inset-0" style={{
              backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)',
              backgroundSize: '40px 40px'
            }}></div>
          </div>

          <div className="container mx-auto max-w-6xl relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-sm uppercase tracking-[0.3em] font-black text-black mb-4 bg-[#ccff00] inline-block px-2 py-1 -rotate-1 border-2 border-black">Success Stories</h2>
              <h3 className="text-5xl font-black tracking-tighter text-black dark:text-white uppercase italic">Real People, <span className="text-[#ff00cc]">Real Results</span></h3>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {testimonialPeople.slice(0, 6).map((person, i) => (
                <div key={i} className="bg-white dark:bg-[#111] p-6 border-2 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all group">
                  <div className="flex items-center gap-4 mb-4">
                    <img src={person.img} alt={person.name} className="w-14 h-14 rounded-full border-2 border-black dark:border-white group-hover:scale-110 transition-transform grayscale hover:grayscale-0" />
                    <div>
                      <p className="font-black text-xl uppercase text-black dark:text-white">{person.name}</p>
                      <p className="text-sm text-[#ff00cc] font-bold tracking-widest uppercase">{person.role || "Product Manager"}</p>
                    </div>
                  </div>
                  <div className="flex text-black dark:text-white mb-3 gap-1">
                    {[...Array(5)].map((_, i) => <Star key={i} size={18} fill="currentColor" strokeWidth={0} className="text-[#ccff00]" />)}
                  </div>
                  <p className="text-gray-800 dark:text-gray-300 font-bold italic leading-relaxed">&ldquo;{person.quote}&rdquo;</p>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  )
}
