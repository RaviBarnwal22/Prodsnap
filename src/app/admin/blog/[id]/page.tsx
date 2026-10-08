import { notFound, redirect } from "next/navigation"
import type { Metadata } from "next"
import { getUser, isOwner } from "@/lib/auth"
import BlogEditor from "@/components/admin/blog/BlogEditorLoader"
import { getEditorPost, getSeriesOptions } from "../editor-data"

export const dynamic = "force-dynamic"
export const metadata: Metadata = { title: "Edit article | Prodsnap Admin", robots: { index: false } }

export default async function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
    const user = await getUser()
    if (!isOwner(user)) redirect("/admin/login")
    const { id } = await params
    const [post, seriesOptions] = await Promise.all([getEditorPost(id), getSeriesOptions()])
    if (!post) notFound()
    // key forces a fresh editor when switching between articles.
    return <BlogEditor key={post.id} initial={post} seriesOptions={seriesOptions} />
}
