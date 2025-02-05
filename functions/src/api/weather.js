/**
 * 天気予報API
 * テスト用のエンドポイントを提供します
 */

const { onRequest } = require("firebase-functions/v2/https");
const { processWeatherData } = require("../domain/weather");
const { PREFECTURE_CODES } = require("../config/prefectures");
const logger = require("../utils/logger");

/**
 * 天気予報メッセージ生成のテスト用エンドポイント
 */
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

      const results = {
        success: [],
        failed: [],
      };

      // 各都道府県を処理
      for (const prefecture of testPrefectures) {
        try {
          const result = await processWeatherData(prefecture.code);
          results.success.push({
            prefecture: prefecture.name,
            code: prefecture.code,
            message: result.message,
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

      const executionResult = {
        status: "completed",
        timestamp: new Date().toISOString(),
        summary: {
          total: testPrefectures.length,
          success: results.success.length,
          failed: results.failed.length,
        },
        results,
      };

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
