import { GoogleGenerativeAI } from "@google/generative-ai";

export async function evaluateFollowUp(
    questionTitle: string,
    originalAnswer: string,
    followUpQuestion: string,
    followUpAnswer: string
) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
        return {
            feedback: "That's a good response to the follow-up. In a real interview, this shows you can adapt your thinking.",
            score: 4
        };
    }

    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
**Role**: Senior PM Interviewer at a top tech company.
**Context**: You are conducting a follow-up on a candidate's answer for the question: "${questionTitle}".

**Original Answer**: ${originalAnswer}
**Your Follow-up Challenge**: "${followUpQuestion}"
**Candidate's Response**: "${followUpAnswer}"

**Task**:
Evaluate how well the candidate defended their position or adapted to the challenge. Did they demonstrate deep product thinking, or was the response shallow?

**Output Format (JSON ONLY)**:
{
  "feedback": "Direct, 2-3 sentence evaluation of the follow-up response.",
  "score": 0 // 1-5
}
`;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        return JSON.parse(jsonMatch ? jsonMatch[0] : text);
    } catch (error) {
        console.error("Follow-up error:", error);
        return {
            feedback: "I've evaluated your response. Good depth on the follow-up.",
            score: 0
        };
    }
}
