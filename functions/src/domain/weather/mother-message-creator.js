/**
 * メッセージ生成機能
 * 天気予報データを基に、お母さんが話すようなメッセージを生成します
 */

const { getGeminiResponse } = require("../../clients/gemini");
const { WEATHER_MOTHER } = require("../../config/prompts");
const logger = require("../../utils/logger");

/**
 * 天気予報メッセージを生成する
 * @param {Object} weatherData - 整形された天気予報データ
 * @returns {Promise<string>} 生成されたメッセージ
 */
async function generateMotherMessage(weatherData) {
  try {
    logger.info("天気予報メッセージを生成中...");
    const prompt = `${WEATHER_MOTHER}\n\n天気予報データ: ${JSON.stringify(weatherData, null, 2)}`;
    const message = await getGeminiResponse(prompt);

    logger.info("天気予報メッセージの生成が完了しました");
    return message;
  } catch (error) {
    logger.error("天気予報メッセージの生成に失敗しました", error);
    throw error;
  }
}

module.exports = { generateMotherMessage };
