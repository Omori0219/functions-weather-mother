const { onSchedule } = require("firebase-functions/v2/scheduler");
const logger = require("./src/utils/logger");

/**
 * 天気予報バッチ処理
 * 毎朝6時に実行
 */
exports.weatherMotherBatch = onSchedule("every day 06:00", async (event) => {
  const batchId = event.id;

  try {
    logger.info(`バッチ処理を開始します`, {
      batchId,
      eventTime: event.time,
    });

    // TODO: 実際の処理を実装

    logger.info("バッチ処理が完了しました", {
      batchId,
      success: true,
    });
  } catch (error) {
    logger.error("バッチ処理でエラーが発生しました", {
      batchId,
      error,
    });
  }
});
