/**
 * 天気予報データの永続化機能
 * 天気予報データとメッセージをデータベースに保存・取得します
 */

const {
  saveWeatherData,
  getWeatherData,
  getWeatherDataByDate,
} = require("../../clients/firestore");
const { generateDocumentId } = require("../../utils/date");
const logger = require("../../utils/logger");

/**
 * 天気予報データを保存する
 * @param {Object} params - 保存するデータのパラメータ
 * @param {string} params.areaCode - 地域コード
 * @param {Object} params.weatherData - 天気予報データ
 * @param {string} params.message - 生成されたメッセージ
 * @returns {Promise<boolean>} 保存が成功したかどうか
 */
async function storeWeatherForecast({ areaCode, weatherData, message }) {
  try {
    logger.info("天気予報データを保存中...");
    const documentId = generateDocumentId(areaCode);
    const result = await saveWeatherData({
      documentId,
      areaCode,
      weatherForecasts: JSON.stringify(weatherData),
      generatedMessage: message,
      createdat: new Date(),
    });

    logger.info("天気予報データの保存が完了しました");
    return result;
  } catch (error) {
    logger.error("天気予報データの保存に失敗しました", error);
    throw error;
  }
}

/**
 * 指定した日付の天気予報データを取得する
 * @param {string} areaCode - 地域コード
 * @param {Date} [date=new Date()] - 対象日付
 * @returns {Promise<Object|null>} 天気予報データ
 */
async function retrieveWeatherForecast(areaCode, date = new Date()) {
  try {
    logger.info(`天気予報データを取得中... (地域コード: ${areaCode}, 日付: ${date.toISOString()})`);
    const data = await getWeatherDataByDate(areaCode, date);

    if (!data) {
      logger.info("天気予報データが見つかりませんでした");
      return null;
    }

    logger.info("天気予報データの取得が完了しました");
    return {
      ...data,
      weatherForecasts: JSON.parse(data.weatherForecasts),
    };
  } catch (error) {
    logger.error("天気予報データの取得に失敗しました", error);
    throw error;
  }
}

module.exports = {
  storeWeatherForecast,
  retrieveWeatherForecast,
};
