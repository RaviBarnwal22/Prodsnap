'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'
import { AuthModal } from './AuthModal'

interface AuthContextType {
    openAuthModal: (onSuccess?: () => void) => void
    closeAuthModal: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [successCallback, setSuccessCallback] = useState<(() => void) | undefined>(undefined)

    const openAuthModal = (onSuccess?: () => void) => {
        setSuccessCallback(() => onSuccess)
        setIsModalOpen(true)
    }

    const closeAuthModal = () => {
        setIsModalOpen(false)
        setSuccessCallback(undefined)
    }

    const handleSuccess = () => {
        if (successCallback) {
            successCallback()
        }
        closeAuthModal()
    }

    return (
        <AuthContext.Provider value={{ openAuthModal, closeAuthModal }}>
            {children}
            <AuthModal isOpen={isModalOpen} onClose={closeAuthModal} onSuccess={handleSuccess} />
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
