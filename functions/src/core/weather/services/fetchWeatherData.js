const { fetchWeatherForecast } = require("../../../clients/jma");
const logger = require("../../../utils/logger");

async function fetchWeatherData(areaCode) {
  try {
    logger.debug("天気予報データの取得を開始", {
      areaCode,
    });

    const weatherData = await fetchWeatherForecast(areaCode);

    // 天気予報データの検証
    if (!weatherData || !Array.isArray(weatherData) || weatherData.length === 0) {
      throw new Error("不正な天気予報データ形式");
    }

    logger.info("天気予報データの取得が完了", {
      areaCode,
      dataSize: JSON.stringify(weatherData).length,
    });

    return weatherData;
  } catch (error) {
    logger.error("天気予報データの取得中にエラーが発生", error, {
      areaCode,
      step: "fetch_weather",
    });
    throw error;
  }
}

module.exports = { fetchWeatherData };
