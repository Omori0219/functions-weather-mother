/**
 * 通知関連のCloud Functions
 * @file notification.js
 */

const { onSchedule } = require("firebase-functions/v2/scheduler");
const logger = require("../utils/logger");
const { sendNotification } = require("../services/notification");

// 毎朝7時にプッシュ通知を送信
exports.sendMorningNotifications = onSchedule(
  {
    schedule: "0 7 * * *",
    timeZone: "Asia/Tokyo",
    retryCount: 3,
    maxInstances: 1,
    timeoutSeconds: 540,
    memory: "256MiB",
    region: "asia-northeast1",
  },
  async (event) => {
    logger.info("プッシュ通知送信処理を開始");

    try {
      // TODO: ユーザーのFCMトークンと天気メッセージの取得処理を実装

      const result = await sendNotification({
        token: "dummy-token",
        message: "テスト通知メッセージ",
      });

      const executionResult = {
        status: "completed",
        timestamp: new Date().toISOString(),
        result,
      };

      logger.info("プッシュ通知送信処理が完了", executionResult);
      return executionResult;
    } catch (error) {
      const errorResult = {
        status: "error",
        timestamp: new Date().toISOString(),
        error: error.message,
      };
      logger.error("プッシュ通知送信処理でエラー発生", errorResult);
      throw error;
    }
  }
);
