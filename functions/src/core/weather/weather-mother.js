require("dotenv").config();
const { getWeatherForecast } = require("../clients/jma");
const { getGeminiResponse } = require("../clients/gemini");
const { saveWeatherData } = require("../clients/firebase");
const { generateDocumentId } = require("../utils/date");
const { WEATHER_MOTHER } = require("../config/prompts");
const logger = require("../utils/logger");

async function processWeatherData(areaCode) {
  try {
    const startTime = Date.now();
    logger.debug("天気予報データの処理を開始", {
      areaCode,
      timestamp: new Date().toISOString(),
    });

    logger.info("気象庁から天気予報を取得中", {
      areaCode,
    });
    const weatherData = await getWeatherForecast(areaCode);

    logger.debug("Geminiによるメッセージ生成を開始", {
      areaCode,
      weatherDataSize: JSON.stringify(weatherData).length,
    });
    const prompt = `${WEATHER_MOTHER}\n\n天気予報データ: ${JSON.stringify(weatherData, null, 2)}`;
    const motherMessage = await getGeminiResponse(prompt);

    const documentId = generateDocumentId(areaCode);
    const now = new Date();

    logger.debug("Firestoreにデータを保存", {
      documentId,
      areaCode,
      messageLength: motherMessage.length,
      timestamp: now.toISOString(),
    });

    await saveWeatherData({
      documentId,
      areaCode,
      weatherForecasts: JSON.stringify(weatherData),
      generatedMessage: motherMessage,
      createdAt: now,
    });

    const endTime = Date.now();
    const processingTime = endTime - startTime;

    logger.info("天気予報データの処理が完了", {
      areaCode,
      documentId,
      processingTimeMs: processingTime,
      processingTimeSeconds: (processingTime / 1000).toFixed(3),
    });

    return { weatherData, motherMessage };
  } catch (error) {
    logger.error("天気予報データの処理中にエラーが発生", error, {
      areaCode,
      step: error.step || "unknown",
    });
    throw error;
  }
}

if (require.main === module) {
  const defaultAreaCode = "130000"; // デフォルトは東京
  processWeatherData(defaultAreaCode)
    .then((result) => {
      logger.info("天気予報メッセージの生成が完了", {
        areaCode: defaultAreaCode,
        messageLength: result.motherMessage.length,
      });
    })
    .catch((error) => {
      logger.error("メイン処理でエラーが発生", error, {
        areaCode: defaultAreaCode,
      });
      process.exit(1);
    });
}

module.exports = { processWeatherData };
