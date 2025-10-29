
import { GoogleGenAI } from "@google/genai";

// Helper to convert File to a GoogleGenerativeAI.Part object
async function fileToGenerativePart(file: File) {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  const base64EncodedData = await base64EncodedDataPromise;
  return {
    inlineData: {
      data: base64EncodedData,
      mimeType: file.type,
    },
  };
}

export const analyzeImage = async (imageFile: File): Promise<string> => {
  // Ensure the API key is available
  if (!process.env.API_KEY) {
    throw new Error("API key not found. Please ensure it is configured correctly.");
  }
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const modelName = 'gemini-2.5-flash';

  try {
    const imagePart = await fileToGenerativePart(imageFile);
    const textPart = {
      text: "针对图片的全方面解读，请使用 Markdown 格式化你的回应，例如使用标题、列表和粗体字来让排版更精良。",
    };

    const response = await ai.models.generateContent({
        model: modelName,
        contents: { parts: [imagePart, textPart] },
    });

    return response.text;
  } catch (error) {
    console.error("Error analyzing image:", error);
    if (error instanceof Error) {
        throw new Error(`An error occurred: ${error.message}`);
    }
    throw new Error("An unknown error occurred while analyzing the image.");
  }
};