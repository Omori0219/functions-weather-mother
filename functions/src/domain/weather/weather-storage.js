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
 * 天気予報データを保存
 * @param {Object} params - 保存するデータのパラメータ
 * @param {string} params.areaCode - 地域コード
 * @param {Object} params.weatherData - 天気予報データ
 * @param {string} params.message - 生成されたメッセージ
 * @returns {Promise<boolean>} 保存が成功したかどうか
 */
async function storeWeatherForecast({ areaCode, weatherData, message }) {
  try {
    logger.info("天気予報データを保存中...");

    // ドキュメントIDを生成
    const documentId = generateDocumentId(areaCode);

    // データを保存
    const result = await saveWeatherData({
      documentId,
      areaCode,
      weatherForecasts: JSON.stringify(weatherData),
      generatedMessage: message,
      createdAt: new Date(),
    });

    logger.info("天気予報データの保存が完了しました");
    return result;
  } catch (error) {
    logger.error("天気予報データの保存に失敗しました", error);
    throw error;
  }
}

/**
 * 指定した日付の天気予報データを取得
 * @param {string} areaCode - 地域コード
 * @param {Date} [date=new Date()] - 対象日付（省略時は当日）
 * @returns {Promise<Object|null>} 天気予報データ
 */
async function retrieveWeatherForecast(areaCode, date = new Date()) {
  try {
    logger.info(`天気予報データを取得中... (地域コード: ${areaCode}, 日付: ${date.toISOString()})`);

    // ドキュメントIDを生成
    const documentId = generateDocumentId(areaCode, date);

    // データを取得
    const data = await getWeatherData(documentId);

    if (!data) {
      logger.info("天気予報データが見つかりませんでした");
      return null;
    }

    // 天気予報データをパース
    try {
      return {
        ...data,
        weatherForecasts: JSON.parse(data.weatherForecasts),
      };
    } catch (parseError) {
      logger.error("天気予報データのパースに失敗しました", parseError);
      throw new Error("保存された天気予報データの形式が不正です");
    }
  } catch (error) {
    logger.error("天気予報データの取得に失敗しました", error);
    throw error;
  }
}

module.exports = {
  storeWeatherForecast,
  retrieveWeatherForecast,
};
