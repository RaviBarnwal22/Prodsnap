import { GoogleGenerativeAI } from "@google/generative-ai";
import { getProfile, getLearningState, getMessages, getRecentSessions, saveMessages, saveLearningState, saveRecentSessions } from './memory';
import { CoachMessage, LearningState, SessionSummary } from './types';
import { v4 as uuidv4 } from 'uuid';

// Helper to get Gemini API keys from environment
function getGeminiKeys(): string[] {
    const gemini: string[] = [];
    let i = 1;
    while (process.env[`GEMINI_API_KEY_${i}`]) {
        gemini.push(process.env[`GEMINI_API_KEY_${i}`] as string);
        i++;
    }
    if (gemini.length === 0 && process.env.GEMINI_API_KEY) {
        gemini.push(process.env.GEMINI_API_KEY);
    }
    return gemini.filter(k => k.trim() !== "");
}

function buildSystemPrompt(profile: any, state: LearningState, recentSession: SessionSummary | null): string {
    return `You are an elite AI Product Management mentor, coaching a user to become interview-ready for Senior AI Product Manager roles at top tech companies.
Your persona: Former Google L7 PM, Microsoft Principal PM, OpenAI Product Manager, and Executive Product Coach.
Do NOT behave like a chatbot. Behave like a personal mentor. Never flatter. Never blindly agree. Challenge assumptions. Ask probing questions. Encourage first-principles thinking. Ask ONE question at a time. Do not reveal answers immediately.

ABOUT THE LEARNER:
Name: ${profile.name}
Role: ${profile.currentRole}
Experience: ${profile.experience}
Education: ${profile.education}
Certifications: ${profile.certifications?.join(', ') || 'None'}
Background & Skills: ${profile.background.join(', ')}
Target Companies: ${profile.targetCompanies.join(', ')}
Goal: ${profile.goal}
Side Project: ${profile.sideProject}
LinkedIn: ${profile.linkedin || 'Not provided'}

CURRENT LEARNING STATE:
Current Topic: ${state.currentTopic}
Mastery Score: ${state.masteryScore}%
Weak Concepts: ${state.weakConcepts.join(', ') || 'None identified yet'}
Strong Concepts: ${state.strongConcepts.join(', ') || 'None identified yet'}
Today's Objective: ${state.todayObjective}
Recent Session Summary: ${recentSession ? recentSession.summary : 'No recent sessions.'}

SESSION FLOW RULES:
1. Every session starts with Welcome Back + Review Previous Progress + Revision (if due).
2. Move to New Learning.
3. Ask Practice Questions / Interview Simulation.
4. Provide Homework.
5. Provide Session Summary.

When asked to conduct an interview, provide detailed scoring after completion.
Frequently connect concepts back to IBM ELM, Enterprise SaaS, Product Strategy, GTM, and the learner's past experience.
Examples: "How would this apply to IBM ELM?", "Would Google solve this differently?", "What trade-offs would OpenAI consider?"

Respond in Markdown format. Keep responses concise and focused.`;
}

export async function processUserMessage(content: string): Promise<CoachMessage> {
    const keys = getGeminiKeys();
    if (keys.length === 0) {
        throw new Error("No Gemini API keys found.");
    }

    const profile = await getProfile();
    const learningState = await getLearningState();
    const sessions = await getRecentSessions();
    const recentSession = sessions.length > 0 ? sessions[sessions.length - 1] : null;
    
    let messages = await getMessages();

    // 1. Add user message
    const userMessage: CoachMessage = {
        id: uuidv4(),
        role: 'user',
        content,
        timestamp: new Date().toISOString()
    };
    messages.push(userMessage);

    // 2. Build context
    const systemPrompt = buildSystemPrompt(profile, learningState, recentSession);
    
    // Convert previous messages to Gemini format (limit to last 10 messages for context window)
    const recentMessages = messages.slice(-10);
    const geminiHistory = recentMessages.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
    }));

    // 3. Call Gemini
    let aiResponseText = "";
    let success = false;
    
    // Try keys sequentially
    for (const key of keys) {
        try {
            const genAI = new GoogleGenerativeAI(key);
            // Use flash for speed, or pro if we want deeper reasoning. Using flash here for conversational speed.
            const model = genAI.getGenerativeModel({ 
                model: "gemini-2.5-flash",
                systemInstruction: systemPrompt 
            });

            // Remove the last message from history, as we will send it as the prompt
            const historyWithoutLast = geminiHistory.slice(0, -1);
            const chat = model.startChat({
                history: historyWithoutLast,
                generationConfig: {
                    temperature: 0.7,
                }
            });

            const result = await chat.sendMessage(content);
            aiResponseText = result.response.text();
            success = true;
            break;
        } catch (error) {
            console.error("[AI Coach] Gemini API error with key:", error);
            continue;
        }
    }

    if (!success) {
        aiResponseText = "I'm currently experiencing technical difficulties connecting to my cognitive engine. Let's pause and try again in a moment.";
    }

    // 4. Save assistant message
    const assistantMessage: CoachMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: aiResponseText,
        timestamp: new Date().toISOString()
    };
    messages.push(assistantMessage);
    await saveMessages(messages);

    // 5. Update Learning State implicitly (In a real scenario, we might use a secondary LLM call to extract state updates. 
    // For now, we will just update streak/lastSessionDate)
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
