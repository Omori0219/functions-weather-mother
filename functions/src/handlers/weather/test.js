const { onRequest } = require("firebase-functions/v2/https");
const { processPrefectures } = require("../../core/batch-processor");
const { PREFECTURE_CODES } = require("../../config/prefectures");
const logger = require("../../utils/logger");

// テスト用の関数
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
