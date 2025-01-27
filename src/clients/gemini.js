const { VertexAI } = require("@google-cloud/vertexai");
const { GoogleAuth } = require("google-auth-library");
const logger = require("../utils/logger");

// Vertex AI の設定
const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
const VERTEX_AI_CONFIG = {
  LOCATION: "us-central1",
  MODEL: "gemini-exp-1206",
};

async function getGeminiResponse(prompt) {
  const vertexAI = new VertexAI({
    project: projectId,
    location: VERTEX_AI_CONFIG.LOCATION,
  });

  const generativeModel = vertexAI.preview.getGenerativeModel({
    model: VERTEX_AI_CONFIG.MODEL,
  });

  const response_schema = {
    type: "object",
    properties: {
      mother_message: { type: "string" },
    },
    required: ["mother_message"],
  };

  try {
    const request = {
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
      generation_config: {
        responseMimeType: "application/json",
        responseSchema: response_schema,
      },
    };

    const response = await generativeModel.generateContent(request);
    const result = await response.response;
    return result.candidates[0].content.parts[0].text;
  } catch (error) {
    logger.error("Gemini API error", error);
    throw error;
  }
}

module.exports = { getGeminiResponse };
