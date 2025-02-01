/**
 * バッチ処理の制御機能
 * @file batch-processor.js
 */

const admin = require("firebase-admin");
const { generateWeatherForecast } = require("../weather/weather-mother");
const { sendNotificationsToAllUsers } = require("../notification/sendNotifications");
const { COLLECTIONS, LIMITS } = require("../../config/firestore");
const { info, error } = require("../../utils/logger");

/**
 * バッチ処理のメイン関数
 * @returns {Promise<void>}
 */
async function processBatch() {
  try {
    info("バッチ処理を開始");

    // 処理対象の地域を取得
    const db = admin.firestore();
    const usersSnapshot = await db.collection(COLLECTIONS.USERS).limit(LIMITS.MAX_BATCH_SIZE).get();

    if (usersSnapshot.empty) {
      info("処理対象のユーザーが存在しません");
      return;
    }

    // 地域コードの重複を除去
    const areaCodes = new Set();
    usersSnapshot.forEach((doc) => {
      const { areaCode } = doc.data();
      if (areaCode) {
        areaCodes.add(areaCode);
      }
    });

    info(`処理対象の地域数: ${areaCodes.size}`);

    // 各地域の天気予報を生成
    for (const areaCode of areaCodes) {
      try {
        // 天気予報データの生成（実際のAPIコール等は省略）
        const weatherData = {
          temperature: 25,
          condition: "sunny",
          // ... その他の天気データ
        };

        await generateWeatherForecast(areaCode, weatherData);
      } catch (err) {
        error("地域の天気予報生成に失敗", { areaCode, error: err });
      }
    }

    // 通知送信
    await sendNotificationsToAllUsers();

    info("バッチ処理を完了");
  } catch (err) {
    error("バッチ処理全体が失敗", { error: err });
    throw err;
  }
}

module.exports = {
  processBatch,
};
