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
const { PREFECTURE_CODES } = require("./src/config/prefectures");
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
    region: "asia-northeast1", // 東京リージョン
  },
  async (event) => {
    logger.info("天気予報メッセージ生成処理を開始します...");
    logger.info("==== バッチ処理開始 ====");

    try {
      const results = {
        success: [],
        failed: [],
      };

      // 全都道府県を処理
      for (const prefecture of PREFECTURE_CODES) {
        logger.info(`${prefecture.name}の処理を開始...`);
        try {
          const result = await processWeatherData(prefecture.code);
          results.success.push({
            prefecture: prefecture.name,
            code: prefecture.code,
            message: result.motherMessage,
          });
          logger.info(`${prefecture.name}の処理が完了しました！`);
        } catch (error) {
          results.failed.push({
            prefecture: prefecture.name,
            code: prefecture.code,
            error: error.message,
          });
          logger.error(`${prefecture.name}の処理中にエラーが発生しました:`, error);
        }
      }

      logger.info("==== バッチ処理完了 ====");

      const executionResult = {
        status: "completed",
        timestamp: new Date().toISOString(),
        summary: {
          total: PREFECTURE_CODES.length,
          success: results.success.length,
          failed: results.failed.length,
        },
        results: results,
      };

      logger.info("実行結果:", executionResult);
      return executionResult;
    } catch (error) {
      const errorResult = {
        status: "error",
        timestamp: new Date().toISOString(),
        error: error.message,
      };
      logger.error("バッチ処理全体でエラーが発生しました:", errorResult);
      throw new Error(JSON.stringify(errorResult));
    }
  }
);

// テスト用の関数を追加
exports.generateWeatherMessagesTest = onRequest(
  {
    region: "asia-northeast1", // 東京リージョン
  },
  async (req, res) => {
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
      const results = {
        success: [],
        failed: [],
      };

      // テスト用の都道府県のみ処理
      for (const area of testAreaCodes) {
        logger.info(`${area.name}の処理を開始...`);
        try {
          const result = await processWeatherData(area.code);
          results.success.push({
            prefecture: area.name,
            code: area.code,
            message: result.motherMessage,
          });
          logger.info(`${area.name}の処理が完了しました！`);
        } catch (error) {
          results.failed.push({
            prefecture: area.name,
            code: area.code,
            error: error.message,
          });
          logger.error(`${area.name}の処理中にエラーが発生しました:`, error);
        }
      }

      logger.info("==== テストバッチ処理完了 ====");

      res.json({
        status: "completed",
        timestamp: new Date().toISOString(),
        summary: {
          total: testAreaCodes.length,
          success: results.success.length,
          failed: results.failed.length,
        },
        results: results,
      });
    } catch (error) {
      logger.error("テスト実行中にエラーが発生しました", error);
      res.status(500).json({
        status: "error",
        timestamp: new Date().toISOString(),
        error: error.message,
      });
    }
  }
);
