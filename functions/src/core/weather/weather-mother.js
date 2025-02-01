/**
 * 天気予報生成の中核機能
 * @file weather-mother.js
 */

const admin = require("firebase-admin");
const { generateDocumentId } = require("../../utils/date");
const { COLLECTIONS } = require("../../config/firestore");
const { info, error } = require("../../utils/logger");

/**
 * 天気予報データを生成し保存
 * @param {string} areaCode - 地域コード
 * @param {Object} weatherData - 天気予報データ
 * @returns {Promise<string>} 生成されたドキュメントID
 */
async function generateWeatherForecast(areaCode, weatherData) {
  try {
    const db = admin.firestore();
    const docId = generateDocumentId(areaCode);

    info(`天気予報データを生成: ${docId}`);

    await db
      .collection(COLLECTIONS.WEATHER_DATA)
      .doc(docId)
      .set({
        areaCode,
        weatherForecasts: JSON.stringify(weatherData),
        generatedMessage: `${areaCode}の天気予報が生成されました。`,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

    info(`天気予報データを保存完了: ${docId}`);
    return docId;
  } catch (err) {
    error("天気予報データの生成に失敗", { areaCode, error: err });
    throw err;
  }
}

module.exports = {
  generateWeatherForecast,
};
