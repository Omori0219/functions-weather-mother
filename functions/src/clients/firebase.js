/**
 * Firebaseクライアント
 * @file firebase.js
 */

const admin = require("firebase-admin");
const { getFirestore } = require("firebase-admin/firestore");
const { COLLECTIONS } = require("../config/firestore");
const { info, error } = require("../utils/logger");

// Firebase Admin の初期化（ADCを使用）
admin.initializeApp({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
});

const db = getFirestore();

/**
 * 天気予報データを保存
 * @param {Object} params - 保存するデータのパラメータ
 * @param {string} params.documentId - ドキュメントID
 * @param {string} params.areaCode - 地域コード
 * @param {Object} params.weatherForecasts - 天気予報データ
 * @param {string} params.generatedMessage - 生成されたメッセージ
 * @param {Date} params.createdat - 作成日時
 * @returns {Promise<boolean>} 保存成功時はtrue
 */
async function saveWeatherData({
  documentId,
  areaCode,
  weatherForecasts,
  generatedMessage,
  createdat,
}) {
  try {
    const docRef = db.collection(COLLECTIONS.WEATHER_DATA).doc(documentId);

    await docRef.set({
      areaCode,
      weatherForecasts,
      generatedMessage,
      createdAt: admin.firestore.Timestamp.fromDate(createdat),
    });

    info("天気予報データを保存しました", { documentId });
    return true;
  } catch (err) {
    error("天気予報データの保存に失敗", { documentId, error: err });
    throw err;
  }
}

module.exports = { saveWeatherData };
