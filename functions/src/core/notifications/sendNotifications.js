const admin = require("firebase-admin");
const { sendPushNotification } = require("./notification");

/**
 * 全ユーザーにプッシュ通知を送信する関数
 * @returns {Promise<void>}
 */
const sendNotificationsToAllUsers = async () => {
  try {
    const db = admin.firestore();
    const today = new Date();
    const formattedDate = today.toISOString().split("T")[0].replace(/-/g, "");

    // ユーザー情報を取得
    const usersSnapshot = await db.collection("users").get();

    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      const { expoPushToken, areaCode, isPushNotificationEnabled } = userData;

      // プッシュ通知が無効な場合はスキップ
      if (!isPushNotificationEnabled) {
        console.log(`ユーザー ${userDoc.id} はプッシュ通知を無効にしています`);
        continue;
      }

      // プッシュトークンがない場合はスキップ
      if (!expoPushToken) {
        console.log(`ユーザー ${userDoc.id} にプッシュトークンが設定されていません`);
        continue;
      }

      try {
        // 天気情報を取得
        const weatherDocId = `${formattedDate}-${areaCode}`;
        const weatherDoc = await db.collection("weather_data").doc(weatherDocId).get();

        if (!weatherDoc.exists) {
          console.log(`天気情報が見つかりません: ${weatherDocId}`);
          continue;
        }

        const weatherData = weatherDoc.data();
        const message = weatherData.generatedMessage;

        // プッシュ通知を送信
        await sendPushNotification(expoPushToken, message);
        console.log(`ユーザー ${userDoc.id} にプッシュ通知を送信しました`);
      } catch (error) {
        console.error(
          `ユーザー ${userDoc.id} へのプッシュ通知送信中にエラーが発生しました:`,
          error
        );
      }
    }
  } catch (error) {
    console.error("プッシュ通知の一括送信中にエラーが発生しました:", error);
    throw error;
  }
};

module.exports = {
  sendNotificationsToAllUsers,
};
