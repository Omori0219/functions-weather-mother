/**
 * Firebaseクライアント
 * @file firebase.js
 */

const admin = require("firebase-admin");
const { getFirestore } = require("firebase-admin/firestore");
const { COLLECTIONS } = require("../config/firestore");
const { info, error } = require("../utils/logger");
const { getDb } = require("../utils/firestore");

// Firebase Admin SDKの初期化（未初期化の場合のみ）
if (!admin.apps.length) {
  admin.initializeApp();
}

// Firestoreインスタンスの取得
const db = admin.firestore();
const messaging = admin.messaging();

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
      updatedAt: admin.firestore.Timestamp.fromDate(createdat),
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

/**
 * プッシュ通知を送信
 * @param {string} token - FCMトークン
 * @param {string} message - 通知メッセージ
 * @returns {Promise<string>} メッセージID
 * @throws {Error} FCM送信エラー
 */
const sendPushNotification = async (token, message) => {
  try {
    info("プッシュ通知の送信開始", { token });

    const response = await messaging.send({
      token,
      notification: {
        title: "今日の天気予報",
        body: message,
      },
      android: {
        priority: "high",
        notification: {
          channelId: "weather_notification",
        },
      },
    });

    info("プッシュ通知の送信完了", { messageId: response });
    return response;
  } catch (error) {
    error("プッシュ通知の送信エラー", {
      token,
      error: error.message,
    });
    throw new Error(`Failed to send push notification: ${error.message}`);
  }
};

module.exports = {
  db,
  messaging,
  saveWeatherData,
  sendPushNotification,
};
