/**
 * 通知ドメイン
 * プッシュ通知の送信とユーザー設定の管理を行います
 */

const { sendNotification, sendBatchNotifications } = require("./notification-sender");
const {
  getUserNotificationSettings,
  updateNotificationSettings,
  getActiveNotificationUsers,
} = require("./user-preferences");
const { getStoredWeatherData } = require("../weather");
const logger = require("../../utils/logger");
const admin = require("firebase-admin");

/**
 * 全ユーザーに天気予報通知を送信
 * @returns {Promise<Array<Object>>} 送信結果
 */
async function sendWeatherNotificationsToAllUsers() {
  try {
    logger.info("全ユーザーへの天気予報通知を開始します");

    // 通知対象ユーザーを取得
    const users = await getActiveNotificationUsers();
    if (!users.length) {
      logger.info("通知対象のユーザーが見つかりませんでした");
      return [];
    }

    // 各ユーザーの天気予報データを取得して通知を作成
    const notifications = await Promise.all(
      users.map(async (user) => {
        try {
          const weatherData = await getStoredWeatherData(user.areaCode);
          if (!weatherData) {
            logger.warn(
              `天気予報データが見つかりません (ユーザーID: ${user.id}, 地域コード: ${user.areaCode})`
            );
            return null;
          }

          return {
            token: user.expoPushToken,
            title: "今日の天気予報",
            message: weatherData.generatedMessage,
            data: {
              userId: user.id,
              areaCode: user.areaCode,
              timestamp: new Date().toISOString(),
            },
          };
        } catch (error) {
          logger.error(`通知の準備に失敗しました (ユーザーID: ${user.id})`, error);
          return null;
        }
      })
    );

    // 通知を送信
    const validNotifications = notifications.filter(Boolean);
    const results = await sendBatchNotifications(validNotifications);

    logger.info("全ユーザーへの天気予報通知が完了しました");
    return results;
  } catch (error) {
    logger.error("天気予報通知の送信に失敗しました", error);
    throw error;
  }
}

/**
 * 特定のユーザーに天気予報通知を送信
 * @param {string} userId - ユーザーID
 * @returns {Promise<boolean>} 送信が成功したかどうか
 */
async function sendWeatherNotificationToUser(userId) {
  try {
    logger.info(`ユーザーへの天気予報通知を開始します (ユーザーID: ${userId})`);

    // ユーザーの通知設定を取得
    const settings = await getUserNotificationSettings(userId);
    if (
      !settings ||
      !settings.isPushNotificationEnabled ||
      !settings.expoPushToken ||
      !settings.areaCode
    ) {
      logger.info("通知対象外のユーザーです");
      return false;
    }

    // 天気予報データを取得
    const weatherData = await getStoredWeatherData(settings.areaCode);
    if (!weatherData) {
      logger.warn("天気予報データが見つかりません");
      return false;
    }

    // 通知を送信
    await sendNotification({
      token: settings.expoPushToken,
      title: "今日の天気予報",
      message: weatherData.generatedMessage,
      data: {
        userId,
        areaCode: settings.areaCode,
        timestamp: new Date().toISOString(),
      },
    });

    logger.info("天気予報通知の送信が完了しました");
    return true;
  } catch (error) {
    logger.error(`天気予報通知の送信に失敗しました (ユーザーID: ${userId})`, error);
    throw error;
  }
}

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
  sendWeatherNotificationsToAllUsers,
  sendWeatherNotificationToUser,
  getUserNotificationSettings,
  updateNotificationSettings,
  sendNotificationsToAllUsers,
  updateUserNotificationSettings,
};
