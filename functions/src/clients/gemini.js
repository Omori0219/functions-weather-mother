/**
 * Gemini AI クライアント
 * @file gemini.js
 */

const { GoogleGenerativeAI } = require("@google/generative-ai");
const logger = require("../utils/logger");

// Geminiモデルの初期化
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

/**
 * 天気予報データを母のような口調に変換
 * @param {Object} weatherData - 気象庁APIから取得した天気予報データ
 * @returns {Promise<string>} 生成されたメッセージ
 * @throws {Error} AI生成エラー
 */
const generateMotherlikeMessage = async (weatherData) => {
  try {
    logger.info("天気予報メッセージの生成開始");

    // プロンプトの作成
    const prompt = `
あなたは優しい母親として、以下の天気予報データを子供に伝えるように説明してください。
心配性で優しい母親らしく、天気に応じた注意点やアドバイスも含めてください。

天気予報データ:
${JSON.stringify(weatherData, null, 2)}

以下の点に注意して生成してください：
- 「ね」「よ」などの女性的な語尾を使用
- 具体的な数値（気温、降水確率など）は保持
- 季節感のある表現を使用
- 200文字程度で簡潔に
`;

    // メッセージの生成
    const result = await model.generateContent(prompt);
    const message = result.response.text();

    logger.info("天気予報メッセージの生成完了");
    return message;
  } catch (error) {
    logger.error("天気予報メッセージの生成エラー", {
      error: error.message,
    });
    throw new Error(`Failed to generate weather message: ${error.message}`);
  }
};

module.exports = {
  generateMotherlikeMessage,
};
