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
  const startTime = Date.now();
  const collection = COLLECTIONS.WEATHER_DATA;

  info("天気予報データの保存を開始", {
    operation: "saveWeatherData",
    collection,
    documentId,
    areaCode,
    hasWeatherForecasts: !!weatherForecasts,
    hasGeneratedMessage: !!generatedMessage,
  });

  try {
    const docRef = db.collection(collection).doc(documentId);
    const data = {
      areaCode,
      weatherForecasts,
      generatedMessage,
      createdAt: admin.firestore.Timestamp.fromDate(createdat),
    };

    await docRef.set(data);

    // 書き込み後の検証
    const writtenDoc = await docRef.get();
    if (!writtenDoc.exists) {
      throw new Error("Document not found after write");
    }

    const endTime = Date.now();
    info("天気予報データを保存しました", {
      operation: "saveWeatherData",
      status: "success",
      collection,
      documentId,
      areaCode,
      processingTimeMs: endTime - startTime,
      data: {
        hasWeatherForecasts: !!weatherForecasts,
        hasGeneratedMessage: !!generatedMessage,
        createdAt: createdat.toISOString(),
      },
    });

    return true;
  } catch (err) {
    const endTime = Date.now();
    error("天気予報データの保存に失敗", {
      operation: "saveWeatherData",
      status: "error",
      collection,
      documentId,
      areaCode,
      processingTimeMs: endTime - startTime,
      error: err,
      data: {
        hasWeatherForecasts: !!weatherForecasts,
        hasGeneratedMessage: !!generatedMessage,
        createdAt: createdat.toISOString(),
      },
    });
    throw err;
  }
}

module.exports = { saveWeatherData };
