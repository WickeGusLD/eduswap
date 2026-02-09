import { GoogleGenAI } from "@google/genai";
import { AnalyticsData } from '../types';

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API Key not found in environment variables");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const generateAnalyticsInsights = async (data: AnalyticsData[]): Promise<string> => {
  const ai = getClient();
  if (!ai) return "AI service unavailable. Please check API Key configuration.";

  const prompt = `
    You are an academic advisor analyzing course demand for a university swap platform.
    Here is the data representing "Demand" (students who want the course) and "Supply" (students who have it and want to drop it).
    
    Data: ${JSON.stringify(data)}
    
    Please provide a concise, 3-bullet point summary of the most critical trends. 
    Focus on which courses are "high value" (high demand, low supply) and which are "easy to get" (low demand, high supply).
    Keep the tone professional and helpful for a student trying to optimize their schedule.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "No insights generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Failed to generate insights at this time.";
  }
};

export const getSwapAdvice = async (have: string, want: string): Promise<string> => {
    const ai = getClient();
    if (!ai) return "AI service unavailable.";
  
    const prompt = `
      I am a student currently enrolled in "${have}" but I want to swap into "${want}".
      Give me a 2-sentence strategy on how likely this is based on general university trends (e.g., usually STEM courses are harder to swap into than electives, etc). 
      Assume "${want}" is a high-demand course.
    `;
  
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      return response.text || "No advice available.";
    } catch (error) {
      console.error("Gemini API Error:", error);
      return "Could not retrieve advice.";
    }
  };
