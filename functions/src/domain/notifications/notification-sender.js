/**
 * 通知送信機能
 * プッシュ通知の送信を担当します
 */

const { sendPushNotification } = require("../../clients/expo");
const logger = require("../../utils/logger");

/**
 * プッシュ通知を送信する
 * @param {Object} params - 通知パラメータ
 * @param {string} params.token - プッシュ通知トークン
 * @param {string} params.message - 送信するメッセージ
 * @returns {Promise<void>}
 */
async function sendNotification({ token, message }) {
  try {
    logger.info(`プッシュ通知を送信中... (トークン: ${token})`);
    await sendPushNotification(token, message);
    logger.info("プッシュ通知の送信が完了しました");
  } catch (error) {
    logger.error("プッシュ通知の送信に失敗しました", error);
    throw error;
  }
}

module.exports = { sendNotification };
