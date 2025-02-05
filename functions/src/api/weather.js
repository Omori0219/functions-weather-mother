/**
 * 天気予報API
 * 天気予報の取得と更新のエンドポイントを提供します
 */

const { onRequest } = require("firebase-functions/v2/https");
const { processWeatherData, getStoredWeatherData } = require("../domain/weather");
const logger = require("../utils/logger");

/**
 * 天気予報を取得
 */
exports.getWeatherForecast = onRequest(
  {
    timeoutSeconds: 30,
    memory: "256MiB",
    region: "asia-northeast1",
  },
  async (req, res) => {
    try {
      const { areaCode, date } = req.query;

      // パラメータのバリデーション
      if (!areaCode) {
        res.status(400).json({
          status: "error",
          error: "地域コードが必要です",
        });
        return;
      }

      // 日付が指定されていない場合は今日の日付を使用
      const targetDate = date || new Date().toISOString().split("T")[0].replace(/-/g, "");

      logger.info(`天気予報を取得します: ${areaCode}, ${targetDate}`);

      // 天気予報を取得
      const weatherData = await getStoredWeatherData(areaCode, targetDate);

      if (!weatherData) {
        // 天気予報が見つからない場合は新規取得
        logger.info("天気予報が見つからないため、新規取得を試みます");
        await processWeatherData(areaCode);
        const newWeatherData = await getStoredWeatherData(areaCode, targetDate);

        if (!newWeatherData) {
          res.status(404).json({
            status: "error",
            error: "天気予報が見つかりません",
          });
          return;
        }

        res.json({
          status: "success",
          data: newWeatherData,
        });
        return;
      }

      res.json({
        status: "success",
        data: weatherData,
      });
    } catch (error) {
      logger.error("天気予報の取得でエラーが発生しました:", error);
      res.status(500).json({
        status: "error",
        error: "天気予報の取得に失敗しました",
      });
    }
  }
);
