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


export async function evaluateAnswer(questionTitle: string, userAnswer: string, elapsedTimeSeconds?: number, chatContext?: string): Promise<AIEvaluationResponse> {
    const { gemini: geminiKeys, groq: groqKeys } = getApiKeys();
    console.log(`[AI Engine] Gemini keys: ${geminiKeys.length}, Groq keys: ${groqKeys.length}`);

    if (geminiKeys.length === 0 && groqKeys.length === 0) {
        console.warn("No API keys found. Using mock response.");
        return getMockResponse();
    }

    const prompt = PRODUCT_SENSE_PROMPT(questionTitle, userAnswer, elapsedTimeSeconds, chatContext);
    let lastErrorMessage = "Unknown error";

    // 1. Attempt Gemini first (Free Daily Refill)
    for (const key of geminiKeys) {
        const startTime = Date.now();
        console.log(`[AI Engine] Attempting Gemini fallback (Daily Free tier)`);

        try {
            const modelsToTry = ["gemini-2.0-flash", "gemini-2.5-flash", "gemini-1.5-flash-latest"];
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
                return processAIResult(text);
            }
        } catch (error: any) {
            lastErrorMessage = error.message;
            console.error(`[AI Engine] Gemini attempt FAILED:`, lastErrorMessage);
        }
    }

    // 2. Attempt Groq as backup (High speed daily refill)
    for (const key of groqKeys) {
        const startTime = Date.now();
        console.log(`[AI Engine] Attempting Groq backup (Llama-3.3)`);

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
                return processAIResult(text);
            }
        } catch (error: any) {
            lastErrorMessage = error.message;
            console.error(`[AI Engine] Groq attempt FAILED:`, lastErrorMessage);
        }
    }

    console.error(`[AI Engine] ALL attempts failed. Returning mock data.`);
    return {
        ...getMockResponse(),
        feedback: `Note: Live evaluation failed. Error: ${lastErrorMessage}`,
        isMock: true
    };
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

function getMockResponse(): AIEvaluationResponse {
    return {
        scores: {
            comprehend_goal: 4,
            identify_users: 5,
            report_needs: 3,
            cut_prioritization: 4,
            list_solutions: 5,
            evaluate_tradeoffs: 3,
            overall: 4
        },
        detailed_analysis: {
            comprehend_goal: "You clearly defined the problem and identified the key objective. Success metrics were well-aligned with the goal.",
            identify_users: "Excellent segmentation. You covered both primary and secondary personas with clear motivations.",
            report_needs: "You identified some functional needs but could have delved deeper into the emotional pain points.",
            cut_prioritization: "Good reasoning for focusing on safety first. However, a clearer framework for trade-offs here would help.",
            list_solutions: "Creative range of solutions, from haptic feedback to bone conduction. Good variety.",
            evaluate_tradeoffs: "Trade-offs were mentioned but lacked a deep dive into technical feasibility vs. cost."
        },
        strengths: ["Excellent user identification", "Structured solution exploration"],
        weaknesses: ["Trade-off analysis was a bit shallow", "Prioritization could be more data-driven"],
        feedback: "Great application of the CIRCLES framework. Section-wise scores reflect strong structure.",
        improved_example: "To improve the trade-offs section, consider using a matrix for impact vs. effort...",
        isMock: true
    };
}
