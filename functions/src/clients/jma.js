const logger = require("../utils/logger");

const WeatherAPIError = class extends Error {
  constructor(type, message, originalError = null) {
    super(message);
    this.name = "WeatherAPIError";
    this.type = type;
  }
};

async function fetchWeatherForecast(areaId) {
  try {
    const formattedAreaId = areaId.padStart(6, "0");
    const url = `https://www.jma.go.jp/bosai/forecast/data/forecast/${formattedAreaId}.json`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new WeatherAPIError("network", `気象庁APIからのデータ取得に失敗: ${response.status}`);
    }

    let weather;
    try {
      weather = await response.json();
    } catch (error) {
      throw new WeatherAPIError("parse", "気象庁APIのレスポンスの解析に失敗", error);
    }

    return weather;
  } catch (error) {
    if (error instanceof WeatherAPIError) {
      throw error;
    }
    throw new WeatherAPIError("unknown", "気象庁APIでエラーが発生", error);
  }
}

module.exports = { fetchWeatherForecast };
