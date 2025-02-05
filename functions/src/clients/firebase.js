/**
 * Firebaseクライアント
 * @file firebase.js
 */

const admin = require("firebase-admin");
const logger = require("../utils/logger");
const { COLLECTIONS } = require("../config/firestore");

// Firebase Admin の初期化
if (!admin.apps.length) {
  admin.initializeApp();
}

/**
 * Firebaseクライアント
 */
const firebaseClient = {
  /**
   * 天気予報メッセージをFirestoreに保存
   * @param {string} areaCode - 地域コード
   * @param {Object} weatherData - 天気予報データ
   * @param {string} message - 生成されたメッセージ
   * @returns {Promise<string>} 保存されたドキュメントID
   * @throws {Error} 保存エラー
   */
  async saveWeatherMessage(areaCode, weatherData, message) {
    try {
      logger.info(`天気予報メッセージの保存開始: ${areaCode}`);

      const docRef = await admin.firestore().collection(COLLECTIONS.WEATHER_DATA).add({
        areaCode,
        weatherData,
        message,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      logger.info(`天気予報メッセージの保存完了: ${docRef.id}`);
      return docRef.id;
    } catch (error) {
      logger.error("天気予報メッセージの保存エラー", {
        areaCode,
        error: error.message,
      });
      throw error;
    }
  },

  /**
   * プッシュ通知を送信
   * @param {string} token - FCMトークン
   * @param {string} message - 通知メッセージ
   * @returns {Promise<string>} 送信結果
   * @throws {Error} 送信エラー
   */
  async sendNotification(token, message) {
    try {
      logger.info("プッシュ通知の送信開始");

      const response = await admin.messaging().send({
        token,
        notification: {
          title: "今日の天気",
          body: message,
        },
      });

      logger.info("プッシュ通知の送信完了");
      return response;
    } catch (error) {
      logger.error("プッシュ通知の送信エラー", {
        error: error.message,
      });
      throw error;
    }
  },
};

module.exports = firebaseClient;
