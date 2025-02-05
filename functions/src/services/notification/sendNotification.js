/**
 * 通知送信サービス
 * @file sendNotification.js
 */

const { firebase } = require("../../clients");
const logger = require("../../utils/logger");

/**
 * プッシュ通知を送信
 * @param {Object} params - 通知パラメータ
 * @param {string} params.token - FCMトークン
 * @param {string} params.message - 通知メッセージ
 * @returns {Promise<string>} 送信結果
 * @throws {Error} 送信エラー
 */
const sendNotification = async ({ token, message }) => {
  try {
    logger.info("プッシュ通知の送信開始");

    const result = await firebase.sendNotification(token, message);

    logger.info("プッシュ通知の送信完了");
    return result;
  } catch (error) {
    logger.error("プッシュ通知の送信エラー", {
      error: error.message,
    });
    throw error;
  }
};

module.exports = {
  sendNotification,
};
