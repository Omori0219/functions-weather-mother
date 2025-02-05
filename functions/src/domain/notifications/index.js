/**
 * 通知ドメイン
 * プッシュ通知の送信とユーザー設定の管理を行います
 */

const { sendPushNotification } = require("../../clients/expo");
const { getWeatherDataByDate } = require("../../clients/firebase");
const logger = require("../../utils/logger");
const admin = require("firebase-admin");

/**
 * 全ユーザーに通知を送信
 * @returns {Promise<void>}
 */
async function sendNotificationsToAllUsers() {
  const db = admin.firestore();
  const today = new Date();
  const formattedDate = today.toISOString().split("T")[0].replace(/-/g, "");

  try {
    logger.info("全ユーザーへの通知送信を開始します...");

    // 通知を有効にしているユーザーを取得
    const usersSnapshot = await db
      .collection("users")
      .where("isPushNotificationEnabled", "==", true)
      .get();

    if (usersSnapshot.empty) {
      logger.info("通知対象のユーザーが見つかりませんでした");
      return;
    }

    // ユーザーごとに通知を送信
    const notificationPromises = usersSnapshot.docs.map(async (userDoc) => {
      const userData = userDoc.data();
      const { areaCode, expoPushToken } = userData;

      try {
        // 天気データを取得
        const weatherData = await getWeatherDataByDate(areaCode, formattedDate);
        if (!weatherData) {
          logger.warn(`天気データが見つかりません: ${areaCode}, ${formattedDate}`);
          return;
        }

        // 通知を送信
        await sendPushNotification(expoPushToken, {
          title: "今日の天気予報",
          body: weatherData.generatedMessage,
          data: {
            areaCode,
            date: formattedDate,
          },
        });

        logger.info(`通知送信成功: ${userDoc.id}`);
      } catch (error) {
        logger.error(`ユーザーへの通知送信に失敗: ${userDoc.id}`, error);
      }
    });

    await Promise.all(notificationPromises);
    logger.info("全ユーザーへの通知送信が完了しました");
  } catch (error) {
    logger.error("通知送信処理でエラーが発生しました:", error);
    throw error;
  }
}

/**
 * ユーザーの通知設定を更新
 * @param {string} userId - ユーザーID
 * @param {Object} settings - 更新する設定
 * @param {boolean} settings.isPushNotificationEnabled - 通知の有効/無効
 * @param {string} [settings.expoPushToken] - Expoプッシュトークン
 * @returns {Promise<void>}
 */
async function updateUserNotificationSettings(userId, settings) {
  const db = admin.firestore();
  const userRef = db.collection("users").doc(userId);

  try {
    logger.info(`ユーザーの通知設定を更新します: ${userId}`);

    const updateData = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    if (typeof settings.isPushNotificationEnabled === "boolean") {
      updateData.isPushNotificationEnabled = settings.isPushNotificationEnabled;
    }

    if (settings.expoPushToken) {
      updateData.expoPushToken = settings.expoPushToken;
    }

    await userRef.update(updateData);
    logger.info(`通知設定の更新が完了しました: ${userId}`);
  } catch (error) {
    logger.error(`通知設定の更新に失敗しました: ${userId}`, error);
    throw error;
  }
}

module.exports = {
  sendNotificationsToAllUsers,
  updateUserNotificationSettings,
};
