import { getUser } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function AICoachLayout({
  children,
}: {
  children: React.ReactNode
}) {
    const user = await getUser()

    // STRICT ADMIN CHECK: Only ravibarnwal89@gmail.com is allowed
    const isAdminEmail = user?.email === 'ravibarnwal89@gmail.com'
    if (!user || !isAdminEmail) {
        redirect('/admin/login')
    }

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 selection:bg-blue-500/30">
            {children}
        </div>
    )
}
