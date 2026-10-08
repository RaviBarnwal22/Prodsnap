'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ArrowRight } from "lucide-react"
import { BLOG_CTAS, type BlogCtaType } from "@/lib/blog/cta"
import { trackActivity } from "@/app/actions"

export function BlogCtaCard({ cta, tracked = true }: { cta: BlogCtaType; tracked?: boolean }) {
    const pathname = usePathname()
    const c = BLOG_CTAS[cta]
    return (
        <aside className="not-prose my-10 rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 p-6 md:p-8 text-white shadow-xl shadow-violet-500/20">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-violet-200">{c.eyebrow}</p>
            <p className="mt-2 text-xl md:text-2xl font-black leading-tight">{c.title}</p>
            <p className="mt-2 text-sm md:text-base text-violet-100 leading-relaxed">{c.body}</p>
            <Link
                href={c.href}
                onClick={() => { if (tracked) trackActivity(pathname, "blog_cta_click", cta) }}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-black text-violet-700 hover:bg-violet-50 transition"
            >
                {c.button} <ArrowRight size={16} />
            </Link>
        </aside>
    )
}
