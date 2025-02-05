/**
 * Expo通知クライアント
 * プッシュ通知の送信機能を提供します
 */

const { Expo } = require("expo-server-sdk");
const logger = require("../utils/logger");

// Expoクライアントのインスタンスを作成
const expo = new Expo();

/**
 * プッシュ通知を送信する
 * @param {string} expoPushToken - Expoプッシュ通知トークン
 * @param {string} message - 送信するメッセージ
 * @returns {Promise<void>}
 */
async function sendPushNotification(expoPushToken, message) {
  // トークンが有効なExpoプッシュトークンかチェック
  if (!Expo.isExpoPushToken(expoPushToken)) {
    logger.error(`プッシュトークンが無効です: ${expoPushToken}`);
    return;
  }

  // 通知メッセージを作成
  const messages = [
    {
      to: expoPushToken,
      sound: "default",
      title: "お天気おかん",
      body: message,
      data: { withSome: "data" },
    },
  ];

  try {
    // メッセージをチャンクに分割して送信
    const chunks = expo.chunkPushNotifications(messages);
    const tickets = [];

    // 各チャンクを送信
    for (const chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
        logger.info("プッシュ通知を送信しました:", ticketChunk);
      } catch (error) {
        logger.error("プッシュ通知の送信に失敗しました:", error);
      }
    }

    // レシートを取得
    const receiptIds = [];
    for (const ticket of tickets) {
      if (ticket.id) {
        receiptIds.push(ticket.id);
      }
    }

    const receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds);

    // レシートを確認
    for (const chunk of receiptIdChunks) {
      try {
        const receipts = await expo.getPushNotificationReceiptsAsync(chunk);

        for (const receiptId in receipts) {
          const { status, message: receiptMessage, details } = receipts[receiptId];

          if (status === "ok") {
            logger.info("プッシュ通知が正常に配信されました");
          } else if (status === "error") {
            logger.error(`プッシュ通知でエラーが発生しました:`, receiptMessage, details);
          }
        }
      } catch (error) {
        logger.error("レシートの取得に失敗しました:", error);
      }
    }
  } catch (error) {
    logger.error("プッシュ通知処理でエラーが発生しました:", error);
    throw error;
  }
}

module.exports = { sendPushNotification };
