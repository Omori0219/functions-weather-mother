/**
 * 天気予報APIクライアント
 * @file weather.js
 */

const { info, error } = require("../utils/logger");

/**
 * 気象庁APIから天気予報を取得
 * @param {string} areaId - 地域ID
 * @returns {Promise<Object>} 天気予報データ
 */
async function getWeatherForecast(areaId) {
  try {
    info("天気予報データを取得開始", { areaId });

    const formattedAreaId = areaId.padStart(6, "0");
    const url = `https://www.jma.go.jp/bosai/forecast/data/forecast/${formattedAreaId}.json`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const weather = await response.json();
    info("天気予報データを取得完了", { areaId });

    return weather;
  } catch (err) {
    error("天気予報データの取得に失敗", { areaId, error: err });
    throw err;
  }
}

module.exports = { getWeatherForecast };
