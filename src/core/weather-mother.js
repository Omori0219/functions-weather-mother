require("dotenv").config();
const { getWeatherForecast } = require("../clients/weather");
const { getGeminiResponse } = require("../clients/gemini");
const { saveWeatherData } = require("../clients/firebase");
const { generateDocumentId } = require("../utils/date");
const { AREA_CODE } = require("../config/constants");
const { WEATHER_MOTHER } = require("../config/prompts");
const logger = require("../utils/logger");

async function processWeatherData() {
  try {
    logger.info("天気予報を取得中...");
    const weatherData = await getWeatherForecast(AREA_CODE);

    logger.info("メッセージを生成中...");
    const prompt = `${WEATHER_MOTHER}\n\n天気予報データ: ${JSON.stringify(weatherData, null, 2)}`;
    const generatedMessage = await getGeminiResponse(prompt);

    logger.info("データを保存中...");
    const documentId = generateDocumentId(AREA_CODE);
    await saveWeatherData({
      documentId,
      areaCode: AREA_CODE,
      weatherForecasts: JSON.stringify(weatherData),
      generatedMessage,
      createdat: new Date(),
    });

    logger.info("処理が完了しました！");
    return { weatherData, generatedMessage };
  } catch (error) {
    logger.error("処理中にエラーが発生しました", error);
    throw error;
  }
}

if (require.main === module) {
  processWeatherData()
    .then((result) => {
      logger.info(`生成されたメッセージ: ${result.generatedMessage}`);
    })
    .catch((error) => {
      logger.error("実行エラー", error);
      process.exit(1);
    });
}

module.exports = { processWeatherData };
