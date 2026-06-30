'use client'

import { useState, useEffect } from 'react'
import { SessionHeader } from './SessionHeader'
import { MissionCard } from './MissionCard'
import { SidePanel } from './SidePanel'
import { ChatWindow } from './ChatWindow'
import { getCoachState, sendMessage } from '@/app/admin/ai-coach/actions'
import { CoachState, CoachMessage } from '@/lib/ai-coach/types'
import { Loader2 } from 'lucide-react'

export function CoachInterface() {
    const [state, setState] = useState<CoachState | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSending, setIsSending] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function loadState() {
            try {
                const data = await getCoachState()
                setState(data)
            } catch (err: any) {
                setError(err.message)
            } finally {
                setIsLoading(false)
            }
        }
        loadState()
    }, [])

    const handleSendMessage = async (text: string) => {
        if (!state) return

        setIsSending(true)
        
        // Optimistically add user message
        const optimisticUserMessage: CoachMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: text,
            timestamp: new Date().toISOString()
        }
        
        setState(prev => prev ? {
            ...prev,
            messages: [...prev.messages, optimisticUserMessage]
        } : null)

        try {
            const responseMessage = await sendMessage(text)
            setState(prev => prev ? {
                ...prev,
                messages: [...prev.messages, responseMessage]
            } : null)
        } catch (err: any) {
            console.error("Failed to send message:", err)
            // Ideally we'd show a toast here
        } finally {
            setIsSending(false)
        }
    }

    const handleMissionAction = (actionType: 'learn' | 'interview') => {
        if (actionType === 'learn') {
            handleSendMessage("I'm ready to start today's mission. Please begin the lesson.")
        } else {
            handleSendMessage("Let's do a mock interview. Please ask me an interview question related to my current topic.")
        }
    }

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <Loader2 size={40} className="animate-spin text-indigo-500" />
            </div>
        )
    }

    if (error || !state) {
        return (
            <div className="flex-1 flex items-center justify-center flex-col gap-4">
                <div className="text-red-400 font-bold">Error loading AI Coach</div>
                <div className="text-gray-400">{error}</div>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-screen w-full bg-black">
            <SessionHeader 
                streak={state.learningState.streak} 
                masteryScore={state.learningState.masteryScore} 
                lastSessionDate={state.learningState.lastSessionDate} 
            />
            
            <div className="flex-1 flex overflow-hidden">
                {/* Main Content Area */}
                <div className="flex-1 flex flex-col p-6 min-w-0">
                    <MissionCard 
                        objective={state.learningState.todayObjective}
                        timeEstimate={state.learningState.todayTimeEstimate}
                        topic={state.learningState.currentTopic}
                        onAction={handleMissionAction}
                    />
                    
                    <div className="flex-1 min-h-0">
                        <ChatWindow 
                            messages={state.messages} 
                            onSendMessage={handleSendMessage} 
                            isLoading={isSending} 
                        />
                    </div>
                </div>

                {/* Right Panel */}
                <SidePanel 
                    currentTopic={state.learningState.currentTopic}
                    weakConcepts={state.learningState.weakConcepts}
                    interviewReadiness={state.learningState.interviewReadiness}
                />
            </div>
        </div>
    )
}
