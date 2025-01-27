const { VertexAI } = require("@google-cloud/vertexai");
const { GoogleAuth } = require("google-auth-library");
const logger = require("../utils/logger");

// Vertex AI の設定
const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
const VERTEX_AI_CONFIG = {
  LOCATION: "asia-northeast1",
  MODEL: "gemini-1.5-flash",
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
    const jsonResponse = JSON.parse(result.candidates[0].content.parts[0].text);

    // mother_messageのみを返す
    return jsonResponse.mother_message;
  } catch (error) {
    logger.error("Gemini API error", error);
    if (error instanceof SyntaxError) {
      logger.error(
        "JSON parsing failed. Raw response:",
        result?.candidates[0]?.content?.parts[0]?.text
      );
    }
    throw error;
  }
}

module.exports = { getGeminiResponse };
