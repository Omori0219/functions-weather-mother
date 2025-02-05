/**
 * 通知送信機能
 * プッシュ通知の送信を担当します
 */

const { sendPushNotification } = require("../../clients/expo");
const logger = require("../../utils/logger");

/**
 * プッシュ通知を送信
 * @param {Object} params - 通知パラメータ
 * @param {string} params.token - プッシュ通知トークン
 * @param {string} params.title - 通知タイトル
 * @param {string} params.message - 送信するメッセージ
 * @param {Object} [params.data] - 追加データ
 * @returns {Promise<void>}
 */
async function sendNotification({ token, title = "お天気おかん", message, data = {} }) {
  try {
    logger.info(`プッシュ通知を送信中... (トークン: ${token})`);

    // 通知内容の妥当性チェック
    if (!message || typeof message !== "string") {
      logger.error("無効な通知メッセージです", { message });
      throw new Error("通知メッセージが不正です");
    }

    // 通知を送信
    await sendPushNotification(token, {
      title,
      body: message,
      data: {
        timestamp: new Date().toISOString(),
        ...data,
      },
    });

    logger.info("プッシュ通知の送信が完了しました");
  } catch (error) {
    logger.error("プッシュ通知の送信に失敗しました", error);
    throw error;
  }
}

/**
 * 複数のユーザーに通知を送信
 * @param {Array<Object>} notifications - 通知リスト
 * @param {string} notifications[].token - プッシュ通知トークン
 * @param {string} notifications[].title - 通知タイトル
 * @param {string} notifications[].message - 送信するメッセージ
 * @param {Object} [notifications[].data] - 追加データ
 * @returns {Promise<Array<Object>>} 送信結果
 */
async function sendBatchNotifications(notifications) {
  logger.info(`一括通知の送信を開始します (${notifications.length}件)`);
  const results = [];

  for (const notification of notifications) {
    try {
      await sendNotification(notification);
      results.push({
        token: notification.token,
        success: true,
      });
    } catch (error) {
      logger.error(`通知の送信に失敗しました (トークン: ${notification.token})`, error);
      results.push({
        token: notification.token,
        success: false,
        error: error.message,
      });
    }
  }

  const successCount = results.filter((r) => r.success).length;
  logger.info(`一括通知の送信が完了しました (成功: ${successCount}/${notifications.length}件)`);

  return results;
}

module.exports = {
  sendNotification,
  sendBatchNotifications,
};
