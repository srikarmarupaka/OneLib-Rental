import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
You are 'Veda', the AI Librarian for OneLib India. 
OneLib is a platform that unifies library cards across India into a single 'OneLibCard', allowing users to rent physical books from partner libraries or download free digital copies of supported books.

Your goal is to help users find books, understand the membership, and discuss Indian literature.
Context:
- We operate in major cities: Mumbai, Delhi, Bangalore, Kolkata, etc.
- We integrate with Google Books to provide a vast catalog.
- Membership tiers: Basic (Free digital), Gold (Rentals + Digital).

Tone: Knowledgeable, warm, respectful (using Indian English nuances occasionally like 'kindly', 'do the needful' if appropriate but keep it professional).
Keep responses concise (under 100 words) unless asked for a detailed summary.

If the user asks for recommendations, suggest popular Indian authors like Arundhati Roy, R.K. Narayan, Salman Rushdie, Jhumpa Lahiri, or Chetan Bhagat.
`;

export const chatWithLibrarian = async (message: string, history: {role: string, parts: {text: string}[]}[] = []) => {
  try {
    const model = 'gemini-3-flash-preview';
    
    const chat = ai.chats.create({
      model: model,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
      history: history.map(h => ({
        role: h.role,
        parts: h.parts
      })),
    });

    const result = await chat.sendMessage({ message });
    return result.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I apologize, but I am having trouble accessing the library archives right now. Please try again later.";
  }
};
