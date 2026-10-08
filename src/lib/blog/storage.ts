import { createClient } from "@supabase/supabase-js"
import { randomUUID } from "node:crypto"

// Server-only. Uses the Supabase service role key, which bypasses every
// permission in the project, so it must never be imported by client code and
// never be given a NEXT_PUBLIC_ prefix.
export const BLOG_BUCKET = "blog-images"
export const MAX_IMAGE_BYTES = 4 * 1024 * 1024 // Vercel caps request bodies at 4.5 MB

// Identify the format from the file's first bytes, not the browser-supplied
// type, which the uploader controls. SVG is excluded: it can carry script.
function sniffImage(bytes: Uint8Array): { ext: string; mime: string } | null {
    const b = bytes
    if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return { ext: "jpg", mime: "image/jpeg" }
    if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return { ext: "png", mime: "image/png" }
    if (b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x38) return { ext: "gif", mime: "image/gif" }
    if (
        b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
        b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50
    ) return { ext: "webp", mime: "image/webp" }
    return null
}

export class BlogImageError extends Error {}

export async function uploadBlogImage(file: File): Promise<string> {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !serviceKey) {
        throw new BlogImageError("Image upload isn't set up yet: SUPABASE_SERVICE_ROLE_KEY is missing.")
    }
    if (file.size === 0) throw new BlogImageError("That file is empty.")
    if (file.size > MAX_IMAGE_BYTES) throw new BlogImageError("Images must be 4 MB or smaller.")

    const bytes = new Uint8Array(await file.arrayBuffer())
    const kind = sniffImage(bytes)
    if (!kind) throw new BlogImageError("Only JPG, PNG, WebP and GIF images are allowed.")

    const supabase = createClient(url, serviceKey, { auth: { persistSession: false } })

    // Create the public bucket on first use, so there is no manual setup step.
    const { error: bucketError } = await supabase.storage.getBucket(BLOG_BUCKET)
    if (bucketError) {
        const { error } = await supabase.storage.createBucket(BLOG_BUCKET, {
            public: true,
            fileSizeLimit: MAX_IMAGE_BYTES,
            allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
        })
        if (error && !/already exists/i.test(error.message)) {
            throw new BlogImageError(`Couldn't create the image bucket: ${error.message}`)
        }
    }

    const now = new Date()
    const path = `${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, "0")}/${randomUUID()}.${kind.ext}`
    const { error } = await supabase.storage.from(BLOG_BUCKET).upload(path, bytes, {
        contentType: kind.mime,
        cacheControl: "31536000",
        upsert: false,
    })
    if (error) throw new BlogImageError(`Upload failed: ${error.message}`)

    return supabase.storage.from(BLOG_BUCKET).getPublicUrl(path).data.publicUrl
}
