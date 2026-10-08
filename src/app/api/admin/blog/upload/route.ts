import { NextResponse } from "next/server"
import { getUser, isOwner } from "@/lib/auth"
import { uploadBlogImage, BlogImageError } from "@/lib/blog/storage"

// Image upload for the blog editor. A route handler rather than a server
// action because server actions cap request bodies at 1 MB by default.
export async function POST(request: Request) {
    const user = await getUser()
    if (!isOwner(user)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let file: unknown
    try {
        file = (await request.formData()).get("file")
    } catch {
        return NextResponse.json({ error: "Send the image as form data." }, { status: 400 })
    }
    if (!(file instanceof File)) {
        return NextResponse.json({ error: "No image received." }, { status: 400 })
    }

    try {
        const url = await uploadBlogImage(file)
        return NextResponse.json({ url })
    } catch (e) {
        if (e instanceof BlogImageError) {
            return NextResponse.json({ error: e.message }, { status: 400 })
        }
        console.error("[blog upload]", e)
        return NextResponse.json({ error: "Upload failed. Try again." }, { status: 500 })
    }
}
