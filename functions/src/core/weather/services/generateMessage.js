const { generateContent } = require("../../../clients/gemini");
const { WEATHER_MOTHER } = require("../../../config/prompts");
const logger = require("../../../utils/logger");

async function generateMessage(weatherData) {
  try {
    logger.debug("Geminiによるメッセージ生成を開始", {
      weatherDataSize: JSON.stringify(weatherData).length,
    });

    const prompt = `${WEATHER_MOTHER}\n\n天気予報データ: ${JSON.stringify(weatherData, null, 2)}`;
    const message = await generateContent(prompt);

    logger.debug("メッセージ生成が完了", {
      messageLength: message.length,
    });

    return message;
  } catch (error) {
    logger.error("メッセージ生成中にエラーが発生", error);
    error.step = "generate_message";
    throw error;
  }
}

module.exports = { generateMessage };
