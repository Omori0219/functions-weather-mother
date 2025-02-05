/**
 * 通知スケジューラ
 * 定期的に天気予報の通知を送信します
 */

const { onSchedule } = require("firebase-functions/v2/scheduler");
const { sendNotificationsToAllUsers } = require("../domain/notifications");
const logger = require("../utils/logger");

/**
 * 毎朝6時に天気予報の通知を送信
 */
exports.sendDailyWeatherNotifications = onSchedule(
  {
    schedule: "0 6 * * *", // 毎朝6時
    timeZone: "Asia/Tokyo",
    retryCount: 3,
    maxRetrySeconds: 60,
    memory: "256MiB",
    region: "asia-northeast1",
  },
  async (event) => {
    try {
      logger.info("定期通知処理を開始します...");
      await sendNotificationsToAllUsers();
      logger.info("定期通知処理が完了しました");
    } catch (error) {
      logger.error("定期通知処理でエラーが発生しました:", error);
      throw error;
    }
  }
);
