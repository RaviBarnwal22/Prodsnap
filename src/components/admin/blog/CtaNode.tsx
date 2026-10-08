'use client'

import { Node, mergeAttributes } from "@tiptap/core"
import { NodeViewWrapper, ReactNodeViewRenderer, type ReactNodeViewProps } from "@tiptap/react"
import { BLOG_CTAS, isBlogCtaType, type BlogCtaType } from "@/lib/blog/cta"
import { Megaphone, X } from "lucide-react"

declare module "@tiptap/core" {
    interface Commands<ReturnType> {
        ctaBlock: {
            insertCta: (cta: BlogCtaType) => ReturnType
        }
    }
}

function CtaView({ node, deleteNode, selected }: ReactNodeViewProps) {
    const type = node.attrs.cta as string
    const cta = isBlogCtaType(type) ? BLOG_CTAS[type] : null
    return (
        <NodeViewWrapper
            contentEditable={false}
            className={`my-6 rounded-2xl border-2 border-dashed p-4 flex items-start gap-3 ${selected ? "border-violet-500 bg-violet-50" : "border-violet-300 bg-violet-50/50"}`}
            data-drag-handle
        >
            <Megaphone size={18} className="text-violet-600 mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
                <p className="text-[11px] font-black uppercase tracking-widest text-violet-600">Call to action · {cta?.label ?? "Unknown"}</p>
                <p className="text-sm font-bold text-gray-900">{cta?.title}</p>
                <p className="text-xs text-gray-500">Button: {cta?.button} → {cta?.href}</p>
            </div>
            <button type="button" onClick={deleteNode} className="p-1 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50" aria-label="Remove call to action">
                <X size={16} />
            </button>
        </NodeViewWrapper>
    )
}

/** A block-level CTA marker, stored as <div data-cta="type"></div>. */
export const CtaBlock = Node.create({
    name: "ctaBlock",
    group: "block",
    atom: true,
    draggable: true,
    selectable: true,

    addAttributes() {
        return {
            cta: {
                default: "practice",
                parseHTML: (el) => el.getAttribute("data-cta"),
                renderHTML: (attrs) => ({ "data-cta": attrs.cta }),
            },
        }
    },

    parseHTML() {
        return [{ tag: "div[data-cta]" }]
    },

    renderHTML({ HTMLAttributes }) {
        return ["div", mergeAttributes(HTMLAttributes)]
    },

    addNodeView() {
        return ReactNodeViewRenderer(CtaView)
    },

    addCommands() {
        return {
            insertCta:
                (cta) =>
                ({ commands }) =>
                    commands.insertContent({ type: this.name, attrs: { cta } }),
        }
    },
})
