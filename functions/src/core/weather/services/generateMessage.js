const { getGeminiResponse } = require("../../../clients/gemini");
const { WEATHER_MOTHER } = require("../../../config/prompts");
const logger = require("../../../utils/logger");

async function generateMessage(weatherData) {
  const prompt = `${WEATHER_MOTHER}\n\n天気予報データ: ${JSON.stringify(weatherData, null, 2)}`;
  const message = await getGeminiResponse(prompt);
  return message;
}

module.exports = { generateMessage };
