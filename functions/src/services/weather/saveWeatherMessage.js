/**
 * 天気メッセージ保存サービス
 * @file saveWeatherMessage.js
 */

const { firebase } = require("../../clients");
const logger = require("../../utils/logger");

/**
 * 天気予報メッセージをFirestoreに保存
 * @param {Object} params - 保存するデータのパラメータ
 * @param {string} params.areaCode - 地域コード
 * @param {Object} params.weatherData - 天気予報データ
 * @param {string} params.message - 生成されたメッセージ
 * @returns {Promise<string>} 保存されたドキュメントID
 * @throws {Error} 保存エラー
 */
const saveWeatherMessage = async ({ areaCode, weatherData, message }) => {
  try {
    logger.info(`天気予報メッセージの保存開始: ${areaCode}`);

    const documentId = await firebase.saveWeatherMessage(areaCode, weatherData, message);

    logger.info(`天気予報メッセージの保存完了: ${documentId}`);
    return documentId;
  } catch (error) {
    logger.error("天気予報メッセージの保存エラー", {
      areaCode,
      error: error.message,
    });
    throw error;
  }
};

module.exports = {
  saveWeatherMessage,
};
