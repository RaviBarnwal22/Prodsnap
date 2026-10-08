'use client'

import dynamic from "next/dynamic"
import { Loader2 } from "lucide-react"
import type { EditorPost } from "./BlogEditor"

// The rich-text editor is heavy and admin-only, so it loads on demand. It
// wraps nothing, so ssr: false here cannot affect any public page's rendering.
const BlogEditor = dynamic(() => import("./BlogEditor"), {
    ssr: false,
    loading: () => (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-400">
            <Loader2 className="animate-spin" />
        </div>
    ),
})

export default function BlogEditorLoader(props: { initial: EditorPost; seriesOptions: string[] }) {
    return <BlogEditor {...props} />
}
