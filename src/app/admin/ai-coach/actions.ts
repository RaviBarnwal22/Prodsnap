'use server'

import { processUserMessage, resetSession } from "@/lib/ai-coach/coach-engine";
import { getFullState, addRevisionCard, getRevisionDeck } from "@/lib/ai-coach/memory";
import { CoachState, CoachMessage, RevisionCard } from "@/lib/ai-coach/types";
import { v4 as uuidv4 } from 'uuid';

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

export async function addToRevisionDeck(card: Omit<RevisionCard, 'id' | 'date'>): Promise<RevisionCard> {
    const newCard: RevisionCard = {
        ...card,
        id: uuidv4(),
        date: new Date().toISOString().split('T')[0]
    };
    await addRevisionCard(newCard);
    return newCard;
}

export async function removeFromRevisionDeck(id: string): Promise<void> {
    const deck = await getRevisionDeck();
    const filtered = deck.filter(c => c.id !== id);
    const { saveRevisionDeck } = await import('@/lib/ai-coach/memory');
    await saveRevisionDeck(filtered);
}
