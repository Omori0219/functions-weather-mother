require("dotenv").config();
const { processWeatherData } = require("./weather-mother");
const { PREFECTURE_CODES } = require("../config/prefectures");
const logger = require("../utils/logger");

/**
 * 都道府県の天気データを一括処理する
 * @param {Array<Object>} prefectures - 処理対象の都道府県リスト
 * @returns {Promise<{ successCount: number, failureCount: number, processingTime: number }>}
 */
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

          await processWeatherData(prefecture.code);

          logger.info("都道府県の処理が完了", {
            prefecture: prefecture.name,
            code: prefecture.code,
            status: "success",
          });

          return { success: true };
        } catch (error) {
          logger.error("都道府県の処理中にエラーが発生", error, {
            prefecture: prefecture.name,
            code: prefecture.code,
          });
          return { success: false, error };
        }
      })
    );

    // バッチの結果を集計
    batchResults.forEach((result) => {
      if (result.value?.success) {
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
    successCount,
    failureCount,
    processingTime: Number(processingTime),
  };
}

async function processAllPrefectures() {
  try {
    const results = await processPrefectures(PREFECTURE_CODES);
    return results;
  } catch (error) {
    logger.error("バッチ処理全体でエラーが発生", error, {
      totalPrefectures: PREFECTURE_CODES.length,
    });
    throw error;
  }
}

if (require.main === module) {
  processAllPrefectures()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      logger.error("バッチ処理のメイン実行でエラーが発生", error);
      process.exit(1);
    });
}

module.exports = { processAllPrefectures, processPrefectures };
