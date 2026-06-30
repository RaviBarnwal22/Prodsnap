import { useRef, useEffect, useState } from 'react'
import { Send, User, Bot, Loader2, Mic, MicOff } from 'lucide-react'
import { CoachMessage } from '@/lib/ai-coach/types'
import { marked } from 'marked'

interface ChatWindowProps {
    messages: CoachMessage[];
    onSendMessage: (msg: string) => void;
    isLoading: boolean;
}

export function ChatWindow({ messages, onSendMessage, isLoading }: ChatWindowProps) {
    const bottomRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLTextAreaElement>(null)
    const [isListening, setIsListening] = useState(false)
    const recognitionRef = useRef<any>(null)

    useEffect(() => {
        // Initialize Speech Recognition if supported
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition()
            recognition.continuous = true
            recognition.interimResults = true
            
            recognition.onresult = (event: any) => {
                let finalTranscript = ''
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript
                    }
                }
                
                if (finalTranscript && inputRef.current) {
                    // Append text with a space if there's already text
                    const currentVal = inputRef.current.value
                    inputRef.current.value = currentVal + (currentVal.endsWith(' ') ? '' : ' ') + finalTranscript.trim()
                    // Auto resize
                    inputRef.current.style.height = 'auto'
                    inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 200) + 'px'
                }
            }

            recognition.onerror = (event: any) => {
                console.error("Speech recognition error", event.error)
                setIsListening(false)
            }

            recognition.onend = () => {
                setIsListening(false)
            }

            recognitionRef.current = recognition
        }
    }, [])

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop()
            setIsListening(false)
        } else {
            inputRef.current?.focus()
            try {
                recognitionRef.current?.start()
                setIsListening(true)
            } catch (e) {
                console.error(e)
            }
        }
    }

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, isLoading])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!inputRef.current) return
        
        const val = inputRef.current.value.trim()
        if (!val || isLoading) return

        onSendMessage(val)
        inputRef.current.value = ''
        
        // Auto-resize reset
        inputRef.current.style.height = 'auto'
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSubmit(e)
        }
    }

    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        e.target.style.height = 'auto'
        e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px'
    }

    return (
        <div className="flex flex-col h-full bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden shadow-2xl">
            {/* Message Stream */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4">
                        <Bot size={48} className="text-gray-700" />
                        <p className="text-center max-w-sm">
                            I am ready for our session. Send a message to begin.
                        </p>
                    </div>
                ) : (
                    messages.map((msg) => (
                        <div 
                            key={msg.id} 
                            className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                        >
                            <div className={`w-10 h-10 rounded-full flex flex-shrink-0 items-center justify-center ${
                                msg.role === 'user' 
                                ? 'bg-blue-600' 
                                : 'bg-gradient-to-br from-indigo-500 to-purple-600'
                            }`}>
                                {msg.role === 'user' ? <User size={20} className="text-white" /> : <Bot size={20} className="text-white" />}
                            </div>
                            <div className={`max-w-[80%] rounded-2xl p-4 ${
                                msg.role === 'user'
                                ? 'bg-blue-600/20 border border-blue-500/30 text-blue-50'
                                : 'bg-gray-800 border border-gray-700 text-gray-200'
                            }`}>
                                <div 
                                    className="prose prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-black/50 prose-pre:border prose-pre:border-gray-700"
                                    dangerouslySetInnerHTML={{ __html: marked.parse(msg.content) }}
                                />
                            </div>
                        </div>
                    ))
                )}
                
                {isLoading && (
                    <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                            <Bot size={20} className="text-white" />
                        </div>
                        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-4 flex items-center gap-2 text-gray-400">
                            <Loader2 size={16} className="animate-spin" />
                            Thinking...
                        </div>
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-gray-900 border-t border-gray-800">
                <form 
                    onSubmit={handleSubmit}
                    className="flex items-end gap-3 max-w-5xl mx-auto"
                >
                    <div className="relative flex-1">
                        <textarea
                            ref={inputRef}
                            rows={1}
                            placeholder="Message your coach... (Press Enter to send, Shift+Enter for new line)"
                            onKeyDown={handleKeyDown}
                            onInput={handleInput}
                            disabled={isLoading || isListening}
                            className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl py-3.5 pl-4 pr-12 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none max-h-48 overflow-y-auto disabled:opacity-50 transition-all placeholder-gray-500"
                            style={{ minHeight: '52px' }}
                        />
                    </div>
                    
                    <button
                        type="button"
                        onClick={toggleListening}
                        disabled={isLoading || !recognitionRef.current}
                        className={`h-[52px] w-[52px] rounded-xl flex items-center justify-center transition-colors shrink-0 disabled:opacity-50 disabled:cursor-not-allowed ${
                            isListening 
                            ? 'bg-red-500/20 text-red-500 border border-red-500/50 animate-pulse' 
                            : 'bg-gray-800 text-gray-400 hover:text-white border border-gray-700 hover:bg-gray-700'
                        }`}
                        title={!recognitionRef.current ? "Speech recognition not supported in this browser" : isListening ? "Stop listening" : "Start dictation"}
                    >
                        {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                    </button>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="h-[52px] px-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                    >
                        {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                    </button>
                </form>
            </div>
        </div>
    )
}
