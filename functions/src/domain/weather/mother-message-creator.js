/**
 * メッセージ生成機能
 * 天気予報データを基に、お母さんが話すようなメッセージを生成します
 */

const { getGeminiResponse } = require("../../clients/gemini");
const { WEATHER_MOTHER } = require("../../config/prompts");
const logger = require("../../utils/logger");

/**
 * 天気予報メッセージを生成
 * @param {Object} weatherData - 整形された天気予報データ
 * @returns {Promise<string>} 生成されたメッセージ
 */
async function generateMotherMessage(weatherData) {
  try {
    logger.info("天気予報メッセージを生成中...");

    // プロンプトを構築
    const prompt = `${WEATHER_MOTHER}\n\n天気予報データ: ${JSON.stringify(weatherData, null, 2)}`;

    // メッセージを生成
    const response = await getGeminiResponse(prompt);

    // レスポンスをパース
    let message;
    try {
      const parsed = JSON.parse(response);
      message = parsed.mother_message;
    } catch (parseError) {
      logger.error("メッセージのパースに失敗しました", {
        response,
        error: parseError,
      });
      throw new Error("メッセージの形式が不正です");
    }

    // メッセージの妥当性チェック
    if (!message || typeof message !== "string" || message.length > 150) {
      logger.error("無効なメッセージを受信しました", { message });
      throw new Error("生成されたメッセージが要件を満たしていません");
    }

    logger.info("天気予報メッセージの生成が完了しました");
    return message;
  } catch (error) {
    logger.error("天気予報メッセージの生成に失敗しました", error);
    throw error;
  }
}

module.exports = { generateMotherMessage };
