/**
 * 気象庁APIクライアント
 * 天気予報データを取得するための機能を提供します
 */

const logger = require("../utils/logger");

/**
 * 気象庁APIから天気予報を取得する
 * @param {string} areaId - 地域コード
 * @returns {Promise<Object>} 天気予報データ
 */
async function getWeatherForecast(areaId) {
  try {
    const formattedAreaId = areaId.padStart(6, "0");
    const url = `https://www.jma.go.jp/bosai/forecast/data/forecast/${formattedAreaId}.json`;

    const response = await fetch(url);
    const weather = await response.json();
    return weather;
  } catch (error) {
    logger.error("気象庁API エラー", error);
    throw error;
  }
}

module.exports = { getWeatherForecast };
