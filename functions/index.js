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
const { processAllPrefectures, processPrefectures } = require("./src/core/batch-processor");
const { processWeatherData } = require("./src/core/weather-mother");
const { PREFECTURE_CODES } = require("./src/config/prefectures");
const logger = require("./src/utils/logger");
const db = require("./src/utils/firestore");
const { COLLECTION_NAME } = require("./src/config/firestore");

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

      logger.info("実行結果", executionResult);
      return executionResult;
    } catch (error) {
      const errorResult = {
        status: "error",
        timestamp: new Date().toISOString(),
        error: error.message,
      };
      logger.error("バッチ処理全体でエラーが発生しました", errorResult);
      throw new Error(JSON.stringify(errorResult));
    }
  }
);

// テスト用の関数を追加
exports.generateWeatherMessagesTest = onRequest(
  {
    timeoutSeconds: 540, // タイムアウト: 9分
    memory: "256MiB",
    region: "asia-northeast1",
  },
  async (req, res) => {
    logger.info("テスト用の天気予報メッセージ生成処理を開始します...");
    logger.info("==== テストバッチ処理開始 ====");

    try {
      // テスト用の都道府県（北海道、東京、大阪、沖縄）
      const testPrefectures = PREFECTURE_CODES.filter((p) =>
        ["016000", "130000", "270000", "471000"].includes(p.code)
      );

      const results = await processPrefectures(testPrefectures);

      const executionResult = {
        status: "completed",
        timestamp: new Date().toISOString(),
        summary: {
          total: testPrefectures.length,
          success: results.successCount,
          failed: results.failureCount,
        },
        results: results,
      };

      // 実行結果をログに出力
      logger.info("実行結果", executionResult);

      res.json(executionResult);
    } catch (error) {
      const errorResult = {
        status: "error",
        timestamp: new Date().toISOString(),
        error: error.message,
      };
      logger.error("テスト実行中にエラーが発生しました", errorResult);
      res.status(500).json(errorResult);
    }
  }
);

// データ移行用の関数
exports.migrateFieldNames = onRequest(
  {
    region: "asia-northeast1",
    minInstances: 0,
    maxInstances: 1,
    timeoutSeconds: 540, // 9分
    memory: "256MiB",
  },
  async (req, res) => {
    // Basic認証チェック
    const authHeader = req.headers.authorization || "";
    const expectedAuth = `Basic ${Buffer.from(`admin:${process.env.MIGRATION_SECRET}`).toString(
      "base64"
    )}`;

    if (authHeader !== expectedAuth) {
      res.status(401).send("Unauthorized");
      return;
    }

    try {
      logger.info("==== フィールド名移行処理開始 ====");
      const startTime = Date.now();

      const snapshot = await db.collection(COLLECTION_NAME).get();
      let migratedCount = 0;
      let skippedCount = 0;
      let errorCount = 0;

      for (const doc of snapshot.docs) {
        try {
          const data = doc.data();
          // 古い命名規則のフィールドが存在するかチェック
          if (
            data.area_code ||
            data.weather_forecasts ||
            data.generated_message ||
            data.createdat
          ) {
            await doc.ref.set({
              areaCode: data.area_code || data.areaCode,
              weatherForecasts: data.weather_forecasts || data.weatherForecasts,
              generatedMessage: data.generated_message || data.generatedMessage,
              createdAt: data.createdat || data.createdAt,
            });
            migratedCount++;
            logger.info(`ドキュメント ${doc.id} を移行しました`);
          } else {
            skippedCount++;
          }
        } catch (error) {
          errorCount++;
          logger.error(`ドキュメント ${doc.id} の移行中にエラーが発生:`, error);
        }
      }

      const endTime = Date.now();
      const processingTime = ((endTime - startTime) / 1000).toFixed(3);

      const result = {
        status: "completed",
        processingTime: `${processingTime}秒`,
        summary: {
          total: snapshot.size,
          migrated: migratedCount,
          skipped: skippedCount,
          error: errorCount,
        },
      };

      logger.info("==== 移行処理完了 ====", result);
      res.json(result);
    } catch (error) {
      logger.error("移行処理でエラーが発生:", error);
      res.status(500).json({
        status: "error",
        error: error.message,
      });
    }
  }
);
