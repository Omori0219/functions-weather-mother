const logger = require("./src/utils/logger");

/**
 * 天気予報バッチ処理のエントリーポイント
 * Pub/Subトリガーで実行される
 * @param {Object} event - Pub/Subイベント
 * @param {Object} context - 実行コンテキスト
 */
exports.weatherMotherBatch = async (event, context) => {
  const batchId = context.eventId;

  try {
    logger.info(`バッチ処理を開始します`, {
      batchId,
      eventTime: context.timestamp,
    });

    // TODO: 実際の処理を実装

    logger.info("バッチ処理が完了しました", {
      batchId,
      success: true,
    });

    return;
  } catch (error) {
    logger.error("バッチ処理でエラーが発生しました", {
      batchId,
      error,
    });

    // エラーをスローせず、正常終了させる（メッセージの再配信を防ぐ）
    return;
  }
};
