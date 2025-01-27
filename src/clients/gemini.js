const { VertexAI } = require("@google-cloud/vertexai");
const { VERTEX_AI } = require("../config/constants");
const logger = require("../utils/logger");

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

    // 生の応答を詳細にログ出力
    const rawResponse = result.candidates[0].content.parts[0].text;
    logger.info("=== Gemini Raw Response Start ===");
    logger.info(rawResponse);
    logger.info("=== Gemini Raw Response End ===");
    logger.info("Response Type:", typeof rawResponse);
    logger.info("Response Length:", rawResponse.length);

    const jsonResponse = JSON.parse(rawResponse);

    if (!jsonResponse.mother_message) {
      throw new Error("Invalid response format: mother_message not found");
    }

    return jsonResponse.mother_message;
  } catch (error) {
    logger.error("Gemini API error", error);
    throw error;
  }
}

module.exports = { getGeminiResponse };
