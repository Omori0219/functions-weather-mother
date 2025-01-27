const { VertexAI } = require("@google-cloud/vertexai");
const { GoogleAuth } = require("google-auth-library");
const logger = require("../utils/logger");

// Vertex AI の設定
const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
const VERTEX_AI_CONFIG = {
  LOCATION: "asia-northeast1",
  MODEL: "gemini-1.5-flash",
  // リトライ設定
  INITIAL_RETRY_DELAY: 1000, // 初期待機時間: 1秒
  MAX_RETRY_DELAY: 32000, // 最大待機時間: 32秒
  MAX_RETRIES: 5, // 最大リトライ回数
};

// スロットリング用の変数
let lastRequestTime = 0;
const minRequestInterval = 1000; // リクエスト間の最小間隔: 1秒

// 指定時間待機する関数
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// スロットリング制御関数
async function throttleRequest() {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;

  if (timeSinceLastRequest < minRequestInterval) {
    await sleep(minRequestInterval - timeSinceLastRequest);
  }

  lastRequestTime = Date.now();
}

// エクスポネンシャルバックオフを使用したリトライ関数
async function withRetry(operation, retryCount = 0) {
  try {
    await throttleRequest(); // リクエスト前にスロットリング制御
    return await operation();
  } catch (error) {
    if (error.code === 429 && retryCount < VERTEX_AI_CONFIG.MAX_RETRIES) {
      const delay = Math.min(
        VERTEX_AI_CONFIG.INITIAL_RETRY_DELAY * Math.pow(2, retryCount),
        VERTEX_AI_CONFIG.MAX_RETRY_DELAY
      );

      logger.info(
        `Rate limit exceeded. Retrying in ${delay / 1000} seconds... (Attempt ${retryCount + 1}/${
          VERTEX_AI_CONFIG.MAX_RETRIES
        })`
      );
      await sleep(delay);
      return withRetry(operation, retryCount + 1);
    }
    throw error;
  }
}

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

    // リトライ機能を使用してAPIリクエストを実行
    const response = await withRetry(async () => {
      return await generativeModel.generateContent(request);
    });

    const result = await response.response;
    const jsonResponse = JSON.parse(result.candidates[0].content.parts[0].text);

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
