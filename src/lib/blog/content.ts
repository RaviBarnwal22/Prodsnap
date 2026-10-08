import DOMPurify from "isomorphic-dompurify"
import { isBlogCtaType, type BlogCtaType } from "./cta"

// Everything the editor can produce, and nothing else. Anything outside this
// list (script, iframe, style, event handlers, inline styles) is stripped.
const ALLOWED_TAGS = [
    "p", "br", "hr", "h2", "h3", "strong", "b", "em", "i", "u", "s",
    "a", "ul", "ol", "li", "blockquote", "code", "pre", "img", "div",
]
const ALLOWED_ATTR = ["href", "src", "alt", "title", "data-cta"]

let hooksInstalled = false

function installHooks() {
    if (hooksInstalled) return
    hooksInstalled = true

    DOMPurify.addHook("afterSanitizeAttributes", (node) => {
        const el = node as Element
        const tag = el.tagName?.toLowerCase()

        if (tag === "a") {
            const href = el.getAttribute("href") ?? ""
            if (!/^(https?:|mailto:|\/(?!\/)|#)/i.test(href)) {
                el.removeAttribute("href")
            } else if (/^https?:/i.test(href) && !/^https?:\/\/(www\.)?prodsnap\.in(\/|$)/i.test(href)) {
                // External links open in a new tab and pass no ranking credit.
                el.setAttribute("target", "_blank")
                el.setAttribute("rel", "noopener noreferrer nofollow")
            }
        }

        if (tag === "img") {
            const src = el.getAttribute("src") ?? ""
            if (!/^https:\/\//i.test(src)) el.removeAttribute("src")
            el.setAttribute("loading", "lazy")
            el.setAttribute("decoding", "async")
        }

        if (tag === "div") {
            // A div only survives as a known CTA marker, and it carries nothing else.
            const cta = el.getAttribute("data-cta")
            if (!isBlogCtaType(cta)) {
                el.removeAttribute("data-cta")
            } else {
                el.textContent = ""
            }
        }
    })
}

/** Clean editor HTML so it is safe to store and to render. */
export function sanitizeBlogHtml(html: string): string {
    installHooks()
    return DOMPurify.sanitize(String(html ?? ""), {
        ALLOWED_TAGS,
        ALLOWED_ATTR: [...ALLOWED_ATTR, "target", "rel", "loading", "decoding"],
        ALLOW_DATA_ATTR: false,
    })
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
