/**
 * Google Gemini APIクライアント
 * @file gemini.js
 */

const { VertexAI } = require("@google-cloud/vertexai");
const { info, error, debug } = require("../utils/logger");

/**
 * Vertex AI の設定
 */
const VERTEX_AI_CONFIG = {
  LOCATION: process.env.VERTEX_AI_LOCATION || "asia-northeast1",
  MODEL: process.env.VERTEX_AI_MODEL || "gemini-1.5-flash",
  // リトライ設定
  INITIAL_RETRY_DELAY: 5000, // 5秒
  MAX_RETRY_DELAY: 60000, // 60秒
  MAX_RETRIES: 5, // 最大リトライ回数
  MIN_REQUEST_INTERVAL: 20000, // 20秒
};

// リクエスト間隔の制御用
let lastRequestTime = 0;

/**
 * 指定時間スリープ
 * @param {number} ms - スリープ時間（ミリ秒）
 * @returns {Promise<void>}
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * リクエストの間隔を制御
 * @returns {Promise<void>}
 */
const throttleRequest = async () => {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;

  if (timeSinceLastRequest < VERTEX_AI_CONFIG.MIN_REQUEST_INTERVAL) {
    const waitTime = VERTEX_AI_CONFIG.MIN_REQUEST_INTERVAL - timeSinceLastRequest;
    debug(`APIレート制限のため${(waitTime / 1000).toFixed(3)}秒待機します...`);
    await sleep(waitTime);
  }

  lastRequestTime = Date.now();
};

/**
 * リトライ処理を実行
 * @param {Function} operation - 実行する非同期操作
 * @returns {Promise<any>} 操作の結果
 */
const withRetry = async (operation) => {
  let retryCount = 0;
  let delay = VERTEX_AI_CONFIG.INITIAL_RETRY_DELAY;

  while (true) {
    try {
      await throttleRequest();
      return await operation();
    } catch (err) {
      if (err?.code === 429 && retryCount < VERTEX_AI_CONFIG.MAX_RETRIES) {
        retryCount++;
        info(`レート制限エラー。${delay / 1000}秒後に${retryCount}回目のリトライを行います...`);
        await sleep(delay);
        delay = Math.min(delay * 2, VERTEX_AI_CONFIG.MAX_RETRY_DELAY);
        continue;
      }
      throw err;
    }
  }
};

/**
 * Gemini APIからレスポンスを取得
 * @param {string} prompt - 入力プロンプト
 * @returns {Promise<string>} 生成されたメッセージ
 */
async function getGeminiResponse(prompt) {
  const vertexAI = new VertexAI({
    project: process.env.GOOGLE_CLOUD_PROJECT_ID,
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
    info("Gemini APIリクエストを開始", { prompt: prompt.substring(0, 100) + "..." });

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

    info("Gemini APIレスポンスを受信");
    return jsonResponse.mother_message;
  } catch (err) {
    error("Gemini APIエラー", { error: err });
    if (err instanceof SyntaxError) {
      error("JSONパースに失敗", {
        response: result?.candidates[0]?.content?.parts[0]?.text,
      });
    }
    throw err;
  }
}

module.exports = { getGeminiResponse };
