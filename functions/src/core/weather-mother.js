require("dotenv").config();
const { getWeatherForecast } = require("../clients/weather");
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
    await saveWeatherData({
      documentId,
      areaCode,
      weatherForecasts: JSON.stringify(weatherData),
      generatedMessage: motherMessage,
      createdat: new Date(),
    });

    logger.info("処理が完了しました！");
    return { weatherData, motherMessage };
  } catch (error) {
    logger.error(`処理中にエラーが発生しました (地域コード: ${areaCode}):`, error);
    throw error;
  }
}

module.exports = { processWeatherData };
