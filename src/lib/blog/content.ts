import { FilterXSS, friendlyAttrValue, escapeAttrValue } from "xss"
import { isBlogCtaType, type BlogCtaType } from "./cta"

// Article HTML is cleaned with js-xss, a pure-JavaScript allow-list filter.
// It used to be isomorphic-dompurify, which needs jsdom on the server, and
// jsdom failed to load on Vercel (ERR_REQUIRE_ESM inside its dependencies),
// crashing every article page and the admin save. js-xss has no DOM and no
// Node version requirement. Keep the server free of jsdom.

// Everything the editor can produce, and nothing else. Anything outside this
// list (script, iframe, style, event handlers, inline styles) is stripped.
const WHITE_LIST: Record<string, string[]> = {
    p: [], br: [], hr: [], h2: [], h3: [], strong: [], b: [], em: [], i: [], u: [], s: [],
    ul: [], ol: [], li: [], blockquote: [], code: [], pre: [],
    a: ["href", "title", "target", "rel"],
    img: ["src", "alt", "title"],
    div: ["data-cta"],
}

// Tags whose CONTENT is dropped too, not just the tag, so script text, CSS
// and embedded markup never leak into the article as visible text.
const DROP_WITH_CONTENT = ["script", "style", "iframe", "object", "embed", "noscript", "template", "svg", "math", "textarea", "select", "head", "title"]

const isInternal = (href: string) => /^https?:\/\/(www\.)?prodsnap\.in(\/|$)/i.test(href)

const filter = new FilterXSS({
    whiteList: WHITE_LIST,
    stripIgnoreTag: true,
    stripIgnoreTagBody: DROP_WITH_CONTENT,
    allowCommentTag: false,
    css: false,
    onTagAttr(tag, name, value) {
        // friendlyAttrValue decodes entities and strips control characters, so
        // tricks like "java&#115;cript:" are seen for what they are.
        const v = friendlyAttrValue(value).trim()

        if (tag === "a") {
            if (name === "target" || name === "rel") return "" // derived from href below
            if (name === "href") {
                if (!/^(https?:|mailto:|\/(?!\/)|#)/i.test(v)) return ""
                const safe = `href="${escapeAttrValue(v)}"`
                // External links open in a new tab and pass no ranking credit.
                return /^https?:/i.test(v) && !isInternal(v)
                    ? `${safe} target="_blank" rel="noopener noreferrer nofollow"`
                    : safe
            }
        }

        if (tag === "img" && name === "src") {
            return /^https:\/\//i.test(v)
                ? `src="${escapeAttrValue(v)}" loading="lazy" decoding="async"`
                : ""
        }

        if (tag === "div" && name === "data-cta") {
            // A div only survives as a known CTA marker.
            return isBlogCtaType(v) ? `data-cta="${v}"` : ""
        }

        return undefined // default handling for the remaining allowed attributes
    },
})

/** Clean editor HTML so it is safe to store and to render. */
export function sanitizeBlogHtml(html: string): string {
    const cleaned = filter.process(String(html ?? ""))
    // A CTA marker must be empty. One with content is treated as a plain div,
    // so text inside it is shown rather than silently replaced by a card.
    return cleaned.replace(/<div data-cta="([a-z]+)">(?!<\/div>)/g, "<div>")
}

export type BlogSegment = { kind: "html"; html: string } | { kind: "cta"; cta: BlogCtaType }

/**
 * Split sanitized article HTML around its CTA markers, so the page can render
 * the HTML chunks as-is and each CTA as a React component in between.
 */
export function splitByCta(html: string): BlogSegment[] {
    const segments: BlogSegment[] = []
    const re = /<div data-cta="([a-z]+)"><\/div>/g
    let last = 0
    for (const m of html.matchAll(re)) {
        const before = html.slice(last, m.index)
        if (before.trim()) segments.push({ kind: "html", html: before })
        if (isBlogCtaType(m[1])) segments.push({ kind: "cta", cta: m[1] })
        last = m.index! + m[0].length
    }
    const rest = html.slice(last)
    if (rest.trim()) segments.push({ kind: "html", html: rest })
    return segments
}

/** URL slug from a title: lowercase ASCII words joined by hyphens. */
export function slugify(title: string): string {
    return String(title ?? "")
        .normalize("NFKD")
        .replace(/[̀-ͯ]/g, "")
        .toLowerCase()
        .replace(/&/g, " and ")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 80)
        .replace(/-+$/g, "")
}

/** Plain text of article HTML, for reading time and fallback excerpts. */
export function htmlToText(html: string): string {
    return String(html ?? "")
        .replace(/<(br|\/p|\/h[1-6]|\/li|\/blockquote)>/gi, " ")
        .replace(/<[^>]+>/g, "")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\s+/g, " ")
        .trim()
}

/** Minutes to read at 220 words a minute, at least one. */
export function readingMinutes(html: string): number {
    const words = htmlToText(html).split(" ").filter(Boolean).length
    return Math.max(1, Math.round(words / 220))
}
