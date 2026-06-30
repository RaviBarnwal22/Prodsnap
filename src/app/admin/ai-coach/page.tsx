import { CoachInterface } from "@/components/admin/ai-coach/CoachInterface"

export const metadata = {
  title: 'AI PM Coach | Prodsnap Admin',
  description: 'Admin-only AI Product Management mentor',
}

export default function AICoachPage() {
    return (
        <main className="h-screen w-full flex flex-col overflow-hidden">
            <CoachInterface />
        </main>
    )
}
