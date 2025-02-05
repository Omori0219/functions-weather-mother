/**
 * Geminiクライアント
 * Google Gemini APIを使用してテキスト生成を行います
 */

const { GoogleGenerativeAI } = require("@google/generative-ai");
const { GEMINI_API_KEY } = require("../config/env");
const logger = require("../utils/logger");

// Gemini APIの設定
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY.value());
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

/**
 * Geminiモデルを使用してテキストを生成
 * @param {string} prompt - 生成のためのプロンプト
 * @returns {Promise<string>} 生成されたテキスト
 */
async function getGeminiResponse(prompt) {
  try {
    logger.info("Gemini APIでテキストを生成中...");

    // 生成パラメータの設定
    const generationConfig = {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 1024,
    };

    // テキストを生成
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig,
    });

    // レスポンスを検証
    if (!result.response || !result.response.text()) {
      logger.error("Gemini APIから無効なレスポンスを受信しました");
      throw new Error("テキスト生成に失敗しました");
    }

    const generatedText = result.response.text().trim();
    logger.info("テキストの生成が完了しました");
    return generatedText;
  } catch (error) {
    logger.error("Gemini APIでエラーが発生しました", error);
    throw error;
  }
}

module.exports = { getGeminiResponse };
