/**
 * 天気予報APIクライアント
 * @file weather.js
 */

const { info, error } = require("../utils/logger");

/**
 * 気象庁APIのレスポンスから今日・明日の予報データのみを抽出
 * @param {Array} weatherData - 気象庁APIのレスポンスデータ
 * @returns {Object} 今日・明日の予報データ
 */
function filterWeatherData(weatherData) {
  // 気象庁APIのレスポンスは配列形式で、
  // weatherData[0] が今日・明日の予報
  // weatherData[1] が週間予報
  const todayAndTomorrowForecast = weatherData[0];
  return todayAndTomorrowForecast;
}

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
    const filteredWeather = filterWeatherData(weather);

    info("天気予報データを取得完了", { areaId });

    return filteredWeather;
  } catch (err) {
    error("天気予報データの取得に失敗", { areaId, error: err });
    throw err;
  }
}

module.exports = { getWeatherForecast };
