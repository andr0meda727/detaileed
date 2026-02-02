import { GoogleGenAI } from "@google/genai";

export class DetailingAIService {
  // Refactored to initialize ai client directly within the method to ensure the most up-to-date API key is used
  async getAdvice(prompt: string) {
    try {
      // Correct initialization using process.env.API_KEY directly
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      // Upgraded to gemini-3-pro-preview for more complex technical reasoning
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: {
          systemInstruction: "Jesteś ekspertem auto detailingu z 20-letnim doświadczeniem. Odpowiadasz w języku polskim. Pomagasz detailerom w doborze chemii, procesach polerowania i usuwaniu trudnych zabrudzeń. Twoje rady są profesjonalne, konkretne i bezpieczne dla powierzchni samochodu.",
          temperature: 0.7,
        }
      });
      // response.text is a getter property, not a function
      return response.text;
    } catch (error) {
      console.error("Gemini AI Error:", error);
      return "Przepraszam, wystąpił problem z połączeniem z ekspertem AI. Spróbuj ponownie później.";
    }
  }
}