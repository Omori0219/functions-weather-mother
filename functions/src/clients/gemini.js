/**
 * Geminiクライアント
 * Google Gemini APIを使用してテキスト生成を行います
 */

const { VertexAI } = require("@google-cloud/vertexai");
const logger = require("../utils/logger");

// Vertex AI の設定
const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
const VERTEX_AI_CONFIG = {
  LOCATION: "asia-northeast1",
  MODEL: "gemini-1.5-flash",
};

/**
 * Geminiモデルを使用してテキストを生成
 * @param {string} prompt - 生成のためのプロンプト
 * @returns {Promise<string>} 生成されたテキスト
 */
async function getGeminiResponse(prompt) {
  try {
    logger.info("Gemini APIでテキストを生成中...");

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

    logger.info("テキストの生成が完了しました");
    return jsonResponse.mother_message;
  } catch (error) {
    logger.error("Gemini APIでエラーが発生しました", error);
    throw error;
  }
}

module.exports = { getGeminiResponse };
