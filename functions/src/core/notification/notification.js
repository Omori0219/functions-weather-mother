/**
 * プッシュ通知の基本機能
 * @file notification.js
 */

const { Expo } = require("expo-server-sdk");
const { info, error } = require("../../utils/logger");

/**
 * Expoプッシュ通知を送信
 * @param {string} expoPushToken - Expoプッシュトークン
 * @param {string} message - 通知メッセージ
 * @returns {Promise<void>}
 */
async function sendPushNotification(expoPushToken, message) {
  try {
    if (!Expo.isExpoPushToken(expoPushToken)) {
      throw new Error(`無効なExpoプッシュトークン: ${expoPushToken}`);
    }

    const expo = new Expo();
    const messages = [
      {
        to: expoPushToken,
        sound: "default",
        body: message,
        data: { withSome: "data" },
      },
    ];

    const chunks = expo.chunkPushNotifications(messages);
    const tickets = [];

    for (let chunk of chunks) {
      try {
        info(`通知を送信: ${expoPushToken}`);
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      } catch (err) {
        error("通知チャンクの送信に失敗", { error: err });
        throw err;
      }
    }

    info(`通知送信完了: ${expoPushToken}`);
    return tickets;
  } catch (err) {
    error("通知送信に失敗", { token: expoPushToken, error: err });
    throw err;
  }
}

module.exports = {
  sendPushNotification,
};
