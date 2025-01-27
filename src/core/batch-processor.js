require("dotenv").config();
const { processWeatherData } = require("./weather-mother");
const { PREFECTURE_CODES } = require("../config/prefectures");
const logger = require("../utils/logger");

// 同時実行数を制限するためのユーティリティ関数
async function processConcurrently(items, concurrency, processor) {
  const chunks = [];
  for (let i = 0; i < items.length; i += concurrency) {
    chunks.push(items.slice(i, i + concurrency));
  }

  const results = [];
  for (const chunk of chunks) {
    const chunkResults = await Promise.all(
      chunk.map(async (item) => {
        try {
          return await processor(item);
        } catch (error) {
          logger.error(`Error processing ${item.name}:`, error);
          return { error, prefecture: item };
        }
      })
    );
    results.push(...chunkResults);
    // APIレート制限を考慮して少し待機
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  return results;
}

async function processAllPrefectures() {
  logger.info("全都道府県の処理を開始します...");
  const startTime = new Date();

  try {
    const results = await processConcurrently(PREFECTURE_CODES, 3, async (prefecture) => {
      logger.info(`${prefecture.name}の処理を開始...`);
      const result = await processWeatherData(prefecture.code);
      logger.info(`${prefecture.name}の処理が完了しました`);
      return { ...result, prefecture };
    });

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
