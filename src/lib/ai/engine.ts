import { GoogleGenerativeAI } from "@google/generative-ai";
import { PRODUCT_SENSE_PROMPT } from "./prompts";

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
function getApiKeys(): string[] {
    const keys: string[] = [];
    let i = 1;
    while (process.env[`GEMINI_API_KEY_${i}`]) {
        keys.push(process.env[`GEMINI_API_KEY_${i}`] as string);
        i++;
    }
    // Fallback to the legacy single key if no numbered keys are found
    if (keys.length === 0 && process.env.GEMINI_API_KEY) {
        keys.push(process.env.GEMINI_API_KEY);
    }
    return keys.filter(key => key.trim() !== "");
}

export async function evaluateAnswer(questionTitle: string, userAnswer: string, elapsedTimeSeconds?: number, chatContext?: string): Promise<AIEvaluationResponse> {
    const apiKeys = getApiKeys();
    console.log(`[AI Engine] Total keys found: ${apiKeys.length}`);

    if (apiKeys.length === 0) {
        console.warn("No API keys found. Using mock response.");
        return getMockResponse();
    }

    const prompt = PRODUCT_SENSE_PROMPT(questionTitle, userAnswer, elapsedTimeSeconds, chatContext);
    let lastErrorMessage = "Unknown error";

    for (let i = 0; i < apiKeys.length; i++) {
        const key = apiKeys[i];
        const isPerplexity = key.startsWith("pplx-");

        console.log(`[AI Engine] Attempt ${i + 1}/${apiKeys.length} using ${isPerplexity ? 'Perplexity' : 'Gemini'}`);

        try {
            let text = "";

            if (isPerplexity) {
                // Handle Perplexity (OpenAI-compatible)
                const res = await fetch("https://api.perplexity.ai/chat/completions", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${key}`
                    },
                    body: JSON.stringify({
                        model: "sonar", // Fixed model name
                        messages: [
                            { role: "system", content: "You are an expert PM interviewer. Respond strictly in JSON." },
                            { role: "user", content: prompt }
                        ],
                        temperature: 0.2
                    })
                });

                if (!res.ok) {
                    const errorText = await res.text();
                    console.error(`[AI Engine] Perplexity Error detail: ${errorText}`);
                    throw new Error(`Perplexity API Error: ${res.status}`);
                }

                const data = await res.json();
                text = data.choices[0].message.content;
            } else {
                // Handle Gemini
                try {
                    const genAI = new GoogleGenerativeAI(key);
                    // gemini-1.5-flash was causing 404 for some regions/tiers, switching to stable gemini-pro
                    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

                    const result = await model.generateContent(prompt);
                    text = result.response.text();
                } catch (geminiError: unknown) {
                    console.error(`[AI Engine] Gemini Error detail:`, geminiError);
                    throw geminiError;
                }
            }

            if (!text) throw new Error("Empty response received from AI");

            // Extract JSON
            console.log(`[AI Engine] Raw response: ${text.substring(0, 100)}...`);
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            const rawJson = jsonMatch ? jsonMatch[0] : text;
            const jsonData = JSON.parse(rawJson);

            console.log(`[AI Engine] SUCCESS on attempt ${i + 1}`);
            return { ...jsonData, isMock: false };

        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            console.error(`[AI Engine] Attempt ${i + 1} FAILED:`, errorMessage);
            lastErrorMessage = errorMessage;
            // Continue loop...
        }
    }

    console.error(`[AI Engine] ALL ${apiKeys.length} attempts failed. Returning mock data.`);
    return {
        ...getMockResponse(),
        feedback: `Note: Live evaluation failed. Error: ${lastErrorMessage}`,
        isMock: true
    };
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
