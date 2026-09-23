import { GoogleGenerativeAI } from "@google/generative-ai";
import { PRODUCT_SENSE_PROMPT } from "./prompts";
import { prisma } from "@/lib/prisma";


export interface AIEvaluationResponse {
    scores: {
        comprehend_goal: number;
        identify_users: number;
        report_needs: number;
        cut_prioritization: number;
        list_solutions: number;
        evaluate_tradeoffs: number;
        overall: number;
    };
    detailed_analysis: {
        comprehend_goal: string;
        identify_users: string;
        report_needs: string;
        cut_prioritization: string;
        list_solutions: string;
        evaluate_tradeoffs: string;
    };
    strengths: string[];
    weaknesses: string[];
    feedback: string;
    improved_example: string;
    isMock?: boolean;
}

// Helper to get all API keys from environment
export function getApiKeys(): { gemini: string[], groq: string[] } {
    const gemini: string[] = [];
    const groq: string[] = [];

    // Prioritize Gemini first
    let i = 1;
    while (process.env[`GEMINI_API_KEY_${i}`]) {
        gemini.push(process.env[`GEMINI_API_KEY_${i}`] as string);
        i++;
    }
    if (gemini.length === 0 && process.env.GEMINI_API_KEY) {
        gemini.push(process.env.GEMINI_API_KEY);
    }

    if (process.env.GROQ_API_KEY) {
        groq.push(process.env.GROQ_API_KEY);
    }

    return { gemini: gemini.filter(k => k.trim() !== ""), groq: groq.filter(k => k.trim() !== "") };
}

// Helper to log API usage
async function logApiUsage(
    provider: string,
    model: string,
    status: string,
    responseTime?: number,
    errorMessage?: string,
    tokenCount?: number
) {
    try {
        await prisma.apiUsageLog.create({
            data: {
                provider,
                model,
                status,
                responseTime,
                errorMessage: errorMessage?.substring(0, 500), // Limit error message length
                tokenCount
            }
        });
    } catch (error) {
        console.error('[API Usage Log] Failed to log:', error);
    }
}


export async function evaluateAnswer(
    questionTitle: string,
    userAnswer: string,
    elapsedTimeSeconds?: number,
    chatContext?: string,
    includeGoldStandard: boolean = true,
    preferredProvider: 'groq' | 'gemini' = 'gemini'
): Promise<AIEvaluationResponse> {
    const { gemini: geminiKeys, groq: groqKeys } = getApiKeys();
    console.log(`[AI Engine] Gemini keys: ${geminiKeys.length}, Groq keys: ${groqKeys.length}, Preferred: ${preferredProvider}`);

    if (geminiKeys.length === 0 && groqKeys.length === 0) {
        console.warn("No API keys found. Using mock response.");
        return getMockResponse();
    }

    const prompt = PRODUCT_SENSE_PROMPT(questionTitle, userAnswer, elapsedTimeSeconds, chatContext, includeGoldStandard);
    let lastErrorMessage = "Unknown error";

    // Reorder providers based on preference: try preferred first, then fallback
    const providers = preferredProvider === 'groq'
        ? ['groq', 'gemini'] as const
        : ['gemini', 'groq'] as const;

    for (const providerName of providers) {
        if (providerName === 'groq') {
            // Attempt Groq (1-3s latency, used for demo)
            for (const key of groqKeys) {
                const startTime = Date.now();
                console.log(`[AI Engine] Attempting Groq (Llama-3.3)`);

                try {
                    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${key}`
                        },
                        body: JSON.stringify({
                            model: "llama-3.3-70b-versatile",
                            messages: [
                                { role: "system", content: "You are an expert PM interviewer. Respond strictly in valid JSON." },
                                { role: "user", content: prompt }
                            ],
                            temperature: 0.2
                        })
                    });

                    if (!res.ok) {
                        const errorText = await res.text();
                        throw new Error(`Groq API Error: ${res.status} - ${errorText.substring(0, 100)}`);
                    }

                    const data = await res.json();
                    const text = data.choices[0].message.content;

                    if (text) {
                        const responseTime = Date.now() - startTime;
                        await logApiUsage('groq', 'llama-3.3-70b', 'success', responseTime);
                        return enforceScoringRules(processAIResult(text), questionTitle, userAnswer);
                    }
                } catch (error: any) {
                    lastErrorMessage = error.message;
                    console.error(`[AI Engine] Groq attempt FAILED:`, lastErrorMessage);
                }
            }
        } else {
            // Attempt Gemini (18-37s latency, used for practice)
            for (const key of geminiKeys) {
                const startTime = Date.now();
                console.log(`[AI Engine] Attempting Gemini`);

                try {
                    const modelsToTry = ["gemini-2.5-flash", "gemini-1.5-flash-latest", "gemini-1.5-flash"];
                    let text = "";
                    let geminiSuccess = false;
                    let geminiLastException: any = null;

                    for (const modelId of modelsToTry) {
                        try {
                            console.log(`[AI Engine] Trying Gemini model: ${modelId}`);
                            const genAI = new GoogleGenerativeAI(key);
                            const model = genAI.getGenerativeModel({ model: modelId });

                            const result = await model.generateContent(prompt);
                            text = result.response.text();

                            const responseTime = Date.now() - startTime;
                            const estimatedTokens = Math.ceil((prompt.length + text.length) / 4);
                            await logApiUsage('gemini', modelId, 'success', responseTime, undefined, estimatedTokens);

                            geminiSuccess = true;
                            break;
                        } catch (geminiError: any) {
                            geminiLastException = geminiError;
                            console.warn(`[AI Engine] Gemini model ${modelId} failed: ${geminiError.message}`);
                            continue;
                        }
                    }

                    if (geminiSuccess && text) {
                        return enforceScoringRules(processAIResult(text), questionTitle, userAnswer);
                    }
                } catch (error: any) {
                    lastErrorMessage = error.message;
                    console.error(`[AI Engine] Gemini attempt FAILED:`, lastErrorMessage);
                }
            }
        }
    }

    console.error(`[AI Engine] ALL attempts failed. Returning mock data.`);
    return {
        ...getMockResponse(),
        feedback: `Note: Live evaluation failed. Error: ${lastErrorMessage}`,
        isMock: true
    };
}

const SCORE_KEYS = [
    'comprehend_goal', 'identify_users', 'report_needs',
    'cut_prioritization', 'list_solutions', 'evaluate_tradeoffs',
] as const

function words(s: string): string[] {
    return (s || '').toLowerCase().match(/[a-z0-9']+/g) || []
}

/**
 * Deterministic backstop for the scoring rules in PRODUCT_SENSE_PROMPT.
 *
 * The prompt asks the model to triage non-answers and vague answers, but a model
 * will not obey reliably: pasting the question back as the answer was scoring 4/5
 * with invented praise. These rules are enforced in code so the score cannot be
 * flattering when the submission does not deserve it.
 */
function enforceScoringRules(
    result: AIEvaluationResponse,
    questionTitle: string,
    userAnswer: string
): AIEvaluationResponse {
    const scores = { ...result.scores }

    // 1. Force every dimension into the documented 0-5 integer range. Models
    //    intermittently answer on a 0-10 scale, which the UI then rendered as
    //    "8 out of 10".
    for (const k of SCORE_KEYS) {
        const v = Number(scores[k])
        scores[k] = Number.isFinite(v) ? Math.max(0, Math.min(5, Math.round(v))) : 0
    }

    // 2. "overall" is the average of the dimensions, never an independent
    //    impression. This also corrects a 0-10 overall attached to 0-5 parts.
    const avg = SCORE_KEYS.reduce((sum, k) => sum + scores[k], 0) / SCORE_KEYS.length
    scores.overall = Math.max(0, Math.min(5, Math.round(avg)))

    const answerWords = words(userAnswer)
    const titleWords = new Set(words(questionTitle))

    // 3. Non-answer detection that does not depend on the model's judgement:
    //    too short to contain reasoning, or mostly the question echoed back.
    const shared = answerWords.filter(w => titleWords.has(w)).length
    const echoRatio = answerWords.length ? shared / answerWords.length : 0
    const isNonAnswer =
        answerWords.length < 25 ||
        (echoRatio > 0.6 && answerWords.length < 120)

    let strengths = Array.isArray(result.strengths) ? result.strengths : []

    if (isNonAnswer) {
        for (const k of SCORE_KEYS) scores[k] = Math.min(scores[k], 1)
        scores.overall = Math.min(scores.overall, 1)
    }

    // 4. Praise has to be earned. A weak submission returns no strengths at all
    //    rather than generic compliments.
    if (scores.overall <= 2) strengths = []

    return {
        ...result,
        scores,
        strengths: strengths.slice(0, 4),
        weaknesses: Array.isArray(result.weaknesses) ? result.weaknesses : [],
    }
}

function processAIResult(text: string): AIEvaluationResponse {
    // Extract JSON and Clean it
    console.log(`[AI Engine] Raw response: ${text.substring(0, 100)}...`);
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    let rawJson = jsonMatch ? jsonMatch[0] : text;

    // PRE-CLEAN
    rawJson = rawJson.replace(/":\s*"([^"]*)"/g, (match, p1) => {
        const cleanedValue = p1.replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t');
        return `": "${cleanedValue}"`;
    });

    const jsonData = JSON.parse(rawJson);

    // Recursive cleanup to strip bullets/dashes
    const cleanupResponse = (obj: any): any => {
        if (typeof obj === 'string') {
            return obj.replace(/^\s*[-•*]\s+/gm, '').trim();
        }
        if (Array.isArray(obj)) return obj.map(cleanupResponse);
        if (obj !== null && typeof obj === 'object') {
            const newObj: any = {};
            for (const key in obj) newObj[key] = cleanupResponse(obj[key]);
            return newObj;
        }
        return obj;
    };

    return { ...cleanupResponse(jsonData), isMock: false };
}

/**
 * Returned only when no evaluation could be produced: no API keys, or every
 * provider failed.
 *
 * This used to return a flattering canned result - overall 4/5 with strengths
 * "Excellent user identification" and "Structured solution exploration" - which
 * the UI rendered as a genuine 8/10. A submission that was never evaluated was
 * being praised. Scores are now zero and no strengths are claimed, so a failure
 * cannot be mistaken for a pass. Callers should check `isMock` and show an error
 * rather than presenting this as feedback.
 */
function getMockResponse(): AIEvaluationResponse {
    return {
        scores: {
            comprehend_goal: 0,
            identify_users: 0,
            report_needs: 0,
            cut_prioritization: 0,
            list_solutions: 0,
            evaluate_tradeoffs: 0,
            overall: 0
        },
        detailed_analysis: {
            comprehend_goal: "Not evaluated.",
            identify_users: "Not evaluated.",
            report_needs: "Not evaluated.",
            cut_prioritization: "Not evaluated.",
            list_solutions: "Not evaluated.",
            evaluate_tradeoffs: "Not evaluated."
        },
        strengths: [],
        weaknesses: [],
        feedback: "Your answer could not be evaluated because the AI service did not respond. Nothing here reflects the quality of your answer. Please try again in a moment.",
        improved_example: "",
        isMock: true
    };
}
