'use client'

import { useState, useEffect } from 'react'
import { SessionHeader } from './SessionHeader'
import { MissionCard } from './MissionCard'
import { SidePanel } from './SidePanel'
import { ChatWindow } from './ChatWindow'
import { getCoachState, sendMessage, addToRevisionDeck, removeFromRevisionDeck } from '@/app/admin/ai-coach/actions'
import { CoachState, CoachMessage, RevisionCard } from '@/lib/ai-coach/types'
import { Loader2 } from 'lucide-react'

const REVISION_TRIGGERS = ['add it to revision deck', 'add to revision deck', 'save to revision deck', 'add this to revision deck']

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

        // Check if the user wants to save to revision deck
        const lowerText = text.toLowerCase().trim()
        const isRevisionCommand = REVISION_TRIGGERS.some(trigger => lowerText.includes(trigger))

        if (isRevisionCommand) {
            await handleAddToRevisionDeck(text)
            return
        }

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
        } finally {
            setIsSending(false)
        }
    }

    const handleAddToRevisionDeck = async (userText: string) => {
        if (!state) return
        setIsSending(true)

        // Show user's message in chat
        const userMsg: CoachMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: userText,
            timestamp: new Date().toISOString()
        }
        setState(prev => prev ? { ...prev, messages: [...prev.messages, userMsg] } : null)

        try {
            // Get the last assistant message to summarize
            const lastAssistantMsg = [...state.messages].reverse().find(m => m.role === 'assistant')
            const lastUserMsg = [...state.messages].reverse().find(m => m.role === 'user')

            if (!lastAssistantMsg) {
                const errMsg: CoachMessage = {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    content: "There's nothing to add yet — we haven't discussed a concept. Start a lesson first, then ask me to add it to your revision deck.",
                    timestamp: new Date().toISOString()
                }
                setState(prev => prev ? { ...prev, messages: [...prev.messages, errMsg] } : null)
                return
            }

            // Extract concept name from last user message and context from last assistant message
            const conceptRaw = lastUserMsg?.content?.substring(0, 60) || 'Unknown Concept'
            const contextRaw = lastAssistantMsg.content.replace(/#{1,6}\s+/g, '').replace(/\*\*(.+?)\*\*/g, '$1').trim().substring(0, 250)
            const topicTag = state.learningState.currentTopic || 'General'

            const newCard = await addToRevisionDeck({
                concept: conceptRaw,
                context: contextRaw + '…',
                topicTag
            })

            // Add confirmation message from coach
            const confirmMsg: CoachMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: `✅ **Added to your Revision Deck!**\n\n**Concept:** ${newCard.concept}\n**Topic:** ${newCard.topicTag}\n**Date:** ${newCard.date}\n\nYou'll see it in your revision panel on the right. Come back to it tomorrow to reinforce your memory! 🧠`,
                timestamp: new Date().toISOString()
            }

            setState(prev => prev ? {
                ...prev,
                messages: [...prev.messages, confirmMsg],
                revisionDeck: [...(prev.revisionDeck || []), newCard]
            } : null)
        } catch (err: any) {
            console.error("Failed to add to revision deck:", err)
        } finally {
            setIsSending(false)
        }
    }

    const handleRemoveRevisionCard = async (id: string) => {
        await removeFromRevisionDeck(id)
        setState(prev => prev ? {
            ...prev,
            revisionDeck: (prev.revisionDeck || []).filter(c => c.id !== id)
        } : null)
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
                    revisionDeck={state.revisionDeck || []}
                    onRemoveCard={handleRemoveRevisionCard}
                />
            </div>
        </div>
    )
}
