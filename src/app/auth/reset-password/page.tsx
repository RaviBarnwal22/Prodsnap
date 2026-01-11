'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Lock, Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ResetPasswordPage() {
    const [isLoading, setIsLoading] = useState(false)
    const [message, setMessage] = useState("")
    const [error, setError] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const supabase = createClient()
    const router = useRouter()

    const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")
        setMessage("")

        const formData = new FormData(e.currentTarget)
        const password = formData.get("password") as string
        const confirmPassword = formData.get("confirmPassword") as string

        if (password !== confirmPassword) {
            setError("Passwords don't match")
            setIsLoading(false)
            return
        }

        const { error } = await supabase.auth.updateUser({
            password: password
        })

        setIsLoading(false)

        if (error) {
            setError(error.message)
        } else {
            setMessage("Password updated successfully!")
            setTimeout(() => {
                router.push('/practice')
            }, 2000)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 px-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-block">
                        <h1 className="text-3xl font-bold">
                            Prod<span className="text-blue-600">snap</span>
                        </h1>
                    </Link>
                    <p className="text-gray-500 mt-2 text-sm">
                        Set your new password
                    </p>
                </div>

                {/* Card */}
                <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800">

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm p-3 rounded-lg mb-4 text-center">
                            {error}
                        </div>
                    )}

                    {/* Success Message */}
                    {message ? (
                        <div className="text-center py-8">
                            <CheckCircle className="mx-auto text-green-500 mb-4" size={48} />
                            <h2 className="text-xl font-semibold mb-2">Password Updated!</h2>
                            <p className="text-gray-500 text-sm">Redirecting you to the app...</p>
                        </div>
                    ) : (
                        <form onSubmit={handleResetPassword} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1.5">New Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        required
                                        minLength={6}
                                        className="w-full border rounded-lg pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                        placeholder="Min 6 characters"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Confirm Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="confirmPassword"
                                        required
                                        minLength={6}
                                        className="w-full border rounded-lg pl-10 pr-3 py-2.5 bg-gray-50 dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                        placeholder="Re-enter password"
                                    />
                                </div>
                            </div>
                            <button
                                disabled={isLoading}
                                className="w-full bg-blue-600 text-white rounded-lg py-3 font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isLoading ? (
                                    <Loader2 className="animate-spin" size={20} />
                                ) : (
                                    "Update Password"
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}
