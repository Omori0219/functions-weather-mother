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
  logger.info("==== バッチ処理開始 ====");
  const startTime = Date.now();

  let successCount = 0;
  let failureCount = 0;

  // 都道府県をバッチに分割して処理
  const BATCH_SIZE = 5; // 一度に処理する都道府県の数
  const BATCH_INTERVAL = 30000; // バッチ間の待機時間（30秒）

  for (let i = 0; i < prefectures.length; i += BATCH_SIZE) {
    const batch = prefectures.slice(i, i + BATCH_SIZE);
    logger.info(`バッチ処理開始 (${i + 1}～${Math.min(i + BATCH_SIZE, prefectures.length)}件目)`);

    // バッチ内の都道府県を並行処理
    const batchResults = await Promise.allSettled(
      batch.map(async (prefecture) => {
        try {
          logger.info(`${prefecture.name}の処理を開始...`);
          await processWeatherData(prefecture.code);
          logger.info(`${prefecture.name}の処理が完了しました！`);
          return { success: true };
        } catch (error) {
          logger.error(`${prefecture.name}の処理中にエラーが発生しました:`, error);
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
      logger.info(`次のバッチの前に${BATCH_INTERVAL / 1000}秒待機します...`);
      await new Promise((resolve) => setTimeout(resolve, BATCH_INTERVAL));
    }
  }

  const endTime = Date.now();
  const processingTime = ((endTime - startTime) / 1000).toFixed(3);

  logger.info("==== バッチ処理完了 ====");
  logger.info(`成功: ${successCount}件`);
  logger.info(`失敗: ${failureCount}件`);
  logger.info(`処理時間: ${processingTime}秒`);

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
    logger.error("バッチ処理でエラーが発生しました:", error);
    throw error;
  }
}

if (require.main === module) {
  processAllPrefectures()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      logger.error("実行エラー:", error);
      process.exit(1);
    });
}

module.exports = { processAllPrefectures, processPrefectures };
