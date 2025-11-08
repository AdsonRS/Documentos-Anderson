
import { GoogleGenAI, Type } from "@google/genai";
import { GroundingSource } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function transcribeDocument(base64Image: string, mimeType: string): Promise<string[]> {
  const imagePart = {
    inlineData: {
      data: base64Image,
      mimeType: mimeType,
    },
  };
  
  const textPart = {
    text: "Transcribe the text from this document. Separate each paragraph into a distinct element in a JSON array. Only return the JSON array of strings."
  };

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: { parts: [imagePart, textPart] },
    config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                paragraphs: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.STRING
                    }
                }
            }
        }
    }
  });

  try {
    const jsonString = response.text;
    const result = JSON.parse(jsonString);
    if (result && Array.isArray(result.paragraphs)) {
        return result.paragraphs;
    }
    return [];
  } catch(e) {
    console.error("Failed to parse transcription response:", e);
    throw new Error("Could not understand the document structure.");
  }
}

export async function getTextToSpeech(text: string): Promise<string> {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text }] }],
        config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName: 'Kore' },
                },
            },
        },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
        throw new Error("No audio data returned from API.");
    }
    return base64Audio;
}

export async function analyzeParagraph(text: string): Promise<string> {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        contents: `Summarize or provide a key insight for the following paragraph: "${text}"`,
        config: {
            thinkingConfig: { thinkingBudget: 32768 }
        }
    });
    return response.text;
}

export async function searchContext(text: string): Promise<{ text: string, sources: GroundingSource[] }> {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Based on web search results, explain or add context to the following text: "${text}"`,
        config: {
            tools: [{ googleSearch: {} }],
        },
    });

    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    return { text: response.text, sources };
}
