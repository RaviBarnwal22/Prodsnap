import { describe, it, expect } from "vitest"
import { sanitizeBlogHtml, splitByCta, slugify, readingMinutes, htmlToText } from "@/lib/blog/content"

describe("sanitizeBlogHtml", () => {
    it("keeps the formatting the editor produces", () => {
        const html = "<h2>Why</h2><p><strong>Bold</strong> and <em>italic</em></p><ul><li>one</li></ul><blockquote>q</blockquote>"
        expect(sanitizeBlogHtml(html)).toBe(html)
    })

    it("strips scripts, event handlers, iframes and inline styles", () => {
        const out = sanitizeBlogHtml(
            '<p onclick="steal()" style="color:red">hi</p><script>alert(1)</script><iframe src="https://x.com"></iframe><img src="https://a.com/x.png" onerror="steal()">'
        )
        expect(out).not.toMatch(/script|onclick|onerror|iframe|style=/i)
        expect(out).toContain("<p>hi</p>")
    })

    it("removes javascript: and data: links", () => {
        expect(sanitizeBlogHtml('<a href="javascript:alert(1)">x</a>')).not.toContain("javascript")
        expect(sanitizeBlogHtml('<a href="data:text/html,<script>">x</a>')).not.toContain("data:")
    })

    it("opens external links in a new tab with nofollow, but not prodsnap links", () => {
        const ext = sanitizeBlogHtml('<a href="https://openai.com">x</a>')
        expect(ext).toContain('target="_blank"')
        expect(ext).toContain('rel="noopener noreferrer nofollow"')
        const own = sanitizeBlogHtml('<a href="https://prodsnap.in/practice">x</a><a href="/mentorship">y</a>')
        expect(own).not.toContain("_blank")
    })

    it("only allows https images and lazy-loads them", () => {
        expect(sanitizeBlogHtml('<img src="http://a.com/x.png">')).not.toContain("http://")
        expect(sanitizeBlogHtml('<img src="https://a.com/x.png" alt="a">')).toContain('loading="lazy"')
    })

    it("keeps empty CTA markers, demotes a marker with content, and drops unknown ones", () => {
        expect(sanitizeBlogHtml('<div data-cta="mentorship"></div>')).toBe('<div data-cta="mentorship"></div>')
        expect(sanitizeBlogHtml('<div data-cta="mentorship">junk<b>x</b></div>')).toBe('<div>junk<b>x</b></div>')
        expect(sanitizeBlogHtml('<div data-cta="toString"></div>')).toBe("<div></div>")
        expect(sanitizeBlogHtml('<div data-cta="evil" data-x="1"></div>')).toBe("<div></div>")
    })
})

describe("sanitizeBlogHtml: bypass attempts", () => {
    it.each([
        ['<a href="java&#115;cript:alert(1)">x</a>', "entity-encoded javascript: link"],
        ['<a href="JaVaScRiPt:alert(1)">x</a>', "mixed-case javascript: link"],
        ['<a href=" javascript:alert(1)">x</a>', "javascript: link with leading space"],
        ['<a href="//evil.com">x</a>', "protocol-relative link"],
        ['<img src="x" onerror="alert(1)">', "image with error handler"],
        ['<svg onload="alert(1)"><circle/></svg>', "svg with onload"],
        ['<p style="background:url(javascript:alert(1))">a</p>', "inline style"],
        ['<div data-x="1" class="evil" id="evil">a</div>', "unknown attributes"],
        ['<!-- <script>alert(1)</script> -->', "comment hiding a script"],
    ])("neutralises %s (%s)", (input) => {
        const out = sanitizeBlogHtml(input)
        expect(out).not.toMatch(/javascript|onerror|onload|<svg|style=|data-x|class=|id=|<script|evil\.com/i)
    })

    it("drops the content of script and style tags, not just the tags", () => {
        expect(sanitizeBlogHtml("<p>a</p><style>p{color:red}</style><script>steal()</script>")).toBe("<p>a</p>")
    })
})

describe("splitByCta", () => {
    it("splits HTML around CTA markers in order", () => {
        const segs = splitByCta('<p>a</p><div data-cta="practice"></div><p>b</p><div data-cta="mentorship"></div>')
        expect(segs).toEqual([
            { kind: "html", html: "<p>a</p>" },
            { kind: "cta", cta: "practice" },
            { kind: "html", html: "<p>b</p>" },
            { kind: "cta", cta: "mentorship" },
        ])
    })

    it("returns the whole article when there are no CTAs", () => {
        expect(splitByCta("<p>a</p>")).toEqual([{ kind: "html", html: "<p>a</p>" }])
    })
})

describe("slugify", () => {
    it("makes readable URL slugs", () => {
        expect(slugify("Why AI PMs Need Evals: Part 2!")).toBe("why-ai-pms-need-evals-part-2")
        expect(slugify("  RAG & Agents  ")).toBe("rag-and-agents")
        expect(slugify("Café résumé")).toBe("cafe-resume")
        expect(slugify("!!!")).toBe("")
    })

    it("caps the length without a trailing hyphen", () => {
        const s = slugify("word ".repeat(40))
        expect(s.length).toBeLessThanOrEqual(80)
        expect(s.endsWith("-")).toBe(false)
    })
})

describe("readingMinutes", () => {
    it("is at least one minute and scales with words", () => {
        expect(readingMinutes("<p>short</p>")).toBe(1)
        expect(readingMinutes(`<p>${"word ".repeat(1100)}</p>`)).toBe(5)
    })

    it("counts words split by block tags", () => {
        expect(htmlToText("<p>one</p><p>two</p>")).toBe("one two")
    })
})
