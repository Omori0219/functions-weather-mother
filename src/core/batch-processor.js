require("dotenv").config();
const { processWeatherData } = require("./weather-mother");
const { PREFECTURE_CODES } = require("../config/prefectures");
const logger = require("../utils/logger");

/**
 * 都道府県の天気データを一括処理する
 * @param {Array<Object>} prefectures - 処理対象の都道府県リスト
 */
async function processPrefectures(prefectures) {
  console.log("[INFO] ==== バッチ処理開始 ====");
  const startTime = Date.now();

  let successCount = 0;
  let failureCount = 0;

  // 都道府県を1つずつ処理
  for (const prefecture of prefectures) {
    try {
      console.log(`[INFO] ${prefecture.name}の処理を開始...`);
      await processWeatherData(prefecture.code);
      successCount++;
    } catch (error) {
      console.error(`[ERROR] Error processing ${prefecture.name}:`, error);
      failureCount++;

      // レート制限エラーの場合は一時停止
      if (error?.code === 429) {
        console.log("[INFO] レート制限により10秒間待機します...");
        await new Promise((resolve) => setTimeout(resolve, 10000));
      }
    }
  }

  const endTime = Date.now();
  const processingTime = ((endTime - startTime) / 1000).toFixed(3);

  console.log("[INFO] ==== 処理完了 ====");
  console.log(`[INFO] 成功: ${successCount}件`);
  console.log(`[INFO] 失敗: ${failureCount}件`);
  console.log(`[INFO] 処理時間: ${processingTime}秒`);
}

async function processAllPrefectures() {
  logger.info("全都道府県の処理を開始します...");
  const startTime = new Date();

  try {
    const results = await processPrefectures(PREFECTURE_CODES);

    // 結果の集計
    const successCount = results.filter((r) => !r.error).length;
    const failureCount = results.filter((r) => r.error).length;

    const endTime = new Date();
    const processingTime = (endTime - startTime) / 1000;

    logger.info("==== 処理完了 ====");
    logger.info(`成功: ${successCount}件`);
    logger.info(`失敗: ${failureCount}件`);
    logger.info(`処理時間: ${processingTime}秒`);

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

module.exports = { processAllPrefectures };
