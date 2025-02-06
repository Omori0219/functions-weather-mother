const { fetchWeatherForecast } = require("../../../clients/jma");
const logger = require("../../../utils/logger");

async function fetchWeatherData(areaCode) {
  try {
    const weatherData = await fetchWeatherForecast(areaCode);
    return weatherData;
  } catch (error) {
    logger.error("天気予報データの取得中にエラーが発生", error, {
      areaCode,
    });
    error.step = "fetch_weather";
    throw error;
  }
}

module.exports = { fetchWeatherData };
