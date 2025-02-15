const { VertexAI } = require("@google-cloud/vertexai");
const { GoogleAuth } = require("google-auth-library");
const logger = require("../utils/logger");

const AIAPIError = class extends Error {
  constructor(type, message, originalError = null) {
    super(message);
    this.name = "AIAPIError";
    this.type = type;
  }
};

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
const minRequestInterval = 20000; // 20秒に変更

// スリープ関数
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// リクエストの間隔を制御する関数
const throttleRequest = async () => {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;

  if (timeSinceLastRequest < minRequestInterval) {
    const waitTime = minRequestInterval - timeSinceLastRequest;
    logger.debug("APIレート制限による待機", {
      waitTimeSeconds: (waitTime / 1000).toFixed(3),
      lastRequestTime,
      currentTime: now,
    });
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
        logger.info("レート制限によるリトライ", {
          retryCount,
          delaySeconds: delay / 1000,
          maxRetries: MAX_RETRIES,
        });
        await sleep(delay);
        delay = Math.min(delay * 2, MAX_RETRY_DELAY);
        continue;
      }
      throw error;
    }
  }
};

async function generateContent(prompt, schema = null) {
  const vertexAI = new VertexAI({
    project: projectId,
    location: VERTEX_AI_CONFIG.LOCATION,
  });

  const generativeModel = vertexAI.preview.getGenerativeModel({
    model: VERTEX_AI_CONFIG.MODEL,
  });

  const request = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generation_config: schema
      ? {
          responseMimeType: "application/json",
          responseSchema: schema,
        }
      : undefined,
  };

  try {
    const response = await withRetry(async () => {
      return await generativeModel.generateContent(request);
    });

    const result = await response.response;
    if (!result?.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new AIAPIError("invalid_response", "Gemini APIから不正なレスポンス形式を受信");
    }
    return result.candidates[0].content.parts[0].text;
  } catch (error) {
    if (error instanceof AIAPIError) {
      throw error;
    }
    if (error?.code === 429) {
      throw new AIAPIError("rate_limit", "APIレート制限を超過", error);
    }
    throw new AIAPIError("unknown", "Gemini APIでエラーが発生", error);
  }
}

module.exports = { generateContent };
