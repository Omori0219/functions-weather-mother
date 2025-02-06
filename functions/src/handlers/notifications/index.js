const { onSchedule } = require("firebase-functions/v2/scheduler");
const { sendNotificationsToAllUsers } = require("../../core/notifications/sendNotifications");
const logger = require("../../utils/logger");

// 毎朝7時にプッシュ通知を送信
exports.sendMorningNotifications = onSchedule(
  {
    schedule: "0 7 * * *", // 毎日午前7時
    timeZone: "Asia/Tokyo",
    retryCount: 3, // 失敗時の再試行回数
    maxInstances: 1, // 同時実行インスタンス数
    timeoutSeconds: 540, // タイムアウト: 9分
    memory: "256MiB",
    region: "asia-northeast1", // 東京リージョン
  },
  async (event) => {
    logger.info("プッシュ通知送信処理を開始します...");
    logger.info("==== プッシュ通知送信開始 ====");

    try {
      await sendNotificationsToAllUsers();

      const executionResult = {
        status: "completed",
        timestamp: new Date().toISOString(),
      };

      logger.info("プッシュ通知送信が完了しました", executionResult);
      return executionResult;
    } catch (error) {
      const errorResult = {
        status: "error",
        timestamp: new Date().toISOString(),
        error: error.message,
      };
      logger.error("プッシュ通知送信中にエラーが発生しました", errorResult);
      throw new Error(JSON.stringify(errorResult));
    }
  }
);
