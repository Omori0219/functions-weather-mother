const { VertexAI } = require("@google-cloud/vertexai");
const { GoogleAuth } = require("google-auth-library");
const { VERTEX_AI } = require("../config/constants");
const logger = require("../utils/logger");

// Vertex AI の設定
const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;

async function getGeminiResponse(prompt) {
  const vertexAI = new VertexAI({
    project: projectId,
    location: VERTEX_AI.LOCATION,
  });

  const generativeModel = vertexAI.preview.getGenerativeModel({
    model: VERTEX_AI.MODEL,
  });

  try {
    const request = {
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
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
