'use client'

import { useCallback, useEffect, useRef, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useEditor, EditorContent, type Editor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Image from "@tiptap/extension-image"
import Placeholder from "@tiptap/extension-placeholder"
import {
    Bold, Italic, Underline as UnderlineIcon, Strikethrough, Heading2, Heading3, List, ListOrdered,
    Quote, Code, Link2, ImagePlus, Minus, Undo2, Redo2, Megaphone, Loader2, Eye, Trash2,
    Copy, Check, ArrowLeft, Upload, X,
} from "lucide-react"
import { CtaBlock } from "./CtaNode"
import { BLOG_CTAS, BLOG_CTA_TYPES } from "@/lib/blog/cta"
import { slugify } from "@/lib/blog/content"
import { saveBlogPost, setBlogPostPublished, deleteBlogPost } from "@/app/admin/blog/actions"

export type EditorPost = {
    id: string | null
    title: string
    slug: string
    excerpt: string
    coverImage: string | null
    contentHtml: string
    seriesName: string | null
    seriesPart: number | null
    tags: string[]
    status: "DRAFT" | "PUBLISHED"
}

const SITE = "https://prodsnap.in"

async function uploadImage(file: File): Promise<string> {
    const body = new FormData()
    body.append("file", file)
    const res = await fetch("/api/admin/blog/upload", { method: "POST", body })
    const data = await res.json().catch(() => ({}))
    if (!res.ok || !data.url) throw new Error(data.error || "Upload failed")
    return data.url as string
}

function ToolbarButton({ onClick, active, disabled, label, children }: {
    onClick: () => void; active?: boolean; disabled?: boolean; label: string; children: React.ReactNode
}) {
    return (
        <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={onClick}
            disabled={disabled}
            title={label}
            aria-label={label}
            className={`p-2 rounded-lg transition ${active ? "bg-violet-100 text-violet-700" : "text-gray-600 hover:bg-gray-100"} disabled:opacity-30`}
        >
            {children}
        </button>
    )
}

function Toolbar({ editor, onImage, uploading }: { editor: Editor; onImage: () => void; uploading: boolean }) {
    const [ctaOpen, setCtaOpen] = useState(false)

    const setLink = () => {
        const prev = editor.getAttributes("link").href as string | undefined
        const url = window.prompt("Link URL (leave empty to remove)", prev ?? "https://")
        if (url === null) return
        if (!url.trim() || url.trim() === "https://") {
            editor.chain().focus().extendMarkRange("link").unsetLink().run()
            return
        }
        editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run()
    }

    return (
        <div className="sticky top-16 z-20 flex flex-wrap items-center gap-0.5 border-b border-gray-200 bg-white/95 backdrop-blur px-2 py-1.5">
            <ToolbarButton label="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}><Bold size={16} /></ToolbarButton>
            <ToolbarButton label="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic size={16} /></ToolbarButton>
            <ToolbarButton label="Underline" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}><UnderlineIcon size={16} /></ToolbarButton>
            <ToolbarButton label="Strikethrough" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}><Strikethrough size={16} /></ToolbarButton>
            <span className="w-px h-6 bg-gray-200 mx-1" />
            <ToolbarButton label="Heading" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><Heading2 size={16} /></ToolbarButton>
            <ToolbarButton label="Subheading" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}><Heading3 size={16} /></ToolbarButton>
            <ToolbarButton label="Bulleted list" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}><List size={16} /></ToolbarButton>
            <ToolbarButton label="Numbered list" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered size={16} /></ToolbarButton>
            <ToolbarButton label="Quote" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}><Quote size={16} /></ToolbarButton>
            <ToolbarButton label="Code" active={editor.isActive("codeBlock")} onClick={() => editor.chain().focus().toggleCodeBlock().run()}><Code size={16} /></ToolbarButton>
            <span className="w-px h-6 bg-gray-200 mx-1" />
            <ToolbarButton label="Link" active={editor.isActive("link")} onClick={setLink}><Link2 size={16} /></ToolbarButton>
            <ToolbarButton label="Insert image" disabled={uploading} onClick={onImage}>
                {uploading ? <Loader2 size={16} className="animate-spin" /> : <ImagePlus size={16} />}
            </ToolbarButton>
            <ToolbarButton label="Divider" onClick={() => editor.chain().focus().setHorizontalRule().run()}><Minus size={16} /></ToolbarButton>
            <span className="w-px h-6 bg-gray-200 mx-1" />
            <div className="relative">
                <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => setCtaOpen((o) => !o)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold text-violet-700 bg-violet-50 hover:bg-violet-100"
                >
                    <Megaphone size={15} /> Call to action
                </button>
                {ctaOpen && (
                    <div className="absolute left-0 top-full mt-1 w-72 rounded-xl border border-gray-200 bg-white shadow-xl p-1 z-30">
                        {BLOG_CTA_TYPES.map((t) => (
                            <button
                                key={t}
                                type="button"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => { editor.chain().focus().insertCta(t).run(); setCtaOpen(false) }}
                                className="w-full text-left px-3 py-2 rounded-lg hover:bg-violet-50"
                            >
                                <p className="text-sm font-bold text-gray-900">{BLOG_CTAS[t].label}</p>
                                <p className="text-xs text-gray-500 line-clamp-1">{BLOG_CTAS[t].title}</p>
                            </button>
                        ))}
                    </div>
                )}
            </div>
            <span className="flex-1" />
            <ToolbarButton label="Undo" disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()}><Undo2 size={16} /></ToolbarButton>
            <ToolbarButton label="Redo" disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()}><Redo2 size={16} /></ToolbarButton>
        </div>
    )
}

export default function BlogEditor({ initial, seriesOptions }: { initial: EditorPost; seriesOptions: string[] }) {
    const router = useRouter()
    const [post, setPost] = useState<EditorPost>(initial)
    const [slugTouched, setSlugTouched] = useState(Boolean(initial.id))
    const [dirty, setDirty] = useState(false)
    const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null)
    const [pending, startTransition] = useTransition()
    const [uploading, setUploading] = useState<"body" | "cover" | null>(null)
    const [copied, setCopied] = useState<string | null>(null)
    const [tagDraft, setTagDraft] = useState("")
    const bodyInput = useRef<HTMLInputElement>(null)
    const coverInput = useRef<HTMLInputElement>(null)

    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({
                heading: { levels: [2, 3] },
                link: { openOnClick: false, autolink: true, HTMLAttributes: { rel: null, target: null } },
            }),
            Image.configure({ HTMLAttributes: { class: "rounded-xl" } }),
            Placeholder.configure({ placeholder: "Write your article… Use the toolbar for headings, images and calls to action." }),
            CtaBlock,
        ],
        content: initial.contentHtml || "",
        editorProps: {
            attributes: { class: "blog-prose min-h-[50vh] px-1 py-6 focus:outline-none" },
        },
        onUpdate: ({ editor }) => {
            setPost((p) => ({ ...p, contentHtml: editor.getHTML() }))
            setDirty(true)
        },
    })

    const update = <K extends keyof EditorPost>(key: K, value: EditorPost[K]) => {
        setPost((p) => ({ ...p, [key]: value }))
        setDirty(true)
    }

    // Warn before leaving with unsaved changes.
    useEffect(() => {
        if (!dirty) return
        const warn = (e: BeforeUnloadEvent) => { e.preventDefault() }
        window.addEventListener("beforeunload", warn)
        return () => window.removeEventListener("beforeunload", warn)
    }, [dirty])

    const save = useCallback((then?: (id: string) => Promise<void>) => {
        setMessage(null)
        startTransition(async () => {
            try {
                const res = await saveBlogPost(post.id, {
                    title: post.title,
                    slug: post.slug,
                    excerpt: post.excerpt,
                    coverImage: post.coverImage,
                    contentHtml: editor?.getHTML() ?? post.contentHtml,
                    seriesName: post.seriesName,
                    seriesPart: post.seriesPart,
                    tags: post.tags,
                })
                if (!res.ok) { setMessage({ kind: "error", text: res.error }); return }
                setPost((p) => ({ ...p, id: res.id, slug: res.slug }))
                setDirty(false)
                if (then) await then(res.id)
                else setMessage({ kind: "ok", text: post.status === "PUBLISHED" ? "Saved. The live article is updated." : "Draft saved." })
                if (!post.id) router.replace(`/admin/blog/${res.id}`)
            } catch {
                setMessage({ kind: "error", text: "Couldn't save. Check you're still signed in and try again." })
            }
        })
    }, [post, editor, router])

    // Ctrl/Cmd + S saves.
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") { e.preventDefault(); save() }
        }
        window.addEventListener("keydown", onKey)
        return () => window.removeEventListener("keydown", onKey)
    }, [save])

    const publish = (published: boolean) =>
        save(async (id) => {
            const res = await setBlogPostPublished(id, published)
            if (!res.ok) { setMessage({ kind: "error", text: res.error }); return }
            setPost((p) => ({ ...p, status: published ? "PUBLISHED" : "DRAFT" }))
            setMessage({ kind: "ok", text: published ? "Published. It's live on the blog." : "Unpublished. It's a draft again." })
            router.refresh()
        })

    const remove = () => {
        if (!post.id) { router.push("/admin/blog"); return }
        if (!window.confirm(`Delete "${post.title || "Untitled"}" permanently? This can't be undone.`)) return
        startTransition(async () => {
            const res = await deleteBlogPost(post.id!)
            if (!res.ok) { setMessage({ kind: "error", text: res.error ?? "Couldn't delete." }); return }
            setDirty(false)
            router.push("/admin/blog")
        })
    }

    const onPickImage = async (file: File | undefined, target: "body" | "cover") => {
        if (!file) return
        setUploading(target)
        setMessage(null)
        try {
            const url = await uploadImage(file)
            if (target === "cover") update("coverImage", url)
            else editor?.chain().focus().setImage({ src: url, alt: post.title || "" }).run()
        } catch (e) {
            setMessage({ kind: "error", text: e instanceof Error ? e.message : "Upload failed" })
        } finally {
            setUploading(null)
        }
    }

    const liveUrl = `${SITE}/blog/${post.slug}`
    const campaign = slugify(post.seriesName || post.slug) || "blog"
    const linkedinUrl = `${liveUrl}?utm_source=linkedin&utm_medium=social&utm_campaign=${campaign}`

    const copy = async (text: string, key: string) => {
        try {
            await navigator.clipboard.writeText(text)
            setCopied(key)
            setTimeout(() => setCopied(null), 2000)
        } catch {
            window.prompt("Copy this:", text)
        }
    }

    const addTag = () => {
        const t = tagDraft.trim().toLowerCase()
        if (t && !post.tags.includes(t) && post.tags.length < 8) update("tags", [...post.tags, t])
        setTagDraft("")
    }

    const isPublished = post.status === "PUBLISHED"

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top bar */}
            <div className="sticky top-0 z-30 h-16 bg-white border-b border-gray-200">
                <div className="max-w-6xl mx-auto h-full px-4 flex items-center gap-3">
                    <Link href="/admin/blog" className="flex items-center gap-1.5 text-sm font-bold text-gray-500 hover:text-gray-900">
                        <ArrowLeft size={16} /> Articles
                    </Link>
                    <span className={`text-[11px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${isPublished ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                        {isPublished ? "Published" : "Draft"}
                    </span>
                    {dirty && <span className="text-xs text-amber-600 font-semibold">Unsaved changes</span>}
                    <span className="flex-1" />
                    {post.id && (
                        <Link href={`/admin/blog/${post.id}/preview`} target="_blank" className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-100">
                            <Eye size={15} /> Preview
                        </Link>
                    )}
                    <button type="button" onClick={() => save()} disabled={pending} className="px-4 py-2 rounded-lg text-sm font-bold border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                        {isPublished ? "Update" : "Save draft"}
                    </button>
                    <button
                        type="button"
                        onClick={() => publish(!isPublished)}
                        disabled={pending}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold text-white disabled:opacity-50 ${isPublished ? "bg-gray-700 hover:bg-gray-800" : "bg-violet-600 hover:bg-violet-700"}`}
                    >
                        {pending && <Loader2 size={14} className="animate-spin" />}
                        {isPublished ? "Unpublish" : "Publish"}
                    </button>
                </div>
            </div>

            {message && (
                <div className={`max-w-6xl mx-auto mt-4 px-4`}>
                    <div className={`rounded-xl px-4 py-3 text-sm font-semibold flex items-center justify-between ${message.kind === "ok" ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700"}`}>
                        {message.text}
                        <button type="button" onClick={() => setMessage(null)} aria-label="Dismiss"><X size={14} /></button>
                    </div>
                </div>
            )}

            <div className="max-w-6xl mx-auto px-4 py-6 grid lg:grid-cols-[1fr_320px] gap-6">
                {/* Writing area */}
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                    {/* Cover */}
                    {post.coverImage ? (
                        <div className="relative group">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={post.coverImage} alt="" className="w-full aspect-[1200/630] object-cover" />
                            <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition">
                                <button type="button" onClick={() => coverInput.current?.click()} className="px-3 py-1.5 rounded-lg bg-white/90 text-sm font-bold">Change</button>
                                <button type="button" onClick={() => update("coverImage", null)} className="px-3 py-1.5 rounded-lg bg-white/90 text-sm font-bold text-red-600">Remove</button>
                            </div>
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={() => coverInput.current?.click()}
                            disabled={uploading === "cover"}
                            className="w-full aspect-[1200/400] bg-gray-50 border-b border-dashed border-gray-300 flex flex-col items-center justify-center gap-2 text-gray-500 hover:bg-violet-50 hover:text-violet-700 transition"
                        >
                            {uploading === "cover" ? <Loader2 className="animate-spin" /> : <Upload />}
                            <span className="text-sm font-bold">Add a cover image</span>
                            <span className="text-xs">1200 × 630 works best. It&apos;s also the preview image on LinkedIn.</span>
                        </button>
                    )}
                    <input ref={coverInput} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={(e) => { onPickImage(e.target.files?.[0], "cover"); e.target.value = "" }} />

                    <div className="px-6 md:px-10 pt-8">
                        <textarea
                            value={post.title}
                            onChange={(e) => {
                                const title = e.target.value.replace(/\n/g, " ")
                                setPost((p) => ({ ...p, title, slug: slugTouched ? p.slug : slugify(title) }))
                                setDirty(true)
                            }}
                            placeholder="Headline"
                            rows={1}
                            maxLength={160}
                            className="w-full resize-none text-3xl md:text-4xl font-black tracking-tight text-gray-900 placeholder:text-gray-300 focus:outline-none [field-sizing:content]"
                        />
                    </div>

                    {editor ? (
                        <>
                            <Toolbar editor={editor} onImage={() => bodyInput.current?.click()} uploading={uploading === "body"} />
                            <div className="px-6 md:px-10">
                                <EditorContent editor={editor} />
                            </div>
                        </>
                    ) : (
                        <div className="h-64 flex items-center justify-center text-gray-400"><Loader2 className="animate-spin" /></div>
                    )}
                    <input ref={bodyInput} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={(e) => { onPickImage(e.target.files?.[0], "body"); e.target.value = "" }} />
                </div>

                {/* Settings */}
                <aside className="space-y-4">
                    <section className="bg-white rounded-2xl border border-gray-200 p-4 space-y-3">
                        <h2 className="text-xs font-black uppercase tracking-widest text-gray-400">Article settings</h2>
                        <label className="block">
                            <span className="text-xs font-bold text-gray-600">URL</span>
                            <div className="mt-1 flex items-center rounded-lg border border-gray-300 focus-within:border-violet-500 overflow-hidden">
                                <span className="pl-2 text-xs text-gray-400">/blog/</span>
                                <input
                                    value={post.slug}
                                    onChange={(e) => { setSlugTouched(true); update("slug", slugify(e.target.value) || e.target.value.toLowerCase()) }}
                                    className="flex-1 min-w-0 px-1 py-2 text-sm focus:outline-none"
                                />
                            </div>
                            {isPublished && <span className="text-[11px] text-amber-600">Changing the URL of a live article breaks links you already shared.</span>}
                        </label>
                        <label className="block">
                            <span className="text-xs font-bold text-gray-600">Summary</span>
                            <textarea
                                value={post.excerpt}
                                onChange={(e) => update("excerpt", e.target.value)}
                                maxLength={300}
                                rows={3}
                                placeholder="One or two sentences. Shown on the blog card, in Google and in the LinkedIn preview."
                                className="mt-1 w-full rounded-lg border border-gray-300 px-2 py-2 text-sm focus:outline-none focus:border-violet-500"
                            />
                            <span className="text-[11px] text-gray-400">{post.excerpt.length}/300 · left empty, the first lines are used</span>
                        </label>
                        <div className="grid grid-cols-[1fr_72px] gap-2">
                            <label className="block">
                                <span className="text-xs font-bold text-gray-600">Series</span>
                                <input
                                    value={post.seriesName ?? ""}
                                    onChange={(e) => update("seriesName", e.target.value || null)}
                                    list="blog-series"
                                    placeholder="e.g. AI for PMs"
                                    maxLength={80}
                                    className="mt-1 w-full rounded-lg border border-gray-300 px-2 py-2 text-sm focus:outline-none focus:border-violet-500"
                                />
                                <datalist id="blog-series">{seriesOptions.map((s) => <option key={s} value={s} />)}</datalist>
                            </label>
                            <label className="block">
                                <span className="text-xs font-bold text-gray-600">Part</span>
                                <input
                                    type="number"
                                    min={1}
                                    value={post.seriesPart ?? ""}
                                    onChange={(e) => update("seriesPart", e.target.value ? Number(e.target.value) : null)}
                                    disabled={!post.seriesName}
                                    className="mt-1 w-full rounded-lg border border-gray-300 px-2 py-2 text-sm focus:outline-none focus:border-violet-500 disabled:bg-gray-50"
                                />
                            </label>
                        </div>
                        <div>
                            <span className="text-xs font-bold text-gray-600">Tags</span>
                            <div className="mt-1 flex flex-wrap gap-1.5">
                                {post.tags.map((t) => (
                                    <span key={t} className="flex items-center gap-1 rounded-full bg-violet-50 text-violet-700 text-xs font-bold pl-2 pr-1 py-0.5">
                                        {t}
                                        <button type="button" onClick={() => update("tags", post.tags.filter((x) => x !== t))} aria-label={`Remove ${t}`}><X size={12} /></button>
                                    </span>
                                ))}
                            </div>
                            <input
                                value={tagDraft}
                                onChange={(e) => setTagDraft(e.target.value)}
                                onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag() } }}
                                onBlur={addTag}
                                placeholder="Add a tag, press Enter"
                                className="mt-1.5 w-full rounded-lg border border-gray-300 px-2 py-2 text-sm focus:outline-none focus:border-violet-500"
                            />
                        </div>
                    </section>

                    <section className="bg-white rounded-2xl border border-gray-200 p-4 space-y-2">
                        <h2 className="text-xs font-black uppercase tracking-widest text-gray-400">Share on LinkedIn</h2>
                        {isPublished ? (
                            <>
                                <p className="text-xs text-gray-500">Use this link in your LinkedIn post or newsletter. It&apos;s tagged so the admin can show how many readers came from LinkedIn.</p>
                                <button type="button" onClick={() => copy(linkedinUrl, "link")} className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#0a66c2] text-white text-sm font-bold py-2 hover:bg-[#004182]">
                                    {copied === "link" ? <Check size={15} /> : <Copy size={15} />} {copied === "link" ? "Copied" : "Copy LinkedIn link"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => copy(`${post.title}\n\n${post.excerpt}\n\nRead the full article: ${linkedinUrl}`, "teaser")}
                                    className="w-full flex items-center justify-center gap-2 rounded-lg border border-gray-300 text-sm font-bold py-2 text-gray-700 hover:bg-gray-50"
                                >
                                    {copied === "teaser" ? <Check size={15} /> : <Copy size={15} />} {copied === "teaser" ? "Copied" : "Copy teaser text"}
                                </button>
                                <a href={liveUrl} target="_blank" rel="noopener" className="block text-center text-xs font-bold text-violet-600 hover:underline">Open the live article</a>
                            </>
                        ) : (
                            <p className="text-xs text-gray-500">Publish first. You&apos;ll then get a tracked link to paste into LinkedIn.</p>
                        )}
                    </section>

                    <button type="button" onClick={remove} disabled={pending} className="w-full flex items-center justify-center gap-2 rounded-lg text-sm font-bold py-2 text-red-600 hover:bg-red-50">
                        <Trash2 size={15} /> Delete article
                    </button>
                </aside>
            </div>
        </div>
    )
}
