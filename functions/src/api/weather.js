/**
 * 天気予報API
 * 天気予報の取得と更新のエンドポイントを提供します
 */

const { onRequest } = require("firebase-functions/v2/https");
const { processWeatherData, getStoredWeatherData } = require("../domain/weather");
const { isValidDate } = require("../utils/date");
const { API_TIMEOUT_SECONDS, API_MEMORY, REGION } = require("../config/env");
const logger = require("../utils/logger");

/**
 * 天気予報を取得
 */
exports.getWeatherForecast = onRequest(
  {
    timeoutSeconds: API_TIMEOUT_SECONDS.value(),
    memory: API_MEMORY.value(),
    region: REGION.value(),
  },
  async (req, res) => {
    try {
      const { areaCode, date } = req.query;

      // パラメータのバリデーション
      if (!areaCode) {
        logger.error("地域コードが指定されていません");
        res.status(400).json({
          status: "error",
          error: "地域コードが必要です",
        });
        return;
      }

      // 日付のバリデーション
      if (date && !isValidDate(date)) {
        logger.error("無効な日付形式です", { date });
        res.status(400).json({
          status: "error",
          error: "無効な日付形式です",
        });
        return;
      }

      logger.info(`天気予報を取得します: ${areaCode}, ${date || "今日"}`);

      // 天気予報を取得
      const weatherData = await getStoredWeatherData(areaCode, date);

      if (!weatherData) {
        // 天気予報が見つからない場合は新規取得
        logger.info("天気予報が見つからないため、新規取得を試みます");
        const { weatherData: newWeatherData, message } = await processWeatherData(areaCode);

        res.json({
          status: "success",
          data: {
            weatherData: newWeatherData,
            message,
          },
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

/**
 * 天気予報を更新
 */
exports.updateWeatherForecast = onRequest(
  {
    timeoutSeconds: API_TIMEOUT_SECONDS.value(),
    memory: API_MEMORY.value(),
    region: REGION.value(),
  },
  async (req, res) => {
    try {
      const { areaCode } = req.body;

      // パラメータのバリデーション
      if (!areaCode) {
        logger.error("地域コードが指定されていません");
        res.status(400).json({
          status: "error",
          error: "地域コードが必要です",
        });
        return;
      }

      logger.info(`天気予報を更新します: ${areaCode}`);

      // 天気予報を取得・更新
      const { weatherData, message } = await processWeatherData(areaCode);

      res.json({
        status: "success",
        data: {
          weatherData,
          message,
        },
      });
    } catch (error) {
      logger.error("天気予報の更新でエラーが発生しました:", error);
      res.status(500).json({
        status: "error",
        error: "天気予報の更新に失敗しました",
      });
    }
  }
);
