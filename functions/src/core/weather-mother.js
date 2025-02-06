require("dotenv").config();
const { getWeatherForecast } = require("../clients/jma");
const { getGeminiResponse } = require("../clients/gemini");
const { saveWeatherData } = require("../clients/firebase");
const { generateDocumentId } = require("../utils/date");
const { WEATHER_MOTHER } = require("../config/prompts");
const logger = require("../utils/logger");

async function processWeatherData(areaCode) {
  try {
    logger.info(`天気予報を取得中... (地域コード: ${areaCode})`);
    const weatherData = await getWeatherForecast(areaCode);

    logger.info("メッセージを生成中...");
    const prompt = `${WEATHER_MOTHER}\n\n天気予報データ: ${JSON.stringify(weatherData, null, 2)}`;
    const motherMessage = await getGeminiResponse(prompt);

    logger.info("データを保存中...");
    const documentId = generateDocumentId(areaCode);

    // createdAtを確実にDateオブジェクトとして生成
    const now = new Date();
    logger.info("Creating document with timestamp:", now);

    await saveWeatherData({
      documentId,
      areaCode,
      weatherForecasts: JSON.stringify(weatherData),
      generatedMessage: motherMessage,
      createdAt: now,
    });

    logger.info("処理が完了しました！");
    return { weatherData, motherMessage };
  } catch (error) {
    logger.error(`処理中にエラーが発生しました (地域コード: ${areaCode}):`, error);
    throw error;
  }
}

if (require.main === module) {
  const defaultAreaCode = "130000"; // デフォルトは東京
  processWeatherData(defaultAreaCode)
    .then((result) => {
      logger.info(`生成されたメッセージ: ${result.motherMessage}`);
    })
    .catch((error) => {
      logger.error("実行エラー:", error);
      process.exit(1);
    });
}

module.exports = { processWeatherData };
