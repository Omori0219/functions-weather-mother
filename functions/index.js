/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const { onSchedule } = require("firebase-functions/v2/scheduler");
const { onRequest } = require("firebase-functions/v2/https");
const { processAllPrefectures } = require("./src/core/batch-processor");
const { processWeatherData } = require("./src/core/weather-mother");
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

// テスト用の関数を追加
exports.generateWeatherMessagesTest = onRequest(async (req, res) => {
  logger.info("テスト用天気予報メッセージ生成処理を開始します...");
  logger.info("==== テストバッチ処理開始 ====");

  // テスト用の都道府県コードリスト
  const testAreaCodes = [
    { code: "016000", name: "北海道" }, // 北日本
    { code: "130000", name: "東京都" }, // 関東
    { code: "270000", name: "大阪府" }, // 関西
    { code: "471000", name: "沖縄県" }, // 南日本
  ];

  try {
    // テスト用の都道府県のみ処理
    for (const area of testAreaCodes) {
      logger.info(`${area.name}の処理を開始...`);
      await processWeatherData(area.code);
      logger.info(`${area.name}の処理が完了しました！`);
    }
    logger.info("==== テストバッチ処理完了 ====");
    res.send("Test completed successfully");
  } catch (error) {
    logger.error("テスト実行中にエラーが発生しました", error);
    res.status(500).send(error);
  }
});
