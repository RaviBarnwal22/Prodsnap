'use server'

import { processUserMessage, resetSession } from "@/lib/ai-coach/coach-engine";
import { getFullState, addRevisionCard, getRevisionDeck } from "@/lib/ai-coach/memory";
import { CoachState, CoachMessage, RevisionCard } from "@/lib/ai-coach/types";
import { requireAdmin } from "@/lib/auth";
import { MAX_MESSAGE_CHARS } from "@/lib/constants";
import { v4 as uuidv4 } from 'uuid';

// The admin layout only gates the page. Server actions are separately invokable
// HTTP endpoints, so each one must authorize on its own.
async function assertAdmin() {
    const admin = await requireAdmin();
    if (!admin) throw new Error("Unauthorized");
}

export async function getCoachState(): Promise<CoachState> {
    await assertAdmin();
    return getFullState();
}

export async function sendMessage(content: string): Promise<CoachMessage> {
    await assertAdmin();
    const text = String(content ?? '').slice(0, MAX_MESSAGE_CHARS);
    return processUserMessage(text);
}

export async function startNewSession(): Promise<CoachState> {
    await assertAdmin();
    await resetSession();
    return getFullState();
}

export async function addToRevisionDeck(card: Omit<RevisionCard, 'id' | 'date'>): Promise<RevisionCard> {
    await assertAdmin();
    const newCard: RevisionCard = {
        ...card,
        id: uuidv4(),
        date: new Date().toISOString().split('T')[0]
    };
    await addRevisionCard(newCard);
    return newCard;
}

export async function removeFromRevisionDeck(id: string): Promise<void> {
    await assertAdmin();
    const deck = await getRevisionDeck();
    const filtered = deck.filter(c => c.id !== id);
    const { saveRevisionDeck } = await import('@/lib/ai-coach/memory');
    await saveRevisionDeck(filtered);
}
