/**
 * 天気データ取得サービス
 * @file fetchWeatherData.js
 */

const { jmaApi } = require("../../clients");
const logger = require("../../utils/logger");

/**
 * 指定された地域の天気予報データを取得
 * @param {string} areaCode - 地域コード
 * @returns {Promise<Object>} 整形された天気予報データ
 * @throws {Error} データ取得エラー
 */
const fetchWeatherData = async (areaCode) => {
  try {
    logger.info(`天気予報データの取得開始: ${areaCode}`);

    // 気象庁APIからデータを取得
    const rawData = await jmaApi.fetchWeatherForecast(areaCode);

    // データの検証
    if (!rawData || !rawData.timeSeries || !Array.isArray(rawData.timeSeries)) {
      throw new Error("Invalid weather data format");
    }

    // 必要なデータの抽出と整形
    const weatherData = {
      publishingOffice: rawData.publishingOffice,
      reportDatetime: rawData.reportDatetime,
      timeSeries: rawData.timeSeries,
      areaCode,
      fetchedAt: new Date().toISOString(),
    };

    logger.info(`天気予報データの取得完了: ${areaCode}`);
    return weatherData;
  } catch (error) {
    logger.error("天気予報データの取得エラー", {
      areaCode,
      error: error.message,
    });
    throw error;
  }
};

module.exports = {
  fetchWeatherData,
};
