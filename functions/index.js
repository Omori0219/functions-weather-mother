/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// 環境変数の設定
if (process.env.FUNCTIONS_EMULATOR) {
  require("dotenv").config({ path: ".env.local" });
} else {
  require("dotenv").config();
}

const { onSchedule } = require("firebase-functions/v2/scheduler");
const { processAllPrefectures } = require("./src/core/batch-processor");
const logger = require("./src/utils/logger");

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// 毎朝6時に実行
exports.generateWeatherMessages = onSchedule(
  {
    schedule: "0 6 * * *", // 毎日午前6時
    timeZone: "Asia/Tokyo",
    retryCount: 3, // 失敗時の再試行回数
    maxInstances: 1, // 同時実行インスタンス数
    timeoutSeconds: 540, // タイムアウト: 9分
    memory: "256MiB",
  },
  async (event) => {
    try {
      logger.info("天気予報メッセージ生成処理を開始します...");
      const results = await processAllPrefectures();
      logger.info("処理が完了しました", results);
      return results;
    } catch (error) {
      logger.error("処理中にエラーが発生しました:", error);
      throw error;
    }
  }
);
