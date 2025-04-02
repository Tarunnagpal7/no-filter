import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Initialize the Gemini API with your API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export const runtime = 'edge';

export async function POST() {
  try {
    const prompt =
     "Create a list of three open-ended and engaging questions formatted as a single string. Each question should be separated by '||'. These questions are for an anonymous social messaging platform, like Qooh.me, and should be suitable for a diverse audience. Avoid overly explicit or personal topics, but lean into seductive, teasing, and wild themes that spark curiosity and tension. For example, your output should be structured like this: 'What’s the most sinful thought you’ve had today?||If I whispered in your ear right now, what’s the one thing that would make you shiver?||What’s one secret craving you’d never admit out loud—but might type anonymously?'. Ensure the questions are thrilling, irresistibly bold, and create an atmosphere of mystery, temptation, and playful desire."
    // Use the correct model name - "gemini-1.5-pro" or "gemini-1.0-pro" depending on what's available
    // As of March 2025, Gemini may have updated model names
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    
    // Use the correct API call format
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }]
    });
    
    // Extract the text from the response
    const text = result.response.text();
    
    return NextResponse.json(text);
  } catch (error) {
    console.error("Error with Gemini API:", error);
    
    // More detailed error reporting
    if (error instanceof Error) {
      return NextResponse.json({ 
        error: "Failed to generate response", 
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }, { status: 500 });
    }
    
    return NextResponse.json({ error: "Failed to generate response" }, { status: 500 });
  }
}