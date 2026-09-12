import { GoogleGenerativeAI } from "@google/generative-ai";
import { getProfile, getLearningState, getMessages, getRecentSessions, saveMessages, saveLearningState } from './memory';
import { CoachMessage, LearningState, SessionSummary } from './types';
import { v4 as uuidv4 } from 'uuid';

// ─── Constants ────────────────────────────────────────────────────────────────
const RAW_HISTORY_WINDOW = 6;   // Recent messages passed verbatim
const SUMMARY_WINDOW = 20;       // Older messages get compressed into a summary

// ─── Token Helpers ────────────────────────────────────────────────────────────

function getGeminiKeys(): string[] {
    const keys: string[] = [];
    let i = 1;
    while (process.env[`GEMINI_API_KEY_${i}`]) {
        keys.push(process.env[`GEMINI_API_KEY_${i}`] as string);
        i++;
    }
    if (keys.length === 0 && process.env.GEMINI_API_KEY) keys.push(process.env.GEMINI_API_KEY);
    return keys.filter(k => k.trim() !== "");
}

/** Strip markdown to reduce token count on historical messages */
function stripMarkdown(text: string): string {
    return text
        .replace(/#{1,6}\s+/g, '')
        .replace(/\*\*(.+?)\*\*/g, '$1')
        .replace(/\*(.+?)\*/g, '$1')
        .replace(/`{1,3}[^`]*`{1,3}/g, '')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/^\s*[-*>]\s+/gm, '')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

function truncate(text: string, max = 300): string {
    return text.length <= max ? text : text.substring(0, max) + '…';
}

/** Compress older messages into a compact summary block to save tokens */
function buildConversationSummary(olderMessages: CoachMessage[]): string {
    if (olderMessages.length === 0) return '';
    const lines = olderMessages.map(msg => {
        const role = msg.role === 'user' ? 'L' : 'C'; // L=Learner, C=Coach
        return `${role}: ${truncate(stripMarkdown(msg.content), 150)}`;
    });
    return `[Prior context]\n${lines.join('\n')}\n[End prior context]`;
}

// ─── Compact System Prompt (30% fewer tokens) ─────────────────────────────────

function buildSystemPrompt(
    profile: any,
    state: LearningState,
    recentSession: SessionSummary | null,
    conversationSummary: string
): string {
    // Compact bio: only the most essential facts
    const bio = [
        `${profile.name} | ${profile.currentRole}`,
        `Exp: ${profile.experience} | Edu: ${profile.education}`,
        `Certs: ${profile.certifications?.slice(0, 2).join(', ') || 'None'}`,
        `Skills: ${profile.background.slice(0, 8).join(', ')}`,
        `Targets: ${profile.targetCompanies.slice(0, 6).join(', ')}`,
        `Goal: ${profile.goal}`,
        `Project: ${profile.sideProject}`,
    ].join('\n');

    // Compact learning state
    const learningCtx = [
        `Topic: ${state.currentTopic} | Mastery: ${state.masteryScore}%`,
        `Weak: ${state.weakConcepts.slice(0, 3).join(', ') || 'none'}`,
        `Strong: ${state.strongConcepts.slice(0, 3).join(', ') || 'none'}`,
        `Today: ${state.todayObjective}`,
        recentSession ? `Last session: ${truncate(recentSession.summary, 150)}` : '',
    ].filter(Boolean).join('\n');

    return `You are an elite AI PM mentor — Former Google L7 PM, Microsoft Principal PM, OpenAI PM. You are NOT a chatbot. You are a personal mentor.
Rules: Never flatter. Challenge assumptions. Ask ONE probing question at a time. Encourage first-principles thinking. Do not reveal answers upfront. Connect learning to the learner's real experience.
When interviewing: score answers after each response.
Format: Markdown. Be concise.

LEARNER:
${bio}

LEARNING STATE:
${learningCtx}
${conversationSummary ? `\n${conversationSummary}` : ''}
SESSION FLOW: Welcome → Review → New Learning → Practice/Mock Interview → Homework → Summary.
Tie examples to IBM ELM, Enterprise SaaS, GTM. Ask: "How would Google approach this?" or "What would OpenAI trade off?"`;
}

// ─── OpenAI-Compatible Caller (Groq, Cerebras, SambaNova all use same format) ─

async function callOpenAICompatible(
    apiUrl: string,
    apiKey: string,
    model: string,
    systemPrompt: string,
    historyMessages: CoachMessage[],
    userContent: string,
    providerName: string
): Promise<string | null> {
    try {
        console.log(`[AI Coach] Trying ${providerName} (${model})...`);
        const messages = [
            { role: 'system', content: systemPrompt },
            ...historyMessages.map(msg => ({
                role: msg.role === 'assistant' ? 'assistant' : 'user',
                content: truncate(stripMarkdown(msg.content), 300)
            })),
            { role: 'user', content: userContent }
        ];

        const res = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
            body: JSON.stringify({ model, messages, temperature: 0.7, max_tokens: 1024 })
        });

        if (!res.ok) {
            const err = await res.text();
            throw new Error(`${providerName} ${res.status}: ${err.substring(0, 100)}`);
        }

        const data = await res.json();
        const text = data.choices?.[0]?.message?.content || '';
        if (text) {
            console.log(`[AI Coach] ✓ ${providerName} responded.`);
            return text;
        }
        return null;
    } catch (err) {
        console.error(`[AI Coach] ${providerName} failed:`, err);
        return null;
    }
}

// ─── Main Function ────────────────────────────────────────────────────────────

export async function processUserMessage(content: string): Promise<CoachMessage> {
    const profile = await getProfile();
    const learningState = await getLearningState();
    const sessions = await getRecentSessions();
    const recentSession = sessions.length > 0 ? sessions[sessions.length - 1] : null;
    let messages = await getMessages();

    // 1. Save user message
    const userMessage: CoachMessage = { id: uuidv4(), role: 'user', content, timestamp: new Date().toISOString() };
    messages.push(userMessage);

    // 2. Smart context compression
    const previousMessages = messages.slice(0, -1);
    const recentRaw = previousMessages.slice(-RAW_HISTORY_WINDOW);
    const olderMessages = previousMessages.slice(-SUMMARY_WINDOW, -RAW_HISTORY_WINDOW);
    const conversationSummary = buildConversationSummary(olderMessages);

    const systemPrompt = buildSystemPrompt(profile, learningState, recentSession, conversationSummary);

    // Ensure history starts with user role (Gemini requirement)
    let historyMessages = [...recentRaw];
    while (historyMessages.length > 0 && historyMessages[0].role === 'assistant') historyMessages.shift();

    // 3. Try Gemini first
    let aiResponseText = "";
    const geminiKeys = getGeminiKeys();

    if (geminiKeys.length > 0) {
        for (const key of geminiKeys) {
            try {
                const genAI = new GoogleGenerativeAI(key);
                const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash', systemInstruction: systemPrompt });
                const geminiHistory = historyMessages.map(msg => ({
                    role: msg.role === 'assistant' ? 'model' : 'user',
                    parts: [{ text: msg.content }]
                }));
                const chat = model.startChat({ history: geminiHistory, generationConfig: { temperature: 0.7 } });
                const result = await chat.sendMessage(content);
                aiResponseText = result.response.text();
                if (aiResponseText) { console.log('[AI Coach] ✓ Gemini responded.'); break; }
            } catch (err) {
                console.error('[AI Coach] Gemini failed:', err);
            }
        }
    }

    // 4. Fallback chain: Groq → Cerebras → SambaNova
    if (!aiResponseText && process.env.GROQ_API_KEY) {
        const result = await callOpenAICompatible(
            'https://api.groq.com/openai/v1/chat/completions',
            process.env.GROQ_API_KEY,
            'llama-3.3-70b-versatile',
            systemPrompt, historyMessages, content, 'Groq'
        );
        if (result) aiResponseText = result;
    }

    if (!aiResponseText && process.env.CEREBRAS_API_KEY) {
        const result = await callOpenAICompatible(
            'https://api.cerebras.ai/v1/chat/completions',
            process.env.CEREBRAS_API_KEY,
            'gpt-oss-120b',
            systemPrompt, historyMessages, content, 'Cerebras'
        );
        if (result) aiResponseText = result;
    }

    if (!aiResponseText && process.env.SAMBANOVA_API_KEY) {
        const result = await callOpenAICompatible(
            'https://api.sambanova.ai/v1/chat/completions',
            process.env.SAMBANOVA_API_KEY,
            'Meta-Llama-3.3-70B-Instruct',
            systemPrompt, historyMessages, content, 'SambaNova'
        );
        if (result) aiResponseText = result;
    }

    if (!aiResponseText) {
        aiResponseText = "I'm currently experiencing technical difficulties connecting to my cognitive engine. Let's pause and try again in a moment.";
    }

    // 5. Save assistant message
    const assistantMessage: CoachMessage = { id: uuidv4(), role: 'assistant', content: aiResponseText, timestamp: new Date().toISOString() };
    messages.push(assistantMessage);
    await saveMessages(messages);

    // 6. Update streak
    const todayStr = new Date().toISOString().split('T')[0];
    if (learningState.lastSessionDate !== todayStr) {
        learningState.streak += 1;
        learningState.lastSessionDate = todayStr;
        await saveLearningState(learningState);
    }

    return assistantMessage;
}

export async function resetSession(): Promise<void> {
    await saveMessages([]);
}
