/**
 * Firestoreクライアント
 * データの永続化機能を提供します
 */

const admin = require("firebase-admin");
const { getFirestore } = require("firebase-admin/firestore");
const { COLLECTION_NAME } = require("../config/constants");
const logger = require("../utils/logger");

// Firebase Admin の初期化（ADCを使用）
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  });
}

const db = getFirestore();

/**
 * 天気予報データを保存する
 * @param {Object} params - 保存するデータのパラメータ
 * @param {string} params.documentId - ドキュメントID
 * @param {string} params.areaCode - 地域コード
 * @param {string} params.weatherForecasts - 天気予報データ（JSON文字列）
 * @param {string} params.generatedMessage - 生成されたメッセージ
 * @param {Date} params.createdat - 作成日時
 * @returns {Promise<boolean>} 保存が成功したかどうか
 */
async function saveWeatherData({
  documentId,
  areaCode,
  weatherForecasts,
  generatedMessage,
  createdat,
}) {
  try {
    const docRef = db.collection(COLLECTION_NAME).doc(documentId);

    await docRef.set({
      areaCode,
      weatherForecasts,
      generatedMessage,
      createdAt: admin.firestore.Timestamp.fromDate(createdat),
    });

    logger.info("ドキュメントの保存に成功しました！");
    return true;
  } catch (error) {
    logger.error("Firestore書き込みエラー", error);
    throw error;
  }
}

/**
 * 天気予報データを取得する
 * @param {string} documentId - ドキュメントID
 * @returns {Promise<Object|null>} 天気予報データ
 */
async function getWeatherData(documentId) {
  try {
    const docRef = db.collection(COLLECTION_NAME).doc(documentId);
    const doc = await docRef.get();

    if (!doc.exists) {
      logger.info(`ドキュメントが存在しません: ${documentId}`);
      return null;
    }

    return doc.data();
  } catch (error) {
    logger.error("Firestore読み込みエラー", error);
    throw error;
  }
}

/**
 * 指定した日付の天気予報データを取得する
 * @param {string} areaCode - 地域コード
 * @param {Date} date - 対象日付
 * @returns {Promise<Object|null>} 天気予報データ
 */
async function getWeatherDataByDate(areaCode, date) {
  try {
    const formattedDate = date.toISOString().split("T")[0].replace(/-/g, "");
    const documentId = `${formattedDate}-${areaCode}`;
    return await getWeatherData(documentId);
  } catch (error) {
    logger.error("Firestore読み込みエラー", error);
    throw error;
  }
}

module.exports = {
  saveWeatherData,
  getWeatherData,
  getWeatherDataByDate,
};
