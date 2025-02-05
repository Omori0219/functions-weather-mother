/**
 * 天気予報ドメイン
 * 天気予報に関する機能を統合し、アプリケーション層に提供します
 */

const { fetchWeatherData } = require("./weather-api-client");
const { generateMotherMessage } = require("./mother-message-creator");
const { storeWeatherForecast, retrieveWeatherForecast } = require("./weather-storage");
const logger = require("../../utils/logger");

/**
 * 天気予報データを処理
 * @param {string} areaCode - 地域コード
 * @returns {Promise<Object>} 処理結果
 */
async function processWeatherData(areaCode) {
  try {
    logger.info(`天気予報処理を開始します (地域コード: ${areaCode})`);

    // 天気予報データを取得
    const weatherData = await fetchWeatherData(areaCode);

    // メッセージを生成
    const message = await generateMotherMessage(weatherData);

    // データを保存
    await storeWeatherForecast({
      areaCode,
      weatherData,
      message,
    });

    logger.info("天気予報処理が完了しました");
    return {
      weatherData,
      message,
    };
  } catch (error) {
    logger.error(`天気予報処理でエラーが発生しました (地域コード: ${areaCode}):`, error);
    throw error;
  }
}

/**
 * 保存済みの天気予報データを取得
 * @param {string} areaCode - 地域コード
 * @param {Date} [date] - 対象日付（省略時は当日）
 * @returns {Promise<Object|null>} 天気予報データ
 */
async function getStoredWeatherData(areaCode, date) {
  try {
    return await retrieveWeatherForecast(areaCode, date);
  } catch (error) {
    logger.error(`保存済みデータの取得でエラーが発生しました (地域コード: ${areaCode}):`, error);
    throw error;
  }
}

module.exports = {
  processWeatherData,
  getStoredWeatherData,
};
