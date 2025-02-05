/**
 * 天気予報スケジューラ
 * 定期的に天気予報を取得し、メッセージを生成します
 */

const { onSchedule } = require("firebase-functions/v2/scheduler");
const { processWeatherData } = require("../domain/weather");
const logger = require("../utils/logger");

/**
 * 毎朝5時に天気予報を取得
 */
exports.fetchDailyWeatherForecast = onSchedule(
  {
    schedule: "0 5 * * *", // 毎朝5時
    timeZone: "Asia/Tokyo",
    retryCount: 3,
    maxRetrySeconds: 60,
    memory: "256MiB",
    region: "asia-northeast1",
  },
  async (event) => {
    try {
      logger.info("天気予報の定期取得を開始します...");

      // 対象地域の天気予報を取得
      const targetAreas = ["130000", "270000", "016000"]; // 東京、大阪、札幌
      const processPromises = targetAreas.map(async (areaCode) => {
        try {
          await processWeatherData(areaCode);
          logger.info(`地域コード ${areaCode} の天気予報取得が完了しました`);
        } catch (error) {
          logger.error(`地域コード ${areaCode} の天気予報取得に失敗しました:`, error);
        }
      });

      await Promise.all(processPromises);
      logger.info("天気予報の定期取得が完了しました");
    } catch (error) {
      logger.error("天気予報の定期取得でエラーが発生しました:", error);
      throw error;
    }
  }
);
