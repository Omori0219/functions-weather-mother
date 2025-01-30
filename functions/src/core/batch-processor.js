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

  // 都道府県を1つずつ処理
  for (const prefecture of prefectures) {
    try {
      logger.info(`${prefecture.name}の処理を開始...`);
      await processWeatherData(prefecture.code);
      successCount++;
      logger.info(`${prefecture.name}の処理が完了しました！`);
    } catch (error) {
      logger.error(`${prefecture.name}の処理中にエラーが発生しました:`, error);
      failureCount++;

      // レート制限エラーの場合は一時停止
      if (error?.code === 429) {
        logger.info("レート制限により10秒間待機します...");
        await new Promise((resolve) => setTimeout(resolve, 10000));
      }
    }
  }

  const endTime = Date.now();
  const processingTime = ((endTime - startTime) / 1000).toFixed(3);

  logger.info("==== 処理完了 ====");
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

module.exports = { processAllPrefectures };
