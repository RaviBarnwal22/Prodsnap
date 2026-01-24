import { GoogleGenerativeAI } from "@google/generative-ai";

function getApiKeys(): string[] {
    const keys: string[] = [];
    let i = 1;
    while (process.env[`GEMINI_API_KEY_${i}`]) {
        keys.push(process.env[`GEMINI_API_KEY_${i}`] as string);
        i++;
    }
    if (keys.length === 0 && process.env.GEMINI_API_KEY) {
        keys.push(process.env.GEMINI_API_KEY);
    }
    return keys.filter(key => key.trim() !== "");
}

export async function evaluateFollowUp(
    questionTitle: string,
    originalAnswer: string,
    followUpQuestion: string,
    followUpAnswer: string
) {
    const apiKeys = getApiKeys();

    if (apiKeys.length === 0) {
        return {
            feedback: "I couldn't evaluate your response due to a configuration issue. In a real interview, make sure to defend your logic deeply.",
            score: 0
        };
    }

    const prompt = `
**Role**: Senior PM Interviewer (Bar Raiser).
**Context**: You just challenged a candidate on their answer for: "${questionTitle}".

**Your Challenge**: "${followUpQuestion}"
**Candidate's Response**: "${followUpAnswer}"

**Instruction**:
1. Evaluate if the candidate actually addressed your challenge with product depth.
2. **STRICT PENALTY**: If the response is extremely short (e.g., "yes", "ok", "I agree", "cool") or doesn't provide new reasoning, score it 0 or 1.
3. Be professional but critical. Don't give high scores for shallow "fluff".

**Output Format (JSON ONLY)**:
{
  "feedback": "A direct, 1-2 sentence assessment of their adaptability.",
  "score": 0 
}
`;

    // Try keys sequentially
    for (const key of apiKeys) {
        try {
            const genAI = new GoogleGenerativeAI(key);
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });
            const result = await model.generateContent(prompt);
            const text = result.response.text();
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            return JSON.parse(jsonMatch ? jsonMatch[0] : text);
        } catch (error) {
            console.error(`Follow-up error with key:`, error);
            // continue to next key
        }
    }

    return {
        feedback: "Live follow-up evaluation is currently unavailable. Please try replying with more detail.",
        score: 0
    };
}
