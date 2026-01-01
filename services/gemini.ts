import { GoogleGenAI } from "@google/genai";

export const translateText = async (
  text: string,
  targetLang: string,
  apiKey: string
): Promise<string> => {
  if (!apiKey) {
    throw new Error("API Key is missing. Please configure it in Settings.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Translate the following text into ${targetLang}. Only provide the translated text, no explanations. Text: "${text}"`,
    });

    return response.text || "Translation failed.";
  } catch (error) {
    console.error("Translation error:", error);
    throw new Error("Failed to translate. Check your API key and connection.");
  }
};