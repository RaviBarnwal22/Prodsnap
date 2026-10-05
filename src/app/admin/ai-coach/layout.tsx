import { getUser, isOwner } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function AICoachLayout({
  children,
}: {
  children: React.ReactNode
}) {
    const user = await getUser()

    // Owner only: stricter than role ADMIN.
    if (!isOwner(user)) {
        redirect('/admin/login')
    }

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 selection:bg-blue-500/30">
            {children}
        </div>
    )
}
