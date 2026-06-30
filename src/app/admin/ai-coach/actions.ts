'use server'

import { processUserMessage, resetSession } from "@/lib/ai-coach/coach-engine";
import { getFullState } from "@/lib/ai-coach/memory";
import { CoachState, CoachMessage } from "@/lib/ai-coach/types";

export async function getCoachState(): Promise<CoachState> {
    return getFullState();
}

export async function sendMessage(content: string): Promise<CoachMessage> {
    return processUserMessage(content);
}

export async function startNewSession(): Promise<CoachState> {
    await resetSession();
    return getFullState();
}
