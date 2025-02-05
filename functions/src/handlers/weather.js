/**
 * 天気予報関連のCloud Functions
 * @file weather.js
 */

const { onSchedule } = require("firebase-functions/v2/scheduler");
const { onRequest } = require("firebase-functions/v2/https");
const { PREFECTURE_CODES } = require("../config/prefectures");
const logger = require("../utils/logger");
const { fetchWeatherData, analyzeWeather, saveWeatherMessage } = require("../services/weather");

/**
 * 天気予報メッセージ生成の共通処理
 * @returns {Promise<Object>} 実行結果
 */
const generateWeatherMessagesProcess = async () => {
  logger.info("天気予報メッセージ生成処理を開始");

  try {
    const results = {
      success: [],
      failed: [],
    };

    // 全都道府県を処理
    for (const prefecture of PREFECTURE_CODES) {
      logger.info(`${prefecture.name}の処理を開始`);

      try {
        // 天気データ取得
        const weatherData = await fetchWeatherData(prefecture.code);

        // 天気解析とメッセージ生成
        const message = await analyzeWeather(weatherData);

        // メッセージ保存
        const documentId = await saveWeatherMessage({
          areaCode: prefecture.code,
          weatherData,
          message,
        });

        results.success.push({
          prefecture: prefecture.name,
          code: prefecture.code,
          documentId,
          message,
        });

        logger.info(`${prefecture.name}の処理が完了`);
      } catch (error) {
        results.failed.push({
          prefecture: prefecture.name,
          code: prefecture.code,
          error: error.message,
        });
        logger.error(`${prefecture.name}の処理中にエラー発生`, error);
      }
    }

    const executionResult = {
      status: "completed",
      timestamp: new Date().toISOString(),
      summary: {
        total: PREFECTURE_CODES.length,
        success: results.success.length,
        failed: results.failed.length,
      },
      results,
    };

    logger.info("天気予報メッセージ生成処理が完了", executionResult);
    return executionResult;
  } catch (error) {
    const errorResult = {
      status: "error",
      timestamp: new Date().toISOString(),
      error: error.message,
    };
    logger.error("天気予報メッセージ生成処理でエラー発生", errorResult);
    throw error;
  }
};

// 毎朝6時に実行
exports.generateWeatherMessages = onSchedule(
  {
    schedule: "0 6 * * *",
    timeZone: "Asia/Tokyo",
    retryCount: 3,
    maxInstances: 1,
    timeoutSeconds: 540,
    memory: "256MiB",
    region: "asia-northeast1",
  },
  async (event) => {
    return await generateWeatherMessagesProcess();
  }
);

// 手動実行用エンドポイント
exports.generateWeatherMessagesManual = onRequest(
  {
    timeoutSeconds: 540,
    memory: "256MiB",
    region: "asia-northeast1",
  },
  async (req, res) => {
    // Basic認証
    const authHeader = req.headers.authorization || "";
    const expectedAuth = `Basic ${Buffer.from(`admin:${process.env.MANUAL_EXEC_SECRET}`).toString(
      "base64"
    )}`;

    if (authHeader !== expectedAuth) {
      res.status(401).send("Unauthorized");
      return;
    }

    try {
      const result = await generateWeatherMessagesProcess();
      res.json(result);
    } catch (error) {
      res.status(500).json({
        status: "error",
        error: error.message,
      });
    }
  }
);
