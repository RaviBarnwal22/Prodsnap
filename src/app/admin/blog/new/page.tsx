import { redirect } from "next/navigation"
import type { Metadata } from "next"
import { getUser, isOwner } from "@/lib/auth"
import BlogEditor from "@/components/admin/blog/BlogEditorLoader"
import { getSeriesOptions, EMPTY_POST } from "../editor-data"

export const dynamic = "force-dynamic"
export const metadata: Metadata = { title: "New article | Prodsnap Admin", robots: { index: false } }

export default async function NewBlogPostPage() {
    const user = await getUser()
    if (!isOwner(user)) redirect("/admin/login")
    return <BlogEditor initial={EMPTY_POST} seriesOptions={await getSeriesOptions()} />
}
