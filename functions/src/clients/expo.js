/**
 * Expoクライアント
 * Expo Push Notification Serviceとの通信を担当します
 */

const { Expo } = require("expo-server-sdk");
const logger = require("../utils/logger");

const expo = new Expo();

/**
 * プッシュ通知を送信
 * @param {string} token - プッシュ通知トークン
 * @param {Object} notification - 通知内容
 * @param {string} notification.title - 通知タイトル
 * @param {string} notification.body - 通知本文
 * @param {Object} [notification.data] - 追加データ
 * @returns {Promise<void>}
 */
async function sendPushNotification(token, { title, body, data = {} }) {
  try {
    // トークンの形式を検証
    if (!Expo.isExpoPushToken(token)) {
      logger.error(`無効なExpoプッシュトークンです: ${token}`);
      throw new Error("無効なプッシュトークンです");
    }

    // 通知メッセージを構築
    const message = {
      to: token,
      sound: "default",
      title,
      body,
      data,
      priority: "high",
    };

    // 通知を送信
    logger.info(`プッシュ通知を送信中... (トークン: ${token})`);
    const chunks = expo.chunkPushNotifications([message]);

    const tickets = [];
    for (const chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        logger.error("チャンクの送信に失敗しました", error);
        throw error;
      }
    }

    // 送信結果を確認
    for (const ticket of tickets) {
      if (ticket.status === "error") {
        logger.error("通知の送信に失敗しました", ticket.details);
        throw new Error(ticket.message);
      }
    }

    logger.info("プッシュ通知の送信が完了しました");
  } catch (error) {
    logger.error("プッシュ通知の送信に失敗しました", error);
    throw error;
  }
}

module.exports = { sendPushNotification };
