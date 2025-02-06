const logger = require("../utils/logger");

async function fetchWeatherForecast(areaId) {
  const formattedAreaId = areaId.padStart(6, "0");
  const url = `https://www.jma.go.jp/bosai/forecast/data/forecast/${formattedAreaId}.json`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    throw new Error(`気象庁APIからのデータ取得に失敗: ${error.message}`);
  }
}

module.exports = { fetchWeatherForecast };
