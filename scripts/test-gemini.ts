
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

async function testGemini() {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
        console.log("No Gemini key found");
        return;
    }
    console.log("Testing Gemini key...");
    try {
        const genAI = new GoogleGenerativeAI(key);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const result = await model.generateContent("Hello, how are you?");
        console.log("Response:", result.response.text());
    } catch (e) {
        console.error("Gemini failed:", e);
    }
}
testGemini();
