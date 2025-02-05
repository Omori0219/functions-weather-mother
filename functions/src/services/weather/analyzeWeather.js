/**
 * 天気解析サービス
 * @file analyzeWeather.js
 */

const { gemini } = require("../../clients");
const logger = require("../../utils/logger");

/**
 * 天気予報データを解析し、母のような口調のメッセージを生成
 * @param {Object} weatherData - 天気予報データ
 * @returns {Promise<string>} 生成されたメッセージ
 * @throws {Error} 解析エラー
 */
const analyzeWeather = async (weatherData) => {
  try {
    logger.info("天気予報データの解析開始");

    // Gemini AIを使用してメッセージを生成
    const message = await gemini.generateWeatherMessage(weatherData);

    logger.info("天気予報データの解析完了");
    return message;
  } catch (error) {
    logger.error("天気予報データの解析エラー", {
      error: error.message,
    });
    throw error;
  }
};

module.exports = {
  analyzeWeather,
};
