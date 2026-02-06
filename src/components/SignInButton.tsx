'use client'

import React from 'react'
import { useAuth } from './AuthContext'

interface SignInButtonProps {
    className?: string
    children?: React.ReactNode
    onClick?: () => void
}

export function SignInButton({ className, children, onClick }: SignInButtonProps) {
    const { openAuthModal } = useAuth()

    const handleClick = () => {
        if (onClick) onClick()
        openAuthModal()
    }

    return (
        <button
            onClick={handleClick}
            className={className || "bg-violet-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-violet-700 transition"}
        >
            {children || "Sign In"}
        </button>
    )
}
