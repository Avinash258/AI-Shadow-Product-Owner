
import { GoogleGenAI, Type } from "@google/genai";
import { UserStory } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const backlogGenerationSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      title: {
        type: Type.STRING,
        description: "The user story title in the format 'As a [persona], I want [action], so that [benefit].'"
      },
      acceptanceCriteria: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "A list of clear, testable acceptance criteria for the user story."
      },
      businessValue: {
        type: Type.STRING,
        enum: ['High', 'Medium', 'Low'],
        description: "The estimated business value of the user story."
      },
      riskLevel: {
        type: Type.STRING,
        enum: ['High', 'Medium', 'Low'],
        description: "The estimated risk level associated with implementing the user story."
      },
      dependencies: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "A list of other user story titles that this story depends on."
      },
    },
    required: ["title", "acceptanceCriteria", "businessValue", "riskLevel", "dependencies"],
  },
};

export const generateProductBacklog = async (epicText: string, knowledgeBaseText: string): Promise<Omit<UserStory, 'id'>[]> => {
  const prompt = `
    System Instruction: You are an expert AI Shadow Product Owner. Your task is to break down a high-level Epic into a detailed, structured product backlog, using the provided Knowledge Base for context.

    **Epic:**
    ${epicText}

    **Knowledge Base:**
    ${knowledgeBaseText || "No knowledge base provided."}

    **Instructions:**
    1.  Analyze the Epic and Knowledge Base to understand core requirements, user personas, and business goals.
    2.  Decompose the Epic into a list of specific, actionable user stories. Each story must follow the format: "As a [persona], I want [action], so that [benefit]."
    3.  For each user story, create a list of clear, testable Acceptance Criteria (AC).
    4.  For each user story, assess and assign a Business Value tag from one of the following options: "High", "Medium", "Low".
    5.  For each user story, assess and assign a Risk Level tag from one of the following options: "High", "Medium", "Low".
    6.  Analyze the generated stories and identify any dependencies between them. List the dependent story titles. If there are no dependencies, return an empty array.
    7.  Return your response as a JSON object that adheres to the provided schema. The root of the object should be an array of user stories.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: backlogGenerationSchema,
        temperature: 0.2,
      },
    });
    
    const jsonStr = response.text.trim();
    const result = JSON.parse(jsonStr);

    // Basic validation to ensure the result is an array
    if (!Array.isArray(result)) {
      throw new Error("AI response is not in the expected array format.");
    }

    return result as Omit<UserStory, 'id'>[];
  } catch (error) {
    console.error("Error generating product backlog:", error);
    throw new Error("Failed to generate product backlog from AI. Please check the console for details.");
  }
};

export const getClarification = async (
  stories: UserStory[],
  knowledgeBase: string,
  question: string
): Promise<string> => {
  const prompt = `
    System Instruction: You are an AI assistant helping a product team. Your role is to provide clarifications based on the existing product backlog and knowledge base.

    **Current Product Backlog (Generated User Stories):**
    ${JSON.stringify(stories, null, 2)}

    **Knowledge Base:**
    ${knowledgeBase || "No knowledge base provided."}

    **User's Question:**
    "${question}"

    **Instructions:**
    Provide a concise and helpful answer to the user's question using ONLY the context from the product backlog and knowledge base provided above. If the information is not available in the context, clearly state that you cannot find the answer in the provided documents. Do not invent information.
  `;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error getting clarification:", error);
    throw new Error("Failed to get clarification from AI. Please check the console for details.");
  }
};
