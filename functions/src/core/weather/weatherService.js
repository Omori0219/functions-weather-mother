const { fetchWeatherData } = require("./services/fetchWeatherData");
const { generateMessage } = require("./services/generateMessage");
const { storeMessage } = require("./services/storeMessage");
const logger = require("../../utils/logger");

async function processWeatherForArea(areaCode) {
  try {
    const weatherData = await fetchWeatherData(areaCode);
    const message = await generateMessage(weatherData);
    await storeMessage(areaCode, message, weatherData);
    return { weatherData, message };
  } catch (error) {
    logger.error("天気予報データの処理中にエラーが発生", error, {
      areaCode,
      step: error.step || "unknown",
    });
    throw error;
  }
}

module.exports = { processWeatherForArea };
