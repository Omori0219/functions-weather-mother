const { onSchedule } = require("firebase-functions/v2/scheduler");
const { PREFECTURE_CODES } = require("../../config/prefectures");
const logger = require("../../utils/logger");
const { processWeatherForArea } = require("../../core/weather/weatherService");

// バッチ処理の実装
async function processPrefectures(prefectures) {
  logger.info("バッチ処理を開始", {
    totalPrefectures: prefectures.length,
    batchSize: 5,
    batchInterval: "30秒",
  });

  const startTime = Date.now();
  let successCount = 0;
  let failureCount = 0;

  // 都道府県をバッチに分割して処理
  const BATCH_SIZE = 5; // 一度に処理する都道府県の数
  const BATCH_INTERVAL = 30000; // バッチ間の待機時間（30秒）

  const results = {
    success: [],
    failed: [],
  };

  for (let i = 0; i < prefectures.length; i += BATCH_SIZE) {
    const batch = prefectures.slice(i, i + BATCH_SIZE);
    const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(prefectures.length / BATCH_SIZE);

    logger.debug("バッチ処理を開始", {
      batchNumber,
      totalBatches,
      startIndex: i + 1,
      endIndex: Math.min(i + BATCH_SIZE, prefectures.length),
      prefecturesInBatch: batch.map((p) => p.name),
    });

    // バッチ内の都道府県を並行処理
    const batchResults = await Promise.allSettled(
      batch.map(async (prefecture) => {
        try {
          logger.debug("都道府県の処理を開始", {
            prefecture: prefecture.name,
            code: prefecture.code,
          });

          const result = await processWeatherForArea(prefecture.code);
          results.success.push({
            prefecture: prefecture.name,
            code: prefecture.code,
            message: result.message,
          });
          logger.info(`${prefecture.name}の処理が完了しました！`);
          return { success: true };
        } catch (error) {
          results.failed.push({
            prefecture: prefecture.name,
            code: prefecture.code,
            error: error.message,
          });
          logger.error(`${prefecture.name}の処理中にエラーが発生しました:`, error);
          return { success: false, error };
        }
      })
    );

    // バッチの結果を集計
    batchResults.forEach((result) => {
      if (result.status === "fulfilled" && result.value.success) {
        successCount++;
      } else {
        failureCount++;
      }
    });

    // 次のバッチの前に待機（最後のバッチ以外）
    if (i + BATCH_SIZE < prefectures.length) {
      logger.debug("次のバッチ処理までの待機", {
        waitTimeSeconds: BATCH_INTERVAL / 1000,
        nextBatchNumber: batchNumber + 1,
      });
      await new Promise((resolve) => setTimeout(resolve, BATCH_INTERVAL));
    }
  }

  const endTime = Date.now();
  const processingTime = ((endTime - startTime) / 1000).toFixed(3);

  logger.info("バッチ処理が完了", {
    successCount,
    failureCount,
    processingTimeSeconds: Number(processingTime),
    startTime: new Date(startTime).toISOString(),
    endTime: new Date(endTime).toISOString(),
  });

  return {
    status: "completed",
    timestamp: new Date().toISOString(),
    summary: {
      total: prefectures.length,
      success: results.success.length,
      failed: results.failed.length,
    },
    results: results,
    processingTime: Number(processingTime),
  };
}

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
      const result = await processPrefectures(PREFECTURE_CODES);
      logger.info("実行結果", result);
      return result;
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

// テスト用にエクスポート
exports.processPrefectures = processPrefectures;
