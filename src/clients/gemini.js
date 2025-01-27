const { VertexAI } = require("@google-cloud/vertexai");
const { GoogleAuth } = require("google-auth-library");
const logger = require("../utils/logger");

// Vertex AI の設定
const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
const VERTEX_AI_CONFIG = {
  LOCATION: "asia-northeast1",
  MODEL: "gemini-1.5-flash",
  // リトライ設定
  INITIAL_RETRY_DELAY: 5000, // 5秒
  MAX_RETRY_DELAY: 60000, // 60秒
  MAX_RETRIES: 5, // 最大リトライ回数
};

// スロットリングとリトライの設定
const INITIAL_RETRY_DELAY = VERTEX_AI_CONFIG.INITIAL_RETRY_DELAY;
const MAX_RETRY_DELAY = VERTEX_AI_CONFIG.MAX_RETRY_DELAY;
const MAX_RETRIES = VERTEX_AI_CONFIG.MAX_RETRIES;

// リクエスト間隔の制御用
let lastRequestTime = 0;
const minRequestInterval = 5000; // 5秒

// スリープ関数
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// リクエストの間隔を制御する関数
const throttleRequest = async () => {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;

  if (timeSinceLastRequest < minRequestInterval) {
    const waitTime = minRequestInterval - timeSinceLastRequest;
    console.log(`[INFO] APIレート制限のため${waitTime}ms待機します...`);
    await sleep(waitTime);
  }

  lastRequestTime = Date.now();
};

// リトライ処理を行う関数
const withRetry = async (operation) => {
  let retryCount = 0;
  let delay = INITIAL_RETRY_DELAY;

  while (true) {
    try {
      await throttleRequest();
      return await operation();
    } catch (error) {
      if (error?.code === 429 && retryCount < MAX_RETRIES) {
        retryCount++;
        console.log(
          `[INFO] レート制限エラー。${delay / 1000}秒後に${retryCount}回目のリトライを行います...`
        );
        await sleep(delay);
        delay = Math.min(delay * 2, MAX_RETRY_DELAY);
        continue;
      }
      throw error;
    }
  }
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
