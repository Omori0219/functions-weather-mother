/**
 * 通知送信の制御機能
 * @file sendNotifications.js
 */

const admin = require("firebase-admin");
const { sendPushNotification } = require("./notification");
const { COLLECTIONS } = require("../../config/firestore");
const { generateDocumentId } = require("../../utils/date");
const { info, error } = require("../../utils/logger");

/**
 * 全ユーザーに通知を送信
 * @returns {Promise<void>}
 */
async function sendNotificationsToAllUsers() {
  try {
    info("全ユーザーへの通知送信を開始");
    const db = admin.firestore();

    // 通知を有効にしているユーザーを取得
    const usersSnapshot = await db
      .collection(COLLECTIONS.USERS)
      .where("isPushNotificationEnabled", "==", true)
      .get();

    if (usersSnapshot.empty) {
      info("通知対象のユーザーが存在しません");
      return;
    }

    // 各ユーザーの地域の天気予報を取得して通知
    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      const { areaCode, expoPushToken } = userData;

      try {
        // 天気予報データを取得
        const weatherDocId = generateDocumentId(areaCode);
        const weatherDoc = await db.collection(COLLECTIONS.WEATHER_DATA).doc(weatherDocId).get();

        if (!weatherDoc.exists) {
          error("天気予報データが存在しません", { areaCode });
          continue;
        }

        const weatherData = weatherDoc.data();
        await sendPushNotification(expoPushToken, weatherData.generatedMessage);

        info(`通知送信成功: ${userDoc.id}`);
      } catch (err) {
        error("ユーザーへの通知送信に失敗", {
          userId: userDoc.id,
          error: err,
        });
      }
    }

    info("全ユーザーへの通知送信を完了");
  } catch (err) {
    error("通知送信処理全体が失敗", { error: err });
    throw err;
  }
}

module.exports = {
  sendNotificationsToAllUsers,
};
